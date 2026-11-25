import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  checkRateLimit,
  createStoreSessionToken,
  getStoreSessionCookieName,
  recordFailedAttempt,
  resetFailedAttempts,
  SESSION_DURATION_SECONDS,
  timingSafeCompare,
} from "@/lib/auth";
import {
  parseStaffMembers,
  resolveEffectiveBranches,
} from "@/lib/branches";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const rateKey = `store:${slug}:${getClientIp(req)}`;
    const rateCheck = checkRateLimit(rateKey);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار ${Math.ceil(rateCheck.retryAfterSeconds / 60)} دقيقة.`,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { pin?: unknown };
    const cleanPin = typeof body.pin === "string" ? body.pin.trim() : "";

    if (!/^\d{4,6}$/.test(cleanPin)) {
      return NextResponse.json(
        { error: "يجب أن يتكون الرمز السري من 4 إلى 6 أرقام." },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        city: true,
        phone: true,
        pinCode: true,
        plan: true,
        maxBranches: true,
        branches: true,
        staffMembers: true,
        latitude: true,
        longitude: true,
        googleMapsUrl: true,
        radarMessage: true,
        isActive: true,
      },
    });

    if (!merchant || !merchant.isActive) {
      return NextResponse.json(
        { error: "المتجر غير متاح" },
        { status: 404 }
      );
    }

    const effectiveBranches = resolveEffectiveBranches(merchant);
    const expectedOwnerPin = (merchant.pinCode || "").trim();

    let sessionRole: "OWNER" | "BRANCH_STAFF" | "STAFF" | null = null;
    let matchedBranchId: string | undefined;
    let matchedBranchName: string | undefined;
    let matchedStaffName: string | undefined;

    // 1. Verify against Owner Master PIN (Strictly no hardcoded fallback)
    if (expectedOwnerPin && timingSafeCompare(cleanPin, expectedOwnerPin)) {
      sessionRole = "OWNER";
    } else {
      // 2. Verify against Branch Dedicated PINs
      const matchedBranch = effectiveBranches.find(
        (b) => b.pinCode && timingSafeCompare(cleanPin, String(b.pinCode).trim())
      );
      if (matchedBranch) {
        sessionRole = "BRANCH_STAFF";
        matchedBranchId = matchedBranch.id;
        matchedBranchName = matchedBranch.name;
      } else {
        // 3. Verify against legacy staffMembers[].pin
        const staffList = parseStaffMembers(merchant.staffMembers);
        const matchedStaff = staffList.find(
          (s) => s.pin && timingSafeCompare(cleanPin, String(s.pin).trim())
        );
        if (matchedStaff) {
          sessionRole = "STAFF";
          matchedStaffName = matchedStaff.name;
        }
      }
    }

    if (!sessionRole) {
      recordFailedAttempt(rateKey);
      return NextResponse.json(
        { error: "الكود السري غير صحيح، عاود المحاولة." },
        { status: 401 }
      );
    }

    resetFailedAttempts(rateKey);

    const token = await createStoreSessionToken({
      slug: merchant.slug,
      role: sessionRole,
      branchId: matchedBranchId,
      branchName: matchedBranchName,
      staffName: matchedStaffName,
    });

    const cookieName = getStoreSessionCookieName(merchant.slug);
    const matchedBranchObj =
      sessionRole === "BRANCH_STAFF"
        ? effectiveBranches.find((b) => b.id === matchedBranchId) || null
        : null;

    const response = NextResponse.json({
      ok: true,
      role: sessionRole,
      branch: matchedBranchObj,
      staffName: matchedStaffName || null,
      branches:
        sessionRole === "OWNER"
          ? effectiveBranches
          : matchedBranchObj
          ? [matchedBranchObj]
          : [],
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error: unknown) {
    console.error("Error authenticating merchant store:", error);
    return NextResponse.json(
      { error: "تعذر التحقق من الرمز السري" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getStoreSessionCookieName(slug), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

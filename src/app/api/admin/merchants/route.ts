import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { invalidateStandCache } from "@/lib/cache";
import { hasRadarAndReviewsFeature, normalizeMerchantPlan } from "@/lib/pricing";
import { isValidCoordinatePair } from "@/lib/radar";

class StandClaimError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function requireSuperAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminToken(token);
  return Boolean(session);
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireSuperAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            customers: true,
            transactions: true,
            campaigns: true,
          },
        },
      },
    });

    return NextResponse.json(merchants);
  } catch (error: unknown) {
    console.error("Error fetching merchants:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "تعذر جلب قائمة المحلات",
        details: msg,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireSuperAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      name,
      slug: customSlug,
      niche = "cafe",
      city = "الدار البيضاء",
      phone,
      pinCode = "1234",
      logoIcon = "coffee",
      primaryColor = "#5b3519",
      bgGradient = "linear-gradient(150deg,#6b4226 0%,#3d2414 100%)",
      stampsRequired = 5,
      rewardName = "قهوة مجانية",
      customerPrefix = "عزيزي",
      loyaltyMode = "BOTH",
      cashbackRate = 10,
      welcomeCashback = 5,
      minCashbackRedeem = 0,
      currency = "DH",
      latitude = null,
      longitude = null,
      radarMessage = "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك ومكافآتك جاهزة.",
      googleMapsUrl,
      plan = "GROWTH",
      maxBranches = 1,
      credits = 1000,
      autoWinback = true,
      autoReview = true,
      autoRadar = true,
      autoNearReward = false,
      allowMultiStamps = false,
      isActive = true,
      standId = null,
      standBranchName = null,
    } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "اسم المحل مطلوب" },
        { status: 400 }
      );
    }

    const cleanStandId =
      typeof standId === "string" && standId.trim() ? standId.trim() : null;
    const cleanStandBranchName =
      cleanStandId && typeof standBranchName === "string" && standBranchName.trim()
        ? standBranchName.trim().slice(0, 80)
        : null;

    // Generate safe slug
    let generatedSlug = (customSlug || name)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!generatedSlug || generatedSlug === "") {
      generatedSlug = `merchant-${Date.now().toString(36)}`;
    }

    const resolvedBranches = Math.max(1, Number(maxBranches) || 1);
    const resolvedPlan = normalizeMerchantPlan(plan, resolvedBranches);
    const canUseRadarReviews = hasRadarAndReviewsFeature(resolvedPlan);

    const { merchant, assignedStand } = await prisma.$transaction(async (tx) => {
      // Check slug collision inside transaction
      const existing = await tx.merchant.findUnique({
        where: { slug: generatedSlug },
      });
      if (existing) {
        generatedSlug = `${generatedSlug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const createdMerchant = await tx.merchant.create({
        data: {
          name: name.trim(),
          slug: generatedSlug,
          niche,
          city,
          phone,
          pinCode: pinCode ? String(pinCode).slice(0, 8) : "1234",
          logoIcon,
          primaryColor,
          bgGradient,
          stampsRequired: Number(stampsRequired) || 5,
          rewardName,
          customerPrefix,
          loyaltyMode,
          cashbackRate: Number(cashbackRate) || 10,
          welcomeCashback: Number(welcomeCashback) || 0,
          minCashbackRedeem: Number(minCashbackRedeem) || 0,
          currency: currency || "DH",
          latitude: isValidCoordinatePair(latitude, longitude)
            ? parseFloat(String(latitude))
            : null,
          longitude: isValidCoordinatePair(latitude, longitude)
            ? parseFloat(String(longitude))
            : null,
          radarMessage,
          googleMapsUrl,
          plan: resolvedPlan,
          maxBranches: resolvedPlan === "STARTER" ? 1 : resolvedBranches,
          credits: Number(credits) || 0,
          autoWinback: Boolean(autoWinback),
          autoReview: canUseRadarReviews ? Boolean(autoReview) : false,
          autoRadar: canUseRadarReviews ? Boolean(autoRadar) : false,
          autoNearReward: Boolean(autoNearReward),
          allowMultiStamps: Boolean(allowMultiStamps),
          isActive: Boolean(isActive),
        },
      });

      let claimedStand: {
        id: string;
        code: string;
        batchLabel: string | null;
        branchName: string | null;
      } | null = null;

      if (cleanStandId) {
        const targetStand = await tx.qrStand.findUnique({
          where: { id: cleanStandId },
          select: { id: true, code: true, batchLabel: true },
        });

        if (!targetStand) {
          throw new StandClaimError(
            "كود الـ QR المحدد غير موجود في مخزون الستاندات",
            404
          );
        }

        const claimResult = await tx.qrStand.updateMany({
          where: { id: cleanStandId, merchantId: null },
          data: {
            merchantId: createdMerchant.id,
            branchName: cleanStandBranchName,
            assignedAt: new Date(),
          },
        });

        if (claimResult.count === 0) {
          throw new StandClaimError(
            `الستاند (${targetStand.code}) تم ربطه بمتجر آخر للتو، يرجى اختيار ستاند آخر أو ترك الوضع التلقائي.`,
            409
          );
        }

        claimedStand = {
          id: targetStand.id,
          code: targetStand.code,
          batchLabel: targetStand.batchLabel,
          branchName: cleanStandBranchName,
        };
      }

      return { merchant: createdMerchant, assignedStand: claimedStand };
    });

    if (assignedStand?.code) {
      invalidateStandCache(assignedStand.code);
    }

    return NextResponse.json(
      { ...merchant, assignedStand },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof StandClaimError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error creating merchant:", error);
    const msg = error instanceof Error ? error.message : "تعذر إنشاء المحل";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


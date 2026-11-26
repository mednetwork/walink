import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasRadarAndReviewsFeature, normalizeMerchantPlan } from "@/lib/pricing";
import { invalidateMerchantCache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        customers: {
          orderBy: { lastVisitAt: "desc" },
          take: 20,
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            customer: {
              select: { name: true, phone: true, memberCode: true },
            },
          },
        },
        campaigns: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            customers: true,
            transactions: true,
            campaigns: true,
          },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المحل غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(merchant);
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return NextResponse.json(
      { error: "تعذر جلب بيانات المحل" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const allowedFields = [
      "name",
      "slug",
      "niche",
      "city",
      "phone",
      "pinCode",
      "logoIcon",
      "primaryColor",
      "bgGradient",
      "stampsRequired",
      "rewardName",
      "customerPrefix",
      "loyaltyMode",
      "cashbackRate",
      "welcomeCashback",
      "minCashbackRedeem",
      "currency",
      "latitude",
      "longitude",
      "radarMessage",
      "googleMapsUrl",
      "plan",
      "maxBranches",
      "credits",
      "autoWinback",
      "autoReview",
      "autoRadar",
      "autoNearReward",
      "isActive",
      "staffMembers",
      "cooldownMinutes",
      "vipVisitsThreshold",
      "vipCashbackBonus",
      "referralBonus",
      "radarZones",
      "menuUrl",
      "instagramUrl",
      "termsText",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        if (key === "maxBranches") {
          updateData.maxBranches = Math.max(1, Number(body[key]) || 1);
        } else if (
          key === "stampsRequired" ||
          key === "credits" ||
          key === "cooldownMinutes" ||
          key === "vipVisitsThreshold" ||
          key === "vipCashbackBonus" ||
          key === "referralBonus"
        ) {
          updateData[key] = Number(body[key]);
        } else if (key === "latitude" || key === "longitude") {
          updateData[key] = body[key] !== null ? parseFloat(String(body[key])) : null;
        } else if (key.startsWith("auto") || key === "isActive") {
          updateData[key] = Boolean(body[key]);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    const existingMerchant = await prisma.merchant.findUnique({
      where: { id },
      select: { slug: true, plan: true, maxBranches: true },
    });

    if (!existingMerchant) {
      return NextResponse.json({ error: "المحل غير موجود" }, { status: 404 });
    }

    if ("plan" in updateData || "maxBranches" in updateData) {
      const candidatePlan =
        typeof updateData.plan === "string"
          ? updateData.plan
          : existingMerchant.plan || "GROWTH";
      const candidateBranches =
        typeof updateData.maxBranches === "number"
          ? updateData.maxBranches
          : existingMerchant.maxBranches || 1;
      const normalized = normalizeMerchantPlan(candidatePlan, candidateBranches);
      updateData.plan = normalized;
      if (normalized === "STARTER") {
        updateData.maxBranches = 1;
        updateData.autoRadar = false;
        updateData.autoReview = false;
      } else if (normalized === "MULTI") {
        updateData.maxBranches = Math.max(2, candidateBranches);
      } else {
        updateData.maxBranches = 1;
      }
      if (!hasRadarAndReviewsFeature(normalized)) {
        updateData.autoRadar = false;
        updateData.autoReview = false;
      }
    }

    const updated = await prisma.merchant.update({
      where: { id },
      data: updateData,
    });

    invalidateMerchantCache(existingMerchant.slug);
    invalidateMerchantCache(updated.slug);

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating merchant:", error);
    const msg = error instanceof Error ? error.message : "تعذر تحديث المحل";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const deleted = await prisma.merchant.delete({
      where: { id },
      select: { slug: true },
    });

    invalidateMerchantCache(deleted.slug);

    return NextResponse.json({ success: true, message: "تم حذف المحل بنجاح" });
  } catch (error: unknown) {
    console.error("Error deleting merchant:", error);
    const msg = error instanceof Error ? error.message : "تعذر حذف المحل";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


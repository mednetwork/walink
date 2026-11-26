import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStoreSessionFromCookies } from "@/lib/auth";
import { hasRadarAndReviewsFeature } from "@/lib/pricing";
import { invalidateMerchantCache } from "@/lib/cache";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await getStoreSessionFromCookies(req.cookies, slug);
    const body = await req.json();

    if (
      !session ||
      session.role !== "OWNER" ||
      body.actorRole === "BRANCH_STAFF" ||
      body.actorRole === "STAFF"
    ) {
      return NextResponse.json(
        {
          error:
            "غير مصرح: تعديل إعدادات المتجر ونظام الولاء والفروع محصور بحساب صاحب المشروع فقط.",
        },
        { status: 403 }
      );
    }

    const allowedSettings = [
      "autoWinback",
      "autoReview",
      "autoRadar",
      "autoNearReward",
    ];

    const updateData: Record<string, unknown> = {};

    for (const key of allowedSettings) {
      if (key in body && typeof body[key] === "boolean") {
        updateData[key] = body[key];
      }
    }

    if (body.loyaltyMode && ["STAMPS", "CASHBACK", "BOTH"].includes(body.loyaltyMode)) {
      updateData.loyaltyMode = body.loyaltyMode;
    }

    if (body.cashbackRate !== undefined && !isNaN(Number(body.cashbackRate))) {
      updateData.cashbackRate = Math.max(1, Math.min(50, Number(body.cashbackRate)));
    }

    if (body.cooldownMinutes !== undefined && !isNaN(Number(body.cooldownMinutes))) {
      updateData.cooldownMinutes = Math.max(0, Math.min(1440, Number(body.cooldownMinutes)));
    }

    if (body.staffMembers !== undefined && typeof body.staffMembers === "string") {
      updateData.staffMembers = body.staffMembers;
    }

    if (body.radarZones !== undefined && typeof body.radarZones === "string") {
      updateData.radarZones = body.radarZones;
    }

    if (body.menuUrl !== undefined) {
      updateData.menuUrl = body.menuUrl ? String(body.menuUrl).trim() : null;
    }

    if (body.instagramUrl !== undefined) {
      updateData.instagramUrl = body.instagramUrl ? String(body.instagramUrl).trim() : null;
    }

    if (body.termsText !== undefined && typeof body.termsText === "string") {
      updateData.termsText = body.termsText;
    }

    if (body.vipVisitsThreshold !== undefined && !isNaN(Number(body.vipVisitsThreshold))) {
      updateData.vipVisitsThreshold = Math.max(1, Number(body.vipVisitsThreshold));
    }

    if (body.vipCashbackBonus !== undefined && !isNaN(Number(body.vipCashbackBonus))) {
      updateData.vipCashbackBonus = Math.max(0, Number(body.vipCashbackBonus));
    }

    if (body.referralBonus !== undefined && !isNaN(Number(body.referralBonus))) {
      updateData.referralBonus = Math.max(0, Number(body.referralBonus));
    }

    if (body.latitude !== undefined && !isNaN(Number(body.latitude))) {
      const lat = Number(body.latitude);
      if (lat >= -90 && lat <= 90) {
        updateData.latitude = lat;
      }
    }

    if (body.longitude !== undefined && !isNaN(Number(body.longitude))) {
      const lng = Number(body.longitude);
      if (lng >= -180 && lng <= 180) {
        updateData.longitude = lng;
      }
    }

    if (body.googleMapsUrl !== undefined) {
      updateData.googleMapsUrl = body.googleMapsUrl ? String(body.googleMapsUrl).trim() : null;
    }

    if (body.radarMessage !== undefined && typeof body.radarMessage === "string") {
      updateData.radarMessage = body.radarMessage.trim();
    }

    if (body.city !== undefined && typeof body.city === "string") {
      updateData.city = body.city.trim();
    }

    if (body.promoTemplates !== undefined) {
      if (typeof body.promoTemplates === "string") {
        updateData.promoTemplates = body.promoTemplates;
      } else if (Array.isArray(body.promoTemplates)) {
        updateData.promoTemplates = JSON.stringify(body.promoTemplates);
      }
    }

    if (body.branches !== undefined) {
      // Fetch current merchant to validate quota and verify PIN conflicts
      const currentMerchant = await prisma.merchant.findUnique({
        where: { slug },
        select: { id: true, plan: true, maxBranches: true, pinCode: true },
      });

      if (!currentMerchant) {
        return NextResponse.json({ error: "المحل التجاري غير موجود" }, { status: 404 });
      }

      let branchesArray: Array<{
        id: string;
        name: string;
        city?: string;
        pinCode?: string;
        latitude?: number;
        longitude?: number;
        googleMapsUrl?: string;
        radarMessage?: string;
        phone?: string;
        isMain?: boolean;
      }> = [];

      if (Array.isArray(body.branches)) {
        branchesArray = body.branches;
      } else if (typeof body.branches === "string") {
        try {
          branchesArray = JSON.parse(body.branches);
        } catch {
          branchesArray = [];
        }
      }

      // 1. Strict Quota Enforcement
      const allowedMaxBranches = currentMerchant.maxBranches ?? (currentMerchant.plan === "MULTI" ? 3 : 1);
      if (branchesArray.length > allowedMaxBranches) {
        return NextResponse.json(
          {
            error: `لقد تجاوزت الحد الأقصى للفروع المسموح به في باقتك (${allowedMaxBranches}). يرجى التواصل مع الإدارة لترقية باقتك.`,
            code: "MAX_BRANCHES_EXCEEDED",
            maxBranches: allowedMaxBranches,
          },
          { status: 403 }
        );
      }

      // 2. PIN Validation and Collision Check
      const seenPins = new Set<string>();
      for (const b of branchesArray) {
        if (b.pinCode && String(b.pinCode).trim() !== "") {
          const cleanPin = String(b.pinCode).trim();
          if (!/^\d{4}$/.test(cleanPin)) {
            return NextResponse.json(
              { error: `رمز PIN للفرع (${b.name || "بدون اسم"}) يجب أن يتكون من 4 أرقام حصراً.` },
              { status: 400 }
            );
          }
          if (cleanPin === currentMerchant.pinCode) {
            return NextResponse.json(
              { error: `رمز PIN للفرع (${b.name}) لا يمكن أن يتطابق مع رمز PIN الرئيسي لصاحب المتجر.` },
              { status: 400 }
            );
          }
          if (seenPins.has(cleanPin)) {
            return NextResponse.json(
              { error: `رمز PIN (${cleanPin}) مكرر في أكثر من فرع. يجب أن يكون لكل فرع رمز دخول فريد.` },
              { status: 400 }
            );
          }
          seenPins.add(cleanPin);
          b.pinCode = cleanPin;
        }
      }

      updateData.branches = JSON.stringify(branchesArray);

      // Refinement 4: Sync all branch coordinates and radarMessage into radarZones for Google & Apple Wallet (up to 10 locations)
      if (branchesArray.length > 0) {
        const zones = branchesArray.slice(0, 10).map((b) => ({
          name: b.name || "فرع المحل",
          lat: Number(b.latitude) || 33.5731,
          lng: Number(b.longitude) || -7.5898,
          message: b.radarMessage || "أنت بالقرب من فرعنا! تفضل بزيارتنا وبطاقتك جاهزة.",
        }));
        updateData.radarZones = JSON.stringify(zones);

        // If there is a main branch or first branch, synchronize the primary location fields
        const mainBranch = branchesArray.find((b) => b.isMain) || branchesArray[0];
        if (mainBranch && mainBranch.latitude !== undefined && mainBranch.longitude !== undefined) {
          updateData.latitude = Number(mainBranch.latitude);
          updateData.longitude = Number(mainBranch.longitude);
          if (mainBranch.googleMapsUrl) updateData.googleMapsUrl = mainBranch.googleMapsUrl;
          if (mainBranch.city) updateData.city = mainBranch.city;
        }
      }
    }

    const existingMerchantPlan = await prisma.merchant.findUnique({
      where: { slug },
      select: { plan: true },
    });

    if (!existingMerchantPlan) {
      return NextResponse.json({ error: "المحل التجاري غير موجود" }, { status: 404 });
    }

    if (!hasRadarAndReviewsFeature(existingMerchantPlan.plan)) {
      updateData.autoRadar = false;
      updateData.autoReview = false;
    }

    const updated = await prisma.merchant.update({
      where: { slug },
      data: updateData,
      select: {
        id: true,
        slug: true,
        loyaltyMode: true,
        cashbackRate: true,
        latitude: true,
        longitude: true,
        googleMapsUrl: true,
        radarMessage: true,
        city: true,
        promoTemplates: true,
        branches: true,
        cooldownMinutes: true,
        staffMembers: true,
        radarZones: true,
        menuUrl: true,
        instagramUrl: true,
        termsText: true,
        vipVisitsThreshold: true,
        vipCashbackBonus: true,
        referralBonus: true,
        autoWinback: true,
        autoReview: true,
        autoRadar: true,
        autoNearReward: true,
      },
    });

    invalidateMerchantCache(slug);
    invalidateMerchantCache(updated.slug);

    return NextResponse.json({
      success: true,
      message: "تم حفظ إعدادات الأتمتة بنجاح",
      settings: updated,
    });
  } catch (error: unknown) {
    console.error("Error updating merchant settings:", error);
    const msg = error instanceof Error ? error.message : "تعذر حفظ الإعدادات";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


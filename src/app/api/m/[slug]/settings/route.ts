import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();

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


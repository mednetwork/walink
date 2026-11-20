import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        if (
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

    const updated = await prisma.merchant.update({
      where: { id },
      data: updateData,
    });

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

    await prisma.merchant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "تم حذف المحل بنجاح" });
  } catch (error: unknown) {
    console.error("Error deleting merchant:", error);
    const msg = error instanceof Error ? error.message : "تعذر حذف المحل";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


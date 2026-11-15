import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serial },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            slug: true,
            niche: true,
            city: true,
            phone: true,
            logoIcon: true,
            primaryColor: true,
            bgGradient: true,
            stampsRequired: true,
            rewardName: true,
            customerPrefix: true,
            latitude: true,
            longitude: true,
            radarMessage: true,
            googleMapsUrl: true,
            autoReview: true,
            autoRadar: true,
            autoWinback: true,
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "بطاقة الوفاء غير موجودة" },
        { status: 404 }
      );
    }

    // Fetch latest campaign for this merchant if any
    const latestCampaign = await prisma.campaign.findFirst({
      where: { merchantId: customer.merchantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        memberCode: customer.memberCode,
        passSerial: customer.passSerial,
        stamps: customer.stamps,
        totalVisits: customer.totalVisits,
        rewardsRedeemed: customer.rewardsRedeemed,
        lastVisitAt: customer.lastVisitAt,
        walletType: customer.walletType,
        pushSubscription: customer.pushSubscription,
      },
      merchant: customer.merchant,
      transactions: customer.transactions,
      latestCampaign,
    });
  } catch (error: unknown) {
    console.error("Error fetching pass data:", error);
    const msg = error instanceof Error ? error.message : "تعذر جلب بيانات البطاقة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


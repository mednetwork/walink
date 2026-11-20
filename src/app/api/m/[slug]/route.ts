import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      include: {
        customers: {
          orderBy: { lastVisitAt: "desc" },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 15,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                memberCode: true,
                passSerial: true,
              },
            },
          },
        },
        campaigns: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المحل التجاري غير موجود" },
        { status: 404 }
      );
    }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Compute live dashboard metrics
    let totalVisits = 0;
    let returningCustomers = 0;
    let totalRewards = 0;

    let quietCount = 0;
    let nearCount = 0;
    let vipCount = 0;

    for (const c of merchant.customers) {
      totalVisits += c.totalVisits;
      totalRewards += c.rewardsRedeemed;

      if (c.totalVisits > 1) {
        returningCustomers++;
      }

      if (new Date(c.lastVisitAt) <= fourteenDaysAgo) {
        quietCount++;
      }

      if (c.stamps === merchant.stampsRequired - 1) {
        nearCount++;
      }

      if (c.totalVisits >= 10) {
        vipCount++;
      }
    }

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        name: merchant.name,
        slug: merchant.slug,
        niche: merchant.niche,
        city: merchant.city,
        phone: merchant.phone,
        pinCode: merchant.pinCode,
        logoIcon: merchant.logoIcon,
        primaryColor: merchant.primaryColor,
        bgGradient: merchant.bgGradient,
        stampsRequired: merchant.stampsRequired,
        rewardName: merchant.rewardName,
        customerPrefix: merchant.customerPrefix,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        radarMessage: merchant.radarMessage,
        googleMapsUrl: merchant.googleMapsUrl,
        plan: merchant.plan,
        credits: merchant.credits,
        autoWinback: merchant.autoWinback,
        autoReview: merchant.autoReview,
        autoRadar: merchant.autoRadar,
        autoNearReward: merchant.autoNearReward,
        isActive: merchant.isActive,
      },
      customers: merchant.customers,
      transactions: merchant.transactions,
      campaigns: merchant.campaigns,
      metrics: {
        totalVisits,
        returningCustomers,
        totalRewards,
        audienceCounts: {
          all: merchant.customers.length,
          quiet: quietCount,
          near: nearCount,
          vip: vipCount,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching merchant mobile data:", error);
    const msg = error instanceof Error ? error.message : "تعذر جلب بيانات المحل";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


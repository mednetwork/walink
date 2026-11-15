import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      passTypeId: string;
      serialNumber: string;
    };
  }
) {
  try {
    const { serialNumber } = params;

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serialNumber },
      include: {
        merchant: true,
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const { merchant } = customer;
    const latestNotif = customer.notifications[0]?.body || "";

    const passPayload = {
      formatVersion: 1,
      passTypeIdentifier: params.passTypeId || "pass.ma.walink.loyalty",
      serialNumber: customer.passSerial,
      teamIdentifier: process.env.APPLE_TEAM_ID || "WALINKMA01",
      organizationName: merchant.name,
      description: `كارط الوفاء - ${merchant.name}`,
      logoText: merchant.name,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(17, 24, 39)",
      labelColor: "rgb(251, 191, 36)",
      locations:
        merchant.latitude && merchant.longitude
          ? [
              {
                latitude: merchant.latitude,
                longitude: merchant.longitude,
                relevantText: merchant.radarMessage,
                maxDistance: 100,
              },
            ]
          : [],
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: `WALINK:${customer.passSerial}`,
          messageEncoding: "iso-8859-1",
          altText: `WALINK #${customer.memberCode}`,
        },
      ],
      storeCard: {
        headerFields: [
          {
            key: "stamps_count",
            label: "الطوابع",
            value: `${customer.stamps} / ${merchant.stampsRequired}`,
            changeMessage: "تزاد ليك طابع! مجموع طوابعك: %@",
          },
        ],
        primaryFields: [
          {
            key: "reward_name",
            label: "المكافأة القادمة",
            value: merchant.rewardName,
          },
        ],
        secondaryFields: [
          {
            key: "customer_name",
            label: "حامل البطاقة",
            value: customer.name,
          },
          {
            key: "member_code",
            label: "رقم العضوية",
            value: `#${customer.memberCode}`,
          },
        ],
        backFields: [
          {
            key: "last_notice",
            label: "آخر إشعار",
            value: latestNotif || "مرحباً بك في برنامج الوفاء!",
          },
          {
            key: "support",
            label: "منصة والينك",
            value: "walink.ma - بطاقات الوفاء الذكية بالمغرب",
          },
        ],
      },
    };

    return NextResponse.json(passPayload, {
      headers: {
        "Last-Modified": customer.updatedAt.toUTCString(),
      },
    });
  } catch (error: unknown) {
    console.error("Apple Wallet pass fetch error:", error);
    return NextResponse.json({ error: "Failed to generate pass" }, { status: 500 });
  }
}


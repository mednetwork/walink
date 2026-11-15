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
        merchant: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "البطاقة غير موجودة" },
        { status: 404 }
      );
    }

    const { merchant } = customer;

    // Convert hex color to rgb string for Apple Wallet (e.g. "rgb(91, 53, 25)")
    const hexToRgb = (hex: string) => {
      const cleaned = hex.replace("#", "");
      if (cleaned.length === 6) {
        const r = parseInt(cleaned.substring(0, 2), 16);
        const g = parseInt(cleaned.substring(2, 4), 16);
        const b = parseInt(cleaned.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      return "rgb(22, 31, 48)";
    };

    const bgColor = hexToRgb(merchant.primaryColor || "#5b3519");

    const origin = req.nextUrl.origin || "https://walink.ma";

    // Official Apple Wallet PassKit storeCard Schema
    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || "pass.ma.walink.loyalty",
      serialNumber: customer.passSerial,
      teamIdentifier: process.env.APPLE_TEAM_ID || "WALINKMA01",
      webServiceURL: `${origin}/api/apple`,
      authenticationToken: customer.passSerial,
      organizationName: merchant.name,
      description: `كارط الوفاء - ${merchant.name}`,
      logoText: merchant.name,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: bgColor,
      labelColor: "rgb(251, 191, 36)", // Gold accents
      // 100m Geofencing Radar Locations
      locations:
        merchant.latitude && merchant.longitude
          ? [
              {
                latitude: merchant.latitude,
                longitude: merchant.longitude,
                relevantText:
                  merchant.radarMessage ||
                  "راك دايز من حدانا! دوز مرحبا بيك، الكارط ديالك واجدة.",
                maxDistance: 100, // 100m radar boundary!
              },
            ]
          : [],
      // High-resolution scannable barcode
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: `WALINK:${customer.passSerial}`,
          messageEncoding: "iso-8859-1",
          altText: `WALINK #${customer.memberCode}`,
        },
      ],
      barcode: {
        format: "PKBarcodeFormatQR",
        message: `WALINK:${customer.passSerial}`,
        messageEncoding: "iso-8859-1",
        altText: `WALINK #${customer.memberCode}`,
      },
      storeCard: {
        headerFields: [
          {
            key: "stamps_count",
            label: "الطوابع",
            value: `${customer.stamps} / ${merchant.stampsRequired}`,
            changeMessage: "تزاد ليك طابع! مجموع طوابعك: %@",
            textAlignment: "PKTextAlignmentRight",
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
            textAlignment: "PKTextAlignmentRight",
          },
        ],
        backFields: [
          {
            key: "shop_info",
            label: "عن المحل",
            value: `${merchant.name} - ${merchant.city}`,
          },
          {
            key: "terms",
            label: "شروط برنامج الوفاء",
            value: `اجمع ${merchant.stampsRequired} طوابع واستفد فورياً من ${merchant.rewardName}. الكارط صالحة بدون تاريخ انتهاء.`,
          },
          {
            key: "support",
            label: "منصة والينك",
            value: "walink.ma - بطاقات الوفاء الذكية بالمغرب",
          },
        ],
      },
    };

    return NextResponse.json({
      mode: "smart_pass",
      customerName: customer.name,
      merchantName: merchant.name,
      passSerial: customer.passSerial,
      memberCode: customer.memberCode,
      geofence: {
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        radarMessage: merchant.radarMessage,
        radiusMeters: 100,
      },
      passJson,
    });
  } catch (error: unknown) {
    console.error("Error generating pass JSON:", error);
    const msg = error instanceof Error ? error.message : "تعذر توليد ملف المحفظة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


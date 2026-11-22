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
      select: {
        name: true,
        memberCode: true,
        merchant: {
          select: {
            name: true,
            city: true,
            primaryColor: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const merchantName = customer.merchant.name || "Walink";
    const primaryColor = customer.merchant.primaryColor || "#008069";

    const manifestData = {
      name: `${merchantName} — Walink Pass`,
      short_name: merchantName,
      description: `بطاقة الوفاء الرقمية الخاصة بـ ${customer.name} في ${merchantName}`,
      start_url: `/pass/${serial}`,
      scope: `/pass/${serial}`,
      display: "standalone",
      orientation: "portrait",
      background_color: "#060B18",
      theme_color: primaryColor,
      dir: "rtl",
      lang: "ar",
      icons: [
        {
          src: "/icon.svg",
          sizes: "192x192 512x512",
          type: "image/svg+xml",
          purpose: "any maskable",
        },
        {
          src: "/favicon.ico",
          sizes: "any",
          type: "image/x-icon",
        },
      ],
    };

    return new NextResponse(JSON.stringify(manifestData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Error generating dynamic manifest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

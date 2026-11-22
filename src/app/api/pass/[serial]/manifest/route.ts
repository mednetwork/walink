import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MANIFEST_HEADERS = {
  "Content-Type": "application/manifest+json; charset=utf-8",
  "Cache-Control": "private, no-cache, no-store, must-revalidate",
  "Vary": "Referer, Host",
};

const STANDARD_ICONS = [
  {
    src: "/icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any maskable",
  },
  {
    src: "/icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any maskable",
  },
  {
    src: "/icon.svg",
    sizes: "any",
    type: "image/svg+xml",
    purpose: "any maskable",
  },
  {
    src: "/favicon.ico",
    sizes: "32x32 48x48",
    type: "image/x-icon",
  },
];

export async function GET(
  _req: NextRequest,
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
      name: `${merchantName} — بطاقة الوفاء`,
      short_name: merchantName,
      description: `بطاقة الوفاء الرقمية الخاصة بـ ${customer.name} في ${merchantName}`,
      start_url: `/pass/${serial}`,
      scope: `/pass/${serial}`,
      id: `/pass/${serial}`,
      display: "standalone",
      orientation: "portrait",
      background_color: "#060B18",
      theme_color: primaryColor,
      dir: "rtl",
      lang: "ar",
      icons: STANDARD_ICONS,
    };

    return new NextResponse(JSON.stringify(manifestData, null, 2), {
      status: 200,
      headers: MANIFEST_HEADERS,
    });
  } catch (error) {
    console.error("Error generating dynamic manifest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

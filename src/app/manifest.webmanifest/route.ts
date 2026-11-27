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
    src: "/icon-192.png?v=2",
    sizes: "192x192",
    type: "image/png",
    purpose: "any maskable",
  },
  {
    src: "/icon-512.png?v=2",
    sizes: "512x512",
    type: "image/png",
    purpose: "any maskable",
  },
  {
    src: "/icon.svg?v=2",
    sizes: "any",
    type: "image/svg+xml",
    purpose: "any maskable",
  },
  {
    src: "/favicon.ico?v=2",
    sizes: "32x32 48x48",
    type: "image/x-icon",
  },
];

export async function GET(req: NextRequest) {
  try {
    const referer = req.headers.get("referer") || "";
    const url = req.nextUrl;
    const querySlug = url.searchParams.get("slug");
    const querySerial = url.searchParams.get("serial");

    // 1. Check if request originates from or targets a Merchant Dashboard (/m/[slug])
    let storeSlug = querySlug;
    if (!storeSlug && referer) {
      const match = referer.match(/\/(?:m|store)\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        storeSlug = match[1];
      }
    }

    if (storeSlug) {
      const merchant = await prisma.merchant.findUnique({
        where: { slug: storeSlug },
        select: {
          name: true,
          city: true,
          primaryColor: true,
        },
      });

      if (merchant) {
        const merchantName = merchant.name || "Walink Store";
        const primaryColor = merchant.primaryColor || "#008069";

        const storeManifest = {
          name: `${merchantName} — لوحة المتجر`,
          short_name: merchantName,
          description: `لوحة التحكم السريعة الخاصة بـ ${merchantName} لطبع بطاقات الوفاء والماسح الضوئي`,
          start_url: `/m/${storeSlug}`,
          scope: `/m/${storeSlug}`,
          id: `/m/${storeSlug}`,
          display: "standalone",
          orientation: "portrait",
          background_color: "#060B18",
          theme_color: primaryColor,
          dir: "rtl",
          lang: "ar",
          icons: STANDARD_ICONS,
        };

        return new NextResponse(JSON.stringify(storeManifest, null, 2), {
          status: 200,
          headers: MANIFEST_HEADERS,
        });
      }
    }

    // 2. Check if request originates from or targets a Customer Pass (/pass/[serial])
    let passSerial = querySerial;
    if (!passSerial && referer) {
      const match = referer.match(/\/pass\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        passSerial = match[1];
      }
    }

    if (passSerial) {
      const customer = await prisma.customer.findUnique({
        where: { passSerial },
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

      if (customer) {
        const merchantName = customer.merchant.name || "Walink";
        const primaryColor = customer.merchant.primaryColor || "#008069";

        const passManifest = {
          name: `${merchantName} — بطاقة الوفاء`,
          short_name: merchantName,
          description: `بطاقة الوفاء الرقمية الخاصة بـ ${customer.name} في ${merchantName}`,
          start_url: `/pass/${passSerial}`,
          scope: `/pass/${passSerial}`,
          id: `/pass/${passSerial}`,
          display: "standalone",
          orientation: "portrait",
          background_color: "#060B18",
          theme_color: primaryColor,
          dir: "rtl",
          lang: "ar",
          icons: STANDARD_ICONS,
        };

        return new NextResponse(JSON.stringify(passManifest, null, 2), {
          status: 200,
          headers: MANIFEST_HEADERS,
        });
      }
    }

    // 3. Default: Platform Landing Page Manifest
    const defaultManifest = {
      name: "Walink • والينك بطاقات الوفاء الرقمية",
      short_name: "Walink",
      description: "بطاقات الوفاء الذكية للمحلات التجارية بالمغرب عبر Apple Wallet و Google Wallet و Web Pass.",
      start_url: "/",
      scope: "/",
      id: "/",
      display: "standalone",
      background_color: "#0B0F17",
      theme_color: "#10B981",
      dir: "rtl",
      lang: "ar",
      icons: STANDARD_ICONS,
    };

    return new NextResponse(JSON.stringify(defaultManifest, null, 2), {
      status: 200,
      headers: MANIFEST_HEADERS,
    });
  } catch (error) {
    console.error("Error generating manifest:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

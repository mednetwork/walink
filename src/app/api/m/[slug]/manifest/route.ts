import { NextRequest, NextResponse } from "next/server";
import { getCachedMerchantPublicBySlug } from "@/lib/cache";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const merchant = await getCachedMerchantPublicBySlug(slug);

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    const merchantName = merchant.name || "Walink Store";
    const primaryColor = merchant.primaryColor || "#008069";

    const manifestData = {
      name: `${merchantName} — لوحة المتجر`,
      short_name: merchantName,
      description: `لوحة التحكم السريعة الخاصة بـ ${merchantName} لطبع بطاقات الوفاء والماسح الضوئي ومتابعة الزبائن`,
      start_url: `/m/${slug}`,
      scope: `/m/${slug}`,
      id: `/m/${slug}`,
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
    console.error("Error generating merchant manifest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

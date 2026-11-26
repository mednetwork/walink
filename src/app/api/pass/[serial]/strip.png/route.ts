import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { renderStampsStripPng } from "@/lib/stamps-png";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves a high-resolution PNG visual stamp strip (/api/pass/[serial]/strip.png)
 * with explicit .png extension so Google Wallet fetchers and CDN caches resolve reliably.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { passSerial: params.serial },
      include: {
        merchant: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const { merchant } = customer;

    // Parse fractional stamps cleanly (supports 0.5 half-stamps like 3.5 / 5.5)
    const rawStampsParam = req.nextUrl.searchParams.get("s");
    const parsedQueryStamps = rawStampsParam !== null ? parseFloat(rawStampsParam) : NaN;
    const resolvedStamps =
      Number.isFinite(parsedQueryStamps) && parsedQueryStamps >= 0
        ? Number(parsedQueryStamps.toFixed(2))
        : Number((customer.stamps || 0).toFixed(2));

    const rawRequiredParam = req.nextUrl.searchParams.get("t");
    const parsedQueryRequired = rawRequiredParam !== null ? parseInt(rawRequiredParam, 10) : NaN;
    const resolvedRequired =
      Number.isFinite(parsedQueryRequired) && parsedQueryRequired >= 1
        ? parsedQueryRequired
        : merchant.stampsRequired || 5;

    const rawColor = req.nextUrl.searchParams.get("c");
    const resolvedColor =
      rawColor && /^[0-9A-Fa-f]{6}$/.test(rawColor.replace(/^#/, "").trim())
        ? `#${rawColor.replace(/^#/, "").trim()}`
        : merchant.primaryColor;

    const rawActivated = req.nextUrl.searchParams.get("a");
    const resolvedActivated =
      rawActivated !== null ? rawActivated !== "0" : customer.isActivated !== false;

    const rawVip = req.nextUrl.searchParams.get("vip");
    const resolvedVip =
      rawVip !== null ? rawVip === "1" : Boolean(customer.isVip);

    const pngBuffer = renderStampsStripPng({
      primaryColor: resolvedColor,
      stamps: resolvedStamps,
      stampsRequired: resolvedRequired,
      isCashback: customer.loyaltyType === "CASHBACK",
      isVip: resolvedVip,
      isActivated: resolvedActivated,
      totalVisits: customer.totalVisits || 0,
      vipVisitsThreshold: merchant.vipVisitsThreshold || 10,
      iconOrNiche: merchant.logoIcon || merchant.niche,
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(pngBuffer.length),
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error: unknown) {
    console.error("[GoogleWalletStripPng] GET error:", error);
    return NextResponse.json(
      { error: "Failed to generate stamps strip image" },
      { status: 500 }
    );
  }
}

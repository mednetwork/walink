import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { renderStampsStripPng } from "@/lib/stamps-png";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Generates a high-resolution 1032x336 visual stamp strip PNG for Google Wallet heroImage.
 * Queries Prisma directly by passSerial to guarantee authentic merchant styling and stamp state.
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

    const pngBuffer = renderStampsStripPng({
      primaryColor: merchant.primaryColor,
      stamps: resolvedStamps,
      stampsRequired: resolvedRequired,
      isCashback: customer.loyaltyType === "CASHBACK",
      isVip: Boolean(customer.isVip),
      isActivated: customer.isActivated !== false,
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
    console.error("[GoogleWalletStampsImage] GET error:", error);
    return NextResponse.json(
      { error: "Failed to generate stamps strip image" },
      { status: 500 }
    );
  }
}

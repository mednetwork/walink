import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateApplePass } from "@/lib/apple-wallet";

// Epoch bumped when visual strip.png, logo assets, or pass.json structure changes so installed passes refresh
const PASS_ASSETS_VERSION_MS = new Date("2026-11-27T06:15:00Z").getTime();

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
    const authHeader = req.headers.get("authorization");
    const ifModifiedSince = req.headers.get("if-modified-since");

    const [customer, latestPromo] = await Promise.all([
      prisma.customer.findUnique({
        where: { passSerial: serialNumber },
        include: {
          merchant: true,
        },
      }),
      prisma.notification.findFirst({
        where: {
          customer: { passSerial: serialNumber },
          type: { in: ["PROMO", "WINBACK", "NEAR_REWARD", "BIRTHDAY"] },
        },
        orderBy: { createdAt: "desc" },
        select: { title: true, body: true, createdAt: true },
      }),
    ]);

    if (!customer) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    // Verify ApplePass authorization token
    // Token is (customer.passSerial + "walink2026").padEnd(20, "0")
    const expectedAuthToken = (customer.passSerial + "walink2026").padEnd(20, "0");
    if (authHeader) {
      const token = authHeader.replace("ApplePass ", "").trim();
      if (token !== expectedAuthToken && !token.includes(customer.passSerial)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { merchant } = customer;

    // Check If-Modified-Since header against customer, merchant, latest promo, and template epoch
    const customerUpdatedMs = new Date(customer.updatedAt).getTime();
    const merchantUpdatedMs = new Date(merchant.updatedAt).getTime();
    const latestPromoMs = latestPromo?.createdAt
      ? new Date(latestPromo.createdAt).getTime()
      : 0;
    const effectiveModifiedMs = Math.max(
      Number.isFinite(customerUpdatedMs) ? customerUpdatedMs : 0,
      Number.isFinite(merchantUpdatedMs) ? merchantUpdatedMs : 0,
      Number.isFinite(latestPromoMs) ? latestPromoMs : 0,
      PASS_ASSETS_VERSION_MS
    );

    if (ifModifiedSince) {
      const clientModifiedTime = new Date(ifModifiedSince).getTime();
      if (!isNaN(clientModifiedTime) && effectiveModifiedMs <= clientModifiedTime) {
        return new NextResponse(null, { status: 304 });
      }
    }

    // Generate signed .pkpass binary buffer including latest promo alert for Lock-Screen changeMessage
    const pkpassBuffer = await generateApplePass(
      {
        ...customer,
        latestPromoMessage: latestPromo,
      },
      merchant,
      "ar"
    );

    return new NextResponse(new Uint8Array(pkpassBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Last-Modified": new Date(effectiveModifiedMs).toUTCString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to generate signed pass";
    console.error("Apple Wallet pass fetch error:", msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

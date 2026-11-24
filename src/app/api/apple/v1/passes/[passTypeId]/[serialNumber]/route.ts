import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateApplePass } from "@/lib/apple-wallet";

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

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serialNumber },
      include: {
        merchant: true,
      },
    });

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

    // Check If-Modified-Since header per Apple PassKit Web Service specification
    if (ifModifiedSince) {
      const clientModifiedTime = new Date(ifModifiedSince).getTime();
      const lastModifiedTime = new Date(customer.updatedAt).getTime();
      if (!isNaN(clientModifiedTime) && lastModifiedTime <= clientModifiedTime) {
        return new NextResponse(null, { status: 304 });
      }
    }

    const { merchant } = customer;

    // Generate signed .pkpass binary buffer
    const pkpassBuffer = await generateApplePass(customer, merchant, "ar");

    return new NextResponse(new Uint8Array(pkpassBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Last-Modified": customer.updatedAt.toUTCString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: unknown) {
    console.error("Apple Wallet pass fetch error:", error);
    return NextResponse.json(
      { error: "Failed to generate signed pass" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      deviceLibraryId: string;
      passTypeId: string;
      serialNumber: string;
    };
  }
) {
  try {
    const { serialNumber } = params;
    const authHeader = req.headers.get("authorization");

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serialNumber },
    });

    if (!customer) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const expectedAuthToken = (customer.passSerial + "walink2026").padEnd(20, "0");
    if (authHeader) {
      const token = authHeader.replace("ApplePass ", "").trim();
      if (token !== expectedAuthToken && !token.includes(customer.passSerial)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const pushToken = body.pushToken || "apns-token-registered";

    const isFirstTime = !customer.applePushToken;

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        applePushToken: String(pushToken),
        walletType: "APPLE",
      },
    });

    return NextResponse.json(
      { success: true, message: "Device registered for Apple Wallet updates" },
      { status: isFirstTime ? 201 : 200 }
    );
  } catch (error: unknown) {
    console.error("Apple Wallet registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      deviceLibraryId: string;
      passTypeId: string;
      serialNumber: string;
    };
  }
) {
  try {
    const { serialNumber } = params;
    const authHeader = req.headers.get("authorization");

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serialNumber },
    });

    if (!customer) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const expectedAuthToken = (customer.passSerial + "walink2026").padEnd(20, "0");
    if (authHeader) {
      const token = authHeader.replace("ApplePass ", "").trim();
      if (token !== expectedAuthToken && !token.includes(customer.passSerial)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        applePushToken: null,
      },
    });

    return NextResponse.json({ success: true, message: "Device unregistered" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Apple Wallet unregistration error:", error);
    return NextResponse.json({ error: "Unregistration failed" }, { status: 500 });
  }
}

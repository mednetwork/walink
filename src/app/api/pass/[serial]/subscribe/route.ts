import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;
    const body = await req.json();
    const { pushSubscription, walletType } = body;

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serial },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "البطاقة غير موجودة" },
        { status: 404 }
      );
    }

    const updateData: {
      pushSubscription?: string;
      walletType?: string;
    } = {};

    if (pushSubscription !== undefined) {
      updateData.pushSubscription =
        typeof pushSubscription === "string"
          ? pushSubscription
          : JSON.stringify(pushSubscription);
    }

    if (walletType && ["APPLE", "GOOGLE", "WEBPASS"].includes(walletType)) {
      updateData.walletType = walletType;
    }

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: updateData,
      select: {
        id: true,
        passSerial: true,
        walletType: true,
        pushSubscription: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث اشتراك الإشعارات والمحفظة بنجاح",
      customer: updated,
    });
  } catch (error: unknown) {
    console.error("Error saving push subscription:", error);
    const msg = error instanceof Error ? error.message : "فشل حفظ اشتراك الإشعارات";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


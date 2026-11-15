import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serial },
      include: { merchant: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "بطاقة الوفاء غير موجودة" },
        { status: 404 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        merchantId: customer.merchantId,
        customerId: customer.id,
        type: "RADAR",
        title: `📍 رادار القرب 100m: ${customer.merchant.name}`,
        body:
          customer.merchant.radarMessage ||
          `راك قريب من ${customer.merchant.name}! دوز خود قهوتك وجمع طابع جديد ☕`,
        actionUrl: `/pass/${customer.passSerial}`,
      },
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error: unknown) {
    console.error("Radar proximity trigger error:", error);
    const msg = error instanceof Error ? error.message : "فشل تشغيل رادار القرب";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


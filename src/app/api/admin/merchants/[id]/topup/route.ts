import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { amount } = body;

    const topupAmount = parseInt(String(amount), 10);
    if (isNaN(topupAmount) || topupAmount <= 0) {
      return NextResponse.json(
        { error: "قيمة الشحن يجب أن تكون رقماً موجباً" },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id },
      select: { id: true, credits: true },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المحل غير موجود" },
        { status: 404 }
      );
    }

    const updated = await prisma.merchant.update({
      where: { id },
      data: {
        credits: { increment: topupAmount },
      },
    });

    return NextResponse.json({
      success: true,
      message: `تم شحن ${topupAmount.toLocaleString()} كريدي بنجاح`,
      credits: updated.credits,
    });
  } catch (error: unknown) {
    console.error("Error topping up credits:", error);
    const msg = error instanceof Error ? error.message : "تعذر شحن الرصيد";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;
    const body = await req.json();
    const { oldPin, newPin } = body;

    if (!newPin || typeof newPin !== "string" || !/^\d{4}$/.test(newPin.trim())) {
      return NextResponse.json(
        { error: "رمز الأمان الجديد يجب أن يتكون من 4 أرقام حصراً (مثال: 1234)" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serial },
      select: {
        id: true,
        memberCode: true,
        securityPin: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "البطاقة غير موجودة" },
        { status: 404 }
      );
    }

    // Verify old PIN if one was already set or matches memberCode
    const currentPin = customer.securityPin || customer.memberCode;
    if (oldPin !== undefined) {
      const cleanOld = typeof oldPin === "string" ? oldPin.trim() : "";
      if (cleanOld !== currentPin && cleanOld !== customer.memberCode) {
        return NextResponse.json(
          { error: "رمز الأمان الحالي غير صحيح" },
          { status: 401 }
        );
      }
    }

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        securityPin: newPin.trim(),
        failedPinAttempts: 0,
        pinLockedUntil: null,
      },
      select: {
        id: true,
        securityPin: true,
      },
    });

    return NextResponse.json({
      ok: true,
      securityPin: updated.securityPin,
      message: "تم تحديث رمز أمان البطاقة بنجاح!",
    });
  } catch (error) {
    console.error("Error updating customer securityPin:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث رمز الأمان" },
      { status: 500 }
    );
  }
}

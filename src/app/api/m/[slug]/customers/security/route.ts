import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { customerId, action, newPin } = body;

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json(
        { error: "معرف الزبون مطلوب" },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المتجر غير موجود" },
        { status: 404 }
      );
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        merchantId: merchant.id,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "الزبون غير موجود في هذا المتجر" },
        { status: 404 }
      );
    }

    if (action === "RESET_PIN") {
      if (!newPin || typeof newPin !== "string" || !/^\d{4}$/.test(newPin.trim())) {
        return NextResponse.json(
          { error: "رمز PIN الجديد يجب أن يتكون من 4 أرقام حصراً (مثال: 1234)" },
          { status: 400 }
        );
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
          failedPinAttempts: true,
          pinLockedUntil: true,
        },
      });

      return NextResponse.json({
        ok: true,
        customer: updated,
        message: `تم إعادة تعيين رمز PIN للزبون بنجاح إلى: ${updated.securityPin}`,
      });
    }

    if (action === "UNLOCK_ACCOUNT") {
      const updated = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          failedPinAttempts: 0,
          pinLockedUntil: null,
        },
        select: {
          id: true,
          securityPin: true,
          failedPinAttempts: true,
          pinLockedUntil: true,
        },
      });

      return NextResponse.json({
        ok: true,
        customer: updated,
        message: "تم فك قفل الحساب بنجاح، ويمكن للزبون الآن استرجاع بطاقته.",
      });
    }

    return NextResponse.json(
      { error: "إجراء غير صالح" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error managing customer security:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم أثناء تحديث أمان الحساب" },
      { status: 500 }
    );
  }
}

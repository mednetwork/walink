import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getPublicVapidKey,
  parseAndValidatePushSubscription,
} from "@/lib/web-push";

export async function GET(
  _req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;
    const [vapidPublicKey, customer] = await Promise.all([
      getPublicVapidKey(),
      prisma.customer.findUnique({
        where: { passSerial: serial },
        select: { pushSubscription: true },
      }),
    ]);

    if (!customer) {
      return NextResponse.json(
        { error: "البطاقة غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      vapidPublicKey,
      hasWebPush: Boolean(
        parseAndValidatePushSubscription(customer.pushSubscription)
      ),
    });
  } catch (error: unknown) {
    console.error("Error fetching VAPID public key:", error);
    return NextResponse.json(
      { error: "تعذر تجهيز خدمة الإشعارات" },
      { status: 500 }
    );
  }
}

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
      select: { id: true, pushSubscription: true },
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
      if (pushSubscription === "browser-active") {
        // Never overwrite an existing valid cryptographic Web Push subscription with fallback marker
        const existingValid = parseAndValidatePushSubscription(
          customer.pushSubscription
        );
        if (!existingValid) {
          updateData.pushSubscription = "browser-active";
        }
      } else {
        const validated = parseAndValidatePushSubscription(pushSubscription);
        if (!validated) {
          return NextResponse.json(
            { error: "بيانات اشتراك الإشعارات غير صالحة أو غير موثوقة" },
            { status: 400 }
          );
        }
        updateData.pushSubscription = JSON.stringify(validated);
      }
    }

    if (walletType && ["APPLE", "GOOGLE", "WEBPASS"].includes(walletType)) {
      updateData.walletType = walletType;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: "تم الحفاظ على اشتراك الإشعارات النشط",
      });
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

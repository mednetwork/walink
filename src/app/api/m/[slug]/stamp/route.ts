import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeMoroccanPhone } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { customerId, identifier, action = "STAMP" } = body;

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        rewardName: true,
        stampsRequired: true,
        isActive: true,
      },
    });

    if (!merchant || !merchant.isActive) {
      return NextResponse.json(
        { error: "المحل التجاري غير موجود أو غير نشط" },
        { status: 404 }
      );
    }

    // Resolve Customer
    let customer = null;

    if (customerId) {
      customer = await prisma.customer.findFirst({
        where: { id: customerId, merchantId: merchant.id },
      });
    }

    if (!customer && identifier) {
      const rawIdent = String(identifier).trim();

      // Case 1: Scanned QR string e.g. "WALINK:pass-atlas-4821" or "WALINK:4821"
      if (rawIdent.startsWith("WALINK:")) {
        const payload = rawIdent.replace("WALINK:", "").trim();
        customer = await prisma.customer.findFirst({
          where: {
            merchantId: merchant.id,
            OR: [
              { passSerial: payload },
              { memberCode: payload },
              { id: payload },
            ],
          },
        });
      }

      // Case 2: Direct passSerial
      if (!customer) {
        customer = await prisma.customer.findFirst({
          where: {
            merchantId: merchant.id,
            passSerial: rawIdent,
          },
        });
      }

      // Case 3: 4-digit member code
      if (!customer && /^\d{4}$/.test(rawIdent)) {
        customer = await prisma.customer.findFirst({
          where: {
            merchantId: merchant.id,
            memberCode: rawIdent,
          },
        });
      }

      // Case 4: Phone number lookup
      if (!customer) {
        const normalized = normalizeMoroccanPhone(rawIdent);
        if (normalized) {
          customer = await prisma.customer.findFirst({
            where: {
              merchantId: merchant.id,
              phone: normalized,
            },
          });
        }
      }
    }

    if (!customer) {
      return NextResponse.json(
        { error: "لم يتم العثور على الزبون. تأكد من مسح الرمز أو كتابة الكود الصحيح." },
        { status: 404 }
      );
    }

    const now = new Date();

    if (action === "REDEEM") {
      // Redeem reward
      const newStamps = Math.max(0, customer.stamps - merchant.stampsRequired);

      const [updatedCustomer, transaction] = await prisma.$transaction([
        prisma.customer.update({
          where: { id: customer.id },
          data: {
            stamps: newStamps,
            rewardsRedeemed: { increment: 1 },
            lastVisitAt: now,
          },
        }),
        prisma.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "REWARD_REDEEMED",
            stampsDelta: -merchant.stampsRequired,
            note: `استلام الكادو: ${merchant.rewardName} 🎁`,
            createdAt: now,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        action: "REDEEM",
        message: `مبروك! تم تسليم المكافأة (${merchant.rewardName}) لـ ${customer.name} بنجاح 🎁`,
        customer: updatedCustomer,
        transaction,
      });
    }

    // Default Action: STAMP
    const [updatedCustomer, transaction] = await prisma.$transaction([
      prisma.customer.update({
        where: { id: customer.id },
        data: {
          stamps: { increment: 1 },
          totalVisits: { increment: 1 },
          lastVisitAt: now,
        },
      }),
      prisma.transaction.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: "STAMP_ADDED",
          stampsDelta: 1,
          note: "طابع جديد ☕️",
          createdAt: now,
        },
      }),
    ]);

    const isRewardUnlocked = updatedCustomer.stamps >= merchant.stampsRequired;

    return NextResponse.json({
      success: true,
      action: "STAMP",
      isRewardUnlocked,
      message: isRewardUnlocked
        ? `🎉 ممتاز! ${customer.name} جمع كاع الطوابع (${updatedCustomer.stamps}/${merchant.stampsRequired}) والكادو واجد!`
        : `تمت إضافة طابع جديد لـ ${customer.name} بنجاح (${updatedCustomer.stamps}/${merchant.stampsRequired}).`,
      customer: updatedCustomer,
      transaction,
    });
  } catch (error: unknown) {
    console.error("Error processing stamp/redeem action:", error);
    const msg = error instanceof Error ? error.message : "تعذر تسجيل العملية";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


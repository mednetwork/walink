import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeMoroccanPhone, isValidMoroccanPhone } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { name, phone, birthday, loyaltyType: requestedLoyaltyType } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "يرجى كتابة الاسم الكامل" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "يرجى إدخال رقم الهاتف" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeMoroccanPhone(phone);
    if (!isValidMoroccanPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: "رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف صالح (مثلاً: 0612345678)" },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        isActive: true,
        loyaltyMode: true,
        welcomeCashback: true,
        currency: true,
        cashbackRate: true,
        stampsRequired: true,
        rewardName: true,
      },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المتجر التجاري غير موجود" },
        { status: 404 }
      );
    }

    if (!merchant.isActive) {
      return NextResponse.json(
        { error: "هذا المتجر غير نشط حالياً" },
        { status: 400 }
      );
    }

    // Check if customer already exists for this merchant and phone
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        merchantId_phone: {
          merchantId: merchant.id,
          phone: normalizedPhone,
        },
      },
    });

    if (existingCustomer) {
      return NextResponse.json({
        existing: true,
        passSerial: existingCustomer.passSerial,
        message: "مرحباً بعودتك! تم العثور على بطاقتك بنجاح.",
      });
    }

    // Determine customer loyaltyType based on merchant mode
    let effectiveLoyaltyType: "STAMPS" | "CASHBACK" = "STAMPS";
    if (merchant.loyaltyMode === "CASHBACK") {
      effectiveLoyaltyType = "CASHBACK";
    } else if (merchant.loyaltyMode === "BOTH") {
      effectiveLoyaltyType =
        requestedLoyaltyType === "CASHBACK" ? "CASHBACK" : "STAMPS";
    }

    // Generate unique 4-digit member code
    let memberCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      memberCode = Math.floor(1000 + Math.random() * 9000).toString();
      const checkCode = await prisma.customer.findFirst({
        where: {
          merchantId: merchant.id,
          memberCode,
        },
      });
      if (!checkCode) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      memberCode = Date.now().toString().slice(-4);
    }

    const isCashback = effectiveLoyaltyType === "CASHBACK";
    const welcomeBonus = isCashback ? Number(merchant.welcomeCashback || 0) : 0;

    // Create new customer
    const newCustomer = await prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: name.trim(),
        phone: normalizedPhone,
        birthday: birthday ? String(birthday).trim() : null,
        memberCode,
        loyaltyType: effectiveLoyaltyType,
        stamps: isCashback ? 0 : 1, // 1 welcome stamp gift for STAMPS
        cashbackBalance: welcomeBonus,
        totalCashbackEarned: welcomeBonus,
        totalVisits: 1,
        walletType: "WEBPASS",
      },
    });

    // Create initial card created transaction
    await prisma.transaction.create({
      data: {
        merchantId: merchant.id,
        customerId: newCustomer.id,
        type: "CARD_CREATED",
        stampsDelta: isCashback ? 0 : 1,
        cashbackDelta: isCashback ? welcomeBonus : 0,
        note: isCashback
          ? `تفعيل بطاقة كاش باك + هدية ترحيبية ${welcomeBonus} ${merchant.currency}`
          : "تفعيل بطاقة الأختام + أول ختم ترحيبي هدية 🎁",
      },
    });

    return NextResponse.json(
      {
        existing: false,
        passSerial: newCustomer.passSerial,
        message: isCashback
          ? `تم تفعيل بطاقة الكاش باك بنجاح وحصلت على ${welcomeBonus} ${merchant.currency} كهدية ترحيبية!`
          : "تم تفعيل بطاقتك بنجاح وحصلت على أول ختم هدية!",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error in customer onboarding join API:", error);
    const msg = error instanceof Error ? error.message : "تعذر تسجيل العميل";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

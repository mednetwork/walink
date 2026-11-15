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
    const { name, phone, birthday } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "يرجى كتابة الاسم ديالك" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "يرجى كتابة رقم الهاتف" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeMoroccanPhone(phone);
    if (!isValidMoroccanPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: "رقم الهاتف غير صحيح. يرجى إدخال رقم مغربي (مثلاً: 0612345678 أو 0712345678)" },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: { id: true, name: true, isActive: true },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المحل التجاري غير موجود" },
        { status: 404 }
      );
    }

    if (!merchant.isActive) {
      return NextResponse.json(
        { error: "هذا المحل غير نشط حالياً" },
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
        message: "مرحباً بك مجدداً! تم استرجاع بطاقتك وطوابعك بنجاح.",
      });
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

    // Create new customer with 1 Welcome Stamp!
    const newCustomer = await prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: name.trim(),
        phone: normalizedPhone,
        birthday: birthday ? String(birthday).trim() : null,
        memberCode,
        stamps: 1, // 1 welcome stamp gift!
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
        stampsDelta: 1,
        note: "تسجيل الكارط + أول طابع ترحيبي هدية 🎁",
      },
    });

    return NextResponse.json(
      {
        existing: false,
        passSerial: newCustomer.passSerial,
        message: "تم تفعيل بطاقتك بنجاح وحصلت على أول طابع هدية!",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error in customer onboarding join API:", error);
    const msg = error instanceof Error ? error.message : "تعذر تسجيل الزبون";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


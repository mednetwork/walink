import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeMoroccanPhone, isValidMoroccanPhone } from "@/lib/utils";

function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "•••";
  return clean.slice(0, 2) + "••••••" + clean.slice(-2);
}

function maskName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "•••";
  const first = trimmed.charAt(0);
  return `${first}••••`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const urlRef = req.nextUrl?.searchParams?.get("ref") || null;
    const rawRef = body.ref || body.refCode || urlRef;
    const ref = typeof rawRef === "string" ? rawRef.trim() : null;
    const { name, phone, loyaltyType: requestedLoyaltyType, securityPin } = body;

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
        referralBonus: true,
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
      select: {
        id: true,
        name: true,
        phone: true,
        memberCode: true,
        securityPin: true,
        failedPinAttempts: true,
        pinLockedUntil: true,
        passSerial: true,
      },
    });

    if (existingCustomer) {
      // 1. Check if account recovery is locked out due to failed attempts
      if (
        existingCustomer.pinLockedUntil &&
        new Date(existingCustomer.pinLockedUntil) > new Date()
      ) {
        const diffMs =
          new Date(existingCustomer.pinLockedUntil).getTime() - Date.now();
        const minsRemaining = Math.max(1, Math.ceil(diffMs / 60000));
        return NextResponse.json(
          {
            existing: true,
            locked: true,
            pinLockedUntil: existingCustomer.pinLockedUntil.toISOString(),
            minsRemaining,
            error: `تم قفل محاولات الاسترجاع مؤقتاً لمدة ${minsRemaining} دقيقة لحماية الحساب. يرجى مراجعة الكاشير في المتجر لإلغاء القفل فوراً.`,
          },
          { status: 423 }
        );
      }

      // 2. If caller provided securityPin, verify it
      const providedPin =
        typeof securityPin === "string" ? securityPin.trim() : "";

      if (providedPin.length > 0) {
        const isMatch =
          providedPin === existingCustomer.securityPin ||
          providedPin === existingCustomer.memberCode;

        if (isMatch) {
          // Reset lockout on successful PIN verification
          await prisma.customer.update({
            where: { id: existingCustomer.id },
            data: {
              failedPinAttempts: 0,
              pinLockedUntil: null,
            },
          });

          return NextResponse.json({
            existing: true,
            passSerial: existingCustomer.passSerial,
            message: "مرحباً بعودتك! تم تأكيد هويتك واسترجاع بطاقتك بنجاح.",
          });
        } else {
          // Wrong PIN entered
          const newFailed = (existingCustomer.failedPinAttempts || 0) + 1;
          const isNowLocked = newFailed >= 5;
          const lockTimestamp = isNowLocked
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null;

          await prisma.customer.update({
            where: { id: existingCustomer.id },
            data: {
              failedPinAttempts: newFailed,
              pinLockedUntil: lockTimestamp,
            },
          });

          const attemptsRemaining = Math.max(0, 5 - newFailed);
          if (isNowLocked) {
            return NextResponse.json(
              {
                existing: true,
                locked: true,
                attemptsRemaining: 0,
                pinLockedUntil: lockTimestamp?.toISOString(),
                minsRemaining: 15,
                error:
                  "تم إدخال رمز الأمان 5 مرات بشكل خاطئ. تم قفل الحساب مؤقتاً لمدة 15 دقيقة لحمايته. يمكنك طلب المساعدة من الكاشير في المحل.",
              },
              { status: 423 }
            );
          }

          return NextResponse.json(
            {
              existing: true,
              requiresPin: true,
              attemptsRemaining,
              error: `رمز الأمان غير صحيح. تبقى لك ${attemptsRemaining} محاولات قبل القفل المؤقت.`,
            },
            { status: 401 }
          );
        }
      }

      // 3. If caller did not provide securityPin, prompt for it with privacy masking
      return NextResponse.json({
        existing: true,
        requiresPin: true,
        maskedName: maskName(existingCustomer.name),
        maskedPhone: maskPhone(existingCustomer.phone),
        attemptsRemaining: Math.max(
          0,
          5 - (existingCustomer.failedPinAttempts || 0)
        ),
        message:
          "هذا الرقم مسجل مسبقاً. يرجى إدخال رمز الأمان (PIN) لتأكيد هويتك واسترجاع البطاقة.",
      });
    }

    // New Customer requires name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "يرجى كتابة الاسم الكامل" },
        { status: 400 }
      );
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

    // Check if customer was referred by an existing member
    let referrerCustomer = null;
    if (ref && typeof ref === "string" && ref.trim()) {
      referrerCustomer = await prisma.customer.findFirst({
        where: {
          merchantId: merchant.id,
          memberCode: ref.trim(),
        },
      });
    }

    // Determine custom security PIN or default to 4-digit memberCode
    const customPin =
      securityPin &&
      typeof securityPin === "string" &&
      /^\d{4}$/.test(securityPin.trim())
        ? securityPin.trim()
        : memberCode;

    // Create new customer
    const newCustomer = await prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: name.trim(),
        phone: normalizedPhone,
        memberCode,
        securityPin: customPin,
        failedPinAttempts: 0,
        loyaltyType: effectiveLoyaltyType,
        stamps: isCashback ? 0 : 1, // 1 welcome stamp gift for STAMPS
        cashbackBalance: welcomeBonus,
        totalCashbackEarned: welcomeBonus,
        totalVisits: 1,
        referredByCode: referrerCustomer ? referrerCustomer.memberCode : null,
        walletType: "WEBPASS",
      },
    });

    // Reward referrer immediately if exists
    if (referrerCustomer) {
      const isReferrerCashback = referrerCustomer.loyaltyType === "CASHBACK";
      const refBonusDH = Number(merchant.referralBonus || 10);
      const currency = merchant.currency || "DH";

      if (isReferrerCashback) {
        await prisma.$transaction([
          prisma.customer.update({
            where: { id: referrerCustomer.id },
            data: {
              cashbackBalance: { increment: refBonusDH },
              totalCashbackEarned: { increment: refBonusDH },
              referralsCount: { increment: 1 },
            },
          }),
          prisma.transaction.create({
            data: {
              merchantId: merchant.id,
              customerId: referrerCustomer.id,
              type: "CASHBACK_EARNED",
              cashbackDelta: refBonusDH,
              staffName: "النظام",
              note: `مكافأة دعوة صديق: ${newCustomer.name} 🎁`,
            },
          }),
          prisma.notification.create({
            data: {
              merchantId: merchant.id,
              customerId: referrerCustomer.id,
              type: "REWARD",
              title: merchant.name,
              body: `🎉 قام صديقك ${newCustomer.name} بالتسجيل عبر رابطك! تمت إضافة مكافأة الإحالة (+${refBonusDH} ${currency}) إلى رصيدك.`,
            },
          }),
        ]);
      } else {
        const newStamps = Math.min(merchant.stampsRequired, referrerCustomer.stamps + 1);
        await prisma.$transaction([
          prisma.customer.update({
            where: { id: referrerCustomer.id },
            data: {
              stamps: newStamps,
              referralsCount: { increment: 1 },
            },
          }),
          prisma.transaction.create({
            data: {
              merchantId: merchant.id,
              customerId: referrerCustomer.id,
              type: "STAMP_ADDED",
              stampsDelta: 1,
              staffName: "النظام",
              note: `مكافأة دعوة صديق: ${newCustomer.name} 🎁`,
            },
          }),
          prisma.notification.create({
            data: {
              merchantId: merchant.id,
              customerId: referrerCustomer.id,
              type: "STAMP",
              title: merchant.name,
              body: `🎉 قام صديقك ${newCustomer.name} بالتسجيل عبر رابطك! تمت إضافة ختم مجاني إلى بطاقتك.`,
            },
          }),
        ]);
      }
    }

    // Create initial card created transaction
    await prisma.transaction.create({
      data: {
        merchantId: merchant.id,
        customerId: newCustomer.id,
        type: "CARD_CREATED",
        stampsDelta: isCashback ? 0 : 1,
        cashbackDelta: isCashback ? welcomeBonus : 0,
        staffName: "النظام",
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

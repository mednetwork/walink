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

    // Generate a 12-code candidate pool & verify uniqueness in 1 batch query in parallel with referrer lookup
    const candidatePool = new Set<string>();
    while (candidatePool.size < 12) {
      candidatePool.add(Math.floor(1000 + Math.random() * 9000).toString());
    }
    const candidateCodes = Array.from(candidatePool);
    const trimmedRef = ref && typeof ref === "string" ? ref.trim() : "";

    const [takenCodeRows, referrerCustomer] = await Promise.all([
      prisma.customer.findMany({
        where: {
          merchantId: merchant.id,
          memberCode: { in: candidateCodes },
        },
        select: { memberCode: true },
      }),
      trimmedRef
        ? prisma.customer.findFirst({
            where: {
              merchantId: merchant.id,
              memberCode: trimmedRef,
            },
          })
        : Promise.resolve(null),
    ]);

    const takenCodeSet = new Set(takenCodeRows.map((c) => c.memberCode));
    let memberCode = candidateCodes.find((code) => !takenCodeSet.has(code)) || "";

    // Safe fallback only if all 12 random codes collided in a dense store
    if (!memberCode) {
      let fallbackCode = Date.now().toString().slice(-4);
      const existsFallback = await prisma.customer.findFirst({
        where: { merchantId: merchant.id, memberCode: fallbackCode },
        select: { id: true },
      });
      if (existsFallback) {
        fallbackCode = Math.floor(1000 + Math.random() * 9000).toString();
      }
      memberCode = fallbackCode;
    }

    const isCashback = effectiveLoyaltyType === "CASHBACK";
    const welcomeBonus = isCashback ? Number(merchant.welcomeCashback || 0) : 0;

    const isReferred = Boolean(referrerCustomer);

    // Determine custom security PIN or default to 4-digit memberCode
    const customPin =
      securityPin &&
      typeof securityPin === "string" &&
      /^\d{4}$/.test(securityPin.trim())
        ? securityPin.trim()
        : memberCode;

    // Create new customer:
    // Organic customers receive their welcome gift immediately and are active.
    // Referred customers start unactivated (0 balance) until their first store visit.
    const initialStamps = isCashback ? 0 : isReferred ? 0 : 1;
    const initialCashback = isReferred ? 0 : welcomeBonus;

    const newCustomer = await prisma.customer.create({
      data: {
        merchantId: merchant.id,
        name: name.trim(),
        phone: normalizedPhone,
        memberCode,
        securityPin: customPin,
        failedPinAttempts: 0,
        loyaltyType: effectiveLoyaltyType,
        stamps: initialStamps,
        cashbackBalance: initialCashback,
        totalCashbackEarned: initialCashback,
        totalVisits: 0,
        referredByCode: referrerCustomer ? referrerCustomer.memberCode : null,
        isActivated: !isReferred,
        walletType: "WEBPASS",
      },
    });

    // Create initial card created transaction
    await prisma.transaction.create({
      data: {
        merchantId: merchant.id,
        customerId: newCustomer.id,
        type: "CARD_CREATED",
        stampsDelta: initialStamps,
        cashbackDelta: initialCashback,
        staffName: "النظام",
        note: isReferred
          ? "إنشاء بطاقة عبر دعوة صديق (بانتظار التفعيل عند أول زيارة للمتجر) 🎁"
          : isCashback
          ? `تفعيل بطاقة كاش باك + هدية ترحيبية ${welcomeBonus} ${merchant.currency}`
          : "تفعيل بطاقة الأختام + أول ختم ترحيبي هدية 🎁",
      },
    });

    return NextResponse.json(
      {
        existing: false,
        passSerial: newCustomer.passSerial,
        isActivated: !isReferred,
        message: isReferred
          ? "تم إنشاء بطاقتك بنجاح! تفضل بزيارتنا لتفعيل هديتك الأولى."
          : isCashback
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

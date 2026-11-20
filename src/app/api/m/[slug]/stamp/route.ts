import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeMoroccanPhone } from "@/lib/utils";
import { pushGoogleWalletUpdate } from "@/lib/google-wallet";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const {
      customerId,
      identifier,
      action = "STAMP",
      billAmount,
      redeemAmount,
      staffName = "المدير",
      overrideCooldown = false,
    } = body;

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        primaryColor: true,
        rewardName: true,
        stampsRequired: true,
        loyaltyMode: true,
        cashbackRate: true,
        welcomeCashback: true,
        minCashbackRedeem: true,
        currency: true,
        latitude: true,
        longitude: true,
        radarZones: true,
        googleMapsUrl: true,
        menuUrl: true,
        instagramUrl: true,
        phone: true,
        termsText: true,
        autoReview: true,
        isActive: true,
        cooldownMinutes: true,
        vipVisitsThreshold: true,
        vipCashbackBonus: true,
      },
    });

    if (!merchant || !merchant.isActive) {
      return NextResponse.json(
        { error: "المتجر غير موجود أو غير نشط حالياً" },
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

      // Case 1: Scanned QR string e.g. "WALINK:pass-atlas-4821", "WALINK:4821", or Dynamic QR "WALINK:pass-atlas-4821:3x7b"
      if (rawIdent.startsWith("WALINK:")) {
        const fullPayload = rawIdent.replace("WALINK:", "").trim();
        const parts = fullPayload.split(":");
        const payload = parts[0];
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

      // Case 2: Direct passSerial (with optional timeToken)
      if (!customer) {
        const directPayload = rawIdent.split(":")[0].trim();
        customer = await prisma.customer.findFirst({
          where: {
            merchantId: merchant.id,
            passSerial: directPayload,
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
        { error: "لم يتم العثور على العميل. تأكد من مسح الرمز أو إدخال الكود الصحيح." },
        { status: 404 }
      );
    }

    const now = new Date();
    const currency = merchant.currency || "DH";

    // Anti-Fraud Cooldown check (for STAMP and CASHBACK_EARN)
    if (
      (action === "STAMP" || action === "CASHBACK_EARN") &&
      (merchant.cooldownMinutes || 0) > 0 &&
      !overrideCooldown
    ) {
      const lastTx = await prisma.transaction.findFirst({
        where: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: { in: ["STAMP_ADDED", "CASHBACK_EARNED"] },
        },
        orderBy: { createdAt: "desc" },
      });

      if (lastTx) {
        const diffMs = now.getTime() - new Date(lastTx.createdAt).getTime();
        const cooldownMs = (merchant.cooldownMinutes || 30) * 60 * 1000;
        if (diffMs < cooldownMs) {
          const minutesLeft = Math.max(1, Math.ceil((cooldownMs - diffMs) / 60000));
          return NextResponse.json(
            {
              error: "COOLDOWN_ACTIVE",
              minutesLeft,
              message: `⚠️ حماية من التلاعب: تم مسح بطاقة هذا العميل قبل ${Math.floor(
                diffMs / 60000
              )} دقيقة! يرجى الانتظار (${minutesLeft} دقيقة متبقية) أو تأكيد العملية بصلاحية المدير.`,
            },
            { status: 429 }
          );
        }
      }
    }

    // Dynamic VIP Gold Card status check
    const isAlreadyVip = Boolean(customer.isVip);
    const willBecomeVip =
      !isAlreadyVip &&
      customer.totalVisits + 1 >= (merchant.vipVisitsThreshold || 10);
    const isVipCustomer = isAlreadyVip || willBecomeVip;
    const effectiveCashbackRate = isVipCustomer
      ? merchant.cashbackRate + (merchant.vipCashbackBonus || 5)
      : merchant.cashbackRate;

    // Action 1: SWITCH_TYPE (Toggle customer between STAMPS and CASHBACK)
    if (action === "SWITCH_TYPE") {
      const targetType = customer.loyaltyType === "CASHBACK" ? "STAMPS" : "CASHBACK";
      const updated = await prisma.customer.update({
        where: { id: customer.id },
        data: { loyaltyType: targetType },
      });

      return NextResponse.json({
        success: true,
        action: "SWITCH_TYPE",
        message: `تم تحويل برنامج العميل إلى: ${
          targetType === "CASHBACK" ? "نظام الكاش باك" : "نظام الأختام"
        }`,
        customer: updated,
      });
    }

    // Action 2: CASHBACK_EARN (Add cashback from purchase bill)
    if (action === "CASHBACK_EARN") {
      const bill = Number(billAmount || 0);
      if (isNaN(bill) || bill <= 0) {
        return NextResponse.json(
          { error: "يرجى إدخال مبلغ فاتورة صحيح أكبر من صفر" },
          { status: 400 }
        );
      }

      const earned = Number(((bill * effectiveCashbackRate) / 100).toFixed(2));
      const newBalance = Number(((customer.cashbackBalance || 0) + earned).toFixed(2));

      const [updatedCustomer, transaction, notification] = await prisma.$transaction([
        prisma.customer.update({
          where: { id: customer.id },
          data: {
            cashbackBalance: { increment: earned },
            totalCashbackEarned: { increment: earned },
            totalSpent: { increment: bill },
            totalVisits: { increment: 1 },
            isVip: isVipCustomer,
            lastVisitAt: now,
          },
        }),
        prisma.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "CASHBACK_EARNED",
            billAmount: bill,
            cashbackDelta: earned,
            staffName: staffName || "المدير",
            note: isVipCustomer
              ? `كاش باك VIP الذهبي ${effectiveCashbackRate}% على فاتورة ${bill} ${currency}`
              : `كاش باك ${merchant.cashbackRate}% على فاتورة ${bill} ${currency}`,
            createdAt: now,
          },
        }),
        prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "STAMP",
            title: merchant.name,
            body: `💰 تمت إضافة +${earned} ${currency} كاش باك إلى بطاقتك! رصيدك المتاح: ${newBalance} ${currency}.`,
            createdAt: now,
          },
        }),
      ]);

      if (willBecomeVip) {
        await prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "REWARD",
            title: "👑 ترقية لفئة VIP الذهبية!",
            body: `👑 تهانينا ${customer.name}! لقد تمت ترقية بطاقتك إلى فئة VIP الذهبية مع نسبة كاش باك إضافية ومزايا مضاعفة!`,
            createdAt: new Date(now.getTime() + 500),
          },
        });
      }

      // Asynchronously push update to Google Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

      return NextResponse.json({
        success: true,
        action: "CASHBACK_EARN",
        message: `تمت إضافة +${earned} ${currency} (${effectiveCashbackRate}%) لـ ${customer.name} بنجاح!`,
        earned,
        bill,
        customer: updatedCustomer,
        transaction,
        notification,
      });
    }

    // Action 3: CASHBACK_REDEEM (Deduct from available cashback balance)
    if (action === "CASHBACK_REDEEM") {
      const toRedeem = Number(redeemAmount || 0);
      if (isNaN(toRedeem) || toRedeem <= 0) {
        return NextResponse.json(
          { error: "يرجى إدخال مبلغ صحيح للخصم" },
          { status: 400 }
        );
      }

      const currentBal = Number(customer.cashbackBalance || 0);
      if (toRedeem > currentBal) {
        return NextResponse.json(
          { error: `الرصيد المتاح (${currentBal} ${currency}) أقل من المبلغ المطلوب خصمه.` },
          { status: 400 }
        );
      }

      if (merchant.minCashbackRedeem > 0 && currentBal < merchant.minCashbackRedeem) {
        return NextResponse.json(
          {
            error: `الحد الأدنى للبدء في استخدام الكاش باك هو ${merchant.minCashbackRedeem} ${currency}.`,
          },
          { status: 400 }
        );
      }

      const remainingBal = Number((currentBal - toRedeem).toFixed(2));

      const [updatedCustomer, transaction, notification] = await prisma.$transaction([
        prisma.customer.update({
          where: { id: customer.id },
          data: {
            cashbackBalance: { decrement: toRedeem },
            rewardsRedeemed: { increment: 1 },
            lastVisitAt: now,
          },
        }),
        prisma.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "CASHBACK_REDEEMED",
            cashbackDelta: -toRedeem,
            staffName: staffName || "المدير",
            note: `خصم ${toRedeem} ${currency} من رصيد الكاش باك`,
            createdAt: now,
          },
        }),
        prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "REWARD",
            title: merchant.name,
            body: `🎉 تم استخدام ${toRedeem} ${currency} من رصيدك. رصيدك المتبقي: ${remainingBal} ${currency}.`,
            createdAt: now,
          },
        }),
      ]);

      if (merchant.autoReview) {
        await prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "REVIEW",
            title: `كيف كانت تجربتك في ${merchant.name}؟ ⭐`,
            body: "شكراً لزيارتك! شاركنا تقييمك بـ 5 نجوم على خرائط Google وساعد الآخرين على اكتشافنا.",
            actionUrl: merchant.googleMapsUrl || "https://maps.google.com",
            createdAt: new Date(now.getTime() + 1000),
          },
        });
      }

      // Asynchronously push update to Google Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

      return NextResponse.json({
        success: true,
        action: "CASHBACK_REDEEM",
        message: `تم خصم ${toRedeem} ${currency} من رصيد ${customer.name} بنجاح. الرصيد المتبقي: ${remainingBal} ${currency}.`,
        redeemed: toRedeem,
        customer: updatedCustomer,
        transaction,
        notification,
      });
    }

    // Action 4: REDEEM STAMP REWARD
    if (action === "REDEEM") {
      const newStamps = Math.max(0, customer.stamps - merchant.stampsRequired);

      const [updatedCustomer, transaction, notification] = await prisma.$transaction([
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
            staffName: staffName || "المدير",
            note: `تسليم المكافأة: ${merchant.rewardName} 🎁`,
            createdAt: now,
          },
        }),
        prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "REWARD",
            title: merchant.name,
            body: `🎉 مبروك! مكافأة ${merchant.rewardName} جاهزة لاستلامها.`,
            createdAt: now,
          },
        }),
      ]);

      if (merchant.autoReview) {
        await prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "REVIEW",
            title: `كيف كانت تجربتك في ${merchant.name}؟ ⭐`,
            body: "شكراً لزيارتك! شاركنا تقييمك بـ 5 نجوم على خرائط Google وساعد الآخرين على اكتشافنا.",
            actionUrl: merchant.googleMapsUrl || "https://maps.google.com",
            createdAt: new Date(now.getTime() + 1000),
          },
        });
      }

      // Asynchronously push update to Google Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

      return NextResponse.json({
        success: true,
        action: "REDEEM",
        message: `مبروك! تم تسليم المكافأة (${merchant.rewardName}) لـ ${customer.name} بنجاح 🎁`,
        customer: updatedCustomer,
        transaction,
        notification,
      });
    }

    // Action 5: ADD STAMP (Default)
    const nextStamps = customer.stamps + 1;
    const isRewardUnlocked = nextStamps >= merchant.stampsRequired;
    const stampsLeft = Math.max(0, merchant.stampsRequired - nextStamps);

    const [updatedCustomer, transaction, notification] = await prisma.$transaction([
      prisma.customer.update({
        where: { id: customer.id },
        data: {
          stamps: { increment: 1 },
          totalVisits: { increment: 1 },
          isVip: isVipCustomer,
          lastVisitAt: now,
        },
      }),
      prisma.transaction.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: "STAMP_ADDED",
          stampsDelta: 1,
          staffName: staffName || "المدير",
          note: "ختم زيارة جديد ☕️",
          createdAt: now,
        },
      }),
      prisma.notification.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: isRewardUnlocked ? "REWARD" : "STAMP",
          title: merchant.name,
          body: isRewardUnlocked
            ? `🎉 مبروك! اكتملت أختامك! مكافأة ${merchant.rewardName} جاهزة للاستلام.`
            : `تمت إضافة ختم جديد! متبقي لديك ${stampsLeft} أختام للحصول على ${merchant.rewardName}.`,
          createdAt: now,
        },
      }),
    ]);

    if (willBecomeVip) {
      await prisma.notification.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: "REWARD",
          title: "👑 ترقية لفئة VIP الذهبية!",
          body: `👑 تهانينا ${customer.name}! لقد تمت ترقية بطاقتك إلى فئة VIP الذهبية مع مزايا ومكافآت مضاعفة!`,
          createdAt: new Date(now.getTime() + 500),
        },
      });
    }

    if (isRewardUnlocked && merchant.autoReview) {
      await prisma.notification.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: "REVIEW",
          title: `هل أعجبتك الخدمة في ${merchant.name}؟ ⭐`,
          body: "شاركنا تقييمك بـ 5 نجوم على Google Maps وساعد الآخرين على اكتشافنا!",
          actionUrl: merchant.googleMapsUrl || "https://maps.google.com",
          createdAt: new Date(now.getTime() + 1000),
        },
      });
    }

    // Asynchronously push update to Google Wallet
    pushGoogleWalletUpdate(
      updatedCustomer,
      merchant,
      merchant.name,
      notification.body
    ).catch((err) => console.warn("[GoogleWallet] push error:", err));

    return NextResponse.json({
      success: true,
      action: "STAMP",
      isRewardUnlocked,
      message: isRewardUnlocked
        ? `🎉 ممتاز! ${customer.name} جمع كافة الأختام (${updatedCustomer.stamps}/${merchant.stampsRequired}) والمكافأة جاهزة!`
        : `تمت إضافة ختم جديد لـ ${customer.name} بنجاح (${updatedCustomer.stamps}/${merchant.stampsRequired}).`,
      customer: updatedCustomer,
      transaction,
      notification,
    });
  } catch (error: unknown) {
    console.error("Error processing stamp/cashback action:", error);
    const msg = error instanceof Error ? error.message : "تعذر تسجيل العملية";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

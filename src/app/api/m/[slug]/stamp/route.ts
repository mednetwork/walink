import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeMoroccanPhone } from "@/lib/utils";
import { pushGoogleWalletUpdate } from "@/lib/google-wallet";
import { sendApplePassUpdate } from "@/lib/apple-wallet";
import { getLocalizedRewardName } from "@/lib/i18n/rewards";
import { Locale } from "@/lib/i18n/translations";

/**
 * Processes deferred referral reward when a referred customer completes their first store visit.
 * Rewards the referrer with +1 stamp or referral cashback bonus, and fires instant push notifications
 * to the referrer's Apple Wallet (APNs HTTP/2) and Google Wallet (REST API).
 */
async function processReferralActivationReward(
  referredCustomer: { id: string; name: string; referredByCode: string | null },
  merchant: {
    id: string;
    name: string;
    slug: string;
    stampsRequired: number;
    referralBonus?: number | null;
    currency?: string | null;
    primaryColor?: string | null;
    rewardName: string;
    loyaltyMode?: string | null;
    cashbackRate?: number | null;
    welcomeCashback?: number | null;
    vipVisitsThreshold?: number | null;
    vipCashbackBonus?: number | null;
    latitude?: number | null;
    longitude?: number | null;
  }
) {
  if (!referredCustomer.referredByCode) return;

  try {
    const referrer = await prisma.customer.findFirst({
      where: {
        merchantId: merchant.id,
        memberCode: referredCustomer.referredByCode,
      },
    });

    if (!referrer) return;

    const currency = merchant.currency || "DH";
    const isReferrerCashback = referrer.loyaltyType === "CASHBACK";
    const now = new Date();

    let refBonusDH = 0;
    if (isReferrerCashback) {
      // Cross-Program Referral Rule: Find lowest positive cashback earned previously on referrer's card
      const lowestTx = await prisma.transaction.findFirst({
        where: {
          customerId: referrer.id,
          type: "CASHBACK_EARNED",
          cashbackDelta: { gt: 0 },
        },
        orderBy: { cashbackDelta: "asc" },
        select: { cashbackDelta: true },
      });

      if (lowestTx && typeof lowestTx.cashbackDelta === "number" && lowestTx.cashbackDelta > 0) {
        refBonusDH = Number(lowestTx.cashbackDelta.toFixed(2));
      } else if (merchant.welcomeCashback && merchant.welcomeCashback > 0) {
        refBonusDH = Number(merchant.welcomeCashback.toFixed(2));
      } else if (merchant.referralBonus && merchant.referralBonus > 0) {
        refBonusDH = Number(merchant.referralBonus.toFixed(2));
      } else {
        refBonusDH = 5;
      }
    }

    const referrerNotifTitle = merchant.name;
    const referrerNotifBody = isReferrerCashback
      ? `🎉 قام صديقك ${referredCustomer.name} بزيارة المتجر وتفعيل بطاقته! تمت إضافة مكافأة الإحالة (+${refBonusDH} ${currency}) إلى رصيد الكاش باك الخاص بك.`
      : `🎉 قام صديقك ${referredCustomer.name} بزيارة المتجر وتفعيل بطاقته! تمت إضافة خِتم مكافأة الإحالة إلى بطاقتك.`;

    let updatedReferrer;

    if (isReferrerCashback) {
      const [upd] = await prisma.$transaction([
        prisma.customer.update({
          where: { id: referrer.id },
          data: {
            cashbackBalance: { increment: refBonusDH },
            totalCashbackEarned: { increment: refBonusDH },
            referralsCount: { increment: 1 },
          },
        }),
        prisma.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: referrer.id,
            type: "CASHBACK_EARNED",
            cashbackDelta: refBonusDH,
            staffName: "النظام",
            note: `مكافأة زيارة وتفعيل صديقك: ${referredCustomer.name} 🎁 (+${refBonusDH} ${currency})`,
            createdAt: now,
          },
        }),
        prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: referrer.id,
            type: "CASHBACK",
            title: referrerNotifTitle,
            body: referrerNotifBody,
            createdAt: now,
          },
        }),
      ]);
      updatedReferrer = upd;
    } else {
      const newStamps = Math.min(merchant.stampsRequired, referrer.stamps + 1);
      const [upd] = await prisma.$transaction([
        prisma.customer.update({
          where: { id: referrer.id },
          data: {
            stamps: newStamps,
            referralsCount: { increment: 1 },
          },
        }),
        prisma.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: referrer.id,
            type: "STAMP_ADDED",
            stampsDelta: 1,
            staffName: "النظام",
            note: `مكافأة زيارة وتفعيل صديقك: ${referredCustomer.name} 🎁`,
            createdAt: now,
          },
        }),
        prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: referrer.id,
            type: "STAMP",
            title: referrerNotifTitle,
            body: referrerNotifBody,
            createdAt: now,
          },
        }),
      ]);
      updatedReferrer = upd;
    }

    // CRITICAL: Database commit is completed above!
    // Asynchronously push update to referrer's Apple Wallet & Google Wallet
    if (updatedReferrer.applePushToken) {
      sendApplePassUpdate(updatedReferrer.applePushToken).catch((err) =>
        console.warn("[AppleWallet] Push error to referrer:", err)
      );
    }

    pushGoogleWalletUpdate(
      updatedReferrer,
      merchant,
      referrerNotifTitle,
      referrerNotifBody
    ).catch((err) =>
      console.warn("[GoogleWallet] Push error to referrer:", err)
    );
  } catch (err) {
    console.error("[Referral] Failed to reward referrer on activation:", err);
  }
}

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
      branchName,
      overrideCooldown = false,
      lang: reqLang = "ar",
    } = body;
    const lang: Locale =
      reqLang === "fr" || reqLang === "es" ? reqLang : "ar";

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
        referralBonus: true,
        minCashbackRedeem: true,
        currency: true,
        latitude: true,
        longitude: true,
        radarZones: true,
        branches: true,
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
        credits: true,
      },
    });

    if (!merchant || !merchant.isActive) {
      return NextResponse.json(
        { error: "المتجر غير موجود أو غير نشط حالياً" },
        { status: 404 }
      );
    }

    // Resolve Branch-Specific Google Maps URL for Reviews (Refinement 2)
    let branchReviewUrl = merchant.googleMapsUrl || "https://maps.google.com";
    const resolvedBranchName = typeof branchName === "string" && branchName.trim() ? branchName.trim() : null;

    if (resolvedBranchName && merchant.branches) {
      try {
        const parsedBranches = JSON.parse(merchant.branches);
        if (Array.isArray(parsedBranches)) {
          const foundBranch = parsedBranches.find(
            (b: { name?: string; id?: string; googleMapsUrl?: string }) =>
              b.name === resolvedBranchName || b.id === resolvedBranchName
          );
          if (foundBranch && foundBranch.googleMapsUrl && foundBranch.googleMapsUrl.trim()) {
            branchReviewUrl = foundBranch.googleMapsUrl.trim();
          }
        }
      } catch (err) {
        console.warn("Failed to parse merchant branches for review URL:", err);
      }
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

      // Case 1.5: Scanned Full URL containing /pass/([a-zA-Z0-9_-]+)
      if (!customer && rawIdent.includes("/pass/")) {
        const urlMatch = rawIdent.match(/\/pass\/([a-zA-Z0-9_-]+)/);
        if (urlMatch && urlMatch[1]) {
          const extractedSerial = urlMatch[1].split("?")[0].split(":")[0].trim();
          customer = await prisma.customer.findFirst({
            where: {
              merchantId: merchant.id,
              passSerial: extractedSerial,
            },
          });
        }
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
          const cooldownMsg =
            lang === "fr"
              ? `⚠️ Protection anti-fraude : Cette carte a été scannée il y a ${Math.floor(
                  diffMs / 60000
                )} min. Veuillez patienter (${minutesLeft} min restantes) ou valider avec le code gérant.`
              : lang === "es"
              ? `⚠️ Protección antifraude: Esta tarjeta fue escaneada hace ${Math.floor(
                  diffMs / 60000
                )} min. Por favor espera (${minutesLeft} min restantes) o confirma como gerente.`
              : `⚠️ حماية من التلاعب: تم مسح بطاقة هذا العميل قبل ${Math.floor(
                  diffMs / 60000
                )} دقيقة! يرجى الانتظار (${minutesLeft} دقيقة متبقية) أو تأكيد العملية بصلاحية المدير.`;
          return NextResponse.json(
            {
              error: "COOLDOWN_ACTIVE",
              minutesLeft,
              message: cooldownMsg,
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

    // Action 0: LOOKUP (Retrieve customer details for cashier/scanner without stamping or deducting credits)
    if (action === "LOOKUP") {
      return NextResponse.json({
        success: true,
        action: "LOOKUP",
        customer,
        isVip: isVipCustomer,
        effectiveCashbackRate,
        loyaltyMode: merchant.loyaltyMode,
        remainingCredits: merchant.credits,
      });
    }

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

    // Protection: Verify merchant has at least 1 credit for transaction actions
    const isCreditDeductibleAction =
      action === "STAMP" ||
      action === "REDEEM" ||
      action === "CASHBACK_EARN" ||
      action === "CASHBACK_REDEEM";

    if (isCreditDeductibleAction && (merchant.credits ?? 0) < 1) {
      return NextResponse.json(
        {
          error:
            lang === "fr"
              ? "Solde de crédits épuisé (0 crédit). Veuillez recharger vos crédits pour continuer."
              : lang === "es"
              ? "Saldo de créditos agotado (0 créditos). Por favor recargue créditos para continuar."
              : "رصيد نقاط المتجر غير كافٍ (0 نقطة). يرجى شحن الرصيد للاستمرار في مسح البطاقات.",
          creditsExhausted: true,
          currentCredits: merchant.credits ?? 0,
        },
        { status: 402 }
      );
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

      const isFirstActivation = customer.isActivated === false;
      const earned = Number(((bill * effectiveCashbackRate) / 100).toFixed(2));
      const totalCredited = earned;
      const newBalance = Number(((customer.cashbackBalance || 0) + totalCredited).toFixed(2));

      const [updatedCustomer, transaction, notification, updatedMerchant] = await prisma.$transaction([
        prisma.customer.update({
          where: { id: customer.id },
          data: {
            cashbackBalance: { increment: totalCredited },
            totalCashbackEarned: { increment: totalCredited },
            totalSpent: { increment: bill },
            totalVisits: { increment: 1 },
            isVip: isVipCustomer,
            isActivated: true,
            lastVisitAt: now,
          },
        }),
        prisma.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "CASHBACK_EARNED",
            billAmount: bill,
            cashbackDelta: totalCredited,
            staffName: staffName || "المدير",
            branchName: resolvedBranchName,
            note: isFirstActivation
              ? `تفعيل البطاقة + كاش باك الفاتورة الأولى ${earned} ${currency} 💰🎁`
              : (isVipCustomer
                ? `كاش باك VIP الذهبي ${effectiveCashbackRate}% على فاتورة ${bill} ${currency}`
                : `كاش باك ${merchant.cashbackRate}% على فاتورة ${bill} ${currency}`),
            createdAt: now,
          },
        }),
        prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "CASHBACK",
            title: merchant.name,
            body: isFirstActivation
              ? `🎉 أهلاً بك! تم تفعيل بطاقتك وإضافة كاش باك زيارتك الأولى (+${earned} ${currency})! رصيدك المتاح: ${newBalance} ${currency}.`
              : `💰 تمت إضافة +${earned} ${currency} كاش باك إلى بطاقتك! رصيدك المتاح: ${newBalance} ${currency}.`,
            createdAt: now,
          },
        }),
        prisma.merchant.update({
          where: { id: merchant.id },
          data: { credits: { decrement: 1 } },
          select: { credits: true },
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

      // If this was an unactivated referred customer, reward the referrer now!
      if (isFirstActivation && customer.referredByCode) {
        await processReferralActivationReward(customer, merchant);
      }

      // Asynchronously push update to Google Wallet & Apple Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

      if (updatedCustomer.applePushToken) {
        sendApplePassUpdate(updatedCustomer.applePushToken).catch((err) =>
          console.warn("[AppleWallet] push error:", err)
        );
      }

      const earnMsg = isFirstActivation
        ? (lang === "fr"
          ? `🎉 Carte de ${customer.name} activée avec le cashback de première visite (+${earned} ${currency}) !`
          : lang === "es"
          ? `¡🎉 Tarjeta de ${customer.name} activada con el cashback de primera visita (+${earned} ${currency})!`
          : `🎉 تم تفعيل بطاقة ${customer.name} وإضافة كاش باك زيارتك الأولى (+${earned} ${currency}) بنجاح!`)
        : (lang === "fr"
          ? `+${earned} ${currency} (${effectiveCashbackRate}%) crédités à ${customer.name} avec succès !`
          : lang === "es"
          ? `¡+${earned} ${currency} (${effectiveCashbackRate}%) acreditados a ${customer.name} con éxito!`
          : `تمت إضافة +${earned} ${currency} (${effectiveCashbackRate}%) لـ ${customer.name} بنجاح!`);

      return NextResponse.json({
        success: true,
        action: "CASHBACK_EARN",
        message: earnMsg,
        earned,
        bill,
        customer: updatedCustomer,
        transaction,
        notification,
        remainingCredits: updatedMerchant.credits,
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

      const [updatedCustomer, transaction, notification, updatedMerchant] = await prisma.$transaction([
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
            branchName: resolvedBranchName,
            note: `خصم ${toRedeem} ${currency} من رصيد الكاش باك`,
            createdAt: now,
          },
        }),
        prisma.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: "CASHBACK",
            title: merchant.name,
            body: `🎉 تم استخدام ${toRedeem} ${currency} من رصيدك. رصيدك المتبقي: ${remainingBal} ${currency}.`,
            createdAt: now,
          },
        }),
        prisma.merchant.update({
          where: { id: merchant.id },
          data: { credits: { decrement: 1 } },
          select: { credits: true },
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
            actionUrl: branchReviewUrl,
            createdAt: new Date(now.getTime() + 1000),
          },
        });
      }

      // Asynchronously push update to Google Wallet & Apple Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

      if (updatedCustomer.applePushToken) {
        sendApplePassUpdate(updatedCustomer.applePushToken).catch((err) =>
          console.warn("[AppleWallet] push error:", err)
        );
      }

      const redeemCashbackMsg =
        lang === "fr"
          ? `${toRedeem} ${currency} déduits du solde de ${customer.name} avec succès. Solde restant : ${remainingBal} ${currency}.`
          : lang === "es"
          ? `${toRedeem} ${currency} descontados del saldo de ${customer.name} con éxito. Saldo restante: ${remainingBal} ${currency}.`
          : `تم خصم ${toRedeem} ${currency} من رصيد ${customer.name} بنجاح. الرصيد المتبقي: ${remainingBal} ${currency}.`;

      return NextResponse.json({
        success: true,
        action: "CASHBACK_REDEEM",
        message: redeemCashbackMsg,
        redeemed: toRedeem,
        customer: updatedCustomer,
        transaction,
        notification,
        remainingCredits: updatedMerchant.credits,
      });
    }

    // Action 4: REDEEM STAMP REWARD
    if (action === "REDEEM") {
      const newStamps = Math.max(0, customer.stamps - merchant.stampsRequired);

      const [updatedCustomer, transaction, notification, updatedMerchant] = await prisma.$transaction([
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
            branchName: resolvedBranchName,
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
        prisma.merchant.update({
          where: { id: merchant.id },
          data: { credits: { decrement: 1 } },
          select: { credits: true },
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
            actionUrl: branchReviewUrl,
            createdAt: new Date(now.getTime() + 1000),
          },
        });
      }

      // Asynchronously push update to Google Wallet & Apple Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

      if (updatedCustomer.applePushToken) {
        sendApplePassUpdate(updatedCustomer.applePushToken).catch((err) =>
          console.warn("[AppleWallet] push error:", err)
        );
      }

      const localizedReward = getLocalizedRewardName(merchant.rewardName, lang);
      const redeemStampMsg =
        lang === "fr"
          ? `Félicitations ! Récompense (${localizedReward}) remise à ${customer.name} avec succès 🎁`
          : lang === "es"
          ? `¡Felicidades! Recompensa (${localizedReward}) entregada a ${customer.name} con éxito 🎁`
          : `مبروك! تم تسليم المكافأة (${merchant.rewardName}) لـ ${customer.name} بنجاح 🎁`;

      return NextResponse.json({
        success: true,
        action: "REDEEM",
        message: redeemStampMsg,
        customer: updatedCustomer,
        transaction,
        notification,
        remainingCredits: updatedMerchant.credits,
      });
    }

    // Action 5: ADD STAMP (Default)
    const isFirstActivation = customer.isActivated === false;
    const totalStampsAdded = 1; // Exactly 1 stamp (activates the card and grants their 1st stamp)
    const nextStamps = isFirstActivation ? 1 : customer.stamps + totalStampsAdded;
    const isRewardUnlocked = nextStamps >= merchant.stampsRequired;
    const stampsLeft = Math.max(0, merchant.stampsRequired - nextStamps);

    const [updatedCustomer, transaction, notification, updatedMerchant] = await prisma.$transaction([
      prisma.customer.update({
        where: { id: customer.id },
        data: {
          stamps: isFirstActivation ? 1 : { increment: totalStampsAdded },
          totalVisits: { increment: 1 },
          isVip: isVipCustomer,
          isActivated: true,
          lastVisitAt: now,
        },
      }),
      prisma.transaction.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: "STAMP_ADDED",
          stampsDelta: totalStampsAdded,
          staffName: staffName || "المدير",
          branchName: resolvedBranchName,
          note: isFirstActivation
            ? "تفعيل البطاقة واستلام خِتم الزيارة الأول ☕️🎁"
            : "ختم زيارة جديد ☕️",
          createdAt: now,
        },
      }),
      prisma.notification.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: isRewardUnlocked ? "REWARD" : "STAMP",
          title: merchant.name,
          body: isFirstActivation
            ? (isRewardUnlocked
                ? `🎉 مبروك! تم تفعيل بطاقتك واكتملت أختامك! مكافأة ${merchant.rewardName} جاهزة للاستلام.`
                : `🎉 أهلاً بك! تم تفعيل بطاقتك وإضافة خِتمك الأول! متبقي لديك ${stampsLeft} أختام للحصول على ${merchant.rewardName}.`)
            : (isRewardUnlocked
                ? `🎉 مبروك! اكتملت أختامك! مكافأة ${merchant.rewardName} جاهزة للاستلام.`
                : `تمت إضافة ختم جديد! متبقي لديك ${stampsLeft} أختام للحصول على ${merchant.rewardName}.`),
          createdAt: now,
        },
      }),
      prisma.merchant.update({
        where: { id: merchant.id },
        data: { credits: { decrement: 1 } },
        select: { credits: true },
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
          actionUrl: branchReviewUrl,
          createdAt: new Date(now.getTime() + 1000),
        },
      });
    }

    // If this was an unactivated referred customer, reward the referrer now!
    if (isFirstActivation && customer.referredByCode) {
      await processReferralActivationReward(customer, merchant);
    }

    // Asynchronously push update to Google Wallet & Apple Wallet
    pushGoogleWalletUpdate(
      updatedCustomer,
      merchant,
      merchant.name,
      notification.body
    ).catch((err) => console.warn("[GoogleWallet] push error:", err));

    if (updatedCustomer.applePushToken) {
      sendApplePassUpdate(updatedCustomer.applePushToken).catch((err) =>
        console.warn("[AppleWallet] push error:", err)
      );
    }

    const localizedStampReward = getLocalizedRewardName(merchant.rewardName, lang);
    let stampMsg = isFirstActivation
      ? `🎉 تم تفعيل بطاقة ${customer.name} وإضافة الختم الأول بنجاح (${updatedCustomer.stamps}/${merchant.stampsRequired})!`
      : (isRewardUnlocked
          ? `🎉 ممتاز! ${customer.name} جمع كافة الأختام (${updatedCustomer.stamps}/${merchant.stampsRequired}) والمكافأة جاهزة!`
          : `تمت إضافة ختم جديد لـ ${customer.name} بنجاح (${updatedCustomer.stamps}/${merchant.stampsRequired}).`);

    if (lang === "fr") {
      stampMsg = isFirstActivation
        ? `🎉 Carte de ${customer.name} activée avec le premier tampon (${updatedCustomer.stamps}/${merchant.stampsRequired}) !`
        : (isRewardUnlocked
          ? `🎉 Excellent ! ${customer.name} a complété tous les tampons (${updatedCustomer.stamps}/${merchant.stampsRequired}) et la récompense (${localizedStampReward}) est prête !`
          : `Nouveau tampon ajouté pour ${customer.name} avec succès (${updatedCustomer.stamps}/${merchant.stampsRequired}).`);
    } else if (lang === "es") {
      stampMsg = isFirstActivation
        ? `🎉 ¡Tarjeta de ${customer.name} activada con el primer sello (${updatedCustomer.stamps}/${merchant.stampsRequired})!`
        : (isRewardUnlocked
          ? `🎉 ¡Excelente! ${customer.name} ha completado todos los sellos (${updatedCustomer.stamps}/${merchant.stampsRequired}) y el premio (${localizedStampReward}) está listo.`
          : `Nuevo sello añadido para ${customer.name} con éxito (${updatedCustomer.stamps}/${merchant.stampsRequired}).`);
    }

    return NextResponse.json({
      success: true,
      action: "STAMP",
      isRewardUnlocked,
      message: stampMsg,
      customer: updatedCustomer,
      transaction,
      notification,
      remainingCredits: updatedMerchant.credits,
    });
  } catch (error: unknown) {
    console.error("Error processing stamp/cashback action:", error);
    const msg = error instanceof Error ? error.message : "تعذر تسجيل العملية";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

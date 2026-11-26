import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeMoroccanPhone, roundStamps, formatStamps } from "@/lib/utils";
import { pushGoogleWalletUpdate } from "@/lib/google-wallet";
import { sendApplePassUpdate } from "@/lib/apple-wallet";
import { getLocalizedRewardName } from "@/lib/i18n/rewards";
import { Locale } from "@/lib/i18n/translations";
import { getStoreSessionFromCookies } from "@/lib/auth";
import { isPhysicalCounterVisit } from "@/lib/metrics";
import { formatBillingMonth, hasRadarAndReviewsFeature } from "@/lib/pricing";

/**
 * Processes deferred referral reward when a referred customer completes their first store visit.
 * - STAMPS referrer: +0.5 stamp (rollover capped at stampsRequired + 0.5).
 * - CASHBACK referrer: 50% of referred friend's first-bill earned cashback ONLY (excluding welcome gift).
 * Fires instant push notifications to the referrer's Apple Wallet and Google Wallet.
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
  },
  firstBillEarnedCashback?: number
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
      if (typeof firstBillEarnedCashback === "number" && firstBillEarnedCashback > 0) {
        // Primary rule (Phase 69): 50% of referred friend's first-bill cashback ONLY (excluding welcome gift)
        refBonusDH = Number((firstBillEarnedCashback * 0.5).toFixed(2));
      } else {
        // Fallback when referred friend activated on STAMPS program: 50% of referrer's lowest physical purchase cashback
        const physicalTxs = await prisma.transaction.findMany({
          where: {
            customerId: referrer.id,
            type: "CASHBACK_EARNED",
            cashbackDelta: { gt: 0 },
            staffName: { not: "النظام" },
          },
          orderBy: { cashbackDelta: "asc" },
          take: 10,
          select: { cashbackDelta: true, type: true, staffName: true, note: true },
        });
        const lowestPhysical = physicalTxs.find((tx) => isPhysicalCounterVisit(tx));

        if (lowestPhysical && typeof lowestPhysical.cashbackDelta === "number" && lowestPhysical.cashbackDelta > 0) {
          refBonusDH = Number((lowestPhysical.cashbackDelta * 0.5).toFixed(2));
        } else if (merchant.welcomeCashback && merchant.welcomeCashback > 0) {
          refBonusDH = Number((merchant.welcomeCashback * 0.5).toFixed(2));
        } else if (merchant.referralBonus && merchant.referralBonus > 0) {
          refBonusDH = Number((merchant.referralBonus * 0.5).toFixed(2));
        } else {
          refBonusDH = 5;
        }
      }
    }

    const referralStampBonus = 0.5;
    const maxRolloverCap = roundStamps((merchant.stampsRequired || 5) + 0.5);
    const referrerNextStamps = Math.min(
      maxRolloverCap,
      roundStamps((referrer.stamps || 0) + referralStampBonus)
    );

    const referrerNotifTitle = merchant.name;
    const referrerNotifBody = isReferrerCashback
      ? `🎉 قام صديقك ${referredCustomer.name} بزيارة المتجر وتفعيل بطاقته! تمت إضافة مكافأة الإحالة (+${refBonusDH} ${currency}) إلى رصيد الكاش باك الخاص بك.`
      : `🎉 قام صديقك ${referredCustomer.name} بزيارة المتجر وتفعيل بطاقته! تمت إضافة +0.5 ختم (نصف ختم) كمكافأة إحالة إلى بطاقتك (${formatStamps(referrerNextStamps)}/${merchant.stampsRequired}).`;

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
            note: `مكافأة إحالة وتفعيل صديقك (+50%): ${referredCustomer.name} 🎁 (+${refBonusDH} ${currency})`,
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
      const [upd] = await prisma.$transaction([
        prisma.customer.update({
          where: { id: referrer.id },
          data: {
            stamps: referrerNextStamps,
            referralsCount: { increment: 1 },
          },
        }),
        prisma.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: referrer.id,
            type: "STAMP_ADDED",
            stampsDelta: referralStampBonus,
            staffName: "النظام",
            note: `مكافأة زيارة وتفعيل صديقك (+0.5 ختم): ${referredCustomer.name} 🎁`,
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
    const session = await getStoreSessionFromCookies(req.cookies, slug);
    const body = await req.json();
    const {
      customerId,
      identifier,
      action = "STAMP",
      billAmount,
      redeemAmount,
      staffName = "المدير",
      branchName,
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
        plan: true,
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

    // Resolve Branch Attribution & Branch-Specific Google Maps URL for Reviews
    // Authoritative server rule: BRANCH_STAFF session cookie always enforces its assigned branchName
    let branchReviewUrl = merchant.googleMapsUrl || "https://maps.google.com";
    const clientBranchName =
      typeof branchName === "string" && branchName.trim() ? branchName.trim() : null;
    const resolvedBranchName =
      session?.role === "BRANCH_STAFF" && session.branchName
        ? session.branchName.trim()
        : clientBranchName;
    const resolvedStaffName =
      session?.role === "BRANCH_STAFF" && session.branchName
        ? session.branchName.trim()
        : staffName || "المدير";

    if (resolvedBranchName && merchant.branches) {
      try {
        const parsedBranches = JSON.parse(merchant.branches);
        if (Array.isArray(parsedBranches)) {
          const foundBranch = parsedBranches.find(
            (b: { name?: string; id?: string; googleMapsUrl?: string }) =>
              (b.name && b.name.trim() === resolvedBranchName) || b.id === resolvedBranchName
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

    // Authoritative Cross-Branch 30-Minute Anti-Fraud Cooldown (Enforced strictly for Cashiers; Unlimited for verified OWNER)
    const isOwnerSession = session?.role === "OWNER";
    const enforcedCooldownMinutes =
      merchant.cooldownMinutes && merchant.cooldownMinutes > 0
        ? merchant.cooldownMinutes
        : 30;

    if (
      (action === "STAMP" || action === "CASHBACK_EARN") &&
      !isOwnerSession
    ) {
      const recentPhysicalTxs = await prisma.transaction.findMany({
        where: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: { in: ["STAMP_ADDED", "CASHBACK_EARNED"] },
          staffName: { not: "النظام" },
        },
        select: {
          id: true,
          type: true,
          branchName: true,
          staffName: true,
          note: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const lastTx = recentPhysicalTxs.find((tx) => isPhysicalCounterVisit(tx));

      if (lastTx) {
        const diffMs = now.getTime() - new Date(lastTx.createdAt).getTime();
        const cooldownMs = enforcedCooldownMinutes * 60 * 1000;
        if (diffMs < cooldownMs) {
          const minsAgo = Math.max(0, Math.floor(diffMs / 60000));
          const minutesLeft = Math.max(1, Math.ceil((cooldownMs - diffMs) / 60000));
          const lastBranchLabel = lastTx.branchName?.trim() || null;

          let cooldownMsg = "";
          if (lang === "fr") {
            const elapsedText =
              minsAgo < 1 ? "à l'instant" : `il y a ${minsAgo} min`;
            const branchText = lastBranchLabel
              ? ` (succursale : ${lastBranchLabel})`
              : "";
            cooldownMsg = `⏳ Alerte : Cette carte a déjà reçu un tampon/cashback ${elapsedText}${branchText}. Règle de protection (${enforcedCooldownMinutes} min) : veuillez patienter encore ${minutesLeft} min.`;
          } else if (lang === "es") {
            const elapsedText =
              minsAgo < 1 ? "hace un momento" : `hace ${minsAgo} min`;
            const branchText = lastBranchLabel
              ? ` (sucursal: ${lastBranchLabel})`
              : "";
            cooldownMsg = `⏳ Aviso: Esta tarjeta ya recibió un sello/cashback ${elapsedText}${branchText}. Regla de protección (${enforcedCooldownMinutes} min): espere ${minutesLeft} min restantes.`;
          } else {
            const elapsedText =
              minsAgo < 1
                ? "منذ لحظات (أقل من دقيقة)"
                : `قبل ${minsAgo} دقيقة`;
            const branchText = lastBranchLabel
              ? ` في فرع (${lastBranchLabel})`
              : "";
            cooldownMsg = `⏳ تنبيه: تم عمل ختم/عملية لهذا الزبون ${elapsedText}${branchText}. لا يمكن إضافة ختم جديد إلا بعد مرور ${enforcedCooldownMinutes} دقيقة (متبقي ${minutesLeft} دقيقة).`;
          }

          return NextResponse.json(
            {
              error: "COOLDOWN_ACTIVE",
              minutesLeft,
              minsAgo,
              cooldownMinutes: enforcedCooldownMinutes,
              branchName: lastBranchLabel,
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

    const billingMonth = formatBillingMonth(now);
    const canSendReview =
      Boolean(merchant.autoReview) && hasRadarAndReviewsFeature(merchant.plan);

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
            staffName: resolvedStaffName,
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
        prisma.pointUsage.create({
          data: {
            merchantId: merchant.id,
            points: 1,
            source: "CASHBACK_EARN",
            billingMonth,
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

      // If this was an unactivated referred customer, reward the referrer with 50% of first bill cashback ONLY!
      if (isFirstActivation && customer.referredByCode) {
        await processReferralActivationReward(customer, merchant, earned);
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
        remainingCredits: merchant.credits,
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
            staffName: resolvedStaffName,
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
        prisma.pointUsage.create({
          data: {
            merchantId: merchant.id,
            points: 1,
            source: "CASHBACK_REDEEM",
            billingMonth,
          },
        }),
      ]);

      if (canSendReview) {
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
        remainingCredits: merchant.credits,
      });
    }

    // Action 4: REDEEM STAMP REWARD
    if (action === "REDEEM") {
      const newStamps = Math.max(0, roundStamps((customer.stamps || 0) - merchant.stampsRequired));

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
            staffName: resolvedStaffName,
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
        prisma.pointUsage.create({
          data: {
            merchantId: merchant.id,
            points: 1,
            source: "REDEEM",
            billingMonth,
          },
        }),
      ]);

      if (canSendReview) {
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
        remainingCredits: merchant.credits,
      });
    }

    // Action 5: ADD STAMP (Default)
    const isFirstActivation = customer.isActivated === false;
    const totalStampsAdded = 1; // Exactly 1 stamp (activates the card and grants their 1st stamp)
    const maxRolloverCap = roundStamps(merchant.stampsRequired + 0.5);
    const nextStamps = isFirstActivation
      ? 1
      : Math.min(maxRolloverCap, roundStamps((customer.stamps || 0) + totalStampsAdded));
    const isRewardUnlocked = nextStamps >= merchant.stampsRequired;
    const stampsLeft = Math.max(0, roundStamps(merchant.stampsRequired - nextStamps));

    const [updatedCustomer, transaction, notification] = await prisma.$transaction([
      prisma.customer.update({
        where: { id: customer.id },
        data: {
          stamps: nextStamps,
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
                : `🎉 أهلاً بك! تم تفعيل بطاقتك وإضافة خِتمك الأول! متبقي لديك ${formatStamps(stampsLeft)} أختام للحصول على ${merchant.rewardName}.`)
            : (isRewardUnlocked
                ? `🎉 مبروك! اكتملت أختامك! مكافأة ${merchant.rewardName} جاهزة للاستلام.`
                : `تمت إضافة ختم جديد! متبقي لديك ${formatStamps(stampsLeft)} أختام للحصول على ${merchant.rewardName}.`),
          createdAt: now,
        },
      }),
      prisma.pointUsage.create({
        data: {
          merchantId: merchant.id,
          points: 1,
          source: "STAMP",
          billingMonth,
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

    if (isRewardUnlocked && canSendReview) {
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

    const formattedUpdatedStamps = formatStamps(updatedCustomer.stamps);
    const localizedStampReward = getLocalizedRewardName(merchant.rewardName, lang);
    let stampMsg = isFirstActivation
      ? `🎉 تم تفعيل بطاقة ${customer.name} وإضافة الختم الأول بنجاح (${formattedUpdatedStamps}/${merchant.stampsRequired})!`
      : (isRewardUnlocked
          ? `🎉 ممتاز! ${customer.name} جمع كافة الأختام (${formattedUpdatedStamps}/${merchant.stampsRequired}) والمكافأة جاهزة!`
          : `تمت إضافة ختم جديد لـ ${customer.name} بنجاح (${formattedUpdatedStamps}/${merchant.stampsRequired}).`);

    if (lang === "fr") {
      stampMsg = isFirstActivation
        ? `🎉 Carte de ${customer.name} activée avec le premier tampon (${formattedUpdatedStamps}/${merchant.stampsRequired}) !`
        : (isRewardUnlocked
          ? `🎉 Excellent ! ${customer.name} a complété tous les tampons (${formattedUpdatedStamps}/${merchant.stampsRequired}) et la récompense (${localizedStampReward}) est prête !`
          : `Nouveau tampon ajouté pour ${customer.name} avec succès (${formattedUpdatedStamps}/${merchant.stampsRequired}).`);
    } else if (lang === "es") {
      stampMsg = isFirstActivation
        ? `🎉 ¡Tarjeta de ${customer.name} activada con el primer sello (${formattedUpdatedStamps}/${merchant.stampsRequired})!`
        : (isRewardUnlocked
          ? `🎉 ¡Excelente! ${customer.name} ha completado todos los sellos (${formattedUpdatedStamps}/${merchant.stampsRequired}) y el premio (${localizedStampReward}) está listo.`
          : `Nuevo sello añadido para ${customer.name} con éxito (${formattedUpdatedStamps}/${merchant.stampsRequired}).`);
    }

    return NextResponse.json({
      success: true,
      action: "STAMP",
      isRewardUnlocked,
      message: stampMsg,
      customer: updatedCustomer,
      transaction,
      notification,
      remainingCredits: merchant.credits,
    });
  } catch (error: unknown) {
    console.error("Error processing stamp/cashback action:", error);
    const msg = error instanceof Error ? error.message : "تعذر تسجيل العملية";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

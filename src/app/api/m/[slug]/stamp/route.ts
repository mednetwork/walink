import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeMoroccanPhone } from "@/lib/utils";
import { pushGoogleWalletUpdate } from "@/lib/google-wallet";
import { getLocalizedRewardName } from "@/lib/i18n/rewards";
import { Locale } from "@/lib/i18n/translations";

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

      const earned = Number(((bill * effectiveCashbackRate) / 100).toFixed(2));
      const newBalance = Number(((customer.cashbackBalance || 0) + earned).toFixed(2));

      const [updatedCustomer, transaction, notification, updatedMerchant] = await prisma.$transaction([
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
            branchName: resolvedBranchName,
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

      // Asynchronously push update to Google Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

      const earnMsg =
        lang === "fr"
          ? `+${earned} ${currency} (${effectiveCashbackRate}%) crédités à ${customer.name} avec succès !`
          : lang === "es"
          ? `¡+${earned} ${currency} (${effectiveCashbackRate}%) acreditados a ${customer.name} con éxito!`
          : `تمت إضافة +${earned} ${currency} (${effectiveCashbackRate}%) لـ ${customer.name} بنجاح!`;

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
            type: "REWARD",
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

      // Asynchronously push update to Google Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

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

      // Asynchronously push update to Google Wallet
      pushGoogleWalletUpdate(
        updatedCustomer,
        merchant,
        merchant.name,
        notification.body
      ).catch((err) => console.warn("[GoogleWallet] push error:", err));

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
    const nextStamps = customer.stamps + 1;
    const isRewardUnlocked = nextStamps >= merchant.stampsRequired;
    const stampsLeft = Math.max(0, merchant.stampsRequired - nextStamps);

    const [updatedCustomer, transaction, notification, updatedMerchant] = await prisma.$transaction([
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
          branchName: resolvedBranchName,
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

    // Asynchronously push update to Google Wallet
    pushGoogleWalletUpdate(
      updatedCustomer,
      merchant,
      merchant.name,
      notification.body
    ).catch((err) => console.warn("[GoogleWallet] push error:", err));

    const localizedStampReward = getLocalizedRewardName(merchant.rewardName, lang);
    let stampMsg = isRewardUnlocked
      ? `🎉 ممتاز! ${customer.name} جمع كافة الأختام (${updatedCustomer.stamps}/${merchant.stampsRequired}) والمكافأة جاهزة!`
      : `تمت إضافة ختم جديد لـ ${customer.name} بنجاح (${updatedCustomer.stamps}/${merchant.stampsRequired}).`;

    if (lang === "fr") {
      stampMsg = isRewardUnlocked
        ? `🎉 Excellent ! ${customer.name} a complété tous les tampons (${updatedCustomer.stamps}/${merchant.stampsRequired}) et la récompense (${localizedStampReward}) est prête !`
        : `Nouveau tampon ajouté pour ${customer.name} avec succès (${updatedCustomer.stamps}/${merchant.stampsRequired}).`;
    } else if (lang === "es") {
      stampMsg = isRewardUnlocked
        ? `🎉 ¡Excelente! ${customer.name} ha completado todos los sellos (${updatedCustomer.stamps}/${merchant.stampsRequired}) y el premio (${localizedStampReward}) está listo.`
        : `Nuevo sello añadido para ${customer.name} con éxito (${updatedCustomer.stamps}/${merchant.stampsRequired}).`;
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

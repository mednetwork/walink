import { NextRequest, NextResponse } from "next/server";
import type { Customer, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { normalizeMoroccanPhone, roundStamps, formatStamps } from "@/lib/utils";
import { pushGoogleWalletUpdate } from "@/lib/google-wallet";
import { sendApplePassUpdate } from "@/lib/apple-wallet";
import { getLocalizedRewardName } from "@/lib/i18n/rewards";
import { Locale } from "@/lib/i18n/translations";
import { getStoreSessionFromCookies } from "@/lib/auth";
import { isPhysicalCounterVisit } from "@/lib/metrics";
import { formatBillingMonth, hasRadarAndReviewsFeature } from "@/lib/pricing";

class CooldownActiveError extends Error {
  public readonly payload: {
    error: "COOLDOWN_ACTIVE";
    minutesLeft: number;
    minsAgo: number;
    cooldownMinutes: number;
    branchName: string | null;
    message: string;
  };

  constructor(payload: {
    error: "COOLDOWN_ACTIVE";
    minutesLeft: number;
    minsAgo: number;
    cooldownMinutes: number;
    branchName: string | null;
    message: string;
  }) {
    super("COOLDOWN_ACTIVE");
    this.name = "CooldownActiveError";
    this.payload = payload;
  }
}

class StampValidationError extends Error {
  public readonly status: number;

  constructor(message: string, status: number = 400) {
    super(message);
    this.name = "StampValidationError";
    this.status = status;
  }
}

interface MerchantStampModel {
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

interface ReferrerPushPayload {
  updatedReferrer: Customer;
  title: string;
  body: string;
}

/**
 * Pure DB transactional referral activation helper.
 * Locks the referrer row with FOR UPDATE inside the caller's transaction so concurrent
 * referral credits serialize cleanly without Write Skew. Returns push payload to fire AFTER commit.
 */
async function processReferralActivationInTx(
  tx: Prisma.TransactionClient,
  referredCustomer: { id: string; name: string; referredByCode: string | null },
  merchant: MerchantStampModel,
  now: Date,
  firstBillEarnedCashback?: number
): Promise<ReferrerPushPayload | null> {
  if (!referredCustomer.referredByCode) return null;

  const referrerMeta = await tx.customer.findFirst({
    where: {
      merchantId: merchant.id,
      memberCode: referredCustomer.referredByCode,
    },
    select: { id: true },
  });

  if (!referrerMeta || referrerMeta.id === referredCustomer.id) return null;

  // Acquire InnoDB row lock on referrer inside the active transaction
  await tx.$queryRaw`SELECT id FROM \`Customer\` WHERE id = ${referrerMeta.id} FOR UPDATE`;

  const referrer = await tx.customer.findUnique({
    where: { id: referrerMeta.id },
  });
  if (!referrer) return null;

  const currency = merchant.currency || "DH";
  const isReferrerCashback = referrer.loyaltyType === "CASHBACK";

  let refBonusDH = 0;
  if (isReferrerCashback) {
    if (typeof firstBillEarnedCashback === "number" && firstBillEarnedCashback > 0) {
      // Phase 69 Rule: 50% of referred friend's first-bill cashback ONLY (excluding welcome gift)
      refBonusDH = Number((firstBillEarnedCashback * 0.5).toFixed(2));
    } else {
      const physicalTxs = await tx.transaction.findMany({
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
      const lowestPhysical = physicalTxs.find((row) => isPhysicalCounterVisit(row));

      if (
        lowestPhysical &&
        typeof lowestPhysical.cashbackDelta === "number" &&
        lowestPhysical.cashbackDelta > 0
      ) {
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

  if (isReferrerCashback) {
    const upd = await tx.customer.update({
      where: { id: referrer.id },
      data: {
        cashbackBalance: { increment: refBonusDH },
        totalCashbackEarned: { increment: refBonusDH },
        referralsCount: { increment: 1 },
      },
    });
    await tx.transaction.create({
      data: {
        merchantId: merchant.id,
        customerId: referrer.id,
        type: "CASHBACK_EARNED",
        cashbackDelta: refBonusDH,
        staffName: "النظام",
        note: `مكافأة إحالة وتفعيل صديقك (+50%): ${referredCustomer.name} 🎁 (+${refBonusDH} ${currency})`,
        createdAt: now,
      },
    });
    await tx.notification.create({
      data: {
        merchantId: merchant.id,
        customerId: referrer.id,
        type: "CASHBACK",
        title: referrerNotifTitle,
        body: referrerNotifBody,
        createdAt: now,
      },
    });
    return { updatedReferrer: upd, title: referrerNotifTitle, body: referrerNotifBody };
  }

  const upd = await tx.customer.update({
    where: { id: referrer.id },
    data: {
      stamps: referrerNextStamps,
      referralsCount: { increment: 1 },
    },
  });
  await tx.transaction.create({
    data: {
      merchantId: merchant.id,
      customerId: referrer.id,
      type: "STAMP_ADDED",
      stampsDelta: referralStampBonus,
      staffName: "النظام",
      note: `مكافأة زيارة وتفعيل صديقك (+0.5 ختم): ${referredCustomer.name} 🎁`,
      createdAt: now,
    },
  });
  await tx.notification.create({
    data: {
      merchantId: merchant.id,
      customerId: referrer.id,
      type: "STAMP",
      title: referrerNotifTitle,
      body: referrerNotifBody,
      createdAt: now,
    },
  });
  return { updatedReferrer: upd, title: referrerNotifTitle, body: referrerNotifBody };
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
      stampsCount,
      adjustDelta,
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
        allowMultiStamps: true,
        isActive: true,
        cooldownMinutes: true,
        vipVisitsThreshold: true,
        vipCashbackBonus: true,
        credits: true,
      },
    });

    if (!merchant || !merchant.isActive) {
      return NextResponse.json(
        { error: "المحل التجاري غير موجود أو غير نشط" },
        { status: 404 }
      );
    }

    // Authoritative server rule: BRANCH_STAFF session cookie enforces assigned branchName
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

    // Resolve Customer ID by scanner payload / memberCode / phone
    let customer = null;

    if (customerId) {
      customer = await prisma.customer.findFirst({
        where: { id: customerId, merchantId: merchant.id },
      });
    }

    if (!customer && identifier) {
      const rawIdent = String(identifier).trim();

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

      if (!customer) {
        const directPayload = rawIdent.split(":")[0].trim();
        customer = await prisma.customer.findFirst({
          where: {
            merchantId: merchant.id,
            passSerial: directPayload,
          },
        });
      }

      if (!customer && /^\d{4}$/.test(rawIdent)) {
        customer = await prisma.customer.findFirst({
          where: {
            merchantId: merchant.id,
            memberCode: rawIdent,
          },
        });
      }

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
    const isOwnerSession = session?.role === "OWNER";
    const enforcedCooldownMinutes =
      merchant.cooldownMinutes && merchant.cooldownMinutes > 0
        ? merchant.cooldownMinutes
        : 30;

    // Action 0: LOOKUP (Read-only)
    if (action === "LOOKUP") {
      const isAlreadyVip = Boolean(customer.isVip);
      const willBecomeVip =
        !isAlreadyVip &&
        customer.totalVisits + 1 >= (merchant.vipVisitsThreshold || 10);
      const isVipCustomer = isAlreadyVip || willBecomeVip;
      const effectiveCashbackRate = isVipCustomer
        ? merchant.cashbackRate + (merchant.vipCashbackBonus || 5)
        : merchant.cashbackRate;

      let stampCooldownMinutesLeft = 0;
      if (merchant.allowMultiStamps) {
        const recentLookupTxs = await prisma.transaction.findMany({
          where: {
            merchantId: merchant.id,
            customerId: customer.id,
            type: { in: ["STAMP_ADDED", "CASHBACK_EARNED"] },
            staffName: { not: "النظام" },
          },
          select: {
            type: true,
            branchName: true,
            staffName: true,
            note: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        const lastPhysical = recentLookupTxs.find((row) =>
          isPhysicalCounterVisit(row)
        );
        if (lastPhysical) {
          const diffMs = now.getTime() - new Date(lastPhysical.createdAt).getTime();
          const cooldownMs = enforcedCooldownMinutes * 60 * 1000;
          if (diffMs < cooldownMs) {
            stampCooldownMinutesLeft = Math.max(
              1,
              Math.ceil((cooldownMs - diffMs) / 60000)
            );
          }
        }
      }

      return NextResponse.json({
        success: true,
        action: "LOOKUP",
        customer,
        isVip: isVipCustomer,
        effectiveCashbackRate,
        loyaltyMode: merchant.loyaltyMode,
        allowMultiStamps: Boolean(merchant.allowMultiStamps),
        stampCooldownMinutesLeft,
        remainingCredits: merchant.credits,
      });
    }

    // Action 1: SWITCH_TYPE (Toggle STAMPS / CASHBACK atomically inside FOR UPDATE)
    if (action === "SWITCH_TYPE") {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM \`Customer\` WHERE id = ${customer.id} FOR UPDATE`;
        const fresh = await tx.customer.findUnique({
          where: { id: customer.id },
          select: { loyaltyType: true },
        });
        const targetType = fresh?.loyaltyType === "CASHBACK" ? "STAMPS" : "CASHBACK";
        return tx.customer.update({
          where: { id: customer.id },
          data: { loyaltyType: targetType },
        });
      });

      return NextResponse.json({
        success: true,
        action: "SWITCH_TYPE",
        message: `تم تحويل برنامج العميل إلى: ${
          updated.loyaltyType === "CASHBACK" ? "نظام الكاش باك" : "نظام الأختام"
        }`,
        customer: updated,
      });
    }

    // Pre-validate static numeric inputs and permissions before entering InnoDB transaction lock
    const rawStampCount = stampsCount !== undefined ? Number(stampsCount) : 1;
    if (action === "STAMP") {
      if (!Number.isInteger(rawStampCount) || rawStampCount < 1 || rawStampCount > 10) {
        return NextResponse.json(
          { error: "عدد الأختام يجب أن يكون رقماً صحيحاً بين 1 و 10" },
          { status: 400 }
        );
      }
      if (rawStampCount !== 1 && !merchant.allowMultiStamps) {
        return NextResponse.json(
          { error: "صلاحية إضافة أكثر من ختم غير مفعّلة لهذا المتجر" },
          { status: 403 }
        );
      }
    }

    const rawAdjustDelta = Number(adjustDelta);
    if (action === "STAMP_ADJUST") {
      if (!merchant.allowMultiStamps) {
        return NextResponse.json(
          { error: "صلاحية التحكم وتعديل الأختام غير مفعّلة لهذا المتجر" },
          { status: 403 }
        );
      }
      if (!Number.isInteger(rawAdjustDelta) || rawAdjustDelta >= 0 || rawAdjustDelta < -5) {
        return NextResponse.json(
          { error: "قيمة خصم الأختام يجب أن تكون عدداً صحيحاً بين -1 و -5" },
          { status: 400 }
        );
      }
    }

    if (action === "CASHBACK_EARN") {
      const bill = Number(billAmount || 0);
      if (isNaN(bill) || bill <= 0) {
        return NextResponse.json(
          { error: "يرجى إدخال مبلغ فاتورة صحيح أكبر من صفر" },
          { status: 400 }
        );
      }
    }

    if (action === "CASHBACK_REDEEM") {
      const toRedeem = Number(redeemAmount || 0);
      if (isNaN(toRedeem) || toRedeem <= 0) {
        return NextResponse.json(
          { error: "يرجى إدخال مبلغ صحيح للخصم" },
          { status: 400 }
        );
      }
    }

    const billingMonth = formatBillingMonth(now);
    const canSendReview =
      Boolean(merchant.autoReview) && hasRadarAndReviewsFeature(merchant.plan);

    // Execute all mutating POS actions atomically under InnoDB row-level FOR UPDATE lock.
    // ZERO external HTTP/Wallet calls inside $transaction — all pushes fire strictly after commit.
    const txOutcome = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM \`Customer\` WHERE id = ${customer.id} FOR UPDATE`;

      const lockedCustomer = await tx.customer.findUnique({
        where: { id: customer.id },
      });

      if (!lockedCustomer) {
        throw new StampValidationError("لم يتم العثور على العميل.", 404);
      }

      // Cross-branch 30-min anti-fraud cooldown check INSIDE the FOR UPDATE lock (eliminates Write Skew)
      // When allowMultiStamps is enabled, STAMP cooldown applies strictly even for Owner (while STAMP_ADJUST stays permitted)
      const shouldCheckCooldown =
        action === "STAMP"
          ? Boolean(merchant.allowMultiStamps) || !isOwnerSession
          : action === "CASHBACK_EARN" && !isOwnerSession;

      if (shouldCheckCooldown) {
        const recentPhysicalTxs = await tx.transaction.findMany({
          where: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
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

        const lastTx = recentPhysicalTxs.find((row) => isPhysicalCounterVisit(row));
        if (lastTx) {
          const diffMs = now.getTime() - new Date(lastTx.createdAt).getTime();
          const cooldownMs = enforcedCooldownMinutes * 60 * 1000;
          if (diffMs < cooldownMs) {
            const minsAgo = Math.max(0, Math.floor(diffMs / 60000));
            const minutesLeft = Math.max(1, Math.ceil((cooldownMs - diffMs) / 60000));
            const lastBranchLabel = lastTx.branchName?.trim() || null;

            let cooldownMsg = "";
            if (lang === "fr") {
              const elapsedText = minsAgo < 1 ? "à l'instant" : `il y a ${minsAgo} min`;
              const branchText = lastBranchLabel ? ` (succursale : ${lastBranchLabel})` : "";
              cooldownMsg = merchant.allowMultiStamps && action === "STAMP"
                ? `⏳ Tampon déjà ajouté ${elapsedText}${branchText}. Impossible d'ajouter avant ${minutesLeft} min (vous pouvez déduire un tampon en cas d'erreur).`
                : `⏳ Alerte : Cette carte a déjà reçu un tampon/cashback ${elapsedText}${branchText}. Règle de protection (${enforcedCooldownMinutes} min) : veuillez patienter encore ${minutesLeft} min.`;
            } else if (lang === "es") {
              const elapsedText = minsAgo < 1 ? "hace un momento" : `hace ${minsAgo} min`;
              const branchText = lastBranchLabel ? ` (sucursal: ${lastBranchLabel})` : "";
              cooldownMsg = merchant.allowMultiStamps && action === "STAMP"
                ? `⏳ Sello añadido ${elapsedText}${branchText}. No se puede añadir otro antes de ${minutesLeft} min (pero puedes restar un sello si hubo error).`
                : `⏳ Aviso: Esta tarjeta ya recibió un sello/cashback ${elapsedText}${branchText}. Regla de protección (${enforcedCooldownMinutes} min): espere ${minutesLeft} min restantes.`;
            } else {
              const elapsedText =
                minsAgo < 1 ? "منذ لحظات (أقل من دقيقة)" : `قبل ${minsAgo} دقيقة`;
              const branchText = lastBranchLabel ? ` في فرع (${lastBranchLabel})` : "";
              cooldownMsg = merchant.allowMultiStamps && action === "STAMP"
                ? `⏳ تم إضافة ختم لهذا الزبون ${elapsedText}${branchText}. لا يمكن إضافة ختم آخر إلا بعد مرور ${enforcedCooldownMinutes} دقيقة (متبقي ${minutesLeft} دقيقة)، لكن يمكنك خصم ختم لتصحيح خطأ.`
                : `⏳ تنبيه: تم عمل ختم/عملية لهذا الزبون ${elapsedText}${branchText}. لا يمكن إضافة ختم جديد إلا بعد مرور ${enforcedCooldownMinutes} دقيقة (متبقي ${minutesLeft} دقيقة).`;
            }

            throw new CooldownActiveError({
              error: "COOLDOWN_ACTIVE",
              minutesLeft,
              minsAgo,
              cooldownMinutes: enforcedCooldownMinutes,
              branchName: lastBranchLabel,
              message: cooldownMsg,
            });
          }
        }
      }

      const isAlreadyVip = Boolean(lockedCustomer.isVip);
      const willBecomeVip =
        !isAlreadyVip &&
        lockedCustomer.totalVisits + 1 >= (merchant.vipVisitsThreshold || 10);
      const isVipCustomer = isAlreadyVip || willBecomeVip;
      const effectiveCashbackRate = isVipCustomer
        ? merchant.cashbackRate + (merchant.vipCashbackBonus || 5)
        : merchant.cashbackRate;

      // Action 2: CASHBACK_EARN
      if (action === "CASHBACK_EARN") {
        const bill = Number(billAmount || 0);
        const isFirstActivation = lockedCustomer.isActivated === false;
        const earned = Number(((bill * effectiveCashbackRate) / 100).toFixed(2));
        const newBalance = Number(
          ((lockedCustomer.cashbackBalance || 0) + earned).toFixed(2)
        );

        const updatedCustomer = await tx.customer.update({
          where: { id: lockedCustomer.id },
          data: {
            cashbackBalance: { increment: earned },
            totalCashbackEarned: { increment: earned },
            totalSpent: { increment: bill },
            totalVisits: { increment: 1 },
            isVip: isVipCustomer,
            isActivated: true,
            lastVisitAt: now,
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "CASHBACK_EARNED",
            billAmount: bill,
            cashbackDelta: earned,
            staffName: resolvedStaffName,
            branchName: resolvedBranchName,
            note: isFirstActivation
              ? `تفعيل البطاقة + كاش باك الفاتورة الأولى ${earned} ${currency} 💰🎁`
              : isVipCustomer
              ? `كاش باك VIP الذهبي ${effectiveCashbackRate}% على فاتورة ${bill} ${currency}`
              : `كاش باك ${merchant.cashbackRate}% على فاتورة ${bill} ${currency}`,
            createdAt: now,
          },
        });

        const notification = await tx.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "CASHBACK",
            title: merchant.name,
            body: isFirstActivation
              ? `🎉 أهلاً بك! تم تفعيل بطاقتك وإضافة كاش باك زيارتك الأولى (+${earned} ${currency})! رصيدك المتاح: ${newBalance} ${currency}.`
              : `💰 تمت إضافة +${earned} ${currency} كاش باك إلى بطاقتك! رصيدك المتاح: ${newBalance} ${currency}.`,
            createdAt: now,
          },
        });

        await tx.pointUsage.create({
          data: {
            merchantId: merchant.id,
            points: 1,
            source: "CASHBACK_EARN",
            billingMonth,
          },
        });

        if (willBecomeVip) {
          await tx.notification.create({
            data: {
              merchantId: merchant.id,
              customerId: lockedCustomer.id,
              type: "REWARD",
              title: "👑 ترقية لفئة VIP الذهبية!",
              body: `👑 تهانينا ${lockedCustomer.name}! لقد تمت ترقية بطاقتك إلى فئة VIP الذهبية مع نسبة كاش باك إضافية ومزايا مضاعفة!`,
              createdAt: new Date(now.getTime() + 500),
            },
          });
        }

        const referrerPush =
          isFirstActivation && lockedCustomer.referredByCode
            ? await processReferralActivationInTx(
                tx,
                lockedCustomer,
                merchant,
                now,
                earned
              )
            : null;

        return {
          kind: "CASHBACK_EARN" as const,
          updatedCustomer,
          transaction,
          notification,
          earned,
          bill,
          isFirstActivation,
          effectiveCashbackRate,
          referrerPush,
        };
      }

      // Action 3: CASHBACK_REDEEM (Checked strictly inside FOR UPDATE lock!)
      if (action === "CASHBACK_REDEEM") {
        const toRedeem = Number(redeemAmount || 0);
        const currentBal = Number(lockedCustomer.cashbackBalance || 0);

        if (toRedeem > currentBal) {
          throw new StampValidationError(
            `الرصيد المتاح (${currentBal} ${currency}) أقل من المبلغ المطلوب خصمه.`,
            400
          );
        }

        if (merchant.minCashbackRedeem > 0 && currentBal < merchant.minCashbackRedeem) {
          throw new StampValidationError(
            `الحد الأدنى للبدء في استخدام الكاش باك هو ${merchant.minCashbackRedeem} ${currency}.`,
            400
          );
        }

        const remainingBal = Number((currentBal - toRedeem).toFixed(2));

        const updatedCustomer = await tx.customer.update({
          where: { id: lockedCustomer.id },
          data: {
            cashbackBalance: remainingBal,
            rewardsRedeemed: { increment: 1 },
            lastVisitAt: now,
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "CASHBACK_REDEEMED",
            cashbackDelta: -toRedeem,
            staffName: resolvedStaffName,
            branchName: resolvedBranchName,
            note: `خصم ${toRedeem} ${currency} من رصيد الكاش باك`,
            createdAt: now,
          },
        });

        const notification = await tx.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "CASHBACK",
            title: merchant.name,
            body: `🎉 تم استخدام ${toRedeem} ${currency} من رصيدك. رصيدك المتبقي: ${remainingBal} ${currency}.`,
            createdAt: now,
          },
        });

        await tx.pointUsage.create({
          data: {
            merchantId: merchant.id,
            points: 1,
            source: "CASHBACK_REDEEM",
            billingMonth,
          },
        });

        if (canSendReview) {
          await tx.notification.create({
            data: {
              merchantId: merchant.id,
              customerId: lockedCustomer.id,
              type: "REVIEW",
              title: `كيف كانت تجربتك في ${merchant.name}؟ ⭐`,
              body: "شكراً لزيارتك! شاركنا تقييمك بـ 5 نجوم على خرائط Google وساعد الآخرين على اكتشافنا.",
              actionUrl: branchReviewUrl,
              createdAt: new Date(now.getTime() + 1000),
            },
          });
        }

        return {
          kind: "CASHBACK_REDEEM" as const,
          updatedCustomer,
          transaction,
          notification,
          toRedeem,
          remainingBal,
          referrerPush: null,
        };
      }

      // Action 4: REDEEM STAMP REWARD (Checked strictly inside FOR UPDATE lock!)
      if (action === "REDEEM") {
        const currentStamps = roundStamps(lockedCustomer.stamps || 0);
        if (currentStamps < merchant.stampsRequired) {
          throw new StampValidationError(
            `الرصيد الحالي (${formatStamps(currentStamps)}) أقل من الأختام المطلوبة (${merchant.stampsRequired}) لاستلام المكافأة.`,
            400
          );
        }

        const newStamps = Math.max(0, roundStamps(currentStamps - merchant.stampsRequired));

        const updatedCustomer = await tx.customer.update({
          where: { id: lockedCustomer.id },
          data: {
            stamps: newStamps,
            rewardsRedeemed: { increment: 1 },
            lastVisitAt: now,
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "REWARD_REDEEMED",
            stampsDelta: -merchant.stampsRequired,
            staffName: resolvedStaffName,
            branchName: resolvedBranchName,
            note: `تسليم المكافأة: ${merchant.rewardName} 🎁`,
            createdAt: now,
          },
        });

        const notification = await tx.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "REWARD",
            title: merchant.name,
            body: `🎉 مبروك! مكافأة ${merchant.rewardName} جاهزة لاستلامها.`,
            createdAt: now,
          },
        });

        await tx.pointUsage.create({
          data: {
            merchantId: merchant.id,
            points: 1,
            source: "REDEEM",
            billingMonth,
          },
        });

        if (canSendReview) {
          await tx.notification.create({
            data: {
              merchantId: merchant.id,
              customerId: lockedCustomer.id,
              type: "REVIEW",
              title: `كيف كانت تجربتك في ${merchant.name}؟ ⭐`,
              body: "شكراً لزيارتك! شاركنا تقييمك بـ 5 نجوم على خرائط Google وساعد الآخرين على اكتشافنا.",
              actionUrl: branchReviewUrl,
              createdAt: new Date(now.getTime() + 1000),
            },
          });
        }

        return {
          kind: "REDEEM" as const,
          updatedCustomer,
          transaction,
          notification,
          referrerPush: null,
        };
      }

      // Action 4.5: STAMP_ADJUST (Negative deduction to fix mistake, exempt from cooldown/billing)
      if (action === "STAMP_ADJUST") {
        const currentStamps = roundStamps(lockedCustomer.stamps || 0);
        const deductCount = Math.abs(rawAdjustDelta);
        if (currentStamps < 1) {
          throw new StampValidationError(
            lang === "fr"
              ? "Impossible de retirer un tampon : le solde actuel est insuffisant."
              : lang === "es"
              ? "No se puede restar un sello: el saldo actual es insuficiente."
              : "لا يمكن خصم ختم لأن الرصيد الحالي أقل من ختم واحد.",
            400
          );
        }
        if (deductCount > currentStamps) {
          throw new StampValidationError(
            lang === "fr"
              ? `Impossible de retirer ${deductCount} tampons : solde actuel (${formatStamps(currentStamps)}).`
              : lang === "es"
              ? `No se pueden restar ${deductCount} sellos: saldo actual (${formatStamps(currentStamps)}).`
              : `لا يمكن خصم ${deductCount} أختام لأن الرصيد الحالي هو (${formatStamps(currentStamps)}).`,
            400
          );
        }

        const nextStamps = Math.max(0, roundStamps(currentStamps - deductCount));

        const updatedCustomer = await tx.customer.update({
          where: { id: lockedCustomer.id },
          data: {
            stamps: nextStamps,
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "STAMP_ADJUSTED",
            stampsDelta: -deductCount,
            staffName: resolvedStaffName,
            branchName: resolvedBranchName,
            note: `تصحيح الرصيد: خصم ${deductCount} ${deductCount === 1 ? "ختم" : "أختام"}`,
            createdAt: now,
          },
        });

        const notification = await tx.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "STAMP",
            title: merchant.name,
            body: `تم تعديل رصيد الأختام (-${deductCount}). رصيدك الحالي: ${formatStamps(nextStamps)}/${merchant.stampsRequired}.`,
            createdAt: now,
          },
        });

        return {
          kind: "STAMP_ADJUST" as const,
          updatedCustomer,
          transaction,
          notification,
          deductCount,
          referrerPush: null,
        };
      }

      // Action 5: ADD STAMP (Default, computed from fresh lockedCustomer!)
      const isFirstActivation = lockedCustomer.isActivated === false;
      const totalStampsAdded = rawStampCount;
      const maxRolloverCap = roundStamps(merchant.stampsRequired + 0.5);
      const nextStamps = merchant.allowMultiStamps
        ? isFirstActivation
          ? totalStampsAdded
          : roundStamps((lockedCustomer.stamps || 0) + totalStampsAdded)
        : isFirstActivation
        ? 1
        : Math.min(maxRolloverCap, roundStamps((lockedCustomer.stamps || 0) + totalStampsAdded));
      const isRewardUnlocked = nextStamps >= merchant.stampsRequired;
      const stampsLeft = Math.max(0, roundStamps(merchant.stampsRequired - nextStamps));

      const updatedCustomer = await tx.customer.update({
        where: { id: lockedCustomer.id },
        data: {
          stamps: nextStamps,
          totalVisits: { increment: 1 },
          isVip: isVipCustomer,
          isActivated: true,
          lastVisitAt: now,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          merchantId: merchant.id,
          customerId: lockedCustomer.id,
          type: "STAMP_ADDED",
          stampsDelta: totalStampsAdded,
          staffName: resolvedStaffName,
          branchName: resolvedBranchName,
          note:
            totalStampsAdded > 1
              ? isFirstActivation
                ? `تفعيل البطاقة + إضافة ${totalStampsAdded} أختام ☕️🎁`
                : `إضافة ${totalStampsAdded} أختام دفعة واحدة ☕️`
              : isFirstActivation
              ? "تفعيل البطاقة واستلام خِتم الزيارة الأول ☕️🎁"
              : "ختم زيارة جديد ☕️",
          createdAt: now,
        },
      });

      const notification = await tx.notification.create({
        data: {
          merchantId: merchant.id,
          customerId: lockedCustomer.id,
          type: isRewardUnlocked ? "REWARD" : "STAMP",
          title: merchant.name,
          body: isFirstActivation
            ? isRewardUnlocked
              ? `🎉 مبروك! تم تفعيل بطاقتك واكتملت أختامك! مكافأة ${merchant.rewardName} جاهزة للاستلام.`
              : totalStampsAdded > 1
              ? `🎉 أهلاً بك! تم تفعيل بطاقتك وإضافة ${totalStampsAdded} أختام! متبقي لديك ${formatStamps(stampsLeft)} أختام للحصول على ${merchant.rewardName}.`
              : `🎉 أهلاً بك! تم تفعيل بطاقتك وإضافة خِتمك الأول! متبقي لديك ${formatStamps(stampsLeft)} أختام للحصول على ${merchant.rewardName}.`
            : isRewardUnlocked
            ? `🎉 مبروك! اكتملت أختامك! مكافأة ${merchant.rewardName} جاهزة للاستلام.`
            : totalStampsAdded > 1
            ? `تمت إضافة ${totalStampsAdded} أختام جديدة! متبقي لديك ${formatStamps(stampsLeft)} أختام للحصول على ${merchant.rewardName}.`
            : `تمت إضافة ختم جديد! متبقي لديك ${formatStamps(stampsLeft)} أختام للحصول على ${merchant.rewardName}.`,
          createdAt: now,
        },
      });

      await tx.pointUsage.create({
        data: {
          merchantId: merchant.id,
          points: 1,
          source: "STAMP",
          billingMonth,
        },
      });

      if (willBecomeVip) {
        await tx.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "REWARD",
            title: "👑 ترقية لفئة VIP الذهبية!",
            body: `👑 تهانينا ${lockedCustomer.name}! لقد تمت ترقية بطاقتك إلى فئة VIP الذهبية مع مزايا ومكافآت مضاعفة!`,
            createdAt: new Date(now.getTime() + 500),
          },
        });
      }

      if (isRewardUnlocked && canSendReview) {
        await tx.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "REVIEW",
            title: `هل أعجبتك الخدمة في ${merchant.name}؟ ⭐`,
            body: "شاركنا تقييمك بـ 5 نجوم على Google Maps وساعد الآخرين على اكتشافنا!",
            actionUrl: branchReviewUrl,
            createdAt: new Date(now.getTime() + 1000),
          },
        });
      }

      const referrerPush =
        isFirstActivation && lockedCustomer.referredByCode
          ? await processReferralActivationInTx(tx, lockedCustomer, merchant, now)
          : null;

      return {
        kind: "STAMP" as const,
        updatedCustomer,
        transaction,
        notification,
        totalStampsAdded,
        isFirstActivation,
        isRewardUnlocked,
        referrerPush,
      };
    });

    // =========================================================================
    // Strictly AFTER transaction commits: dispatch async Apple & Google Wallet pushes
    // =========================================================================
    pushGoogleWalletUpdate(
      txOutcome.updatedCustomer,
      merchant,
      merchant.name,
      txOutcome.notification.body
    ).catch((err) => console.warn("[GoogleWallet] push error:", err));

    if (txOutcome.updatedCustomer.applePushToken) {
      sendApplePassUpdate(txOutcome.updatedCustomer.applePushToken).catch((err) =>
        console.warn("[AppleWallet] push error:", err)
      );
    }

    if (txOutcome.referrerPush) {
      const { updatedReferrer, title: refTitle, body: refBody } = txOutcome.referrerPush;
      if (updatedReferrer.applePushToken) {
        sendApplePassUpdate(updatedReferrer.applePushToken).catch((err) =>
          console.warn("[AppleWallet] Push error to referrer:", err)
        );
      }
      pushGoogleWalletUpdate(updatedReferrer, merchant, refTitle, refBody).catch((err) =>
        console.warn("[GoogleWallet] Push error to referrer:", err)
      );
    }

    if (txOutcome.kind === "CASHBACK_EARN") {
      const { earned, bill, isFirstActivation, effectiveCashbackRate } = txOutcome;
      const earnMsg = isFirstActivation
        ? lang === "fr"
          ? `🎉 Carte de ${txOutcome.updatedCustomer.name} activée avec le cashback de première visite (+${earned} ${currency}) !`
          : lang === "es"
          ? `¡🎉 Tarjeta de ${txOutcome.updatedCustomer.name} activada con el cashback de primera visita (+${earned} ${currency})!`
          : `🎉 تم تفعيل بطاقة ${txOutcome.updatedCustomer.name} وإضافة كاش باك زيارتك الأولى (+${earned} ${currency}) بنجاح!`
        : lang === "fr"
        ? `+${earned} ${currency} (${effectiveCashbackRate}%) crédités à ${txOutcome.updatedCustomer.name} avec succès !`
        : lang === "es"
        ? `¡+${earned} ${currency} (${effectiveCashbackRate}%) acreditados a ${txOutcome.updatedCustomer.name} con éxito!`
        : `تمت إضافة +${earned} ${currency} (${effectiveCashbackRate}%) لـ ${txOutcome.updatedCustomer.name} بنجاح!`;

      return NextResponse.json({
        success: true,
        action: "CASHBACK_EARN",
        message: earnMsg,
        earned,
        bill,
        customer: txOutcome.updatedCustomer,
        transaction: txOutcome.transaction,
        notification: txOutcome.notification,
        remainingCredits: merchant.credits,
      });
    }

    if (txOutcome.kind === "CASHBACK_REDEEM") {
      const { toRedeem, remainingBal } = txOutcome;
      const redeemCashbackMsg =
        lang === "fr"
          ? `${toRedeem} ${currency} déduits du solde de ${txOutcome.updatedCustomer.name} avec succès. Solde restant : ${remainingBal} ${currency}.`
          : lang === "es"
          ? `${toRedeem} ${currency} descontados del saldo de ${txOutcome.updatedCustomer.name} con éxito. Saldo restante: ${remainingBal} ${currency}.`
          : `تم خصم ${toRedeem} ${currency} من رصيد ${txOutcome.updatedCustomer.name} بنجاح. الرصيد المتبقي: ${remainingBal} ${currency}.`;

      return NextResponse.json({
        success: true,
        action: "CASHBACK_REDEEM",
        message: redeemCashbackMsg,
        redeemed: toRedeem,
        customer: txOutcome.updatedCustomer,
        transaction: txOutcome.transaction,
        notification: txOutcome.notification,
        remainingCredits: merchant.credits,
      });
    }

    if (txOutcome.kind === "REDEEM") {
      const localizedReward = getLocalizedRewardName(merchant.rewardName, lang);
      const redeemStampMsg =
        lang === "fr"
          ? `Félicitations ! Récompense (${localizedReward}) remise à ${txOutcome.updatedCustomer.name} avec succès 🎁`
          : lang === "es"
          ? `¡Felicidades! Recompensa (${localizedReward}) entregada a ${txOutcome.updatedCustomer.name} con éxito 🎁`
          : `مبروك! تم تسليم المكافأة (${merchant.rewardName}) لـ ${txOutcome.updatedCustomer.name} بنجاح 🎁`;

      return NextResponse.json({
        success: true,
        action: "REDEEM",
        message: redeemStampMsg,
        customer: txOutcome.updatedCustomer,
        transaction: txOutcome.transaction,
        notification: txOutcome.notification,
        remainingCredits: merchant.credits,
      });
    }

    if (txOutcome.kind === "STAMP_ADJUST") {
      const formattedAdjustedStamps = formatStamps(txOutcome.updatedCustomer.stamps);
      const adjustMsg =
        lang === "fr"
          ? `${txOutcome.deductCount} tampon(s) retiré(s) pour ${txOutcome.updatedCustomer.name} (${formattedAdjustedStamps}/${merchant.stampsRequired}).`
          : lang === "es"
          ? `Se restaron ${txOutcome.deductCount} sello(s) a ${txOutcome.updatedCustomer.name} (${formattedAdjustedStamps}/${merchant.stampsRequired}).`
          : `تم خصم ${txOutcome.deductCount} ${txOutcome.deductCount === 1 ? "ختم" : "أختام"} من رصيد ${txOutcome.updatedCustomer.name} (${formattedAdjustedStamps}/${merchant.stampsRequired}).`;

      return NextResponse.json({
        success: true,
        action: "STAMP_ADJUST",
        deductCount: txOutcome.deductCount,
        message: adjustMsg,
        customer: txOutcome.updatedCustomer,
        transaction: txOutcome.transaction,
        notification: txOutcome.notification,
        remainingCredits: merchant.credits,
      });
    }

    // STAMP response
    const formattedUpdatedStamps = formatStamps(txOutcome.updatedCustomer.stamps);
    const localizedStampReward = getLocalizedRewardName(merchant.rewardName, lang);
    const addedCount = txOutcome.totalStampsAdded;
    let stampMsg = txOutcome.isFirstActivation
      ? addedCount > 1
        ? `🎉 تم تفعيل بطاقة ${txOutcome.updatedCustomer.name} وإضافة ${addedCount} أختام بنجاح (${formattedUpdatedStamps}/${merchant.stampsRequired})!`
        : `🎉 تم تفعيل بطاقة ${txOutcome.updatedCustomer.name} وإضافة الختم الأول بنجاح (${formattedUpdatedStamps}/${merchant.stampsRequired})!`
      : txOutcome.isRewardUnlocked
      ? `🎉 ممتاز! ${txOutcome.updatedCustomer.name} جمع كافة الأختام (${formattedUpdatedStamps}/${merchant.stampsRequired}) والمكافأة جاهزة!`
      : addedCount > 1
      ? `تمت إضافة ${addedCount} أختام لـ ${txOutcome.updatedCustomer.name} بنجاح (${formattedUpdatedStamps}/${merchant.stampsRequired}).`
      : `تمت إضافة ختم جديد لـ ${txOutcome.updatedCustomer.name} بنجاح (${formattedUpdatedStamps}/${merchant.stampsRequired}).`;

    if (lang === "fr") {
      stampMsg = txOutcome.isFirstActivation
        ? addedCount > 1
          ? `🎉 Carte de ${txOutcome.updatedCustomer.name} activée avec ${addedCount} tampons (${formattedUpdatedStamps}/${merchant.stampsRequired}) !`
          : `🎉 Carte de ${txOutcome.updatedCustomer.name} activée avec le premier tampon (${formattedUpdatedStamps}/${merchant.stampsRequired}) !`
        : txOutcome.isRewardUnlocked
        ? `🎉 Excellent ! ${txOutcome.updatedCustomer.name} a complété tous les tampons (${formattedUpdatedStamps}/${merchant.stampsRequired}) et la récompense (${localizedStampReward}) est prête !`
        : addedCount > 1
        ? `${addedCount} tampons ajoutés pour ${txOutcome.updatedCustomer.name} avec succès (${formattedUpdatedStamps}/${merchant.stampsRequired}).`
        : `Nouveau tampon ajouté pour ${txOutcome.updatedCustomer.name} avec succès (${formattedUpdatedStamps}/${merchant.stampsRequired}).`;
    } else if (lang === "es") {
      stampMsg = txOutcome.isFirstActivation
        ? addedCount > 1
          ? `🎉 ¡Tarjeta de ${txOutcome.updatedCustomer.name} activada con ${addedCount} sellos (${formattedUpdatedStamps}/${merchant.stampsRequired})!`
          : `🎉 ¡Tarjeta de ${txOutcome.updatedCustomer.name} activada con el primer sello (${formattedUpdatedStamps}/${merchant.stampsRequired})!`
        : txOutcome.isRewardUnlocked
        ? `🎉 ¡Excelente! ${txOutcome.updatedCustomer.name} ha completado todos los sellos (${formattedUpdatedStamps}/${merchant.stampsRequired}) y el premio (${localizedStampReward}) está listo.`
        : addedCount > 1
        ? `Se añadieron ${addedCount} sellos para ${txOutcome.updatedCustomer.name} con éxito (${formattedUpdatedStamps}/${merchant.stampsRequired}).`
        : `Nuevo sello añadido para ${txOutcome.updatedCustomer.name} con éxito (${formattedUpdatedStamps}/${merchant.stampsRequired}).`;
    }

    return NextResponse.json({
      success: true,
      action: "STAMP",
      isRewardUnlocked: txOutcome.isRewardUnlocked,
      message: stampMsg,
      customer: txOutcome.updatedCustomer,
      transaction: txOutcome.transaction,
      notification: txOutcome.notification,
      remainingCredits: merchant.credits,
    });
  } catch (error: unknown) {
    if (error instanceof CooldownActiveError) {
      return NextResponse.json(error.payload, { status: 429 });
    }
    if (error instanceof StampValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error processing stamp/cashback action:", error);
    const msg = error instanceof Error ? error.message : "تعذر تسجيل العملية";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

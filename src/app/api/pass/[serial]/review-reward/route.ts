import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { roundStamps, formatStamps } from "@/lib/utils";
import { isPhysicalCounterVisit } from "@/lib/metrics";
import { hasRadarAndReviewsFeature } from "@/lib/pricing";
import { pushGoogleWalletUpdate } from "@/lib/google-wallet";
import { sendApplePassUpdate } from "@/lib/apple-wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

class AlreadyClaimedError extends Error {
  constructor() {
    super("ALREADY_CLAIMED");
    this.name = "AlreadyClaimedError";
  }
}

/**
 * POST /api/pass/[serial]/review-reward
 * Grants a strict one-time reward per customer card when leaving a 5-star Google Maps review:
 * - STAMPS card: +0.5 stamp (rollover capped at stampsRequired + 0.5).
 * - CASHBACK card: smallest positive physical CASHBACK_EARNED amount ever added to the card.
 * Isolated from physical counter visit counts and the 30-minute cashier cooldown.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const body = (await req.json().catch(() => ({}))) as { lang?: string };
    const lang = body.lang === "fr" || body.lang === "es" ? body.lang : "ar";

    const customer = await prisma.customer.findUnique({
      where: { passSerial: params.serial },
      include: { merchant: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const { merchant } = customer;

    if (customer.isActivated === false) {
      const msg =
        lang === "fr"
          ? "Veuillez activer votre carte en magasin avant de réclamer cette récompense."
          : lang === "es"
          ? "Por favor, activa tu tarjeta en tienda antes de reclamar esta recompensa."
          : "يرجى تفعيل بطاقتك في المتجر أولاً قبل استلام مكافأة التقييم.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    if (!hasRadarAndReviewsFeature(merchant.plan) || !merchant.autoReview) {
      const msg =
        lang === "fr"
          ? "Les récompenses d'avis Google Maps ne sont pas activées pour ce commerce."
          : lang === "es"
          ? "Las recompensas por reseña de Google Maps no están activadas en este comercio."
          : "مكافأة تقييم Google Maps غير مفعلة لهذا المتجر.";
      return NextResponse.json({ error: msg }, { status: 403 });
    }

    if (customer.hasClaimedReviewReward) {
      const msg =
        lang === "fr"
          ? "Récompense d'avis déjà reçue ✓"
          : lang === "es"
          ? "Recompensa por reseña ya recibida ✓"
          : "تم استلام مكافأة التقييم مسبقاً ✓";
      return NextResponse.json({ error: msg, alreadyClaimed: true }, { status: 409 });
    }

    const currency = merchant.currency || "DH";
    const now = new Date();

    const txResult = await prisma.$transaction(async (tx) => {
      // Exclusive InnoDB row lock prevents concurrent double-clicks / dual tabs from double-claiming
      await tx.$queryRaw`SELECT id FROM \`Customer\` WHERE id = ${customer.id} FOR UPDATE`;

      const lockedCustomer = await tx.customer.findUnique({
        where: { id: customer.id },
      });

      if (
        !lockedCustomer ||
        lockedCustomer.hasClaimedReviewReward ||
        lockedCustomer.isActivated === false
      ) {
        throw new AlreadyClaimedError();
      }

      const lockedIsCashback = lockedCustomer.loyaltyType === "CASHBACK";

      if (lockedIsCashback) {
        // Find lowest positive physical CASHBACK_EARNED amount ever credited to this card since creation
        const cashbackHistory = await tx.transaction.findMany({
          where: {
            customerId: lockedCustomer.id,
            type: "CASHBACK_EARNED",
            cashbackDelta: { gt: 0 },
            staffName: { not: "النظام" },
          },
          orderBy: { cashbackDelta: "asc" },
          take: 20,
          select: {
            cashbackDelta: true,
            type: true,
            staffName: true,
            note: true,
          },
        });

        const lowestPhysical = cashbackHistory.find((entry) =>
          isPhysicalCounterVisit(entry)
        );

        let rewardAmount = 0;
        if (
          lowestPhysical &&
          typeof lowestPhysical.cashbackDelta === "number" &&
          lowestPhysical.cashbackDelta > 0
        ) {
          rewardAmount = Number(lowestPhysical.cashbackDelta.toFixed(2));
        } else if (merchant.welcomeCashback && merchant.welcomeCashback > 0) {
          rewardAmount = Number(merchant.welcomeCashback.toFixed(2));
        } else if (merchant.referralBonus && merchant.referralBonus > 0) {
          rewardAmount = Number(merchant.referralBonus.toFixed(2));
        } else {
          rewardAmount = 5;
        }

        const updatedCustomer = await tx.customer.update({
          where: { id: lockedCustomer.id },
          data: {
            hasClaimedReviewReward: true,
            cashbackBalance: { increment: rewardAmount },
            totalCashbackEarned: { increment: rewardAmount },
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "REVIEW_REWARD",
            stampsDelta: 0,
            cashbackDelta: rewardAmount,
            staffName: "النظام",
            note: `مكافأة تقييم Google Maps ⭐ (+${rewardAmount} ${currency})`,
            createdAt: now,
          },
        });

        const notificationBody =
          lang === "fr"
            ? `⭐ Merci pour votre avis 5 étoiles ! +${rewardAmount} ${currency} ajoutés à votre portefeuille cashback.`
            : lang === "es"
            ? `⭐ ¡Gracias por tu reseña de 5 estrellas! Se han añadido +${rewardAmount} ${currency} a tu saldo cashback.`
            : `⭐ شكراً على تقييمك 5 نجوم! تمت إضافة +${rewardAmount} ${currency} إلى محفظة الكاش باك الخاصة بك.`;

        const notification = await tx.notification.create({
          data: {
            merchantId: merchant.id,
            customerId: lockedCustomer.id,
            type: "CASHBACK",
            title: merchant.name,
            body: notificationBody,
            createdAt: now,
          },
        });

        return {
          rewardType: "CASHBACK" as const,
          updatedCustomer,
          transaction,
          notification,
          rewardValue: rewardAmount,
        };
      }

      // STAMPS Card: +0.5 stamp with rollover cap stampsRequired + 0.5
      const reviewStampBonus = 0.5;
      const safeRequired = Math.max(1, merchant.stampsRequired || 5);
      const maxRolloverCap = roundStamps(safeRequired + 0.5);
      const nextStamps = Math.min(
        maxRolloverCap,
        roundStamps((lockedCustomer.stamps || 0) + reviewStampBonus)
      );
      const actualDelta = Math.max(
        0,
        roundStamps(nextStamps - (lockedCustomer.stamps || 0))
      );

      const updatedCustomer = await tx.customer.update({
        where: { id: lockedCustomer.id },
        data: {
          hasClaimedReviewReward: true,
          stamps: nextStamps,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          merchantId: merchant.id,
          customerId: lockedCustomer.id,
          type: "REVIEW_REWARD",
          stampsDelta: actualDelta > 0 ? actualDelta : reviewStampBonus,
          staffName: "النظام",
          note: "مكافأة تقييم Google Maps ⭐ (+0.5 ختم)",
          createdAt: now,
        },
      });

      const formattedNextStamps = formatStamps(nextStamps);
      const notificationBody =
        lang === "fr"
          ? `⭐ Merci pour votre avis 5 étoiles ! +0.5 tampon ajouté à votre carte (${formattedNextStamps}/${safeRequired}).`
          : lang === "es"
          ? `⭐ ¡Gracias por tu reseña de 5 estrellas! Se ha añadido +0.5 sello a tu tarjeta (${formattedNextStamps}/${safeRequired}).`
          : `⭐ شكراً على تقييمك 5 نجوم! تمت إضافة +0.5 ختم (نصف ختم) إلى بطاقتك (${formattedNextStamps}/${safeRequired}).`;

      const notification = await tx.notification.create({
        data: {
          merchantId: merchant.id,
          customerId: lockedCustomer.id,
          type: nextStamps >= safeRequired ? "REWARD" : "STAMP",
          title: merchant.name,
          body: notificationBody,
          createdAt: now,
        },
      });

      return {
        rewardType: "STAMPS" as const,
        updatedCustomer,
        transaction,
        notification,
        rewardValue: reviewStampBonus,
      };
    });

    // Asynchronously push real-time wallet updates strictly AFTER transaction commits
    pushGoogleWalletUpdate(
      txResult.updatedCustomer,
      merchant,
      merchant.name,
      txResult.notification.body
    ).catch((err) => console.warn("[GoogleWallet] review reward push error:", err));

    if (txResult.updatedCustomer.applePushToken) {
      sendApplePassUpdate(txResult.updatedCustomer.applePushToken).catch((err) =>
        console.warn("[AppleWallet] review reward push error:", err)
      );
    }

    return NextResponse.json({
      success: true,
      rewardType: txResult.rewardType,
      rewardValue: txResult.rewardValue,
      message: txResult.notification.body,
      customer: {
        ...txResult.updatedCustomer,
        createdAt: txResult.updatedCustomer.createdAt.toISOString(),
        lastVisitAt: txResult.updatedCustomer.lastVisitAt.toISOString(),
        pinLockedUntil: txResult.updatedCustomer.pinLockedUntil
          ? txResult.updatedCustomer.pinLockedUntil.toISOString()
          : null,
      },
      transaction: txResult.transaction,
      notification: txResult.notification,
    });
  } catch (error: unknown) {
    if (error instanceof AlreadyClaimedError) {
      return NextResponse.json(
        {
          error: "تم استلام مكافأة التقييم مسبقاً ✓",
          alreadyClaimed: true,
        },
        { status: 409 }
      );
    }
    console.error("[ReviewReward] POST error:", error);
    return NextResponse.json(
      { error: "تعذر تسجيل مكافأة التقييم" },
      { status: 500 }
    );
  }
}

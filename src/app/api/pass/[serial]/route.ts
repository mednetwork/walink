import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLocalizedRewardName } from "@/lib/i18n/rewards";
import { Locale } from "@/lib/i18n/translations";

export async function GET(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serial },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            slug: true,
            niche: true,
            city: true,
            phone: true,
            logoIcon: true,
            primaryColor: true,
            bgGradient: true,
            stampsRequired: true,
            rewardName: true,
            customerPrefix: true,
            latitude: true,
            longitude: true,
            radarMessage: true,
            googleMapsUrl: true,
            autoReview: true,
            autoRadar: true,
            autoWinback: true,
            loyaltyMode: true,
            cashbackRate: true,
            welcomeCashback: true,
            currency: true,
          },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "بطاقة الوفاء غير موجودة" },
        { status: 404 }
      );
    }

    // Fetch latest campaign & customer notifications in parallel
    const [latestCampaign, notifications] = await Promise.all([
      prisma.campaign.findFirst({
        where: {
          merchantId: customer.merchantId,
          createdAt: { gte: customer.createdAt },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.findMany({
        where: {
          merchantId: customer.merchantId,
          OR: [
            { customerId: customer.id },
            { customerId: null, createdAt: { gte: customer.createdAt } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const langParam = req.nextUrl.searchParams.get("lang");
    const lang: Locale =
      langParam === "fr" || langParam === "es" ? langParam : "ar";
    const localizedReward = getLocalizedRewardName(
      customer.merchant.rewardName,
      lang
    );

    const localizedNotifications = notifications.map((n) => {
      if (lang === "ar") return n;

      let title = n.title;
      let body = n.body;

      if (n.type === "STAMP") {
        title =
          lang === "fr"
            ? "Nouveau tampon ajouté ! 🎉"
            : "¡Nuevo sello añadido! 🎉";
        body =
          lang === "fr"
            ? `Merci de votre visite ! Présentez votre carte pour débloquer ${localizedReward}.`
            : `¡Gracias por tu visita! Muestra tu tarjeta para desbloquear ${localizedReward}.`;
      } else if (n.type === "REWARD") {
        title =
          lang === "fr"
            ? "Félicitations pour votre récompense ! 🎁"
            : "¡Felicidades por tu recompensa! 🎁";
        body =
          lang === "fr"
            ? `Votre récompense (${localizedReward}) est prête chez ${customer.merchant.name} !`
            : `¡Tu recompensa (${localizedReward}) está lista en ${customer.merchant.name}!`;
      } else if (n.type === "REVIEW") {
        title =
          lang === "fr"
            ? `Votre avis compte pour ${customer.merchant.name} ⭐`
            : `Tu opinión importa para ${customer.merchant.name} ⭐`;
        body =
          lang === "fr"
            ? "Merci pour votre visite ! Déposez un avis 5 étoiles sur Google Maps."
            : "¡Gracias por tu visita! Deja una reseña de 5 estrellas en Google Maps.";
      } else if (n.type === "WINBACK") {
        title = lang === "fr" ? "Vous nous manquez ! 🎁" : "¡Te extrañamos! 🎁";
        body =
          lang === "fr"
            ? `Passez chez ${customer.merchant.name} cette semaine et profitez d'un tampon cadeau 🎁`
            : `¡Visita ${customer.merchant.name} esta semana y recibe un sello de regalo 🎁!`;
      } else if (n.type === "NEAR_REWARD") {
        title =
          lang === "fr"
            ? "Plus qu'un seul tampon ! ☕"
            : "¡Solo te falta un sello! ☕";
        body =
          lang === "fr"
            ? `Plus qu'un seul tampon pour obtenir ${localizedReward} chez ${customer.merchant.name} !`
            : `¡Solo te falta un sello para conseguir ${localizedReward} en ${customer.merchant.name}!`;
      } else if (n.type === "CASHBACK") {
        title =
          lang === "fr"
            ? "Mise à jour du Cashback ! 💰"
            : "¡Actualización de Cashback! 💰";
        body = n.body;
      } else if (n.type === "RADAR") {
        title = customer.merchant.name;
        body =
          lang === "fr"
            ? customer.merchant.radarMessage ||
              "Vous êtes à proximité ! Passez nous rendre visite."
            : customer.merchant.radarMessage ||
              "¡Estás cerca! Ven a visitarnos.";
      }

      return {
        ...n,
        title,
        body,
      };
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        memberCode: customer.memberCode,
        passSerial: customer.passSerial,
        loyaltyType: customer.loyaltyType,
        stamps: customer.stamps,
        cashbackBalance: customer.cashbackBalance,
        totalCashbackEarned: customer.totalCashbackEarned,
        totalVisits: customer.totalVisits,
        rewardsRedeemed: customer.rewardsRedeemed,
        isVip: customer.isVip,
        isActivated: customer.isActivated ?? true,
        referredByCode: customer.referredByCode,
        referralsCount: customer.referralsCount,
        lastVisitAt: customer.lastVisitAt,
        walletType: customer.walletType,
        pushSubscription: customer.pushSubscription,
      },
      merchant: customer.merchant,
      transactions: customer.transactions,
      latestCampaign,
      notifications: localizedNotifications,
    });
  } catch (error: unknown) {
    console.error("Error fetching pass data:", error);
    const msg = error instanceof Error ? error.message : "تعذر جلب بيانات البطاقة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


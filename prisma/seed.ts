import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Walink Morocco database seeding...");

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.merchant.deleteMany();

  const now = new Date();
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };
  const hoursAgo = (hours: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() - hours);
    return d;
  };

  // 1. Seed Café Atlas (Casablanca)
  const cafeAtlas = await prisma.merchant.create({
    data: {
      slug: "cafe-atlas",
      name: "Café Atlas",
      niche: "cafe",
      city: "الدار البيضاء",
      phone: "0661123456",
      pinCode: "1234",
      logoIcon: "coffee",
      primaryColor: "#5b3519",
      bgGradient: "linear-gradient(150deg,#6b4226 0%,#3d2414 100%)",
      stampsRequired: 5,
      rewardName: "قهوة مجانية",
      customerPrefix: "عزيزي",
      loyaltyMode: "BOTH",
      cashbackRate: 10,
      welcomeCashback: 5,
      minCashbackRedeem: 0,
      currency: "DH",
      latitude: 33.5731,
      longitude: -7.5898,
      radarMessage: "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة لجمع الأختام والكاش باك.",
      googleMapsUrl: "https://maps.google.com/?q=cafe+atlas+casablanca",
      plan: "GROWTH",
      credits: 1000,
      autoWinback: true,
      autoReview: true,
      autoRadar: true,
      autoNearReward: false,
      isActive: true,
    },
  });

  console.log(`✅ Created Merchant: ${cafeAtlas.name} (${cafeAtlas.slug})`);

  // Seed 6 Moroccan Customers for Café Atlas (Both STAMPS and CASHBACK)
  const customersData = [
    {
      name: "ليلى التازي",
      phone: "0661998877",
      passSerial: "pass-atlas-4821",
      memberCode: "4821",
      loyaltyType: "STAMPS",
      stamps: 4,
      cashbackBalance: 0,
      totalCashbackEarned: 0,
      totalSpent: 400,
      totalVisits: 16,
      rewardsRedeemed: 3,
      lastVisitAt: hoursAgo(2),
      walletType: "APPLE",
    },
    {
      name: "سارة الفاسي",
      phone: "0662334455",
      passSerial: "pass-atlas-7193",
      memberCode: "7193",
      loyaltyType: "STAMPS",
      stamps: 2,
      cashbackBalance: 0,
      totalCashbackEarned: 0,
      totalSpent: 250,
      totalVisits: 14,
      rewardsRedeemed: 2,
      lastVisitAt: daysAgo(2),
      walletType: "APPLE",
    },
    {
      name: "يوسف بنجلون",
      phone: "0663112233",
      passSerial: "pass-atlas-3058",
      memberCode: "3058",
      loyaltyType: "STAMPS",
      stamps: 3,
      cashbackBalance: 0,
      totalCashbackEarned: 0,
      totalSpent: 180,
      totalVisits: 9,
      rewardsRedeemed: 1,
      lastVisitAt: daysAgo(1),
      walletType: "GOOGLE",
    },
    {
      name: "نادية الإدريسي",
      phone: "0664556677",
      passSerial: "pass-atlas-8912",
      memberCode: "8912",
      loyaltyType: "STAMPS",
      stamps: 1,
      cashbackBalance: 0,
      totalCashbackEarned: 0,
      totalSpent: 90,
      totalVisits: 5,
      rewardsRedeemed: 0,
      lastVisitAt: daysAgo(6),
      walletType: "WEBPASS",
    },
    {
      name: "خديجة العلمي",
      phone: "0665778899",
      passSerial: "pass-atlas-6240",
      memberCode: "6240",
      loyaltyType: "CASHBACK",
      stamps: 0,
      cashbackBalance: 35.50,
      totalCashbackEarned: 55.50,
      totalSpent: 555,
      totalVisits: 11,
      rewardsRedeemed: 1,
      lastVisitAt: daysAgo(3),
      walletType: "APPLE",
    },
    {
      name: "مهدي الصقلي",
      phone: "0666224466",
      passSerial: "pass-atlas-1537",
      memberCode: "1537",
      loyaltyType: "CASHBACK",
      stamps: 0,
      cashbackBalance: 70.00,
      totalCashbackEarned: 120.00,
      totalSpent: 1200,
      totalVisits: 18,
      rewardsRedeemed: 2,
      lastVisitAt: daysAgo(1),
      walletType: "WEBPASS",
    },
  ];

  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        merchantId: cafeAtlas.id,
        ...c,
      },
    });

    if (c.loyaltyType === "STAMPS") {
      // Create initial card transaction
      await prisma.transaction.create({
        data: {
          merchantId: cafeAtlas.id,
          customerId: customer.id,
          type: "CARD_CREATED",
          stampsDelta: 1,
          note: "تفعيل بطاقة الأختام الرقمية",
          createdAt: daysAgo(30),
        },
      });

      // Create recent visit stamp transactions
      await prisma.transaction.create({
        data: {
          merchantId: cafeAtlas.id,
          customerId: customer.id,
          type: "STAMP_ADDED",
          stampsDelta: 1,
          note: "إضافة ختم - زيارة قهوة الصباح",
          createdAt: c.lastVisitAt,
        },
      });

      if (c.rewardsRedeemed > 0) {
        await prisma.transaction.create({
          data: {
            merchantId: cafeAtlas.id,
            customerId: customer.id,
            type: "REWARD_REDEEMED",
            stampsDelta: -cafeAtlas.stampsRequired,
            note: `استفادة من مكافأة: ${cafeAtlas.rewardName}`,
            createdAt: daysAgo(10),
          },
        });
      }
    } else {
      // Cashback customer transactions
      await prisma.transaction.create({
        data: {
          merchantId: cafeAtlas.id,
          customerId: customer.id,
          type: "CARD_CREATED",
          cashbackDelta: 5.0,
          note: "تفعيل بطاقة كاش باك + هدية ترحيبية 5 دراهم",
          createdAt: daysAgo(30),
        },
      });

      await prisma.transaction.create({
        data: {
          merchantId: cafeAtlas.id,
          customerId: customer.id,
          type: "CASHBACK_EARNED",
          billAmount: 150.0,
          cashbackDelta: 15.0,
          note: "استرداد كاش باك 10% على فاتورة 150 درهم",
          createdAt: c.lastVisitAt,
        },
      });

      if (c.rewardsRedeemed > 0) {
        await prisma.transaction.create({
          data: {
            merchantId: cafeAtlas.id,
            customerId: customer.id,
            type: "CASHBACK_REDEEMED",
            cashbackDelta: -20.0,
            note: "خصم 20 درهم من رصيد الكاش باك",
            createdAt: daysAgo(5),
          },
        });
      }
    }
  }

  console.log(`✅ Seeded ${customersData.length} customers and transactions for Café Atlas.`);

  // Sample Campaign for Café Atlas
  await prisma.campaign.create({
    data: {
      merchantId: cafeAtlas.id,
      title: "عرض نهاية الأسبوع للعملاء الغائبين",
      message: "اشتقنا لزيارتك في Café Atlas! تفضل بزيارتنا هذا الأسبوع واحصل على ختم مضاعف أو كاش باك إضافي مع قهوتك ☕️",
      audience: "QUIET",
      sentCount: 18,
      returnedCount: 6,
      creditsUsed: 18,
      createdAt: daysAgo(3),
    },
  });

  console.log("✅ Seeded sample marketing campaign.");

  // 2. Seed Barber Anas (Rabat)
  const barberAnas = await prisma.merchant.create({
    data: {
      slug: "barber-anas",
      name: "صالون أنس للحلاقة",
      niche: "barber",
      city: "الرباط",
      phone: "0670112233",
      pinCode: "5678",
      logoIcon: "scissors",
      primaryColor: "#1e3a8a",
      bgGradient: "linear-gradient(150deg,#1e3a8a 0%,#0f172a 100%)",
      stampsRequired: 6,
      rewardName: "حلاقة مجانية",
      customerPrefix: "عزيزي",
      loyaltyMode: "STAMPS",
      cashbackRate: 10,
      welcomeCashback: 0,
      minCashbackRedeem: 0,
      currency: "DH",
      latitude: 34.0209,
      longitude: -6.8416,
      radarMessage: "أنت بالقرب من صالون أنس؟ حان وقت تصفيف شعر أنيق، مرحباً بك!",
      googleMapsUrl: "https://maps.google.com/?q=barber+anas+rabat",
      plan: "STARTER",
      credits: 200,
      autoWinback: true,
      autoReview: true,
      autoRadar: true,
      autoNearReward: false,
      isActive: true,
    },
  });

  console.log(`✅ Created Merchant: ${barberAnas.name} (${barberAnas.slug})`);

  // Seed sample customer for Barber Anas
  const anasCustomer = await prisma.customer.create({
    data: {
      merchantId: barberAnas.id,
      name: "أمين التلمساني",
      phone: "0677889900",
      passSerial: "pass-anas-5512",
      memberCode: "5512",
      loyaltyType: "STAMPS",
      stamps: 3,
      cashbackBalance: 0,
      totalCashbackEarned: 0,
      totalSpent: 150,
      totalVisits: 7,
      rewardsRedeemed: 1,
      lastVisitAt: daysAgo(4),
      walletType: "APPLE",
    },
  });

  await prisma.transaction.create({
    data: {
      merchantId: barberAnas.id,
      customerId: anasCustomer.id,
      type: "STAMP_ADDED",
      stampsDelta: 1,
      note: "ختم حلاقة شعر ولحية",
      createdAt: daysAgo(4),
    },
  });

  console.log("🚀 Walink Morocco seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


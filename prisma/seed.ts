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
      rewardName: "قهوة فابور",
      customerPrefix: "آ السي",
      latitude: 33.5731,
      longitude: -7.5898,
      radarMessage: "راك دايز من حدانا! دوز مرحبا بيك، الكارط ديالك واجدة.",
      googleMapsUrl: "https://maps.google.com/?q=cafe+atlas+casablanca",
      plan: "GROWTH",
      credits: 1000,
      autoWinback: true,
      autoBirthday: true,
      autoReview: true,
      autoRadar: true,
      autoNearReward: false,
      isActive: true,
    },
  });

  console.log(`✅ Created Merchant: ${cafeAtlas.name} (${cafeAtlas.slug})`);

  // Seed 6 Moroccan Customers for Café Atlas
  const customersData = [
    {
      name: "ليلى التازي",
      phone: "0661998877",
      birthday: "1995-04-12",
      passSerial: "pass-atlas-4821",
      memberCode: "4821",
      stamps: 4,
      totalVisits: 16,
      rewardsRedeemed: 3,
      lastVisitAt: hoursAgo(2),
      walletType: "APPLE",
    },
    {
      name: "سارة الفاسي",
      phone: "0662334455",
      birthday: "1998-08-23",
      passSerial: "pass-atlas-7193",
      memberCode: "7193",
      stamps: 2,
      totalVisits: 14,
      rewardsRedeemed: 2,
      lastVisitAt: daysAgo(2),
      walletType: "APPLE",
    },
    {
      name: "يوسف بنجلون",
      phone: "0663112233",
      birthday: "1991-11-05",
      passSerial: "pass-atlas-3058",
      memberCode: "3058",
      stamps: 3,
      totalVisits: 9,
      rewardsRedeemed: 1,
      lastVisitAt: daysAgo(1),
      walletType: "GOOGLE",
    },
    {
      name: "نادية الإدريسي",
      phone: "0664556677",
      birthday: "2000-01-30",
      passSerial: "pass-atlas-8912",
      memberCode: "8912",
      stamps: 1,
      totalVisits: 5,
      rewardsRedeemed: 0,
      lastVisitAt: daysAgo(6),
      walletType: "WEBPASS",
    },
    {
      name: "خديجة العلمي",
      phone: "0665778899",
      birthday: "1993-06-17",
      passSerial: "pass-atlas-6240",
      memberCode: "6240",
      stamps: 4,
      totalVisits: 11,
      rewardsRedeemed: 2,
      lastVisitAt: daysAgo(19), // Inactive / غابر
      walletType: "APPLE",
    },
    {
      name: "مهدي الصقلي",
      phone: "0666224466",
      birthday: "1989-12-09",
      passSerial: "pass-atlas-1537",
      memberCode: "1537",
      stamps: 2,
      totalVisits: 3,
      rewardsRedeemed: 0,
      lastVisitAt: daysAgo(26), // Inactive / غابر
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

    // Create initial card transaction
    await prisma.transaction.create({
      data: {
        merchantId: cafeAtlas.id,
        customerId: customer.id,
        type: "CARD_CREATED",
        stampsDelta: 0,
        note: "تفعيل الكارط الرقمية لأول مرة",
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
        note: "إضافة طابع - زيارة قهوة الصباح",
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
  }

  console.log(`✅ Seeded ${customersData.length} customers and transactions for Café Atlas.`);

  // Sample Campaign for Café Atlas
  await prisma.campaign.create({
    data: {
      merchantId: cafeAtlas.id,
      title: "عرض نهاية الأسبوع للزبائن الغابرين",
      message: "توحشناك في Café Atlas! دوز نهاية هذا الأسبوع وخود طابع مضاعف مع القهوة ديالك ☕️",
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
      rewardName: "حسانة فابور",
      customerPrefix: "آ السي",
      latitude: 34.0209,
      longitude: -6.8416,
      radarMessage: "قريب من صالون أنس؟ واش وقت حسانة جديدة؟ مرحبا بيك!",
      googleMapsUrl: "https://maps.google.com/?q=barber+anas+rabat",
      plan: "STARTER",
      credits: 200,
      autoWinback: true,
      autoBirthday: true,
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
      birthday: "1994-03-15",
      passSerial: "pass-anas-5512",
      memberCode: "5512",
      stamps: 3,
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
      note: "طابع حلاقة شعر ولحية",
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


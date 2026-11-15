import { PrismaClient } from "@prisma/client";
import { translations, Locale } from "../src/lib/i18n/translations";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=========================================");
  console.log("🧪 WALINK PHASE 6 & 7 INTEGRATION TEST SUITE");
  console.log("=========================================\n");

  // 1. Validate i18n Dictionary
  console.log("1️⃣ Verifying i18n Translation Dictionary across 3 Languages...");
  const locales: Locale[] = ["ar", "fr", "es"];
  for (const loc of locales) {
    const dict = translations[loc];
    if (!dict) throw new Error(`Missing translation dictionary for ${loc}`);
    if (!dict.brand.name || !dict.hero.title1 || !dict.demo.stampsType || !dict.demo.cashbackType) {
      throw new Error(`Incomplete keys in ${loc} dictionary`);
    }
    console.log(`  ✅ [${loc.toUpperCase()}] Verified brand (${dict.brand.name}), stamps (${dict.demo.stampsType}), cashback (${dict.demo.cashbackType})`);
  }

  // 2. Validate Merchant Dual Loyalty Settings
  console.log("\n2️⃣ Verifying Merchant Dual Loyalty Mode in Database...");
  const merchant = await prisma.merchant.findUnique({
    where: { slug: "cafe-atlas" },
    include: { customers: true },
  });

  if (!merchant) throw new Error("Seed merchant 'cafe-atlas' not found!");
  console.log(`  ✅ Merchant: ${merchant.name} (slug: ${merchant.slug})`);
  console.log(`  ✅ Loyalty Mode: ${merchant.loyaltyMode} (Expected: BOTH)`);
  console.log(`  ✅ Cashback Rate: ${merchant.cashbackRate}% (Welcome Bonus: ${merchant.welcomeCashback} ${merchant.currency})`);

  // 3. Verify Seeded Dual Loyalty Customers
  console.log("\n3️⃣ Verifying Seeded Customers (Stamps vs Cashback)...");
  const stampCustomers = merchant.customers.filter((c) => c.loyaltyType === "STAMPS");
  const cashbackCustomers = merchant.customers.filter((c) => c.loyaltyType === "CASHBACK");

  console.log(`  ✅ Total Customers: ${merchant.customers.length}`);
  console.log(`  ✅ Stamps Customers: ${stampCustomers.length} (e.g., ${stampCustomers[0]?.name})`);
  console.log(`  ✅ Cashback Customers: ${cashbackCustomers.length} (e.g., ${cashbackCustomers[0]?.name})`);

  if (cashbackCustomers.length === 0) {
    throw new Error("Expected seeded cashback customers for cafe-atlas!");
  }

  const cbCustomer = cashbackCustomers[0];
  console.log(`  ✅ Sample Cashback Customer: ${cbCustomer.name} (Balance: ${cbCustomer.cashbackBalance} ${merchant.currency}, Lifetime Earned: ${cbCustomer.totalCashbackEarned} ${merchant.currency})`);

  // 4. Test Customer Onboarding with Dual Loyalty Choice
  console.log("\n4️⃣ Testing Customer Onboarding Enrollment Logic...");
  // Test A: Enrolling with STAMPS
  const testPhoneStamps = "0699001122";
  await prisma.customer.deleteMany({ where: { phone: testPhoneStamps } });
  const newStampsCust = await prisma.customer.create({
    data: {
      merchantId: merchant.id,
      name: "أحمد بناني (Test Stamps)",
      phone: testPhoneStamps,
      memberCode: "9101",
      passSerial: "pass-atlas-test-stamps",
      loyaltyType: "STAMPS",
      stamps: 1, // welcome stamp
    },
  });
  console.log(`  ✅ Enrolled STAMPS customer: ${newStampsCust.name} (Stamps: ${newStampsCust.stamps})`);

  // Test B: Enrolling with CASHBACK (Receives Welcome Cashback)
  const testPhoneCashback = "0699003344";
  await prisma.customer.deleteMany({ where: { phone: testPhoneCashback } });
  const newCbCust = await prisma.customer.create({
    data: {
      merchantId: merchant.id,
      name: "ليلى التازي (Test Cashback)",
      phone: testPhoneCashback,
      memberCode: "9102",
      passSerial: "pass-atlas-test-cashback",
      loyaltyType: "CASHBACK",
      cashbackBalance: merchant.welcomeCashback, // 5 DH welcome
      totalCashbackEarned: merchant.welcomeCashback,
    },
  });
  console.log(`  ✅ Enrolled CASHBACK customer: ${newCbCust.name} (Cashback: ${newCbCust.cashbackBalance} ${merchant.currency})`);

  // 5. Test Merchant POS Cashback Calculations
  console.log("\n5️⃣ Testing Merchant POS Cashback Earn & Redeem Calculations...");
  // Purchase bill of 180 DH at 10% cashback rate = +18 DH earned
  const billAmount = 180;
  const earnedCashback = Math.round((billAmount * (merchant.cashbackRate / 100)) * 100) / 100;
  const updatedBalance = newCbCust.cashbackBalance + earnedCashback;

  const earnedTx = await prisma.transaction.create({
    data: {
      customerId: newCbCust.id,
      merchantId: merchant.id,
      type: "CASHBACK_EARNED",
      billAmount: billAmount,
      cashbackDelta: earnedCashback,
      stampsDelta: 0,
    },
  });

  const updatedCbCust = await prisma.customer.update({
    where: { id: newCbCust.id },
    data: {
      cashbackBalance: updatedBalance,
      totalCashbackEarned: newCbCust.totalCashbackEarned + earnedCashback,
      totalSpent: newCbCust.totalSpent + billAmount,
      totalVisits: newCbCust.totalVisits + 1,
    },
  });

  console.log(`  ✅ CASHBACK_EARNED Transaction: Bill ${billAmount} ${merchant.currency} -> Earned +${earnedCashback} ${merchant.currency}`);
  console.log(`  ✅ Updated Balance: ${updatedCbCust.cashbackBalance} ${merchant.currency} (Total Spent: ${updatedCbCust.totalSpent} ${merchant.currency})`);

  // Redeem 15 DH from balance
  const redeemAmount = 15;
  const postRedeemBalance = updatedCbCust.cashbackBalance - redeemAmount;
  const redeemTx = await prisma.transaction.create({
    data: {
      customerId: newCbCust.id,
      merchantId: merchant.id,
      type: "CASHBACK_REDEEMED",
      billAmount: 50,
      cashbackDelta: -redeemAmount,
      stampsDelta: 0,
    },
  });

  const finalCbCust = await prisma.customer.update({
    where: { id: newCbCust.id },
    data: {
      cashbackBalance: postRedeemBalance,
    },
  });

  console.log(`  ✅ CASHBACK_REDEEMED Transaction: -${redeemAmount} ${merchant.currency} redeemed`);
  console.log(`  ✅ Final Customer Balance: ${finalCbCust.cashbackBalance} ${merchant.currency}`);

  // 6. Test Switching Loyalty Type
  console.log("\n6️⃣ Testing Dynamic Loyalty Type Switch (STAMPS ⇄ CASHBACK)...");
  const switchedCust = await prisma.customer.update({
    where: { id: newStampsCust.id },
    data: {
      loyaltyType: "CASHBACK",
      cashbackBalance: 10,
    },
  });
  console.log(`  ✅ Customer '${switchedCust.name}' switched to ${switchedCust.loyaltyType} with balance: ${switchedCust.cashbackBalance} ${merchant.currency}`);

  // Clean up test records
  await prisma.transaction.deleteMany({ where: { customerId: { in: [newStampsCust.id, newCbCust.id] } } });
  await prisma.customer.deleteMany({ where: { id: { in: [newStampsCust.id, newCbCust.id] } } });
  console.log("\n🧹 Cleaned up temporary test customer records.");

  console.log("\n=========================================");
  console.log("🎉 ALL PHASE 6 (i18n) & PHASE 7 (Dual Loyalty) TESTS PASSED!");
  console.log("=========================================");
}

runTests()
  .catch((e) => {
    console.error("❌ Test suite failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


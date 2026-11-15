import React from "react";
import prisma from "@/lib/prisma";
import MerchantsDashboardClient from "@/components/MerchantsDashboardClient";

export const revalidate = 0; // Dynamic data for real-time admin view

export default async function AdminDashboardPage() {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customers: {
        take: 1,
        select: {
          passSerial: true,
        },
      },
      _count: {
        select: {
          customers: true,
          transactions: true,
          campaigns: true,
        },
      },
    },
  });

  const totalMerchants = merchants.length;
  const activeMerchants = merchants.filter((m) => m.isActive).length;
  const totalCustomers = await prisma.customer.count();
  const totalTransactions = await prisma.transaction.count();
  const totalCredits = merchants.reduce((sum, m) => sum + (m.credits || 0), 0);

  // Serialize dates and attach samplePassSerial for client component
  const serializedMerchants = merchants.map((m) => ({
    ...m,
    samplePassSerial: m.customers[0]?.passSerial || null,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            لوحة الإدارة المركزية (Super Admin)
          </h1>
          <p className="text-xs text-white/60 mt-1">
            متابعة شاملة لجميع المحلات التجارية، البطاقات المفعلة، والأرصدة في المغرب
          </p>
        </div>
      </div>

      <MerchantsDashboardClient
        initialMerchants={serializedMerchants}
        initialMetrics={{
          totalMerchants,
          activeMerchants,
          totalCustomers,
          totalTransactions,
          totalCredits,
        }}
      />
    </div>
  );
}

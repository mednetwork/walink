import React from "react";
import prisma from "@/lib/prisma";
import MerchantsDashboardClient from "@/components/MerchantsDashboardClient";
import { AlertCircle } from "lucide-react";

export const revalidate = 0; // Dynamic data for real-time admin view

export default async function AdminDashboardPage() {
  let merchants: Array<
    Record<string, unknown> & {
      id: string;
      slug: string;
      name: string;
      niche: string;
      city: string;
      phone: string | null;
      pinCode: string;
      logoIcon: string;
      primaryColor: string;
      bgGradient: string;
      stampsRequired: number;
      rewardName: string;
      customerPrefix: string;
      latitude: number | null;
      longitude: number | null;
      radarMessage: string;
      googleMapsUrl: string | null;
      plan: string;
      credits: number;
      isActive: boolean;
      createdAt: Date;
      customers: Array<{ passSerial: string }>;
      _count: {
        customers: number;
        transactions: number;
        campaigns: number;
      };
    }
  > = [];
  let totalCustomers = 0;
  let totalTransactions = 0;
  let dbError: string | null = null;

  try {
    merchants = (await prisma.merchant.findMany({
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
    })) as typeof merchants;

    totalCustomers = await prisma.customer.count();
    totalTransactions = await prisma.transaction.count();
  } catch (err: unknown) {
    console.error("Database connection/query error in AdminDashboardPage:", err);
    dbError =
      err instanceof Error
        ? err.message
        : "تعذر الاتصال بقاعدة البيانات. يرجى التحقق من متغيرات البيئة.";
  }

  const totalMerchants = merchants.length;
  const activeMerchants = merchants.filter((m) => m.isActive).length;
  const totalCredits = merchants.reduce((sum, m) => sum + (m.credits || 0), 0);

  // Serialize dates and attach samplePassSerial for client component
  const serializedMerchants = merchants.map((m) => ({
    ...m,
    samplePassSerial: m.customers[0]?.passSerial || null,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E9EDEF]">
        <div>
          <h1 className="text-2xl font-black text-[#111B21] tracking-tight">
            لوحة الإدارة المركزية (Super Admin)
          </h1>
          <p className="text-xs text-[#54656F] mt-1">
            متابعة شاملة لجميع المحلات التجارية، البطاقات المفعلة، والأرصدة في المغرب 🇲🇦
          </p>
        </div>
      </div>

      {/* Database Warning Alert if connection failed */}
      {dbError && (
        <div
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-sm"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 flex-none mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <h2 className="font-bold text-sm text-amber-900">تنبيه اتصال بقاعدة البيانات</h2>
            <p className="mt-1 text-amber-800">
              تعذر جلب بيانات المحلات مؤقتاً:{" "}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-950">
                {dbError}
              </code>
            </p>
            <p className="mt-1.5 text-[11px] text-amber-700">
              لوحة التحكم نشطة بالكامل. في حال كنت على خادم استضافة Hostinger، تأكد من توجيه{" "}
              <code className="font-mono font-bold">DATABASE_URL</code> إلى خادم{" "}
              <code className="font-mono font-bold">127.0.0.1:3306</code> المحلي.
            </p>
          </div>
        </div>
      )}

      {/* Main Merchants Dashboard Component */}
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

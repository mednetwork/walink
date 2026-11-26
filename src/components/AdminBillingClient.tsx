"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  CheckCircle2,
  Clock,
  Coins,
  Search,
  MessageSquare,
  Calendar,
  Building2,
  Loader2,
  Wrench,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { BillingRowDto, BillingSummaryDto } from "@/lib/billing";
import { formatWhatsAppDigits, INSTALLATION_FEE_MAD } from "@/lib/pricing";

interface AdminBillingClientProps {
  initialMonth: string;
  initialRows: BillingRowDto[];
  initialSummary: BillingSummaryDto;
}

export default function AdminBillingClient({
  initialMonth,
  initialRows,
  initialSummary,
}: AdminBillingClientProps) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [rows, setRows] = useState<BillingRowDto[]>(initialRows);
  const [summary, setSummary] = useState<BillingSummaryDto>(initialSummary);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [updatingMerchantId, setUpdatingMerchantId] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const loadMonthData = async (monthValue: string) => {
    setSelectedMonth(monthValue);
    setIsLoadingMonth(true);
    setFeedbackBanner(null);
    try {
      const res = await fetch(`/api/admin/billing?month=${encodeURIComponent(monthValue)}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        month: string;
        rows: BillingRowDto[];
        summary: BillingSummaryDto;
      };
      setRows(data.rows || []);
      setSummary(data.summary);
    } catch (err) {
      console.error("Failed to fetch billing month:", err);
    } finally {
      setIsLoadingMonth(false);
    }
  };

  const handleToggleStatus = async (row: BillingRowDto) => {
    const nextStatus = row.status === "PAID" ? "UNPAID" : "PAID";
    setUpdatingMerchantId(row.merchantId);
    setFeedbackBanner(null);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: row.merchantId,
          month: selectedMonth,
          status: nextStatus,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        rows: BillingRowDto[];
        summary: BillingSummaryDto;
      };
      setRows(data.rows);
      setSummary(data.summary);
      setFeedbackBanner(
        nextStatus === "PAID"
          ? `✅ تم تأكيد استخلاص فاتورة "${row.name}" لشهر ${selectedMonth}`
          : `⏳ تم إرجاع فاتورة "${row.name}" إلى غير مدفوعة`
      );
    } catch (err) {
      console.error("Failed to update invoice status:", err);
    } finally {
      setUpdatingMerchantId(null);
    }
  };

  const handleToggleInstallation = async (row: BillingRowDto) => {
    if (row.status === "PAID") return;
    const nextFee = row.installationFee > 0 ? 0 : INSTALLATION_FEE_MAD;
    setUpdatingMerchantId(row.merchantId);
    try {
      const res = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: row.merchantId,
          month: selectedMonth,
          status: "UNPAID",
          installationFee: nextFee,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        rows: BillingRowDto[];
        summary: BillingSummaryDto;
      };
      setRows(data.rows);
      setSummary(data.summary);
    } catch (err) {
      console.error("Failed to toggle installation fee:", err);
    } finally {
      setUpdatingMerchantId(null);
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          row.name.toLowerCase().includes(q) ||
          row.slug.toLowerCase().includes(q) ||
          row.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, statusFilter, searchTerm]);

  const buildWhatsAppInvoiceUrl = (row: BillingRowDto): string | null => {
    const waDigits = formatWhatsAppDigits(row.phone);
    if (!waDigits) return null;

    const planLabel =
      row.plan === "STARTER"
        ? "الباقة الأساسية (149 درهم/شهر)"
        : row.plan === "MULTI"
        ? `باقة الفروع (${row.maxBranches} فروع)`
        : "المتجر العادي (199 درهم/شهر)";

    const lines = [
      `السلام عليكم *${row.name}* 👋`,
      `📄 *فاتورة اشتراك Walink — شهر ${row.month}*`,
      `• الباقة: ${planLabel}`,
      `• الاشتراك الشهري: *${row.subscriptionFee} درهم*`,
    ];

    if (row.installationFee > 0) {
      lines.push(`• رسوم التثبيت والإعداد (أول مرة): *${row.installationFee} درهم*`);
    }

    lines.push(
      `• النقاط المستهلكة: ${row.pointsUsed.toLocaleString()} نقطة × 0.1 درهم = *${row.pointsFee.toFixed(2)} درهم*`
    );
    lines.push(`💰 *المبلغ الإجمالي المستحق: ${row.totalAmount.toFixed(2)} درهم*`);
    lines.push(
      row.status === "PAID"
        ? "✅ الحالة: *مدفوعة* — شكراً لثقتكم!"
        : "⏳ الحالة: *في انتظار التسديد*"
    );

    return `https://wa.me/${waDigits}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111B21] flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-[#008069]/10 text-[#008069] border border-[#008069]/20">
              <Receipt className="w-6 h-6" />
            </span>
            <span>فوترة المتاجر الشهرية والاشتراكات</span>
          </h1>
          <p className="text-xs text-[#54656F] mt-1">
            متابعة الاشتراك الشهري (149 / 199 / +100 لكل فرع)، رسوم التثبيت (300 درهم أول مرة)، واستهلاك النقاط (0.1 درهم/نقطة).
          </p>
        </div>

        {/* Month Picker */}
        <div className="flex items-center gap-2 bg-white border border-[#D1D7DB] rounded-2xl px-3.5 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-[#008069]" />
          <label htmlFor="billing-month-picker" className="text-xs font-bold text-[#111B21]">
            الشهر:
          </label>
          <input
            id="billing-month-picker"
            type="month"
            value={selectedMonth}
            onChange={(e) => loadMonthData(e.target.value)}
            className="text-xs font-mono font-bold text-[#008069] bg-transparent focus:outline-none cursor-pointer"
          />
          <button
            type="button"
            onClick={() => loadMonthData(selectedMonth)}
            aria-label="تحديث الفواتير"
            className="p-1.5 rounded-lg hover:bg-[#F0F2F5] text-[#54656F] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMonth ? "animate-spin text-[#008069]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 text-[11px] font-semibold"
          >
            إخفاء
          </button>
        </div>
      )}

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#54656F] font-semibold">
            <span>إجمالي فواتير الشهر</span>
            <Receipt className="w-4 h-4 text-[#008069]" />
          </div>
          <div className="text-2xl font-black text-[#111B21] font-mono">
            {summary.totalBilled.toLocaleString()} <span className="text-xs font-bold">DH</span>
          </div>
          <p className="text-[11px] text-[#54656F]">{rows.length} متجر مشمول بالفوترة</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/30 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span>المبالغ المدفوعة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {summary.totalPaid.toLocaleString()} <span className="text-xs font-bold">DH</span>
          </div>
          <p className="text-[11px] text-emerald-700">{summary.paidCount} فاتورة مدفوعة</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-200 bg-rose-50/30 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-rose-800 font-semibold">
            <span>في انتظار الدفع</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {summary.totalUnpaid.toLocaleString()} <span className="text-xs font-bold">DH</span>
          </div>
          <p className="text-[11px] text-rose-700">{summary.unpaidCount} فاتورة غير مدفوعة</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 bg-amber-50/30 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
            <span>إجمالي نقاط الشهر</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {summary.totalPointsUsed.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-800 font-mono">
            ≈ {(summary.totalPointsUsed * 0.1).toFixed(2)} DH (0.1 DH / نقطة)
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E9EDEF] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#54656F] absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="بحث باسم المتجر أو المدينة"
            placeholder="بحث باسم المتجر أو المدينة..."
            className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl pr-9 pl-3 py-2 text-xs text-[#111B21] focus:outline-none focus:border-[#008069] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {(
            [
              { id: "ALL", label: `الكل (${rows.length})` },
              { id: "UNPAID", label: `غير مدفوع (${summary.unpaidCount})` },
              { id: "PAID", label: `مدفوع (${summary.paidCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.id
                  ? "bg-[#008069] text-white shadow-sm"
                  : "bg-[#F0F2F5] text-[#54656F] hover:bg-[#E9EDEF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      {filteredRows.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E9EDEF] text-center space-y-2">
          <Receipt className="w-8 h-8 text-[#54656F] mx-auto" />
          <h2 className="text-sm font-bold text-[#111B21]">لا توجد فواتير مطابقة لهذا الشهر</h2>
          <p className="text-xs text-[#54656F]">
            جرّب اختيار شهر آخر أو مسح فلاتر البحث.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((row) => {
            const waUrl = buildWhatsAppInvoiceUrl(row);
            const isUpdating = updatingMerchantId === row.merchantId;

            return (
              <div
                key={row.merchantId}
                className={`bg-white p-5 rounded-3xl border shadow-sm transition ${
                  row.status === "PAID"
                    ? "border-emerald-200 bg-emerald-50/10"
                    : "border-[#E9EDEF]"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Store Identity & Plan */}
                  <div className="space-y-1.5 min-w-[220px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-base text-[#111B21]">{row.name}</h2>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          row.plan === "STARTER"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : row.plan === "MULTI"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {row.plan === "STARTER"
                          ? "الأساسية 149 DH"
                          : row.plan === "MULTI"
                          ? `فروع (${row.maxBranches})`
                          : "العادية 199 DH"}
                      </span>
                      {row.isFirstMonth && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          أول شهر (تثبيت)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#54656F]">
                      <span>📍 {row.city}</span>
                      {row.phone && <span className="font-mono dir-ltr">📞 {row.phone}</span>}
                      <Link
                        href={`/admin/merchants/${row.merchantId}`}
                        className="text-[#008069] hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <Building2 className="w-3 h-3" />
                        <span>تعديل الفروع/الباقة</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Breakdown Columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 bg-[#F7F9FA] p-3 rounded-2xl border border-[#E9EDEF] text-center">
                    <div>
                      <span className="text-[10px] text-[#54656F] block">الاشتراك الشهري</span>
                      <span className="text-sm font-bold text-[#111B21] font-mono">
                        {row.subscriptionFee} DH
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#54656F] block">ثمن التثبيت</span>
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`text-sm font-bold font-mono ${
                            row.installationFee > 0 ? "text-amber-700" : "text-[#54656F]"
                          }`}
                        >
                          {row.installationFee} DH
                        </span>
                        {row.status === "UNPAID" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleInstallation(row)}
                            title={
                              row.installationFee > 0
                                ? "إلغاء رسوم التثبيت لهذا الشهر"
                                : "إضافة 300 DH رسوم التثبيت"
                            }
                            className="p-1 rounded-md hover:bg-white text-[#54656F] hover:text-[#008069] transition"
                          >
                            <Wrench className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#54656F] block">
                        النقاط ({row.pointsUsed} × 0.1)
                      </span>
                      <span className="text-sm font-bold text-amber-700 font-mono">
                        {row.pointsFee.toFixed(2)} DH
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#54656F] block">المجموع المستحق</span>
                      <span className="text-base font-black text-[#008069] font-mono">
                        {row.totalAmount.toFixed(2)} DH
                      </span>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleToggleStatus(row)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                        row.status === "PAID"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-rose-600 hover:bg-rose-700 text-white"
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : row.status === "PAID" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{row.status === "PAID" ? "مدفوع ✓" : "غير مدفوع (تأكيد الدفع)"}</span>
                    </button>

                    {waUrl ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-[#075E54] font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>📲 إرسال الفاتورة (واتساب)</span>
                      </a>
                    ) : (
                      <span className="px-3 py-2 rounded-xl bg-[#F0F2F5] text-[#54656F] text-[11px] font-semibold">
                        لا يوجد هاتف
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Store,
  RefreshCw,
  Gift,
  MapPin,
  Star,
  Cake,
  Flame,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { formatTimeAgoArabic } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  createdAt: string;
  merchant: {
    name: string;
    slug: string;
  };
  customer: {
    name: string;
    passSerial: string;
    phone: string;
  } | null;
}

interface MerchantAutomationSummary {
  id: string;
  name: string;
  slug: string;
  credits: number;
  autoWinback: boolean;
  autoNearReward: boolean;
  autoBirthday: boolean;
  autoRadar: boolean;
  autoReview: boolean;
  customersCount: number;
  notificationsCount: number;
}

interface AutomationStats {
  totalNotifications: number;
  winbackCount: number;
  nearRewardCount: number;
  birthdayCount: number;
  radarCount: number;
  reviewCount: number;
  activeAutomatedMerchants: number;
}

interface AdminAutomationsClientProps {
  initialStats: AutomationStats;
  initialNotifications: NotificationItem[];
  merchants: MerchantAutomationSummary[];
}

export default function AdminAutomationsClient({
  initialStats,
  initialNotifications,
  merchants,
}: AdminAutomationsClientProps) {
  const [stats, setStats] = useState<AutomationStats>(initialStats);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>("ALL");
  const [forceDemo, setForceDemo] = useState<boolean>(true);
  const [isRunningCron, setIsRunningCron] = useState<boolean>(false);
  const [cronResult, setCronResult] = useState<{
    merchantsProcessed: number;
    winbacksSent: number;
    nearRewardsSent: number;
    birthdaysSent: number;
    totalNotifications: number;
    creditsDeducted: number;
  } | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const handleRunCron = async () => {
    setIsRunningCron(true);
    setCronResult(null);

    try {
      const payload: { merchantId?: string; forceDemo: boolean } = {
        forceDemo,
      };
      if (selectedMerchantId !== "ALL") {
        payload.merchantId = selectedMerchantId;
      }

      const res = await fetch("/api/cron/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("فشل تشغيل الأتمتة");
      }

      const data = await res.json();
      setCronResult(data.stats);

      // Refresh notifications list & stats from server
      const refreshRes = await fetch("/api/cron/automations", { method: "GET" });
      if (refreshRes.ok) {
        // Soft reload to fetch fresh page data
        window.location.reload();
      }
    } catch (err) {
      console.error("Cron run error:", err);
      alert("حدث خطأ أثناء تشغيل محرك الأتمتة.");
    } finally {
      setIsRunningCron(false);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === "ALL") return true;
    return notif.type === activeFilter;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "WINBACK":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Clock className="w-3 h-3" />
            <span>استرجاع (15 يوم)</span>
          </span>
        );
      case "NEAR_REWARD":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-3 h-3" />
            <span>قريب من المكافأة</span>
          </span>
        );
      case "REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Star className="w-3 h-3" />
            <span>تقييم خرائط Google</span>
          </span>
        );
      case "BIRTHDAY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cake className="w-3 h-3" />
            <span>هدية عيد ميلاد</span>
          </span>
        );
      case "RADAR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MapPin className="w-3 h-3" />
            <span>رادار 100m</span>
          </span>
        );
      case "STAMP":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            <span>طابع جديد</span>
          </span>
        );
      case "REWARD":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Gift className="w-3 h-3" />
            <span>تسليم كادو</span>
          </span>
        );
      case "PROMO":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Bell className="w-3 h-3" />
            <span>بروموسيون</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 text-white/70">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-[#111B21]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008069]/10 border border-[#008069]/20 text-[#008069] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مركز تحكم الأتمتة المتقدم (Automation Cron Engine)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111B21] tracking-tight">
            محرك الأتمتة والرسائل الذكية
          </h1>
          <p className="text-sm text-[#54656F] mt-1 max-w-2xl leading-relaxed">
            مراقبة وتشغيل الأتمتة الذكية لجميع المحلات: استرجاع الزبناء الغابرين بعد 15 يوماً، تحفيز قرب المكافأة، هدايا أعياد الميلاد، ورادار القرب الجغرافي.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F0F2F5] border border-[#D1D7DB] text-[#111B21] text-xs font-semibold shadow-sm transition"
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E9EDEF] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#54656F]">مجموع الإشعارات</span>
            <div className="w-8 h-8 rounded-xl bg-[#008069]/10 text-[#008069] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111B21] mt-3 font-mono">
            {stats.totalNotifications}
          </div>
          <p className="text-[11px] text-[#54656F] mt-1">مرسلة للمشتركين</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/30 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-900">استرجاع الغابرين (15 يوم)</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-700 mt-3 font-mono">
            {stats.winbackCount}
          </div>
          <p className="text-[11px] text-red-600 mt-1">دعوة استرجاع تلقائية</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">تحفيز قرب المكافأة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-3 font-mono">
            {stats.nearRewardCount}
          </div>
          <p className="text-[11px] text-amber-600 mt-1">باقي طابع واحد (مجاني)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">تقييمات Google Maps</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-3 font-mono">
            {stats.reviewCount}
          </div>
          <p className="text-[11px] text-blue-600 mt-1">بعد الطابع الثالث أو الكادو</p>
        </div>
      </div>

      {/* Manual Cron Execution Launcher Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9EDEF] shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#008069] text-white flex items-center justify-center font-bold shadow-md shadow-[#008069]/20">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111B21]">
                تشغيل محرك الأتمتة اليدوي (Manual Cron Trigger)
              </h2>
              <p className="text-xs text-[#54656F]">
                يقوم بالبحث عن الزبناء المؤهلين تلقائياً وإرسال الإشعارات إلى بطاقاتهم وخصم الرصيد عند الحاجة.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="cron-merchant-select" className="block text-xs font-semibold text-[#111B21] mb-1.5">
                تحديد المحل المستهدف:
              </label>
              <select
                id="cron-merchant-select"
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3 py-2 text-xs text-[#111B21] focus:outline-none focus:border-[#008069]"
              >
                <option value="ALL">جميع المحلات النشطة ({merchants.length})</option>
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.credits} نقطة رصيد)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-4 sm:pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#111B21]">
                <input
                  type="checkbox"
                  checked={forceDemo}
                  onChange={(e) => setForceDemo(e.target.checked)}
                  className="rounded border-[#D1D7DB] text-[#008069] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-medium">وضع المحاكاة التجريبي (Force Demo Mode لتفعيل الأتمتة فوراً)</span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRunCron}
              disabled={isRunningCron}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#008069]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {isRunningCron ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري فحص وإرسال الأتمتة...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>⚡ تشغيل محرك الأتمتة دابا (Run Cron Now)</span>
                </>
              )}
            </button>

            <span className="text-xs text-[#54656F]">
              * في الإنتاج يعمل هذا المحرك تلقائياً كل 6 ساعات عبر Vercel Cron أو Linux Cron.
            </span>
          </div>

          {/* Cron Result Report */}
          {cronResult && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم تنفيذ دورة الأتمتة بنجاح!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div>• محلات مفحوصة: {cronResult.merchantsProcessed}</div>
                <div>• رسائل استرجاع: {cronResult.winbacksSent}</div>
                <div>• تحفيز المكافأة: {cronResult.nearRewardsSent}</div>
                <div>• أعياد ميلاد: {cronResult.birthdaysSent}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Merchants Automation Status Grid */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#008069]" />
            <h2 className="text-base font-bold text-[#111B21]">حالة أتمتة المحلات المشتركة</h2>
          </div>
          <span className="text-xs text-[#54656F]">{merchants.length} محلات</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#E9EDEF] text-[#54656F] pb-3">
                <th className="py-2.5 font-semibold">المحل</th>
                <th className="py-2.5 font-semibold">الرصيد المتاح</th>
                <th className="py-2.5 font-semibold">استرجاع 15 يوم</th>
                <th className="py-2.5 font-semibold">قرب المكافأة</th>
                <th className="py-2.5 font-semibold">تقييم خرائط Google</th>
                <th className="py-2.5 font-semibold">رادار 100m</th>
                <th className="py-2.5 font-semibold">الكليان</th>
                <th className="py-2.5 font-semibold">الإشعارات</th>
                <th className="py-2.5 font-semibold">إجراء سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9EDEF] text-[#111B21]">
              {merchants.map((m) => (
                <tr key={m.id} className="hover:bg-[#F0F2F5] transition">
                  <td className="py-3 font-bold text-[#111B21]">
                    <Link
                      href={`/admin/merchants/${m.id}`}
                      className="hover:text-[#008069] transition"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="py-3 font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-300">
                      {m.credits} نقطة
                    </span>
                  </td>
                  <td className="py-3">
                    {m.autoWinback ? (
                      <span className="text-[#008069] font-bold">مفعّل ✓</span>
                    ) : (
                      <span className="text-[#54656F]/40">معطّل</span>
                    )}
                  </td>
                  <td className="py-3">
                    {m.autoNearReward ? (
                      <span className="text-[#008069] font-bold">مفعّل ✓</span>
                    ) : (
                      <span className="text-[#54656F]/40">معطّل</span>
                    )}
                  </td>
                  <td className="py-3">
                    {m.autoReview ? (
                      <span className="text-[#008069] font-bold">مفعّل ✓</span>
                    ) : (
                      <span className="text-[#54656F]/40">معطّل</span>
                    )}
                  </td>
                  <td className="py-3">
                    {m.autoRadar ? (
                      <span className="text-[#008069] font-bold">مفعّل ✓</span>
                    ) : (
                      <span className="text-[#54656F]/40">معطّل</span>
                    )}
                  </td>
                  <td className="py-3 font-mono">{m.customersCount}</td>
                  <td className="py-3 font-mono">{m.notificationsCount}</td>
                  <td className="py-3">
                    <Link
                      href={`/m/${m.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] text-[#008069] hover:underline font-semibold"
                    >
                      <span>تطبيق التاجر</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Notification Audit Log */}
      <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#008069]" />
            <h2 className="text-base font-bold text-[#111B21]">سجل الإشعارات والأتمتة المباشر (Audit Log)</h2>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {["ALL", "WINBACK", "NEAR_REWARD", "REVIEW", "RADAR", "BIRTHDAY", "STAMP"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveFilter(type)}
                className={`px-3 py-1.5 rounded-xl font-medium transition text-xs whitespace-nowrap ${
                  activeFilter === type
                    ? "bg-[#008069] text-white font-bold shadow-sm"
                    : "bg-[#F0F2F5] text-[#54656F] border border-[#D1D7DB] hover:text-[#111B21]"
                }`}
              >
                {type === "ALL" && "الكل"}
                {type === "WINBACK" && "استرجاع"}
                {type === "NEAR_REWARD" && "قرب المكافأة"}
                {type === "REVIEW" && "تقييم Google"}
                {type === "RADAR" && "رادار 100m"}
                {type === "BIRTHDAY" && "أعياد ميلاد"}
                {type === "STAMP" && "طوابع"}
              </button>
            ))}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-[#54656F] text-xs">
            لا توجد إشعارات مسجلة في هذا التصنيف حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#E9EDEF] text-[#54656F] pb-3">
                  <th className="py-2.5 font-semibold">النوع</th>
                  <th className="py-2.5 font-semibold">المحل</th>
                  <th className="py-2.5 font-semibold">الزبون المستهدف</th>
                  <th className="py-2.5 font-semibold">نص الإشعار</th>
                  <th className="py-2.5 font-semibold">الوقت</th>
                  <th className="py-2.5 font-semibold">معاينة الكارط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDEF] text-[#111B21]">
                {filteredNotifications.map((n) => (
                  <tr key={n.id} className="hover:bg-[#F0F2F5] transition">
                    <td className="py-3">{getTypeBadge(n.type)}</td>
                    <td className="py-3 font-semibold text-[#111B21]">
                      {n.merchant.name}
                    </td>
                    <td className="py-3">
                      {n.customer ? (
                        <div>
                          <span className="font-semibold text-[#111B21]">{n.customer.name}</span>
                          <span className="block text-[10px] text-[#54656F] font-mono">
                            {n.customer.phone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#54656F]">بث جماعي (Broadcast)</span>
                      )}
                    </td>
                    <td className="py-3 max-w-xs truncate text-[#54656F]">
                      <span className="font-semibold text-[#111B21]">{n.title}: </span>
                      <span>{n.body}</span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#54656F]">
                      {formatTimeAgoArabic(n.createdAt)}
                    </td>
                    <td className="py-3">
                      {n.customer ? (
                        <Link
                          href={`/pass/${n.customer.passSerial}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] text-[#008069] hover:underline font-semibold"
                        >
                          <span>عرض الكارط</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-[#54656F]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getStoreUrl, getJoinUrl, getPassUrl } from "@/lib/urls";
import {
  Store,
  Users,
  Award,
  Coins,
  Search,
  Filter,
  ArrowUpRight,
  PlusCircle,
  ExternalLink,
  Edit,
  Radio,
  Coffee,
  Scissors,
  Utensils,
  Car,
  Sparkles,
  Shirt,
  CheckCircle2,
  XCircle,
  QrCode,
  MapPin,
  Smartphone,
} from "lucide-react";
import { NICHE_PRESETS, PLANS_INFO } from "@/lib/constants";
import { computeMonthlySubscriptionFee } from "@/lib/pricing";
import StandPreviewModal from "@/components/StandPreviewModal";
import TopupModal from "@/components/TopupModal";
import { useI18n } from "@/lib/i18n/context";

interface MerchantData {
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
  maxBranches?: number;
  credits: number;
  isActive: boolean;
  samplePassSerial?: string | null;
  createdAt: string | Date;
  _count: {
    customers: number;
    transactions: number;
    campaigns: number;
  };
}

interface MerchantsDashboardClientProps {
  initialMerchants: MerchantData[];
  initialMetrics: {
    totalMerchants: number;
    activeMerchants: number;
    totalCustomers: number;
    totalTransactions: number;
    totalCredits: number;
  };
}

export default function MerchantsDashboardClient({
  initialMerchants,
  initialMetrics,
}: MerchantsDashboardClientProps) {
  const { t, isRTL } = useI18n();
  const [merchants, setMerchants] = useState<MerchantData[]>(initialMerchants);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");

  // Modals state
  const [standModalMerchant, setStandModalMerchant] = useState<MerchantData | null>(null);
  const [topupModalMerchant, setTopupModalMerchant] = useState<MerchantData | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const d = t.admin?.dashboard || {
    pageTitle: "لوحة الإدارة المركزية (Super Admin)",
    pageSubtitle: "متابعة شاملة لجميع المتاجر، البطاقات المفعلة، والأرصدة في المغرب 🇲🇦",
    kpiMerchants: "إجمالي المتاجر المشتركة",
    kpiMerchantsActive: "نشط حالياً",
    kpiMerchantsSub: "المقاهي، المطاعم، وصالونات الحلاقة",
    kpiCustomers: "إجمالي البطاقات المفعلة",
    kpiCustomersUnit: "عميل دائم",
    kpiCustomersSub: "عبر Apple Wallet و Google Wallet و Web Pass",
    kpiTransactions: "مجموع الزيارات والأختام",
    kpiTransactionsUnit: "عملية مسجلة",
    kpiTransactionsSub: "أختام مضافة ومكافآت مستفاد منها",
    kpiCredits: "رصيد النقاط الموزع",
    kpiCreditsUnit: "رصيد متاح",
    kpiCreditsSub: "جاهز لإشعارات الرادار وحملات الاسترجاع",
    searchPlaceholder: "بحث باسم المتجر، الرابط (Slug)، أو المدينة...",
    allNiches: "كل الأنشطة التجارية",
    allPlans: "كل الباقات",
    merchantsListTitle: "قائمة المتاجر الشريكة",
    noMerchants: "لا توجد متاجر مطابقة",
    noMerchantsDesc: "جرّب تغيير كلمات البحث أو الفلاتر، أو قم بإضافة متجر جديد الآن.",
    addMerchantBtn: "متجر جديد",
    clients: "العملاء",
    visits: "الزيارات",
    credits: "الرصيد",
    reward: "المكافأة:",
    stampsRequired: "الأختام المطلوبة:",
    stampsCount: "أختام",
    topupCredits: "شحن الرصيد",
    standNfc: "حامل الطاولة (NFC)",
    viewLivePass: "معاينة بطاقة حية (Live Pass)",
    registerFirstCustomer: "تسجيل أول عميل للبطاقة",
    merchantDashboard: "لوحة المتجر",
    customerLink: "رابط العملاء",
    editMerchant: "تعديل",
    enableMerchant: "تفعيل المتجر",
    disableMerchant: "تعطيل المتجر",
    activeStatus: "نشط",
    inactiveStatus: "معطل",
    pinLabel: "رمز PIN:",
    nicheCafe: "المقاهي (Café)",
    nicheBarber: "الحلاقة (Barber)",
    nicheSnack: "المطاعم والوجبات السريعة (Snack)",
    nicheWash: "غسيل السيارات (Car Wash)",
    nicheBeauty: "صالونات التجميل (Beauty)",
    nicheLaundry: "المصابن (Laundry)",
    nicheOther: "أنشطة أخرى",
    planStarter: "باقة STARTER",
    planGrowth: "باقة GROWTH",
    planMulti: "باقة MULTI",
  };

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNiche = selectedNiche === "all" || m.niche === selectedNiche;
    const matchesPlan = selectedPlan === "all" || m.plan === selectedPlan;

    return matchesSearch && matchesNiche && matchesPlan;
  });

  const handleToggleStatus = async (merchantId: string, currentStatus: boolean) => {
    setTogglingId(merchantId);
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error("فشل تحديث حالة المتجر");

      setMerchants((prev) =>
        prev.map((m) => (m.id === merchantId ? { ...m, isActive: !currentStatus } : m))
      );

      setMetrics((prev) => ({
        ...prev,
        activeMerchants: !currentStatus
          ? prev.activeMerchants + 1
          : prev.activeMerchants - 1,
      }));
    } catch (err) {
      console.error("Toggle status error:", err);
      alert("وقع خطأ أثناء تغيير حالة المتجر");
    } finally {
      setTogglingId(null);
    }
  };

  const handleTopupSuccess = (merchantId: string, newCredits: number) => {
    const prevMerchant = merchants.find((m) => m.id === merchantId);
    const addedCredits = prevMerchant ? newCredits - prevMerchant.credits : 0;

    setMerchants((prev) =>
      prev.map((m) => (m.id === merchantId ? { ...m, credits: newCredits } : m))
    );

    setMetrics((prev) => ({
      ...prev,
      totalCredits: prev.totalCredits + addedCredits,
    }));
  };

  const getNicheBadge = (niche: string) => {
    const preset = NICHE_PRESETS[niche] || NICHE_PRESETS.other;
    const label = (t.niches && t.niches[niche]?.label) || preset.label;
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#EFEAE4] border border-[#161514]/15 text-[#161514]">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: preset.color }}
        />
        <span>{label}</span>
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planInfo = PLANS_INFO[plan as keyof typeof PLANS_INFO] || PLANS_INFO.STARTER;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${planInfo.badge}`}
      >
        {planInfo.name} ({planInfo.label})
      </span>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Dynamic Localized Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#161514] tracking-tight">
            {d.pageTitle}
          </h1>
          <p className="text-xs text-[#161514]/65 mt-1">
            {d.pageSubtitle}
          </p>
        </div>
      </div>

      {/* 4 Light KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Merchants */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#161514]/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#161514]/65">
              {d.kpiMerchants}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#F85B04]/10 text-[#DA5004] border border-[#F85B04]/25 flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#161514]">
              {metrics.totalMerchants}
            </span>
            <span className="text-xs text-[#DA5004] font-bold">
              ({metrics.activeMerchants} {d.kpiMerchantsActive})
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#161514]/65">
            {d.kpiMerchantsSub}
          </p>
        </div>

        {/* Card 2: Customers */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#161514]/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#161514]/65">
              {d.kpiCustomers}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#F85B04]/10 text-[#DA5004] border border-[#F85B04]/25 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#161514]">
              {metrics.totalCustomers.toLocaleString()}
            </span>
            <span className="text-xs text-[#DA5004] font-bold">{d.kpiCustomersUnit}</span>
          </div>
          <p className="mt-2 text-[11px] text-[#161514]/65">
            {d.kpiCustomersSub}
          </p>
        </div>

        {/* Card 3: Visits & Stamps */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#161514]/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#161514]/65">
              {d.kpiTransactions}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#161514]">
              {metrics.totalTransactions.toLocaleString()}
            </span>
            <span className="text-xs text-purple-700 font-bold">{d.kpiTransactionsUnit}</span>
          </div>
          <p className="mt-2 text-[11px] text-[#161514]/65">
            {d.kpiTransactionsSub}
          </p>
        </div>

        {/* Card 4: Distributed Credits */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#161514]/10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#161514]/65">
              {d.kpiCredits}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-700">
              {metrics.totalCredits.toLocaleString()}
            </span>
            <span className="text-xs text-amber-800 font-bold">{d.kpiCreditsUnit}</span>
          </div>
          <p className="mt-2 text-[11px] text-[#161514]/65">
            {d.kpiCreditsSub}
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-[#161514]/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 absolute start-3.5 top-3.5 text-[#161514]/65" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={d.searchPlaceholder}
            placeholder={d.searchPlaceholder}
            className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-2xl ps-10 pe-4 py-2.5 text-xs text-[#161514] placeholder-[#161514]/45 focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2.5">
          {/* Niche Filter */}
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            aria-label={d.allNiches}
            className="bg-[#EFEAE4] border border-[#161514]/15 rounded-2xl px-3 py-2 text-xs text-[#161514] focus:outline-none focus:border-[#F85B04]"
          >
            <option value="all">{d.allNiches}</option>
            <option value="cafe">{d.nicheCafe}</option>
            <option value="barber">{d.nicheBarber}</option>
            <option value="snack">{d.nicheSnack}</option>
            <option value="wash">{d.nicheWash}</option>
            <option value="beauty">{d.nicheBeauty}</option>
            <option value="laundry">{d.nicheLaundry}</option>
            <option value="other">{d.nicheOther}</option>
          </select>

          {/* Plan Filter */}
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            aria-label={d.allPlans}
            className="bg-[#EFEAE4] border border-[#161514]/15 rounded-2xl px-3 py-2 text-xs text-[#161514] focus:outline-none focus:border-[#F85B04]"
          >
            <option value="all">{d.allPlans}</option>
            <option value="STARTER">{d.planStarter}</option>
            <option value="GROWTH">{d.planGrowth}</option>
            <option value="MULTI">{d.planMulti}</option>
          </select>

          <Link
            href="/admin/merchants/new"
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#F9742A] to-[#F85B04] hover:from-[#F85B04] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#F85B04]/25 transition whitespace-nowrap ms-auto md:ms-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{d.addMerchantBtn}</span>
          </Link>
        </div>
      </div>

      {/* Merchants Grid / Table */}
      <div className="space-y-4" id="merchants">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#161514] flex items-center gap-2">
            <span>{d.merchantsListTitle}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#E9EDEF] text-[#161514]/65 font-mono">
              {filteredMerchants.length}
            </span>
          </h2>
        </div>

        {filteredMerchants.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#161514]/10 text-center shadow-sm">
            <Store className="w-12 h-12 text-[#161514]/65/30 mx-auto mb-3" />
            <h3 className="font-bold text-base text-[#161514]">{d.noMerchants}</h3>
            <p className="text-xs text-[#161514]/65 mt-1 max-w-sm mx-auto">
              {d.noMerchantsDesc}
            </p>
            <Link
              href="/admin/merchants/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F9742A] to-[#F85B04] text-white font-bold text-xs shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{d.addMerchantBtn}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white rounded-3xl p-6 relative flex flex-col justify-between border border-[#161514]/10 hover:border-[#F85B04]/40 shadow-sm transition-all duration-300"
              >
                {/* Card Top: Avatar, Name, Niche & Plan */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm font-bold text-lg border border-black/10"
                        style={{ background: merchant.bgGradient || merchant.primaryColor }}
                      >
                        {merchant.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#161514] hover:text-[#DA5004] transition">
                          <Link href={`/admin/merchants/${merchant.id}`}>
                            {merchant.name}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#161514]/65 mt-0.5">
                          <span className="font-mono text-[#DA5004] font-bold">
                            /{merchant.slug}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#161514]/65" />
                            {merchant.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Status Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(merchant.id, merchant.isActive)}
                      disabled={togglingId === merchant.id}
                      title={merchant.isActive ? d.disableMerchant : d.enableMerchant}
                      aria-label={merchant.isActive ? d.disableMerchant : d.enableMerchant}
                      className={`p-1.5 rounded-xl border transition ${
                        merchant.isActive
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-red-50 border-red-300 text-red-800"
                      }`}
                    >
                      {merchant.isActive ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {getNicheBadge(merchant.niche)}
                    {getPlanBadge(merchant.plan)}
                    <span className="text-[11px] font-mono font-bold text-[#DA5004] bg-[#F85B04]/10 px-2 py-0.5 rounded-lg border border-[#F85B04]/25">
                      {computeMonthlySubscriptionFee(merchant.plan, merchant.maxBranches ?? 1)} DH/شهر
                    </span>
                    <span className="text-[11px] font-mono text-[#161514]/65 bg-[#EFEAE4] px-2 py-0.5 rounded-lg border border-[#161514]/10">
                      {d.pinLabel} {merchant.pinCode}
                    </span>
                  </div>

                  {/* Merchant Stats Summary */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#EFEAE4] rounded-2xl border border-[#161514]/10 text-center my-3">
                    <div>
                      <span className="text-[10px] text-[#161514]/65 block">{d.clients}</span>
                      <span className="font-mono font-bold text-sm text-[#161514]">
                        {merchant._count?.customers || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#161514]/65 block">{d.visits}</span>
                      <span className="font-mono font-bold text-sm text-[#161514]">
                        {merchant._count?.transactions || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#161514]/65 block">{d.credits}</span>
                      <span className="font-mono font-bold text-sm text-amber-700">
                        {merchant.credits.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Reward & Stamps Info */}
                  <div className="p-3 bg-[#EFEAE4] rounded-2xl border border-[#161514]/10 text-xs space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[#161514]">
                      <span className="text-[#161514]/65">{d.reward}</span>
                      <span className="font-bold text-amber-800">
                        {merchant.rewardName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#161514]">
                      <span className="text-[#161514]/65">{d.stampsRequired}</span>
                      <span className="font-mono font-bold text-[#161514]">
                        {merchant.stampsRequired} {d.stampsCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons Row */}
                <div className="space-y-2 pt-2 border-t border-[#161514]/10">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Topup button */}
                    <button
                      type="button"
                      onClick={() => setTopupModalMerchant(merchant)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{d.topupCredits}</span>
                    </button>

                    {/* Stand QR + NFC preview */}
                    <button
                      type="button"
                      onClick={() => setStandModalMerchant(merchant)}
                      className="w-full py-2 px-3 rounded-xl bg-[#EFEAE4] hover:bg-[#E5DFD7] border border-[#161514]/15 text-[#161514] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#DA5004]" />
                      <span>{d.standNfc}</span>
                    </button>
                  </div>

                  {/* Live Customer Pass Link */}
                  {merchant.samplePassSerial ? (
                    <a
                      href={getPassUrl(merchant.samplePassSerial)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#F85B04]/10 hover:bg-[#F85B04]/20 border border-[#F85B04]/25 text-[#DA5004] font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      title={d.viewLivePass}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#DA5004]" />
                      <span>{d.viewLivePass}</span>
                    </a>
                  ) : (
                    <a
                      href={getJoinUrl(merchant.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#EFEAE4] hover:bg-[#E5DFD7] border border-[#161514]/15 text-[#161514]/65 text-xs flex items-center justify-center gap-1.5 transition font-medium"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{d.registerFirstCustomer}</span>
                    </a>
                  )}

                  {/* Direct Links */}
                  <div className="flex items-center justify-between gap-1 text-[11px] pt-1">
                    <a
                      href={getStoreUrl(merchant.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#161514]/65 hover:text-[#DA5004] font-medium transition flex items-center gap-1"
                      title={d.merchantDashboard}
                    >
                      <span>{d.merchantDashboard}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>

                    <a
                      href={getJoinUrl(merchant.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#161514]/65 hover:text-[#DA5004] font-medium transition flex items-center gap-1"
                      title={d.customerLink}
                    >
                      <span>{d.customerLink}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>

                    <Link
                      href={`/admin/merchants/${merchant.id}`}
                      className="text-[#161514]/65 hover:text-[#DA5004] font-medium transition flex items-center gap-1"
                      title={d.editMerchant}
                    >
                      <span>{d.editMerchant}</span>
                      <Edit className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stand QR Modal */}
      {standModalMerchant && (
        <StandPreviewModal
          isOpen={!!standModalMerchant}
          onClose={() => setStandModalMerchant(null)}
          merchant={standModalMerchant}
        />
      )}

      {/* Topup Modal */}
      {topupModalMerchant && (
        <TopupModal
          isOpen={!!topupModalMerchant}
          onClose={() => setTopupModalMerchant(null)}
          merchant={topupModalMerchant}
          onSuccess={(newCredits) =>
            handleTopupSuccess(topupModalMerchant.id, newCredits)
          }
        />
      )}
    </div>
  );
}

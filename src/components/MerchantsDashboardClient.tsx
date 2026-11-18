"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Phone,
  KeyRound,
  Smartphone,
} from "lucide-react";
import { NICHE_PRESETS, PLANS_INFO } from "@/lib/constants";
import StandPreviewModal from "@/components/StandPreviewModal";
import TopupModal from "@/components/TopupModal";

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
  const [merchants, setMerchants] = useState<MerchantData[]>(initialMerchants);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");

  // Modals state
  const [standModalMerchant, setStandModalMerchant] = useState<MerchantData | null>(null);
  const [topupModalMerchant, setTopupModalMerchant] = useState<MerchantData | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

      if (!res.ok) throw new Error("فشل تحديث حالة المحل");

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
      alert("وقع خطأ أثناء تغيير حالة المحل");
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
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/90">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: preset.color }}
        />
        <span>{preset.label}</span>
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 4 Light KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Merchants */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#54656F]">
              إجمالي المحلات المشتركة
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#008069]/10 text-[#008069] border border-[#008069]/20 flex items-center justify-center shadow-sm">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#111B21]">
              {metrics.totalMerchants}
            </span>
            <span className="text-xs text-[#008069] font-bold">
              ({metrics.activeMerchants} نشط حالياً)
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#54656F]">
            محلات المقاهي، الحلاقة، والمطاعم
          </p>
        </div>

        {/* Card 2: Customers */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#54656F]">
              إجمالي الكارطات المفعّلة
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#00A884]/10 text-[#008069] border border-[#00A884]/20 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#111B21]">
              {metrics.totalCustomers.toLocaleString()}
            </span>
            <span className="text-xs text-[#008069] font-bold">زبون دائم</span>
          </div>
          <p className="mt-2 text-[11px] text-[#54656F]">
            عبر Apple Wallet و Google Wallet و Web Pass
          </p>
        </div>

        {/* Card 3: Visits & Stamps */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#54656F]">
              مجموع الزيارات والطوابع
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-[#111B21]">
              {metrics.totalTransactions.toLocaleString()}
            </span>
            <span className="text-xs text-purple-700 font-bold">عملية مسجلة</span>
          </div>
          <p className="mt-2 text-[11px] text-[#54656F]">
            طوابع مضافة ومكافآت مستفاد منها
          </p>
        </div>

        {/* Card 4: Distributed Credits */}
        <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#54656F]">
              رصيد الكريدي الموزع
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-700">
              {metrics.totalCredits.toLocaleString()}
            </span>
            <span className="text-xs text-amber-800 font-bold">كريدي متاح</span>
          </div>
          <p className="mt-2 text-[11px] text-[#54656F]">
            جاهز لإشعارات الرادار وحملات الاسترجاع
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-[#E9EDEF] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-[#54656F]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="بحث باسم المحل، الرابط، أو المدينة"
            placeholder="بحث باسم المحل، الرابط (Slug)، أو المدينة..."
            className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-2xl pr-10 pl-4 py-2.5 text-xs text-[#111B21] placeholder-[#54656F] focus:outline-none focus:border-[#008069] focus:bg-white transition"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap items-center gap-2.5">
          {/* Niche Filter */}
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="bg-[#F0F2F5] border border-[#D1D7DB] rounded-2xl px-3 py-2 text-xs text-[#111B21] focus:outline-none focus:border-[#008069]"
          >
            <option value="all">كل الأنشطة</option>
            <option value="cafe">المقاهي (Café)</option>
            <option value="barber">الحلاقة (Barber)</option>
            <option value="snack">المطاعم والسناك (Snack)</option>
            <option value="wash">غسيل السيارات (Car Wash)</option>
            <option value="beauty">صالونات التجميل (Beauty)</option>
            <option value="laundry">المصابن (Laundry)</option>
            <option value="other">أنشطة أخرى</option>
          </select>

          {/* Plan Filter */}
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="bg-[#F0F2F5] border border-[#D1D7DB] rounded-2xl px-3 py-2 text-xs text-[#111B21] focus:outline-none focus:border-[#008069]"
          >
            <option value="all">كل الباقات</option>
            <option value="STARTER">باقة STARTER</option>
            <option value="GROWTH">باقة GROWTH</option>
            <option value="MULTI">باقة MULTI</option>
          </select>

          <Link
            href="/admin/merchants/new"
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#008069]/20 transition whitespace-nowrap mr-auto md:mr-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>محل جديد</span>
          </Link>
        </div>
      </div>

      {/* Merchants Grid / Table */}
      <div className="space-y-4" id="merchants">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#111B21] flex items-center gap-2">
            <span>قائمة المحلات الشريكة</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#E9EDEF] text-[#54656F] font-mono">
              {filteredMerchants.length}
            </span>
          </h2>
        </div>

        {filteredMerchants.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E9EDEF] text-center shadow-sm">
            <Store className="w-12 h-12 text-[#54656F]/30 mx-auto mb-3" />
            <h3 className="font-bold text-base text-[#111B21]">لا توجد محلات مطابقة</h3>
            <p className="text-xs text-[#54656F] mt-1 max-w-sm mx-auto">
              جرب تغيير كلمات البحث أو الفلاتر، أو قم بإضافة محل جديد الآن.
            </p>
            <Link
              href="/admin/merchants/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] text-white font-bold text-xs shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة محل جديد</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-white rounded-3xl p-6 relative flex flex-col justify-between border border-[#E9EDEF] hover:border-[#008069]/40 shadow-sm transition-all duration-300"
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
                        <h3 className="font-bold text-base text-[#111B21] hover:text-[#008069] transition">
                          <Link href={`/admin/merchants/${merchant.id}`}>
                            {merchant.name}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#54656F] mt-0.5">
                          <span className="font-mono text-[#008069] font-bold">
                            /{merchant.slug}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#54656F]" />
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
                      title={merchant.isActive ? "تعطيل المحل" : "تفعيل المحل"}
                      aria-label={merchant.isActive ? "تعطيل المحل" : "تفعيل المحل"}
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
                    <span className="text-[11px] font-mono text-[#54656F] bg-[#F0F2F5] px-2 py-0.5 rounded-lg border border-[#E9EDEF]">
                      PIN: {merchant.pinCode}
                    </span>
                  </div>

                  {/* Merchant Stats Summary */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#F0F2F5] rounded-2xl border border-[#E9EDEF] text-center my-3">
                    <div>
                      <span className="text-[10px] text-[#54656F] block">الكليان</span>
                      <span className="font-mono font-bold text-sm text-[#111B21]">
                        {merchant._count?.customers || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#54656F] block">الزيارات</span>
                      <span className="font-mono font-bold text-sm text-[#111B21]">
                        {merchant._count?.transactions || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#54656F] block">الكريدي</span>
                      <span className="font-mono font-bold text-sm text-amber-700">
                        {merchant.credits.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Reward & Stamps Info */}
                  <div className="p-3 bg-[#F0F2F5] rounded-2xl border border-[#E9EDEF] text-xs space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[#111B21]">
                      <span className="text-[#54656F]">المكافأة:</span>
                      <span className="font-bold text-amber-800">
                        {merchant.rewardName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#111B21]">
                      <span className="text-[#54656F]">الطوابع المطلوبة:</span>
                      <span className="font-mono font-bold text-[#111B21]">
                        {merchant.stampsRequired} طوابع
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons Row */}
                <div className="space-y-2 pt-2 border-t border-[#E9EDEF]">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Topup button */}
                    <button
                      type="button"
                      onClick={() => setTopupModalMerchant(merchant)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>شحن الكريدي</span>
                    </button>

                    {/* Stand QR + NFC preview */}
                    <button
                      type="button"
                      onClick={() => setStandModalMerchant(merchant)}
                      className="w-full py-2 px-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#D1D7DB] text-[#111B21] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#008069]" />
                      <span>الستاند (NFC)</span>
                    </button>
                  </div>

                  {/* Live Customer Pass Link */}
                  {merchant.samplePassSerial ? (
                    <Link
                      href={`/pass/${merchant.samplePassSerial}`}
                      className="w-full py-2 px-3 rounded-xl bg-[#008069]/10 hover:bg-[#008069]/20 border border-[#008069]/20 text-[#008069] font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      title="عرض بطاقة حية لزبون مسجل"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#008069]" />
                      <span>عرض كارت تجريبية (Live Pass)</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/join/${merchant.slug}`}
                      className="w-full py-2 px-3 rounded-xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#D1D7DB] text-[#54656F] text-xs flex items-center justify-center gap-1.5 transition font-medium"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>تسجيل أول زبون للكارط</span>
                    </Link>
                  )}

                  {/* Direct Links */}
                  <div className="flex items-center justify-between gap-1 text-[11px] pt-1">
                    <Link
                      href={`/m/${merchant.slug}`}
                      className="text-[#54656F] hover:text-[#008069] font-medium transition flex items-center gap-1"
                      title="معاينة لوحة تحكم التاجر"
                    >
                      <span>لوحة التاجر</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>

                    <Link
                      href={`/join/${merchant.slug}`}
                      className="text-[#54656F] hover:text-[#008069] font-medium transition flex items-center gap-1"
                      title="رابط انضمام الزبائن والكارط"
                    >
                      <span>رابط الكليان</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>

                    <Link
                      href={`/admin/merchants/${merchant.id}`}
                      className="text-[#54656F] hover:text-[#008069] font-medium transition flex items-center gap-1"
                      title="تعديل إعدادات المحل"
                    >
                      <span>تعديل</span>
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


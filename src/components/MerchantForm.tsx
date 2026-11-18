"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  MapPin,
  Phone,
  KeyRound,
  Award,
  Coins,
  Radio,
  Sparkles,
  ChevronRight,
  Save,
  Check,
  AlertCircle,
  Eye,
  QrCode,
  Coffee,
  Scissors,
  Utensils,
  Car,
  Shirt,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { NICHE_PRESETS, PLANS_INFO } from "@/lib/constants";
import WalletPassPreview from "@/components/WalletPassPreview";
import StandPreviewModal from "@/components/StandPreviewModal";

interface MerchantFormData {
  id?: string;
  name: string;
  slug: string;
  niche: string;
  city: string;
  phone: string;
  pinCode: string;
  logoIcon: string;
  primaryColor: string;
  bgGradient: string;
  stampsRequired: number;
  rewardName: string;
  customerPrefix: string;
  loyaltyMode: string;
  cashbackRate: number;
  welcomeCashback: number;
  minCashbackRedeem: number;
  currency: string;
  latitude: number | null;
  longitude: number | null;
  radarMessage: string;
  googleMapsUrl: string;
  plan: string;
  credits: number;
  autoWinback: boolean;
  autoBirthday: boolean;
  autoReview: boolean;
  autoRadar: boolean;
  autoNearReward: boolean;
  isActive: boolean;
}

interface MerchantFormProps {
  initialData?: Partial<MerchantFormData>;
  isEdit?: boolean;
}

export default function MerchantForm({ initialData, isEdit = false }: MerchantFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<MerchantFormData>({
    id: initialData?.id || "",
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    niche: initialData?.niche || "cafe",
    city: initialData?.city || "الدار البيضاء",
    phone: initialData?.phone || "",
    pinCode: initialData?.pinCode || "1234",
    logoIcon: initialData?.logoIcon || "coffee",
    primaryColor: initialData?.primaryColor || "#5b3519",
    bgGradient:
      initialData?.bgGradient || "linear-gradient(150deg,#6b4226 0%,#3d2414 100%)",
    stampsRequired: initialData?.stampsRequired || 5,
    rewardName: initialData?.rewardName || "قهوة مجانية",
    customerPrefix: initialData?.customerPrefix || "عزيزي",
    loyaltyMode: initialData?.loyaltyMode || "BOTH",
    cashbackRate: initialData?.cashbackRate ?? 10,
    welcomeCashback: initialData?.welcomeCashback ?? 5,
    minCashbackRedeem: initialData?.minCashbackRedeem ?? 0,
    currency: initialData?.currency || "DH",
    latitude: initialData?.latitude ?? 33.5731,
    longitude: initialData?.longitude ?? -7.5898,
    radarMessage:
      initialData?.radarMessage ||
      "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة لجمع الأختام والكاش باك.",
    googleMapsUrl: initialData?.googleMapsUrl || "",
    plan: initialData?.plan || "GROWTH",
    credits: initialData?.credits ?? 1000,
    autoWinback: initialData?.autoWinback ?? true,
    autoBirthday: initialData?.autoBirthday ?? true,
    autoReview: initialData?.autoReview ?? true,
    autoRadar: initialData?.autoRadar ?? true,
    autoNearReward: initialData?.autoNearReward ?? false,
    isActive: initialData?.isActive ?? true,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStandModalOpen, setIsStandModalOpen] = useState<boolean>(false);
  const [previewStamps, setPreviewStamps] = useState<number>(3);
  const [previewLoyaltyType, setPreviewLoyaltyType] = useState<"STAMPS" | "CASHBACK">("STAMPS");

  // Auto-slug generator on name change if not manually edited in create mode
  const handleNameChange = (val: string) => {
    const slugified = val
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]+/g, "")
      .replace(/--+/g, "-");

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: isEdit ? prev.slug : slugified || prev.slug,
    }));
  };

  // Niche preset selector chip
  const handleNicheSelect = (nicheKey: string) => {
    const preset = NICHE_PRESETS[nicheKey];
    if (!preset) return;

    setFormData((prev) => ({
      ...prev,
      niche: preset.id,
      logoIcon: preset.icon,
      primaryColor: preset.color,
      bgGradient: preset.gradient,
      rewardName: prev.name ? prev.rewardName : preset.reward,
      customerPrefix: preset.prefix,
      stampsRequired: preset.stamps,
      radarMessage: preset.radar,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit
        ? `/api/admin/merchants/${formData.id}`
        : `/api/admin/merchants`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل حفظ بيانات المحل");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("وقع خطأ غير متوقع أثناء الحفظ");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-white/50">
        <Link href="/admin" className="hover:text-sky-400 transition">
          لوحة الإدارة
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-white font-medium">
          {isEdit ? `تعديل محل: ${formData.name}` : "إضافة محل تجاري جديد"}
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Split-Screen Layout: Form on Right, Live iPhone & Stand Preview on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-[#111B21]">
        {/* Right Column: Form Inputs (7 cols on lg) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Niche Preset Chips */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-3">
            <label className="text-xs font-bold text-[#111B21] block">
              1. اختر نوع النشاط التجاري (Niche):
            </label>
            <p className="text-[11px] text-[#54656F]">
              اختيار النشاط يطبق تلقائياً الألوان الرسمية، الأيقونة، والمكافأة المقترحة.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {Object.values(NICHE_PRESETS).map((preset) => {
                const isSelected = formData.niche === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleNicheSelect(preset.id)}
                    className={`p-3 rounded-2xl border text-right transition flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-[#008069]/10 border-[#008069] text-[#111B21] font-bold shadow-sm ring-1 ring-[#008069]"
                        : "bg-[#F0F2F5] border-[#D1D7DB] hover:bg-[#E9EDEF] text-[#54656F]"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-xs font-semibold">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Basic Merchant Information */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#111B21] pb-2 border-b border-[#E9EDEF] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#008069]" />
              <span>2. البيانات الأساسية للمحل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  اسم المحل التجاري *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="مثلاً: Café Atlas أو صالون أنس"
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] placeholder-[#54656F] focus:outline-none focus:border-[#008069] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  رابط المحل (Slug) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="cafe-atlas"
                    className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] font-mono dir-ltr text-left focus:outline-none focus:border-[#008069] focus:bg-white transition"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-[#54656F]">
                    walink.ma/join/
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  المدينة
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="الدار البيضاء، الرباط، مراكش..."
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] placeholder-[#54656F] focus:outline-none focus:border-[#008069] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  رقم هاتف صاحب المحل
                </label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0661123456"
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] font-mono dir-ltr text-left focus:outline-none focus:border-[#008069] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  رمز الدخول السري (PIN Code)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={(e) =>
                    setFormData({ ...formData, pinCode: e.target.value })
                  }
                  placeholder="1234"
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#008069] font-mono font-bold tracking-widest text-center focus:outline-none focus:border-[#008069] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  لقب مخاطبة الزبون
                </label>
                <select
                  value={formData.customerPrefix}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPrefix: e.target.value })
                  }
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] focus:outline-none focus:border-[#008069] transition"
                >
                  <option value="آ السي">آ السي (للرجال / عام)</option>
                  <option value="آ لالة">آ لالة (للنساء / صالونات تجميل)</option>
                  <option value="عزيزي الزبون">عزيزي الزبون (رسمي)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Loyalty Card & Reward Rules */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#111B21] pb-2 border-b border-[#E9EDEF] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#008069]" />
              <span>3. إعدادات برنامج الولاء والمكافآت (أختام / كاش باك)</span>
            </h3>

            {/* Loyalty Mode Selector */}
            <div className="space-y-1.5 pb-3 border-b border-[#E9EDEF]">
              <label className="text-xs font-semibold text-[#111B21] block">
                نظام الولاء المعتمد للمتجر:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: "BOTH",
                    label: "النظامان معاً",
                    sub: "العميل يختار عند التسجيل",
                  },
                  {
                    id: "STAMPS",
                    label: "نظام الأختام فقط",
                    sub: "اجمع أختام واحصل على مكافأة",
                  },
                  {
                    id: "CASHBACK",
                    label: "نظام الكاش باك فقط",
                    sub: "استرجع نسبة % من كل فاتورة",
                  },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, loyaltyMode: mode.id })
                    }
                    className={`p-3 rounded-2xl border text-start transition ${
                      formData.loyaltyMode === mode.id
                        ? "bg-[#008069]/10 border-[#008069] text-[#111B21] ring-1 ring-[#008069] font-bold"
                        : "bg-[#F0F2F5] border-[#D1D7DB] text-[#54656F] hover:bg-[#E9EDEF]"
                    }`}
                  >
                    <span className="font-bold text-xs block text-[#111B21]">
                      {mode.label}
                    </span>
                    <span className="text-[10px] text-[#54656F]">{mode.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cashback Specific Fields (If BOTH or CASHBACK) */}
            {(formData.loyaltyMode === "BOTH" ||
              formData.loyaltyMode === "CASHBACK") && (
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-amber-900 mb-1 block">
                    نسبة الكاش باك (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.cashbackRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cashbackRate: parseFloat(e.target.value) || 10,
                      })
                    }
                    className="w-full bg-white border border-[#D1D7DB] rounded-xl px-3 py-2 text-xs font-mono text-[#111B21] focus:outline-none focus:border-[#008069]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-amber-900 mb-1 block">
                    هدية الترحيب للكاش باك (DH)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.welcomeCashback}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        welcomeCashback: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-[#D1D7DB] rounded-xl px-3 py-2 text-xs font-mono text-[#111B21] focus:outline-none focus:border-[#008069]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-amber-900 mb-1 block">
                    الحد الأدنى للصرف (DH)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minCashbackRedeem}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minCashbackRedeem: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-[#D1D7DB] rounded-xl px-3 py-2 text-xs font-mono text-[#111B21] focus:outline-none focus:border-[#008069]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  عدد الأختام للحصول على المكافأة ({formData.stampsRequired})
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={formData.stampsRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stampsRequired: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-[#008069] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#54656F] font-mono mt-1">
                  <span>3 أختام</span>
                  <span>5 (موصى به)</span>
                  <span>10 أختام</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  اسم المكافأة المجانية *
                </label>
                <input
                  type="text"
                  required
                  value={formData.rewardName}
                  onChange={(e) =>
                    setFormData({ ...formData, rewardName: e.target.value })
                  }
                  placeholder="قهوة مجانية، حلاقة مجانية، وجبة مجانية..."
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-amber-800 font-bold focus:outline-none focus:border-amber-400 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  اللون الأساسي للبطاقة
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    aria-label="قيمة اللون الأساسي Hex"
                    className="flex-1 bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3 py-2 text-xs font-mono text-[#111B21]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  تدرج خلفية البطاقة (CSS Gradient)
                </label>
                <input
                  type="text"
                  value={formData.bgGradient}
                  onChange={(e) =>
                    setFormData({ ...formData, bgGradient: e.target.value })
                  }
                  placeholder="linear-gradient(...)"
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#111B21] focus:outline-none focus:border-[#008069] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Plan & Initial Credits */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#111B21] pb-2 border-b border-[#E9EDEF] flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>4. باقة الاشتراك ورصيد الكريدي</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(PLANS_INFO).map((plan) => {
                const isSelected = formData.plan === plan.name;
                return (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        plan: plan.name,
                        credits: isEdit ? formData.credits : plan.credits,
                      })
                    }
                    className={`p-4 rounded-2xl border text-right transition ${
                      isSelected
                        ? "bg-[#008069]/10 border-[#008069] text-[#111B21] shadow-sm ring-1 ring-[#008069]"
                        : "bg-[#F0F2F5] border-[#D1D7DB] hover:bg-[#E9EDEF] text-[#54656F]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#111B21]">{plan.name}</span>
                      <span className="text-[11px] text-[#008069] font-bold">
                        {plan.price}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#54656F] block">
                      {plan.label} • {plan.credits} كريدي
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                رصيد الكريدي الأولي (Initial Credits)
              </label>
              <input
                type="number"
                value={formData.credits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credits: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full sm:w-64 bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-amber-700 font-mono font-bold focus:outline-none focus:border-amber-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Section 5: Radar Geofencing & Google Maps */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#111B21] pb-2 border-b border-[#E9EDEF] flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#008069]" />
              <span>5. رادار المحيط (100m Radar) ومراجعات Google Maps</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  خط العرض (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: parseFloat(e.target.value) || null,
                    })
                  }
                  placeholder="33.5731"
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] font-mono focus:outline-none focus:border-[#008069] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  خط الطول (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: parseFloat(e.target.value) || null,
                    })
                  }
                  placeholder="-7.5898"
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] font-mono focus:outline-none focus:border-[#008069] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  نص إشعار الرادار عند اقتراب الزبون بـ 100 متر
                </label>
                <textarea
                  rows={2}
                  value={formData.radarMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, radarMessage: e.target.value })
                  }
                  placeholder="راك دايز من حدانا! دوز مرحبا بيك..."
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] focus:outline-none focus:border-[#008069] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#111B21] mb-1.5 block">
                  رابط تقييمات خرائط جوجل (Google Maps Review Link)
                </label>
                <input
                  type="url"
                  value={formData.googleMapsUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapsUrl: e.target.value })
                  }
                  placeholder="https://maps.google.com/?cid=..."
                  className="w-full bg-[#F0F2F5] border border-[#D1D7DB] rounded-xl px-3.5 py-2.5 text-xs text-[#111B21] font-mono dir-ltr text-left focus:outline-none focus:border-[#008069] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Automation Flags */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#111B21] pb-2 border-b border-[#E9EDEF] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#008069]" />
              <span>6. محركات الأتمتة الذكية</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] cursor-pointer hover:bg-[#E9EDEF] transition">
                <input
                  type="checkbox"
                  checked={formData.autoWinback}
                  onChange={(e) =>
                    setFormData({ ...formData, autoWinback: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#008069] rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#111B21] block">
                    استرجاع الغابرين (Win-back)
                  </span>
                  <span className="text-[10px] text-[#54656F]">
                    إشعار تلقائي بعد 15 يوماً من عدم الزيارة
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] cursor-pointer hover:bg-[#E9EDEF] transition">
                <input
                  type="checkbox"
                  checked={formData.autoReview}
                  onChange={(e) =>
                    setFormData({ ...formData, autoReview: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#008069] rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#111B21] block">
                    مراجعات جوجل الآلية
                  </span>
                  <span className="text-[10px] text-[#54656F]">
                    طلب تقييم Google Maps بعد الزيارة الثالثة
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] cursor-pointer hover:bg-[#E9EDEF] transition">
                <input
                  type="checkbox"
                  checked={formData.autoRadar}
                  onChange={(e) =>
                    setFormData({ ...formData, autoRadar: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#008069] rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#111B21] block">
                    رادار الجيوفنسينغ
                  </span>
                  <span className="text-[10px] text-[#54656F]">
                    إشعار فوري عند المرور بجانب المحل
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] cursor-pointer hover:bg-[#E9EDEF] transition">
                <input
                  type="checkbox"
                  checked={formData.autoBirthday}
                  onChange={(e) =>
                    setFormData({ ...formData, autoBirthday: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#008069] rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#111B21] block">
                    مكافأة عيد الميلاد
                  </span>
                  <span className="text-[10px] text-[#54656F]">
                    طابع مضاعف أو هدية في يوم ميلاد الزبون
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#008069]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? "تحديث بيانات المحل" : "إنشاء وإطلاق المحل الآن"}</span>
                </>
              )}
            </button>

            <Link
              href="/admin"
              className="py-3.5 px-6 rounded-2xl bg-[#F0F2F5] hover:bg-[#E9EDEF] border border-[#D1D7DB] text-[#54656F] font-semibold text-sm transition"
            >
              إلغاء
            </Link>
          </div>
        </form>

        {/* Left Column: Sticky Live iPhone Pass Preview & Stand Quick View (5 cols on lg) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E9EDEF] shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E9EDEF]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#008069]" />
                <h3 className="font-bold text-sm text-[#111B21]">
                  معاينة مباشرة لشاشة الآيفون
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStandModalOpen(true)}
                className="text-xs text-[#008069] hover:text-[#00A884] font-semibold flex items-center gap-1 bg-[#008069]/10 px-2.5 py-1 rounded-xl border border-[#008069]/20 shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>معاينة الستاند</span>
              </button>
            </div>

            {/* Loyalty Pass Type Toggle for Preview */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0F2F5] rounded-2xl mb-3 text-xs border border-[#E9EDEF]">
              <button
                type="button"
                onClick={() => setPreviewLoyaltyType("STAMPS")}
                className={`py-1.5 rounded-xl font-bold transition ${
                  previewLoyaltyType === "STAMPS"
                    ? "bg-[#008069] text-white shadow-sm"
                    : "text-[#54656F] hover:text-[#111B21]"
                }`}
              >
                معاينة بطاقة الأختام
              </button>
              <button
                type="button"
                onClick={() => setPreviewLoyaltyType("CASHBACK")}
                className={`py-1.5 rounded-xl font-bold transition ${
                  previewLoyaltyType === "CASHBACK"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-[#54656F] hover:text-[#111B21]"
                }`}
              >
                معاينة بطاقة الكاش باك
              </button>
            </div>

            {/* Test Stamps Slider (Only for STAMPS preview) */}
            {previewLoyaltyType === "STAMPS" && (
              <div className="mb-4 p-3 bg-[#F0F2F5] rounded-2xl border border-[#E9EDEF] flex items-center justify-between">
                <span className="text-[11px] text-[#54656F] font-semibold">
                  تجربة عدد الأختام في المعاينة:
                </span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: formData.stampsRequired + 1 }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewStamps(idx)}
                      className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold transition ${
                        previewStamps === idx
                          ? "bg-[#008069] text-white shadow-sm"
                          : "bg-white text-[#54656F] hover:bg-[#E9EDEF] border border-[#D1D7DB]"
                      }`}
                    >
                      {idx}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Realistic iPhone Mockup Frame */}
            <div className="relative mx-auto w-[310px] sm:w-[340px] bg-[#F0F2F5] rounded-[48px] p-4 border-[6px] border-slate-300 shadow-xl">
              {/* iPhone Dynamic Island */}
              <div className="w-24 h-5 bg-black rounded-full mx-auto mb-4 border border-black/10 flex items-center justify-end px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></span>
              </div>

              {/* Apple Wallet Header */}
              <div className="text-center mb-3">
                <span className="text-[10px] tracking-wider text-[#54656F] uppercase font-mono font-semibold">
                  Apple Wallet • بطاقة المتجر
                </span>
              </div>

              {/* The Live Pass Component */}
              <WalletPassPreview
                name={formData.name || "اسم المحل هنا"}
                niche={formData.niche}
                primaryColor={formData.primaryColor}
                bgGradient={formData.bgGradient}
                loyaltyType={previewLoyaltyType}
                stamps={previewStamps}
                stampsRequired={formData.stampsRequired}
                rewardName={formData.rewardName || "المكافأة"}
                cashbackRate={formData.cashbackRate}
                cashbackBalance={formData.welcomeCashback}
                currency={formData.currency}
                memberCode="4821"
                compact={true}
              />

              {/* iPhone Home Bar */}
              <div className="w-28 h-1 bg-slate-400 rounded-full mx-auto mt-6"></div>
            </div>

            <p className="text-center text-[11px] text-[#54656F] mt-4">
              تتحدث المعاينة تلقائياً فور كتابة أي معلومة في النموذج.
            </p>
          </div>
        </div>
      </div>

      {/* Stand Preview Modal */}
      <StandPreviewModal
        isOpen={isStandModalOpen}
        onClose={() => setIsStandModalOpen(false)}
        merchant={{
          name: formData.name || "اسم المحل",
          slug: formData.slug || "merchant",
          niche: formData.niche,
          rewardName: formData.rewardName,
          stampsRequired: formData.stampsRequired,
          primaryColor: formData.primaryColor,
        }}
      />
    </div>
  );
}


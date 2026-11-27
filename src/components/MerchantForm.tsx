"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
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
  CheckCircle2,
  AlertCircle,
  Eye,
  QrCode,
  Search,
  Link2,
  Coffee,
  Scissors,
  Utensils,
  Car,
  Shirt,
  Smartphone,
  ExternalLink,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Gem,
  Gift,
  Pizza,
  Cake,
  IceCream2,
  CupSoda,
  Flower2,
  Heart,
  Stethoscope,
  Dumbbell,
  Smile,
  Wrench,
  Camera,
  Glasses,
  Laptop,
  PawPrint,
  BookOpen,
  Briefcase,
  Trophy,
  Crown,
  Flame,
  Star,
} from "lucide-react";
import { NICHE_PRESETS, PLANS_INFO } from "@/lib/constants";
import {
  computeMonthlySubscriptionFee,
  INSTALLATION_FEE_MAD,
  POINT_PRICE_MAD,
} from "@/lib/pricing";
import { getStandUrl } from "@/lib/urls";
import WalletPassPreview from "@/components/WalletPassPreview";
import StandPreviewModal from "@/components/StandPreviewModal";

export const CUSTOM_NICHE_ICONS = [
  // تجزئة ومتاجر
  { id: "store", label: "متجر عام", icon: Store },
  { id: "shopping-bag", label: "حقائب وموضة", icon: ShoppingBag },
  { id: "shopping-cart", label: "سوبرماركت", icon: ShoppingCart },
  { id: "tag", label: "تخفيضات ومستلزمات", icon: Tag },
  { id: "gem", label: "مجوهرات وذهب", icon: Gem },
  { id: "gift", label: "هدايا وعطور", icon: Gift },

  // مقاهي ومطاعم
  { id: "coffee", label: "مقهى وكافيه", icon: Coffee },
  { id: "utensils", label: "مطعم ووجبات", icon: Utensils },
  { id: "pizza", label: "بيتزا وسناك", icon: Pizza },
  { id: "cake", label: "حلويات ومخبزة", icon: Cake },
  { id: "ice-cream-2", label: "مثلجات وآيس كريم", icon: IceCream2 },
  { id: "cup-soda", label: "عصائر ومشروبات", icon: CupSoda },

  // صحة وتجميل ورياضة
  { id: "scissors", label: "حلاقة وصالون", icon: Scissors },
  { id: "sparkles", label: "تجميل وعناية", icon: Sparkles },
  { id: "flower-2", label: "سبا وعناية طبيعية", icon: Flower2 },
  { id: "dumbbell", label: "نادي وجيم", icon: Dumbbell },
  { id: "stethoscope", label: "صيدلية وعيادة", icon: Stethoscope },
  { id: "smile", label: "طب أسنان", icon: Smile },
  { id: "heart", label: "صحة ورعاية", icon: Heart },

  // سيارات وخدمات وتقنية
  { id: "car", label: "لافاچ وسيارات", icon: Car },
  { id: "wrench", label: "صيانة وإصلاحات", icon: Wrench },
  { id: "shirt", label: "مصبانة وتنظيف", icon: Shirt },
  { id: "camera", label: "تصوير واستوديو", icon: Camera },
  { id: "glasses", label: "بصريات ونظارات", icon: Glasses },
  { id: "smartphone", label: "هواتف وإلكترونيات", icon: Smartphone },
  { id: "laptop", label: "حواسيب وإعلاميات", icon: Laptop },
  { id: "paw-print", label: "بيطري وحيوانات", icon: PawPrint },
  { id: "book-open", label: "مكتبة ووراقة", icon: BookOpen },
  { id: "briefcase", label: "خدمات واستشارات", icon: Briefcase },
  { id: "trophy", label: "أنشطة وبطولات", icon: Trophy },
  { id: "crown", label: "خدمات VIP", icon: Crown },
  { id: "flame", label: "شواء وطاقة", icon: Flame },
  { id: "star", label: "تميز عام", icon: Star },
];

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
  maxBranches: number;
  credits: number;
  autoWinback: boolean;
  autoReview: boolean;
  autoRadar: boolean;
  autoNearReward: boolean;
  allowMultiStamps: boolean;
  isActive: boolean;
}

export interface AvailableQrStandOption {
  id: string;
  code: string;
  batchLabel: string | null;
  createdAt: string;
}

export interface LinkedQrStandInfo {
  id: string;
  code: string;
  branchName: string | null;
  batchLabel: string | null;
  scanCount: number;
  assignedAt: string | null;
}

interface MerchantFormProps {
  initialData?: Partial<MerchantFormData>;
  isEdit?: boolean;
  availableStands?: AvailableQrStandOption[];
  linkedStands?: LinkedQrStandInfo[];
}

export default function MerchantForm({
  initialData,
  isEdit = false,
  availableStands = [],
  linkedStands = [],
}: MerchantFormProps) {
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
    latitude: initialData?.latitude ?? null,
    longitude: initialData?.longitude ?? null,
    radarMessage:
      initialData?.radarMessage ||
      "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة لجمع الأختام والكاش باك.",
    googleMapsUrl: initialData?.googleMapsUrl || "",
    plan: initialData?.plan || "GROWTH",
    maxBranches: initialData?.maxBranches ?? (initialData?.plan === "MULTI" ? 3 : 1),
    credits: initialData?.credits ?? 1000,
    autoWinback: initialData?.autoWinback ?? true,
    autoReview: initialData?.autoReview ?? true,
    autoRadar: initialData?.autoRadar ?? true,
    autoNearReward: initialData?.autoNearReward ?? false,
    allowMultiStamps: initialData?.allowMultiStamps ?? false,
    isActive: initialData?.isActive ?? true,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStandModalOpen, setIsStandModalOpen] = useState<boolean>(false);
  const [previewStamps, setPreviewStamps] = useState<number>(3);
  const [previewLoyaltyType, setPreviewLoyaltyType] = useState<"STAMPS" | "CASHBACK">("STAMPS");
  const [standMode, setStandMode] = useState<"AUTO" | "PREGENERATED">("AUTO");
  const [selectedStandId, setSelectedStandId] = useState<string>("");
  const [standBranchName, setStandBranchName] = useState<string>("");
  const [standSearchQuery, setStandSearchQuery] = useState<string>("");
  const [selectedStandQrUrl, setSelectedStandQrUrl] = useState<string>("");

  const selectedStand = useMemo(
    () => availableStands.find((stand) => stand.id === selectedStandId) || null,
    [availableStands, selectedStandId]
  );

  const filteredAvailableStands = useMemo(() => {
    const q = standSearchQuery.trim().toLowerCase();
    if (!q) return availableStands;
    return availableStands.filter(
      (stand) =>
        stand.code.toLowerCase().includes(q) ||
        (stand.batchLabel || "").toLowerCase().includes(q)
    );
  }, [availableStands, standSearchQuery]);

  useEffect(() => {
    if (standMode !== "PREGENERATED" || !selectedStand) {
      setSelectedStandQrUrl("");
      return;
    }

    let cancelled = false;
    QRCode.toDataURL(getStandUrl(selectedStand.code), {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "H",
      color: {
        dark: "#161514",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setSelectedStandQrUrl(dataUrl);
        }
      })
      .catch((err) => {
        console.warn("Stand QR preview generation warning:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [standMode, selectedStand]);

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
      logoIcon:
        preset.id === "other" &&
        prev.logoIcon &&
        prev.logoIcon !== "coffee" &&
        prev.logoIcon !== "scissors" &&
        prev.logoIcon !== "utensils" &&
        prev.logoIcon !== "car" &&
        prev.logoIcon !== "sparkles" &&
        prev.logoIcon !== "shirt"
          ? prev.logoIcon
          : preset.icon,
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

      const payload = isEdit
        ? formData
        : {
            ...formData,
            standId:
              standMode === "PREGENERATED" && selectedStandId
                ? selectedStandId
                : null,
            standBranchName:
              standMode === "PREGENERATED" && selectedStandId
                ? standBranchName.trim() || null
                : null,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
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
      <div className="flex items-center gap-2 text-xs text-[#161514]/65">
        <Link href="/admin" className="hover:text-[#DA5004] transition font-medium">
          لوحة الإدارة
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
        <span className="text-[#161514] font-semibold">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-[#161514]">
        {/* Right Column: Form Inputs (7 cols on lg) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Niche Preset Chips */}
          <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-[#161514] block">
                1. اختر نوع النشاط التجاري (Niche):
              </label>
              <p className="text-[11px] text-[#161514]/65 mt-0.5">
                اختيار النشاط يطبق تلقائياً الألوان الرسمية، الأيقونة، والمكافأة المقترحة.
              </p>
            </div>

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
                        ? "bg-[#F85B04]/10 border-[#F85B04] text-[#161514] font-bold shadow-sm ring-1 ring-[#F85B04]"
                        : "bg-[#EFEAE4] border-[#161514]/15 hover:bg-[#E5DFD7] text-[#161514]/65"
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

            {/* Custom Niche Icon Picker (Only when "نشاط تجاري آخر" is selected) */}
            {formData.niche === "other" && (
              <div className="pt-3 border-t border-[#161514]/10 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#161514]">
                    <Sparkles className="w-4 h-4 text-[#DA5004]" />
                    <span>اختر أيقونة النشاط التجاري (Icon Picker):</span>
                  </div>
                  <span className="text-[11px] text-[#161514]/65 bg-[#EFEAE4] px-2.5 py-0.5 rounded-lg border border-[#161514]/15">
                    الأيقونة المحددة: <span className="font-mono font-bold text-[#DA5004]">{formData.logoIcon || "store"}</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#161514]/65">
                  ستظهر هذه الأيقونة في أعلى بطاقة العميل وداخل خانات الطوابع بدلاً من الأرقام التقليدية.
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1 max-h-60 overflow-y-auto p-1.5 border border-[#161514]/10 rounded-2xl bg-[#EFEAE4]">
                  {CUSTOM_NICHE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isIconSelected =
                      formData.logoIcon?.toLowerCase() === item.id.toLowerCase() ||
                      formData.logoIcon?.toLowerCase().replace(/[\s_-]+/g, "") === item.id.toLowerCase().replace(/[\s_-]+/g, "");
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logoIcon: item.id }))}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                          isIconSelected
                            ? "bg-[#F85B04]/15 border-[#F85B04] text-[#DA5004] font-bold shadow-sm ring-2 ring-[#F85B04]"
                            : "bg-white border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#475569] hover:border-[#CBD5E1]"
                        }`}
                        title={item.label}
                      >
                        <IconComp className={`w-5 h-5 flex-shrink-0 ${isIconSelected ? "text-[#DA5004]" : "text-[#64748B]"}`} />
                        <span className="text-[10px] leading-tight truncate w-full text-center">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Basic Merchant Information */}
          <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#161514] pb-2 border-b border-[#161514]/10 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#DA5004]" />
              <span>2. البيانات الأساسية للمحل</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  اسم المحل التجاري *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="مثلاً: Café Atlas أو صالون أنس"
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] placeholder-[#161514]/45 focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
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
                    className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] font-mono dir-ltr text-left focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] text-[#161514]/65">
                    walink.ma/join/
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  المدينة
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="الدار البيضاء، الرباط، مراكش..."
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] placeholder-[#161514]/45 focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  رقم هاتف صاحب المحل
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0661123456"
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] font-mono dir-ltr text-left focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 flex items-center justify-between">
                  <span>
                    {formData.plan === "MULTI" || (formData.maxBranches ?? 1) > 1
                      ? "رمز الدخول السري للمدير (Owner Master PIN)"
                      : "رمز الدخول السري (PIN Code)"}
                  </span>
                  {(formData.plan === "MULTI" || (formData.maxBranches ?? 1) > 1) && (
                    <span className="text-[10px] text-[#DA5004] font-bold">صلاحية كاملة</span>
                  )}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={(e) =>
                    setFormData({ ...formData, pinCode: e.target.value })
                  }
                  placeholder="1234"
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#DA5004] font-mono font-bold tracking-widest text-center focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                />
                {(formData.plan === "MULTI" || (formData.maxBranches ?? 1) > 1) && (
                  <p className="text-[10px] text-[#161514]/65 mt-1">
                    كود خاص بصاحب المشروع لإدارة الفروع ونظام الولاء (من 4 إلى 6 أرقام).
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  لقب مخاطبة الزبون
                </label>
                <select
                  value={formData.customerPrefix}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPrefix: e.target.value })
                  }
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] focus:outline-none focus:border-[#F85B04] transition"
                >
                  <option value="آ السي">آ السي (للرجال / عام)</option>
                  <option value="آ لالة">آ لالة (للنساء / صالونات تجميل)</option>
                  <option value="عزيزي الزبون">عزيزي الزبون (رسمي)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Loyalty Card & Reward Rules */}
          <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#161514] pb-2 border-b border-[#161514]/10 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#DA5004]" />
              <span>3. إعدادات برنامج الولاء والمكافآت (أختام / كاش باك)</span>
            </h3>

            {/* Loyalty Mode Selector */}
            <div className="space-y-1.5 pb-3 border-b border-[#161514]/10">
              <label className="text-xs font-semibold text-[#161514] block">
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
                        ? "bg-[#F85B04]/10 border-[#F85B04] text-[#161514] ring-1 ring-[#F85B04] font-bold"
                        : "bg-[#EFEAE4] border-[#161514]/15 text-[#161514]/65 hover:bg-[#E5DFD7]"
                    }`}
                  >
                    <span className="font-bold text-xs block text-[#161514]">
                      {mode.label}
                    </span>
                    <span className="text-[10px] text-[#161514]/65">{mode.sub}</span>
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
                    inputMode="decimal"
                    min="1"
                    max="50"
                    value={formData.cashbackRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cashbackRate: parseFloat(e.target.value) || 10,
                      })
                    }
                    className="w-full bg-white border border-[#161514]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#161514] focus:outline-none focus:border-[#F85B04]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-amber-900 mb-1 block">
                    هدية الترحيب للكاش باك (DH)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={formData.welcomeCashback}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        welcomeCashback: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-[#161514]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#161514] focus:outline-none focus:border-[#F85B04]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-amber-900 mb-1 block">
                    الحد الأدنى للصرف (DH)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={formData.minCashbackRedeem}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minCashbackRedeem: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-[#161514]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#161514] focus:outline-none focus:border-[#F85B04]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
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
                  className="w-full accent-[#F85B04] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#161514]/65 font-mono mt-1">
                  <span>3 أختام</span>
                  <span>5 (موصى به)</span>
                  <span>10 أختام</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
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
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-amber-800 font-bold focus:outline-none focus:border-amber-400 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
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
                    className="flex-1 bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3 py-2 text-xs font-mono text-[#161514]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  تدرج خلفية البطاقة (CSS Gradient)
                </label>
                <input
                  type="text"
                  value={formData.bgGradient}
                  onChange={(e) =>
                    setFormData({ ...formData, bgGradient: e.target.value })
                  }
                  placeholder="linear-gradient(...)"
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#161514] focus:outline-none focus:border-[#F85B04] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Monthly Plan, Branch Pricing & Postpaid Points */}
          <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#161514]/10">
              <h3 className="text-sm font-bold text-[#161514] flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>4. باقة الاشتراك الشهري وإدارة الفروع</span>
              </h3>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="text-[11px] font-bold text-emerald-900">
                  الاشتراك الشهري المحسوب:
                </span>
                <span className="text-xs font-black font-mono text-[#DA5004]">
                  {computeMonthlySubscriptionFee(formData.plan, formData.maxBranches)} DH / شهر
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(PLANS_INFO).map((plan) => {
                const isSelected = formData.plan === plan.name;
                return (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => {
                        if (plan.name === "STARTER") {
                          return {
                            ...prev,
                            plan: "STARTER",
                            maxBranches: 1,
                            autoRadar: false,
                            autoReview: false,
                          };
                        }
                        if (plan.name === "MULTI") {
                          return {
                            ...prev,
                            plan: "MULTI",
                            maxBranches: Math.max(2, prev.maxBranches || 2),
                            autoRadar: true,
                            autoReview: true,
                          };
                        }
                        return {
                          ...prev,
                          plan: "GROWTH",
                          maxBranches: 1,
                          autoRadar: true,
                          autoReview: true,
                        };
                      })
                    }
                    className={`p-4 rounded-2xl border text-right transition ${
                      isSelected
                        ? "bg-[#F85B04]/10 border-[#F85B04] text-[#161514] shadow-sm ring-1 ring-[#F85B04]"
                        : "bg-[#EFEAE4] border-[#161514]/15 hover:bg-[#E5DFD7] text-[#161514]/65"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#161514]">{plan.name}</span>
                      <span className="text-[11px] text-[#DA5004] font-bold">
                        {plan.price}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#161514]/65 block">
                      {plan.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {formData.plan === "STARTER" && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                تنبيه باقة 149 درهم: هذه الباقة لا تشمل رادار 100 متر على شاشات القفل ولا محرك تقييمات Google Maps.
              </div>
            )}

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 flex items-center justify-between">
                  <span>عدد الفروع المسموح بها (maxBranches) *</span>
                  <span className="text-[10px] text-[#DA5004] font-bold">
                    +100 درهم لكل فرع إضافي
                  </span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={formData.plan === "MULTI" ? 2 : 1}
                  max="50"
                  value={formData.maxBranches}
                  onChange={(e) => {
                    const nextBranches = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setFormData((prev) => ({
                      ...prev,
                      maxBranches: nextBranches,
                      plan:
                        nextBranches > 1
                          ? "MULTI"
                          : prev.plan === "STARTER"
                          ? "STARTER"
                          : "GROWTH",
                      ...(nextBranches > 1 ? { autoRadar: true, autoReview: true } : {}),
                    }));
                  }}
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#DA5004] font-mono font-bold focus:outline-none focus:border-[#F85B04] focus:bg-white"
                />
                <p className="text-[10px] text-[#161514]/65 mt-1">
                  يتغير الاشتراك الشهري تلقائياً (1 فرع = 199 درهم أو 149 للأساسية | فرعان = 299 درهم | 3 فروع = 399 درهم...).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EFEAE4] border border-[#161514]/15 space-y-1 text-xs">
                <span className="font-bold text-[#161514] block">ملخص الفوترة الشهرية:</span>
                <div className="flex justify-between text-[11px] text-[#161514]/65">
                  <span>الاشتراك الشهري:</span>
                  <span className="font-mono font-bold text-[#DA5004]">
                    {computeMonthlySubscriptionFee(formData.plan, formData.maxBranches)} DH
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#161514]/65">
                  <span>ثمن التثبيت (أول شهر فقط):</span>
                  <span className="font-mono font-bold text-[#161514]">
                    {INSTALLATION_FEE_MAD} DH
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#161514]/65">
                  <span>احتساب النقاط (آخر الشهر):</span>
                  <span className="font-mono font-bold text-amber-700">
                    {POINT_PRICE_MAD} DH / نقطة
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Radar Geofencing & Google Maps */}
          <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#161514] pb-2 border-b border-[#161514]/10 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#DA5004]" />
              <span>5. رادار المحيط (100m Radar) ومراجعات Google Maps</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  خط العرض (Latitude)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={formData.latitude ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: parseFloat(e.target.value) || null,
                    })
                  }
                  placeholder="33.5731"
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] font-mono focus:outline-none focus:border-[#F85B04] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  خط الطول (Longitude)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={formData.longitude ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: parseFloat(e.target.value) || null,
                    })
                  }
                  placeholder="-7.5898"
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] font-mono focus:outline-none focus:border-[#F85B04] focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  نص إشعار الرادار عند اقتراب الزبون بـ 100 متر (Apple Wallet للآيفون)
                </label>
                <textarea
                  rows={2}
                  value={formData.radarMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, radarMessage: e.target.value })
                  }
                  placeholder="راك دايز من حدانا! دوز مرحبا بيك..."
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] focus:outline-none focus:border-[#F85B04] focus:bg-white"
                />
                <p className="text-[10px] text-[#161514]/65 mt-1">
                  ملاحظة: يظهر إشعار القرب 100 متر تلقائياً على شاشة قفل iPhone عبر Apple Wallet. Google Wallet على الأندرويد لا يدعم تنبيهات القرب الجغرافية.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#161514] mb-1.5 block">
                  رابط تقييمات خرائط جوجل (Google Maps Review Link)
                </label>
                <input
                  type="url"
                  value={formData.googleMapsUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapsUrl: e.target.value })
                  }
                  placeholder="https://maps.google.com/?cid=..."
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] font-mono dir-ltr text-left focus:outline-none focus:border-[#F85B04] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Automation Flags */}
          <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#161514] pb-2 border-b border-[#161514]/10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#DA5004]" />
              <span>6. محركات الأتمتة الذكية</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#EFEAE4] border border-[#161514]/10 cursor-pointer hover:bg-[#E5DFD7] transition">
                <input
                  type="checkbox"
                  checked={formData.autoWinback}
                  onChange={(e) =>
                    setFormData({ ...formData, autoWinback: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#F85B04] rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#161514] block">
                    استرجاع الغابرين (Win-back)
                  </span>
                  <span className="text-[10px] text-[#161514]/65">
                    إشعار تلقائي بعد 15 يوماً من عدم الزيارة
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                  formData.plan === "STARTER"
                    ? "bg-[#EFEAE4]/60 border-[#161514]/10 opacity-60 cursor-not-allowed"
                    : "bg-[#EFEAE4] border-[#161514]/10 cursor-pointer hover:bg-[#E5DFD7]"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={formData.plan === "STARTER"}
                  checked={formData.plan === "STARTER" ? false : formData.autoReview}
                  onChange={(e) =>
                    setFormData({ ...formData, autoReview: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#F85B04] rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <div>
                  <span className="text-xs font-bold text-[#161514] block">
                    مراجعات جوجل الآلية {formData.plan === "STARTER" ? "(مقفول في باقة 149 DH)" : ""}
                  </span>
                  <span className="text-[10px] text-[#161514]/65">
                    طلب تقييم Google Maps بعد الزيارة الثالثة
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                  formData.plan === "STARTER"
                    ? "bg-[#EFEAE4]/60 border-[#161514]/10 opacity-60 cursor-not-allowed"
                    : "bg-[#EFEAE4] border-[#161514]/10 cursor-pointer hover:bg-[#E5DFD7]"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={formData.plan === "STARTER"}
                  checked={formData.plan === "STARTER" ? false : formData.autoRadar}
                  onChange={(e) =>
                    setFormData({ ...formData, autoRadar: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#F85B04] rounded cursor-pointer disabled:cursor-not-allowed"
                />
                <div>
                  <span className="text-xs font-bold text-[#161514] block">
                    رادار الجيوفنسينغ {formData.plan === "STARTER" ? "(مقفول في باقة 149 DH)" : ""}
                  </span>
                  <span className="text-[10px] text-[#161514]/65">
                    إشعار فوري عند المرور بجانب المحل
                  </span>
                </div>
              </label>

              <label
                className={`sm:col-span-2 flex items-center justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer transition min-h-[44px] ${
                  formData.allowMultiStamps
                    ? "bg-emerald-50 border-[#008069]/40 shadow-sm"
                    : "bg-[#EFEAE4] border-[#161514]/10 hover:bg-[#E5DFD7]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.allowMultiStamps}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowMultiStamps: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-[#F85B04] rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#161514] block">
                      صلاحية التحكم في عدد الأختام (+ / -)
                    </span>
                    <span className="text-[10px] text-[#161514]/65">
                      عند التفعيل تظهر أزرار + و - في نافذة الأختام لإضافة أكثر من ختم دفعة واحدة أو خصم ختم لتصحيح خطأ، مع قفل الإضافة لمدة 30 دقيقة.
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
                    formData.allowMultiStamps
                      ? "bg-[#F85B04] text-white"
                      : "bg-white text-[#161514]/65 border border-[#161514]/15"
                  }`}
                >
                  {formData.allowMultiStamps ? "مفعّل" : "معطّل"}
                </span>
              </label>
            </div>
          </div>

          {/* Section 7: Pre-Generated QR Stand Assignment (Create Mode) or Linked Stands Read-Only (Edit Mode) */}
          {!isEdit ? (
            <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#161514]/10">
                <h3 className="text-sm font-bold text-[#161514] flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#DA5004]" />
                  <span>7. كود الـ QR المولّد مسبقاً (اختياري)</span>
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-[#EFEAE4] border border-[#161514]/10 text-[11px] font-bold text-[#161514] tabular-nums">
                  {availableStands.length} ستاند جاهز
                </span>
              </div>

              <p className="text-xs text-[#161514]/65 leading-relaxed">
                يمكنك ربط ستاند مطبوع مسبقاً بهذا المتجر الآن، أو ترك الوضع التلقائي ليتم إنشاء كود الـ QR المباشر للمتجر كما هو معتاد.
              </p>

              {/* Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStandMode("AUTO");
                    setSelectedStandId("");
                    setStandBranchName("");
                  }}
                  className={`min-h-[52px] p-3.5 rounded-2xl border text-start transition flex items-start gap-3 ${
                    standMode === "AUTO"
                      ? "bg-[#F85B04]/10 border-[#F85B04] text-[#161514] ring-1 ring-[#F85B04] shadow-sm"
                      : "bg-[#EFEAE4] border-[#161514]/15 text-[#161514]/70 hover:bg-[#E5DFD7]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      standMode === "AUTO"
                        ? "bg-[#F85B04] text-white"
                        : "bg-white text-[#161514]/65 border border-[#161514]/10"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#161514] block">
                      توليد QR جديد تلقائياً (الافتراضي)
                    </span>
                    <span className="text-[11px] text-[#161514]/65 block mt-0.5">
                      يُنشئ رابط التسجيل المباشر (/join/slug) بدون ربط ستاند مسبق.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStandMode("PREGENERATED")}
                  className={`min-h-[52px] p-3.5 rounded-2xl border text-start transition flex items-start gap-3 ${
                    standMode === "PREGENERATED"
                      ? "bg-[#F85B04]/10 border-[#F85B04] text-[#161514] ring-1 ring-[#F85B04] shadow-sm"
                      : "bg-[#EFEAE4] border-[#161514]/15 text-[#161514]/70 hover:bg-[#E5DFD7]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      standMode === "PREGENERATED"
                        ? "bg-[#F85B04] text-white"
                        : "bg-white text-[#161514]/65 border border-[#161514]/10"
                    }`}
                  >
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#161514] block">
                      اختيار QR مولّد مسبقاً من المخزون
                    </span>
                    <span className="text-[11px] text-[#161514]/65 block mt-0.5 tabular-nums">
                      ربط فوري بأحد أكواد الستاند الجاهزة ({availableStands.length} متاح).
                    </span>
                  </div>
                </button>
              </div>

              {standMode === "PREGENERATED" && (
                <div className="p-4 rounded-2xl bg-[#EFEAE4] border border-[#161514]/10 space-y-4">
                  {availableStands.length === 0 ? (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-xs font-semibold text-[#161514]">
                        لا توجد أكواد QR غير مربوطة متاحة حالياً في المخزون.
                      </p>
                      <p className="text-[11px] text-[#161514]/65">
                        يمكنك متابعة إنشاء المتجر بالـ QR التلقائي أو توليد دفعة ستاندات جديدة أولاً.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                        <Link
                          href="/admin/stands"
                          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F85B04] hover:bg-[#DA5004] text-white text-xs font-bold transition shadow-sm"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>إدارة وتوليد ستاندات QR</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setStandMode("AUTO");
                            setSelectedStandId("");
                          }}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-[#161514]/15 text-[#161514] text-xs font-semibold hover:bg-[#E5DFD7] transition"
                        >
                          العودة للتوليد التلقائي
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="stand-search-input"
                          className="text-xs font-semibold text-[#161514] mb-1.5 block"
                        >
                          ابحث بكود الستاند أو اسم الدفعة:
                        </label>
                        <div className="relative">
                          <Search className="w-4 h-4 text-[#161514]/45 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="stand-search-input"
                            type="text"
                            value={standSearchQuery}
                            onChange={(e) => setStandSearchQuery(e.target.value)}
                            placeholder="مثلاً: WLK-001 أو اسم الدفعة..."
                            className="w-full min-h-[44px] bg-white border border-[#161514]/15 rounded-xl ps-10 pe-3.5 py-2 text-base sm:text-sm text-[#161514] placeholder-[#161514]/45 focus:outline-none focus:border-[#F85B04] transition"
                          />
                        </div>
                      </div>

                      {filteredAvailableStands.length === 0 ? (
                        <p className="text-xs text-[#161514]/65 text-center py-3 bg-white rounded-xl border border-[#161514]/10">
                          لا توجد نتائج مطابقة للبحث &quot;{standSearchQuery}&quot;.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                          {filteredAvailableStands.map((stand) => {
                            const isPicked = selectedStandId === stand.id;
                            return (
                              <button
                                key={stand.id}
                                type="button"
                                onClick={() => setSelectedStandId(stand.id)}
                                className={`min-h-[52px] p-3 rounded-xl border text-start transition flex flex-col justify-between gap-1 ${
                                  isPicked
                                    ? "bg-white border-[#F85B04] ring-2 ring-[#F85B04] shadow-sm"
                                    : "bg-white/90 border-[#161514]/10 hover:border-[#F85B04]/50 hover:bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 w-full">
                                  <span
                                    dir="ltr"
                                    className={`text-xs font-mono font-extrabold tabular-nums ${
                                      isPicked ? "text-[#DA5004]" : "text-[#161514]"
                                    }`}
                                  >
                                    {stand.code}
                                  </span>
                                  {isPicked && (
                                    <CheckCircle2 className="w-4 h-4 text-[#F85B04] shrink-0" />
                                  )}
                                </div>
                                <span className="text-[10px] text-[#161514]/60 truncate w-full">
                                  {stand.batchLabel || "ستاند جاهز للربط"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {selectedStand ? (
                        <div className="p-4 rounded-2xl bg-white border border-[#F85B04]/35 flex flex-col sm:flex-row items-center gap-4">
                          {selectedStandQrUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={selectedStandQrUrl}
                              alt={`QR Code for ${selectedStand.code}`}
                              width={88}
                              height={88}
                              className="w-[88px] h-[88px] rounded-xl border border-[#161514]/10 shrink-0"
                            />
                          ) : (
                            <div className="w-[88px] h-[88px] rounded-xl bg-[#EFEAE4] border border-[#161514]/10 flex items-center justify-center shrink-0">
                              <QrCode className="w-7 h-7 text-[#DA5004]" />
                            </div>
                          )}

                          <div className="flex-1 w-full space-y-2.5 text-start">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="text-xs font-bold text-[#161514] block">
                                  الستاند المحدد:{" "}
                                  <span dir="ltr" className="font-mono text-[#DA5004] tabular-nums">
                                    {selectedStand.code}
                                  </span>
                                </span>
                                <span
                                  dir="ltr"
                                  className="text-[11px] font-mono text-[#161514]/60 break-all block mt-0.5"
                                >
                                  {getStandUrl(selectedStand.code)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setStandMode("AUTO");
                                  setSelectedStandId("");
                                  setStandBranchName("");
                                }}
                                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-[#EFEAE4] hover:bg-[#E5DFD7] text-[#161514] text-[11px] font-semibold border border-[#161514]/10 transition"
                              >
                                إلغاء الاختيار (إنشاء QR جديد)
                              </button>
                            </div>

                            <div>
                              <label
                                htmlFor="stand-branch-input"
                                className="text-[11px] font-semibold text-[#161514] mb-1 block"
                              >
                                اسم الفرع أو نقطة الكاونتر (اختياري):
                              </label>
                              <input
                                id="stand-branch-input"
                                type="text"
                                maxLength={80}
                                value={standBranchName}
                                onChange={(e) => setStandBranchName(e.target.value)}
                                placeholder="مثلاً: الفرع الرئيسي - كاشير 1"
                                className="w-full min-h-[44px] bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2 text-base sm:text-sm text-[#161514] placeholder-[#161514]/45 focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#DA5004] font-semibold">
                          اختر أحد الأكواد أعلاه لربطه بالمتجر، أو ارجع للوضع التلقائي إذا أردت إنشاء QR جديد فقط.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#161514]/10">
                <h3 className="text-sm font-bold text-[#161514] flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#DA5004]" />
                  <span>7. الستاندات المطبوعة المرتبطة بالمتجر</span>
                </h3>
                <Link
                  href="/admin/stands"
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFEAE4] hover:bg-[#E5DFD7] text-[#161514] text-xs font-semibold border border-[#161514]/10 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#DA5004]" />
                  <span>إدارة الستاندات</span>
                </Link>
              </div>

              {linkedStands.length === 0 ? (
                <p className="text-xs text-[#161514]/65">
                  لا يوجد ستاند مطبوع مربوط بهذا المتجر حالياً — يعتمد المتجر على رابط الـ QR المباشر (<span dir="ltr" className="font-mono">/join/{formData.slug}</span>).
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {linkedStands.map((stand) => (
                    <div
                      key={stand.id}
                      className="p-3 rounded-2xl bg-[#EFEAE4] border border-[#161514]/10 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span
                          dir="ltr"
                          className="text-xs font-mono font-extrabold text-[#DA5004] tabular-nums block"
                        >
                          {stand.code}
                        </span>
                        <span className="text-[11px] text-[#161514]/65 truncate block">
                          {stand.branchName || stand.batchLabel || "مرتبط بالمتجر"}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[#161514]/10 text-[11px] font-mono font-bold text-[#161514] tabular-nums shrink-0">
                        {stand.scanCount} مسح
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F9742A] to-[#F85B04] hover:from-[#F85B04] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#F85B04]/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
              className="py-3.5 px-6 rounded-2xl bg-[#EFEAE4] hover:bg-[#E5DFD7] border border-[#161514]/15 text-[#161514]/65 font-semibold text-sm transition"
            >
              إلغاء
            </Link>
          </div>
        </form>

        {/* Left Column: Sticky Live iPhone Pass Preview & Stand Quick View (5 cols on lg) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#161514]/10">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#DA5004]" />
                <h3 className="font-bold text-sm text-[#161514]">
                  معاينة مباشرة لشاشة الآيفون
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStandModalOpen(true)}
                className="text-xs text-[#DA5004] hover:text-[#F85B04] font-semibold flex items-center gap-1 bg-[#F85B04]/10 px-2.5 py-1 rounded-xl border border-[#F85B04]/25 shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>معاينة الستاند</span>
              </button>
            </div>

            {/* Loyalty Pass Type Toggle for Preview */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EFEAE4] rounded-2xl mb-3 text-xs border border-[#161514]/10">
              <button
                type="button"
                onClick={() => setPreviewLoyaltyType("STAMPS")}
                className={`py-1.5 rounded-xl font-bold transition ${
                  previewLoyaltyType === "STAMPS"
                    ? "bg-[#F85B04] text-white shadow-sm"
                    : "text-[#161514]/65 hover:text-[#161514]"
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
                    : "text-[#161514]/65 hover:text-[#161514]"
                }`}
              >
                معاينة بطاقة الكاش باك
              </button>
            </div>

            {/* Test Stamps Slider (Only for STAMPS preview) */}
            {previewLoyaltyType === "STAMPS" && (
              <div className="mb-4 p-3 bg-[#EFEAE4] rounded-2xl border border-[#161514]/10 flex items-center justify-between">
                <span className="text-[11px] text-[#161514]/65 font-semibold">
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
                          ? "bg-[#F85B04] text-white shadow-sm"
                          : "bg-white text-[#161514]/65 hover:bg-[#E5DFD7] border border-[#161514]/15"
                      }`}
                    >
                      {idx}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Realistic iPhone Mockup Frame */}
            <div className="relative mx-auto w-[310px] sm:w-[340px] bg-[#EFEAE4] rounded-[48px] p-4 border-[6px] border-slate-300 shadow-xl">
              {/* iPhone Dynamic Island */}
              <div className="w-24 h-5 bg-black rounded-full mx-auto mb-4 border border-black/10 flex items-center justify-end px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></span>
              </div>

              {/* Apple Wallet Header */}
              <div className="text-center mb-3">
                <span className="text-[10px] tracking-wider text-[#161514]/65 uppercase font-mono font-semibold">
                  Apple Wallet • بطاقة المتجر
                </span>
              </div>

              {/* The Live Pass Component */}
              <WalletPassPreview
                name={formData.name || "اسم المحل هنا"}
                niche={formData.niche}
                logoIcon={formData.logoIcon}
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

            <p className="text-center text-[11px] text-[#161514]/65 mt-4">
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


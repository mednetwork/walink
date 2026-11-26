"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { getStoreUrl } from "@/lib/urls";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Smartphone,
  Gift,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Flame,
  Radio,
  Send,
  HelpCircle,
  Copy,
  Check,
  X,
  Coffee,
  Scissors,
  Utensils,
  Car,
  Sparkle,
  Shirt,
  ShoppingBag,
  Coins,
  QrCode,
  Lock,
  Layers,
  Users,
  Eye,
  Store,
} from "lucide-react";
import WalletPassPreview from "@/components/WalletPassPreview";
import SiteFooter from "@/components/SiteFooter";
import { soundEngine } from "@/lib/sound";

interface NicheConfig {
  id: string;
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  primaryColor: string;
  bgGradient: string;
  rewardName: string;
  customerPrefix: string;
  defaultName: string;
}

const NICHES: NicheConfig[] = [
  {
    id: "cafe",
    name: "مقهى / كافي",
    label: "كافي",
    icon: Coffee,
    primaryColor: "#5b3519",
    bgGradient: "linear-gradient(150deg, #6b4226 0%, #3d2414 100%)",
    rewardName: "قهوة فابور",
    customerPrefix: "السي/للا",
    defaultName: "Café Atlas",
  },
  {
    id: "barber",
    name: "صالون حلاقة رجالي",
    label: "حلاق",
    icon: Scissors,
    primaryColor: "#1e3a5f",
    bgGradient: "linear-gradient(150deg, #1e3a5f 0%, #0d1b2a 100%)",
    rewardName: "حسانة فابور",
    customerPrefix: "السي",
    defaultName: "Barber Anas",
  },
  {
    id: "snack",
    name: "مطعم / سناك / طاكوس",
    label: "سناك",
    icon: Utensils,
    primaryColor: "#b45309",
    bgGradient: "linear-gradient(150deg, #b45309 0%, #78350f 100%)",
    rewardName: "وجبة فابور",
    customerPrefix: "السي/للا",
    defaultName: "Snack Marrakech",
  },
  {
    id: "carwash",
    name: "لافاچ وغسيل السيارات",
    label: "لافاچ",
    icon: Car,
    primaryColor: "#0e7490",
    bgGradient: "linear-gradient(150deg, #0e7490 0%, #155e75 100%)",
    rewardName: "غسلة فابور",
    customerPrefix: "السي/للا",
    defaultName: "Lavaj Royal",
  },
  {
    id: "beauty",
    name: "صالون تجميل وسبا",
    label: "تجميل",
    icon: Sparkle,
    primaryColor: "#be185d",
    bgGradient: "linear-gradient(150deg, #be185d 0%, #831843 100%)",
    rewardName: "سوان فابور",
    customerPrefix: "للا",
    defaultName: "Salon Noor",
  },
  {
    id: "laundry",
    name: "مصبانة وتصبين سريع",
    label: "مصبانة",
    icon: Shirt,
    primaryColor: "#6d28d9",
    bgGradient: "linear-gradient(150deg, #6d28d9 0%, #4c1d95 100%)",
    rewardName: "تصبين فابور",
    customerPrefix: "السي/للا",
    defaultName: "Pressing Atlas",
  },
  {
    id: "other",
    name: "محل تجاري / بوتيك",
    label: "محل آخر",
    icon: ShoppingBag,
    primaryColor: "#047857",
    bgGradient: "linear-gradient(150deg, #047857 0%, #064e3b 100%)",
    rewardName: "كادو فابور",
    customerPrefix: "الزبون المحترم",
    defaultName: "Boutique Casablanca",
  },
];

const MOROCCAN_CITIES = [
  "الدار البيضاء",
  "الرباط",
  "مراكش",
  "طنجة",
  "أكادير",
  "فاس",
  "مكناس",
  "وجدة",
  "القنيطرة",
  "تطوان",
  "تمارة",
  "سلا",
  "الجديدة",
  "المحمدية",
  "بني ملال",
  "خريبكة",
  "الناظور",
  "تازة",
  "المضيق",
];

export default function MarketingLandingClient() {
  const searchParams = useSearchParams();

  // 1. Personalized Demo State from URL query or defaults
  const [selectedNicheId, setSelectedNicheId] = useState<string>("cafe");
  const [shopName, setShopName] = useState<string>("Café Atlas");
  const [customizedViaUrl, setCustomizedViaUrl] = useState<boolean>(false);

  // 2. Interactive iPhone Demo States
  const [demoScreen, setDemoScreen] = useState<"pass" | "dashboard">("pass");
  const [demoStamps, setDemoStamps] = useState<number>(3);
  const [demoInteractionsCount, setDemoInteractionsCount] = useState<number>(0);
  const [activeBanner, setActiveBanner] = useState<{
    id: string;
    title: string;
    message: string;
    type: "stamp" | "reward" | "radar" | "winback" | "promo" | "review";
    actionUrl?: string;
  } | null>(null);

  // 3. Mini Owner App Subtabs
  const [ownerTab, setOwnerTab] = useState<"home" | "customers" | "promo" | "auto">("home");
  const [ownerCredits, setOwnerCredits] = useState<number>(1000);
  const [ownerPromoMsg, setOwnerPromoMsg] = useState<string>("عرض الويكاند: -20% هاد السبت والحد");
  const [ownerSentCount, setOwnerSentCount] = useState<number>(0);
  const [ownerPeekModal, setOwnerPeekModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });

  // 4. Hero Screen 3.8s Notification Cycling
  const [heroNotifIndex, setHeroNotifIndex] = useState<number>(0);

  // 5. ROI Calculator Sliders
  const [lostCustomersCount, setLostCustomersCount] = useState<number>(6);
  const [averageSpend, setAverageSpend] = useState<number>(30);

  // 6. Checkout Sheet Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    title: string;
    price: string;
  }>({ id: "growth", title: "المتجر العادي (199 DH/شهر)", price: "199 DH/شهر + 300 DH تثبيت" });
  const [checkoutCity, setCheckoutCity] = useState<string>("الدار البيضاء");
  const [checkoutPhone, setCheckoutPhone] = useState<string>("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // 7. FAQ Accordion Active Index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Active Niche object
  const activeNiche = useMemo(() => {
    return NICHES.find((n) => n.id === selectedNicheId) || NICHES[0];
  }, [selectedNicheId]);

  // Read URL parameters (?name=...&type=...) on load
  useEffect(() => {
    const paramName = searchParams.get("name") || searchParams.get("n");
    const paramType = searchParams.get("type") || searchParams.get("t");

    if (paramName || paramType) {
      if (paramName) {
        setShopName(paramName);
      }
      if (paramType) {
        const found = NICHES.find(
          (n) => n.id === paramType.toLowerCase() || n.label === paramType
        );
        if (found) setSelectedNicheId(found.id);
      }
      setCustomizedViaUrl(true);

      // Smooth scroll to demo section
      const demoElement = document.getElementById("demo");
      if (demoElement) {
        setTimeout(() => {
          demoElement.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [searchParams]);

  // Cycle Hero Notifications every 3.8s
  const heroNotifications = useMemo(
    () => [
      {
        id: "h1",
        time: "الآن",
        title: "طابع جديد تزاد فـ الكارط! ☕️",
        body: `وصلتي لـ 4 من 5 طوابع فـ ${shopName}. باقي ليك طابع واحد!`,
        icon: "stamp",
      },
      {
        id: "h2",
        time: "الآن",
        title: "🏆 مبروك! قهوتك فابور واجدة دابا",
        body: `جمعتي كاع الطوابع فـ ${shopName}! خود المكافأة ديالك في أي وقت.`,
        icon: "reward",
      },
      {
        id: "h3",
        time: "منذ دقيقتين",
        title: "⭐ كيف جاتك الخدمة؟ خلي تقييم فـ Google",
        body: `رأيك كيهمنا بزاف فـ ${shopName}! كليكي هنا وشارك تقييمك فـ 5 ثواني.`,
        icon: "review",
      },
      {
        id: "h4",
        time: "الآن • رادار 100m",
        title: `📍 راك قريب من ${shopName}!`,
        body: "الكارط ديالك واجدة فـ Apple Wallet! دوز خود قهوتك وجمع طابع جديد ☕",
        icon: "radar",
      },
      {
        id: "h5",
        time: "البارح",
        title: `🎁 توحشناك فـ ${shopName}!`,
        body: "هادي كثر من 15 يوم ما شفناك! دوز هاد السيمانة وعندك طابع هدية ترحيبية.",
        icon: "winback",
      },
      {
        id: "h6",
        time: "منذ ساعة",
        title: `📣 عرض الويكاند من ${shopName}`,
        body: "تخفيض 20% على جميع المشروبات والحلويات هاد السبت والحد!",
        icon: "promo",
      },
    ],
    [shopName]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroNotifIndex((prev) => (prev + 1) % heroNotifications.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [heroNotifications.length]);

  // Show floating glass notification in interactive demo
  const triggerBanner = (
    title: string,
    message: string,
    type: "stamp" | "reward" | "radar" | "winback" | "promo" | "review",
    actionUrl?: string
  ) => {
    setActiveBanner({
      id: `banner-${Date.now()}`,
      title,
      message,
      type,
      actionUrl,
    });

    if (type === "reward") {
      soundEngine.playRewardChime();
    } else if (type === "radar") {
      soundEngine.playRadarPing();
    } else {
      soundEngine.playStampChime();
    }

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([25, 40, 25]);
      } catch {
        // ignore
      }
    }

    setDemoInteractionsCount((prev) => prev + 1);

    setTimeout(() => {
      setActiveBanner(null);
    }, 5500);
  };

  // Handler: Main "زيد طابع" Button
  const handleAddStamp = () => {
    const nextStamps = demoStamps >= 5 ? 1 : demoStamps + 1;
    setDemoStamps(nextStamps);

    if (nextStamps === 5) {
      triggerBanner(
        "🏆 مبروك! الكادو ديالك واجد!",
        `جمعتي 5/5 طوابع! بصحتك ${activeNiche.rewardName} فـ ${shopName}.`,
        "reward"
      );
      // Auto follow-up review prompt after 2s
      setTimeout(() => {
        triggerBanner(
          "⭐ تقييم 5 نجوم فـ خرائط Google",
          `عجباتك الخدمة فـ ${shopName}؟ خلي لينا تقييم زوين فـ Google Maps!`,
          "review",
          "https://maps.google.com"
        );
      }, 2500);
    } else {
      triggerBanner(
        "طابع جديد تزاد فـ الكارط! ☕️",
        `وصلتي لـ ${nextStamps} من 5 طوابع فـ ${shopName}.`,
        "stamp"
      );
    }
  };

  // Handler: Checkout Order Submit
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      alert("يرجى إدخال اسم المحل");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      // 1. Save Lead in database
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: shopName.trim(),
          niche: activeNiche.id,
          city: checkoutCity,
          phone: checkoutPhone.trim(),
          plan: selectedPlan.id,
          price: selectedPlan.price,
          usedDemo: demoInteractionsCount > 0,
        }),
      });

      // 2. Format Moroccan Darija WhatsApp Order Message
      const waMessage = `السلام عليكم فريق Walink 👋
بغيت نطلب باك بطاقة الوفاء الذكية لمحلي:

🏢 اسم المحل: ${shopName.trim()}
📍 النشاط: ${activeNiche.name}
🏙 المدينة: ${checkoutCity}
📦 الباقة المختارة: ${selectedPlan.title} (${selectedPlan.price} درهم)
${checkoutPhone ? `📞 رقم الهاتف: ${checkoutPhone}` : ""}

واش ممكن توجدو ليا التصميم والستاند ديال الكاونتر؟ شكراً!`;

      const waUrl = `https://wa.me/212661848790?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, "_blank");

      setIsCheckoutOpen(false);
    } catch (err) {
      console.error("Error submitting lead:", err);
      alert("حدث خطأ أثناء حفظ الطلب، سيتم توجيهك للواتساب مباشرة.");
      window.open("https://wa.me/212661848790", "_blank");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // ROI calculations
  const monthlyRevenueGain = Math.round(lostCustomersCount * averageSpend * 2.5);
  const planCost = 199; // Standard monthly plan
  const paybackMonths = Math.max(1, Math.ceil((planCost + 300) / Math.max(100, monthlyRevenueGain)));

  const faqs = [
    {
      q: "واش الكليان كيحتاج يتيليشارجي شي أبليكاسيون من Play Store ولا App Store؟",
      a: "نهائياً! الكليان كيسكاني الستاند بكاميرا التيليفون أو بلمسة NFC فـ 5 ثواني، والكارط كتدخل أوتوماتيك لـ Apple Wallet (فـ iPhone) و Google Wallet (فـ Android) وكتخدم بلا أنترنيت.",
    },
    {
      q: "كيفاش خدام رادار 100 ميترو بلا ما يكون التيليفون مكونيكطي؟",
      a: "Apple Wallet و Google Wallet مدمجين مباشرة مع نظام تحديد المواقع الجغرافي (GPS) الأصلي ديال الهاتف. ملي كيدوز الكليان فـ محيط 100 متر من المحل، التيليفون كيشعل راسو وكيطلع إشعار القرب فـ شاشة القفل تلقائياً.",
    },
    {
      q: "شنو كيشمل ثمن التثبيت لأول مرة (300 درهم)؟",
      a: "رسوم التثبيت 300 درهم كتدفع مرة وحدة فقط عند التفعيل الأول، وكتشمل تصميم بطاقة محلك بهويتك، إعداد النظام بالكامل، وتجهيز ستاند الكاونتر الذكي (NFC + QR).",
    },
    {
      q: "شنو هو الستاند الذكي اللي كيوصل مع الباك؟",
      a: "ستاند كاونتر فاخر مصنوع من الأكريليك المقاوم للماء والكسر، مدمج برقيقة NFC ذكية ورمز QR مطبوع بدقة عالية، مصمم باسم محلك وألوان علامتك التجارية، كتحطو فوق الكاونتر والكليان غير كيحط تيليفونو عليه كياخد الكارط.",
    },
    {
      q: "كيفاش كتكون طريقة الدفع والضمانة؟",
      a: "كنخدمو بمبدأ الثقة 50/50: 50% تسبيق عند تأكيد الطلب ومعاينة التصميم الرقمي لكارط محلك، و 50% الباقية عند استلام الستاند وتجربته في محلك. والتوصيل مجاني لجميع مدن المغرب.",
    },
    {
      q: "واش ممكن نجرب السيستيم قبل ما نشري؟",
      a: "نعم! تقدر تجرب الديمو التفاعلي هنا فـ الصفحة، ولا تدخل تجرّب لوحة تحكم التاجر الحقيقية (/m/cafe-atlas) وتشوف كيفاش كيطبع التاجر الطوابع بالكاميرا فـ ثانية وحدة.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white selection:bg-emerald-500 selection:text-black font-arabic antialiased relative overflow-x-clip">
      {/* 3 Floating Animated Ambient Radial Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -left-32 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-24 right-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      {/* A. Fixed Glass Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">
                  walink<span className="text-emerald-400">.ma</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  والينك
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-white/70">
            <a href="#demo" className="hover:text-emerald-400 transition">
              جرّب الديمو
            </a>
            <a href="#how" className="hover:text-emerald-400 transition">
              كيفاش خدام
            </a>
            <a href="#engines" className="hover:text-emerald-400 transition">
              المحركات الأربعة
            </a>
            <a href="#compare" className="hover:text-emerald-400 transition">
              المقارنة والأرباح
            </a>
            <a href="#pricing" className="hover:text-emerald-400 transition">
              الأثمنة
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition">
              الأسئلة الشائعة
            </a>
            <Link href="/support" className="hover:text-emerald-400 transition text-emerald-400">
              الدعم والمساعدة
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>ابدأ دابا</span>
              <ArrowLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-8 sm:py-14">
        {/* B. Hero Section with Living 3D Phone & NFC Stand */}
        <section className="text-center space-y-10 pt-4">
          {/* Live Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>+40 محل فـ كازا والرباط ومراكش كيتسناو الفوج الجديد 🇲🇦</span>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-5 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.2]">
              خلّي كليانك يرجعو لمحلك،
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                بكارط وفاء رقمية فـ التيليفون.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
              فـ <strong>Apple Wallet</strong> و <strong>Google Wallet</strong>. بلا أبليكاسيون كتيليشارجا، وبلا اشتراك شهري كيخلع.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs">
              <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>رادار 100 ميترو (GPS)</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>تقييمات خرائط Google</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>استرجاع الغابرين (15 يوم)</span>
              </span>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
              <a
                href="#demo"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Smartphone className="w-5 h-5" />
                <span>جرّب الديمو فـ التيليفون دابا ⚡️</span>
              </a>

              <a
                href="#pricing"
                className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm sm:text-base flex items-center gap-2 transition"
              >
                <span>شوف الأثمنة والباقات</span>
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
              </a>
            </div>

            {/* Trust Checks */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>خلاص لمرة واحدة فقط</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>واجد فـ 48 ساعة</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>توصيل الستاند حتى للمحل 🇲🇦</span>
              </span>
            </div>
          </div>

          {/* 3D Hero Visual Composition: Titanium iPhone with Cycling Notifications + Acrylic Counter Stand */}
          <div className="pt-6 relative max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Phone Frame */}
            <div className="w-[300px] sm:w-[330px] rounded-[48px] p-3.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-600/60 shadow-2xl shadow-emerald-500/10 relative">
              {/* Screen */}
              <div className="w-full rounded-[40px] bg-[#0B0F17] overflow-hidden border border-white/10 flex flex-col justify-between p-4 min-h-[580px] relative">
                {/* Dynamic Island / Speaker */}
                <div className="w-24 h-5 rounded-full bg-black mx-auto mb-3 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-3" />
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-950/40" />
                </div>

                {/* Lockscreen Clock */}
                <div className="text-center space-y-1 my-2">
                  <span className="text-[10px] text-white/60 font-semibold block">
                    الخميس، 12 نونبر
                  </span>
                  <span className="text-5xl font-light font-mono text-white tracking-tighter">
                    9:41
                  </span>
                </div>

                {/* Cycling Notification Stack */}
                <div className="my-auto space-y-3">
                  <div className="text-right px-1 flex items-center justify-between text-[11px] text-white/50">
                    <span>إشعار مباشر الآن</span>
                    <span className="font-mono">walink.ma</span>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel border border-white/20 bg-slate-900/95 shadow-2xl text-right space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 flex items-center justify-center">
                          <Gift className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-white">
                          {heroNotifications[heroNotifIndex].title}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono">
                        {heroNotifications[heroNotifIndex].time}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/75 leading-relaxed">
                      {heroNotifications[heroNotifIndex].body}
                    </p>
                  </div>
                </div>

                {/* Compact Apple Wallet Pass Slivers */}
                <div className="pt-4">
                  <WalletPassPreview
                    name={shopName}
                    niche={activeNiche.id}
                    primaryColor={activeNiche.primaryColor}
                    bgGradient={activeNiche.bgGradient}
                    stamps={4}
                    stampsRequired={5}
                    rewardName={activeNiche.rewardName}
                    memberCode="4821"
                    compact={true}
                  />
                </div>
              </div>
            </div>

            {/* Acrylic Counter Stand Mockup */}
            <div className="w-[280px] sm:w-[310px] rounded-3xl p-5 bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/20 backdrop-blur-xl shadow-2xl text-center space-y-4 relative md:-mr-6 group hover:scale-[1.02] transition-transform">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />

              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <span className="font-bold text-base text-white block">{shopName}</span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  ستاند الكاونتر الذكي (NFC + QR)
                </span>
              </div>

              {/* Scannable Real QR Preview */}
              <div className="p-3 bg-white rounded-2xl mx-auto w-40 h-40 shadow-xl flex items-center justify-center">
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-900">
                  <QrCode className="w-32 h-32" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-xs text-white block">
                  سكاني وخود الكارط ديالك فـ 5 ثواني
                </span>
                <span className="text-[10px] text-white/60">
                  حط التيليفون ولا سكاني بالكاميرا • بلا أبليكاسيون
                </span>
              </div>

              <div className="pt-1 flex items-center justify-center gap-3 text-[10px] font-mono text-emerald-400 font-bold">
                <span>NFC TAP ⚡️</span>
                <span>•</span>
                <span>QR SCAN 📷</span>
              </div>
            </div>
          </div>
        </section>

        {/* C. Interactive Dual-Mode Live Demo (#demo) */}
        <section id="demo" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>جرب النظام مباشرة الآن • Live Interactive Demo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              جرّب كيفاش غادي تبان الكارط فـ محلك
            </h2>
            <p className="text-sm text-white/60">
              بدّل اسم المحل واختار نوع النشاط، واطبع الطوابع وجرب إشعارات رادار 100م واسترجاع الغابرين مباشرة!
            </p>
          </div>

          {/* URL Personalized Banner */}
          {customizedViaUrl && (
            <div className="max-w-2xl mx-auto p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                تم تخصيص هذه التجربة خصيصاً لـ <strong>{shopName}</strong> ({activeNiche.name})!
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Control Card (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
                <div>
                  <label htmlFor="landing-shop-name" className="block text-xs font-bold text-white/80 mb-2">
                    1. سمية المحل ديالك (جرب كتب سميتك):
                  </label>
                  <input
                    id="landing-shop-name"
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="مثال: Café Atlas"
                    aria-label="اسم المحل التجاري"
                    className="w-full bg-[#111827] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <span className="block text-xs font-bold text-white/80 mb-2.5">
                    2. اختار نوع النشاط:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {NICHES.map((n) => {
                      const Icon = n.icon;
                      const isSelected = selectedNicheId === n.id;
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => {
                            setSelectedNicheId(n.id);
                            if (!customizedViaUrl) setShopName(n.defaultName);
                          }}
                          className={`p-3 rounded-2xl border text-right transition flex flex-col justify-between gap-2 ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400 shadow-lg shadow-emerald-500/10"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? "text-emerald-400" : "text-white/60"}`} />
                          <span className="font-bold text-xs">{n.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Niche Specs */}
                <div className="p-3.5 rounded-2xl bg-[#0B0F17]/80 border border-white/10 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">المكافأة المبرمجة:</span>
                    <strong className="text-amber-400">{activeNiche.rewardName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">عدد الطوابع:</span>
                    <strong className="text-white">5 طوابع</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">مناداة الزبون:</span>
                    <strong className="text-emerald-400">{activeNiche.customerPrefix}</strong>
                  </div>
                </div>

                {/* Direct CTA */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan({
                        id: "growth",
                        title: "المتجر العادي (199 DH/شهر)",
                        price: "199 DH/شهر + 300 DH تثبيت",
                      });
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>طلب هاد الكارط لمحلي دابا 🚀</span>
                  </button>
                </div>
              </div>

              {/* Smart Nudge Card */}
              {demoInteractionsCount >= 2 && (
                <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Zap className="w-4 h-4" />
                    <span>عجباتك تجربة الزبون؟</span>
                  </div>
                  <p className="leading-relaxed">
                    جرب تبدّل الفوق لـ <strong>لوحة التحكم</strong> باش تشوف كيفاش كيبان تطبيق التاجر وحملات البروموسيون، أو اطلب الباقة لمحلك مباشرة!
                  </p>
                </div>
              )}
            </div>

            {/* Right Interactive Phone Stage (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              {/* Segmented Tab Switcher */}
              <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1 mb-5">
                <button
                  type="button"
                  onClick={() => setDemoScreen("pass")}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    demoScreen === "pass"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>تيليفون الكليان (Apple/Google Wallet)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoScreen("dashboard")}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    demoScreen === "dashboard"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>لوحة التحكم ديالك (Merchant App)</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 text-[9px] font-black animate-pulse">
                    جديد
                  </span>
                </button>
              </div>

              {/* iPhone Frame */}
              <div className="w-[330px] sm:w-[360px] rounded-[48px] p-4 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-600/60 shadow-2xl shadow-emerald-500/10 relative">
                {/* Screen Canvas */}
                <div className="w-full rounded-[40px] bg-[#0B0F17] overflow-hidden border border-white/10 flex flex-col justify-between p-4 min-h-[590px] relative">
                  {/* Dynamic Island */}
                  <div className="w-24 h-5 rounded-full bg-black mx-auto mb-2 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-3" />
                  </div>

                  {/* Floating iOS 18 Glass Notification Banner */}
                  {activeBanner && (
                    <div className="absolute top-10 left-3 right-3 z-50 animate-in slide-in-from-top-3 duration-300">
                      <div className="p-3.5 rounded-2xl glass-panel border border-white/20 bg-slate-900/95 shadow-2xl flex items-start gap-2.5 text-right">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 flex items-center justify-center flex-shrink-0">
                          {activeBanner.type === "reward" ? (
                            <Gift className="w-4 h-4 animate-spin" />
                          ) : activeBanner.type === "radar" ? (
                            <MapPin className="w-4 h-4 animate-pulse" />
                          ) : activeBanner.type === "review" ? (
                            <Star className="w-4 h-4 fill-slate-950" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-xs text-white block truncate">
                            {activeBanner.title}
                          </span>
                          <p className="text-[11px] text-white/75 mt-0.5 leading-relaxed">
                            {activeBanner.message}
                          </p>
                          {activeBanner.actionUrl && (
                            <a
                              href={activeBanner.actionUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-bold"
                            >
                              <span>فتح التقييم ⭐</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveBanner(null)}
                          className="text-white/40 hover:text-white p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 1: Customer Phone (Pass View) */}
                  {demoScreen === "pass" ? (
                    <div className="space-y-4 flex-1 flex flex-col justify-between py-1">
                      {/* Apple Wallet Header */}
                      <div className="flex items-center justify-between text-xs text-white/60 pb-1 border-b border-white/5">
                        <span className="font-bold text-white">Apple Wallet</span>
                        <span className="font-mono text-[11px]">walink.ma</span>
                      </div>

                      {/* Live Pass Preview */}
                      <div className="my-auto">
                        <WalletPassPreview
                          name={shopName}
                          niche={activeNiche.id}
                          primaryColor={activeNiche.primaryColor}
                          bgGradient={activeNiche.bgGradient}
                          stamps={demoStamps}
                          stampsRequired={5}
                          rewardName={activeNiche.rewardName}
                          memberCode="4821"
                        />
                      </div>

                      {/* Pass Footer Meta */}
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] flex items-center justify-between text-white/70">
                        <span>آخر زيارة: <strong>اليوم</strong></span>
                        <span className="text-emerald-400 font-bold">
                          {demoStamps >= 5 ? "المكافأة واجدة 🎁" : `باقي ${5 - demoStamps} طوابع`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* TAB 2: Merchant Miniature Dashboard */
                    <div className="space-y-3 flex-1 flex flex-col justify-between py-1 text-right">
                      {/* Merchant Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div>
                          <span className="font-bold text-xs text-white block">{shopName}</span>
                          <span className="text-[10px] text-white/50">لوحة التاجر • Growth</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 font-mono text-xs font-bold border border-amber-500/20">
                          <Coins className="w-3 h-3" />
                          <span>{ownerCredits}</span>
                        </div>
                      </div>

                      {/* Subtab Content */}
                      {ownerTab === "home" && (
                        <div className="space-y-2.5 my-auto">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="glass-panel p-2.5 rounded-xl border border-white/10">
                              <span className="text-[10px] text-white/50 block">زيارات اليوم</span>
                              <span className="text-lg font-bold font-mono text-white">14</span>
                            </div>
                            <div className="glass-panel p-2.5 rounded-xl border border-white/10">
                              <span className="text-[10px] text-white/50 block">كليان مسجلين</span>
                              <span className="text-lg font-bold font-mono text-emerald-400">128</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-[11px]">
                            <span className="text-red-300 font-bold">3 كليان غبرو 15 يوم</span>
                            <button
                              type="button"
                              onClick={() => {
                                setOwnerTab("promo");
                                setOwnerPromoMsg(`توحشناك! دوز هاد السيمانة لـ ${shopName} وعندك طابع هدية`);
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]"
                            >
                              رجعهم
                            </button>
                          </div>
                        </div>
                      )}

                      {ownerTab === "customers" && (
                        <div className="space-y-1.5 my-auto max-h-48 overflow-y-auto no-scrollbar text-[11px]">
                          {[
                            { name: "كريم بناني", visits: 8, stamps: 3 },
                            { name: "ليلى التازي", visits: 12, stamps: 4 },
                            { name: "ياسين الإدريسي", visits: 2, stamps: 1 },
                          ].map((c, i) => (
                            <div key={i} className="p-2 rounded-xl bg-white/5 flex items-center justify-between">
                              <span className="font-bold text-white">{c.name}</span>
                              <span className="text-emerald-400 font-mono">{c.stamps}/5 طوابع</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {ownerTab === "promo" && (
                        <div className="space-y-2 my-auto text-xs">
                          <textarea
                            value={ownerPromoMsg}
                            onChange={(e) => setOwnerPromoMsg(e.target.value)}
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white text-[11px] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOwnerCredits((c) => Math.max(0, c - 20));
                              setOwnerSentCount((s) => s + 1);
                              triggerBanner(
                                `📣 بروموسيون من ${shopName}`,
                                ownerPromoMsg,
                                "promo"
                              );
                            }}
                            className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                          >
                            صيفط لـ كاع الكليان (Broadcast)
                          </button>
                        </div>
                      )}

                      {ownerTab === "auto" && (
                        <div className="space-y-2 my-auto text-[11px]">
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <span>استرجاع 15 يوم</span>
                            <span className="text-emerald-400 font-bold">مفعّل ✓</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <span>رادار 100 ميترو</span>
                            <span className="text-emerald-400 font-bold">مفعّل ✓</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <span>تقييمات Google</span>
                            <span className="text-emerald-400 font-bold">مفعّل ✓</span>
                          </div>
                        </div>
                      )}

                      {/* Bottom Sub-Navigation */}
                      <div className="pt-2 border-t border-white/10 grid grid-cols-4 text-center text-[10px]">
                        {[
                          { id: "home", label: "الرئيسية" },
                          { id: "customers", label: "الكليان" },
                          { id: "promo", label: "پرومو" },
                          { id: "auto", label: "أوتوماتيك" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setOwnerTab(t.id as typeof ownerTab)}
                            className={`py-1 rounded font-bold ${
                              ownerTab === t.id ? "text-emerald-400" : "text-white/50"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Full Real App Link */}
                      <div className="text-center pt-1 border-t border-white/5">
                        <a
                          href={getStoreUrl("cafe-atlas")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-400 hover:underline flex items-center justify-center gap-1 font-semibold"
                        >
                          <span>جرّب النظام الحقيقي الكامل ↗</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Control Dock Under Phone */}
              <div className="w-full max-w-[360px] mt-4 p-3 rounded-2xl glass-panel border border-white/10 space-y-2 text-center">
                <span className="text-[11px] text-white/60 font-semibold block">
                  تحكّم فـ التيليفون وجرب الإشعارات:
                </span>

                {/* Primary Button */}
                <button
                  type="button"
                  onClick={handleAddStamp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>زيد طابع فـ الكارط (+1 Stamp)</span>
                </button>

                {/* Secondary Trigger Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() =>
                      triggerBanner(
                        `📍 راك قريب من ${shopName}!`,
                        "الكارط ديالك واجدة فـ Apple Wallet! دوز خود قهوتك.",
                        "radar"
                      )
                    }
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-emerald-300"
                  >
                    رادار 100م
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      triggerBanner(
                        `🎁 توحشناك فـ ${shopName}!`,
                        "هادي كثر من 15 يوم ما شفناك! دوز هاد السيمانة وعندك طابع هدية.",
                        "winback"
                      )
                    }
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-rose-300"
                  >
                    الغابرين
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      triggerBanner(
                        `📣 عرض الويكاند من ${shopName}`,
                        "-20% على كاع الطلبات هاد السبت والحد!",
                        "promo"
                      )
                    }
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-amber-300"
                  >
                    پروموسيون
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      triggerBanner(
                        `⭐ تقييم 5 نجوم لـ ${shopName}`,
                        "عجباتك الخدمة؟ خلي لينا رأيك فـ خرائط Google فـ 5 ثواني!",
                        "review",
                        "https://maps.google.com"
                      )
                    }
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-blue-300"
                  >
                    تقييم Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* D. How It Works (#how) & 4 Engines Bento Grid (#engines) */}
        <section id="how" className="scroll-mt-24 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>طريقة العمل المبسّطة • How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              3 خطوات ساهلة، وبلا أي تعقيد
            </h2>
            <p className="text-sm text-white/60">
              صممنا Walink باش تكون أسرع وأبسط تجربة لزبنائك ولموظفيك داخل المحل.
            </p>
          </div>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xl font-mono">
                1
              </div>
              <h3 className="font-bold text-base text-white">
                الكليان كيسكاني الستاند (فـ 5 ثواني)
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                ملي كيوصل للكاونتر، كيحط التيليفون على الستاند (NFC) أو كيسكاني الكود بالكاميرا. ما كيتيليشارجي حتى شي أبليكاسيون وما كيدخل حتى كود معقد.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xl font-mono">
                2
              </div>
              <h3 className="font-bold text-base text-white">
                الكارط كتدخل لـ Wallet (ما كتضيعش)
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                كتسجل مباشرة فـ محفظة Apple Wallet فـ iPhone أو Google Wallet فـ Android. كتبقى ديما مخزونة فالتيليفون، ما كتقطعش وما كضيعش بحال الكاغيط.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xl font-mono">
                3
              </div>
              <h3 className="font-bold text-base text-white">
                السيستيم كيفكّرو أوتوماتيك
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                ملي يقرب من المحل (100m) كيوصلو تذكير بالرادار، وملي يغبر هادي 15 يوم كيوصلو إشعار توحشناك مع هدية باش يرجع، وكلشي كيخدم بوحدو ⚡️.
              </p>
            </div>
          </div>

          {/* 4 Engines Bento Grid (#engines) */}
          <div id="engines" className="scroll-mt-24 pt-6 space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold text-emerald-400">محركات النمو الذكية</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                4 محركات تقنية كتخدم فـ صالح محلك 24/7
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Large Radar 100m Card (2 columns on lg) */}
              <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent space-y-6 text-right relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">
                        رادار القرب 100 ميترو (Geofencing Radar)
                      </h4>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        كيخدم حتى بلا أنترنيت بنظام GPS الأصلي
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    ميزة حصرية فـ المغرب
                  </span>
                </div>

                <p className="text-xs text-white/70 leading-relaxed max-w-xl">
                  غير الكليان يدوز من الشارع ديال محلك فـ محيط 100 متر، التيليفون ديالو كيشعل راسو وكيطلع إشعار شاشة القفل: &quot;راك قريب من {shopName}، دوز خود قهوتك وجمع طابع جديد!&quot;.
                </p>

                {/* Animated Dark Radar Map Canvas Graphic */}
                <div className="w-full h-44 rounded-2xl bg-[#080C14] border border-white/10 relative overflow-hidden flex items-center justify-center">
                  {/* Map Grid Pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "radial-gradient(#10B981 1px, transparent 1px), radial-gradient(#10B981 1px, #080C14 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* 100m Dashed Circle */}
                  <div className="w-36 h-36 rounded-full border border-dashed border-emerald-400/40 flex items-center justify-center relative">
                    <span className="absolute -top-3 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-mono text-[9px] border border-emerald-500/30">
                      100m Radar Zone
                    </span>

                    {/* Rotating Conic Sweep */}
                    <div className="absolute inset-0 rounded-full animate-spin duration-3000 opacity-20 bg-[conic-gradient(from_0deg,transparent_0deg,#10B981_60deg,transparent_120deg)]" />

                    {/* Center Shop Pin */}
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 relative z-10 animate-bounce">
                      <Store className="w-4 h-4 stroke-[2.5]" />
                    </div>

                    {/* Walking Customer Dot */}
                    <div className="absolute top-2 right-4 flex items-center gap-1.5 animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-amber-400 shadow-md shadow-amber-400/50" />
                      <span className="text-[9px] text-amber-300 font-mono bg-black/70 px-1 rounded">
                        زبون مقترب
                      </span>
                    </div>
                  </div>

                  {/* Simulated Pop-in Notification */}
                  <div className="absolute bottom-2 left-4 right-4 p-2 rounded-xl bg-slate-900/95 border border-white/15 text-right flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white">📍 راك دايز من حدا {shopName}</span>
                    <span className="text-emerald-400 font-mono">الآن</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Google Maps Reviews */}
              <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.02] to-transparent space-y-4 text-right flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <h4 className="font-bold text-base text-white">
                    أتمتة مراجعات خرائط Google
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    ملي الكليان كيكمل 3 طوابع أو كياخد المكافأة ويكون فرحان بالخدمة، كيوصلو إشعار ذكي برابط مباشر باش يخلي ليك تقييم 5 نجوم فـ Google Maps ويطلع محلك فالأول فـ مدينتك.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-white/70">متوسط تقييم المحلات:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    4.9 ⭐ (+85 تقييم جديد)
                  </span>
                </div>
              </div>

              {/* Card 3: 15-Day Win-Back */}
              <div className="glass-panel p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.02] to-transparent space-y-4 text-right flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white">
                    استرجاع الغابرين (Win-Back)
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed">
                    أي زبون ما زارش محلك هادي كثر من 15 يوم، السيستيم كيعرفو أوتوماتيك وكيصيفط ليه رسالة بالدارجة: &quot;توحشناك! دوز هاد السيمانة وعندك طابع هدية ترحيبية 🎁&quot;.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between font-mono">
                  <span>نسبة رجوع الكليان:</span>
                  <strong>+28% فـ أول أسبوع</strong>
                </div>
              </div>

              {/* Card 4: 1-Click Broadcast Promo (2 cols on lg) */}
              <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.02] to-transparent space-y-4 text-right flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                      <Send className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-base text-white">
                      حملات البروموسيون بكليكة وحدة (Broadcast)
                    </h4>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    عندك نهار ميت أو ويكاند بغيتي تدور فيه الحركة؟ كتب الميساج فـ لوحة التحكم ديالك، وكليكي &quot;صيفط دابا&quot; وغادي يوصل إشعار شاشة القفل لجميع زبنائك في نفس اللحظة!
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#080C14] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/60">الوصول المباشر:</span>
                  <span className="text-emerald-400 font-mono font-bold">إشعار فوري مباشرة على شاشة القفل</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* E. Comparison Table & ROI Calculator (#compare) */}
        <section id="compare" className="scroll-mt-24 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>المقارنة وحساب الأرباح • ROI Calculator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              علاش Walink أفضل استثمار لمحلك؟
            </h2>
            <p className="text-sm text-white/60">
              مقارنة صريحة بين كارط الكاغيط، الأبليكاسيونات الشهرية المكلفة، ومنظومة Walink الذكية.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50 pb-3">
                  <th className="py-3 font-semibold">الميزة والمقارنة</th>
                  <th className="py-3 font-semibold text-white/40">كارط الكاغيط العادية</th>
                  <th className="py-3 font-semibold text-rose-300">أبليكاسيون باشتراك شهري</th>
                  <th className="py-3 font-bold text-emerald-400">منظومة Walink (والينك) ⭐</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-bold text-white">الثمن والتكلفة</td>
                  <td className="py-3.5">~ 4,500 DH (طباعة متكررة)</td>
                  <td className="py-3.5 font-mono text-rose-400">14,400 DH (400 DH/شهر)</td>
                  <td className="py-3.5 font-bold text-emerald-400 font-mono text-sm">
                    ابتداءً من 149 DH/شهر + 300 DH تثبيت
                  </td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-bold text-white">واش كتضيع من الكليان؟</td>
                  <td className="py-3.5 text-rose-400">نعم، 80% كينساوها فـ الدار</td>
                  <td className="py-3.5">لا</td>
                  <td className="py-3.5 text-emerald-400 font-bold">لا، ديما فـ Apple/Google Wallet</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-bold text-white">واش خاص يتيليشارجي تطبيق؟</td>
                  <td className="py-3.5">لا</td>
                  <td className="py-3.5 text-rose-400">نعم، و 70% كيرفضو يتيليشارجيو</td>
                  <td className="py-3.5 text-emerald-400 font-bold">نهائياً! سكان بالكاميرا فـ 5 ثواني</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-bold text-white">إشعارات فـ شاشة القفل؟</td>
                  <td className="py-3.5 text-rose-400">مستحيل</td>
                  <td className="py-3.5">أغلب الناس كيديرو لها Désactiver</td>
                  <td className="py-3.5 text-emerald-400 font-bold">إشعارات رسمية فـ الشاشة 100%</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-bold text-white">رادار القرب 100 ميترو (GPS)؟</td>
                  <td className="py-3.5 text-rose-400">غير موجود</td>
                  <td className="py-3.5 text-rose-400">غير موجود</td>
                  <td className="py-3.5 text-emerald-400 font-bold">موجود ومدمج أوتوماتيك ✓</td>
                </tr>
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 font-bold text-white">أتمتة مراجعات Google Maps؟</td>
                  <td className="py-3.5 text-rose-400">لا</td>
                  <td className="py-3.5 text-rose-400">لا</td>
                  <td className="py-3.5 text-emerald-400 font-bold">أوتوماتيكية لرفع ترتيب المحل ✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3-Year Cost Graph */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">مقارنة التكلفة الحقيقية لـ 3 سنوات:</span>
              <span className="text-emerald-400 font-bold">توفير أكثر من 11,200 درهم مع Walink!</span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 font-semibold">أبليكاسيون باشتراك شهري (400 DH × 36 شهر)</span>
                  <span className="font-mono text-rose-400 font-bold">14,400 درهم</span>
                </div>
                <div className="w-full h-4 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-semibold">منظومة Walink (المتجر العادي شامل الرادار والتقييمات)</span>
                  <span className="font-mono text-emerald-400 font-bold">199 DH / شهر</span>
                </div>
                <div className="w-full h-4 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[35%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive ROI Calculator */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent space-y-6">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-lg text-white">
                حاسبة العائد الاستثماري (واش السيستيم كيخلّص راسو؟)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders */}
              <div className="space-y-6 text-right">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-white/80">شحال من كليان غابر ممكن يرجع فـ الشهر؟</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      {lostCustomersCount} كليان
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={lostCustomersCount}
                    onChange={(e) => setLostCustomersCount(Number(e.target.value))}
                    aria-label="عدد الكليان الغابرين المسترجعين شهرياً"
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>1 كليان</span>
                    <span>15 كليان</span>
                    <span>30 كليان</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-white/80">شحال كيصرف الزبون فـ المتوسط فـ الزيارة؟</span>
                    <span className="text-amber-400 font-mono font-bold text-sm">
                      {averageSpend} درهم
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={averageSpend}
                    onChange={(e) => setAverageSpend(Number(e.target.value))}
                    aria-label="متوسط صرف الزبون في الزيارة"
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>10 DH</span>
                    <span>100 DH</span>
                    <span>200 DH</span>
                  </div>
                </div>
              </div>

              {/* Dynamic ROI Box */}
              <div className="p-6 rounded-3xl bg-[#080C14] border border-emerald-500/30 text-center space-y-4 shadow-xl">
                <div>
                  <span className="text-xs text-white/60 block">مداخيل إضافية متوقعة لمحلك شهرياً:</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono block mt-1">
                    +{monthlyRevenueGain} درهم / شهر
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/80">
                  <span>الباك ديال Walink غادي يخلّص راسو كامل فـ: </span>
                  <strong className="text-amber-300 font-mono text-sm">
                    {paybackMonths} {paybackMonths === 1 ? "شهر واحد فقط" : "أشهر"}!
                  </strong>
                </div>

                <p className="text-[11px] text-white/50 leading-relaxed">
                  * الحساب مبني على زيارة الكليان المسترجع مرتين فـ الشهر بمتوسط صرف محدد. من بعد كاع الأرباح كتبقى فـ جيبك!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* F. Pricing (#pricing), Payment (#payment) & FAQ (#faq) */}
        <section id="pricing" className="scroll-mt-24 space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>الأثمنة الشفافة • Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              أثمنة شهرية واضحة وبسيطة
            </h2>
            <p className="text-sm text-white/60">
              اختر الباقة المناسبة لمتجرك، مع رسوم تثبيت لمرة واحدة فقط (300 درهم تشمل الإعداد الكامل والستاند الذكي).
            </p>
          </div>

          {/* Installation Banner */}
          <div className="max-w-2xl mx-auto p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs text-center flex items-center justify-center gap-2 shadow-lg">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>
              <strong>ثمن التثبيت لأول مرة: 300 درهم فقط</strong> — يشمل تصميم البطاقة، برمجة الإعدادات، وستاند الكاونتر (NFC + QR).
            </span>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Plan 1: Starter (149 DH/mo) */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 text-right">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">الباقة الأساسية</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                    متجر واحد
                  </span>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  مثالية للمحلات التي تريد بطاقة وفاء رقمية بدون رادار 100 متر أو محرك تقييمات Google Maps.
                </p>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">149</span>
                    <span className="text-xs text-white/60">درهم / شهر</span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-semibold block">
                    + 300 درهم للتثبيت أول مرة
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-white/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>كارط وفاء رقمية فـ Apple و Google Wallet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>ستاند كاونتر أكريليك ذكي (NFC + QR)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>لوحة تحكم التاجر بالكاميرا ونظام الأختام والكاش باك</span>
                  </li>
                  <li className="flex items-center gap-2 text-white/45 line-through">
                    <span>بدون رادار 100 متر الذكي على شاشات القفل</span>
                  </li>
                  <li className="flex items-center gap-2 text-white/45 line-through">
                    <span>بدون محرك زيادة تقييمات Google Maps بخمس نجوم</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlan({ id: "starter", title: "الباقة الأساسية (149 DH/شهر)", price: "149 DH/شهر + 300 DH تثبيت" });
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
              >
                اختيار باقة 149 درهم/شهر
              </button>
            </div>

            {/* Plan 2: Standard / Growth (199 DH/mo) */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-500/[0.08] to-transparent shadow-2xl shadow-emerald-500/15 flex flex-col justify-between space-y-6 text-right relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black text-[11px] shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>الأكثر طلباً ومبيعاً ⭐</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-white">المتجر العادي</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    كامل المميزات
                  </span>
                </div>

                <p className="text-xs text-white/70 leading-relaxed">
                  الحل المتكامل لمتجر واحد: رادار 100م على شاشات القفل، محرك تقييمات Google Maps، واسترجاع الزبناء.
                </p>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-emerald-400 font-mono">199</span>
                    <span className="text-xs text-white/60">درهم / شهر</span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-semibold block">
                    + 300 درهم للتثبيت أول مرة
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-white/90 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>كل مميزات الباقة الأساسية</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>رادار القرب 100 متر الذكي على شاشات القفل</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>محرك زيادة تقييمات Google Maps بخمس نجوم</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>استرجاع الزبناء الغائبين وحملات العروض</strong></span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlan({ id: "growth", title: "المتجر العادي (199 DH/شهر)", price: "199 DH/شهر + 300 DH تثبيت" });
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>اختيار باقة 199 درهم/شهر 🚀</span>
              </button>
            </div>

            {/* Plan 3: Multi-Branch (Starting from 299 DH/mo) */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 text-right">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">متجر الفروع</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70">
                    +100 DH / فرع
                  </span>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  مخصص للمحلات التي تمتلك فرعين أو أكثر: 199 درهم أساسي + 100 درهم لكل فرع إضافي.
                </p>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-white/70">ابتداءً من</span>
                    <span className="text-3xl font-black text-white font-mono">299</span>
                    <span className="text-xs text-white/60">درهم / شهر</span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-semibold block">
                    + 300 درهم للتثبيت أول مرة
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-white/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>كل مميزات المتجر العادي (الرادار + التقييمات)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>199 درهم للفرع الرئيسي + 100 درهم لكل فرع إضافي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>حساب مستقل لكل كاشير ومقارنة أداء الفروع</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>دعم فني VIP وربط مباشر عبر الواتساب</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlan({ id: "multi", title: "متجر الفروع (من 299 DH/شهر)", price: "من 299 DH/شهر + 300 DH تثبيت" });
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
              >
                اختيار باقة الفروع (299+ درهم)
              </button>
            </div>
          </div>

          {/* Setup & Multi-Branch Explanation (No Points/Credits Mentioned) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>ثمن التثبيت لأول مرة (300 درهم)</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                رسوم التثبيت 300 درهم تُدفع لمرة واحدة فقط عند البداية، وتشمل تصميم بطاقة الولاء الخاصة بمحلك، تهيئة نظام الأختام أو الكاش باك، وستاند الكاونتر الذكي (NFC + QR).
              </p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>تسعيرة واضحة حسب الفروع</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                للمتاجر ذات الفروع المتعددة، الاشتراك الشهري هو 199 درهم للفرع الأول ويُضاف 100 درهم لكل فرع إضافي (فرعان = 299 درهم، 3 فروع = 399 درهم).
              </p>
            </div>
          </div>

          {/* Payment Guarantee (50/50) */}
          <div id="payment" className="scroll-mt-24 glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.02] text-center space-y-4 max-w-3xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h3 className="font-bold text-xl text-white">
              طريقة الدفع والضمانة ديالك (مبدأ الثقة 50/50)
            </h3>

            <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
              50% تسبيق عند تأكيد الطلب ومعاينة التصميم الرقمي لكارط محلك، و 50% الباقية عند استلام الستاند وتجربة الكارط في محلك والتأكد من أنها خدامة 100%. والتوصيل مجاني حتى لباب المحل 🇲🇦.
            </p>
          </div>

          {/* FAQ Accordion (#faq) */}
          <div id="faq" className="scroll-mt-24 space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-emerald-400">كل ما تحتاج معرفته</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">الأسئلة الشائعة (FAQ)</h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="glass-panel rounded-2xl border border-white/10 overflow-hidden text-right transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 flex items-center justify-between gap-3 text-right"
                    >
                      <span className="font-bold text-xs sm:text-sm text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-emerald-400 transition-transform flex-shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-white/70 leading-relaxed border-t border-white/5 animate-in fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* G. Checkout Bottom Sheet Modal (#modal) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-white/20 rounded-t-3xl sm:rounded-3xl p-6 text-right space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="font-bold text-base text-white">طلب باقة {selectedPlan.title}</h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {selectedPlan.price} درهم • لمرة واحدة
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-white/40 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label htmlFor="modal-shop-name" className="block text-xs font-bold text-white/80 mb-1">
                  اسم المحل التجاري:
                </label>
                <input
                  id="modal-shop-name"
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="مثال: Café Atlas"
                  aria-label="اسم المحل التجاري"
                  className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-white/80 mb-1">
                  نوع النشاط:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {NICHES.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setSelectedNicheId(n.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        selectedNicheId === n.id
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="modal-city" className="block text-xs font-bold text-white/80 mb-1">
                  المدينة:
                </label>
                <input
                  id="modal-city"
                  list="moroccan-cities"
                  value={checkoutCity}
                  onChange={(e) => setCheckoutCity(e.target.value)}
                  placeholder="الدار البيضاء"
                  aria-label="المدينة"
                  className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <datalist id="moroccan-cities">
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="modal-phone" className="block text-xs font-bold text-white/80 mb-1">
                  رقم الواتساب ديالك:
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  required
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  placeholder="0661234567"
                  aria-label="رقم الواتساب"
                  className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/70 leading-relaxed">
                * عند الضغط على تأكيد الطلب، سيتم توجيهك فوراً لمحادثة الواتساب الرسمية لتأكيد التصميم ومتابعة التوصيل.
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingOrder ? "جاري الحفظ..." : "تأكيد الطلب عبر الواتساب 💬"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sticky Mobile CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-between gap-3">
        <div className="text-right">
          <span className="text-[10px] text-white/50 block">المتجر العادي (+ 300 DH تثبيت)</span>
          <span className="text-base font-black text-emerald-400 font-mono">199 DH / شهر</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedPlan({ id: "growth", title: "المتجر العادي (199 DH/شهر)", price: "199 DH/شهر + 300 DH تثبيت" });
            setIsCheckoutOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
        >
          <span>طلب دابا</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Comprehensive Enterprise Footer */}
      <SiteFooter />
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import "./landing.css";

// Moroccan Cities Datalist
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

// Niche Definitions
interface NicheData {
  id: string;
  name: string;
  label: string;
  icon: string;
  pc: string;
  grad: string;
  reward: string;
  prefix: string;
  defaultName: string;
}

const NICHES_DICT: Record<string, NicheData> = {
  cafe: {
    id: "cafe",
    name: "مقهى / كافي",
    label: "كافي",
    icon: "i-coffee",
    pc: "#6b4226",
    grad: "linear-gradient(150deg, #6b4226 0%, #3d2414 100%)",
    reward: "قهوة فابور",
    prefix: "السي/للا",
    defaultName: "Café Atlas",
  },
  barber: {
    id: "barber",
    name: "صالون حلاقة",
    label: "حلاق",
    icon: "i-scissors",
    pc: "#1e3a5f",
    grad: "linear-gradient(150deg, #1e3a5f 0%, #0d1b2a 100%)",
    reward: "حسانة فابور",
    prefix: "السي",
    defaultName: "Barber Anas",
  },
  snack: {
    id: "snack",
    name: "مطعم / سناك",
    label: "سناك",
    icon: "i-utensils",
    pc: "#b45309",
    grad: "linear-gradient(150deg, #b45309 0%, #78350f 100%)",
    reward: "وجبة فابور",
    prefix: "السي/للا",
    defaultName: "Snack Marrakech",
  },
  carwash: {
    id: "carwash",
    name: "لافاچ سيارات",
    label: "لافاچ",
    icon: "i-car",
    pc: "#0e7490",
    grad: "linear-gradient(150deg, #0e7490 0%, #155e75 100%)",
    reward: "غسلة فابور",
    prefix: "السي/للا",
    defaultName: "Lavaj Royal",
  },
  beauty: {
    id: "beauty",
    name: "صالون تجميل",
    label: "تجميل",
    icon: "i-sparkles",
    pc: "#be185d",
    grad: "linear-gradient(150deg, #be185d 0%, #831843 100%)",
    reward: "سوان فابور",
    prefix: "للا",
    defaultName: "Salon Noor",
  },
  laundry: {
    id: "laundry",
    name: "مصبانة وتصبين",
    label: "مصبانة",
    icon: "i-laundry",
    pc: "#6d28d9",
    grad: "linear-gradient(150deg, #6d28d9 0%, #4c1d95 100%)",
    reward: "تصبين فابور",
    prefix: "السي/للا",
    defaultName: "Pressing Atlas",
  },
  other: {
    id: "other",
    name: "محل تجاري آخر",
    label: "محل آخر",
    icon: "i-store",
    pc: "#047857",
    grad: "linear-gradient(150deg, #047857 0%, #064e3b 100%)",
    reward: "كادو فابور",
    prefix: "الزبون المحترم",
    defaultName: "Boutique Casablanca",
  },
};

const PLANS_DATA: Record<string, { title: string; price: string; numPrice: number }> = {
  starter: { title: "Starter", price: "1,900", numPrice: 1900 },
  growth: { title: "Growth (الأكثر طلباً)", price: "2,400", numPrice: 2400 },
  multi: { title: "Multi-Branch", price: "4,900", numPrice: 4900 },
};

export default function LandingPage() {
  // --- Audio Context Engine ---
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  const playDing = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1318.5, now);
      g1.gain.setValueAtTime(0.28, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(g1);
      g1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(2093.0, now + 0.08);
      g2.gain.setValueAtTime(0.35, now + 0.08);
      g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      osc2.connect(g2);
      g2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.68);
    } catch (err) {
      console.warn("Audio chime error:", err);
    }
  };

  const playFanfare = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [
        { f: 523.25, t: 0, d: 0.15 },
        { f: 659.25, t: 0.12, d: 0.15 },
        { f: 783.99, t: 0.24, d: 0.18 },
        { f: 1046.5, t: 0.38, d: 0.45 },
      ].forEach((n) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, now + n.t);
        g.gain.setValueAtTime(0.26, now + n.t);
        g.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    } catch (err) {
      console.warn("Audio fanfare error:", err);
    }
  };

  const triggerVibrate = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([25, 40, 25]);
      } catch (err) {
        console.warn("Haptic vibrate error:", err);
      }
    }
  };

  // --- States ---
  const [currentNiche, setCurrentNiche] = useState<string>("cafe");
  const [shopInput, setShopInput] = useState<string>("Café Atlas");
  const [currentTab, setCurrentTab] = useState<"pass" | "dash">("pass");
  const [tabBSeen, setTabBSeen] = useState<boolean>(false);
  const [stampsCount, setStampsCount] = useState<number>(3);
  const [stampNewIndex, setStampNewIndex] = useState<number>(-1);
  const [passShine, setPassShine] = useState<boolean>(false);

  // Active floating banner
  const [banner, setBanner] = useState<{
    id: string;
    icon: string;
    appColor: string;
    title: string;
    text: string;
    time: string;
  } | null>(null);

  // Owner App States
  const [ownerSubTab, setOwnerSubTab] = useState<"home" | "cl" | "promo" | "auto">("home");
  const [ownerCredits, setOwnerCredits] = useState<number>(1000);
  const [ownerTpl, setOwnerTpl] = useState<string>("w");
  const [ownerMsg, setOwnerMsg] = useState<string>("عرض الويكاند: -20% هاد السبت والحد ف Café Atlas");
  const [ownerAud, setOwnerAud] = useState<string>("all");
  const [ownerSentCount, setOwnerSentCount] = useState<number>(0);
  const [ownerPeek, setOwnerPeek] = useState<{ title: string; body: string } | null>(null);
  const [autoStates, setAutoStates] = useState({
    winback: true,
    radar: true,
    review: true,
    gift: true,
  });

  // Hero Notifications Cycling
  const [heroCycleIdx, setHeroCycleIdx] = useState<number>(0);

  // Demo Interactions Tracker (for Smart Nudge)
  const [demoClicks, setDemoClicks] = useState<number>(0);

  // ROI Sliders
  const [roiCount, setRoiCount] = useState<number>(5);
  const [roiSpend, setRoiSpend] = useState<number>(25);

  // Modal / Checkout
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalPlan, setModalPlan] = useState<string>("growth");
  const [modalNiche, setModalNiche] = useState<string>("cafe");
  const [modalCity, setModalCity] = useState<string>("الدار البيضاء");
  const [modalPhone, setModalPhone] = useState<string>("");
  const [modalShop, setModalShop] = useState<string>("Café Atlas");
  const [modalErrors, setModalErrors] = useState<{ shop?: boolean; city?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Header solid on scroll & Mobile sticky bar
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showMbar, setShowMbar] = useState<boolean>(false);

  const activeNiche = NICHES_DICT[currentNiche] || NICHES_DICT.cafe;

  // Sync modal shop and niche with demo
  useEffect(() => {
    setModalShop(shopInput);
  }, [shopInput]);

  useEffect(() => {
    setModalNiche(currentNiche);
  }, [currentNiche]);

  // Read URL query parameters (?name=...&type=...) on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const qName = p.get("name") || p.get("n");
      const qType = p.get("type") || p.get("t");
      if (qName) {
        setShopInput(qName);
        setModalShop(qName);
      }
      if (qType && NICHES_DICT[qType.toLowerCase()]) {
        setCurrentNiche(qType.toLowerCase());
        setModalNiche(qType.toLowerCase());
      }
      if (qName || qType) {
        setTimeout(() => {
          document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, []);

  // Header scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(y > 30);
      setShowMbar(y > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero Notifications List (cycles every 3.8s)
  const heroNotifs = useMemo(
    () => [
      {
        icon: "i-coffee",
        ap: "linear-gradient(135deg,#6b4226,#3d2414)",
        title: "طابع جديد تزاد فـ الكارط! ☕️",
        text: `وصلتي لـ 4 من 5 طوابع فـ ${shopInput}. باقي ليك طابع واحد!`,
      },
      {
        icon: "i-gift",
        ap: "linear-gradient(135deg,#D97706,#B45309)",
        title: "🏆 مبروك! قهوتك فابور واجدة دابا",
        text: `جمعتي 5/5 طوابع فـ ${shopInput}! بصحتك المكافأة.`,
      },
      {
        icon: "i-star",
        ap: "linear-gradient(135deg,#2563EB,#1D4ED8)",
        title: "⭐ كيف جاتك القهوة؟ خلي لينا تقييم فـ Google",
        text: `رأيك كيهمنا بزاف فـ ${shopInput}! كليكي هنا للمشاركة.`,
      },
      {
        icon: "i-pin",
        ap: "linear-gradient(135deg,#059669,#047857)",
        title: `📍 راك دايز من حدا ${shopInput} دابا`,
        text: "الكارط ديالك واجدة فـ Apple Wallet! دوز خود قهوتك وجمع طابع جديد ☕",
      },
      {
        icon: "i-back",
        ap: "linear-gradient(135deg,#DC2626,#991B1B)",
        title: `🎁 توحشناك فـ ${shopInput}!`,
        text: "هادي كثر من 15 يوم ما شفناك! دوز هاد السيمانة وعندك طابع هدية.",
      },
      {
        icon: "i-mega",
        ap: "linear-gradient(135deg,#4F46E5,#3730A3)",
        title: `📣 عرض الويكاند من ${shopInput}`,
        text: "تخفيض 20% على جميع الطلبات هاد السبت والحد!",
      },
    ],
    [shopInput]
  );

  useEffect(() => {
    const t = setInterval(() => {
      setHeroCycleIdx((p) => (p + 1) % heroNotifs.length);
    }, 3800);
    return () => clearInterval(t);
  }, [heroNotifs.length]);

  // Push floating banner to phone view
  const showBanner = (
    icon: string,
    appColor: string,
    title: string,
    text: string
  ) => {
    setBanner({
      id: String(Date.now()),
      icon,
      appColor,
      title,
      text,
      time: "الآن",
    });
    setDemoClicks((c) => c + 1);

    setTimeout(() => {
      setBanner((b) => (b && Date.now() - Number(b.id) >= 4200 ? null : b));
    }, 4500);
  };

  // Stamping action
  const handleStamp = () => {
    const next = stampsCount >= 5 ? 1 : stampsCount + 1;
    setStampsCount(next);
    setStampNewIndex(next);
    setPassShine(true);
    setTimeout(() => setPassShine(false), 1400);

    if (next === 5) {
      playFanfare();
      triggerVibrate();
      showBanner(
        "i-gift",
        "linear-gradient(135deg,#D97706,#B45309)",
        "🏆 مبروك! الكادو ديالك واجد!",
        `جمعتي كاع الطوابع! خود ${activeNiche.reward} ديالك فـ ${shopInput}.`
      );
      setTimeout(() => {
        showBanner(
          "i-star",
          "linear-gradient(135deg,#2563EB,#1D4ED8)",
          "⭐ تقييم 5 نجوم فـ خرائط Google",
          `عجباتك الخدمة فـ ${shopInput}؟ شارك رأيك فـ Google Maps فـ ثواني!`
        );
      }, 2400);
    } else {
      playDing();
      triggerVibrate();
      showBanner(
        activeNiche.icon,
        activeNiche.grad,
        "طابع جديد تزاد فـ الكارط! ☕️",
        `وصلتي لـ ${next} من 5 طوابع فـ ${shopInput}.`
      );
    }
  };

  // Owner App Broadcast Action
  const handleSendOwnerPromo = () => {
    setOwnerCredits((c) => Math.max(0, c - 20));
    setOwnerSentCount((s) => s + 1);
    playDing();
    showBanner(
      "i-mega",
      "linear-gradient(135deg,#4F46E5,#3730A3)",
      `📣 بروموسيون من ${shopInput}`,
      ownerMsg
    );
  };

  // Template switch for Owner Promo
  const selectOwnerTpl = (tpl: string) => {
    setOwnerTpl(tpl);
    if (tpl === "w") setOwnerMsg(`عرض الويكاند: -20% هاد السبت والحد ف ${shopInput}`);
    else if (tpl === "h") setOwnerMsg(`ساعة سعيدة: قهوة ثانية بنصف الثمن اليوم من 5 ل 7 ف ${shopInput}`);
    else if (tpl === "v") setOwnerMsg(`خاص بزبنائنا VIP: هدية ترحيبية كتسناك اليوم ف ${shopInput}`);
  };

  // ROI Math
  const roiMonthlyGain = Math.round(roiCount * roiSpend * 2.5);
  const roiPaybackMonths = Math.max(1, Math.ceil(2400 / Math.max(50, roiMonthlyGain)));

  // Checkout Modal Submit
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { shop?: boolean; city?: boolean } = {};
    if (!modalShop.trim()) errors.shop = true;
    if (!modalCity.trim()) errors.city = true;

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setModalErrors({});
    setIsSubmitting(true);

    const planObj = PLANS_DATA[modalPlan] || PLANS_DATA.growth;

    try {
      // 1. Post Lead to backend database
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: modalShop.trim(),
          niche: modalNiche,
          city: modalCity.trim(),
          phone: modalPhone.trim() || undefined,
          plan: modalPlan,
          price: planObj.price,
          usedDemo: demoClicks > 0,
        }),
      });

      // 2. Redirect to WhatsApp with formatted Darija order message
      const text = `السلام عليكم فريق Walink 👋
بغيت نطلب باك بطاقة الوفاء الذكية لمحلي:

🏢 اسم المحل: ${modalShop.trim()}
📍 النشاط: ${NICHES_DICT[modalNiche]?.name || modalNiche}
🏙 المدينة: ${modalCity.trim()}
📦 الباقة المختارة: ${planObj.title} (${planObj.price} درهم)
${modalPhone.trim() ? `📞 الهاتف: ${modalPhone.trim()}` : ""}

واش ممكن توجدو ليا التصميم والستاند ديال الكاونتر؟ شكراً!`;

      const waUrl = `https://wa.me/212708107351?text=${encodeURIComponent(text)}`;
      window.location.href = waUrl;
    } catch (err) {
      console.error("Order lead submission error:", err);
      window.location.href = `https://wa.me/212708107351`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="walink-landing">
      {/* 3 Animated Ambient Orbs */}
      <div className="orbs" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      {/* SVG Sprite containing all reference symbols */}
      <svg style={{ display: "none" }} aria-hidden="true">
        <defs>
          <symbol id="mark" viewBox="0 0 32 32">
            <path
              fill="#10B981"
              d="M16 3L4 7v9c0 8.3 5.1 12.8 12 14 6.9-1.2 12-5.7 12-14V7L16 3z"
            />
            <path
              fill="#03140D"
              d="M16 8a7 7 0 0 1 7 7h-2.5a4.5 4.5 0 0 0-4.5-4.5V8zm0 4.5a2.5 2.5 0 0 1 2.5 2.5H16v-2.5z"
            />
          </symbol>
          <symbol id="i-coffee" viewBox="0 0 24 24">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 2v3M10 2v3M14 2v3" />
          </symbol>
          <symbol id="i-scissors" viewBox="0 0 24 24">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
          </symbol>
          <symbol id="i-utensils" viewBox="0 0 24 24">
            <path d="M18 2v20M21 2v6a3 3 0 0 1-3 3M18 2a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3M8 2v8M11 2v4a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2M8 11v11" />
          </symbol>
          <symbol id="i-car" viewBox="0 0 24 24">
            <path d="M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0" />
            <path d="M5 17H3v-4l2-5h12l2 5v4h-2M9 17h6" />
          </symbol>
          <symbol id="i-laundry" viewBox="0 0 24 24">
            <rect x="3" y="2" width="18" height="20" rx="3" />
            <circle cx="12" cy="13" r="5" />
            <circle cx="7" cy="6" r="1" />
            <path d="M12 10a3 3 0 0 1 3 3" />
          </symbol>
          <symbol id="i-sparkles" viewBox="0 0 24 24">
            <path d="m12 3 1.9 4.8L18.7 9l-3.8 3.5 1.1 5.2L12 15l-4 2.7 1.1-5.2L5.3 9l4.8-1.2L12 3zM19 3l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
          </symbol>
          <symbol id="i-plus" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </symbol>
          <symbol id="i-pin" viewBox="0 0 24 24">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </symbol>
          <symbol id="i-back" viewBox="0 0 24 24">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5M12 7v5l4 2" />
          </symbol>
          <symbol id="i-mega" viewBox="0 0 24 24">
            <path d="m3 11 18-5v12L3 13v-2zM11.6 16.8a3 3 0 1 1-5.8-1.6M21 10a4 4 0 0 1 0 4" />
          </symbol>
          <symbol id="i-gift" viewBox="0 0 24 24">
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
          </symbol>
          <symbol id="i-star" viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </symbol>
          <symbol id="i-check" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </symbol>
          <symbol id="i-x" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </symbol>
          <symbol id="i-lock" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </symbol>
          <symbol id="i-scan" viewBox="0 0 24 24">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
          </symbol>
          <symbol id="i-wallet" viewBox="0 0 24 24">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
          </symbol>
          <symbol id="i-bell" viewBox="0 0 24 24">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </symbol>
          <symbol id="i-nfc" viewBox="0 0 24 24">
            <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36M9.46 6.21a10.5 10.5 0 0 1 0 11.58M12.91 4.1a13.6 13.6 0 0 1 0 15.8M16.37 2a16.7 16.7 0 0 1 0 20" />
          </symbol>
          <symbol id="i-card" viewBox="0 0 24 24">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </symbol>
          <symbol id="i-shield" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </symbol>
          <symbol id="i-store" viewBox="0 0 24 24">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M2 7h20M10 12v6M14 12v6" />
          </symbol>
          <symbol id="i-phone" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </symbol>
          <symbol id="i-dash" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </symbol>
          <symbol id="i-play" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </symbol>
          <symbol id="i-wifioff" viewBox="0 0 24 24">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </symbol>
          <symbol id="i-users" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </symbol>
          <symbol id="i-up" viewBox="0 0 24 24">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </symbol>
          <symbol id="i-home" viewBox="0 0 24 24">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </symbol>
          <symbol id="i-bolt" viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </symbol>
          <symbol id="i-eye" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </symbol>
          <symbol id="i-chev" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </symbol>
          <symbol id="i-layers" viewBox="0 0 24 24">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </symbol>
          <symbol id="i-coins" viewBox="0 0 24 24">
            <ellipse cx="12" cy="6" rx="8" ry="3" />
            <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
          </symbol>
          <symbol id="i-wa" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17.472 14.382c-.301-.15-1.78-.877-2.056-.977-.275-.101-.476-.15-.677.15-.2.3-.777.977-.953 1.178-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.799-1.498-1.786-1.674-2.087-.175-.3-.019-.462.132-.612.136-.135.301-.351.452-.527.15-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.233-.244-.587-.492-.507-.676-.516l-.577-.01c-.2 0-.526.075-.802.376-.275.3-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.12.579-.086 1.78-.727 2.03-1.43.25-.702.25-1.303.176-1.429-.076-.125-.276-.2-.577-.35zM12 2a10 10 0 0 0-8.544 15.183L2 22l4.954-1.3A9.99 9.99 0 0 0 12 22a10 10 0 0 0 0-20z"
            />
          </symbol>
        </defs>
      </svg>

      {/* Header */}
      <header className={`hdr ${isScrolled ? "solid" : ""}`} id="hdr">
        <div className="wrap">
          <Link href="/" className="logo" aria-label="والينك - الصفحة الرئيسية">
            <svg viewBox="0 0 32 32">
              <use href="#mark" />
            </svg>
            <b className="lat">
              walink<i>.ma</i>
            </b>
            <span>والينك</span>
          </Link>
          <nav className="nav">
            <a href="#demo">جرّب الديمو</a>
            <a href="#how">كيفاش خدام</a>
            <a href="#pricing">الأثمنة</a>
            <a href="#faq">الأسئلة</a>
          </nav>
          <a href="#pricing" className="btn btn-em">
            <span>ابدأ دابا</span>
            <svg className="ic">
              <use href="#i-bolt" />
            </svg>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="wrap">
          <div>
            <div className="live">
              <span className="dot" />
              <span>
                <b>+40 محل</b> كيتسناو الفوج الجديد 🇲🇦
              </span>
            </div>
            <h1>
              خلّي كليانك يرجعو لمحلك،
              <span className="l2">بكارط وفاء رقمية.</span>
            </h1>
            <p className="sub">
              فـ <b>Apple Wallet</b> و <b>Google Wallet</b>. بلا أبليكاسيون
              كتيليشارجا، بلا اشتراك شهري كيخلع.
            </p>
            <div className="feat">
              <span>
                <svg className="ic">
                  <use href="#i-pin" />
                </svg>
                رادار 100 ميترو
              </span>
              <span>
                <svg className="ic">
                  <use href="#i-star" />
                </svg>
                تقييمات Google
              </span>
              <span>
                <svg className="ic">
                  <use href="#i-back" />
                </svg>
                رجوع الغابرين
              </span>
            </div>
            <div className="cta-row">
              <a href="#demo" className="btn btn-em">
                <svg className="ic">
                  <use href="#i-play" />
                </svg>
                <span>جرّب الديمو فـ التيليفون</span>
              </a>
              <a href="#pricing" className="btn btn-ghost">
                <span>شوف الأثمنة</span>
                <span className="lat">←</span>
              </a>
            </div>
            <div className="facts">
              <span>
                <svg className="ic">
                  <use href="#i-check" />
                </svg>
                خلاص مرة وحدة
              </span>
              <span>
                <svg className="ic">
                  <use href="#i-check" />
                </svg>
                خدام فـ 48 ساعة
              </span>
              <span>
                <svg className="ic">
                  <use href="#i-check" />
                </svg>
                توصيل حتى للمحل
              </span>
            </div>
          </div>

          {/* 3D Visual: iPhone Lockscreen + Counter Stand */}
          <div className="hv">
            <div className="shadow" />
            <div className="phone">
              <div className="bezel">
                <div className="screen">
                  <div className="island" />
                  <div className="sbar">
                    <span>9:41</span>
                    <div className="r">
                      <svg viewBox="0 0 16 12" fill="currentColor">
                        <path d="M1 10h2V6H1v4zm4 0h2V4H5v6zm4 0h2V2H9v8zm4 0h2V0h-2v10z" />
                      </svg>
                      <div className="bat">
                        <b />
                      </div>
                    </div>
                  </div>
                  <div className="lock">
                    <div className="date">الخميس، 12 نونبر</div>
                    <div className="time">9:41</div>
                    <div className="stack" id="heroStack">
                      <div className="ntf fresh" key={heroCycleIdx}>
                        <div
                          className="ap"
                          style={{
                            background: heroNotifs[heroCycleIdx].ap,
                          }}
                        >
                          <svg className="ic">
                            <use href={`#${heroNotifs[heroCycleIdx].icon}`} />
                          </svg>
                        </div>
                        <div className="nb">
                          <div className="nh">
                            <b>{heroNotifs[heroCycleIdx].title}</b>
                            <small>الآن</small>
                          </div>
                          <div className="nt">{heroNotifs[heroCycleIdx].text}</div>
                        </div>
                      </div>
                    </div>

                    <div className="lp">
                      <div
                        className="pass compact"
                        style={{
                          background: activeNiche.grad,
                          ["--pc" as string]: activeNiche.pc,
                        }}
                      >
                        <div className="p-head">
                          <div className="p-brand">
                            <div className="p-logo">
                              <svg className="ic">
                                <use href={`#${activeNiche.icon}`} />
                              </svg>
                            </div>
                            <b className="p-name">{shopInput}</b>
                          </div>
                          <div className="p-f p-hf">
                            <small>الطوابع</small>
                            <b className="lat">4 / 5</b>
                          </div>
                        </div>
                        <div className="p-strip">
                          {[1, 2, 3, 4].map((i) => (
                            <div className="stp on" key={i}>
                              <svg className="ic">
                                <use href={`#${activeNiche.icon}`} />
                              </svg>
                            </div>
                          ))}
                          <div className="stp gift">
                            <svg className="ic">
                              <use href="#i-gift" />
                            </svg>
                          </div>
                        </div>
                        <div className="p-row">
                          <div className="p-f">
                            <small>المكافأة القادمة</small>
                            <b>{activeNiche.reward}</b>
                          </div>
                          <div className="p-f p-hf">
                            <small>العضوية</small>
                            <b className="lat">#4821</b>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="home" />
                </div>
              </div>
            </div>

            {/* Counter Stand */}
            <div className="stand">
              <div className="plate">
                <div className="face">
                  <div className="br">
                    <svg viewBox="0 0 32 32">
                      <use href="#mark" />
                    </svg>
                    <b>walink.ma</b>
                  </div>
                  <div className="qr" id="standQR">
                    <svg viewBox="0 0 100 100" fill="#000">
                      <path d="M10 10h30v30H10zm6 6v18h18V16zm4 4h10v10H20zM60 10h30v30H60zm6 6v18h18V16zm4 4h10v10H70zM10 60h30v30H10zm6 6v18h18V66zm4 4h10v10H20zM50 15h6v12h-6zM85 50h6v12h-6zM50 75h8v6h-8zM68 62h14v8H68zM52 52h10v10H52zm24 24h12v12H76zM60 84h8v6h-8zM85 75h6v6h-6z" />
                    </svg>
                  </div>
                  <div className="cap">سكاني وخود الكارط ديالك</div>
                  <div className="nfc">
                    <svg className="ic">
                      <use href="#i-nfc" />
                    </svg>
                    <span>NFC + QR</span>
                  </div>
                </div>
              </div>
              <div className="base" />
            </div>
          </div>
        </div>
      </section>

      {/* C. Interactive Live Demo */}
      <section className="sec" id="demo">
        <div className="wrap">
          <div className="head c">
            <h2 className="h2 silver">جرّب كيفاش غادي تبان الكارط فـ محلك</h2>
            <p className="lead">
              بدّل اسم المحل واختار نوع النشاط، واطبع الطوابع وجرب إشعارات رادار
              100م واسترجاع الغابرين مباشرة!
            </p>
          </div>

          <div className="demo-grid">
            {/* Control Column */}
            <div className="surface ctrl">
              <label className="fl" htmlFor="shop" style={{ marginTop: 0 }}>
                1. سمية المحل ديالك
              </label>
              <input
                className="inp"
                id="shop"
                type="text"
                value={shopInput}
                onChange={(e) => setShopInput(e.target.value)}
                placeholder="كتب سمية محلك..."
                maxLength={24}
              />

              <div className="fl" style={{ marginTop: "18px" }}>
                2. نوع النشاط
              </div>
              <div className="niches" id="niches">
                {Object.values(NICHES_DICT).map((n) => (
                  <button
                    key={n.id}
                    className="nch"
                    type="button"
                    aria-pressed={currentNiche === n.id}
                    onClick={() => {
                      setCurrentNiche(n.id);
                      setShopInput(n.defaultName);
                    }}
                  >
                    <svg className="ic">
                      <use href={`#${n.icon}`} />
                    </svg>
                    <span>{n.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "22px" }}>
                <a href="#pricing" className="btn btn-em btn-block">
                  <svg className="ic">
                    <use href="#i-bolt" />
                  </svg>
                  <span>طلب هاد الكارط لمحلي دابا</span>
                </a>
              </div>
            </div>

            {/* Interactive Stage */}
            <div className="stage">
              <div className="seg" role="tablist">
                <button
                  type="button"
                  id="tabA"
                  role="tab"
                  aria-selected={currentTab === "pass"}
                  onClick={() => setCurrentTab("pass")}
                >
                  <svg className="ic">
                    <use href="#i-phone" />
                  </svg>
                  <span>تيليفون الكليان</span>
                </button>
                <button
                  type="button"
                  id="tabB"
                  role="tab"
                  aria-selected={currentTab === "dash"}
                  className={tabBSeen ? "seen" : ""}
                  onClick={() => {
                    setCurrentTab("dash");
                    setTabBSeen(true);
                  }}
                >
                  <svg className="ic">
                    <use href="#i-dash" />
                  </svg>
                  <span>لوحة التحكم</span>
                  <span className="newb">جديد</span>
                </button>
              </div>

              {/* iPhone Container */}
              <div className="phone demo-phone">
                <div className="bezel">
                  <div className="screen">
                    <div className="island" />
                    <div className="sbar">
                      <span>9:41</span>
                      <div className="r">
                        <svg viewBox="0 0 16 12" fill="currentColor">
                          <path d="M1 10h2V6H1v4zm4 0h2V4H5v6zm4 0h2V2H9v8zm4 0h2V0h-2v10z" />
                        </svg>
                        <div className="bat">
                          <b />
                        </div>
                      </div>
                    </div>

                    {/* In-Phone Banner Stack */}
                    <div className="banners" id="banners">
                      {banner && (
                        <div className="ntf" key={banner.id}>
                          <div
                            className="ap"
                            style={{ background: banner.appColor }}
                          >
                            <svg className="ic">
                              <use href={`#${banner.icon}`} />
                            </svg>
                          </div>
                          <div className="nb">
                            <div className="nh">
                              <b>{banner.title}</b>
                              <small>{banner.time}</small>
                            </div>
                            <div className="nt">{banner.text}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* View A: Customer Wallet Pass */}
                    <div
                      className="view wallet"
                      id="viewA"
                      hidden={currentTab !== "pass"}
                    >
                      <div className="w-top">
                        <b>Wallet</b>
                        <span>
                          <svg className="ic">
                            <use href="#i-plus" />
                          </svg>
                        </span>
                      </div>
                      <div className="sliver s1" />
                      <div className="sliver s2" />

                      <div
                        className={`pass ${passShine ? "shine" : ""}`}
                        id="passCard"
                        style={{
                          background: activeNiche.grad,
                          ["--pc" as string]: activeNiche.pc,
                        }}
                      >
                        <div className="p-head">
                          <div className="p-brand">
                            <div className="p-logo" id="pLogo">
                              <svg className="ic">
                                <use href={`#${activeNiche.icon}`} />
                              </svg>
                            </div>
                            <b className="p-name" id="pName">
                              {shopInput}
                            </b>
                          </div>
                          <div className="p-f p-hf">
                            <small>الطوابع</small>
                            <b className="lat" id="pCount">
                              {stampsCount} / 5
                            </b>
                          </div>
                        </div>

                        <div className="p-strip" id="pStrip">
                          {[1, 2, 3, 4].map((idx) => {
                            const isOn = stampsCount >= idx;
                            const isNew = stampNewIndex === idx;
                            return (
                              <div
                                key={idx}
                                className={`stp ${isOn ? "on" : ""} ${
                                  isNew ? "new" : ""
                                }`}
                              >
                                <svg className="ic">
                                  <use href={`#${activeNiche.icon}`} />
                                </svg>
                              </div>
                            );
                          })}
                          <div
                            className={`stp gift ${
                              stampsCount >= 5 ? "on" : ""
                            } ${stampNewIndex === 5 ? "new" : ""}`}
                          >
                            <svg className="ic">
                              <use href="#i-gift" />
                            </svg>
                          </div>
                        </div>

                        <div className="p-row">
                          <div className="p-f">
                            <small>المكافأة القادمة</small>
                            <b id="pRew">{activeNiche.reward}</b>
                          </div>
                          <div className="p-f p-hf">
                            <small>العضوية</small>
                            <b className="lat">#4821</b>
                          </div>
                        </div>

                        <div className="p-code">
                          <svg viewBox="0 0 100 100" fill="#000">
                            <path d="M10 10h30v30H10zm6 6v18h18V16zm4 4h10v10H20zM60 10h30v30H60zm6 6v18h18V16zm4 4h10v10H70zM10 60h30v30H10zm6 6v18h18V66zm4 4h10v10H20zM50 15h6v12h-6zM85 50h6v12h-6zM50 75h8v6h-8zM68 62h14v8H68zM52 52h10v10H52zm24 24h12v12H76zM60 84h8v6h-8zM85 75h6v6h-6z" />
                          </svg>
                          <small className="lat">WALINK #4821</small>
                        </div>
                      </div>

                      <div className="w-meta">
                        <div>
                          <span>آخر زيارة</span>
                          <b id="wLast">اليوم، 14:22</b>
                        </div>
                        <div>
                          <span>الكادو ديالك</span>
                          <b id="wNext" style={{ color: "var(--gold2)" }}>
                            {stampsCount >= 5
                              ? "واجد دابا 🎁"
                              : `باقي ${5 - stampsCount} طوابع`}
                          </b>
                        </div>
                      </div>
                    </div>

                    {/* View B: Owner Miniature Dashboard */}
                    <div
                      className="view dash"
                      id="viewB"
                      hidden={currentTab !== "dash"}
                    >
                      <div className="o-top">
                        <div>
                          <small>لوحة التحكم</small>
                          <b id="oShop">{shopInput}</b>
                        </div>
                        <div className="o-cred">
                          <svg className="ic">
                            <use href="#i-coins" />
                          </svg>
                          <span>الكريدي</span>
                          <b className="lat" id="oCred">
                            {ownerCredits}
                          </b>
                        </div>
                      </div>

                      <div className="o-body">
                        {/* Subtab 1: Home */}
                        <div
                          className={`otab ${ownerSubTab === "home" ? "on" : ""}`}
                          id="otab-home"
                        >
                          <div className="k4">
                            <div className="d-card">
                              <b>
                                142<em>+12</em>
                              </b>
                              <small>زيارات هاد الشهر</small>
                            </div>
                            <div className="d-card">
                              <b>
                                64<em>+8</em>
                              </b>
                              <small>كليان فـ الكارط</small>
                            </div>
                            <div className="d-card">
                              <b>
                                18<em>🎁</em>
                              </b>
                              <small>كادويات تفرّقو</small>
                            </div>
                            <div className="d-card">
                              <b>
                                4.9<em style={{ color: "var(--gold2)" }}>★</em>
                              </b>
                              <small>تقييم Google</small>
                            </div>
                          </div>

                          <div className="quiet">
                            <div>
                              <b>3 كليان</b> غبرو هادي 15 يوم
                            </div>
                            <button
                              type="button"
                              className="mini"
                              onClick={() => {
                                setOwnerSubTab("promo");
                                setOwnerAud("quiet");
                                setOwnerMsg(
                                  `توحشناك! دوز هاد السيمانة لـ ${shopInput} وعندك طابع هدية 🎁`
                                );
                              }}
                            >
                              رجعهم
                            </button>
                          </div>

                          <div className="d-card">
                            <div className="d-lbl">
                              <span>هاد السيمانة — زيارات</span>
                              <b>+1,840 DH نشاط</b>
                            </div>
                            <div className="week">
                              <i style={{ height: "45%" }} />
                              <i style={{ height: "60%" }} />
                              <i style={{ height: "35%" }} />
                              <i style={{ height: "80%" }} />
                              <i style={{ height: "95%" }} />
                              <i style={{ height: "100%" }} />
                              <i
                                style={{
                                  height: `${Math.min(
                                    100,
                                    Math.max(30, stampsCount * 20)
                                  )}%`,
                                }}
                                className="today"
                              />
                            </div>
                          </div>

                          <div className="d-card">
                            <div className="d-lbl" style={{ marginBottom: "6px" }}>
                              <span>آخر الحركات</span>
                            </div>
                            <div className="feed">
                              <div>
                                <i>ك</i>
                                <span>كريم ب. خذا طابع جديد</span>
                                <small>دابا</small>
                              </div>
                              <div>
                                <i>س</i>
                                <span>سارة م. وصلات لـ 5/5 🎉</span>
                                <small>14:10</small>
                              </div>
                              <div>
                                <i>ي</i>
                                <span>ياسين ع. تسجّل فـ الكارط</span>
                                <small>12:45</small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Subtab 2: Clients */}
                        <div
                          className={`otab ${ownerSubTab === "cl" ? "on" : ""}`}
                          id="otab-cl"
                        >
                          <div className="o-h">قائمة الكليان</div>
                          <div className="o-s">
                            كليكي على أي زبون باش تزيد ليه طابع
                          </div>
                          <div className="cl">
                            {[
                              {
                                av: "ك",
                                nm: "كريم بناني",
                                ph: "06 61 •• •• 42",
                                st: "3/5",
                                tag: "p-on",
                                tagT: "نشيط",
                              },
                              {
                                av: "س",
                                nm: "سارة مجيد",
                                ph: "06 62 •• •• 18",
                                st: "5/5 🎁",
                                tag: "p-vip",
                                tagT: "واجد كادو",
                              },
                              {
                                av: "م",
                                nm: "مهدي العلمي",
                                ph: "06 63 •• •• 90",
                                st: "2/5",
                                tag: "p-off",
                                tagT: "غابر 16 نهار",
                              },
                              {
                                av: "ف",
                                nm: "فاطمة الزهراء",
                                ph: "06 70 •• •• 33",
                                st: "4/5",
                                tag: "p-on",
                                tagT: "باقي طابع",
                              },
                            ].map((c, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  handleStamp();
                                  showBanner(
                                    activeNiche.icon,
                                    activeNiche.grad,
                                    `طابع تزاد لـ ${c.nm}!`,
                                    `تم تسجيل الزيارة بنجاح فـ لوحة التاجر.`
                                  );
                                }}
                              >
                                <span className="av">{c.av}</span>
                                <span className="nm">
                                  {c.nm}
                                  <small className="lat">{c.ph}</small>
                                </span>
                                <b className="lat">{c.st}</b>
                                <span className={`pill ${c.tag}`}>{c.tagT}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Subtab 3: Promo */}
                        <div
                          className={`otab ${ownerSubTab === "promo" ? "on" : ""}`}
                          id="otab-promo"
                        >
                          <div className="o-h">صيفط بروموسيون لشاشة الكليان</div>
                          <div className="tpls">
                            <button
                              type="button"
                              className="tpl"
                              aria-pressed={ownerTpl === "w"}
                              onClick={() => selectOwnerTpl("w")}
                            >
                              عرض الويكاند
                            </button>
                            <button
                              type="button"
                              className="tpl"
                              aria-pressed={ownerTpl === "h"}
                              onClick={() => selectOwnerTpl("h")}
                            >
                              ساعة سعيدة
                            </button>
                            <button
                              type="button"
                              className="tpl"
                              aria-pressed={ownerTpl === "v"}
                              onClick={() => selectOwnerTpl("v")}
                            >
                              كليان VIP
                            </button>
                          </div>
                          <textarea
                            className="msg"
                            value={ownerMsg}
                            onChange={(e) => setOwnerMsg(e.target.value)}
                          />

                          <div className="aud">
                            <button
                              type="button"
                              aria-pressed={ownerAud === "all"}
                              onClick={() => setOwnerAud("all")}
                            >
                              <b>64</b> كاع الكليان
                            </button>
                            <button
                              type="button"
                              aria-pressed={ownerAud === "quiet"}
                              onClick={() => setOwnerAud("quiet")}
                            >
                              <b>3</b> اللي غبرو (15 يوم+)
                            </button>
                          </div>

                          <div className="o-cost">
                            <span>
                              غادي يتخصم:{" "}
                              <b>{ownerAud === "all" ? 64 : 3} كريدي</b>
                            </span>
                            <span>
                              كيبقا ليك:{" "}
                              <b>
                                {Math.max(
                                  0,
                                  ownerCredits - (ownerAud === "all" ? 64 : 3)
                                )}
                              </b>
                            </span>
                          </div>

                          <button
                            type="button"
                            className="o-send"
                            onClick={handleSendOwnerPromo}
                          >
                            صيفط دابا (Broadcast)
                          </button>

                          {ownerSentCount > 0 && (
                            <div className="camp">
                              <div>
                                <b>{ownerAud === "all" ? 64 : 3}</b>
                                <span>تصيفطات</span>
                              </div>
                              <div className="hi">
                                <b>+{Math.round((ownerAud === "all" ? 64 : 3) * 0.28)}</b>
                                <span>رجعو للمحل</span>
                              </div>
                              <div>
                                <b className="lat">
                                  +{Math.round((ownerAud === "all" ? 64 : 3) * 0.28 * 25)} DH
                                </b>
                                <span>مداخيل إضافية</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Subtab 4: Automations */}
                        <div
                          className={`otab ${ownerSubTab === "auto" ? "on" : ""}`}
                          id="otab-auto"
                        >
                          <div className="o-h">ميساجات خدامة بوحدها</div>
                          <div className="o-s">
                            شعّلها مرة وحدة والسيستيم كيتكلف بالباقي
                          </div>
                          <div className="al">
                            <div>
                              <div className="tx">
                                <b>رجوع الغابرين (15 يوم)</b>
                                <small>
                                  <span className="tag">بالكريدي</span>
                                  <button
                                    type="button"
                                    className="prev"
                                    onClick={() =>
                                      setOwnerPeek({
                                        title: "توحشناك! 🎁",
                                        body: `توحشناك! هادي كثر من 15 يوم ما شفناك فـ ${shopInput}. دوز هاد السيمانة وعندك طابع هدية.`,
                                      })
                                    }
                                  >
                                    شوف
                                  </button>
                                </small>
                              </div>
                              <button
                                type="button"
                                className="sw"
                                aria-checked={autoStates.winback}
                                onClick={() =>
                                  setAutoStates((s) => ({
                                    ...s,
                                    winback: !s.winback,
                                  }))
                                }
                              />
                            </div>

                            <div>
                              <div className="tx">
                                <b>تذكير رادار 100 ميترو</b>
                                <small>
                                  <span className="tag free">فابور ديما</span>
                                  <button
                                    type="button"
                                    className="prev"
                                    onClick={() =>
                                      setOwnerPeek({
                                        title: `📍 راك دايز من حدا ${shopInput}`,
                                        body: "الكارط ديالك واجدة فـ Apple Wallet! دوز خود قهوتك وجمع طابع جديد ☕",
                                      })
                                    }
                                  >
                                    شوف
                                  </button>
                                </small>
                              </div>
                              <button
                                type="button"
                                className="sw"
                                aria-checked={autoStates.radar}
                                onClick={() =>
                                  setAutoStates((s) => ({
                                    ...s,
                                    radar: !s.radar,
                                  }))
                                }
                              />
                            </div>

                            <div>
                              <div className="tx">
                                <b>تقييمات خرائط Google</b>
                                <small>
                                  <span className="tag free">فابور ديما</span>
                                  <button
                                    type="button"
                                    className="prev"
                                    onClick={() =>
                                      setOwnerPeek({
                                        title: "⭐ كيف جاتك الخدمة؟ خلي تقييم فـ Google",
                                        body: `رأيك كيهمنا بزاف فـ ${shopInput}! كليكي هنا للمشاركة.`,
                                      })
                                    }
                                  >
                                    شوف
                                  </button>
                                </small>
                              </div>
                              <button
                                type="button"
                                className="sw"
                                aria-checked={autoStates.review}
                                onClick={() =>
                                  setAutoStates((s) => ({
                                    ...s,
                                    review: !s.review,
                                  }))
                                }
                              />
                            </div>

                            <div>
                              <div className="tx">
                                <b>الكادو قريب (باقي طابع)</b>
                                <small>
                                  <span className="tag free">فابور ديما</span>
                                  <button
                                    type="button"
                                    className="prev"
                                    onClick={() =>
                                      setOwnerPeek({
                                        title: "باقي ليك غير طابع واحد! 🎁",
                                        body: `باقي ليك طابع واحد على ${activeNiche.reward} فـ ${shopInput}! كمل الكارط ديالك.`,
                                      })
                                    }
                                  >
                                    شوف
                                  </button>
                                </small>
                              </div>
                              <button
                                type="button"
                                className="sw"
                                aria-checked={autoStates.gift}
                                onClick={() =>
                                  setAutoStates((s) => ({
                                    ...s,
                                    gift: !s.gift,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Mini Owner Navigation */}
                      <div className="otabs" role="tablist">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={ownerSubTab === "home"}
                          onClick={() => setOwnerSubTab("home")}
                        >
                          <svg className="ic">
                            <use href="#i-home" />
                          </svg>
                          <span>الرئيسية</span>
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={ownerSubTab === "cl"}
                          onClick={() => setOwnerSubTab("cl")}
                        >
                          <svg className="ic">
                            <use href="#i-users" />
                          </svg>
                          <span>الكليان</span>
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={ownerSubTab === "promo"}
                          onClick={() => setOwnerSubTab("promo")}
                        >
                          <svg className="ic">
                            <use href="#i-mega" />
                          </svg>
                          <span>پرومو</span>
                        </button>
                        <button
                          type="button"
                          role="tab"
                          aria-selected={ownerSubTab === "auto"}
                          onClick={() => setOwnerSubTab("auto")}
                        >
                          <svg className="ic">
                            <use href="#i-bolt" />
                          </svg>
                          <span>أوتوماتيك</span>
                        </button>
                      </div>

                      {/* Peek Lockscreen Overlay */}
                      <div className={`peek ${ownerPeek ? "on" : ""}`}>
                        <div className="pl">هكا كيوصل للكليان فـ شاشة القفل</div>
                        <div className="pt">9:41</div>
                        {ownerPeek && (
                          <div className="ntf">
                            <div
                              className="ap"
                              style={{ background: activeNiche.grad }}
                            >
                              <svg className="ic">
                                <use href={`#${activeNiche.icon}`} />
                              </svg>
                            </div>
                            <div className="nb">
                              <div className="nh">
                                <b>{ownerPeek.title}</b>
                                <small>الآن</small>
                              </div>
                              <div className="nt">{ownerPeek.body}</div>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{
                            marginTop: "1.2em",
                            minHeight: "36px",
                            padding: "6px 16px",
                            fontSize: "13px",
                          }}
                          onClick={() => setOwnerPeek(null)}
                        >
                          سد المعاينة
                        </button>
                      </div>
                    </div>

                    <div className="home" />
                  </div>
                </div>
              </div>

              {/* Floating Control Dock (-80px overlap) */}
              <div className={`dock glass ${currentTab === "dash" ? "dim" : ""}`}>
                <div className="dk-grid">
                  <button
                    type="button"
                    className="dk main"
                    id="tStamp"
                    onClick={handleStamp}
                  >
                    <span className="dki">
                      <svg className="ic">
                        <use href="#i-plus" />
                      </svg>
                    </span>
                    <span className="dkt">
                      <b>زيد طابع فـ الكارط (+1)</b>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="dk"
                    id="tRadar"
                    onClick={() => {
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-pin",
                        "linear-gradient(135deg,#059669,#047857)",
                        `📍 راك دايز من حدا ${shopInput} دابا`,
                        "الكارط ديالك واجدة فـ Apple Wallet! دوز خود قهوتك وجمع طابع جديد ☕"
                      );
                    }}
                  >
                    <span className="dki">
                      <svg className="ic">
                        <use href="#i-pin" />
                      </svg>
                    </span>
                    <span className="dkt">
                      <b>رادار 100 م</b>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="dk"
                    id="tBack"
                    onClick={() => {
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-back",
                        "linear-gradient(135deg,#DC2626,#991B1B)",
                        `🎁 توحشناك فـ ${shopInput}!`,
                        "هادي كثر من 15 يوم ما شفناك! دوز هاد السيمانة وعندك طابع هدية."
                      );
                    }}
                  >
                    <span className="dki">
                      <svg className="ic">
                        <use href="#i-back" />
                      </svg>
                    </span>
                    <span className="dkt">
                      <b>الغابرين</b>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="dk"
                    id="tPromo"
                    onClick={() => {
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-mega",
                        "linear-gradient(135deg,#4F46E5,#3730A3)",
                        `📣 عرض الويكاند من ${shopInput}`,
                        "تخفيض 20% على كاع الطلبات هاد السبت والحد!"
                      );
                    }}
                  >
                    <span className="dki">
                      <svg className="ic">
                        <use href="#i-mega" />
                      </svg>
                    </span>
                    <span className="dkt">
                      <b>پروموسيون</b>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="dk"
                    id="tReview"
                    onClick={() => {
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-star",
                        "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        "⭐ تقييم 5 نجوم فـ Google",
                        `عجباتك الخدمة فـ ${shopInput}؟ شارك رأيك فـ Google Maps فـ 5 ثواني!`
                      );
                    }}
                  >
                    <span className="dki">
                      <svg className="ic">
                        <use href="#i-star" />
                      </svg>
                    </span>
                    <span className="dkt">
                      <b>تقييم Google</b>
                    </span>
                  </button>
                </div>

                <div className="dock-note">
                  <svg className="ic">
                    <use href="#i-eye" />
                  </svg>
                  <span>كليكي لداخل لوحة التحكم باش تجربها مباشرة</span>
                </div>
              </div>

              {/* Smart Nudge */}
              <div className="stage-foot" id="stageFoot">
                {demoClicks >= 2 && (
                  <div className="nudge glass">
                    <p>
                      <svg className="ic">
                        <use href="#i-bolt" />
                      </svg>
                      <span>
                        عجباتك التجربة؟ شوف لوحة تحكم التاجر أو اختار الباقة ديال محلك 👇
                      </span>
                    </p>
                    <a href="#pricing" className="btn btn-gold">
                      الأثمنة
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D. How It Works (#how) */}
      <section className="sec" id="how">
        <div className="wrap">
          <div className="head c">
            <h2 className="h2 silver">3 خطوات ساهلة، وبلا أي تعقيد</h2>
            <p className="lead">
              صممنا Walink باش تكون أسرع وأبسط تجربة لزبنائك ولموظفيك داخل المحل.
            </p>
          </div>

          <div className="steps">
            <div className="surface step">
              <div className="sn">
                <i>1</i>
                <svg className="ic">
                  <use href="#i-scan" />
                </svg>
              </div>
              <h3>الكليان كيسكاني الستاند (فـ 5 ثواني)</h3>
              <p>
                ملي كيوصل للكاونتر، كيحط التيليفون على الستاند (NFC) أو كيسكاني
                الكود بالكاميرا. ما كيتيليشارجي حتى شي أبليكاسيون وما كيدخل حتى كود
                معقد.
              </p>
            </div>

            <div className="surface step">
              <div className="sn">
                <i>2</i>
                <svg className="ic">
                  <use href="#i-wallet" />
                </svg>
              </div>
              <h3>الكارط كتدخل لـ Wallet (ما كتضيعش)</h3>
              <p>
                كتسجل مباشرة فـ محفظة Apple Wallet فـ iPhone أو Google Wallet فـ
                Android. كتبقى ديما مخزونة فالتيليفون، ما كتقطعش وما كضيعش بحال
                الكاغيط.
              </p>
            </div>

            <div className="surface step">
              <div className="sn">
                <i>3</i>
                <svg className="ic">
                  <use href="#i-bell" />
                </svg>
              </div>
              <h3>السيستيم كيفكّرو أوتوماتيك</h3>
              <p>
                ملي يقرب من المحل (100m) كيوصلو تذكير بالرادار، وملي يغبر هادي 15 يوم
                كيوصلو إشعار توحشناك مع هدية باش يرجع، وكلشي كيخدم بوحدو ⚡️.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Engines Bento Grid (#engines) */}
      <section className="sec" id="engines">
        <div className="wrap">
          <div className="head c">
            <h2 className="h2 silver">4 محركات ذكية كتخدم فـ صالح محلك</h2>
            <p className="lead">
              كل محرك مبرمج باش يرجع الكليان القديم ويزيد رقم المعاملات ديالك
              تلقائياً وبلا مجهود.
            </p>
          </div>

          <div className="bento">
            {/* Engine 1: Radar 100m */}
            <div className="surface eng e-radar">
              <div className="et">
                <span>
                  <svg className="ic">
                    <use href="#i-pin" />
                  </svg>
                </span>
                <div>
                  <h3>رادار 100 ميترو</h3>
                  <div className="tagline">
                    <svg className="ic">
                      <use href="#i-wifioff" />
                    </svg>
                    <span>خدام حتى بلا أنترنيت</span>
                  </div>
                </div>
              </div>
              <p>
                غير الكليان يدوز فـ محيط 100 متر من المحل ديالك، التيليفون ديالو
                كيشعل راسو وكيطلع إشعار: &quot;راك دايز من حدانا فـ {shopInput}،
                دوز خود قهوتك وجمع طابع جديد ☕&quot;.
              </p>

              {/* Radar Map Canvas */}
              <div className="rv-box">
                <div className="map" />
                <div className="zone">
                  <div className="sweep" />
                  <span className="lbl lat">100m Radar Zone</span>
                  <div className="pin">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                    </svg>
                  </div>
                </div>
                <div className="cust" />
                <div className="pop ntf" id="radarPop">
                  <div
                    className="ap"
                    style={{ background: "linear-gradient(135deg,#059669,#047857)" }}
                  >
                    <svg className="ic">
                      <use href="#i-pin" />
                    </svg>
                  </div>
                  <div className="nb">
                    <div className="nh">
                      <b>📍 راك دايز من حدانا</b>
                      <small>الآن</small>
                    </div>
                    <div className="nt">
                      الكارط ديالك واجدة فـ {shopInput}!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine 2: Google Reviews */}
            <div className="surface eng">
              <div className="et">
                <span>
                  <svg className="ic" style={{ color: "var(--gold2)" }}>
                    <use href="#i-star" />
                  </svg>
                </span>
                <div>
                  <h3>تقييمات خرائط Google</h3>
                  <div className="tagline">
                    <svg className="ic">
                      <use href="#i-up" />
                    </svg>
                    <span>طلع محلك فالأول فـ مدينتك</span>
                  </div>
                </div>
              </div>
              <p>
                ملي الكليان كيكمل 3 طوابع أو كياخد المكافأة، كيوصلو إشعار ذكي برابط
                مباشر باش يخلي ليك تقييم 5 نجوم فـ Google Maps ويطلع ترتيب محلك فـ
                البحث.
              </p>
              <div className="e-mini">
                <div className="ntf">
                  <div
                    className="ap"
                    style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)" }}
                  >
                    <svg className="ic">
                      <use href="#i-star" />
                    </svg>
                  </div>
                  <div className="nb">
                    <div className="nh">
                      <b>⭐ عجباتك الخدمة اليوم؟</b>
                      <small>الآن</small>
                    </div>
                    <div className="nt">
                      خلي لينا تقييم زوين فـ Google Maps فـ 5 ثواني
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine 3: 15-Day Winback */}
            <div className="surface eng">
              <div className="et">
                <span>
                  <svg className="ic" style={{ color: "var(--red)" }}>
                    <use href="#i-back" />
                  </svg>
                </span>
                <div>
                  <h3>استرجاع الغابرين</h3>
                  <div className="tagline">
                    <svg className="ic">
                      <use href="#i-bolt" />
                    </svg>
                    <span>+28% نسبة رجوع فـ أول سيمانة</span>
                  </div>
                </div>
              </div>
              <p>
                أي زبون ما زارش محلك هادي كثر من 15 يوم، السيستيم كيعرفو أوتوماتيك
                وكيصيفط ليه رسالة بالدارجة مع طابع هدية ترحيبية باش يرجع لمحلك.
              </p>
              <div className="e-mini" id="winbackMini">
                <div className="ntf">
                  <div
                    className="ap"
                    style={{ background: "linear-gradient(135deg,#DC2626,#991B1B)" }}
                  >
                    <svg className="ic">
                      <use href="#i-back" />
                    </svg>
                  </div>
                  <div className="nb">
                    <div className="nh">
                      <b>🎁 توحشناك آ السي كريم!</b>
                      <small>البارح</small>
                    </div>
                    <div className="nt">
                      هادي كثر من 15 يوم ما شفناك فـ {shopInput}. دوز هاد السيمانة
                      وعندك طابع هدية ☕
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine 4: Broadcast Promos */}
            <div className="surface eng">
              <div className="et">
                <span>
                  <svg className="ic" style={{ color: "var(--em2)" }}>
                    <use href="#i-mega" />
                  </svg>
                </span>
                <div>
                  <h3>پروموسيون بكليكة وحدة</h3>
                  <div className="tagline">
                    <svg className="ic">
                      <use href="#i-bolt" />
                    </svg>
                    <span>إشعار شاشة القفل فـ ثانية</span>
                  </div>
                </div>
              </div>
              <p>
                عندك نهار ميت أو ويكاند باغي تدور فيه الحركة؟ كتب الميساج فـ لوحة
                التحكم وصيفط إشعار جماعي لجميع زبنائك في نفس اللحظة (أرخص 10 مرات من
                SMS).
              </p>
              <div className="e-mini">
                <div className="ntf">
                  <div
                    className="ap"
                    style={{ background: "linear-gradient(135deg,#4F46E5,#3730A3)" }}
                  >
                    <svg className="ic">
                      <use href="#i-mega" />
                    </svg>
                  </div>
                  <div className="nb">
                    <div className="nh">
                      <b>📣 عرض الويكاند الحصري</b>
                      <small>الآن</small>
                    </div>
                    <div className="nt">
                      تخفيض 20% على كاع الطلبات هاد السبت والحد فـ {shopInput}!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E. Comparison Table & ROI (#compare) */}
      <section className="sec" id="compare">
        <div className="wrap">
          <div className="head c">
            <h2 className="h2 silver">علاش Walink أفضل استثمار لمحلك؟</h2>
            <p className="lead">
              مقارنة واضحة بين الكاغيط، الأبليكاسيونات المكلفة، ومنظومة Walink الذكية.
            </p>
          </div>

          <div className="surface cmp-wrap">
            <table className="cmp">
              <thead>
                <tr>
                  <th>الميزة</th>
                  <th>
                    الكاغيط<small>المطبعة</small>
                  </th>
                  <th>
                    أبليكاسيون بالشهر<small>400 DH / شهر</small>
                  </th>
                  <th className="tp">
                    منظومة Walink<small>خلاص مرة وحدة</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>الثمن فـ 3 سنين</td>
                  <td>
                    ~ 4,500 DH<span className="note">طباعة متكررة ديما</span>
                  </td>
                  <td className="no">
                    14,400 DH<span className="note">400 DH × 36 شهر</span>
                  </td>
                  <td className="tp yes">
                    3,180 DH<span className="note">توفير أكثر من 11,200 DH!</span>
                  </td>
                </tr>
                <tr>
                  <td>واش كتضيع؟</td>
                  <td className="no">80% كينساوها فـ الدار</td>
                  <td>لا</td>
                  <td className="tp yes">لا، ديما فـ Apple/Google Wallet</td>
                </tr>
                <tr>
                  <td>بلا تيليشارجي؟</td>
                  <td className="yes">نعم</td>
                  <td className="no">لا، و 70% كيرفضو يتيليشارجيو</td>
                  <td className="tp yes">نعم، سكان فـ 5 ثواني</td>
                </tr>
                <tr>
                  <td>إشعارات فـ الشاشة؟</td>
                  <td className="no">مستحيل</td>
                  <td>كيديرو ليها Désactiver</td>
                  <td className="tp yes">إشعارات رسمية فـ الشاشة 100%</td>
                </tr>
                <tr>
                  <td>رادار 100 ميترو؟</td>
                  <td className="no">
                    <svg className="ic no">
                      <use href="#i-x" />
                    </svg>
                  </td>
                  <td className="no">
                    <svg className="ic no">
                      <use href="#i-x" />
                    </svg>
                  </td>
                  <td className="tp yes">
                    <svg className="ic yes">
                      <use href="#i-check" />
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td>تقييمات Google؟</td>
                  <td className="no">
                    <svg className="ic no">
                      <use href="#i-x" />
                    </svg>
                  </td>
                  <td className="no">
                    <svg className="ic no">
                      <use href="#i-x" />
                    </svg>
                  </td>
                  <td className="tp yes">
                    <svg className="ic yes">
                      <use href="#i-check" />
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="roi">
            {/* 3-Year Bars */}
            <div className="surface">
              <h3>مقارنة التكلفة لـ 3 سنوات</h3>
              <p className="lead" style={{ fontSize: "15px" }}>
                شوف شحال كتوفّر ملي كتخلص مرة وحدة عوض اشتراك شهري كيستنزفك.
              </p>
              <div className="bars">
                <div className="bar bad">
                  <div className="bl">
                    <span>أبليكاسيون باشتراك شهري (400 DH)</span>
                    <b className="lat">14,400 DH</b>
                  </div>
                  <div className="bt">
                    <i />
                  </div>
                </div>
                <div className="bar good">
                  <div className="bl">
                    <span>منظومة Walink (Growth + Walink Care)</span>
                    <b className="lat">3,180 DH</b>
                  </div>
                  <div className="bt">
                    <i />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic ROI Calculator */}
            <div className="surface calc">
              <h3>واش السيستيم كيخلّص راسو؟</h3>
              <p className="lead" style={{ fontSize: "15px" }}>
                حسب الأرباح المتوقعة من الزبناء الغابرين اللي غادي يرجعو لمحلك.
              </p>
              <div>
                <label htmlFor="rCount">
                  <span>شحال من كليان غابر ممكن يرجع فـ الشهر؟</span>
                  <b className="lat" id="vCount">
                    {roiCount} كليان
                  </b>
                </label>
                <input
                  type="range"
                  id="rCount"
                  min="1"
                  max="30"
                  value={roiCount}
                  onChange={(e) => setRoiCount(Number(e.target.value))}
                />
              </div>

              <div>
                <label htmlFor="rSpend">
                  <span>شحال كيصرف الكليان فـ المتوسط فـ الزيارة؟</span>
                  <b className="lat" id="vSpend">
                    {roiSpend} DH
                  </b>
                </label>
                <input
                  type="range"
                  id="rSpend"
                  min="10"
                  max="200"
                  step="5"
                  value={roiSpend}
                  onChange={(e) => setRoiSpend(Number(e.target.value))}
                />
              </div>

              <div className="out" id="roiOut">
                كتربح إضافياً:{" "}
                <b className="gold lat">+{roiMonthlyGain} DH</b> فـ الشهر.
                <br />
                الباك ديال Walink غادي يخلّص راسو كامل فـ:{" "}
                <b className="lat">{roiPaybackMonths}</b>{" "}
                {roiPaybackMonths === 1 ? "شهر واحد فقط" : "أشهر"}!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* F. Pricing Section (#pricing) */}
      <section className="sec" id="pricing">
        <div className="wrap">
          <div className="head c">
            <h2 className="h2 silver">الأثمنة ديال الباقات</h2>
            <p className="lead">
              كتخلص مرة واحدة فقط، والستاند والكارط كيبقاو ديالك مدى الحياة.
            </p>
          </div>

          <div className="rush surface">
            <span className="dot" />
            <p>
              <b>الطلب كثير هاد السيمانة:</b> طلب دابا وتوجد ليك الكارط والستاند فـ
              48 ساعة فقط.
            </p>
          </div>

          <div className="plans">
            {/* Starter Plan */}
            <div className="surface plan" data-plan="starter">
              <div className="pn">
                <svg className="ic">
                  <use href="#i-card" />
                </svg>
                <span>Starter</span>
              </div>
              <div className="was">
                <span className="launch">عرض الإطلاق</span>
                <s className="lat">2,500 DH</s>
                <span className="disc">-24%</span>
              </div>
              <div className="pp">
                <b className="lat">1,900</b>
                <span>درهم</span>
              </div>
              <div className="per">خلاص لمرة واحدة فقط</div>
              <ul>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  كارط فـ Apple و Google Wallet
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  ستاند كاونتر أكريليك ذكي (NFC + QR)
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  إشعارات الطوابع فابور ديما
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  لوحة تحكم التاجر الأساسية
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>200 كريدي</b> فابور
                </li>
                <li className="off">
                  <svg className="ic">
                    <use href="#i-x" />
                  </svg>
                  رادار 100 ميترو
                </li>
                <li className="off">
                  <svg className="ic">
                    <use href="#i-x" />
                  </svg>
                  تقييمات خرائط Google
                </li>
                <li className="off">
                  <svg className="ic">
                    <use href="#i-x" />
                  </svg>
                  استرجاع الغابرين
                </li>
              </ul>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setModalPlan("starter");
                  setIsModalOpen(true);
                }}
              >
                طلب Starter
              </button>
            </div>

            {/* Growth Plan (Most Popular) */}
            <div className="surface plan pop" data-plan="growth">
              <div className="ribbon">الأكثر طلباً ⭐</div>
              <div className="pn" style={{ color: "var(--em2)" }}>
                <svg className="ic">
                  <use href="#i-bolt" />
                </svg>
                <span>Growth</span>
              </div>
              <div className="was">
                <span className="launch">عرض الإطلاق</span>
                <s className="lat">3,200 DH</s>
                <span className="disc">-25%</span>
              </div>
              <div className="pp">
                <b className="lat">2,400</b>
                <span>درهم</span>
              </div>
              <div className="per">
                أقل من <b>7 دراهم</b> فالنهار لعام كامل
              </div>
              <ul>
                <li className="all">كل مميزات Starter، زائد:</li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>رادار 100 ميترو</b> (حتى بلا أنترنيت)
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>تقييمات خرائط Google</b> أوتوماتيك
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>استرجاع الغابرين</b> بعد 15 يوم
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  پروموسيون بكليكة وحدة (Broadcast)
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>1,000 كريدي</b> فابور
                </li>
              </ul>
              <button
                type="button"
                className="btn btn-em"
                onClick={() => {
                  setModalPlan("growth");
                  setIsModalOpen(true);
                }}
              >
                <span>طلب Growth دابا</span>
                <svg className="ic">
                  <use href="#i-bolt" />
                </svg>
              </button>
            </div>

            {/* Multi-Branch Plan */}
            <div className="surface plan" data-plan="multi">
              <div className="pn">
                <svg className="ic">
                  <use href="#i-store" />
                </svg>
                <span>Multi-Branch</span>
              </div>
              <div className="was">
                <span className="launch">عرض الإطلاق</span>
                <s className="lat">6,500 DH</s>
                <span className="disc">-25%</span>
              </div>
              <div className="pp">
                <b className="lat">4,900</b>
                <span>درهم</span>
              </div>
              <div className="per">للمحلات اللي عندها فروع</div>
              <ul>
                <li className="all">كل مميزات Growth، زائد:</li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>3 ستاندات ذكية</b> لـ 3 فروع
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  لوحة موحدة لجميع الفروع
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>3,000 كريدي</b> فابور
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  دعم فني مخصص فـ الواتساب
                </li>
              </ul>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setModalPlan("multi");
                  setIsModalOpen(true);
                }}
              >
                طلب Multi-Branch
              </button>
            </div>
          </div>

          {/* Credits & Care Explainers */}
          <div className="explain">
            <div className="surface">
              <h3>
                <svg className="ic">
                  <use href="#i-coins" />
                </svg>
                <span>كيفاش خدام الكريدي فـ Walink؟</span>
              </h3>
              <p>
                إشعارات الطوابع اليومية وتسليم المكافآت ورادار القرب مجانية دائماً
                وبلا حدود. الكريدي كيتستعمل فقط لإرسال حملات البروموسيون الجماعية أو
                رسائل استرجاع الغابرين (1 رسالة = 1 كريدي).
              </p>
              <div className="topups">
                <div>
                  <b className="lat">500</b>
                  <small>بـ 100 DH</small>
                </div>
                <div>
                  <b className="lat">1,200</b>
                  <small>بـ 200 DH</small>
                </div>
                <div>
                  <b className="lat">3,000</b>
                  <small>بـ 400 DH</small>
                </div>
              </div>
            </div>

            <div className="surface">
              <h3>
                <svg className="ic">
                  <use href="#i-shield" />
                </svg>
                <span>خدمة Walink Care السنوية</span>
              </h3>
              <p>
                العام الأول مشمول مجاناً فـ ثمن الباقة. ابتداءً من العام الثاني،
                هناك اشتراك رمزي اختياري بـ <b>390 درهم فالعام</b> فقط لتغطية
                استضافة خوادم Apple و Google Wallet والنسخ الاحتياطي المستمر لكافة
                بيانات زبنائك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment & Guarantee Section (#payment) */}
      <section className="sec" id="payment">
        <div className="wrap">
          <div className="pay">
            <div className="surface payc">
              <div className="pi">
                <svg className="ic" style={{ color: "var(--em2)" }}>
                  <use href="#i-shield" />
                </svg>
              </div>
              <div>
                <h3>طريقة الدفع (50/50)</h3>
                <p>
                  كنخدمو بمبدأ الثقة: <b>50% تسبيق</b> عند تأكيد الطلب ومعاينة
                  التصميم الرقمي لكارط محلك، و <b>50% عند التوصيل</b> وتجربة الكارط
                  فـ محلك والتأكد من أنها خدامة 100%.
                </p>
              </div>
            </div>

            <div className="surface payc">
              <div className="pi">
                <svg className="ic" style={{ color: "var(--gold2)" }}>
                  <use href="#i-star" />
                </svg>
              </div>
              <div>
                <h3>الضمانة ديالك</h3>
                <ul className="gl">
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    كنديرو معاك اتصال كنعاونوك تشعّل السيستيم
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    دعم فني دائم ومباشر فـ الواتساب
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    توصيل مجاني لجميع مدن المغرب 🇲🇦
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (#faq) */}
      <section className="sec" id="faq">
        <div className="wrap">
          <div className="head c">
            <h2 className="h2 silver">الأسئلة الشائعة</h2>
            <p className="lead">كل ما تحتاج معرفته حول منصة Walink</p>
          </div>

          <div className="faq">
            <details className="surface" open>
              <summary>
                <span>واش الكليان كيحتاج يتيليشارجي شي تطبيق؟</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">
                <b>نهائياً!</b> الكليان كيسكاني الستاند بكاميرا التيليفون أو بلمسة
                NFC فـ 5 ثواني، والكارط كتدخل أوتوماتيك لـ Apple Wallet (فـ iPhone) و
                Google Wallet (فـ Android) وكتخدم بلا أنترنيت.
              </div>
            </details>

            <details className="surface">
              <summary>
                <span>كيفاش خدام رادار 100 ميترو بلا ما يكون التيليفون مكونيكطي؟</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">
                Apple Wallet و Google Wallet مدمجين مباشرة مع نظام تحديد المواقع
                الجغرافي (GPS) الأصلي ديال الهاتف. ملي كيدوز الكليان فـ محيط 100 متر
                من المحل، التيليفون كيشعل راسو وكيطلع إشعار القرب فـ شاشة القفل
                تلقائياً.
              </div>
            </details>

            <details className="surface">
              <summary>
                <span>شنو كيوقع إيلا سالاو ليا نقط الكريدي؟</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">
                إشعارات الطوابع اليومية وتسليم المكافآت ورادار القرب مجانية دائماً
                وبلا حدود. الكريدي كيتستعمل فقط لإرسال حملات البروموسيون الجماعية أو
                رسائل استرجاع الغابرين، وثمن شحن الكريدي رخيص بزاف (500 رسالة بـ 100
                درهم فقط).
              </div>
            </details>

            <details className="surface">
              <summary>
                <span>شنو هو الستاند الذكي اللي كيوصل مع الباك؟</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">
                ستاند كاونتر فاخر مصنوع من الأكريليك المقاوم للماء والكسر، مدمج
                برقيقة NFC ذكية ورمز QR مطبوع بدقة عالية، مصمم باسم محلك وألوان
                علامتك التجارية، كتحطو فوق الكاونتر والكليان غير كيحط تيليفونو عليه
                كياخد الكارط.
              </div>
            </details>

            <details className="surface">
              <summary>
                <span>كيفاش كتكون طريقة الدفع والضمانة؟</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">
                كنخدمو بمبدأ الثقة 50/50: 50% تسبيق عند تأكيد الطلب ومعاينة التصميم
                الرقمي لكارط محلك، و 50% الباقية عند استلام الستاند وتجربته في محلك.
                والتوصيل مجاني لجميع مدن المغرب.
              </div>
            </details>

            <details className="surface">
              <summary>
                <span>واش ممكن نجرب السيستيم قبل ما نشري؟</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">
                نعم! تقدر تجرب الديمو التفاعلي هنا فـ الصفحة، ولا تدخل تجرّب لوحة تحكم
                التاجر الحقيقية (/m/cafe-atlas) وتشوف كيفاش كيطبع التاجر الطوابع
                بالكاميرا فـ ثانية وحدة.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="final">
        <div className="wrap">
          <div className="surface box">
            <h2 className="h2 silver">واجد تزيد المبيعات فـ محلك؟</h2>
            <p className="lead" style={{ marginInline: "auto" }}>
              طلب دابا واستفد من عرض الإطلاق. الستاند والكارط كيوجدو فـ 48 ساعة فقط.
            </p>
            <a href="#pricing" className="btn btn-em">
              <span>طلب الباقة لمحلك دابا</span>
              <svg className="ic">
                <use href="#i-bolt" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <p>© {new Date().getFullYear()} Walink (walink.ma) • جميع الحقوق محفوظة لرواد الأعمال في المغرب 🇲🇦</p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <a href="https://wa.me/212708107351" target="_blank" rel="noopener noreferrer">
              واتساب الدعم (+212 708 107 351)
            </a>
            <span>•</span>
            <Link href="/admin">لوحة الإدارة</Link>
            <span>•</span>
            <Link href="/admin/outreach">استوديو المبيعات</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className={`mbar ${showMbar ? "show" : ""}`} id="mbar">
        <p>
          باك Growth الأكثر طلباً
          <b className="lat">2,400 DH</b>
        </p>
        <button
          type="button"
          className="btn btn-em"
          onClick={() => {
            setModalPlan("growth");
            setIsModalOpen(true);
          }}
        >
          <span>طلب دابا</span>
          <svg className="ic">
            <use href="#i-bolt" />
          </svg>
        </button>
      </div>

      {/* Checkout Bottom Sheet Modal (Matches Reference 2nd Screenshot 100%) */}
      <div className={`modal ${isModalOpen ? "open" : ""}`} id="modal">
        <div
          className="scrim"
          id="mScrim"
          role="button"
          tabIndex={0}
          aria-label="إغلاق النافذة"
          onClick={() => setIsModalOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsModalOpen(false);
            }
          }}
        />
        <div className="sheet">
          <div className="grab" />
          <button
            type="button"
            className="mx"
            id="mClose"
            aria-label="إغلاق النافذة"
            onClick={() => setIsModalOpen(false)}
          >
            <svg className="ic">
              <use href="#i-x" />
            </svg>
          </button>

          <h3>تأكيد الطلب — باك {PLANS_DATA[modalPlan]?.title}</h3>

          <div className="sel-plan">
            <div>
              <b id="mPlanTitle">باك {PLANS_DATA[modalPlan]?.title}</b>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                تبديل الباقة
              </button>
            </div>
            <span className="lat" id="mPlanPrice">
              {PLANS_DATA[modalPlan]?.price} DH
            </span>
          </div>

          <form id="orderForm" onSubmit={handleOrderSubmit}>
            <div>
              <label className="fl" htmlFor="fShop">
                اسم المحل التجاري *
              </label>
              <input
                className={`inp ${modalErrors.shop ? "bad" : ""}`}
                id="fShop"
                type="text"
                placeholder="مثال: Café Atlas"
                value={modalShop}
                onChange={(e) => setModalShop(e.target.value)}
                maxLength={30}
              />
              <div className={`err ${modalErrors.shop ? "show" : ""}`} id="eShop">
                يرجى كتابة اسم المحل
              </div>
            </div>

            <div>
              <div className="fl">نوع النشاط</div>
              <div className="mchips" id="mNiches">
                {Object.values(NICHES_DICT).map((n) => (
                  <button
                    key={n.id}
                    className="chip"
                    type="button"
                    aria-checked={modalNiche === n.id}
                    onClick={() => setModalNiche(n.id)}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="fl" htmlFor="fCity">
                المدينة *
              </label>
              <input
                className={`inp ${modalErrors.city ? "bad" : ""}`}
                id="fCity"
                type="text"
                list="cities"
                placeholder="الدار البيضاء"
                value={modalCity}
                onChange={(e) => setModalCity(e.target.value)}
                maxLength={30}
              />
              <datalist id="cities">
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <div className={`err ${modalErrors.city ? "show" : ""}`} id="eCity">
                يرجى كتابة المدينة
              </div>
            </div>

            <div>
              <label className="fl" htmlFor="fPhone">
                رقم الهاتف / الواتساب (اختياري)
              </label>
              <input
                className="inp lat"
                id="fPhone"
                type="tel"
                placeholder="06 00 00 00 00"
                value={modalPhone}
                onChange={(e) => setModalPhone(e.target.value)}
                maxLength={18}
              />
            </div>

            <div className="payline">
              <svg className="ic">
                <use href="#i-shield" />
              </svg>
              <span>
                <b>50% تسبيق</b> لتأكيد التصميم، و <b>50% عند التوصيل</b>.
              </span>
            </div>

            <div className="send">
              <button
                type="submit"
                className="btn btn-em btn-block"
                id="btnSend"
                disabled={isSubmitting}
              >
                <svg viewBox="0 0 24 24">
                  <use href="#i-wa" />
                </svg>
                <span>
                  {isSubmitting
                    ? "جاري الحفظ..."
                    : "صيفط الطلب فـ واتساب (مباشرة)"}
                </span>
              </button>
              <p className="fine">
                كتواصل مباشرة مع مسؤول المنصة لتأكيد تفاصيل اللوجو وألوان علامتك
                التجارية.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

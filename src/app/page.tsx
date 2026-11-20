"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import "./landing.css";
import { useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Moroccan Cities Datalist
const MOROCCAN_CITIES = [
  "الدار البيضاء / Casablanca",
  "الرباط / Rabat",
  "مراكش / Marrakech",
  "طنجة / Tanger",
  "أكادير / Agadir",
  "فاس / Fès",
  "مكناس / Meknès",
  "وجدة / Oujda",
  "القنيطرة / Kénitra",
  "تطوان / Tétouan",
  "تمارة / Témara",
  "سلا / Salé",
  "الجديدة / El Jadida",
  "المحمدية / Mohammédia",
  "بني ملال / Béni Mellal",
  "خريبكة / Khouribga",
  "الناظور / Nador",
  "تازة / Taza",
  "المضيق / M'diq",
];

// Niche Definitions
interface NicheMeta {
  id: string;
  icon: string;
  pc: string;
  grad: string;
}

const NICHES_META: Record<string, NicheMeta> = {
  cafe: {
    id: "cafe",
    icon: "i-coffee",
    pc: "#6b4226",
    grad: "linear-gradient(150deg, #6b4226 0%, #3d2414 100%)",
  },
  barber: {
    id: "barber",
    icon: "i-scissors",
    pc: "#1e3a5f",
    grad: "linear-gradient(150deg, #1e3a5f 0%, #0d1b2a 100%)",
  },
  snack: {
    id: "snack",
    icon: "i-utensils",
    pc: "#b45309",
    grad: "linear-gradient(150deg, #b45309 0%, #78350f 100%)",
  },
  wash: {
    id: "wash",
    icon: "i-car",
    pc: "#0e7490",
    grad: "linear-gradient(150deg, #0e7490 0%, #155e75 100%)",
  },
  beauty: {
    id: "beauty",
    icon: "i-sparkles",
    pc: "#be185d",
    grad: "linear-gradient(150deg, #be185d 0%, #831843 100%)",
  },
  laundry: {
    id: "laundry",
    icon: "i-laundry",
    pc: "#6d28d9",
    grad: "linear-gradient(150deg, #6d28d9 0%, #4c1d95 100%)",
  },
  other: {
    id: "other",
    icon: "i-store",
    pc: "#047857",
    grad: "linear-gradient(150deg, #047857 0%, #064e3b 100%)",
  },
};

const PLANS_DATA: Record<string, { title: string; price: string; numPrice: number }> = {
  starter: { title: "Starter", price: "1,500", numPrice: 1500 },
  growth: { title: "Growth", price: "2,400", numPrice: 2400 },
  multi: { title: "Multi-Branch", price: "3,900", numPrice: 3900 },
};

export default function LandingPage() {
  const { t, locale, dir } = useI18n();

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
      audioCtxRef.current.resume().catch((err) => {
        console.warn("Audio resume error:", err);
      });
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
  const [demoLoyaltyType, setDemoLoyaltyType] = useState<"STAMPS" | "CASHBACK">("STAMPS");
  const [cashbackBalance, setCashbackBalance] = useState<number>(35.50);
  const [currentTab, setCurrentTab] = useState<"pass" | "dash">("pass");
  const [tabBSeen, setTabBSeen] = useState<boolean>(false);
  const [stampsCount, setStampsCount] = useState<number>(3);
  const [stampNewIndex, setStampNewIndex] = useState<number>(-1);
  const [passShine, setPassShine] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const triggerSyncPulse = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

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
  const [ownerMsg, setOwnerMsg] = useState<string>("عرض خاص لنهاية الأسبوع: -20% في Café Atlas");
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

  // Demo Interactions Tracker
  const [demoClicks, setDemoClicks] = useState<number>(0);

  // ROI Sliders
  const [roiCount, setRoiCount] = useState<number>(8);
  const [roiSpend, setRoiSpend] = useState<number>(35);

  // Modal / Checkout
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalPlan, setModalPlan] = useState<string>("growth");
  const [modalNiche, setModalNiche] = useState<string>("cafe");
  const [modalCity, setModalCity] = useState<string>("الدار البيضاء / Casablanca");
  const [modalPhone, setModalPhone] = useState<string>("");
  const [modalShop, setModalShop] = useState<string>("Café Atlas");
  const [modalErrors, setModalErrors] = useState<{ shop?: boolean; city?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Header solid on scroll & Mobile sticky bar
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [showMbar, setShowMbar] = useState<boolean>(false);

  const activeMeta = NICHES_META[currentNiche] || NICHES_META.cafe;
  const activeNicheInfo = t.niches[currentNiche] || t.niches.cafe;

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
      if (qType && NICHES_META[qType.toLowerCase()]) {
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

  // Sync default demo marketing message when locale changes
  useEffect(() => {
    if (ownerTpl === "w") {
      setOwnerMsg(
        locale === "fr"
          ? `Offre Weekend : -20% ce samedi et dimanche chez ${shopInput}`
          : locale === "es"
          ? `Oferta Fin de Semana: -20% este sábado y domingo en ${shopInput}`
          : `عرض خاص لنهاية الأسبوع: -20% هذا السبت والأحد في ${shopInput}`
      );
    }
  }, [locale, shopInput, ownerTpl]);

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
        title: t.hero.notification1,
        text: `${activeNicheInfo.prefix || ""} ${shopInput} — 4 / 5`,
      },
      {
        icon: "i-pin",
        ap: "linear-gradient(135deg,#059669,#047857)",
        title: t.hero.notification2,
        text: t.engines.radarLockBody,
      },
      {
        icon: "i-coins",
        ap: "linear-gradient(135deg,#D97706,#B45309)",
        title: t.hero.notification3,
        text: `${shopInput} • +10% Cashback`,
      },
      {
        icon: "i-star",
        ap: "linear-gradient(135deg,#2563EB,#1D4ED8)",
        title: t.engines.reviewsLockTitle,
        text: t.engines.reviewsLockBody,
      },
      {
        icon: "i-back",
        ap: "linear-gradient(135deg,#DC2626,#991B1B)",
        title: t.engines.winbackLockTitle,
        text: t.engines.winbackLockBody,
      },
      {
        icon: "i-mega",
        ap: "linear-gradient(135deg,#4F46E5,#3730A3)",
        title: t.engines.pushLockTitle,
        text: t.engines.pushLockBody,
      },
    ],
    [t, activeNicheInfo.prefix, shopInput]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroCycleIdx((p) => (p + 1) % heroNotifs.length);
    }, 3800);
    return () => clearInterval(timer);
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
      time: locale === "ar" ? "الآن" : locale === "fr" ? "Maintenant" : "Ahora",
    });
    setDemoClicks((c) => c + 1);

    setTimeout(() => {
      setBanner((b) => (b && Date.now() - Number(b.id) >= 4200 ? null : b));
    }, 4500);
  };

  // Stamping action
  const handleStamp = () => {
    triggerSyncPulse();
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
        t.pass.rewardUnlockedTitle,
        t.pass.rewardUnlockedBody
      );
      setTimeout(() => {
        showBanner(
          "i-star",
          "linear-gradient(135deg,#2563EB,#1D4ED8)",
          t.engines.reviewsLockTitle,
          t.engines.reviewsLockBody
        );
      }, 2400);
    } else {
      playDing();
      triggerVibrate();
      showBanner(
        activeMeta.icon,
        activeMeta.grad,
        t.pass.stampAddedTitle,
        t.pass.stampAddedBody.replace("{left}", String(5 - next))
      );
    }
  };

  // Cashback Add Action
  const handleCashbackAdd = () => {
    triggerSyncPulse();
    const added = 15;
    const newBal = cashbackBalance + added;
    setCashbackBalance(newBal);
    setPassShine(true);
    setTimeout(() => setPassShine(false), 1400);
    playDing();
    triggerVibrate();
    showBanner(
      "i-coins",
      "linear-gradient(135deg,#059669,#047857)",
      t.pass.cashbackEarnedTitle,
      t.pass.cashbackEarnedBody
        .replace("{amount}", added.toString())
        .replace(/{currency}/g, "DH")
        .replace("{rate}", "10")
        .replace("{balance}", newBal.toFixed(2))
    );
  };

  // Owner App Broadcast Action
  const handleSendOwnerPromo = () => {
    setOwnerCredits((c) => Math.max(0, c - 20));
    setOwnerSentCount((s) => s + 1);
    playDing();
    showBanner(
      "i-mega",
      "linear-gradient(135deg,#4F46E5,#3730A3)",
      t.demo.sendBroadcastBtn,
      ownerMsg
    );
  };

  // Template switch for Owner Promo
  const selectOwnerTpl = (tpl: string) => {
    setOwnerTpl(tpl);
    if (tpl === "w") {
      setOwnerMsg(
        locale === "fr"
          ? `Offre Weekend : -20% ce samedi et dimanche chez ${shopInput}`
          : locale === "es"
          ? `Oferta Fin de Semana: -20% este sábado y domingo en ${shopInput}`
          : `عرض خاص لنهاية الأسبوع: -20% هذا السبت والأحد في ${shopInput}`
      );
    } else if (tpl === "h") {
      setOwnerMsg(
        locale === "fr"
          ? `Happy Hour : Le 2ème article à moitié prix de 17h à 19h chez ${shopInput}`
          : locale === "es"
          ? `Happy Hour: El 2º artículo a mitad de precio de 17h a 19h en ${shopInput}`
          : `ساعة التخفيضات: المنتج الثاني بنصف السعر اليوم من 5 إلى 7 مساءً في ${shopInput}`
      );
    } else if (tpl === "v") {
      setOwnerMsg(
        locale === "fr"
          ? `Exclusif VIP : Un cadeau de bienvenue vous attend aujourd'hui chez ${shopInput}`
          : locale === "es"
          ? `Exclusivo VIP: Un regalo de bienvenida le espera hoy en ${shopInput}`
          : `خاص بالعملاء المميزين: هدية تقديرية بانتظارك اليوم في ${shopInput}`
      );
    }
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
    const nicheName = activeNicheInfo.name || modalNiche;

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

      // 2. Redirect to WhatsApp with formatted multilingual message
      let text = "";
      if (locale === "fr") {
        text = `Bonjour l'équipe Walink 👋\nJe souhaite commander le pack de fidélité digitale pour mon commerce :\n\n🏢 Nom du commerce : ${modalShop.trim()}\n📍 Activité : ${nicheName}\n🏙 Ville : ${modalCity.trim()}\n📦 Pack choisi : ${planObj.title} (${planObj.price} DH)\n${modalPhone.trim() ? `📞 Téléphone : ${modalPhone.trim()}\n` : ""}\nPouvez-vous préparer le design de la carte et le stand de comptoir ? Merci !`;
      } else if (locale === "es") {
        text = `Hola equipo de Walink 👋\nDeseo solicitar el pack de fidelización digital para mi negocio:\n\n🏢 Nombre del negocio: ${modalShop.trim()}\n📍 Actividad: ${nicheName}\n🏙 Ciudad: ${modalCity.trim()}\n📦 Pack elegido: ${planObj.title} (${planObj.price} DH)\n${modalPhone.trim() ? `📞 Teléfono: ${modalPhone.trim()}\n` : ""}\n¿Podrían preparar el diseño de la tarjeta y el soporte de mostrador? ¡Gracias!`;
      } else {
        text = `السلام عليكم فريق Walink 👋\nأرغب في طلب باقة بطاقة الولاء الرقمية لمتجري:\n\n🏢 اسم المحل: ${modalShop.trim()}\n📍 مجال النشاط: ${nicheName}\n🏙 المدينة: ${modalCity.trim()}\n📦 الباقة المختارة: ${planObj.title} (${planObj.price} درهم)\n${modalPhone.trim() ? `📞 الهاتف: ${modalPhone.trim()}\n` : ""}\nهل يمكنكم تجهيز التصميم الرقمي وستاند الكاونتر؟ شكراً لكم!`;
      }

      const waUrl = `https://wa.me/212661848790?text=${encodeURIComponent(text)}`;
      window.location.href = waUrl;
    } catch (err) {
      console.error("Order lead submission error:", err);
      window.location.href = `https://wa.me/212661848790`;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="walink-landing" dir={dir}>
      {/* 3 Animated Ambient Orbs */}
      <div className="orbs" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      {/* SVG Sprite containing all reference symbols */}
      <svg style={{ display: "none" }} aria-hidden="true">
        <defs>
          <linearGradient id="mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00A884" />
            <stop offset="50%" stopColor="#008069" />
            <stop offset="100%" stopColor="#075E54" />
          </linearGradient>
          <symbol id="mark" viewBox="0 0 32 32">
            <path
              fill="url(#mark-grad)"
              d="M16 3L4 7v9c0 8.3 5.1 12.8 12 14 6.9-1.2 12-5.7 12-14V7L16 3z"
            />
            <path
              fill="#FFFFFF"
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
          <Link href="/" className="logo" aria-label="Walink Home">
            <svg viewBox="0 0 32 32">
              <use href="#mark" />
            </svg>
            <b className="lat">
              walink<i>.ma</i>
            </b>
            <span>{t.brand.arabicName}</span>
          </Link>
          <nav className="nav">
            <a href="#demo">{t.nav.demo}</a>
            <a href="#how">{t.nav.howItWorks}</a>
            <a href="#pricing">{t.nav.pricing}</a>
            <a href="#faq">{t.nav.faq}</a>
            <Link href="/support">{t.footer.supportLink}</Link>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <LanguageSwitcher size="sm" />
            <a href="#pricing" className="btn btn-em">
              <span>{t.nav.startNow}</span>
              <svg className="ic">
                <use href="#i-bolt" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="wrap">
          <div>
            <div className="live">
              <span className="dot" />
              <span>
                <b>{t.hero.badge}</b>
              </span>
            </div>
            <h1>
              {t.hero.title1}
              <span className="l2">{t.hero.title2}</span>
            </h1>
            <p className="sub">{t.hero.desc}</p>
            <div className="feat">
              <span>
                <svg className="ic">
                  <use href="#i-pin" />
                </svg>
                {t.engines.radarTitle}
              </span>
              <span>
                <svg className="ic">
                  <use href="#i-star" />
                </svg>
                {t.engines.reviewsTitle}
              </span>
              <span>
                <svg className="ic">
                  <use href="#i-back" />
                </svg>
                {t.engines.winbackTitle}
              </span>
            </div>
            <div className="cta-row">
              <a href="#demo" className="btn btn-em">
                <svg className="ic">
                  <use href="#i-play" />
                </svg>
                <span>{t.hero.ctaPrimary}</span>
              </a>
              <a href="#pricing" className="btn btn-ghost">
                <span>{t.hero.ctaSecondary}</span>
                <span className="lat">→</span>
              </a>
            </div>
            <div className="facts">
              <span>
                <svg className="ic">
                  <use href="#i-check" />
                </svg>
                {locale === "fr"
                  ? "Paiement unique"
                  : locale === "es"
                  ? "Pago único"
                  : "دفع لمرة واحدة"}
              </span>
              <span>
                <svg className="ic">
                  <use href="#i-check" />
                </svg>
                {locale === "fr"
                  ? "Prêt en 48 heures"
                  : locale === "es"
                  ? "Listo en 48 horas"
                  : "جاهز في 48 ساعة"}
              </span>
              <span>
                <svg className="ic">
                  <use href="#i-check" />
                </svg>
                {locale === "fr"
                  ? "Livraison gratuite"
                  : locale === "es"
                  ? "Envío gratuito"
                  : "توصيل مجاني لمتجرك"}
              </span>
            </div>

            {/* Enterprise Ecosystem Trust Bar */}
            <div className="trust-bar" aria-label="Ecosystem Compatibility">
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.9.04-2 .6-2.65 1.36-.56.65-1.06 1.7-1 2.76 1.01.08 2.03-.51 2.64-1.25z"/>
                </svg>
                <span>{t.enterprise.worksWithApple}</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path d="M21.35 11.1H12v3.16h5.36c-.23 1.25-.94 2.31-2 3.02v2.51h3.24c1.9-1.75 2.99-4.32 2.99-7.39 0-.44-.04-.87-.1-1.3z" fill="#4285F4"/>
                  <path d="M12 21c2.7 0 4.97-.9 6.62-2.43l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59C4.7 18.77 8.08 21 12 21z" fill="#34A853"/>
                  <path d="M6.4 12.9c-.2-.6-.31-1.24-.31-1.9s.11-1.3.31-1.9V6.51H3.06C2.39 7.84 2 9.37 2 11s.39 3.16 1.06 4.49l3.34-2.59z" fill="#FBBC05"/>
                  <path d="M12 5.08c1.47 0 2.79.5 3.82 1.49l2.87-2.87C16.96 2.06 14.7 1 12 1 8.08 1 4.7 3.23 3.06 6.51l3.34 2.59C7.19 6.74 9.4 5.08 12 5.08z" fill="#EA4335"/>
                </svg>
                <span>{t.enterprise.googleWalletCertified}</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
                  <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/>
                  <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/>
                  <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8"/>
                  <path d="M16.37 2a20.16 20.16 0 0 1 0 20"/>
                </svg>
                <span>{t.enterprise.nfcForumStandard}</span>
              </div>
              <div className="trust-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <span>{t.enterprise.bankGradeSecurity}</span>
              </div>
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
                    <div className="date">
                      {locale === "fr"
                        ? "Jeudi 12 Novembre"
                        : locale === "es"
                        ? "Jueves 12 de Noviembre"
                        : "الخميس، 12 نوفمبر"}
                    </div>
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
                            <small>
                              {locale === "fr"
                                ? "Maintenant"
                                : locale === "es"
                                ? "Ahora"
                                : "الآن"}
                            </small>
                          </div>
                          <div className="nt">{heroNotifs[heroCycleIdx].text}</div>
                        </div>
                      </div>
                    </div>

                    <div className="lp">
                      <div
                        className="pass compact"
                        style={{
                          background: activeMeta.grad,
                          ["--pc" as string]: activeMeta.pc,
                        }}
                      >
                        <div className="p-head">
                          <div className="p-brand">
                            <div className="p-logo">
                              <svg className="ic">
                                <use href={`#${activeMeta.icon}`} />
                              </svg>
                            </div>
                            <b className="p-name">{shopInput}</b>
                          </div>
                          <div className="p-f p-hf">
                            <small>{t.pass.stampsLabel}</small>
                            <b className="lat">4 / 5</b>
                          </div>
                        </div>
                        <div className="p-strip">
                          {[1, 2, 3, 4].map((i) => (
                            <div className="stp on" key={i}>
                              <svg className="ic">
                                <use href={`#${activeMeta.icon}`} />
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
                            <small>{t.pass.rewardLabel}</small>
                            <b>{activeNicheInfo.reward}</b>
                          </div>
                          <div className="p-f p-hf">
                            <small>{t.pass.memberCodeLabel}</small>
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
                  <div className="cap">{t.hero.standDesc}</div>
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
            <h2 className="h2 silver">{t.demo.title}</h2>
            <p className="lead">{t.demo.subtitle}</p>
          </div>

          <div className="demo-grid counter-theater">
            {/* 1. Smart Merchant POS Terminal */}
            <div className="surface pos-terminal">
              {/* POS Top Bar Header */}
              <div className="pos-header">
                <div className="pos-badge">
                  <svg className="ic">
                    <use href="#i-dash" />
                  </svg>
                  <span>
                    {t.demo.merchantTab}{" "}
                    {locale === "fr"
                      ? "(POS Comptoir)"
                      : locale === "es"
                      ? "(POS Mostrador)"
                      : "(POS الكاونتر)"}
                  </span>
                </div>
                <div className={`pos-sync-pill ${isSyncing ? "syncing" : ""}`}>
                  <span className="sync-dot pulse" />
                  <span className="lat">Cloud Sync &lt; 45ms</span>
                </div>
              </div>

              {/* 1. Shop Name */}
              <label className="fl" htmlFor="shop" style={{ marginTop: "14px" }}>
                1. {t.checkout.shopNameLabel}
              </label>
              <input
                className="inp"
                id="shop"
                type="text"
                value={shopInput}
                onChange={(e) => setShopInput(e.target.value)}
                placeholder={t.checkout.shopNamePlaceholder}
                maxLength={24}
              />

              {/* 2. Niche Selection */}
              <div className="fl" style={{ marginTop: "16px" }}>
                2. {t.checkout.nicheLabel}
              </div>
              <div className="niches" id="niches">
                {Object.keys(NICHES_META).map((key) => {
                  const meta = NICHES_META[key];
                  const info = t.niches[key] || t.niches.cafe;
                  return (
                    <button
                      key={key}
                      className="nch"
                      type="button"
                      aria-pressed={currentNiche === key}
                      onClick={() => {
                        setCurrentNiche(key);
                        setShopInput(info.defaultShop);
                      }}
                    >
                      <svg className="ic">
                        <use href={`#${meta.icon}`} />
                      </svg>
                      <span>{info.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 3. Dual Loyalty Mode Selector */}
              <div className="fl" style={{ marginTop: "16px" }}>
                3. {t.demo.cardTypeLabel}
              </div>
              <div className="pos-mode-grid">
                <button
                  type="button"
                  aria-pressed={demoLoyaltyType === "STAMPS"}
                  onClick={() => setDemoLoyaltyType("STAMPS")}
                  className={`pos-mode-btn ${demoLoyaltyType === "STAMPS" ? "active" : ""}`}
                >
                  <svg className="ic">
                    <use href="#i-gift" />
                  </svg>
                  <span>{t.demo.stampsType}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={demoLoyaltyType === "CASHBACK"}
                  onClick={() => setDemoLoyaltyType("CASHBACK")}
                  className={`pos-mode-btn ${demoLoyaltyType === "CASHBACK" ? "active" : ""}`}
                >
                  <svg className="ic">
                    <use href="#i-coins" />
                  </svg>
                  <span>{t.demo.cashbackType}</span>
                </button>
              </div>

              {/* Cashier Interactive Action Deck */}
              <div className="pos-deck">
                <div className="pos-deck-head">
                  <div className="pos-deck-title">
                    <svg className="ic"><use href="#i-bolt" /></svg>
                    <b>
                      {locale === "fr"
                        ? "Opérations caisse en direct (testez vous-même) :"
                        : locale === "es"
                        ? "Operaciones de caja en vivo (pruébelo usted mismo):"
                        : "عمليات الكاشير المباشرة (جرّب بنفسك):"}
                    </b>
                  </div>
                  <span className="pos-live-tag">Live POS</span>
                </div>

                {/* Primary Cashier Button */}
                <button
                  type="button"
                  className="pos-cashier-btn"
                  id="tStamp"
                  onClick={() => {
                    triggerSyncPulse();
                    if (demoLoyaltyType === "CASHBACK") {
                      handleCashbackAdd();
                    } else {
                      handleStamp();
                    }
                  }}
                >
                  <span className="p-c-icon">
                    <svg className="ic">
                      <use
                        href={
                          demoLoyaltyType === "CASHBACK"
                            ? "#i-coins"
                            : "#i-plus"
                        }
                      />
                    </svg>
                  </span>
                  <span className="p-c-text">
                    <b>
                      {demoLoyaltyType === "CASHBACK"
                        ? t.demo.cashbackAction
                        : `${t.demo.stampAction} (+1)`}
                    </b>
                    <small>
                      {locale === "fr"
                        ? "Cliquez pour envoyer au portefeuille du client"
                        : locale === "es"
                        ? "Haga clic para enviar a la billetera del cliente"
                        : "اضغط لإرسال الختم لمحفظة هاتف العميل فوراً"}
                    </small>
                  </span>
                  <span className="p-c-badge">⚡</span>
                </button>

                {/* Quick Marketing Automations Grid */}
                <div className="pos-quick-auto">
                  <button
                    type="button"
                    className="pos-auto-chip"
                    onClick={() => {
                      triggerSyncPulse();
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-pin",
                        "linear-gradient(135deg,#059669,#047857)",
                        t.engines.radarLockTitle,
                        t.engines.radarLockBody
                      );
                    }}
                  >
                    <svg className="ic"><use href="#i-pin" /></svg>
                    <span>{t.demo.radarSimulate}</span>
                  </button>

                  <button
                    type="button"
                    className="pos-auto-chip"
                    onClick={() => {
                      triggerSyncPulse();
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-back",
                        "linear-gradient(135deg,#DC2626,#991B1B)",
                        t.engines.winbackLockTitle,
                        t.engines.winbackLockBody
                      );
                    }}
                  >
                    <svg className="ic"><use href="#i-back" /></svg>
                    <span>{t.demo.winbackSimulate}</span>
                  </button>

                  <button
                    type="button"
                    className="pos-auto-chip"
                    onClick={() => {
                      triggerSyncPulse();
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-star",
                        "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        t.engines.reviewsLockTitle,
                        t.engines.reviewsLockBody
                      );
                    }}
                  >
                    <svg className="ic"><use href="#i-star" /></svg>
                    <span>{t.demo.reviewSimulate}</span>
                  </button>

                  <button
                    type="button"
                    className="pos-auto-chip"
                    onClick={() => {
                      triggerSyncPulse();
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-mega",
                        "linear-gradient(135deg,#4F46E5,#3730A3)",
                        t.engines.pushLockTitle,
                        t.engines.pushLockBody
                      );
                    }}
                  >
                    <svg className="ic"><use href="#i-mega" /></svg>
                    <span>{t.demo.promoSimulate}</span>
                  </button>
                </div>
              </div>

              {/* Order Pack Button */}
              <div style={{ marginTop: "18px" }}>
                <a href="#pricing" className="btn btn-em btn-block">
                  <svg className="ic">
                    <use href="#i-bolt" />
                  </svg>
                  <span>{t.finalCta.btn}</span>
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
                  <span>{t.demo.phoneTab}</span>
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
                  <span>{t.demo.merchantTab}</span>
                  <span className="newb">
                    {locale === "fr" ? "Nouveau" : locale === "es" ? "Nuevo" : "جديد"}
                  </span>
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
                          background: activeMeta.grad,
                          ["--pc" as string]: activeMeta.pc,
                        }}
                      >
                        <div className="p-head">
                          <div className="p-brand">
                            <div className="p-logo" id="pLogo">
                              <svg className="ic">
                                <use href={`#${activeMeta.icon}`} />
                              </svg>
                            </div>
                            <b className="p-name" id="pName">
                              {shopInput}
                            </b>
                          </div>

                          {demoLoyaltyType === "STAMPS" ? (
                            <div className="p-f p-hf">
                              <small>{t.pass.stampsLabel}</small>
                              <b className="lat" id="pCount">
                                {stampsCount} / 5
                              </b>
                            </div>
                          ) : (
                            <div className="p-f p-hf">
                              <small>{t.pass.cashbackRateLabel}</small>
                              <b className="lat" style={{ color: "var(--em2)" }}>
                                +10%
                              </b>
                            </div>
                          )}
                        </div>

                        {/* Pass Body: STAMPS vs CASHBACK */}
                        {demoLoyaltyType === "STAMPS" ? (
                          <>
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
                                      <use href={`#${activeMeta.icon}`} />
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
                                <small>{t.pass.rewardLabel}</small>
                                <b id="pRew">{activeNicheInfo.reward}</b>
                              </div>
                              <div className="p-f p-hf">
                                <small>{t.pass.memberCodeLabel}</small>
                                <b className="lat">#4821</b>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Glowing Cashback Strip */}
                            <div
                              className="p-cashback-strip"
                              style={{
                                margin: "10px 0",
                                padding: "14px 12px",
                                borderRadius: "14px",
                                background: "rgba(0,0,0,0.45)",
                                border: "1px solid rgba(255,255,255,0.14)",
                                textAlign: "center",
                                boxShadow:
                                  "inset 0 1px 1px rgba(255,255,255,0.15), 0 8px 20px -6px rgba(0,0,0,0.5)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: "rgba(255,255,255,0.75)",
                                  marginBottom: "2px",
                                }}
                              >
                                {t.pass.balanceAvailable}
                              </div>
                              <div
                                style={{
                                  fontSize: "26px",
                                  fontWeight: 700,
                                  color: "var(--em2)",
                                  letterSpacing: "-0.5px",
                                }}
                              >
                                <span className="lat">
                                  {cashbackBalance.toFixed(2)}
                                </span>{" "}
                                DH
                              </div>
                              <div
                                style={{
                                  display: "inline-block",
                                  marginTop: "4px",
                                  padding: "2px 8px",
                                  borderRadius: "99px",
                                  background: "rgba(16,185,129,0.2)",
                                  color: "var(--em2)",
                                  fontSize: "10.5px",
                                  fontWeight: 600,
                                }}
                              >
                                +10% {t.pass.onEveryPurchase}
                              </div>
                            </div>

                            <div className="p-row">
                              <div className="p-f">
                                <small>{t.pass.totalEarned}</small>
                                <b className="lat">
                                  {(cashbackBalance + 45).toFixed(2)} DH
                                </b>
                              </div>
                              <div className="p-f p-hf">
                                <small>{t.pass.memberCodeLabel}</small>
                                <b className="lat">#4821</b>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="p-code">
                          <svg viewBox="0 0 100 100" fill="#000">
                            <path d="M10 10h30v30H10zm6 6v18h18V16zm4 4h10v10H20zM60 10h30v30H60zm6 6v18h18V16zm4 4h10v10H70zM10 60h30v30H10zm6 6v18h18V66zm4 4h10v10H20zM50 15h6v12h-6zM85 50h6v12h-6zM50 75h8v6h-8zM68 62h14v8H68zM52 52h10v10H52zm24 24h12v12H76zM60 84h8v6h-8zM85 75h6v6h-6z" />
                          </svg>
                          <small className="lat">WALINK #4821</small>
                        </div>
                      </div>

                      <div className="w-meta">
                        <div>
                          <span>{t.pass.lastVisitLabel}</span>
                          <b id="wLast">14:22</b>
                        </div>
                        <div>
                          <span>
                            {demoLoyaltyType === "STAMPS"
                              ? t.pass.rewardLabel
                              : t.pass.balanceAvailable}
                          </span>
                          <b id="wNext" style={{ color: "var(--gold2)" }}>
                            {demoLoyaltyType === "STAMPS"
                              ? stampsCount >= 5
                                ? t.pass.rewardUnlockedTitle
                                : locale === "fr"
                                ? `${5 - stampsCount} tampons`
                                : locale === "es"
                                ? `${5 - stampsCount} sellos`
                                : `${5 - stampsCount} أختام`
                              : `${cashbackBalance.toFixed(2)} DH`}
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
                          <small>{t.demo.merchantTab}</small>
                          <b id="oShop">{shopInput}</b>
                        </div>
                        <div className="o-cred">
                          <svg className="ic">
                            <use href="#i-coins" />
                          </svg>
                          <span>{t.demo.creditsBalance}</span>
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
                              <small>{t.demo.kpiTotalVisits}</small>
                            </div>
                            <div className="d-card">
                              <b>
                                64<em>+8</em>
                              </b>
                              <small>{t.demo.kpiReturning}</small>
                            </div>
                            <div className="d-card">
                              <b>
                                18<em>🎁</em>
                              </b>
                              <small>{t.demo.kpiCashbackGiven}</small>
                            </div>
                            <div className="d-card">
                              <b>
                                4.9<em style={{ color: "var(--gold2)" }}>★</em>
                              </b>
                              <small>{t.demo.kpiGoogleReviews}</small>
                            </div>
                          </div>

                          <div className="quiet">
                            <div>
                              <b>3</b> {t.demo.audienceQuiet}
                            </div>
                            <button
                              type="button"
                              className="mini"
                              onClick={() => {
                                setOwnerSubTab("promo");
                                setOwnerAud("quiet");
                                setOwnerMsg(t.engines.winbackLockBody);
                              }}
                            >
                              {t.demo.winbackSimulate}
                            </button>
                          </div>

                          <div className="d-card">
                            <div className="d-lbl">
                              <span>{t.demo.kpiTotalVisits}</span>
                              <b>+1,840 DH</b>
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
                              <span>{t.pass.activityDrawerTitle}</span>
                            </div>
                            <div className="feed">
                              <div>
                                <i>{locale === "fr" || locale === "es" ? "K" : "ك"}</i>
                                <span>
                                  {locale === "fr"
                                    ? "Karim B. (Nouveau tampon)"
                                    : locale === "es"
                                    ? "Karim B. (Nuevo sello)"
                                    : "كريم ب. (طابع جديد)"}
                                </span>
                                <small>
                                  {locale === "fr"
                                    ? "Maintenant"
                                    : locale === "es"
                                    ? "Ahora"
                                    : "الآن"}
                                </small>
                              </div>
                              <div>
                                <i>{locale === "fr" || locale === "es" ? "S" : "س"}</i>
                                <span>
                                  {locale === "fr"
                                    ? "Sara M. (Récompense 5/5) 🎉"
                                    : locale === "es"
                                    ? "Sara M. (Recompensa 5/5) 🎉"
                                    : "سارة م. (مكافأة 5/5) 🎉"}
                                </span>
                                <small>14:10</small>
                              </div>
                              <div>
                                <i>{locale === "fr" || locale === "es" ? "Y" : "ي"}</i>
                                <span>
                                  {locale === "fr"
                                    ? "Yassine A. (Nouveau membre)"
                                    : locale === "es"
                                    ? "Yassine A. (Nuevo miembro)"
                                    : "ياسين ع. (انضمام جديد)"}
                                </span>
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
                          <div className="o-h">{t.demo.ownerClients}</div>
                          <div className="o-s">
                            {locale === "fr"
                              ? "Cliquez sur un client pour lui attribuer un tampon"
                              : locale === "es"
                              ? "Haga clic en un cliente para asignarle un sello"
                              : "انقر على أي عميل لإضافة ختم له"}
                          </div>
                          <div className="cl">
                            {[
                              {
                                av: locale === "fr" || locale === "es" ? "K" : "ك",
                                nm: locale === "fr" || locale === "es" ? "Karim Bennani" : "كريم بناني",
                                ph: "06 61 •• •• 42",
                                st: "3/5",
                                tag: "p-on",
                                tagT: t.merchant.statusActive,
                              },
                              {
                                av: locale === "fr" || locale === "es" ? "S" : "س",
                                nm: locale === "fr" || locale === "es" ? "Sara Majid" : "سارة مجيد",
                                ph: "06 62 •• •• 18",
                                st: "5/5 🎁",
                                tag: "p-vip",
                                tagT: t.merchant.statusVip,
                              },
                              {
                                av: locale === "fr" || locale === "es" ? "M" : "م",
                                nm: locale === "fr" || locale === "es" ? "Mehdi Alami" : "مهدي العلمي",
                                ph: "06 63 •• •• 90",
                                st: "2/5",
                                tag: "p-off",
                                tagT: t.merchant.statusQuiet,
                              },
                              {
                                av: locale === "fr" || locale === "es" ? "F" : "ف",
                                nm: locale === "fr" || locale === "es" ? "Fatima Zahra" : "فاطمة الزهراء",
                                ph: "06 70 •• •• 33",
                                st: "4/5",
                                tag: "p-on",
                                tagT: t.merchant.statusActive,
                              },
                            ].map((c, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  handleStamp();
                                  showBanner(
                                    activeMeta.icon,
                                    activeMeta.grad,
                                    t.pass.stampAddedTitle,
                                    `${c.nm} — ${t.pass.stampAddedBody.replace("{left}", "1")}`
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
                          <div className="o-h">{t.demo.sendPromoTitle}</div>
                          <div className="tpls">
                            <button
                              type="button"
                              className="tpl"
                              aria-pressed={ownerTpl === "w"}
                              onClick={() => selectOwnerTpl("w")}
                            >
                              {locale === "fr"
                                ? "Weekend"
                                : locale === "es"
                                ? "Fin de semana"
                                : "عرض الويكاند"}
                            </button>
                            <button
                              type="button"
                              className="tpl"
                              aria-pressed={ownerTpl === "h"}
                              onClick={() => selectOwnerTpl("h")}
                            >
                              {locale === "fr"
                                ? "Happy Hour"
                                : locale === "es"
                                ? "Happy Hour"
                                : "ساعة سعيدة"}
                            </button>
                            <button
                              type="button"
                              className="tpl"
                              aria-pressed={ownerTpl === "v"}
                              onClick={() => selectOwnerTpl("v")}
                            >
                              VIP
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
                              <b>64</b> {t.demo.audienceAll}
                            </button>
                            <button
                              type="button"
                              aria-pressed={ownerAud === "quiet"}
                              onClick={() => setOwnerAud("quiet")}
                            >
                              <b>3</b> {t.demo.audienceQuiet}
                            </button>
                          </div>

                          <div className="o-cost">
                            <span>
                              {t.demo.creditsCost}:{" "}
                              <b>{ownerAud === "all" ? 64 : 3}</b>
                            </span>
                            <span>
                              {t.demo.creditsBalance}:{" "}
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
                            {t.demo.sendBroadcastBtn}
                          </button>

                          {ownerSentCount > 0 && (
                            <div className="camp">
                              <div>
                                <b>{ownerAud === "all" ? 64 : 3}</b>
                                <span>{t.demo.sendPromoDesc}</span>
                              </div>
                              <div className="hi">
                                <b>
                                  +
                                  {Math.round(
                                    (ownerAud === "all" ? 64 : 3) * 0.28
                                  )}
                                </b>
                                <span>{t.engines.winbackTag}</span>
                              </div>
                              <div>
                                <b className="lat">
                                  +
                                  {Math.round(
                                    (ownerAud === "all" ? 64 : 3) * 0.28 * 35
                                  )}{" "}
                                  DH
                                </b>
                                <span>{t.compare.monthlyExtraRev}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Subtab 4: Automations */}
                        <div
                          className={`otab ${ownerSubTab === "auto" ? "on" : ""}`}
                          id="otab-auto"
                        >
                          <div className="o-h">{t.demo.ownerAuto}</div>
                          <div className="o-s">
                            {locale === "fr"
                              ? "Activez une fois et laissez le moteur gérer la suite"
                              : locale === "es"
                              ? "Actívelo una vez y el sistema se encargará del resto"
                              : "شغّلها مرة واحدة والمنظومة تتكفل بالباقي"}
                          </div>
                          <div className="al">
                            <div>
                              <div className="tx">
                                <b>{t.engines.winbackTitle}</b>
                                <small>
                                  <span className="tag">{t.engines.winbackTag}</span>
                                  <button
                                    type="button"
                                    className="prev"
                                    onClick={() =>
                                      setOwnerPeek({
                                        title: t.engines.winbackLockTitle,
                                        body: t.engines.winbackLockBody,
                                      })
                                    }
                                  >
                                    {locale === "fr"
                                      ? "Aperçu"
                                      : locale === "es"
                                      ? "Vista"
                                      : "معاينة"}
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
                                <b>{t.engines.radarTitle}</b>
                                <small>
                                  <span className="tag free">
                                    {t.engines.radarTag}
                                  </span>
                                  <button
                                    type="button"
                                    className="prev"
                                    onClick={() =>
                                      setOwnerPeek({
                                        title: t.engines.radarLockTitle,
                                        body: t.engines.radarLockBody,
                                      })
                                    }
                                  >
                                    {locale === "fr"
                                      ? "Aperçu"
                                      : locale === "es"
                                      ? "Vista"
                                      : "معاينة"}
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
                                <b>{t.engines.reviewsTitle}</b>
                                <small>
                                  <span className="tag free">
                                    {t.engines.reviewsTag}
                                  </span>
                                  <button
                                    type="button"
                                    className="prev"
                                    onClick={() =>
                                      setOwnerPeek({
                                        title: t.engines.reviewsLockTitle,
                                        body: t.engines.reviewsLockBody,
                                      })
                                    }
                                  >
                                    {locale === "fr"
                                      ? "Aperçu"
                                      : locale === "es"
                                      ? "Vista"
                                      : "معاينة"}
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
                                <b>{t.engines.pushTitle}</b>
                                <small>
                                  <span className="tag free">
                                    {t.engines.pushTag}
                                  </span>
                                  <button
                                    type="button"
                                    className="prev"
                                    onClick={() =>
                                      setOwnerPeek({
                                        title: t.engines.pushLockTitle,
                                        body: t.engines.pushLockBody,
                                      })
                                    }
                                  >
                                    {locale === "fr"
                                      ? "Aperçu"
                                      : locale === "es"
                                      ? "Vista"
                                      : "معاينة"}
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
                          <span>{t.demo.ownerHome}</span>
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
                          <span>{t.demo.ownerClients}</span>
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
                          <span>{t.demo.ownerPromos}</span>
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
                          <span>{t.demo.ownerAuto}</span>
                        </button>
                      </div>

                      {/* Peek Lockscreen Overlay */}
                      <div className={`peek ${ownerPeek ? "on" : ""}`}>
                        <div className="pl">
                          {locale === "fr"
                            ? "Aperçu écran de verrouillage"
                            : locale === "es"
                            ? "Vista en pantalla de bloqueo"
                            : "معاينة على شاشة قفل الهاتف"}
                        </div>
                        <div className="pt">9:41</div>
                        {ownerPeek && (
                          <div className="ntf">
                            <div
                              className="ap"
                              style={{ background: activeMeta.grad }}
                            >
                              <svg className="ic">
                                <use href={`#${activeMeta.icon}`} />
                              </svg>
                            </div>
                            <div className="nb">
                              <div className="nh">
                                <b>{ownerPeek.title}</b>
                                <small>
                                  {locale === "fr"
                                    ? "Maintenant"
                                    : locale === "es"
                                    ? "Ahora"
                                    : "الآن"}
                                </small>
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
                          {locale === "fr"
                            ? "Fermer l'aperçu"
                            : locale === "es"
                            ? "Cerrar vista"
                            : "إغلاق المعاينة"}
                        </button>
                      </div>
                    </div>

                    <div className="home" />
                  </div>
                </div>
              </div>

              {/* Mobile Cashier Action Deck (Visible on screens < 980px, sits comfortably right below the phone) */}
              <div className="counter-mobile-deck">
                <div className="m-deck-caption">
                  <span className="m-pulse-dot" />
                  <b>
                    {locale === "fr"
                      ? "Comptoir commerçant : Cliquez pour interagir en direct"
                      : locale === "es"
                      ? "Mostrador del comerciante: Haga clic para interactuar"
                      : "كاونتر التاجر: انقر للتفاعل المباشر مع البطاقة"}
                  </b>
                </div>
                <button
                  type="button"
                  className="pos-cashier-btn"
                  onClick={() => {
                    triggerSyncPulse();
                    if (demoLoyaltyType === "CASHBACK") {
                      handleCashbackAdd();
                    } else {
                      handleStamp();
                    }
                  }}
                >
                  <span className="p-c-icon">
                    <svg className="ic">
                      <use
                        href={
                          demoLoyaltyType === "CASHBACK"
                            ? "#i-coins"
                            : "#i-plus"
                        }
                      />
                    </svg>
                  </span>
                  <span className="p-c-text">
                    <b>
                      {demoLoyaltyType === "CASHBACK"
                        ? t.demo.cashbackAction
                        : `${t.demo.stampAction} (+1)`}
                    </b>
                  </span>
                  <span className="p-c-badge">⚡</span>
                </button>

                <div className="pos-quick-auto">
                  <button
                    type="button"
                    className="pos-auto-chip"
                    onClick={() => {
                      triggerSyncPulse();
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-pin",
                        "linear-gradient(135deg,#059669,#047857)",
                        t.engines.radarLockTitle,
                        t.engines.radarLockBody
                      );
                    }}
                  >
                    <svg className="ic"><use href="#i-pin" /></svg>
                    <span>{t.demo.radarSimulate}</span>
                  </button>

                  <button
                    type="button"
                    className="pos-auto-chip"
                    onClick={() => {
                      triggerSyncPulse();
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-back",
                        "linear-gradient(135deg,#DC2626,#991B1B)",
                        t.engines.winbackLockTitle,
                        t.engines.winbackLockBody
                      );
                    }}
                  >
                    <svg className="ic"><use href="#i-back" /></svg>
                    <span>{t.demo.winbackSimulate}</span>
                  </button>

                  <button
                    type="button"
                    className="pos-auto-chip"
                    onClick={() => {
                      triggerSyncPulse();
                      playDing();
                      triggerVibrate();
                      showBanner(
                        "i-star",
                        "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        t.engines.reviewsLockTitle,
                        t.engines.reviewsLockBody
                      );
                    }}
                  >
                    <svg className="ic"><use href="#i-star" /></svg>
                    <span>{t.demo.reviewSimulate}</span>
                  </button>
                </div>
              </div>

              {/* Certified Security Badge */}
              <div className="phone-trust-badge">
                <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>
                  {locale === "fr"
                    ? "Certifié Apple Wallet & Google Wallet • Sans aucune application à télécharger"
                    : locale === "es"
                    ? "Certificado Apple Wallet y Google Wallet • Sin apps para descargar"
                    : "معتمد على Apple Wallet و Google Wallet • بدون تطبيقات للتحميل"}
                </span>
              </div>

              {/* Smart Nudge */}
              <div className="stage-foot" id="stageFoot">
                {demoClicks >= 2 && (
                  <div className="nudge glass">
                    <p>
                      <svg className="ic">
                        <use href="#i-bolt" />
                      </svg>
                      <span>{t.finalCta.desc}</span>
                    </p>
                    <a href="#pricing" className="btn btn-gold">
                      {t.nav.pricing}
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
            <h2 className="h2 silver">{t.nav.howItWorks}</h2>
            <p className="lead">{t.hero.desc}</p>
          </div>

          <div className="steps">
            <div className="surface step">
              <div className="sn">
                <i>1</i>
                <svg className="ic">
                  <use href="#i-scan" />
                </svg>
              </div>
              <h3>{t.hero.standBadge}</h3>
              <p>{t.hero.standDesc}</p>
            </div>

            <div className="surface step">
              <div className="sn">
                <i>2</i>
                <svg className="ic">
                  <use href="#i-wallet" />
                </svg>
              </div>
              <h3>{t.pass.addToAppleWallet}</h3>
              <p>
                {locale === "fr"
                  ? "S'ajoute directement à Apple Wallet ou Google Wallet sans installer aucune application."
                  : locale === "es"
                  ? "Se añade directamente a Apple Wallet o Google Wallet sin descargar ninguna aplicación."
                  : "تُحفظ مباشرة في محفظة الهاتف الرقمية بدون الحاجة لتحميل أي تطبيق."}
              </p>
            </div>

            <div className="surface step">
              <div className="sn">
                <i>3</i>
                <svg className="ic">
                  <use href="#i-bell" />
                </svg>
              </div>
              <h3>{t.engines.radarTitle}</h3>
              <p>{t.engines.radarDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Engines Bento Grid (#engines) */}
      <section className="sec" id="engines">
        <div className="wrap">
          <div className="head c">
            <h2 className="h2 silver">{t.engines.sectionTitle}</h2>
            <p className="lead">{t.engines.sectionSubtitle}</p>
          </div>

          <div className="bento bento-2x2">
            {/* Engine 1: Radar 100m */}
            <div className="surface eng eng-card">
              <div className="et">
                <span className="eng-icon">
                  <svg className="ic">
                    <use href="#i-pin" />
                  </svg>
                </span>
                <div className="eng-head-info">
                  <h3>{t.engines.radarTitle}</h3>
                  <div className="tagline tag-gps">
                    <svg className="ic">
                      <use href="#i-wifioff" />
                    </svg>
                    <span>{t.engines.radarTag}</span>
                  </div>
                </div>
              </div>
              <p className="eng-desc">{t.engines.radarDesc}</p>

              {/* Radar Visual Showcase */}
              <div className="radar-showcase">
                <div className="radar-map-mini">
                  <div className="radar-grid-bg" />
                  <div className="radar-concentric" />
                  <div className="radar-sweep" />
                  <span className="radar-dist-tag lat">
                    {locale === "fr"
                      ? "85m • À portée du commerce"
                      : locale === "es"
                      ? "85m • Dentro del alcance"
                      : "85m • داخل نطاق المحل"}
                  </span>
                  <div className="radar-center-pin">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                    </svg>
                  </div>
                  <div className="radar-cust-dot" />
                </div>

                <div className="eng-notification">
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
                      <b>{t.engines.radarLockTitle}</b>
                      <small>
                        {locale === "fr"
                          ? "Maintenant"
                          : locale === "es"
                          ? "Ahora"
                          : "الآن"}
                      </small>
                    </div>
                    <div className="nt">{t.engines.radarLockBody}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine 2: Google Reviews */}
            <div className="surface eng eng-card">
              <div className="et">
                <span className="eng-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
                  <svg className="ic" style={{ color: "#D97706" }}>
                    <use href="#i-star" />
                  </svg>
                </span>
                <div className="eng-head-info">
                  <h3>{t.engines.reviewsTitle}</h3>
                  <div className="tagline tag-review">
                    <svg className="ic">
                      <use href="#i-up" />
                    </svg>
                    <span>{t.engines.reviewsTag}</span>
                  </div>
                </div>
              </div>
              <p className="eng-desc">{t.engines.reviewsDesc}</p>

              {/* Google Reviews Visual Showcase */}
              <div className="google-showcase">
                <div className="google-score-card">
                  <div className="score-left">
                    <b className="score-num lat">4.9</b>
                    <div className="score-stars">★★★★★</div>
                    <small className="score-count">
                      {locale === "fr"
                        ? "284 avis vérifiés sur Google Maps"
                        : locale === "es"
                        ? "284 reseñas verificadas en Google Maps"
                        : "284 تقييم موثق على خرائط Google"}
                    </small>
                  </div>
                  <div className="score-badge">
                    <span className="score-pill">
                      {locale === "fr"
                        ? "Avant Walink : 3.8 ★"
                        : locale === "es"
                        ? "Antes de Walink: 3.8 ★"
                        : "قبل Walink: 3.8 ★"}
                    </span>
                    <span className="score-arrow">➔</span>
                    <span className="score-pill success">
                      {locale === "fr"
                        ? "Avec Walink : 4.9 ★"
                        : locale === "es"
                        ? "Con Walink: 4.9 ★"
                        : "مع Walink: 4.9 ★"}
                    </span>
                  </div>
                </div>

                <div className="eng-notification">
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
                      <b>{t.engines.reviewsLockTitle}</b>
                      <small>
                        {locale === "fr"
                          ? "Maintenant"
                          : locale === "es"
                          ? "Ahora"
                          : "الآن"}
                      </small>
                    </div>
                    <div className="nt">{t.engines.reviewsLockBody}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine 3: 15-Day Winback */}
            <div className="surface eng eng-card">
              <div className="et">
                <span className="eng-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                  <svg className="ic" style={{ color: "#DC2626" }}>
                    <use href="#i-back" />
                  </svg>
                </span>
                <div className="eng-head-info">
                  <h3>{t.engines.winbackTitle}</h3>
                  <div className="tagline tag-winback">
                    <svg className="ic">
                      <use href="#i-bolt" />
                    </svg>
                    <span>{t.engines.winbackTag}</span>
                  </div>
                </div>
              </div>
              <p className="eng-desc">{t.engines.winbackDesc}</p>

              {/* Retention Timeline Visual Showcase */}
              <div className="timeline-showcase">
                <div className="retention-flow">
                  <div className="flow-step">
                    <span className="f-day">
                      {locale === "fr"
                        ? "Jour 1"
                        : locale === "es"
                        ? "Día 1"
                        : "اليوم 1"}
                    </span>
                    <b className="f-act">
                      {locale === "fr"
                        ? "Visite & achat"
                        : locale === "es"
                        ? "Visita y compra"
                        : "زيارة وشراء"}
                    </b>
                  </div>
                  <span className="flow-sep">➔</span>
                  <div className="flow-step warn">
                    <span className="f-day">
                      {locale === "fr"
                        ? "Jour 15"
                        : locale === "es"
                        ? "Día 15"
                        : "اليوم 15"}
                    </span>
                    <b className="f-act">
                      {locale === "fr"
                        ? "Absence inattendue"
                        : locale === "es"
                        ? "Ausencia inusual"
                        : "غياب غير معتاد"}
                    </b>
                  </div>
                  <span className="flow-sep">➔</span>
                  <div className="flow-step trigger">
                    <span className="f-day">
                      {locale === "fr"
                        ? "Auto ⚡"
                        : locale === "es"
                        ? "Auto ⚡"
                        : "آلياً ⚡"}
                    </span>
                    <b className="f-act">
                      {locale === "fr"
                        ? "Envoi offre"
                        : locale === "es"
                        ? "Envío oferta"
                        : "إرسال عرض"}
                    </b>
                  </div>
                  <span className="flow-sep">➔</span>
                  <div className="flow-step success">
                    <span className="f-day">
                      {locale === "fr"
                        ? "Jour 16"
                        : locale === "es"
                        ? "Día 16"
                        : "اليوم 16"}
                    </span>
                    <b className="f-act">
                      {locale === "fr"
                        ? "Retour client 🎉"
                        : locale === "es"
                        ? "Cliente regresa 🎉"
                        : "عودة الزبون 🎉"}
                    </b>
                  </div>
                </div>

                <div className="eng-notification">
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
                      <b>{t.engines.winbackLockTitle}</b>
                      <small>
                        {locale === "fr"
                          ? "Maintenant"
                          : locale === "es"
                          ? "Ahora"
                          : "الآن"}
                      </small>
                    </div>
                    <div className="nt">{t.engines.winbackLockBody}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engine 4: Broadcast Promos */}
            <div className="surface eng eng-card">
              <div className="et">
                <span className="eng-icon" style={{ background: "#EDE9FE", color: "#6D28D9" }}>
                  <svg className="ic" style={{ color: "#6D28D9" }}>
                    <use href="#i-mega" />
                  </svg>
                </span>
                <div className="eng-head-info">
                  <h3>{t.engines.pushTitle}</h3>
                  <div className="tagline tag-push">
                    <svg className="ic">
                      <use href="#i-bolt" />
                    </svg>
                    <span>{t.engines.pushTag}</span>
                  </div>
                </div>
              </div>
              <p className="eng-desc">{t.engines.pushDesc}</p>

              {/* Open Rate Comparison Bars Showcase */}
              <div className="open-rate-showcase">
                <div className="rates-container">
                  <div className="rate-row">
                    <span className="rate-lbl">Instagram Stories</span>
                    <div className="rate-track">
                      <div className="rate-fill" style={{ width: "8%", background: "#CBD5E1" }} />
                    </div>
                    <b className="rate-val lat">6%</b>
                  </div>
                  <div className="rate-row">
                    <span className="rate-lbl">WhatsApp Messages</span>
                    <div className="rate-track">
                      <div className="rate-fill" style={{ width: "24%", background: "#94A3B8" }} />
                    </div>
                    <b className="rate-val lat">24%</b>
                  </div>
                  <div className="rate-row primary">
                    <span className="rate-lbl">Walink Lockscreen</span>
                    <div className="rate-track">
                      <div className="rate-fill active" style={{ width: "92%" }} />
                    </div>
                    <b className="rate-val lat highlight">92% ⚡</b>
                  </div>
                </div>

                <div className="eng-notification">
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
                      <b>{t.engines.pushLockTitle}</b>
                      <small>
                        {locale === "fr"
                          ? "Maintenant"
                          : locale === "es"
                          ? "Ahora"
                          : "الآن"}
                      </small>
                    </div>
                    <div className="nt">{t.engines.pushLockBody}</div>
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
            <h2 className="h2 silver">{t.compare.title}</h2>
            <p className="lead">{t.compare.subtitle}</p>
          </div>

          <div className="cmp-mobile-hint">
            <svg className="ic">
              <use href="#i-bolt" />
            </svg>
            <span>
              {locale === "fr"
                ? "← Faites défiler horizontalement pour comparer →"
                : locale === "es"
                ? "← Desliza horizontalmente para comparar →"
                : "← اسحب أفقياً لمقارنة الميزات بالكامل →"}
            </span>
          </div>

          <div className="surface cmp-wrap">
            <table className="cmp">
              <thead>
                <tr>
                  <th className="cmp-th-feat">{t.compare.colFeature}</th>
                  <th>{t.compare.colPaper}</th>
                  <th>{t.compare.colApp}</th>
                  <th className="tp cmp-th-walink">
                    <div className="cmp-th-badge">
                      <span className="cmp-star">⭐</span>
                      <span>{t.compare.colWalink}</span>
                    </div>
                    <small className="cmp-th-sub">
                      {locale === "fr"
                        ? "Solution recommandée"
                        : locale === "es"
                        ? "Solución recomendada"
                        : "الحل الموصى به"}
                    </small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cmp-feat-title">{t.compare.row1Feature}</td>
                  <td>
                    <span className="cmp-pill no">{t.compare.row1Paper}</span>
                  </td>
                  <td>
                    <span className="cmp-pill warn">{t.compare.row1App}</span>
                  </td>
                  <td className="tp">
                    <span className="cmp-pill yes">{t.compare.row1Walink}</span>
                  </td>
                </tr>
                <tr>
                  <td className="cmp-feat-title">{t.compare.row2Feature}</td>
                  <td>
                    <span className="cmp-pill no">{t.compare.row2Paper}</span>
                  </td>
                  <td>
                    <span className="cmp-pill warn">{t.compare.row2App}</span>
                  </td>
                  <td className="tp">
                    <span className="cmp-pill yes">{t.compare.row2Walink}</span>
                  </td>
                </tr>
                <tr>
                  <td className="cmp-feat-title">{t.compare.row3Feature}</td>
                  <td>
                    <span className="cmp-pill no">{t.compare.row3Paper}</span>
                  </td>
                  <td>
                    <span className="cmp-pill warn">{t.compare.row3App}</span>
                  </td>
                  <td className="tp">
                    <span className="cmp-pill yes">{t.compare.row3Walink}</span>
                  </td>
                </tr>
                <tr>
                  <td className="cmp-feat-title">{t.compare.row4Feature}</td>
                  <td>
                    <span className="cmp-pill no">{t.compare.row4Paper}</span>
                  </td>
                  <td>
                    <span className="cmp-pill warn">{t.compare.row4App}</span>
                  </td>
                  <td className="tp">
                    <span className="cmp-pill yes">{t.compare.row4Walink}</span>
                  </td>
                </tr>
                <tr>
                  <td className="cmp-feat-title">{t.compare.row5Feature}</td>
                  <td>
                    <span className="cmp-pill warn">{t.compare.row5Paper}</span>
                  </td>
                  <td>
                    <span className="cmp-pill no">{t.compare.row5App}</span>
                  </td>
                  <td className="tp">
                    <span className="cmp-pill yes">{t.compare.row5Walink}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="roi">
            {/* Card 1: Dynamic ROI Calculator & Extra Revenue */}
            <div className="surface roi-card roi-calc-card">
              <div className="roi-head">
                <span className="roi-icon-badge calc-badge">
                  <svg className="ic">
                    <use href="#i-bolt" />
                  </svg>
                </span>
                <div>
                  <h3>{t.compare.roiTitle}</h3>
                  <p className="lead">{t.compare.roiSubtitle}</p>
                </div>
              </div>

              <div className="roi-sliders">
                <div className="roi-slider-group">
                  <label htmlFor="rCount">
                    <span className="r-label">{t.compare.sliderVisitsLabel}</span>
                    <b className="lat r-val-pill" id="vCount">
                      {roiCount} {locale === "fr" ? "clients/jour" : locale === "es" ? "clientes/día" : "زبون/يوم"}
                    </b>
                  </label>
                  <input
                    type="range"
                    id="rCount"
                    min="1"
                    max="50"
                    value={roiCount}
                    onChange={(e) => setRoiCount(Number(e.target.value))}
                  />
                  <div className="r-range-labels">
                    <small>1</small>
                    <small>25</small>
                    <small>50+</small>
                  </div>
                </div>

                <div className="roi-slider-group">
                  <label htmlFor="rSpend">
                    <span className="r-label">{t.compare.sliderTicketLabel}</span>
                    <b className="lat r-val-pill" id="vSpend">
                      {roiSpend} DH
                    </b>
                  </label>
                  <input
                    type="range"
                    id="rSpend"
                    min="10"
                    max="300"
                    step="5"
                    value={roiSpend}
                    onChange={(e) => setRoiSpend(Number(e.target.value))}
                  />
                  <div className="r-range-labels">
                    <small>10 DH</small>
                    <small>150 DH</small>
                    <small>300+ DH</small>
                  </div>
                </div>
              </div>

              {/* Enhanced Profit Card */}
              <div className="roi-profit-card" id="roiOut">
                <div className="profit-primary-row">
                  <div>
                    <span className="profit-title">{t.compare.monthlyExtraRev}</span>
                    <div className="profit-big lat">
                      +{roiMonthlyGain.toLocaleString()} DH
                      <small className="profit-unit">
                        /{locale === "fr" ? "mois" : locale === "es" ? "mes" : "شهرياً"}
                      </small>
                    </div>
                  </div>
                  <div className="profit-annual">
                    <span className="annual-tag">{t.compare.yearlyExtraRev}</span>
                    <b className="lat annual-val">
                      +{(roiMonthlyGain * 12).toLocaleString()} DH
                    </b>
                  </div>
                </div>

                <div className="payback-chip">
                  <span className="payback-icon">⚡</span>
                  <span>
                    <b>{t.compare.paybackTime}</b>{" "}
                    <span className="payback-time-val lat">
                      {roiPaybackMonths}{" "}
                      {locale === "fr"
                        ? "mois seulement !"
                        : locale === "es"
                        ? "meses solamente!"
                        : "أشهر فقط!"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Cost Comparison & Annual Budget Savings */}
            <div className="surface roi-card roi-cost-card">
              <div className="roi-head">
                <span className="roi-icon-badge cost-badge">
                  <svg className="ic">
                    <use href="#i-coins" />
                  </svg>
                </span>
                <div>
                  <h3>{t.compare.costCompareTitle}</h3>
                  <p className="lead">{t.compare.costCompareSubtitle}</p>
                </div>
              </div>

              <div className="bars-showcase">
                <div className="bar-card bad">
                  <div className="bar-top">
                    <span className="bar-name">
                      {t.compare.colApp}{" "}
                      <small>(400 DH/{locale === "fr" ? "mois" : locale === "es" ? "mes" : "شهر"})</small>
                    </span>
                    <b className="bar-amount lat">14,400 DH</b>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bad" style={{ width: "100%" }} />
                  </div>
                  <div className="bar-note">
                    {locale === "fr"
                      ? "Frais de dev initiaux + abonnements mensuels récurrents"
                      : locale === "es"
                      ? "Costes iniciales de app + suscripciones mensuales fijas"
                      : "تكلفة تطوير باهظة في البداية + اشتراك شهري مستمر لا يتوقف"}
                  </div>
                </div>

                <div className="bar-card good">
                  <div className="bar-top">
                    <div className="bar-name">
                      <b>Walink</b>{" "}
                      <span className="plan-badge">Growth Pack</span>
                    </div>
                    <b className="bar-amount lat highlight">2,400 DH</b>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill good" style={{ width: "17%" }} />
                  </div>
                  <div className="bar-note good">
                    {locale === "fr"
                      ? "Paiement unique à vie • Stand connecté inclus • 0 DH/mois"
                      : locale === "es"
                      ? "Pago único para siempre • Soporte inteligente incluido • 0 DH/mes"
                      : "دفعة واحدة فقط لمدى الحياة • الستاند الذكي مشمول • 0 درهم/شهر"}
                  </div>
                </div>
              </div>

              {/* Savings Callout Box */}
              <div className="savings-callout">
                <div className="savings-badge">
                  <span className="savings-sparkle">🎉</span>
                  <b>{t.compare.costSavingsCallout}</b>
                </div>
                <p className="savings-explanation">
                  {locale === "fr"
                    ? "Payez une seule fois 2 400 DH et possédez votre propre système de fidélité à vie sans mensualités qui grugent votre marge."
                    : locale === "es"
                    ? "Paga una sola vez 2.400 DH y obtén tu sistema de fidelización de por vida sin cuotas mensuales que reduzcan tu beneficio."
                    : "ادفع مرة واحدة 2,400 درهم وامتلك منصتك الخاصة لمدى الحياة، بدون اشتراكات أو عمولات تستنزف أرباح متجرك شهرياً."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Infrastructure & Security Grid */}
      <section className="infra-sec" id="infrastructure">
        <div className="wrap">
          <div className="head c">
            <div className="infra-live" style={{ display: "inline-flex", margin: "0 auto 16px" }}>
              <span className="infra-live-dot" />
              <span>LIVE ENTERPRISE NETWORK</span>
            </div>
            <h2 className="h2 silver">{t.enterprise.infraTitle}</h2>
            <p className="lead">{t.enterprise.infraSubtitle}</p>
          </div>

          <div className="infra-grid">
            <div className="infra-card">
              <div className="infra-head">
                <div className="infra-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div className="infra-live">
                  <span className="infra-live-dot" />
                  <span>SLA</span>
                </div>
              </div>
              <div className="infra-metric">99.99%</div>
              <div className="infra-label">{t.enterprise.uptimeTitle}</div>
              <p className="infra-desc">{t.enterprise.uptimeDesc}</p>
            </div>

            <div className="infra-card">
              <div className="infra-head">
                <div className="infra-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="infra-live">
                  <span className="infra-live-dot" />
                  <span>FAST</span>
                </div>
              </div>
              <div className="infra-metric">&lt; 45ms</div>
              <div className="infra-label">{t.enterprise.latencyTitle}</div>
              <p className="infra-desc">{t.enterprise.latencyDesc}</p>
            </div>

            <div className="infra-card">
              <div className="infra-head">
                <div className="infra-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="infra-live">
                  <span className="infra-live-dot" />
                  <span>AES-256</span>
                </div>
              </div>
              <div className="infra-metric">256-Bit</div>
              <div className="infra-label">{t.enterprise.securityTitle}</div>
              <p className="infra-desc">{t.enterprise.securityDesc}</p>
            </div>

            <div className="infra-card">
              <div className="infra-head">
                <div className="infra-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="infra-live">
                  <span className="infra-live-dot" />
                  <span>SCALE</span>
                </div>
              </div>
              <div className="infra-metric">+100K</div>
              <div className="infra-label">{t.enterprise.capacityTitle}</div>
              <p className="infra-desc">{t.enterprise.capacityDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* F. Pricing Section (#pricing) */}
      <section className="sec" id="pricing">
        <div className="wrap">
          <div className="head c">
            <h2 className="h2 silver">{t.pricing.title}</h2>
            <p className="lead">{t.pricing.subtitle}</p>
          </div>

          <div className="rush surface">
            <span className="dot" />
            <p>
              <b>
                {locale === "fr"
                  ? "Offre de lancement :"
                  : locale === "es"
                  ? "Oferta de lanzamiento:"
                  : "عرض الإطلاق الخاص:"}
              </b>{" "}
              {t.finalCta.desc}
            </p>
          </div>

          <div className="plans">
            {/* Starter Plan */}
            <div className="surface plan" data-plan="starter">
              <div className="pn">
                <svg className="ic">
                  <use href="#i-card" />
                </svg>
                <span>{t.pricing.starterTitle}</span>
              </div>
              <div className="was">
                <span className="launch">
                  {locale === "fr" ? "Promo" : locale === "es" ? "Promo" : "عرض"}
                </span>
                <s className="lat">2,200 DH</s>
                <span className="disc">-30%</span>
              </div>
              <div className="pp">
                <b className="lat">1,500</b>
                <span>DH</span>
              </div>
              <div className="per">{t.pricing.starterDesc}</div>
              <ul>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  {t.pricing.featureStand}
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  {t.pricing.featureCards}
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  {t.pricing.featureCredits500}
                </li>
                <li className="off">
                  <svg className="ic">
                    <use href="#i-x" />
                  </svg>
                  {t.pricing.featureRadar}
                </li>
                <li className="off">
                  <svg className="ic">
                    <use href="#i-x" />
                  </svg>
                  {t.pricing.featureReviews}
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
                {t.pricing.orderStarterBtn}
              </button>
            </div>

            {/* Growth Plan (Most Popular) */}
            <div className="surface plan pop" data-plan="growth">
              <div className="ribbon">{t.pricing.popularBadge}</div>
              <div className="pn" style={{ color: "var(--em2)" }}>
                <svg className="ic">
                  <use href="#i-bolt" />
                </svg>
                <span>{t.pricing.growthTitle}</span>
              </div>
              <div className="was">
                <span className="launch">
                  {locale === "fr" ? "Promo" : locale === "es" ? "Promo" : "عرض"}
                </span>
                <s className="lat">3,200 DH</s>
                <span className="disc">-25%</span>
              </div>
              <div className="pp">
                <b className="lat">2,400</b>
                <span>DH</span>
              </div>
              <div className="per">{t.pricing.growthDesc}</div>
              <ul>
                <li className="all">
                  {locale === "fr"
                    ? "Tout le pack Starter, plus :"
                    : locale === "es"
                    ? "Todo el pack Starter, más:"
                    : "كل مميزات Starter، بالإضافة إلى:"}
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>{t.pricing.featureRadar}</b>
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>{t.pricing.featureReviews}</b>
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>{t.engines.winbackTitle}</b>
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>{t.pricing.featureCredits1000}</b>
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
                <span>{t.pricing.orderGrowthBtn}</span>
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
                <span>{t.pricing.multiTitle}</span>
              </div>
              <div className="was">
                <span className="launch">
                  {locale === "fr" ? "Promo" : locale === "es" ? "Promo" : "عرض"}
                </span>
                <s className="lat">5,500 DH</s>
                <span className="disc">-30%</span>
              </div>
              <div className="pp">
                <b className="lat">3,900</b>
                <span>DH</span>
              </div>
              <div className="per">{t.pricing.multiDesc}</div>
              <ul>
                <li className="all">
                  {locale === "fr"
                    ? "Tout le pack Growth, plus :"
                    : locale === "es"
                    ? "Todo el pack Growth, más:"
                    : "كل مميزات Growth، بالإضافة إلى:"}
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>{t.pricing.featureMultiBranches}</b>
                </li>
                <li>
                  <svg className="ic">
                    <use href="#i-check" />
                  </svg>
                  <b>{t.pricing.featureDedicatedSupport}</b>
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
                {t.pricing.orderMultiBtn}
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
                <span>{t.pricing.creditsTitle}</span>
              </h3>
              <p>{t.pricing.creditsDesc}</p>
              <div className="topups">
                <div>
                  <b className="lat">500</b>
                  <small>100 DH</small>
                </div>
                <div>
                  <b className="lat">1,200</b>
                  <small>200 DH</small>
                </div>
                <div>
                  <b className="lat">3,000</b>
                  <small>400 DH</small>
                </div>
              </div>
            </div>

            <div className="surface">
              <h3>
                <svg className="ic">
                  <use href="#i-shield" />
                </svg>
                <span>{t.pricing.careTitle}</span>
              </h3>
              <p>{t.pricing.careDesc}</p>
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
                <h3>{t.payment.termsTitle}</h3>
                <p>{t.payment.termsDesc}</p>
              </div>
            </div>

            <div className="surface payc">
              <div className="pi">
                <svg className="ic" style={{ color: "var(--gold2)" }}>
                  <use href="#i-star" />
                </svg>
              </div>
              <div>
                <h3>{t.payment.guaranteeTitle}</h3>
                <ul className="gl">
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    {t.payment.g1}
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    {t.payment.g2}
                  </li>
                  <li>
                    <svg className="ic">
                      <use href="#i-check" />
                    </svg>
                    {t.payment.g3}
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
            <h2 className="h2 silver">{t.faq.title}</h2>
            <p className="lead">{t.faq.subtitle}</p>
          </div>

          <div className="faq">
            <details className="surface" open>
              <summary>
                <span>{t.faq.q1}</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">{t.faq.a1}</div>
            </details>

            <details className="surface">
              <summary>
                <span>{t.faq.q2}</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">{t.faq.a2}</div>
            </details>

            <details className="surface">
              <summary>
                <span>{t.faq.q3}</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">{t.faq.a3}</div>
            </details>

            <details className="surface">
              <summary>
                <span>{t.faq.q4}</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">{t.faq.a4}</div>
            </details>

            <details className="surface">
              <summary>
                <span>{t.faq.q5}</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">{t.faq.a5}</div>
            </details>

            <details className="surface">
              <summary>
                <span>{t.faq.q6}</span>
                <svg className="ic">
                  <use href="#i-chev" />
                </svg>
              </summary>
              <div className="a">{t.faq.a6}</div>
            </details>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="final">
        <div className="wrap">
          <div className="surface box">
            <h2 className="h2 silver">{t.finalCta.title}</h2>
            <p className="lead" style={{ marginInline: "auto" }}>
              {t.finalCta.desc}
            </p>
            <a href="#pricing" className="btn btn-em">
              <span>{t.finalCta.btn}</span>
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
          <p>
            © {new Date().getFullYear()} Walink (walink.ma) • {t.footer.copyright}
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="https://wa.me/212661848790"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.footer.supportWa}
            </a>
            <span>•</span>
            <Link href="/support">{t.footer.supportLink}</Link>
            <span>•</span>
            <Link href="/privacy">{t.footer.privacyLink}</Link>
            <span>•</span>
            <Link href="/terms">{t.footer.termsLink}</Link>
            <span>•</span>
            <Link href="/admin">{t.footer.adminLink}</Link>
            <span>•</span>
            <Link href="/admin/outreach">{t.footer.outreachLink}</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bar */}
      <div className={`mbar ${showMbar ? "show" : ""}`} id="mbar">
        <p>
          {t.pricing.growthTitle} {t.pricing.popularBadge}
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
          <span>{t.nav.startNow}</span>
          <svg className="ic">
            <use href="#i-bolt" />
          </svg>
        </button>
      </div>

      {/* Checkout Bottom Sheet Modal */}
      <div className={`modal ${isModalOpen ? "open" : ""}`} id="modal">
        <div
          className="scrim"
          id="mScrim"
          role="button"
          tabIndex={0}
          aria-label={
            locale === "fr"
              ? "Fermer"
              : locale === "es"
              ? "Cerrar"
              : "إغلاق النافذة"
          }
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
            aria-label={
              locale === "fr"
                ? "Fermer"
                : locale === "es"
                ? "Cerrar"
                : "إغلاق النافذة"
            }
            onClick={() => setIsModalOpen(false)}
          >
            <svg className="ic">
              <use href="#i-x" />
            </svg>
          </button>

          <h3>
            {t.checkout.title} — {PLANS_DATA[modalPlan]?.title}
          </h3>

          <div className="sel-plan">
            <div>
              <b id="mPlanTitle">{PLANS_DATA[modalPlan]?.title}</b>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {locale === "fr"
                  ? "Changer de pack"
                  : locale === "es"
                  ? "Cambiar de pack"
                  : "تغيير الباقة"}
              </button>
            </div>
            <span className="lat" id="mPlanPrice">
              {PLANS_DATA[modalPlan]?.price} DH
            </span>
          </div>

          <form id="orderForm" onSubmit={handleOrderSubmit}>
            <div>
              <label className="fl" htmlFor="fShop">
                {t.checkout.shopNameLabel}
              </label>
              <input
                className={`inp ${modalErrors.shop ? "bad" : ""}`}
                id="fShop"
                type="text"
                placeholder={t.checkout.shopNamePlaceholder}
                value={modalShop}
                onChange={(e) => setModalShop(e.target.value)}
                maxLength={30}
              />
              <div
                className={`err ${modalErrors.shop ? "show" : ""}`}
                id="eShop"
              >
                {t.checkout.shopNamePlaceholder}
              </div>
            </div>

            <div>
              <div className="fl">{t.checkout.nicheLabel}</div>
              <div className="mchips" id="mNiches">
                {Object.keys(NICHES_META).map((key) => {
                  const info = t.niches[key] || t.niches.cafe;
                  return (
                    <button
                      key={key}
                      className="chip"
                      type="button"
                      aria-checked={modalNiche === key}
                      onClick={() => setModalNiche(key)}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="fl" htmlFor="fCity">
                {t.checkout.cityLabel}
              </label>
              <input
                className={`inp ${modalErrors.city ? "bad" : ""}`}
                id="fCity"
                type="text"
                list="cities"
                placeholder={t.checkout.cityPlaceholder}
                value={modalCity}
                onChange={(e) => setModalCity(e.target.value)}
                maxLength={40}
              />
              <datalist id="cities">
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <div
                className={`err ${modalErrors.city ? "show" : ""}`}
                id="eCity"
              >
                {t.checkout.cityPlaceholder}
              </div>
            </div>

            <div>
              <label className="fl" htmlFor="fPhone">
                {t.checkout.phoneLabel}
              </label>
              <input
                className="inp lat"
                id="fPhone"
                type="tel"
                inputMode="tel"
                pattern="[0-9]*"
                autoComplete="tel"
                placeholder={t.checkout.phonePlaceholder}
                value={modalPhone}
                onChange={(e) => setModalPhone(e.target.value)}
                maxLength={18}
              />
            </div>

            <div className="payline">
              <svg className="ic">
                <use href="#i-shield" />
              </svg>
              <span>{t.payment.termsDesc}</span>
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
                  {isSubmitting ? "..." : t.checkout.confirmSubmitBtn}
                </span>
              </button>
              <p className="fine">{t.checkout.securityNote}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

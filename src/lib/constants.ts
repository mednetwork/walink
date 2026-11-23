export interface NichePreset {
  id: string;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  reward: string;
  prefix: string;
  stamps: number;
  radar: string;
}

export const NICHE_PRESETS: Record<string, NichePreset> = {
  cafe: {
    id: "cafe",
    label: "كافي ومقهى",
    icon: "coffee",
    color: "#5b3519",
    gradient: "linear-gradient(150deg,#6b4226 0%,#3d2414 100%)",
    reward: "قهوة فابور",
    prefix: "آ السي",
    stamps: 5,
    radar: "راك دايز من حدانا! دوز رتاح وقهوتك واجدة ☕️",
  },
  barber: {
    id: "barber",
    label: "صالون حلاقة",
    icon: "scissors",
    color: "#1e3a8a",
    gradient: "linear-gradient(150deg,#1e3a8a 0%,#0f172a 100%)",
    reward: "حسانة فابور",
    prefix: "آ السي",
    stamps: 6,
    radar: "قريب من الصالون؟ واش وقت حسانة جديدة؟ مرحبا بيك 💈",
  },
  snack: {
    id: "snack",
    label: "سناك ومطعم",
    icon: "utensils",
    color: "#b91c1c",
    gradient: "linear-gradient(150deg,#b91c1c 0%,#7f1d1d 100%)",
    reward: "وجبة فابور",
    prefix: "آ السي",
    stamps: 8,
    radar: "فيك الجوع ودايز حدا السناك؟ الطبلة ديالك واجدة 🍔",
  },
  wash: {
    id: "wash",
    label: "لافاچ سيارات",
    icon: "car",
    color: "#0369a1",
    gradient: "linear-gradient(150deg,#0284c7 0%,#0c4a6e 100%)",
    reward: "غسلة فابور",
    prefix: "آ السي",
    stamps: 5,
    radar: "الطوموبيل محتاجة لافاچ؟ دوز راه البوسط خاوي دابا 🚗",
  },
  beauty: {
    id: "beauty",
    label: "صالون تجميل",
    icon: "sparkles",
    color: "#be185d",
    gradient: "linear-gradient(150deg,#db2777 0%,#831843 100%)",
    reward: "جلسة عناية فابور",
    prefix: "آ لالة",
    stamps: 5,
    radar: "مرحبا بيك آ لالة، رتاحي ودلعي راسك اليوم ✨",
  },
  laundry: {
    id: "laundry",
    label: "مصبانة وتصبين",
    icon: "shirt",
    color: "#4338ca",
    gradient: "linear-gradient(150deg,#4f46e5 0%,#312e81 100%)",
    reward: "تصبين بياسات فابور",
    prefix: "آ السي",
    stamps: 7,
    radar: "حوايجك واجدين ونقيين! دوز خودهم مع الطابع ديالك 👔",
  },
  other: {
    id: "other",
    label: "نشاط تجاري آخر",
    icon: "store",
    color: "#047857",
    gradient: "linear-gradient(150deg,#059669 0%,#064e3b 100%)",
    reward: "كادو خاص فابور",
    prefix: "آ السي",
    stamps: 5,
    radar: "راك دايز من حدانا! دوز مرحبا بيك، الكارط ديالك واجدة 🎁",
  },
};

export const PLANS_INFO = {
  STARTER: {
    name: "STARTER",
    label: "انطلاقة",
    price: "1,900 درهم",
    period: "سنوياً",
    credits: 200,
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  GROWTH: {
    name: "GROWTH",
    label: "نمو متقدم",
    price: "2,400 درهم",
    period: "سنوياً",
    credits: 1000,
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  MULTI: {
    name: "MULTI",
    label: "فروع متعددة",
    price: "4,900 درهم",
    period: "سنوياً",
    credits: 3000,
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
};

export const CREDIT_PRICE_MAD = 0.1; // 1 Credit = 0.10 DH (10 Credits = 1 DH)

export const TOPUP_PACKAGES = [
  { credits: 500, price: 50, label: "+500 كريدي", popular: false },
  { credits: 1000, price: 100, label: "+1,000 كريدي", popular: true },
  { credits: 2500, price: 250, label: "+2,500 كريدي", popular: false },
  { credits: 5000, price: 500, label: "+5,000 كريدي", popular: false },
];


"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getStoreUrl } from "@/lib/urls";
import {
  Target,
  Copy,
  Check,
  Send,
  MessageSquare,
  Instagram,
  Sparkles,
  ExternalLink,
  Store,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronDown,
  UserCheck,
  Coffee,
  Scissors,
  Utensils,
  Car,
  Sparkle,
  Shirt,
  ShoppingBag,
} from "lucide-react";
import { formatTimeAgoArabic } from "@/lib/utils";

interface LeadItem {
  id: string;
  shopName: string;
  niche: string;
  city: string;
  phone: string | null;
  plan: string;
  price: string;
  usedDemo: boolean;
  status: string;
  createdAt: string;
}

interface AdminOutreachClientProps {
  initialLeads: LeadItem[];
}

export default function AdminOutreachClient({ initialLeads }: AdminOutreachClientProps) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [origin, setOrigin] = useState<string>("https://walink.ma");

  // Pitch Generator State
  const [shopName, setShopName] = useState<string>("Café Majestic");
  const [niche, setNiche] = useState<string>("cafe");
  const [prospectPhone, setProspectPhone] = useState<string>("0661000000");

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWaScript, setCopiedWaScript] = useState(false);
  const [copiedIgScript, setCopiedIgScript] = useState(false);

  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [conversionMessage, setConversionMessage] = useState<{
    text: string;
    slug?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const niches = [
    { id: "cafe", label: "كافي / مقهى", icon: Coffee },
    { id: "barber", label: "صالون حلاقة", icon: Scissors },
    { id: "snack", label: "مطعم / سناك", icon: Utensils },
    { id: "carwash", label: "لافاچ سيارات", icon: Car },
    { id: "beauty", label: "تجميل / سبا", icon: Sparkle },
    { id: "laundry", label: "مصبانة", icon: Shirt },
    { id: "other", label: "محل تجاري آخر", icon: ShoppingBag },
  ];

  // Generated personalized demo link
  const generatedUrl = `${origin}/?name=${encodeURIComponent(shopName.trim())}&type=${niche}`;

  // Darija Pitch 1: WhatsApp
  const waPitch = `السلام عليكم خويا ${shopName.trim()} 👋
تبارك الله عليكم ومبروك المحل.

صاوبنا ليكم تجربة ديمو خاصة بـ ${shopName.trim()} فـ Apple Wallet و Google Wallet بلا أبليكاسيون:
🔗 ${generatedUrl}

جرّبها فـ التيليفون ديالك فـ 10 ثواني وغادي تفهم كيفاش كترجع الكليان الغابرين برادار 100 ميترو ☕️
إيلا عجباتك، الستاند ديال الكاونتر كيوصلك حتى للمحل فـ 48 ساعة.`;

  // Darija Pitch 2: Instagram DM
  const igPitch = `سلام ${shopName.trim()} ✨
شفنا الباج ديالكم والخدمة نقية بزاف!
صاوبنا ديمو ديال كارط وفاء ذكية باسمكم باش الكليان يديروها فـ آيفون وسامسونغ بلا تطبيق:
📲 ${generatedUrl}

خود فكرة عليها ورد علينا إيلا بغيتو ستاند ديال الكاونتر للمحل 🚀`;

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("تعذر نسخ النص");
    }
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = prospectPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0")
      ? `212${cleanPhone.slice(1)}`
      : cleanPhone;
    const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waPitch)}`;
    window.open(waLink, "_blank");
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error("Error updating lead status:", err);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    setConvertingLeadId(leadId);
    setConversionMessage(null);

    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, action: "CONVERT" }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setConversionMessage({
          text: `تم تحويل الطلب إلى محل مفعّل بنجاح: ${data.merchant.name}`,
          slug: data.merchant.slug,
        });
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: "CONVERTED" } : l))
        );
      } else {
        alert("فشل التحويل: " + (data.error || "خطأ غير معروف"));
      }
    } catch (err) {
      console.error("Error converting lead:", err);
      alert("حدث خطأ أثناء تحويل الطلب إلى محل");
    } finally {
      setConvertingLeadId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-[#161514]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F85B04]/10 border border-[#F85B04]/25 text-[#DA5004] text-xs font-semibold mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>استوديو المبيعات واستقطاب المتاجر (Cold Outreach Studio)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161514] tracking-tight">
            استوديو استقطاب المتاجر وإدارة الطلبات
          </h1>
          <p className="text-sm text-[#161514]/65 mt-1 max-w-2xl leading-relaxed">
            توليد روابط مخصصة بنقرة واحدة لأي متجر في المغرب مع سيناريوهات رسائل واتساب وإنستغرام جاهزة، وإدارة الطلبات الواردة وتحويلها إلى متاجر مفعّلة في المنصة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#EFEAE4] border border-[#161514]/15 text-[#161514] text-xs font-semibold shadow-sm transition"
          >
            العودة للوحة التحكم
          </Link>
        </div>
      </div>

      {/* Conversion Toast Notification */}
      {conversionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{conversionMessage.text}</span>
          </div>
          {conversionMessage.slug && (
            <a
              href={getStoreUrl(conversionMessage.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#F85B04] text-white font-bold text-xs hover:bg-[#E25102] transition flex items-center gap-1 shadow-sm"
            >
              <span>فتح لوحة التاجر الجديدة ↗</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* SECTION 1: Personalized Demo Link & Pitch Generator */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#161514]/10 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F9742A] to-[#F85B04] text-white flex items-center justify-center font-bold shadow-md shadow-[#F85B04]/25">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#161514]">
              مولّد الروابط المخصصة والرسائل الجاهزة (Personalized Pitch Generator)
            </h2>
            <p className="text-xs text-[#161514]/65">
              أدخل اسم المحل المستهدف ونوعه للحصول فوراً على رابط تفاعلي جاهز ورسائل مبيعات بالدارجة المغربية.
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="prospect-shop-name" className="block text-xs font-semibold text-[#161514] mb-1.5">
              اسم المحل المستهدف:
            </label>
            <input
              id="prospect-shop-name"
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="مثال: Café Majestic"
              aria-label="اسم المحل المستهدف"
              className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] placeholder-[#161514]/45 focus:outline-none focus:border-[#F85B04] focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="prospect-niche-select" className="block text-xs font-semibold text-[#161514] mb-1.5">
              نوع النشاط / المجال:
            </label>
            <select
              id="prospect-niche-select"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] focus:outline-none focus:border-[#F85B04]"
            >
              {niches.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="prospect-phone" className="block text-xs font-semibold text-[#161514] mb-1.5">
              رقم الواتساب للمحل (اختياري للإرسال المباشر):
            </label>
            <input
              id="prospect-phone"
              type="tel"
              inputMode="tel"
              pattern="[0-9]*"
              autoComplete="tel"
              value={prospectPhone}
              onChange={(e) => setProspectPhone(e.target.value)}
              placeholder="0661000000"
              aria-label="رقم الواتساب للمحل"
              className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-xs text-[#161514] placeholder-[#161514]/45 focus:outline-none focus:border-[#F85B04] focus:bg-white font-mono"
            />
          </div>
        </div>

        {/* Generated URL Box */}
        <div className="p-3.5 rounded-2xl bg-[#EFEAE4] border border-[#161514]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
            <span className="text-xs font-bold text-[#DA5004] whitespace-nowrap">الرابط المخصص:</span>
            <code className="text-xs text-[#161514] font-mono truncate max-w-full">
              {generatedUrl}
            </code>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => copyToClipboard(generatedUrl, setCopiedLink)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#E5DFD7] border border-[#161514]/15 text-[#161514] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#DA5004]" /> : <Copy className="w-3.5 h-3.5 text-[#161514]/65" />}
              <span>{copiedLink ? "تم النسخ!" : "نسخ الرابط"}</span>
            </button>

            <Link
              href={generatedUrl}
              target="_blank"
              className="px-3 py-1.5 rounded-xl bg-[#F85B04]/10 hover:bg-[#F85B04]/20 text-[#DA5004] border border-[#F85B04]/25 text-xs font-bold flex items-center gap-1 transition"
            >
              <span>تجربة الرابط</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2 Darija Scripts (WhatsApp & Instagram) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* WhatsApp Script Card */}
          <div className="bg-[#EFEAE4] p-4 rounded-2xl border border-[#161514]/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#DA5004]">
                <MessageSquare className="w-4 h-4" />
                <span>رسالة واتساب المقترحة (WhatsApp Pitch):</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(waPitch, setCopiedWaScript)}
                className="text-xs text-[#161514]/65 hover:text-[#161514] flex items-center gap-1"
              >
                {copiedWaScript ? <Check className="w-3.5 h-3.5 text-[#DA5004]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWaScript ? "تم النسخ" : "نسخ الرسالة"}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-white border border-[#161514]/10 text-[11px] text-[#161514] whitespace-pre-wrap font-arabic leading-relaxed shadow-sm">
              {waPitch}
            </pre>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#008069]/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>صيفط فـ واتساب دابا ↗</span>
              </button>
            </div>
          </div>

          {/* Instagram DM Script Card */}
          <div className="bg-[#EFEAE4] p-4 rounded-2xl border border-[#161514]/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-600">
                <Instagram className="w-4 h-4" />
                <span>رسالة إنستغرام المقترحة (Instagram DM Pitch):</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(igPitch, setCopiedIgScript)}
                className="text-xs text-[#161514]/65 hover:text-[#161514] flex items-center gap-1"
              >
                {copiedIgScript ? <Check className="w-3.5 h-3.5 text-pink-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIgScript ? "تم النسخ" : "نسخ الرسالة"}</span>
              </button>
            </div>

            <pre className="p-3 rounded-xl bg-white border border-[#161514]/10 text-[11px] text-[#161514] whitespace-pre-wrap font-arabic leading-relaxed shadow-sm">
              {igPitch}
            </pre>

            <div className="pt-1 text-center">
              <span className="text-[11px] text-[#161514]/65">
                * انسخ الرسالة وأرسلها لحساب المحل على إنستغرام لفتح المحادثة فوراً.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Incoming Orders & Leads Table */}
      <div className="bg-white p-6 rounded-3xl border border-[#161514]/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#DA5004]" />
            <h2 className="text-base font-bold text-[#161514]">الطلبات المسجلة من صفحة الهبوط (Incoming Leads)</h2>
          </div>
          <span className="text-xs text-[#161514]/65">{leads.length} طلبات مسجلة</span>
        </div>

        {leads.length === 0 ? (
          <div className="p-8 text-center text-[#161514]/65 text-xs">
            لا توجد طلبات مسجلة بعد. عند ملء أي تاجر لاستمارة الطلب في صفحة الهبوط ستظهر بياناته هنا فوراً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#161514]/10 text-[#161514]/65 pb-3">
                  <th className="py-2.5 font-semibold">المحل والمدينة</th>
                  <th className="py-2.5 font-semibold">المجال</th>
                  <th className="py-2.5 font-semibold">الباقة المختارة</th>
                  <th className="py-2.5 font-semibold">الهاتف</th>
                  <th className="py-2.5 font-semibold">جرّب الديمو؟</th>
                  <th className="py-2.5 font-semibold">الحالة</th>
                  <th className="py-2.5 font-semibold">الوقت</th>
                  <th className="py-2.5 font-semibold">تحويل إلى محل (1-Click)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9EDEF] text-[#161514]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#EFEAE4] transition">
                    <td className="py-3">
                      <div>
                        <span className="font-bold text-[#161514] block">{lead.shopName}</span>
                        <span className="text-[11px] text-[#161514]/65">{lead.city}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-[#EFEAE4] text-[#161514]/65 border border-[#161514]/10 text-[10px] font-semibold">
                        {lead.niche}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-300 text-[11px]">
                        {lead.plan.toUpperCase()} ({lead.price} DH)
                      </span>
                    </td>
                    <td className="py-3 font-mono">
                      {lead.phone ? (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008069] hover:underline flex items-center gap-1 font-bold"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[#161514]/65">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      {lead.usedDemo ? (
                        <span className="text-[#008069] font-bold">نعم ✓</span>
                      ) : (
                        <span className="text-[#161514]/65/40">لا</span>
                      )}
                    </td>
                    <td className="py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className={`text-[10px] font-bold rounded-lg px-2 py-1 border focus:outline-none ${
                          lead.status === "CONVERTED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : lead.status === "CONTACTED"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="NEW" className="bg-white text-[#161514]">جديد (NEW)</option>
                        <option value="CONTACTED" className="bg-white text-[#161514]">تم التواصل (CONTACTED)</option>
                        <option value="CONVERTED" className="bg-white text-[#161514]">تم التحويل (CONVERTED)</option>
                      </select>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#161514]/65">
                      {formatTimeAgoArabic(lead.createdAt)}
                    </td>
                    <td className="py-3">
                      {lead.status === "CONVERTED" ? (
                        <span className="text-[#DA5004] text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>محل مفعّل</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={convertingLeadId === lead.id}
                          onClick={() => handleConvertLead(lead.id)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F9742A] to-[#F85B04] hover:from-[#F85B04] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{convertingLeadId === lead.id ? "جاري الإنشاء..." : "✨ تحويل إلى محل"}</span>
                        </button>
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


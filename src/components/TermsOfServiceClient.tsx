"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Scale,
  CreditCard,
  Truck,
  Store,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

interface TermsSection {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  bullets?: string[];
}

interface TermsContent {
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: TermsSection[];
}

export default function TermsOfServiceClient() {
  const { locale, isRTL, t } = useI18n();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const contentMap: Record<string, TermsContent> = {
    ar: {
      badge: "الاتفاقية والشروط القانونية",
      title: "شروط الخدمة والاستخدام",
      subtitle:
        "شروط وأحكام استخدام منصة Walink (walink.ma) لبطاقات الولاء الرقمية للمحلات التجارية والمستهلكين في المملكة المغربية.",
      lastUpdated: "آخر تحديث: 20 نوفمبر 2026",
      sections: [
        {
          icon: Store,
          title: "1. التعريف بالمنصة وطبيعة الخدمة",
          text: "منصة Walink (walink.ma) هي منصة مغربية متخصصة في توفير حلول برمجية لإدارة برامج الولاء والمكافآت الرقمية (SaaS) للمحلات والأنشطة التجارية (مطاعم، مقاهي، صالونات، محلات ملابس وغيرها) من خلال بطاقات رقمية متوافقة مع Apple Wallet، Google Wallet، وWebPass، مع توفير ستاندات كاونتر ذكية مجهزة بتقنية QR.",
        },
        {
          icon: Truck,
          title: "2. طلب الباقات وتجهيز ستاند الكاونتر",
          text: "عند قيام التاجر بطلب إحدى باقات Walink:",
          bullets: [
            "تجهيز الهوية البصرية: نقوم بتصميم بطاقة الولاء الرقمية وستاند الكاونتر وفق هوية وشعار المحل وألوانه المعتمدة.",
            "التوصيل: يتم تصنيع وشحن ستاند الكاونتر الأكريليكي الفاخر مجاناً إلى عنوان المحل في أي مدينة بالمغرب خلال 48 إلى 72 ساعة عمل.",
            "شروط الدفع: يتم سداد قيمة الباقة وفق الاتفاق (50% عند اعتماد التصميم و50% عند الاستلام والتأكد من تشغيل النظام).",
          ],
        },
        {
          icon: CreditCard,
          title: "3. برامج الولاء والمكافآت (الأختام والكاشباك)",
          text: "قواعد واضحة تحكم علاقة التاجر مع زبائنه لضمان أقصى درجات الثقة:",
          bullets: [
            "التزام المتجر بتقديم المكافأة: يلتزم المتجر بتقديم المكافأة الموعودة للزبون عند إكمال عدد الأختام المحدد، أو خصم رصيد الكاشباك المكتسب من قيمة الفاتورة.",
            "الأمان ورمز PIN: تُحمى لوحة ماسح التاجر برمز PIN سري خاص بالمحل. يتحمل التاجر وحده سرية هذا الرمز وتفادي مشاركته مع غير العاملين المعتمدين.",
            "منع الاحتيال والتكرار: يحظر التلاعب بالأختام أو تسجيل عمليات وهمية، ويمتلك النظام خوارزمية ذكية لكشف ومكافحة الأنشطة المشبوهة.",
          ],
        },
        {
          icon: Scale,
          title: "4. الملكية الفكرية والعلامات التجارية",
          text: "جميع حقوق الملكية الفكرية الخاصة بمنصة Walink (البرمجيات، الواجهات، التصاميم الهندسية لستاندات الكاونتر، الشعار والعلامة التجارية) هي ملكية حصرية للمنصة. يحتفظ المتجر الشريك بكامل حقوق علامته التجارية وشعاره المستخدمين في بطاقته الرقمية.",
        },
        {
          icon: AlertCircle,
          title: "5. توفر الخدمة والتحديثات التقنية",
          text: "نحرص على ضمان أعلى مستوى من الجاهزية والاستقرار (Uptime 99.9%) لخوادم Walink. نقوم بتحديث النظام دورياً لدعم أحدث إصدارات أنظمة iOS و Android دون التأثير على استمرارية الخدمة.",
        },
        {
          icon: ShieldCheck,
          title: "6. القانون واجب التطبيق وفض النزاعات",
          text: "تخضع هذه الشروط والأحكام وتُفسر وفقاً لقوانين المملكة المغربية. في حال نشوء أي خلاف تجاري، يتم السعي أولاً لتسويته ودياً عبر مركز الدعم، وفي حال تعذر ذلك تختص المحاكم التجارية بالمملكة المغربية بالنظر فيه.",
        },
      ],
    },
    fr: {
      badge: "Conditions Générales d'Utilisation",
      title: "Conditions Générales de Service",
      subtitle:
        "Règles et conditions d'utilisation de la plateforme Walink (walink.ma) pour les commerçants partenaires et les titulaires de cartes de fidélité au Maroc.",
      lastUpdated: "Dernière mise à jour : 20 Novembre 2026",
      sections: [
        {
          icon: Store,
          title: "1. Présentation de la plateforme",
          text: "Walink (walink.ma) est une solution logicielle (SaaS) marocaine permettant aux commerces de proximité de déployer des programmes de fidélité digitaux sur smartphone (Apple Wallet, Google Wallet, WebPass) accompagnés de présentoirs de caisse connectés par QR Code.",
        },
        {
          icon: Truck,
          title: "2. Souscription aux packs et livraison",
          text: "Modalités de commande et de fabrication :",
          bullets: [
            "Personnalisation graphique : design des cartes et du présentoir selon la charte du commerce.",
            "Livraison : fabrication et expédition gratuite du présentoir acrylique dans tout le Maroc sous 48 à 72 heures ouvrées.",
            "Règlement : paiement sécurisé selon les conditions de l'offre choisie (acompte à la validation et solde à la livraison).",
          ],
        },
        {
          icon: CreditCard,
          title: "3. Règles des programmes de fidélité",
          text: "Engagements du commerçant et respect des clients :",
          bullets: [
            "Attribution des récompenses : le commerçant s'engage à délivrer la récompense convenue dès que le client atteint les tampons requis ou utilise son solde cashback.",
            "Code PIN et sécurité : l'accès au scanner de validation est verrouillé par un code PIN confidentiel sous la responsabilité du commerçant.",
            "Anti-fraude : tout usage frauduleux ou falsification de passage entraîne la suspension immédiate du compte.",
          ],
        },
        {
          icon: Scale,
          title: "4. Propriété intellectuelle",
          text: "La plateforme, les algorithmes, les designs de présentoirs et la marque Walink sont la propriété exclusive de Walink. Le commerçant reste l'unique propriétaire de sa marque et de ses visuels.",
        },
        {
          icon: AlertCircle,
          title: "5. Disponibilité de la plateforme",
          text: "Walink garantit un taux de disponibilité élevé (99.9%) et assure la maintenance continue compatible avec les dernières versions d'Apple Wallet et Google Wallet.",
        },
        {
          icon: ShieldCheck,
          title: "6. Droit applicable et juridiction",
          text: "Les présentes conditions sont régies par le droit marocain. Tout litige relatif à leur interprétation ou exécution relève des tribunaux compétents du Royaume du Maroc.",
        },
      ],
    },
    es: {
      badge: "Términos y Condiciones Legales",
      title: "Condiciones de Uso y Servicio",
      subtitle:
        "Términos que rigen el uso de Walink (walink.ma) para comercios afiliados y usuarios en Marruecos.",
      lastUpdated: "Última actualización: 20 de noviembre de 2026",
      sections: [
        {
          icon: Store,
          title: "1. Descripción del servicio",
          text: "Walink es una plataforma SaaS que permite a negocios físicos implementar tarjetas de fidelización digitales en Apple y Google Wallet con soportes QR para mostrador.",
        },
        {
          icon: Truck,
          title: "2. Pedidos y entrega",
          text: "Envío gratuito del soporte de metacrilato en 48-72h a cualquier ciudad de Marruecos tras aprobar el diseño personalizado.",
        },
        {
          icon: CreditCard,
          title: "3. Programa de recompensas",
          text: "El comercio se compromete a honrar las recompensas de sellos y saldo acumuladas legítimamente por los clientes.",
        },
        {
          icon: Scale,
          title: "4. Propiedad intelectual",
          text: "Walink ostenta todos los derechos sobre la plataforma, código y diseño de soportes físicos.",
        },
        {
          icon: AlertCircle,
          title: "5. Disponibilidad",
          text: "Mantenimiento y compatibilidad continua con iOS y Android.",
        },
        {
          icon: ShieldCheck,
          title: "6. Ley aplicable",
          text: "Sujeto a la legislación del Reino de Marruecos.",
        },
      ],
    },
  };

  const content = contentMap[locale] || contentMap.ar;

  return (
    <div className="min-h-screen bg-[#EFEAE4] text-[#161514] flex flex-col font-arabic selection:bg-[#F85B04] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#161514]/10 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group min-h-[44px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt="Walink Logo"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[#161514] flex items-center gap-1.5">
                Walink <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#F85B04]/10 text-[#DA5004] font-mono">TERMS</span>
              </span>
              <span className="text-[10px] text-[#161514]/60 font-medium hidden sm:inline">
                شروط الخدمة والاستخدام
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-[#161514]/70 hover:text-[#DA5004] px-3 py-2 min-h-[44px] rounded-xl hover:bg-[#EFEAE4] transition flex items-center gap-1.5"
            >
              <span>{t.footer.homeLink}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-[#161514]/10" />
            <LanguageSwitcher size="sm" variant="light" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#EFEAE4] pt-10 pb-10 border-b border-[#161514]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="font-script inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F85B04]/10 border border-[#F85B04]/25 text-[#DA5004] text-base font-bold">
            <FileText className="w-4 h-4" />
            <span>{content.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#161514] tracking-tight">
            {content.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#161514]/65 max-w-2xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>

          <div className="pt-1 text-xs text-[#161514]/55 font-mono">
            {content.lastUpdated}
          </div>
        </div>
      </section>

      {/* Body Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-6">
        {content.sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#161514]/10 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F85B04]/10 flex items-center justify-center text-[#DA5004] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#161514]">
                  {sec.title}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#161514]/70 leading-relaxed">
                {sec.text}
              </p>

              {sec.bullets && (
                <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-[#161514]/75">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {/* Contact CTA */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#161514]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-right">
            <h3 className="font-bold text-base text-[#161514]">هل ترغب في طلب باقة لمتجرك أو تحتاج لاستفسار؟</h3>
            <p className="text-xs text-[#161514]/65">تواصل مع فريق خدمة العملاء والدعم الفني في أي وقت.</p>
          </div>
          <Link
            href="/support"
            className="min-h-[44px] py-3 px-6 rounded-2xl bg-[#F85B04] hover:bg-[#E25102] text-white font-bold text-xs flex items-center gap-2 shadow-[0_3px_0_#C14703] transition shrink-0"
          >
            <span>{t.footer.supportLink}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#161514] py-10 text-center text-xs text-white/65 space-y-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Walink (walink.ma) • {t.footer.copyright}</p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-white/70">
            <Link href="/" className="hover:text-[#FA7F3B] transition py-1">
              {t.footer.homeLink}
            </Link>
            <span>•</span>
            <Link href="/support" className="hover:text-[#FA7F3B] transition py-1">
              {t.footer.supportLink}
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#FA7F3B] transition py-1">
              {t.footer.privacyLink}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

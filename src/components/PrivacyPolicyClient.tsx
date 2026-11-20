"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  Smartphone,
  UserCheck,
  FileText,
  Store,
  ArrowLeft,
  ArrowRight,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

interface PrivacySection {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  bullets?: string[];
}

interface PrivacyContent {
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: PrivacySection[];
}

export default function PrivacyPolicyClient() {
  const { locale, isRTL, t } = useI18n();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const contentMap: Record<string, PrivacyContent> = {
    ar: {
      badge: "حماية المعطيات الشخصية",
      title: "سياسة الخصوصية وسرية البيانات",
      subtitle:
        "نحن في Walink (walink.ma) نلتزم التزاماً صارماً بحماية خصوصية وأمان بيانات التجار والمستهلكين بالمملكة المغربية وفقاً للقانون رقم 09-08.",
      lastUpdated: "آخر تحديث: 20 نوفمبر 2026",
      sections: [
        {
          icon: ShieldCheck,
          title: "1. التزامنا بحماية الخصوصية والقانون 09-08",
          text: "تلتزم منصة Walink باحترام خصوصية كافة المستخدمين والزبائن والتجار. تتم معالجة جميع المعطيات ذات الطابع الشخصي وفقاً لأحكام القانون المغربي رقم 09-08 الصادر بتنفيذه الظهير الشريف رقم 1-09-15 والمتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.",
        },
        {
          icon: Database,
          title: "2. المعطيات التي نقوم بجمعها",
          text: "نقوم بجمع الحد الأدنى والضروري فقط من البيانات لتشغيل خدمة بطاقات الولاء الرقمية:",
          bullets: [
            "رقم الهاتف المحمول: لربط بطاقة الولاء بالزبون، حفظ عدد الأختام ورصيد الكاشباك، واسترجاع البطاقة عند تغيير الهاتف.",
            "اسم العميل أو الكود التعريفي (إن وُجد): لتمييز حامل البطاقة وتقديم تجربة مخصصة في المحل.",
            "سجل الزيارات والأختام: عدد الزيارات، تاريخ آخر زيارة، والأختام المكتسبة في المحل.",
            "الموقع الجغرافي التقريبي: يُستخدم فقط على جهاز العميل لتشغيل ميزة إشعارات الرادار (Geofencing) عند الاقتراب من المتجر، ولا يتم تخزين تحركات العميل على خوادمنا نهائياً.",
          ],
        },
        {
          icon: EyeOff,
          title: "3. عدم بيع أو تسريب البيانات لأي طرف ثالث",
          text: "نؤكد بشكل قاطع: لا نقوم ببيع، تأجير، متاجرة، أو إفشاء أرقام هواتف أو بيانات زبائن ومحلات Walink لأي شركة أو طرف ثالث لأغراض إعلانية أو تجارية. البيانات تُستخدم حصرياً داخل نطاق خدمة المتجر الذي اشترك فيه العميل.",
        },
        {
          icon: Smartphone,
          title: "4. التوافق مع Apple Wallet و Google Wallet",
          text: "تتوافق بطاقات Walink الرقمية مع إرشادات الخصوصية والأمان الصارمة لكل من Apple Inc. و Google LLC:",
          bullets: [
            "تشفير شهادات التوقيع الرقمي (PassKit / JWT) لمنع تزوير البطاقات.",
            "إشعارات الدفع (Push Notifications) تتعلق فقط بتحديثات البطاقة (إضافة ختم، كاشباك، أو مكافأة مستحقة).",
            "يحق للمستخدم إزالة البطاقة من محفظته في أي وقت بنقرة واحدة.",
          ],
        },
        {
          icon: Lock,
          title: "5. أمان وحفظ البيانات",
          text: "نعتمد بروتوكولات حماية متطورة تتضمن تشفير البيانات عبر بروتوكول HTTPS/TLS، جدران حماية نشطة، وتخزين قواعد البيانات خلف خوادم مؤمنة لمنع أي وصول غير مصرح به أو تلف أو تسريب.",
        },
        {
          icon: UserCheck,
          title: "6. حقوق المستخدم (الاطلاع، التعديل، والحذف)",
          text: "وفقاً لأحكام القانون 09-08، يحق لكل مستخدم في أي وقت:",
          bullets: [
            "طلب الاطلاع على المعطيات المرتبطة برقم هاتفه ومعرفة رصيده وأختامه.",
            "طلب تعديل أو تصحيح أي بيانات غير دقيقة.",
            "طلب الحذف النهائي لبياناته وحساب ولائه من خوادمنا عبر التواصل معنا.",
          ],
        },
        {
          icon: Mail,
          title: "7. التواصل مع مسؤول حماية المعطيات",
          text: "لممارسة حقوقك أو تقديم أي استفسار يتعلق بسياسة الخصوصية، يرجى مراسلة مسؤول حماية المعطيات عبر البريد الإلكتروني: mednetwork.ma@gmail.com أو عبر الواتساب الرسمي: +212 661 848 790.",
        },
      ],
    },
    fr: {
      badge: "Protection des Données Personnelles",
      title: "Politique de Confidentialité",
      subtitle:
        "Walink (walink.ma) s'engage fermement à protéger la vie privée et la sécurité des données des commerçants et des consommateurs au Maroc, en conformité avec la loi n° 09-08 (CNDP).",
      lastUpdated: "Dernière mise à jour : 20 Novembre 2026",
      sections: [
        {
          icon: ShieldCheck,
          title: "1. Engagement et conformité à la loi 09-08",
          text: "La plateforme Walink respecte la vie privée de l'ensemble de ses utilisateurs. Les traitements de données à caractère personnel sont effectués conformément aux dispositions de la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel.",
        },
        {
          icon: Database,
          title: "2. Données collectées",
          text: "Nous collectons uniquement les informations strictement nécessaires au fonctionnement du programme de fidélité digital :",
          bullets: [
            "Numéro de téléphone mobile : indispensable pour lier la carte de fidélité, comptabiliser les tampons ou le cashback et restaurer la carte en cas de changement de smartphone.",
            "Nom ou prénom du titulaire (optionnel) : pour personnaliser l'accueil en caisse.",
            "Historique des passages : nombre de visites, date du dernier passage et récompenses obtenues.",
            "Position géographique approximative : utilisée localement sur le smartphone pour déclencher les notifications radar (Geofencing) à proximité du commerce. Aucun historique de déplacement n'est enregistré sur nos serveurs.",
          ],
        },
        {
          icon: EyeOff,
          title: "3. Non-vente et confidentialité absolue",
          text: "Nous affirmons expressément : aucune donnée personnelle (numéro de téléphone, coordonnées) n'est vendue, louée ou cédée à des tiers à des fins publicitaires ou de prospection commerciale.",
        },
        {
          icon: Smartphone,
          title: "4. Conformité Apple Wallet & Google Wallet",
          text: "Les cartes de fidélité Walink respectent rigoureusement les normes de sécurité d'Apple Inc. et de Google LLC :",
          bullets: [
            "Cryptographie et signature numérique des passes (PassKit et JWT) contre la contrefaçon.",
            "Notifications push strictement limitées aux événements de fidélité (nouveau tampon, solde mis à jour).",
            "Suppression facile de la carte à tout moment par l'utilisateur depuis son application Wallet.",
          ],
        },
        {
          icon: Lock,
          title: "5. Sécurité et hébergement des données",
          text: "Nous appliquons des mesures de sécurité techniques et organisationnelles élevées : chiffrement SSL/TLS de bout en bout, serveurs sécurisés et accès restreint.",
        },
        {
          icon: UserCheck,
          title: "6. Vos droits (Accès, Rectification, Suppression)",
          text: "Conformément à la loi 09-08, vous disposez d'un droit d'accès, de rectification et d'opposition sur vos données personnelles. Vous pouvez demander à tout moment la suppression totale de vos coordonnées.",
        },
        {
          icon: Mail,
          title: "7. Contact du délégué à la protection des données",
          text: "Pour toute demande relative à vos données, contactez notre équipe par email à mednetwork.ma@gmail.com ou par WhatsApp au +212 661 848 790.",
        },
      ],
    },
    es: {
      badge: "Protección de Datos Personales",
      title: "Política de Privacidad",
      subtitle:
        "En Walink (walink.ma) nos comprometemos a garantizar la confidencialidad y la protección de los datos de comercios y consumidores en Marruecos de acuerdo con la legislación vigente.",
      lastUpdated: "Última actualización: 20 de noviembre de 2026",
      sections: [
        {
          icon: ShieldCheck,
          title: "1. Compromiso y marco legal",
          text: "Walink procesa los datos con estricto apego a las normas de protección de datos personales y las directrices técnicas oficiales de Apple y Google.",
        },
        {
          icon: Database,
          title: "2. Datos recopilados",
          text: "Recopilamos únicamente los datos necesarios para la gestión del pase de fidelización:",
          bullets: [
            "Teléfono móvil: para asociar los sellos o saldo y recuperar la tarjeta ante pérdida del terminal.",
            "Nombre del titular: para identificación en el comercio.",
            "Registro de visitas: historial de sellos y recompensas.",
            "Geolocalización aproximada: gestionada en el dispositivo para notificaciones por proximidad, sin rastreo en servidor.",
          ],
        },
        {
          icon: EyeOff,
          title: "3. Prohibición de venta de datos",
          text: "Bajo ningún concepto vendemos ni cedemos datos a terceros con fines publicitarios ajenos a la relación con el comercio emisor.",
        },
        {
          icon: Smartphone,
          title: "4. Integración segura con Apple y Google Wallet",
          text: "Las tarjetas incorporan firmas criptográficas y respetan las directrices de privacidad de iOS y Android.",
        },
        {
          icon: Lock,
          title: "5. Seguridad",
          text: "Cifrado integral TLS/HTTPS y almacenamiento en infraestructura protegida.",
        },
        {
          icon: UserCheck,
          title: "6. Derechos ARCO",
          text: "Puedes ejercer tus derechos de acceso, rectificación y cancelación en cualquier momento.",
        },
        {
          icon: Mail,
          title: "7. Contacto",
          text: "Para consultas de privacidad: mednetwork.ma@gmail.com o WhatsApp: +212 661 848 790.",
        },
      ],
    },
  };

  const content = contentMap[locale] || contentMap.ar;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#111B21] flex flex-col font-arabic selection:bg-[#008069] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E9EDEF] bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#008069] flex items-center justify-center text-white shadow-md shadow-[#00A884]/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[#111B21] flex items-center gap-1.5">
                Walink <span className="text-xs px-1.5 py-0.2 rounded-md bg-[#00A884]/10 text-[#008069] font-mono">PRIVACY</span>
              </span>
              <span className="text-[10px] text-[#54656F] font-medium hidden sm:inline">
                حماية المعطيات الشخصية
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-[#54656F] hover:text-[#008069] px-3 py-1.5 rounded-xl hover:bg-[#F0F2F5] transition flex items-center gap-1.5"
            >
              <span>{t.footer.homeLink}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-[#E9EDEF]" />
            <LanguageSwitcher size="sm" variant="light" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#F0F2F5] pt-10 pb-10 border-b border-[#E9EDEF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00A884]/10 border border-[#00A884]/20 text-[#008069] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{content.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111B21] tracking-tight">
            {content.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#54656F] max-w-2xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>

          <div className="pt-1 text-xs text-[#54656F] font-mono">
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
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9EDEF] shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00A884]/10 flex items-center justify-center text-[#008069] shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#111B21]">
                  {sec.title}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#54656F] leading-relaxed">
                {sec.text}
              </p>

              {sec.bullets && (
                <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-[#54656F]">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#00A884] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {/* Support CTA box */}
        <div className="bg-gradient-to-r from-[#00A884] to-[#008069] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-right">
            <h3 className="font-bold text-base sm:text-lg">هل لديك أي سؤال حول بياناتك؟</h3>
            <p className="text-xs text-white/80">فريق الدعم الفني جاهز للرد على جميع استفساراتك فوراً.</p>
          </div>
          <Link
            href="/support"
            className="py-3 px-6 rounded-xl bg-white text-[#008069] hover:bg-[#F0F2F5] font-bold text-xs flex items-center gap-2 shadow-md transition shrink-0"
          >
            <span>{t.footer.supportLink}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E9EDEF] bg-white py-10 text-center text-xs text-[#54656F] space-y-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Walink (walink.ma) • {t.footer.copyright}</p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[#54656F]">
            <Link href="/" className="hover:text-[#008069] transition">
              {t.footer.homeLink}
            </Link>
            <span>•</span>
            <Link href="/support" className="hover:text-[#008069] transition">
              {t.footer.supportLink}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#008069] transition">
              {t.footer.termsLink}
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-[#008069] transition">
              {t.footer.adminLink}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

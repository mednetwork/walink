"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  Send,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Store,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

export default function CustomerSupportClient() {
  const { locale, isRTL, t } = useI18n();

  // Contact form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [inquiryType, setInquiryType] = useState("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const content = {
    ar: {
      badge: "مركز الدعم والمساعدة المباشرة",
      title: "كيف يمكننا مساعدتك اليوم؟",
      subtitle:
        "فريق Walink رهن إشارتكم لمواكبة المحلات التجارية، تفعيل البطاقات الرقمية، وتوفير الدعم الفني للزبائن في جميع مدن المغرب.",
      channelsTitle: "قنوات التواصل السريعة",
      waCardTitle: "محادثة فورية عبر الواتساب",
      waCardDesc: "تواصل مع مستشارك المخصص للإجابة الفورية، تفعيل الحسابات وتأكيد الطلبات.",
      waCardBtn: "محادثة واتساب سريعة (+212 661 848 790)",
      emailCardTitle: "البريد الإلكتروني الرسمي",
      emailCardDesc: "للاستفسارات الرسمية، الشركات، الشراكات المؤسساتية وطلبات الدعم التقني.",
      emailCardBtn: "mednetwork.ma@gmail.com",
      phoneCardTitle: "المكالمات وأوقات العمل",
      phoneCardDesc: "فريق الدعم متاح هاتفياً للإجابة على استفسارات التجار والمستهلكين.",
      phoneCardHours: "الإثنين - السبت: 09:00 ص - 07:00 م (توقيت المغرب)",
      formTitle: "إرسال استفسار مباشر",
      formSubtitle: "املأ البيانات وسيتم توجيهك فوراً لبدء المحادثة مع فريق الدعم المتخصص:",
      nameLabel: "الاسم الكامل *",
      phoneLabel: "رقم الهاتف / الواتساب *",
      shopLabel: "اسم المحل أو العلامة التجارية (اختياري)",
      typeLabel: "نوع الاستفسار *",
      types: [
        { id: "order", label: "طلب باقة Walink جديدة لمتجري" },
        { id: "tech", label: "مساعدة تقنية في بطاقة أو لوحة التحكم" },
        { id: "customer", label: "استفسار زبون حول أختام أو رصيد كاشباك" },
        { id: "partnership", label: "شراكة تجارية أو استفسار عام" },
      ],
      msgLabel: "تفاصيل الرسالة *",
      msgPlaceholder: "اكتب استفسارك بالتفصيل وسنوافيك بالرد فوراً...",
      submitBtn: "إرسال عبر الواتساب المباشر 💬",
      faqTitle: "الأسئلة الشائعة (FAQ)",
      faqSubtitle: "إجابات واضحة ومباشرة لأكثر الأسئلة تداولاً بين التجار والزبائن",
      faqs: [
        {
          q: "كيف يستفيد المحل التجاري من منصة Walink؟",
          a: "توفر Walink بطاقات ولاء ذكية تُحفظ في هواتف الزبائن (Apple Wallet, Google Wallet, وWebPass)، مما يتيح للتاجر إعادة الزبائن لمزيد من الزيارات، إرسال تنبيهات الرادار الجغرافي عند اقترابهم من المحل، وجمع تقييمات 5 نجوم في خرائط Google.",
        },
        {
          q: "هل يحتاج زبائني إلى تحميل تطبيق خاص لحفظ البطاقة؟",
          a: "لا! هذا هو سر نجاح Walink؛ البطاقة تُحفظ بنقرة واحدة داخل تطبيق المحفظة الموجود مسبقاً في هواتفهم (Apple Wallet على أجهزة آيفون أو Google Wallet على أجهزة أندرويد)، أو كبطاقة ويب ذكية على الشاشة الرئيسية بدون أي تعقيد.",
        },
        {
          q: "كيف يتم إيصال ستاند الكاونتر الأكريليكي للمحل؟",
          a: "نقوم بتصميم الستاند الأكريليكي الخاص بمتجرك مع كود الـ QR وشعارك وألوانك، ثم شحنه مجاناً وتوصيله مباشرة إلى باب محلك في أي مدينة بالمغرب خلال 48 إلى 72 ساعة عمل.",
        },
        {
          q: "ماذا يفعل الزبون إذا غيّر هاتفه أو ضاعت بطاقته؟",
          a: "لا تضيع الأختام ولا الرصيد أبداً! تكفي إعادة كتابة رقم الهاتف المسجل في صفحة المتجر ليستعيد الزبون بطاقته وأختامه ورصيده فوراً وبكل أمان.",
        },
        {
          q: "كيف يتأكد التاجر من صحة العمليات وتفادي التكرار؟",
          a: "تمتلك لوحة التاجر ماسحاً ضوئياً ذكياً مع رمز PIN سري للمحل وحماية ضد تكرار المسح لنفس الزبون في نفس الزيارة.",
        },
      ],
      guarantee: "دعم فني محلي مغربي 100% متاح لمرافقتكم خطوة بخطوة 🇲🇦",
    },
    fr: {
      badge: "Centre d'Assistance & Support Client",
      title: "Comment pouvons-nous vous aider aujourd'hui ?",
      subtitle:
        "L'équipe Walink est à votre entière disposition pour accompagner votre commerce, activer vos cartes digitales et assister vos clients partout au Maroc.",
      channelsTitle: "Nos canaux de contact directs",
      waCardTitle: "Assistance directe WhatsApp",
      waCardDesc: "Échangez avec votre conseiller dédié pour toute question, activation ou commande.",
      waCardBtn: "Discussion WhatsApp (+212 661 848 790)",
      emailCardTitle: "Email officiel",
      emailCardDesc: "Pour les demandes officielles, facturation, partenariats et support technique.",
      emailCardBtn: "mednetwork.ma@gmail.com",
      phoneCardTitle: "Appels & Horaires d'ouverture",
      phoneCardDesc: "Notre équipe est joignable pour répondre aux commerçants et aux utilisateurs.",
      phoneCardHours: "Lundi - Samedi : 09h00 - 19h00 (Heure du Maroc)",
      formTitle: "Envoyer un message direct",
      formSubtitle: "Renseignez vos coordonnées pour démarrer directement l'échange avec un expert :",
      nameLabel: "Nom complet *",
      phoneLabel: "Numéro de téléphone / WhatsApp *",
      shopLabel: "Nom de votre établissement (optionnel)",
      typeLabel: "Motif de la demande *",
      types: [
        { id: "order", label: "Commander un pack Walink pour mon commerce" },
        { id: "tech", label: "Assistance technique ou question sur le tableau de bord" },
        { id: "customer", label: "Question client concernant des tampons ou du cashback" },
        { id: "partnership", label: "Partenariat commercial ou demande générale" },
      ],
      msgLabel: "Détails du message *",
      msgPlaceholder: "Expliquez votre demande et nous vous répondrons immédiatement...",
      submitBtn: "Envoyer via WhatsApp 💬",
      faqTitle: "Foire Aux Questions (FAQ)",
      faqSubtitle: "Réponses claires et directes aux questions fréquentes des commerçants et clients",
      faqs: [
        {
          q: "Comment Walink booste la fréquentation de mon commerce ?",
          a: "Walink installe votre carte de fidélité directement dans le smartphone de vos clients (Apple Wallet, Google Wallet et WebPass). Vous fidélisez vos clients, déclenchez des rappels radar quand ils passent à proximité et récoltez des avis 5 étoiles sur Google Maps.",
        },
        {
          q: "Mes clients doivent-ils télécharger une application ?",
          a: "Non ! C'est la force de Walink. La carte s'ajoute en 1 clic dans l'application Wallet déjà présente sur iPhone ou Android, sans création de compte complexe.",
        },
        {
          q: "Comment est livré le présentoir de caisse en acrylique ?",
          a: "Nous personnalisons votre présentoir avec votre logo, vos couleurs et votre QR code sécurisé, puis nous le livrons gratuitement partout au Maroc sous 48 à 72 heures ouvrées.",
        },
        {
          q: "Que se passe-t-il si un client change de smartphone ?",
          a: "Aucun tampon ni solde n'est perdu ! Il suffit de renseigner son numéro de téléphone sur la page du commerce pour réinstaller sa carte instantanément.",
        },
        {
          q: "Comment le commerçant valide les tampons en caisse ?",
          a: "Le commerçant utilise son propre smartphone avec le scanner sécurisé protégé par un code PIN vendeur et une protection anti-fraude.",
        },
      ],
      guarantee: "Support 100% marocain à vos côtés à chaque étape 🇲🇦",
    },
    es: {
      badge: "Centro de Soporte y Atención al Cliente",
      title: "¿Cómo podemos ayudarte hoy?",
      subtitle:
        "El equipo de Walink está a tu entera disposición para acompañar a tu negocio, activar tus tarjetas digitales y atender a tus clientes en todo Marruecos.",
      channelsTitle: "Canales de contacto directo",
      waCardTitle: "Atención inmediata por WhatsApp",
      waCardDesc: "Habla con tu asesor asignado para cualquier duda, activación de tarjetas o pedidos.",
      waCardBtn: "Chat WhatsApp (+212 661 848 790)",
      emailCardTitle: "Correo electrónico oficial",
      emailCardDesc: "Para consultas corporativas, facturación, acuerdos y soporte técnico.",
      emailCardBtn: "mednetwork.ma@gmail.com",
      phoneCardTitle: "Llamadas y horarios",
      phoneCardDesc: "Nuestro equipo está disponible por teléfono para comerciantes y usuarios.",
      phoneCardHours: "Lunes - Sábado: 09:00 - 19:00 (Hora de Marruecos)",
      formTitle: "Enviar un mensaje directo",
      formSubtitle: "Rellena los datos para iniciar conversación de inmediato con nuestro equipo:",
      nameLabel: "Nombre completo *",
      phoneLabel: "Teléfono / WhatsApp *",
      shopLabel: "Nombre del negocio (opcional)",
      typeLabel: "Tipo de consulta *",
      types: [
        { id: "order", label: "Pedir un pack Walink para mi negocio" },
        { id: "tech", label: "Soporte técnico o duda sobre el panel de control" },
        { id: "customer", label: "Pregunta sobre sellos o saldo de fidelidad" },
        { id: "partnership", label: "Alianzas comerciales o consulta general" },
      ],
      msgLabel: "Detalles del mensaje *",
      msgPlaceholder: "Cuéntanos tu duda o proyecto y te responderemos al instante...",
      submitBtn: "Enviar por WhatsApp 💬",
      faqTitle: "Preguntas Frecuentes (FAQ)",
      faqSubtitle: "Respuestas claras para comerciantes y titulares de tarjetas",
      faqs: [
        {
          q: "¿Cómo beneficia Walink a mi comercio?",
          a: "Walink digitaliza tu programa de fidelización instalando la tarjeta en Apple Wallet y Google Wallet de tus clientes, aumentando sus visitas recurrentes y tus reseñas en Google Maps.",
        },
        {
          q: "¿Los clientes necesitan descargar una app externa?",
          a: "¡No! Se añade con 1 clic en la app Wallet nativa de su teléfono, sin fricciones ni registros engorrosos.",
        },
        {
          q: "¿Cómo se entrega el soporte de metacrilato para el mostrador?",
          a: "Diseñamos el soporte con tu identidad y código QR exclusivo y te lo enviamos gratis a cualquier punto de Marruecos en 48-72h.",
        },
        {
          q: "¿Qué ocurre si un cliente cambia de teléfono?",
          a: "No pierde ningún sello ni saldo. Al introducir su teléfono en la web del comercio recupera su tarjeta al momento.",
        },
        {
          q: "¿Cómo valida el comercio las visitas?",
          a: "Desde el teléfono del comercio mediante el escáner web rápido, protegido por PIN de seguridad y control anti-duplicados.",
        },
      ],
      guarantee: "Soporte técnico cercano y 100% marroquí 🇲🇦",
    },
  }[locale] || {
    badge: "مركز الدعم والمساعدة المباشرة",
    title: "كيف يمكننا مساعدتك اليوم؟",
    subtitle: "",
    channelsTitle: "",
    waCardTitle: "",
    waCardDesc: "",
    waCardBtn: "",
    emailCardTitle: "",
    emailCardDesc: "",
    emailCardBtn: "",
    phoneCardTitle: "",
    phoneCardDesc: "",
    phoneCardHours: "",
    formTitle: "",
    formSubtitle: "",
    nameLabel: "",
    phoneLabel: "",
    shopLabel: "",
    typeLabel: "",
    types: [],
    msgLabel: "",
    msgPlaceholder: "",
    submitBtn: "",
    faqTitle: "",
    faqSubtitle: "",
    faqs: [],
    guarantee: "",
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      alert(locale === "fr" ? "Veuillez remplir les champs obligatoires." : "يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setIsSubmitting(true);
    const selectedTypeObj = content.types.find((item) => item.id === inquiryType);
    const typeText = selectedTypeObj ? selectedTypeObj.label : inquiryType;

    const waText = `مرحباً فريق دعم Walink 👋
أرغب في إرسال استفسار عبر مركز الدعم:

👤 الاسم: ${name.trim()}
📞 الهاتف: ${phone.trim()}
${shopName.trim() ? `🏢 المحل: ${shopName.trim()}\n` : ""}📌 نوع الطلب: ${typeText}
💬 نص الرسالة:
${message.trim()}

شكراً جزيلاً!`;

    const waUrl = `https://wa.me/212661848790?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, "_blank");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#EFEAE4] text-[#161514] flex flex-col font-arabic selection:bg-[#F85B04] selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#161514]/10 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group min-h-[44px]">
              <div className="w-9 h-9 rounded-2xl bg-[#F85B04] flex items-center justify-center text-white shadow-[0_3px_0_#C14703] group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[#161514] flex items-center gap-1.5">
                  Walink <span className="text-xs px-1.5 py-0.5 rounded-md bg-[#F85B04]/10 text-[#DA5004] font-mono">SUPPORT</span>
                </span>
                <span className="text-[10px] text-[#161514]/60 font-medium hidden sm:inline">
                  مركز خدمة العملاء والمساعدة
                </span>
              </div>
            </Link>
          </div>

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-[#EFEAE4] pt-10 pb-12 border-b border-[#161514]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="font-script inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F85B04]/10 border border-[#F85B04]/25 text-[#DA5004] text-base font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{content.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#161514] tracking-tight">
            {content.title}
          </h1>

          <p className="text-xs sm:text-base text-[#161514]/65 max-w-2xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>

          <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{content.guarantee}</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12">
        {/* Contact Channel Cards */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-[#161514] flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#F85B04]" />
            <span>{content.channelsTitle}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WhatsApp Card (Semantic Official WhatsApp Emerald Preserved) */}
            <div className="bg-white rounded-2xl p-6 border border-[#161514]/10 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#00A884]/10 flex items-center justify-center text-[#008069]">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#161514]">{content.waCardTitle}</h3>
                <p className="text-xs text-[#161514]/65 leading-relaxed">{content.waCardDesc}</p>
              </div>
              <a
                href="https://wa.me/212661848790"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] hover:to-[#00A884] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#00A884]/20 transition"
              >
                <span>{content.waCardBtn}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#161514]/10 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#F85B04]/10 flex items-center justify-center text-[#DA5004]">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#161514]">{content.emailCardTitle}</h3>
                <p className="text-xs text-[#161514]/65 leading-relaxed">{content.emailCardDesc}</p>
              </div>
              <a
                href="mailto:mednetwork.ma@gmail.com"
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-white border border-[#161514]/15 hover:bg-[#EFEAE4] text-[#161514] font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>{content.emailCardBtn}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#161514]/60" />
              </a>
            </div>

            {/* Phone & Hours Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#161514]/10 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#161514]">{content.phoneCardTitle}</h3>
                <p className="text-xs text-[#161514]/65 leading-relaxed">{content.phoneCardDesc}</p>
                <div className="pt-1 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{content.phoneCardHours}</span>
                </div>
              </div>
              <a
                href="tel:+212661848790"
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#161514] hover:bg-[#2A2826] text-white font-bold text-xs flex items-center justify-center gap-2 transition font-mono tabular-nums"
              >
                <span>+212 661 848 790</span>
              </a>
            </div>
          </div>
        </section>

        {/* Contact Form & Help Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#161514]/10 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-[#161514]">{content.formTitle}</h2>
              <p className="text-xs text-[#161514]/65">{content.formSubtitle}</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sup-name" className="block text-xs font-bold text-[#161514] mb-1.5">
                    {content.nameLabel}
                  </label>
                  <input
                    id="sup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: يوسف الإدريسي"
                    className="w-full min-h-[44px] bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-base text-[#161514] focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label htmlFor="sup-phone" className="block text-xs font-bold text-[#161514] mb-1.5">
                    {content.phoneLabel}
                  </label>
                  <input
                    id="sup-phone"
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9]*"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0661234567"
                    className="w-full min-h-[44px] bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-base text-[#161514] focus:outline-none focus:border-[#F85B04] focus:bg-white transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sup-shop" className="block text-xs font-bold text-[#161514] mb-1.5">
                  {content.shopLabel}
                </label>
                <input
                  id="sup-shop"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="مثال: Café Atlas / صالون أنس"
                  className="w-full min-h-[44px] bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-base text-[#161514] focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                />
              </div>

              <div>
                <label htmlFor="sup-type" className="block text-xs font-bold text-[#161514] mb-1.5">
                  {content.typeLabel}
                </label>
                <select
                  id="sup-type"
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full min-h-[44px] bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-base text-[#161514] focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                >
                  {content.types.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sup-msg" className="block text-xs font-bold text-[#161514] mb-1.5">
                  {content.msgLabel}
                </label>
                <textarea
                  id="sup-msg"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={content.msgPlaceholder}
                  className="w-full bg-[#EFEAE4] border border-[#161514]/15 rounded-xl px-3.5 py-2.5 text-base text-[#161514] focus:outline-none focus:border-[#F85B04] focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3.5 rounded-2xl bg-[#F85B04] hover:bg-[#E25102] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#C14703] transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{content.submitBtn}</span>
              </button>
            </form>
          </div>

          {/* Quick Info & Enterprise Trust */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#161514] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F85B04]/20 border border-[#F85B04]/30 flex items-center justify-center text-[#FA7F3B]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">بطاقات الولاء المعتمدة</h3>
                  <p className="text-xs text-white/60">Apple Wallet & Google Wallet</p>
                </div>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                بطاقات Walink متوافقة بالكامل مع بروتوكولات Apple PassKit و Google Wallet REST API ومعتمدة للعمل في الهواتف الذكية مع إشعارات الرادار الجغرافي (Geofencing) واستعادة الزبائن.
              </p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-white/70">
                  <span>وقت الرد المعتاد عبر الواتساب:</span>
                  <span className="font-bold text-emerald-400 font-mono tabular-nums">&lt; 5 دقائق</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>مدة تجهيز وتسليم الستاند:</span>
                  <span className="font-bold text-[#FA7F3B] font-mono tabular-nums">48 - 72 ساعة</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>التغطية الجغرافية:</span>
                  <span className="font-bold text-[#FA7F3B]">جميع مدن المغرب 🇲🇦</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3 text-xs text-white/55">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>معالجة البيانات محمية ومطابقة لمعايير CNDP المغربية.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#161514]/10 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="font-script inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F85B04]/10 text-[#DA5004] text-base font-bold">
              <HelpCircle className="w-4 h-4" />
              <span>{content.faqTitle}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#161514]">{content.faqSubtitle}</h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-[#161514]/10">
            {content.faqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full min-h-[44px] flex items-center justify-between text-right gap-4 font-bold text-sm sm:text-base text-[#161514] hover:text-[#DA5004] transition py-1"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#161514]/55 shrink-0 transition-transform ${
                      openFaq === idx ? "rotate-180 text-[#F85B04]" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="mt-2.5 text-xs sm:text-sm text-[#161514]/70 leading-relaxed pr-2 pl-6 animate-in fade-in duration-200">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
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
            <Link href="/privacy" className="hover:text-[#FA7F3B] transition py-1">
              {t.footer.privacyLink}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#FA7F3B] transition py-1">
              {t.footer.termsLink}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export type Locale = "ar" | "fr" | "es";

export interface TranslationDictionary {
  brand: {
    name: string;
    arabicName: string;
    tagline: string;
  };
  nav: {
    demo: string;
    howItWorks: string;
    pricing: string;
    faq: string;
    startNow: string;
    admin: string;
    outreach: string;
  };
  hero: {
    badge: string;
    title1: string;
    title2: string;
    desc: string;
    ctaPrimary: string;
    ctaSecondary: string;
    standBadge: string;
    standDesc: string;
    notification1: string;
    notification2: string;
    notification3: string;
  };
  demo: {
    title: string;
    subtitle: string;
    cardTypeLabel: string;
    stampsType: string;
    cashbackType: string;
    phoneTab: string;
    merchantTab: string;
    stampAction: string;
    cashbackAction: string;
    radarSimulate: string;
    winbackSimulate: string;
    promoSimulate: string;
    reviewSimulate: string;
    resetDemo: string;
    ownerHome: string;
    ownerClients: string;
    ownerPromos: string;
    ownerAuto: string;
    kpiTotalVisits: string;
    kpiReturning: string;
    kpiCashbackGiven: string;
    kpiGoogleReviews: string;
    sendPromoTitle: string;
    sendPromoDesc: string;
    targetAudience: string;
    audienceAll: string;
    audienceQuiet: string;
    audienceNear: string;
    audienceVip: string;
    creditsCost: string;
    creditsBalance: string;
    sendBroadcastBtn: string;
    simulatingSuccess: string;
  };
  engines: {
    radarTitle: string;
    radarTag: string;
    radarDesc: string;
    radarLockTitle: string;
    radarLockBody: string;
    reviewsTitle: string;
    reviewsTag: string;
    reviewsDesc: string;
    reviewsLockTitle: string;
    reviewsLockBody: string;
    winbackTitle: string;
    winbackTag: string;
    winbackDesc: string;
    winbackLockTitle: string;
    winbackLockBody: string;
    pushTitle: string;
    pushTag: string;
    pushDesc: string;
    pushLockTitle: string;
    pushLockBody: string;
  };
  compare: {
    title: string;
    subtitle: string;
    colFeature: string;
    colWalink: string;
    colPaper: string;
    colApp: string;
    row1Feature: string;
    row1Walink: string;
    row1Paper: string;
    row1App: string;
    row2Feature: string;
    row2Walink: string;
    row2Paper: string;
    row2App: string;
    row3Feature: string;
    row3Walink: string;
    row3Paper: string;
    row3App: string;
    row4Feature: string;
    row4Walink: string;
    row4Paper: string;
    row4App: string;
    row5Feature: string;
    row5Walink: string;
    row5Paper: string;
    row5App: string;
    roiTitle: string;
    roiSubtitle: string;
    sliderVisitsLabel: string;
    sliderTicketLabel: string;
    monthlyExtraRev: string;
    yearlyExtraRev: string;
    paybackTime: string;
    paybackValue: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    popularBadge: string;
    starterTitle: string;
    starterPrice: string;
    starterDesc: string;
    growthTitle: string;
    growthPrice: string;
    growthDesc: string;
    multiTitle: string;
    multiPrice: string;
    multiDesc: string;
    orderStarterBtn: string;
    orderGrowthBtn: string;
    orderMultiBtn: string;
    creditsTitle: string;
    creditsDesc: string;
    careTitle: string;
    careDesc: string;
    featureStand: string;
    featureCards: string;
    featureRadar: string;
    featureReviews: string;
    featureCredits500: string;
    featureCredits1000: string;
    featureMultiBranches: string;
    featureDedicatedSupport: string;
  };
  payment: {
    termsTitle: string;
    termsDesc: string;
    guaranteeTitle: string;
    g1: string;
    g2: string;
    g3: string;
  };
  faq: {
    title: string;
    subtitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
    q6: string;
    a6: string;
  };
  finalCta: {
    title: string;
    desc: string;
    btn: string;
  };
  footer: {
    copyright: string;
    supportWa: string;
    adminLink: string;
    outreachLink: string;
  };
  checkout: {
    title: string;
    subtitle: string;
    shopNameLabel: string;
    shopNamePlaceholder: string;
    nicheLabel: string;
    cityLabel: string;
    cityPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    planLabel: string;
    summaryTitle: string;
    confirmSubmitBtn: string;
    securityNote: string;
  };
  pass: {
    stampsLabel: string;
    rewardLabel: string;
    cashbackRateLabel: string;
    balanceAvailable: string;
    onEveryPurchase: string;
    memberCodeLabel: string;
    lastVisitLabel: string;
    standScanCaption: string;
    addToAppleWallet: string;
    addToGoogleWallet: string;
    cashbackBanner: string;
    stampsProgress: string;
    stampAddedTitle: string;
    stampAddedBody: string;
    rewardUnlockedTitle: string;
    rewardUnlockedBody: string;
    cashbackEarnedTitle: string;
    cashbackEarnedBody: string;
    cashbackRedeemedTitle: string;
    cashbackRedeemedBody: string;
    radarAlertTitle: string;
    radarAlertBody: string;
    reviewAlertTitle: string;
    reviewAlertBody: string;
    activityDrawerTitle: string;
    totalVisits: string;
    totalEarned: string;
  };
  onboarding: {
    welcomeGiftStamps: string;
    welcomeGiftCashback: string;
    chooseProgram: string;
    stampsProgramTitle: string;
    stampsProgramDesc: string;
    cashbackProgramTitle: string;
    cashbackProgramDesc: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    birthdayLabel: string;
    submitBtn: string;
    alreadyMember: string;
    existingCustomerNotice: string;
    goToPass: string;
  };
  merchant: {
    pinTitle: string;
    pinPrompt: string;
    pinLoginBtn: string;
    pinError: string;
    badgeStamps: string;
    badgeCashback: string;
    scannerBtn: string;
    manualLookup: string;
    searchPlaceholder: string;
    addStampBtn: string;
    redeemRewardBtn: string;
    earnCashbackTab: string;
    redeemCashbackTab: string;
    billAmountLabel: string;
    calculatePreview: string;
    confirmEarnBtn: string;
    redeemAmountLabel: string;
    redeemFullBtn: string;
    remainingToPay: string;
    confirmRedeemBtn: string;
    switchProgramBtn: string;
    switchConfirm: string;
    currentBalance: string;
    lifetimeVisits: string;
    crmTitle: string;
    statusActive: string;
    statusQuiet: string;
    statusVip: string;
  };
  admin: {
    title: string;
    subtitle: string;
    newMerchantBtn: string;
    automationsLink: string;
    outreachLink: string;
    loyaltyModeLabel: string;
    modeBoth: string;
    modeStamps: string;
    modeCashback: string;
    cashbackRateLabel: string;
    welcomeCashbackLabel: string;
    minRedeemLabel: string;
    currencyLabel: string;
    previewStamps: string;
    previewCashback: string;
  };
  niches: Record<
    string,
    {
      name: string;
      label: string;
      reward: string;
      prefix: string;
      defaultShop: string;
    }
  >;
}

export const translations: Record<Locale, TranslationDictionary> = {
  ar: {
    brand: {
      name: "walink.ma",
      arabicName: "والينك",
      tagline: "منصة بطاقات الولاء الرقمية الذكية للمتاجر والمقاهي",
    },
    nav: {
      demo: "جرّب الديمو",
      howItWorks: "كيف يعمل",
      pricing: "الباقات والأسعار",
      faq: "الأسئلة الشائعة",
      startNow: "ابدأ الآن",
      admin: "لوحة الإدارة",
      outreach: "استوديو المبيعات",
    },
    hero: {
      badge: "الجيل الجديد لبطاقات الولاء بالمغرب 🇲🇦",
      title1: "اجعل عملاءك يعودون إلى متجرك،",
      title2: "ببطاقة ولاء رقمية ذكية.",
      desc: "في Apple Wallet و Google Wallet مباشرة. بدون تطبيقات للتحميل، وبدون اشتراك شهري. بطاقات رقمية للأختام والكاش باك تعمل بتقنية NFC ورادار القرب الذكي 100 متر.",
      ctaPrimary: "جرّب الديمو التفاعلي",
      ctaSecondary: "عرض الباقات والأسعار",
      standBadge: "ستاند الكاونتر الذكي (NFC + QR)",
      standDesc: "امسح الرمز أو المس بهاتفك واحصل على بطاقتك في 5 ثوانٍ",
      notification1: "🎉 تمت إضافة ختم جديد لبطاقتك!",
      notification2: "📍 أنت بالقرب منا! تفضل بزيارتنا وقهوتك جاهزة.",
      notification3: "💰 رصيد كاش باك متاح: 35.50 درهم جاهز للصرف.",
    },
    demo: {
      title: "جرّب التجربة الحقيقية بنفسك",
      subtitle: "اختر نشاطك التجاري، وجرّب إرسال الأختام أو الكاش باك كما لو كنت داخل متجرك",
      cardTypeLabel: "نظام الولاء المعروض في الديمو:",
      stampsType: "🎁 نظام الأختام والمكافآت",
      cashbackType: "💰 نظام الكاش باك (10%)",
      phoneTab: "هاتف العميل",
      merchantTab: "تطبيق التاجر",
      stampAction: "+ إضافة ختم",
      cashbackAction: "+ إضافة كاش باك (+15 DH)",
      radarSimulate: "رادار 100 م",
      winbackSimulate: "استرجاع الغائبين",
      promoSimulate: "إرسال عرض ترويجي",
      reviewSimulate: "تقييم Google",
      resetDemo: "إعادة ضبط الديمو",
      ownerHome: "الرئيسية",
      ownerClients: "العملاء",
      ownerPromos: "العروض",
      ownerAuto: "التلقائي",
      kpiTotalVisits: "إجمالي الزيارات",
      kpiReturning: "العملاء المتكررون",
      kpiCashbackGiven: "كاش باك ممنوح",
      kpiGoogleReviews: "تقييمات Google",
      sendPromoTitle: "إرسال إشعار فوري لجميع العملاء",
      sendPromoDesc: "يصل الإشعار مباشرة إلى شاشات قفل الهواتف عبر Apple و Google Wallet",
      targetAudience: "الجمهور المستهدف",
      audienceAll: "جميع العملاء (100%)",
      audienceQuiet: "العملاء الغائبون (+14 يوماً)",
      audienceNear: "على وشك الحصول على المكافأة",
      audienceVip: "العملاء المميزون (VIP)",
      creditsCost: "تكلفة الإرسال",
      creditsBalance: "رصيدك الحالي",
      sendBroadcastBtn: "إرسال الإشعار لجميع الهواتف الآن",
      simulatingSuccess: "تم إرسال الإشعار بنجاح إلى هواتف العملاء!",
    },
    engines: {
      radarTitle: "رادار القرب 100 متر الذكي",
      radarTag: "GPS مدمج",
      radarDesc: "بمجرد مرور العميل في محيط 100 متر من متجرك، يستشعر الهاتف الموقع ويظهر إشعاراً جذاباً على شاشة القفل تلقائياً لتذكيره بزيارتك.",
      radarLockTitle: "أنت بالقرب منا! ☕️",
      radarLockBody: "تفضل بزيارتنا الآن، بطاقتك جاهزة ولديك رصيد متاح.",
      reviewsTitle: "مضاعفة تقييمات Google 5 نجوم",
      reviewsTag: "+340% تقييمات",
      reviewsDesc: "بعد كل زيارة ناجحة، يتلقى العميل إشعاراً لطيفاً يدعوه لتقييم متجرك على Google Maps بضغطة زر واحدة لرفع ترتيبك المحلي.",
      reviewsLockTitle: "كيف كانت تجربتك اليوم؟ ⭐",
      reviewsLockBody: "شاركنا رأيك على Google وساعد الآخرين على اكتشافنا.",
      winbackTitle: "استرجاع العملاء الغائبين تلقائياً",
      winbackTag: "استعادة 28%",
      winbackDesc: "إذا مر 15 يوماً دون زيارة من عميل اعتاد المجيء، يرسل له النظام تلقائياً عرضاً تشجيعياً خاصاً لإعادته للشراء فوراً.",
      winbackLockTitle: "اشتقنا لزيارتك! 🎁",
      winbackLockBody: "تفضل بزيارتنا هذا الأسبوع واحصل على ختم مضاعف أو خصم خاص.",
      pushTitle: "إعلانات مجانية مباشرة على شاشة القفل",
      pushTag: "نسبة قراءة 92%",
      pushDesc: "تجاوز خوارزميات إنستغرام ورسائل واتساب غير المقروءة. أرسل إشعارات عروضك الترويجية مباشرة إلى شاشات هواتف زبائنك مجاناً وبلا حجب.",
      pushLockTitle: "عرض خاص لنهاية الأسبوع ⚡️",
      pushLockBody: "استفد من كاش باك مضاعف 20% طيلة عطلة نهاية الأسبوع.",
    },
    compare: {
      title: "لماذا تختار Walink لمتجرك؟",
      subtitle: "مقارنة دقيقة بين حلول الولاء التقليدية ومنظومة Walink الذكية",
      colFeature: "الميزة والمقارنة",
      colWalink: "منظومة Walink",
      colPaper: "البطاقات الورقية",
      colApp: "تطبيق هاتف خاص",
      row1Feature: "تنزيل تطبيق من المتجر",
      row1Walink: "❌ بدون أي تطبيق (تفتح بـ 5 ثوانٍ)",
      row1Paper: "❌ لا يوجد تطبيق",
      row1App: "⚠️ إجباري (90% من الزبائن يرفضون)",
      row2Feature: "النسيان والضياع",
      row2Walink: "✅ مستحيل (محفوظة في Apple/Google Wallet)",
      row2Paper: "❌ 70% تضيع أو تُنسى في المنزل",
      row2App: "⚠️ يتم حذف التطبيق لتوفير المساحة",
      row3Feature: "رادار 100 متر على شاشة القفل",
      row3Walink: "✅ مدمج ويعمل تلقائياً",
      row3Paper: "❌ غير متوفر نهائياً",
      row3App: "⚠️ يتطلب تشغيل الموقع وأذونات معقدة",
      row4Feature: "استرجاع العملاء الغائبين",
      row4Walink: "✅ تلقائي بدون تدخل منك",
      row4Paper: "❌ لا تعرف من زارك ومن غاب",
      row4App: "⚠️ مكلف ومعقد الصيانة",
      row5Feature: "التكلفة المالية",
      row5Walink: "✅ دفعة واحدة وبلا اشتراك شهري",
      row5Paper: "⚠️ طباعة متكررة ومكلفة شهرياً",
      row5App: "❌ تكلفة تطوير باهظة + اشتراك شهري",
      roiTitle: "حاسبة العائد الاستثماري لمتجرك",
      roiSubtitle: "حرّك المؤشرات لتقدير الأرباح الإضافية التي ستجنيها شهرياً بفضل عودة عملائك",
      sliderVisitsLabel: "عدد العملاء اليومي في محلك:",
      sliderTicketLabel: "متوسط قيمة الفاتورة (درهم):",
      monthlyExtraRev: "أرباح إضافية متوقعة شهرياً:",
      yearlyExtraRev: "أرباح إضافية متوقعة سنوياً:",
      paybackTime: "فترة استرداد ثمن الباقة بالكامل:",
      paybackValue: "أقل من 14 يوماً فقط!",
    },
    pricing: {
      title: "باقات واضحة وبلا اشتراكات شهرية",
      subtitle: "ادفع مرة واحدة فقط، واستلم الستاند الذكي وبطاقاتك الرقمية جاهزة ومفعلة لمتجرك",
      popularBadge: "الباقة الأكثر طلباً ⭐",
      starterTitle: "Starter",
      starterPrice: "1,500 DH",
      starterDesc: "مثالية للمقاهي والمحلات الفردية الناشئة",
      growthTitle: "Growth",
      growthPrice: "2,400 DH",
      growthDesc: "الخيار الأقوى لتوسيع قاعدة العملاء ومضاعفة الأرباح",
      multiTitle: "Multi-Branch",
      multiPrice: "3,900 DH",
      multiDesc: "للعلامات التجارية والمطاعم ذات الفروع المتعددة",
      orderStarterBtn: "طلب باقة Starter",
      orderGrowthBtn: "طلب باقة Growth الأكثر طلباً",
      orderMultiBtn: "طلب باقة Multi-Branch",
      creditsTitle: "كيف يعمل نظام الرصيد في Walink؟",
      creditsDesc: "إشعارات الأختام اليومية، الكاش باك، وتسليم المكافآت ورادار القرب مجانية دائماً وبلا حدود. يُستخدم الرصيد فقط لإرسال حملات الإشعارات الجماعية أو رسائل استرجاع العملاء الغائبين (1 رسالة = 1 رصيد)، بأسعار اقتصادية تبدأ من 100 درهم لـ 500 رسالة.",
      careTitle: "خدمة Walink Care السنوية",
      careDesc: "السنة الأولى مشمولة مجاناً في سعر الباقة. ابتداءً من السنة الثانية، هناك اشتراك رمزي اختياري بقيمة 390 درهم سنوياً فقط لتغطية استضافة خوادم Apple و Google والنسخ الاحتياطي المستمر لبيانات زبائنك.",
      featureStand: "ستاند أكريليك فاخر مدمج بـ NFC و QR عالي الدقة",
      featureCards: "بطاقات رقمية غير محدودة على Apple و Google Wallet",
      featureRadar: "رادار 100 متر الذكي على شاشات القفل",
      featureReviews: "محرك زيادة تقييمات Google Maps بخمس نجوم",
      featureCredits500: "500 رصيد إشعارات ترويجية مجاني",
      featureCredits1000: "1,200 رصيد إشعارات ترويجية مجاني",
      featureMultiBranches: "ستاند لكل فرع + لوحة تحكم مركزية للفروع",
      featureDedicatedSupport: "دعم فني مخصص وأولوية في التحديثات",
    },
    payment: {
      termsTitle: "طريقة الدفع الآمنة (50/50)",
      termsDesc: "نعمل بمبدأ الثقة المتبادلة: 50% دفعة أولى عند تأكيد الطلب ومعاينة التصميم الرقمي لكارط محلك، و 50% عند التوصيل وتجربة الستاند في محلك والتأكد من عمله بكفاءة 100%.",
      guaranteeTitle: "الضمانات المرفقة مع كل باقة",
      g1: "جلسة اتصال إرشادية مباشرة لمساعدتك في تشغيل وتدريب موظفيك",
      g2: "دعم فني مستمر عبر واتساب لحل أي استفسار",
      g3: "توصيل مجاني وسريع لكافة مدن المملكة المغربية 🇲🇦",
    },
    faq: {
      title: "الأسئلة الشائعة",
      subtitle: "كل ما تود معرفته حول منصة Walink وطريقة عملها",
      q1: "هل يحتاج العميل لتنزيل أي تطبيق على هاتفه؟",
      a1: "نهائياً! العميل يمسح رمز QR أو يلمس الستاند بتقنية NFC خلال 5 ثوانٍ، وتُحفظ البطاقة فوراً وبشكل دائم في Apple Wallet (لهواتف iPhone) أو Google Wallet (لهواتف Android) وتعمل بدون إنترنت.",
      q2: "ما الفرق بين نظام الأختام ونظام الكاش باك في Walink؟",
      a2: "نظام الأختام يعتمد على جمع عدد محدد من الزيارات (مثلاً 5 أختام) للحصول على مكافأة مجانية (مثل قهوة أو غسلة). نظام الكاش باك يعيد نسبة مئوية (مثلاً 10%) من قيمة كل فاتورة كرصيد نقدي في بطاقة العميل يصرفه في زياراته القادمة. يمكنك تشغيل أحد النظامين أو كليهما معاً!",
      q3: "كيف يعمل رادار 100 متر بدون أن يكون الهاتف متصلاً بالإنترنت؟",
      a3: "محفظتي Apple Wallet و Google Wallet مدمجتان مباشرة في نظام تشغيل الهاتف ومزودتان بخاصية تحديد الموقع الجغرافي. بمجرد اقتراب العميل من محيط 100 متر حول المحل، يوقظ الهاتف الشاشة ويُظهر إشعار القرب تلقائياً.",
      q4: "ما هو الستاند الذكي المرفق مع الباقة؟",
      a4: "ستاند مكتبي فاخر مصنوع من الأكريليك المقاوم، مطبوع بألوان علامتك التجارية، ومدمج برقيقة NFC ذكية ورمز QR عالي الوضوح، يوضع فوق الكاونتر ليحصل العملاء على بطاقاتهم بلمسة واحدة.",
      q5: "كيف تكون طريقة الدفع والتسليم؟",
      a5: "الدفع يتم بصيغة 50% تسبيق عند اعتماد التصميم، و50% المتبقية عند الاستلام والتجربة داخل متجرك، والتوصيل مجاني لجميع المدن.",
      q6: "هل يمكنني تجربة لوحة تحكم التاجر قبل الشراء؟",
      a6: "نعم بالتأكيد! يمكنك تجربة الديمو التفاعلي في هذه الصفحة، أو تصفح بوابة التاجر الحقيقية (/m/cafe-atlas) وتجربة مسح الأكواد وإضافة الأختام والكاش باك في ثانية واحدة.",
    },
    finalCta: {
      title: "هل أنت مستعد لمضاعفة مبيعات متجرك؟",
      desc: "اطلب الآن واستفد من عرض الإطلاق الخاص. الستاند والبطاقة الرقمية تصبح جاهزة خلال 48 ساعة فقط.",
      btn: "طلب الباقة لمتجرك الآن",
    },
    footer: {
      copyright: "جميع الحقوق محفوظة لرواد الأعمال في المملكة المغربية 🇲🇦",
      supportWa: "واتساب الدعم (+212 708 107 351)",
      adminLink: "لوحة الإدارة المركزية",
      outreachLink: "استوديو المبيعات المباشرة",
    },
    checkout: {
      title: "تأكيد طلب باقة Walink",
      subtitle: "أدخل بيانات متجرك وسيقوم فريقنا بالتواصل معك لتجهيز التصميم والستاند فوراً",
      shopNameLabel: "اسم المحل أو العلامة التجارية *",
      shopNamePlaceholder: "مثال: Café Atlas",
      nicheLabel: "مجال النشاط التجاري *",
      cityLabel: "المدينة بالمغرب *",
      cityPlaceholder: "اختر مدينتك...",
      phoneLabel: "رقم هاتف الواتساب للتواصل *",
      phonePlaceholder: "0661234567",
      planLabel: "الباقة المختارة:",
      summaryTitle: "ملخص الطلب:",
      confirmSubmitBtn: "تأكيد الطلب عبر واتساب 💬",
      securityNote: "🔒 لن يتم خصم أي مبالغ الآن. سيتم التواصل معك لتأكيد التصميم والتفاصيل أولاً.",
    },
    pass: {
      stampsLabel: "الأختام",
      rewardLabel: "المكافأة المستحقة",
      cashbackRateLabel: "نسبة الاسترداد",
      balanceAvailable: "الرصيد المتاح للصرف",
      onEveryPurchase: "على كل فاتورة",
      memberCodeLabel: "رقم العضوية",
      lastVisitLabel: "آخر زيارة",
      standScanCaption: "امسح الرمز واحصل على بطاقتك",
      addToAppleWallet: "إضافة إلى Apple Wallet",
      addToGoogleWallet: "إضافة إلى Google Wallet",
      cashbackBanner: "💰 لديك {balance} {currency} رصيد كاش باك متاح! أظهر رمز QR للكاشير لخصمه من فاتورتك القادمة.",
      stampsProgress: "{stamps} من {total} أختام مكتملة",
      stampAddedTitle: "تمت إضافة ختم جديد! 🎉",
      stampAddedBody: "شكراً لزيارتك! تبقى لك {left} أختام للحصول على مكافأتك.",
      rewardUnlockedTitle: "مبروك! مكافأتك جاهزة 🎁",
      rewardUnlockedBody: "اكتملت أختامك! أظهر بطاقتك الآن لاستلام مكافأتك مجاناً.",
      cashbackEarnedTitle: "تمت إضافة كاش باك! 💰",
      cashbackEarnedBody: "تمت إضافة +{amount} {currency} ({rate}%) إلى بطاقتك! رصيدك المتاح: {balance} {currency}.",
      cashbackRedeemedTitle: "تم استخدام رصيد الكاش باك! 💸",
      cashbackRedeemedBody: "تم خصم {amount} {currency} من رصيدك. رصيدك المتبقي: {balance} {currency}.",
      radarAlertTitle: "أنت بالقرب منا! 📍",
      radarAlertBody: "بطاقتك الرقمية جاهزة ولديك رصيد متاح، تفضل بزيارتنا الآن.",
      reviewAlertTitle: "كيف كانت تجربتك اليوم؟ ⭐",
      reviewAlertBody: "رأيك يهمنا كثيراً! اضغط هنا لتقييمنا على Google Maps.",
      activityDrawerTitle: "سجل الزيارات والنشاط",
      totalVisits: "إجمالي الزيارات:",
      totalEarned: "إجمالي ما وفرته:",
    },
    onboarding: {
      welcomeGiftStamps: "🎁 ختم ترحيبي هدية عند التسجيل!",
      welcomeGiftCashback: "💰 هدية ترحيبية {amount} {currency} رصيد كاش باك متاح فوراً!",
      chooseProgram: "اختر برنامج الولاء المفضل لديك:",
      stampsProgramTitle: "🎁 برنامج الأختام والمكافآت",
      stampsProgramDesc: "اجمع {stamps} أختام واحصل على {reward} مجاناً",
      cashbackProgramTitle: "💰 برنامج الكاش باك ({rate}%)",
      cashbackProgramDesc: "استرجع {rate}% من قيمة كل فاتورة كرصيد نقدي في بطاقتك",
      nameLabel: "الاسم الكامل *",
      namePlaceholder: "أدخل اسمك الكريم",
      phoneLabel: "رقم الهاتف المحمول *",
      phonePlaceholder: "0661234567",
      birthdayLabel: "تاريخ الميلاد (اختياري لهدايا عيد الميلاد)",
      submitBtn: "احصل على بطاقتك الرقمية الآن",
      alreadyMember: "هل لديك بطاقة بالفعل؟",
      existingCustomerNotice: "مرحباً بعودتك! تم العثور على بطاقتك السابقة.",
      goToPass: "فتح بطاقتي الحالية",
    },
    merchant: {
      pinTitle: "لوحة تحكم المتجر",
      pinPrompt: "أدخل رمز PIN السري للدخول إلى نظام المتجر",
      pinLoginBtn: "تسجيل الدخول",
      pinError: "رمز PIN غير صحيح. يرجى المحاولة مجدداً.",
      badgeStamps: "🎁 بطاقة أختام",
      badgeCashback: "💰 بطاقة كاش باك",
      scannerBtn: "فتح ماسح الكاميرا (QR)",
      manualLookup: "أو البحث برقم العضوية أو الهاتف:",
      searchPlaceholder: "أدخل رقم الهاتف أو الكود المكون من 4 أرقام...",
      addStampBtn: "+ إضافة ختم للعميل",
      redeemRewardBtn: "🎁 تسليم المكافأة وإعادة الضبط",
      earnCashbackTab: "➕ إضافة كاش باك (فاتورة جديدة)",
      redeemCashbackTab: "💸 تصريف / خصم من الرصيد",
      billAmountLabel: "قيمة الفاتورة الإجمالية ({currency}) *",
      calculatePreview: "سيتم إضافة +{amount} {currency} ({rate}%) إلى رصيد العميل",
      confirmEarnBtn: "تأكيد وإضافة +{amount} {currency}",
      redeemAmountLabel: "المبلغ المراد سحبه / خصمه ({currency}) *",
      redeemFullBtn: "سحب الرصيد بالكامل ({amount} {currency})",
      remainingToPay: "المتبقي للدفع نقداً: {amount} {currency}",
      confirmRedeemBtn: "تأكيد خصم -{amount} {currency} من الرصيد",
      switchProgramBtn: "تبديل نظام العميل ⇄",
      switchConfirm: "هل ترغب في تغيير نظام العميل بين الأختام والكاش باك؟",
      currentBalance: "الرصيد المتاح:",
      lifetimeVisits: "إجمالي الزيارات:",
      crmTitle: "قاعدة عملاء المتجر",
      statusActive: "نشط",
      statusQuiet: "غائب",
      statusVip: "VIP",
    },
    admin: {
      title: "لوحة الإدارة المركزية - Walink",
      subtitle: "إدارة المتاجر، البطاقات، الحملات الإعلانية، واستوديو المبيعات",
      newMerchantBtn: "+ إضافة متجر جديد",
      automationsLink: "مركز الأتمتة والمهام المجدولة",
      outreachLink: "استوديو المبيعات وقنص العملاء",
      loyaltyModeLabel: "نظام الولاء المعتمد للمحل:",
      modeBoth: "النظامان معاً (العميل يختار عند التسجيل)",
      modeStamps: "نظام الأختام والمكافآت فقط",
      modeCashback: "نظام الكاش باك (%) فقط",
      cashbackRateLabel: "نسبة الكاش باك (%)",
      welcomeCashbackLabel: "هدية الترحيب للكاش باك (DH)",
      minRedeemLabel: "الحد الأدنى لصرف الكاش باك (DH)",
      currencyLabel: "رمز العملة",
      previewStamps: "معاينة بطاقة الأختام",
      previewCashback: "معاينة بطاقة الكاش باك",
    },
    niches: {
      cafe: {
        name: "مقهى / كافيه",
        label: "مقهى",
        reward: "قهوة مجانية",
        prefix: "عزيزي",
        defaultShop: "Café Atlas",
      },
      barber: {
        name: "صالون حلاقة رجالي",
        label: "صالون حلاقة",
        reward: "حلاقة مجانية",
        prefix: "عزيزي",
        defaultShop: "صالون أنس للحلاقة",
      },
      snack: {
        name: "مطعم / وجبات سريعة",
        label: "مطعم",
        reward: "وجبة مجانية",
        prefix: "عزيزي",
        defaultShop: "Burger House",
      },
      wash: {
        name: "مغسلة سيارات",
        label: "غسيل سيارات",
        reward: "غسلة شاملة مجانية",
        prefix: "عزيزي",
        defaultShop: "Auto Spa Express",
      },
      beauty: {
        name: "صالون تجميل وعناية",
        label: "مركز تجميل",
        reward: "جلسة عناية مجانية",
        prefix: "سيدتي",
        defaultShop: "Beauty Lounge",
      },
      laundry: {
        name: "مصبنة / دراي كلين",
        label: "مصبنة",
        reward: "غسيل ملابس مجاني",
        prefix: "عزيزي",
        defaultShop: "Pressing Royal",
      },
      other: {
        name: "متجر تجاري آخر",
        label: "متجر تجاري",
        reward: "هدية خاصة مجانية",
        prefix: "عزيزي",
        defaultShop: "Boutique Elegance",
      },
    },
  },

  fr: {
    brand: {
      name: "walink.ma",
      arabicName: "Walink",
      tagline: "Plateforme intelligente de cartes de fidélité pour commerces locaux",
    },
    nav: {
      demo: "Essayer la démo",
      howItWorks: "Comment ça marche",
      pricing: "Tarifs & Packs",
      faq: "FAQ",
      startNow: "Démarrer",
      admin: "Administration",
      outreach: "Studio Prospection",
    },
    hero: {
      badge: "Nouvelle génération de cartes de fidélité 🇲🇦",
      title1: "Fidélisez vos clients,",
      title2: "avec une carte digitale intelligente.",
      desc: "Directement dans Apple Wallet et Google Wallet. Sans application à installer, sans abonnement mensuel. Cartes à tampons et cashback avec puce NFC et radar de proximité 100m.",
      ctaPrimary: "Essayer la démo interactive",
      ctaSecondary: "Découvrir les offres",
      standBadge: "Présentoir comptoir NFC + QR",
      standDesc: "Scannez le QR code ou approchez votre smartphone en 5 secondes",
      notification1: "🎉 Nouveau tampon ajouté à votre carte !",
      notification2: "📍 Vous êtes tout près ! Votre café préféré vous attend.",
      notification3: "💰 Solde cashback disponible : 35,50 DH prêt à être déduit.",
    },
    demo: {
      title: "Vivez l'expérience en direct",
      subtitle: "Choisissez votre secteur et testez l'attribution de tampons ou de cashback comme dans votre commerce",
      cardTypeLabel: "Programme de fidélité affiché :",
      stampsType: "🎁 Programme Tampons & Récompenses",
      cashbackType: "💰 Programme Cashback (10%)",
      phoneTab: "Téléphone client",
      merchantTab: "App commerçant",
      stampAction: "+ Ajouter un tampon",
      cashbackAction: "+ Ajouter cashback (+15 DH)",
      radarSimulate: "Radar 100 m",
      winbackSimulate: "Relance inactifs",
      promoSimulate: "Envoyer une promo",
      reviewSimulate: "Avis Google",
      resetDemo: "Réinitialiser",
      ownerHome: "Accueil",
      ownerClients: "Clients",
      ownerPromos: "Promos",
      ownerAuto: "Automatisations",
      kpiTotalVisits: "Visites totales",
      kpiReturning: "Clients récurrents",
      kpiCashbackGiven: "Cashback accordé",
      kpiGoogleReviews: "Avis Google",
      sendPromoTitle: "Envoyer une notification push immédiate",
      sendPromoDesc: "Le message s'affiche directement sur l'écran verrouillé des smartphones",
      targetAudience: "Audience cible",
      audienceAll: "Tous les clients (100%)",
      audienceQuiet: "Clients inactifs (+14 jours)",
      audienceNear: "Proches de la récompense",
      audienceVip: "Clients fidèles VIP",
      creditsCost: "Coût de l'envoi",
      creditsBalance: "Votre solde crédits",
      sendBroadcastBtn: "Diffuser la notification maintenant",
      simulatingSuccess: "Notification diffusée avec succès aux smartphones !",
    },
    engines: {
      radarTitle: "Radar de proximité intelligent 100m",
      radarTag: "GPS natif",
      radarDesc: "Dès qu'un client passe à moins de 100 mètres de votre commerce, son téléphone réveille son écran avec une notification l'invitant à entrer.",
      radarLockTitle: "Vous êtes tout près ! ☕️",
      radarLockBody: "Passez nous voir, votre carte de fidélité et vos avantages sont prêts.",
      reviewsTitle: "Multipliez vos avis Google 5 étoiles",
      reviewsTag: "+340% d'avis",
      reviewsDesc: "Après chaque visite réussie, une notification invite le client à déposer un avis 5 étoiles sur Google Maps en un seul clic.",
      reviewsLockTitle: "Comment s'est passée votre visite ? ⭐",
      reviewsLockBody: "Laissez-nous votre avis sur Google en 10 secondes.",
      winbackTitle: "Récupération automatique des clients inactifs",
      winbackTag: "+28% de retours",
      winbackDesc: "Si un client habituel ne revient pas après 15 jours, une offre irrésistible lui est envoyée automatiquement pour le faire revenir.",
      winbackLockTitle: "Vous nous manquez ! 🎁",
      winbackLockBody: "Revenez cette semaine et profitez d'un double tampon ou d'une remise exclusive.",
      pushTitle: "Notifications directes sur l'écran de verrouillage",
      pushTag: "92% d'ouverture",
      pushDesc: "Oubliez les spams WhatsApp et les algorithmes sociaux. Touchez 100% de vos clients directement au cœur de leur smartphone sans blocage.",
      pushLockTitle: "Offre spéciale ce week-end ⚡️",
      pushLockBody: "Profitez d'un cashback doublé de 20% sur tous vos achats.",
    },
    compare: {
      title: "Pourquoi choisir Walink pour votre établissement ?",
      subtitle: "Comparatif complet entre les méthodes traditionnelles et Walink",
      colFeature: "Fonctionnalité clé",
      colWalink: "Solution Walink",
      colPaper: "Cartes en carton",
      colApp: "Application sur mesure",
      row1Feature: "Téléchargement d'application",
      row1Walink: "❌ Aucune application (accès en 5s)",
      row1Paper: "❌ Pas d'application",
      row1App: "⚠️ Obligatoire (90% d'abandons)",
      row2Feature: "Oubli ou perte de la carte",
      row2Walink: "✅ Impossible (intégrée dans Apple/Google Wallet)",
      row2Paper: "❌ 70% perdues ou oubliées à la maison",
      row2App: "⚠️ Désinstallée pour libérer de l'espace",
      row3Feature: "Radar 100m sur écran verrouillé",
      row3Walink: "✅ Intégré et automatique",
      row3Paper: "❌ Inexistant",
      row3App: "⚠️ Nécessite des autorisations complexes",
      row4Feature: "Relance automatique des inactifs",
      row4Walink: "✅ Automatisée sans intervention",
      row4Paper: "❌ Données clients inexistantes",
      row4App: "⚠️ Complexe et coûteuse à maintenir",
      row5Feature: "Modèle tarifaire",
      row5Walink: "✅ Paiement unique sans abonnement",
      row5Paper: "⚠️ Réimpressions coûteuses et régulières",
      row5App: "❌ Développement cher + abonnements mensuels",
      roiTitle: "Simulateur de retour sur investissement",
      roiSubtitle: "Ajustez les curseurs pour estimer le chiffre d'affaires additionnel généré par vos clients fidélisés",
      sliderVisitsLabel: "Nombre de clients par jour :",
      sliderTicketLabel: "Panier moyen par client (DH) :",
      monthlyExtraRev: "Revenu additionnel mensuel estimé :",
      yearlyExtraRev: "Revenu additionnel annuel estimé :",
      paybackTime: "Rentabilisation totale du pack :",
      paybackValue: "En moins de 14 jours seulement !",
    },
    pricing: {
      title: "Packs transparents, sans abonnement mensuel",
      subtitle: "Payez une seule fois et recevez votre présentoir comptoir NFC et vos cartes digitales prêtes à l'emploi",
      popularBadge: "Le plus populaire ⭐",
      starterTitle: "Starter",
      starterPrice: "1,500 DH",
      starterDesc: "Parfait pour les petits commerces et indépendants",
      growthTitle: "Growth",
      growthPrice: "2,400 DH",
      growthDesc: "La formule idéale pour maximiser la rétention client et les ventes",
      multiTitle: "Multi-Branch",
      multiPrice: "3,900 DH",
      multiDesc: "Pour les réseaux, franchises et établissements à plusieurs points de vente",
      orderStarterBtn: "Commander le pack Starter",
      orderGrowthBtn: "Commander le pack Growth (Recommandé)",
      orderMultiBtn: "Commander le pack Multi-Branch",
      creditsTitle: "Comment fonctionnent les crédits Walink ?",
      creditsDesc: "Les tampons quotidiens, le cashback, les récompenses et les alertes radar sont 100% gratuits et illimités. Les crédits ne servent qu'à envoyer des campagnes promotionnelles groupées ou des relances inactifs (1 message = 1 crédit), à des tarifs avantageux dès 100 DH pour 500 messages.",
      careTitle: "Service annuel Walink Care",
      careDesc: "La première année est offerte avec le pack. Dès la 2ème année, une souscription optionnelle de 390 DH/an permet de couvrir l'hébergement sécurisé chez Apple & Google ainsi que la sauvegarde continue de vos données.",
      featureStand: "Présentoir acrylique haut de gamme avec NFC et QR code haute résolution",
      featureCards: "Cartes digitales illimitées sur Apple Wallet et Google Wallet",
      featureRadar: "Radar de proximité 100m sur écran verrouillé",
      featureReviews: "Booster d'avis Google Maps 5 étoiles",
      featureCredits500: "500 crédits de notifications offerts",
      featureCredits1000: "1 200 crédits de notifications offerts",
      featureMultiBranches: "Présentoirs par point de vente + console multi-succursales",
      featureDedicatedSupport: "Support technique dédié et accès prioritaire aux nouveautés",
    },
    payment: {
      termsTitle: "Paiement sécurisé en 2 étapes (50/50)",
      termsDesc: "Nous travaillons en toute confiance : 50% d'acompte à la validation de la commande et du visuel digital, et les 50% restants à la livraison après avoir testé le présentoir dans votre établissement.",
      guaranteeTitle: "Vos garanties incluses",
      g1: "Session de mise en route en visio pour former votre équipe",
      g2: "Support technique réactif via WhatsApp",
      g3: "Livraison gratuite et rapide dans tout le Maroc 🇲🇦",
    },
    faq: {
      title: "Questions fréquentes",
      subtitle: "Tout ce qu'il faut savoir sur la solution Walink",
      q1: "Le client doit-il télécharger une application ?",
      a1: "Non, absolument pas ! Le client approche son smartphone ou scanne le QR code en 5 secondes. La carte s'installe directement dans Apple Wallet (iPhone) ou Google Wallet (Android) et fonctionne sans connexion.",
      q2: "Quelle est la différence entre les tampons et le cashback ?",
      a2: "Le système de tampons permet de récompenser la régularité (ex: 5 visites = un café offert). Le cashback reverse un pourcentage de l'achat (ex: 10%) sous forme de cagnotte réutilisable lors des prochaines visites. Vous pouvez activer l'un, l'autre ou les deux simultanément !",
      q3: "Comment fonctionne le radar 100m sans connexion internet ?",
      a3: "Apple Wallet et Google Wallet sont intégrés nativement au système GPS du téléphone. Dès que le client s'approche à moins de 100m de votre enseigne, son écran s'allume avec votre notification.",
      q4: "Qu'est-ce que le présentoir comptoir intelligent ?",
      a4: "C'est un élégant support de comptoir en acrylique étanche personnalisé à vos couleurs, intégrant une puce NFC et un QR code durable pour un enrôlement ultra rapide de vos clients.",
      q5: "Comment se déroulent le paiement et la livraison ?",
      a5: "50% à la validation du design et 50% à la livraison après test. La livraison est 100% gratuite dans toutes les villes marocaines.",
      q6: "Puis-je tester l'application commerçant avant d'acheter ?",
      a6: "Bien sûr ! Vous pouvez tester la démo interactive sur cette page ou explorer le portail réel (/m/cafe-atlas) pour voir la rapidité du scanner en caisse.",
    },
    finalCta: {
      title: "Prêt à booster la fréquentation de votre commerce ?",
      desc: "Commandez aujourd'hui et profitez de l'offre de lancement. Votre présentoir et vos cartes sont prêts en 48 heures.",
      btn: "Commander mon pack maintenant",
    },
    footer: {
      copyright: "Tous droits réservés pour les commerçants et entrepreneurs au Maroc 🇲🇦",
      supportWa: "Support WhatsApp (+212 708 107 351)",
      adminLink: "Console d'administration",
      outreachLink: "Studio de prospection",
    },
    checkout: {
      title: "Confirmer votre commande Walink",
      subtitle: "Remplissez vos coordonnées et notre équipe prendra contact avec vous pour finaliser le design",
      shopNameLabel: "Nom de votre établissement *",
      shopNamePlaceholder: "Ex: Café Atlas",
      nicheLabel: "Secteur d'activité *",
      cityLabel: "Ville au Maroc *",
      cityPlaceholder: "Sélectionnez votre ville...",
      phoneLabel: "Numéro WhatsApp de contact *",
      phonePlaceholder: "0661234567",
      planLabel: "Pack sélectionné :",
      summaryTitle: "Récapitulatif :",
      confirmSubmitBtn: "Confirmer la commande via WhatsApp 💬",
      securityNote: "🔒 Aucun paiement n'est débité maintenant. Nous validons le design avec vous d'abord.",
    },
    pass: {
      stampsLabel: "TAMPONS",
      rewardLabel: "RÉCOMPENSE",
      cashbackRateLabel: "CASHBACK",
      balanceAvailable: "SOLDE DISPONIBLE",
      onEveryPurchase: "sur chaque achat",
      memberCodeLabel: "N° MEMBRE",
      lastVisitLabel: "Dernière visite",
      standScanCaption: "Scannez et obtenez votre carte",
      addToAppleWallet: "Ajouter à Apple Wallet",
      addToGoogleWallet: "Ajouter à Google Wallet",
      cashbackBanner: "💰 Vous avez {balance} {currency} de cashback disponible ! Présentez ce QR code en caisse pour l'utiliser.",
      stampsProgress: "{stamps} sur {total} tampons obtenus",
      stampAddedTitle: "Nouveau tampon ajouté ! 🎉",
      stampAddedBody: "Merci de votre visite ! Plus que {left} tampons pour votre récompense.",
      rewardUnlockedTitle: "Félicitations ! Récompense débloquée 🎁",
      rewardUnlockedBody: "Votre carte est complète ! Présentez-la en caisse pour en profiter.",
      cashbackEarnedTitle: "Cashback crédité ! 💰",
      cashbackEarnedBody: "+{amount} {currency} ({rate}%) ajoutés à votre solde ! Solde actuel : {balance} {currency}.",
      cashbackRedeemedTitle: "Cashback utilisé ! 💸",
      cashbackRedeemedBody: "{amount} {currency} déduits de votre achat. Solde restant : {balance} {currency}.",
      radarAlertTitle: "Vous êtes tout près ! 📍",
      radarAlertBody: "Votre carte digitale est prête avec des avantages exclusifs, passez nous voir !",
      reviewAlertTitle: "Votre avis compte pour nous ! ⭐",
      reviewAlertBody: "Cliquez ici pour déposer une note sur Google Maps en quelques secondes.",
      activityDrawerTitle: "Historique & Visites",
      totalVisits: "Visites totales :",
      totalEarned: "Total économisé :",
    },
    onboarding: {
      welcomeGiftStamps: "🎁 Tampon de bienvenue offert à l'inscription !",
      welcomeGiftCashback: "💰 {amount} {currency} de cashback offerts immédiatement !",
      chooseProgram: "Choisissez votre programme de fidélité :",
      stampsProgramTitle: "🎁 Programme Tampons & Cadeaux",
      stampsProgramDesc: "Cumulez {stamps} tampons et obtenez {reward} offert",
      cashbackProgramTitle: "💰 Programme Cashback ({rate}%)",
      cashbackProgramDesc: "Récupérez {rate}% du montant de chaque achat en cagnotte",
      nameLabel: "Nom complet *",
      namePlaceholder: "Votre nom et prénom",
      phoneLabel: "Numéro de téléphone *",
      phonePlaceholder: "0661234567",
      birthdayLabel: "Date de naissance (optionnel pour les cadeaux d'anniversaire)",
      submitBtn: "Obtenir ma carte digitale maintenant",
      alreadyMember: "Déjà membre ?",
      existingCustomerNotice: "Ravi de vous revoir ! Votre carte existante a été retrouvée.",
      goToPass: "Accéder à ma carte",
    },
    merchant: {
      pinTitle: "Espace Commerçant",
      pinPrompt: "Entrez votre code PIN secret pour accéder à la caisse",
      pinLoginBtn: "Se connecter",
      pinError: "Code PIN incorrect. Veuillez réessayer.",
      badgeStamps: "🎁 Carte Tampons",
      badgeCashback: "💰 Carte Cashback",
      scannerBtn: "Ouvrir le scanner caméra (QR)",
      manualLookup: "Ou rechercher par n° membre ou téléphone :",
      searchPlaceholder: "Téléphone ou code à 4 chiffres...",
      addStampBtn: "+ Ajouter un tampon",
      redeemRewardBtn: "🎁 Remettre la récompense & réinitialiser",
      earnCashbackTab: "➕ Créditer du cashback (nouvel achat)",
      redeemCashbackTab: "💸 Déduire du cashback (utiliser le solde)",
      billAmountLabel: "Montant total de l'achat ({currency}) *",
      calculatePreview: "+{amount} {currency} ({rate}%) seront crédités au client",
      confirmEarnBtn: "Confirmer et créditer +{amount} {currency}",
      redeemAmountLabel: "Montant à déduire ({currency}) *",
      redeemFullBtn: "Utiliser tout le solde ({amount} {currency})",
      remainingToPay: "Reste à payer en caisse : {amount} {currency}",
      confirmRedeemBtn: "Confirmer la déduction de -{amount} {currency}",
      switchProgramBtn: "Changer le programme ⇄",
      switchConfirm: "Voulez-vous basculer ce client entre Tampons et Cashback ?",
      currentBalance: "Solde disponible :",
      lifetimeVisits: "Visites cumulées :",
      crmTitle: "Fichier clients",
      statusActive: "Actif",
      statusQuiet: "Inactif",
      statusVip: "VIP",
    },
    admin: {
      title: "Console d'administration - Walink",
      subtitle: "Gestion des commerces, cartes, campagnes et prospection",
      newMerchantBtn: "+ Ajouter un commerce",
      automationsLink: "Centre des automatisations & cron",
      outreachLink: "Studio de prospection & leads",
      loyaltyModeLabel: "Type de fidélité proposé :",
      modeBoth: "Les deux systèmes (choix par le client)",
      modeStamps: "Tampons & Récompenses uniquement",
      modeCashback: "Cashback (%) uniquement",
      cashbackRateLabel: "Taux de cashback (%)",
      welcomeCashbackLabel: "Bonus de bienvenue cashback (DH)",
      minRedeemLabel: "Seuil minimum de déduction (DH)",
      currencyLabel: "Devise",
      previewStamps: "Aperçu Carte Tampons",
      previewCashback: "Aperçu Carte Cashback",
    },
    niches: {
      cafe: {
        name: "Café / Salon de thé",
        label: "Café",
        reward: "Café offert",
        prefix: "Cher client",
        defaultShop: "Café Atlas",
      },
      barber: {
        name: "Salon de coiffure / Barbier",
        label: "Barbier",
        reward: "Coupe offerte",
        prefix: "Cher client",
        defaultShop: "Salon Anas Barbier",
      },
      snack: {
        name: "Restaurant / Fast-food",
        label: "Restaurant",
        reward: "Repas offert",
        prefix: "Cher client",
        defaultShop: "Burger House",
      },
      wash: {
        name: "Lavage auto & detailing",
        label: "Lavage auto",
        reward: "Lavage complet offert",
        prefix: "Cher client",
        defaultShop: "Auto Spa Express",
      },
      beauty: {
        name: "Salon de beauté & Spa",
        label: "Salon de beauté",
        reward: "Soin visage offert",
        prefix: "Chère cliente",
        defaultShop: "Beauty Lounge",
      },
      laundry: {
        name: "Pressing & Blanchisserie",
        label: "Pressing",
        reward: "Nettoyage offert",
        prefix: "Cher client",
        defaultShop: "Pressing Royal",
      },
      other: {
        name: "Autre commerce de détail",
        label: "Commerce",
        reward: "Cadeau exclusif",
        prefix: "Cher client",
        defaultShop: "Boutique Elegance",
      },
    },
  },

  es: {
    brand: {
      name: "walink.ma",
      arabicName: "Walink",
      tagline: "Plataforma inteligente de tarjetas de fidelización para negocios locales",
    },
    nav: {
      demo: "Probar demo",
      howItWorks: "Cómo funciona",
      pricing: "Precios y planes",
      faq: "Preguntas frecuentes",
      startNow: "Empezar ya",
      admin: "Administración",
      outreach: "Estudio comercial",
    },
    hero: {
      badge: "Nueva generación de fidelización comercial 🇲🇦",
      title1: "Haz que tus clientes vuelvan,",
      title2: "con una tarjeta digital inteligente.",
      desc: "Directamente en Apple Wallet y Google Wallet. Sin descargas de apps, sin suscripciones mensuales. Tarjetas digitales de sellos y cashback con chip NFC y radar de proximidad 100m.",
      ctaPrimary: "Probar la demo interactiva",
      ctaSecondary: "Ver planes y precios",
      standBadge: "Soporte de mostrador NFC + QR",
      standDesc: "Escanea el código QR o acerca el móvil en 5 segundos",
      notification1: "🎉 ¡Nuevo sello añadido a tu tarjeta!",
      notification2: "📍 ¡Estás muy cerca! Tu café favorito te espera.",
      notification3: "💰 Saldo cashback disponible: 35,50 DH listo para canjear.",
    },
    demo: {
      title: "Vive la experiencia en directo",
      subtitle: "Elige tu tipo de negocio y prueba la asignación de sellos o cashback como en tu tienda",
      cardTypeLabel: "Programa de fidelización activo:",
      stampsType: "🎁 Programa de Sellos y Premios",
      cashbackType: "💰 Programa Cashback (10%)",
      phoneTab: "Móvil del cliente",
      merchantTab: "App del comercio",
      stampAction: "+ Añadir un sello",
      cashbackAction: "+ Añadir cashback (+15 DH)",
      radarSimulate: "Radar 100 m",
      winbackSimulate: "Recuperar inactivos",
      promoSimulate: "Enviar promoción",
      reviewSimulate: "Reseña Google",
      resetDemo: "Reiniciar demo",
      ownerHome: "Inicio",
      ownerClients: "Clientes",
      ownerPromos: "Promos",
      ownerAuto: "Automático",
      kpiTotalVisits: "Visitas totales",
      kpiReturning: "Clientes recurrentes",
      kpiCashbackGiven: "Cashback otorgado",
      kpiGoogleReviews: "Reseñas Google",
      sendPromoTitle: "Enviar notificación push inmediata",
      sendPromoDesc: "El mensaje llega directamente a la pantalla de bloqueo de los smartphones",
      targetAudience: "Audiencia objetivo",
      audienceAll: "Todos los clientes (100%)",
      audienceQuiet: "Clientes inactivos (+14 días)",
      audienceNear: "Cerca del premio",
      audienceVip: "Clientes VIP habituales",
      creditsCost: "Coste del envío",
      creditsBalance: "Tu saldo de créditos",
      sendBroadcastBtn: "Difundir notificación ahora",
      simulatingSuccess: "¡Notificación enviada con éxito a los teléfonos!",
    },
    engines: {
      radarTitle: "Radar inteligente de proximidad 100m",
      radarTag: "GPS nativo",
      radarDesc: "Cuando el cliente pasa a menos de 100m de tu negocio, su móvil despierta la pantalla con una notificación invitándole a entrar.",
      radarLockTitle: "¡Estás muy cerca! ☕️",
      radarLockBody: "Ven a visitarnos, tu tarjeta y tus beneficios están listos.",
      reviewsTitle: "Multiplica tus reseñas de 5 estrellas en Google",
      reviewsTag: "+340% reseñas",
      reviewsDesc: "Tras cada visita, una notificación invita al cliente a dejar una reseña de 5 estrellas en Google Maps con un solo clic.",
      reviewsLockTitle: "¿Cómo estuvo tu visita hoy? ⭐",
      reviewsLockBody: "Valóranos en Google en 10 segundos y ayúdanos a crecer.",
      winbackTitle: "Recuperación automática de clientes inactivos",
      winbackTag: "+28% de retorno",
      winbackDesc: "Si un cliente habitual no vuelve tras 15 días, el sistema le envía una oferta exclusiva automáticamente para que regrese.",
      winbackLockTitle: "¡Te echamos de menos! 🎁",
      winbackLockBody: "Vuelve esta semana y llévate doble sello o un descuento especial.",
      pushTitle: "Promociones directas a la pantalla de bloqueo",
      pushTag: "92% de apertura",
      pushDesc: "Supera los algoritmos de redes sociales y mensajes ignorados. Comunica tus ofertas directamente en el móvil de tus clientes.",
      pushLockTitle: "Oferta especial de fin de semana ⚡️",
      pushLockBody: "Disfruta de doble cashback del 20% en todas tus compras.",
    },
    compare: {
      title: "¿Por qué elegir Walink para tu negocio?",
      subtitle: "Comparativa entre las tarjetas clásicas y la solución Walink",
      colFeature: "Característica clave",
      colWalink: "Solución Walink",
      colPaper: "Tarjetas de papel",
      colApp: "App propia a medida",
      row1Feature: "Descargar una app de la tienda",
      row1Walink: "❌ Sin descargas (acceso en 5s)",
      row1Paper: "❌ Sin app",
      row1App: "⚠️ Obligatorio (90% de abandonos)",
      row2Feature: "Pérdida u olvido de tarjeta",
      row2Walink: "✅ Imposible (en Apple/Google Wallet)",
      row2Paper: "❌ 70% se pierden o se olvidan en casa",
      row2App: "⚠️ Se desinstala por falta de espacio",
      row3Feature: "Radar 100m en pantalla bloqueada",
      row3Walink: "✅ Integrado y automático",
      row3Paper: "❌ No existe",
      row3App: "⚠️ Requiere permisos de ubicación difíciles",
      row4Feature: "Recuperación de clientes inactivos",
      row4Walink: "✅ Automatizado sin tu intervención",
      row4Paper: "❌ Desconoces quién te visita",
      row4App: "⚠️ Muy costoso de mantener",
      row5Feature: "Coste e inversión",
      row5Walink: "✅ Pago único sin mensualidades",
      row5Paper: "⚠️ Reimpresiones continuas y caras",
      row5App: "❌ Desarrollo caro + mensualidades altas",
      roiTitle: "Calculadora de retorno de inversión",
      roiSubtitle: "Mueve los controles para estimar los ingresos adicionales gracias a tus clientes habituales",
      sliderVisitsLabel: "Número de clientes al día:",
      sliderTicketLabel: "Ticket medio por cliente (DH):",
      monthlyExtraRev: "Ingresos extra mensuales estimados:",
      yearlyExtraRev: "Ingresos extra anuales estimados:",
      paybackTime: "Amortización completa del pack:",
      paybackValue: "¡En menos de 14 días!",
    },
    pricing: {
      title: "Planes transparentes, sin cuotas mensuales",
      subtitle: "Paga una sola vez y recibe tu soporte NFC para mostrador y tus tarjetas digitales listas para funcionar",
      popularBadge: "El más solicitado ⭐",
      starterTitle: "Starter",
      starterPrice: "1,500 DH",
      starterDesc: "Ideal para cafeterías y pequeños comercios independientes",
      growthTitle: "Growth",
      growthPrice: "2,400 DH",
      growthDesc: "La opción más potente para fidelizar y multiplicar ventas",
      multiTitle: "Multi-Branch",
      multiPrice: "3,900 DH",
      multiDesc: "Para franquicias, cadenas y negocios con múltiples locales",
      orderStarterBtn: "Pedir pack Starter",
      orderGrowthBtn: "Pedir pack Growth (Recomendado)",
      orderMultiBtn: "Pedir pack Multi-Branch",
      creditsTitle: "¿Cómo funcionan los créditos en Walink?",
      creditsDesc: "Los sellos diarios, el cashback, las recompensas y las alertas por radar son 100% gratuitos e ilimitados. Los créditos solo se usan para enviar campañas promocionales masivas o reactivación de clientes inactivos (1 mensaje = 1 crédito), desde 100 DH por 500 mensajes.",
      careTitle: "Servicio anual Walink Care",
      careDesc: "El primer año está incluido gratis en el pack. A partir del segundo año, una cuota simbólica opcional de 390 DH/año cubre los servidores oficiales de Apple y Google y copias de seguridad de tus clientes.",
      featureStand: "Soporte de mostrador de acrílico prémium con chip NFC y QR de alta resolución",
      featureCards: "Tarjetas digitales ilimitadas en Apple Wallet y Google Wallet",
      featureRadar: "Radar de proximidad 100m en pantalla de bloqueo",
      featureReviews: "Impulsor de reseñas de 5 estrellas en Google Maps",
      featureCredits500: "500 créditos para notificaciones de regalo",
      featureCredits1000: "1.200 créditos para notificaciones de regalo",
      featureMultiBranches: "Soportes por cada sucursal + panel de control centralizado",
      featureDedicatedSupport: "Soporte técnico prioritario y acceso a novedades",
    },
    payment: {
      termsTitle: "Forma de pago segura (50/50)",
      termsDesc: "Trabajamos con total confianza mutua: 50% de anticipo al confirmar el pedido y validar el diseño digital, y el 50% restante a la entrega tras probar el soporte en tu negocio.",
      guaranteeTitle: "Garantías incluidas",
      g1: "Sesión formativa por videollamada para ti y tu equipo",
      g2: "Soporte técnico permanente por WhatsApp",
      g3: "Envío rápido y gratuito a todas las ciudades de Marruecos 🇲🇦",
    },
    faq: {
      title: "Preguntas frecuentes",
      subtitle: "Todo lo que necesitas saber sobre la plataforma Walink",
      q1: "¿El cliente necesita descargar alguna aplicación?",
      a1: "¡No, en absoluto! El cliente acerca su móvil o escanea el QR en 5 segundos. La tarjeta se instala directamente en Apple Wallet (iPhone) o Google Wallet (Android) y funciona sin conexión.",
      q2: "¿Cuál es la diferencia entre sellos y cashback?",
      a2: "El sistema de sellos premia la frecuencia (ej: 5 sellos = café gratis). El sistema cashback devuelve un porcentaje de cada compra (ej: 10%) como saldo en su tarjeta para descontar en futuras visitas. ¡Puedes activar uno o ambos!",
      q3: "¿Cómo funciona el radar de 100m sin internet?",
      a3: "Apple Wallet y Google Wallet están integrados en el GPS del teléfono. En cuanto el cliente se acerca a menos de 100m de tu local, la pantalla se despierta con tu notificación.",
      q4: "¿Qué es el soporte inteligente de mostrador?",
      a4: "Un soporte elegante de acrílico resistente con los colores de tu marca, chip NFC y código QR duradero para que los clientes se registren en un instante.",
      q5: "¿Cómo se gestiona el pago y la entrega?",
      a5: "50% al aprobar el diseño y 50% a la entrega tras verificar que funciona. El envío es gratuito a todo Marruecos.",
      q6: "¿Puedo probar el panel del comercio antes de comprar?",
      a6: "¡Claro que sí! Puedes probar la demo interactiva en esta página o explorar el portal real (/m/cafe-atlas) para comprobar la rapidez del escaneo.",
    },
    finalCta: {
      title: "¿Listo para impulsar las ventas de tu negocio?",
      desc: "Haz tu pedido hoy y aprovecha la oferta de lanzamiento. Tu soporte y tus tarjetas estarán listos en 48 horas.",
      btn: "Pedir mi pack ahora",
    },
    footer: {
      copyright: "Todos los derechos reservados para los emprendedores en Marruecos 🇲🇦",
      supportWa: "WhatsApp de soporte (+212 708 107 351)",
      adminLink: "Panel de administración",
      outreachLink: "Estudio de prospección",
    },
    checkout: {
      title: "Confirmar pedido Walink",
      subtitle: "Introduce los datos de tu negocio y nuestro equipo te contactará para ultimar el diseño",
      shopNameLabel: "Nombre de tu comercio o marca *",
      shopNamePlaceholder: "Ej: Café Atlas",
      nicheLabel: "Sector de actividad *",
      cityLabel: "Ciudad en Marruecos *",
      cityPlaceholder: "Selecciona tu ciudad...",
      phoneLabel: "Teléfono WhatsApp de contacto *",
      phonePlaceholder: "0661234567",
      planLabel: "Pack elegido:",
      summaryTitle: "Resumen del pedido:",
      confirmSubmitBtn: "Confirmar pedido por WhatsApp 💬",
      securityNote: "🔒 No se cobra nada ahora. Primero validaremos el diseño contigo.",
    },
    pass: {
      stampsLabel: "SELLOS",
      rewardLabel: "TU RECOMPENSA",
      cashbackRateLabel: "CASHBACK",
      balanceAvailable: "SALDO DISPONIBLE",
      onEveryPurchase: "en cada compra",
      memberCodeLabel: "N° SOCIO",
      lastVisitLabel: "Última visita",
      standScanCaption: "Escanea y obtén tu tarjeta",
      addToAppleWallet: "Añadir a Apple Wallet",
      addToGoogleWallet: "Añadir a Google Wallet",
      cashbackBanner: "💰 ¡Tienes {balance} {currency} de cashback disponible! Muestra este código QR en caja para canjearlo.",
      stampsProgress: "{stamps} de {total} sellos completados",
      stampAddedTitle: "¡Nuevo sello añadido! 🎉",
      stampAddedBody: "¡Gracias por tu visita! Solo faltan {left} sellos para tu recompensa.",
      rewardUnlockedTitle: "¡Felicidades! Recompensa desbloqueada 🎁",
      rewardUnlockedBody: "¡Tu tarjeta está completa! Muéstrala en caja para disfrutar de tu premio.",
      cashbackEarnedTitle: "¡Cashback acumulado! 💰",
      cashbackEarnedBody: "¡+{amount} {currency} ({rate}%) añadidos a tu saldo! Saldo actual: {balance} {currency}.",
      cashbackRedeemedTitle: "¡Cashback canjeado! 💸",
      cashbackRedeemedBody: "{amount} {currency} descontados de tu compra. Saldo restante: {balance} {currency}.",
      radarAlertTitle: "¡Estás muy cerca! 📍",
      radarAlertBody: "Tu tarjeta digital está lista con beneficios exclusivos, ¡pasa a vernos!",
      reviewAlertTitle: "¡Tu opinión nos importa! ⭐",
      reviewAlertBody: "Toca aquí para valorarnos en Google Maps en unos segundos.",
      activityDrawerTitle: "Historial y visitas",
      totalVisits: "Visitas totales:",
      totalEarned: "Total ahorrado:",
    },
    onboarding: {
      welcomeGiftStamps: "🎁 ¡Sello de bienvenida de regalo al unirte!",
      welcomeGiftCashback: "💰 ¡{amount} {currency} de cashback de bienvenida de regalo!",
      chooseProgram: "Elige tu programa de fidelización:",
      stampsProgramTitle: "🎁 Programa de Sellos y Premios",
      stampsProgramDesc: "Acumula {stamps} sellos y llévate {reward} gratis",
      cashbackProgramTitle: "💰 Programa Cashback ({rate}%)",
      cashbackProgramDesc: "Recupera el {rate}% de cada compra en saldo para tu tarjeta",
      nameLabel: "Nombre completo *",
      namePlaceholder: "Tu nombre y apellidos",
      phoneLabel: "Número de teléfono *",
      phonePlaceholder: "0661234567",
      birthdayLabel: "Fecha de nacimiento (opcional para regalos de cumpleaños)",
      submitBtn: "Obtener mi tarjeta digital ahora",
      alreadyMember: "¿Ya eres miembro?",
      existingCustomerNotice: "¡Nos alegra verte de nuevo! Encontramos tu tarjeta anterior.",
      goToPass: "Acceder a mi tarjeta",
    },
    merchant: {
      pinTitle: "Panel del Comercio",
      pinPrompt: "Introduce tu código PIN secreto para acceder a la caja",
      pinLoginBtn: "Iniciar sesión",
      pinError: "Código PIN incorrecto. Inténtalo de nuevo.",
      badgeStamps: "🎁 Tarjeta Sellos",
      badgeCashback: "💰 Tarjeta Cashback",
      scannerBtn: "Abrir escáner de cámara (QR)",
      manualLookup: "O buscar por N° de socio o teléfono:",
      searchPlaceholder: "Teléfono o código de 4 dígitos...",
      addStampBtn: "+ Añadir sello al cliente",
      redeemRewardBtn: "🎁 Entregar recompensa y reiniciar",
      earnCashbackTab: "➕ Añadir cashback (nueva compra)",
      redeemCashbackTab: "💸 Canjear / descontar saldo",
      billAmountLabel: "Importe total de la compra ({currency}) *",
      calculatePreview: "Se añadirán +{amount} {currency} ({rate}%) al saldo del cliente",
      confirmEarnBtn: "Confirmar y añadir +{amount} {currency}",
      redeemAmountLabel: "Importe a descontar ({currency}) *",
      redeemFullBtn: "Canjear todo el saldo ({amount} {currency})",
      remainingToPay: "Restante a pagar en caja: {amount} {currency}",
      confirmRedeemBtn: "Confirmar deducción de -{amount} {currency}",
      switchProgramBtn: "Cambiar programa ⇄",
      switchConfirm: "¿Deseas cambiar el programa de este cliente entre Sellos y Cashback?",
      currentBalance: "Saldo disponible:",
      lifetimeVisits: "Visitas acumuladas:",
      crmTitle: "Listado de clientes",
      statusActive: "Activo",
      statusQuiet: "Inactivo",
      statusVip: "VIP",
    },
    admin: {
      title: "Consola de administración - Walink",
      subtitle: "Gestión de comercios, tarjetas, campañas y prospección",
      newMerchantBtn: "+ Añadir nuevo comercio",
      automationsLink: "Centro de automatizaciones y cron",
      outreachLink: "Estudio de prospección comercial",
      loyaltyModeLabel: "Modelo de fidelización del local:",
      modeBoth: "Ambos sistemas (el cliente elige al registrarse)",
      modeStamps: "Solo sellos y recompensas",
      modeCashback: "Solo cashback (%)",
      cashbackRateLabel: "Porcentaje de cashback (%)",
      welcomeCashbackLabel: "Bono de bienvenida cashback (DH)",
      minRedeemLabel: "Mínimo para canjear (DH)",
      currencyLabel: "Moneda",
      previewStamps: "Vista previa Tarjeta Sellos",
      previewCashback: "Vista previa Tarjeta Cashback",
    },
    niches: {
      cafe: {
        name: "Cafetería / Salón de té",
        label: "Cafetería",
        reward: "Café gratis",
        prefix: "Estimado cliente",
        defaultShop: "Café Atlas",
      },
      barber: {
        name: "Barbería / Peluquería",
        label: "Barbería",
        reward: "Corte de pelo gratis",
        prefix: "Estimado cliente",
        defaultShop: "Barbería Anas",
      },
      snack: {
        name: "Restaurante / Hamburguesería",
        label: "Restaurante",
        reward: "Comida gratis",
        prefix: "Estimado cliente",
        defaultShop: "Burger House",
      },
      wash: {
        name: "Lavado de coches & detailing",
        label: "Lavado de coches",
        reward: "Lavado completo gratis",
        prefix: "Estimado cliente",
        defaultShop: "Auto Spa Express",
      },
      beauty: {
        name: "Centro de belleza & estética",
        label: "Salón de belleza",
        reward: "Tratamiento facial gratis",
        prefix: "Estimada clienta",
        defaultShop: "Beauty Lounge",
      },
      laundry: {
        name: "Lavandería & Tintorería",
        label: "Lavandería",
        reward: "Lavado gratis",
        prefix: "Estimado cliente",
        defaultShop: "Pressing Royal",
      },
      other: {
        name: "Otro comercio minorista",
        label: "Comercio",
        reward: "Regalo exclusivo",
        prefix: "Estimado cliente",
        defaultShop: "Boutique Elegance",
      },
    },
  },
};


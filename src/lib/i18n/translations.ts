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
    ownerSettings: string;
    saveChanges: string;
    saving: string;
    savedSuccess: string;
    unsavedChanges: string;
    storeLocation: string;
    detectGps: string;
    mapPreview: string;
    googleMapsUrl: string;
    radarMessage: string;
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
    addTemplate: string;
    saveAsTemplate: string;
    noTemplatesYet: string;
    createTemplateTitle: string;
    templateName: string;
    templateText: string;
    presetSuggestions: string;
    deleteTemplate: string;
    notificationMessage: string;
    notificationPlaceholder: string;
    templateSavedSuccess: string;
    templateDeletedSuccess: string;
    allBranches: string;
    branch: string;
    selectBranch: string;
    addBranch: string;
    editBranch: string;
    deleteBranch: string;
    manageBranches: string;
    branchName: string;
    mainBranch: string;
    setAsMainBranch: string;
    branchLocationSaved: string;
    branchDeleted: string;
    branchStatsComparison: string;
    branchActivityBreakdown: string;
    branchVisitsLabel: string;
    currentDeviceBranch: string;
    changeDeviceBranch: string;
  };
  engines: {
    sectionTitle: string;
    sectionSubtitle: string;
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
    costCompareTitle: string;
    costCompareSubtitle: string;
    costSavingsCallout: string;
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
    supportLink: string;
    privacyLink: string;
    termsLink: string;
    homeLink: string;
    brandTagline: string;
    moroccoBadge: string;
    colPlatform: string;
    colPricing: string;
    colEssential: string;
    colAdmin: string;
    colSamples: string;
    demoLink: string;
    enginesLink: string;
    radarLink: string;
    standLink: string;
    roiLink: string;
    faqLink: string;
    starterPack: string;
    growthPack: string;
    multiPack: string;
    sampleCardLink: string;
    sampleJoinLink: string;
    adminLoginLink: string;
    cndpNotice: string;
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
    sidebar: {
      mainMenu: string;
      dashboard: string;
      dashboardDesc: string;
      automations: string;
      automationsDesc: string;
      outreach: string;
      outreachDesc: string;
      newMerchant: string;
      newMerchantDesc: string;
      serverStatus: string;
      serverConnected: string;
      serverNode: string;
      quickLinks: string;
      developerPortal: string;
      support: string;
      terms: string;
      privacy: string;
      logout: string;
      closeMenu: string;
      openMenu: string;
      superAdminSuite: string;
      viewWebsite: string;
      navHome: string;
      navAutomations: string;
      navOutreach: string;
      navNewMerchant: string;
      addShort: string;
    };
    dashboard: {
      pageTitle: string;
      pageSubtitle: string;
      kpiMerchants: string;
      kpiMerchantsActive: string;
      kpiMerchantsSub: string;
      kpiCustomers: string;
      kpiCustomersUnit: string;
      kpiCustomersSub: string;
      kpiTransactions: string;
      kpiTransactionsUnit: string;
      kpiTransactionsSub: string;
      kpiCredits: string;
      kpiCreditsUnit: string;
      kpiCreditsSub: string;
      searchPlaceholder: string;
      allNiches: string;
      allPlans: string;
      merchantsListTitle: string;
      noMerchants: string;
      noMerchantsDesc: string;
      addMerchantBtn: string;
      clients: string;
      visits: string;
      credits: string;
      reward: string;
      stampsRequired: string;
      stampsCount: string;
      topupCredits: string;
      standNfc: string;
      viewLivePass: string;
      registerFirstCustomer: string;
      merchantDashboard: string;
      customerLink: string;
      editMerchant: string;
      enableMerchant: string;
      disableMerchant: string;
      activeStatus: string;
      inactiveStatus: string;
      pinLabel: string;
      nicheCafe: string;
      nicheBarber: string;
      nicheSnack: string;
      nicheWash: string;
      nicheBeauty: string;
      nicheLaundry: string;
      nicheOther: string;
      planStarter: string;
      planGrowth: string;
      planMulti: string;
    };
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
  enterprise: {
    worksWithApple: string;
    googleWalletCertified: string;
    nfcForumStandard: string;
    bankGradeSecurity: string;
    infraTitle: string;
    infraSubtitle: string;
    uptimeTitle: string;
    uptimeDesc: string;
    latencyTitle: string;
    latencyDesc: string;
    securityTitle: string;
    securityDesc: string;
    capacityTitle: string;
    capacityDesc: string;
  };
  walletEnterprise: {
    staff: {
      loginTitle: string;
      ownerHint: string;
      staffHint: string;
      currentStaff: string;
      switchAccount: string;
      recentShiftScans: string;
      cooldownWarning: string;
      overrideCooldown: string;
      byStaff: string;
      manageStaff: string;
      staffName: string;
      staffPin: string;
      addStaff: string;
      cooldownMinutes: string;
    };
    vip: {
      badge: string;
      congratsTitle: string;
      congratsBody: string;
      vipBonusNotice: string;
    };
    referral: {
      title: string;
      stampsDesc: string;
      cashbackDesc: string;
      inviteFriend: string;
      copyLink: string;
      linkCopied: string;
      friendsJoined: string;
      referredBanner: string;
      rewardEarned: string;
    };
    backPass: {
      menu: string;
      whatsapp: string;
      instagram: string;
      directions: string;
      terms: string;
      flipPass: string;
    };
    security: {
      dynamicQr: string;
      nfcScan: string;
      nfcWaiting: string;
      nfcUnsupported: string;
    };
    csv: {
      export: string;
      import: string;
      importModalTitle: string;
      importPlaceholder: string;
      importBtn: string;
      importSuccess: string;
    };
  };
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
      ownerSettings: "الإعدادات",
      saveChanges: "حفظ التغييرات",
      saving: "جاري الحفظ...",
      savedSuccess: "تم الحفظ بنجاح",
      unsavedChanges: "تغييرات غير محفوظة",
      storeLocation: "الموقع الجغرافي للمحل",
      detectGps: "تحديد موقعي الحالي (GPS)",
      mapPreview: "معاينة الموقع على الخريطة",
      googleMapsUrl: "رابط خرائط جوجل (Google Maps)",
      radarMessage: "رسالة إشعار رادار 100 متر",
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
      addTemplate: "إضافة قالب",
      saveAsTemplate: "📌 حفظ هذا النص كقالب",
      noTemplatesYet: "لا توجد قوالب محفوظة للمتجر بعد",
      createTemplateTitle: "إنشاء قالب عرض ترويجي",
      templateName: "اسم القالب (مختصر)",
      templateText: "نص العرض / الإشعار",
      presetSuggestions: "💡 قوالب مقترحة بنقرة واحدة",
      deleteTemplate: "حذف القالب",
      notificationMessage: "نص الإشعار",
      notificationPlaceholder: "اكتب نص الإشعار هنا بحرية، أو اختر قالباً أعلاه...",
      templateSavedSuccess: "تم حفظ القالب بنجاح",
      templateDeletedSuccess: "تم حذف القالب",
      allBranches: "جميع الفروع (إجمالي)",
      branch: "الفرع",
      selectBranch: "اختر الفرع",
      addBranch: "إضافة فرع جديد",
      editBranch: "تعديل الفرع",
      deleteBranch: "حذف الفرع",
      manageBranches: "إدارة الفروع والمواقع",
      branchName: "اسم الفرع",
      mainBranch: "الفرع الرئيسي",
      setAsMainBranch: "تعيين كفرع رئيسي",
      branchLocationSaved: "تم حفظ بيانات الفرع بنجاح",
      branchDeleted: "تم حذف الفرع",
      branchStatsComparison: "مقارنة أداء الفروع",
      branchActivityBreakdown: "توزيع الزيارات حسب الفروع",
      branchVisitsLabel: "زيارات الفرع",
      currentDeviceBranch: "الفرع الحالي على هذا الجهاز",
      changeDeviceBranch: "تغيير فرع هذا الجهاز",
    },
    engines: {
      sectionTitle: "4 محركات نمو ذكية تعمل في الخلفية لمضاعفة مبيعاتك",
      sectionSubtitle: "آليات أوتوماتيكية مدمجة في Apple Wallet و Google Wallet تعمل بدون تدخلك لضمان عودة الزبائن ورفع مبيعاتك بنسبة تفوق 30%",
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
      row1Walink: "✅ بدون تحميل أي تطبيق (فتح فوري في 5 ثوانٍ)",
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
      roiTitle: "حاسبة العائد الاستثماري والأرباح الإضافية",
      roiSubtitle: "حرّك المؤشرات لتقدير الأرباح الإضافية الشهرية والسنوية التي ستجنيها بفضل عودة زبائنك",
      costCompareTitle: "مقارنة التكلفة وتوفير الميزانية السنوية",
      costCompareSubtitle: "لماذا تدفع اشتراكات شهرية متكررة وتطويراً مكلفاً بينما تمنحك Walink حلاً دائماً بدفعة واحدة؟",
      costSavingsCallout: "وفر أكثر من 12,000 درهم في السنة الأولى وحدها مقارنة ببرمجة تطبيق خاص! 🎉",
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
      supportWa: "واتساب الدعم (+212 661 848 790)",
      adminLink: "لوحة الإدارة المركزية",
      outreachLink: "استوديو استقطاب المتاجر",
      supportLink: "الدعم الفني وخدمة العملاء",
      privacyLink: "سياسة الخصوصية",
      termsLink: "شروط الاستخدام",
      homeLink: "الصفحة الرئيسية",
      brandTagline: "المنصة المغربية الأولى لبطاقات الوفاء الذكية في Apple Wallet و Google Wallet بدون تطبيقات وبدون اشتراكات شهرية.",
      moroccoBadge: "صُمم وطُوّر بكل فخر للمقاهي والمطاعم والمتاجر بالمغرب 🇲🇦",
      colPlatform: "المنصة والمميزات",
      colPricing: "الباقات والأسعار",
      colEssential: "الصفحات الأساسية والدعم",
      colAdmin: "الإدارة والنظام",
      colSamples: "المعاينة الحية",
      demoLink: "الديمو التفاعلي المباشر",
      enginesLink: "محركات النمو الـ 4",
      radarLink: "رادار القرب 100 متر (GPS)",
      standLink: "ستاند الكاونتر الذكي (NFC)",
      roiLink: "حاسبة العائد الاستثماري",
      faqLink: "الأسئلة الشائعة",
      starterPack: "باقة الانطلاق (1,200 درهم)",
      growthPack: "باقة النمو الأكثر طلباً (2,400 درهم)",
      multiPack: "باقة الفروع المتعددة (4,500 درهم)",
      sampleCardLink: "معاينة بطاقة ولاء حية",
      sampleJoinLink: "تجربة تسجيل عميل",
      adminLoginLink: "تسجيل دخول الإدارة",
      cndpNotice: "مطابق لمعايير حماية المعطيات ذات الطابع الشخصي بالمغرب (القانون رقم 09-08)",
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
      outreachLink: "استوديو المبيعات واستقطاب العملاء",
      loyaltyModeLabel: "نظام الولاء المعتمد للمتجر:",
      modeBoth: "النظامان معاً (العميل يختار عند التسجيل)",
      modeStamps: "نظام الأختام والمكافآت فقط",
      modeCashback: "نظام الكاش باك (%) فقط",
      cashbackRateLabel: "نسبة الكاش باك (%)",
      welcomeCashbackLabel: "هدية الترحيب للكاش باك (DH)",
      minRedeemLabel: "الحد الأدنى لصرف الكاش باك (DH)",
      currencyLabel: "رمز العملة",
      previewStamps: "معاينة بطاقة الأختام",
      previewCashback: "معاينة بطاقة الكاش باك",
      sidebar: {
        mainMenu: "القائمة الرئيسية",
        dashboard: "لوحة التحكم المركزية",
        dashboardDesc: "نظرة عامة على المتاجر والأرصدة",
        automations: "محرك الأتمتة والذكاء",
        automationsDesc: "رادار القرب، التقييمات، والإشعارات",
        outreach: "استوديو المبيعات والتسويق",
        outreachDesc: "توليد كروت الهبوط وحملات العملاء",
        newMerchant: "إضافة متجر جديد",
        newMerchantDesc: "تسجيل كافيه، مطعم أو صالون",
        serverStatus: "خادم الإنتاج",
        serverConnected: "متصل 99.9%",
        serverNode: "Casablanca Node 22 (Hostinger Cloud)",
        quickLinks: "بوابة الزوار والروابط السريعة",
        developerPortal: "بوابة المطورين والرئيسية",
        support: "مركز الدعم الفني",
        terms: "شروط الخدمة",
        privacy: "سياسة الخصوصية",
        logout: "تسجيل الخروج من المنصة",
        closeMenu: "إغلاق القائمة",
        openMenu: "فتح القائمة الجانبية",
        superAdminSuite: "Super Admin Suite v2.5",
        viewWebsite: "عرض الموقع",
        navHome: "الرئيسية",
        navAutomations: "الأتمتة",
        navOutreach: "المبيعات",
        navNewMerchant: "متجر جديد",
        addShort: "متجر",
      },
      dashboard: {
        pageTitle: "لوحة الإدارة المركزية (Super Admin)",
        pageSubtitle: "متابعة شاملة لجميع المتاجر، البطاقات المفعلة، والأرصدة في المغرب 🇲🇦",
        kpiMerchants: "إجمالي المتاجر المشتركة",
        kpiMerchantsActive: "نشط حالياً",
        kpiMerchantsSub: "المقاهي، المطاعم، وصالونات الحلاقة",
        kpiCustomers: "إجمالي البطاقات المفعلة",
        kpiCustomersUnit: "عميل دائم",
        kpiCustomersSub: "عبر Apple Wallet و Google Wallet و Web Pass",
        kpiTransactions: "مجموع الزيارات والأختام",
        kpiTransactionsUnit: "عملية مسجلة",
        kpiTransactionsSub: "أختام مضافة ومكافآت مستفاد منها",
        kpiCredits: "رصيد النقاط الموزع",
        kpiCreditsUnit: "رصيد متاح",
        kpiCreditsSub: "جاهز لإشعارات الرادار وحملات الاسترجاع",
        searchPlaceholder: "بحث باسم المتجر، الرابط (Slug)، أو المدينة...",
        allNiches: "كل الأنشطة التجارية",
        allPlans: "كل الباقات",
        merchantsListTitle: "قائمة المتاجر الشريكة",
        noMerchants: "لا توجد متاجر مطابقة",
        noMerchantsDesc: "جرّب تغيير كلمات البحث أو الفلاتر، أو قم بإضافة متجر جديد الآن.",
        addMerchantBtn: "متجر جديد",
        clients: "العملاء",
        visits: "الزيارات",
        credits: "الرصيد",
        reward: "المكافأة:",
        stampsRequired: "الأختام المطلوبة:",
        stampsCount: "أختام",
        topupCredits: "شحن الرصيد",
        standNfc: "حامل الطاولة (NFC)",
        viewLivePass: "معاينة بطاقة حية (Live Pass)",
        registerFirstCustomer: "تسجيل أول عميل للبطاقة",
        merchantDashboard: "لوحة المتجر",
        customerLink: "رابط العملاء",
        editMerchant: "تعديل",
        enableMerchant: "تفعيل المتجر",
        disableMerchant: "تعطيل المتجر",
        activeStatus: "نشط",
        inactiveStatus: "معطل",
        pinLabel: "رمز PIN:",
        nicheCafe: "المقاهي (Café)",
        nicheBarber: "الحلاقة (Barber)",
        nicheSnack: "المطاعم والوجبات السريعة (Snack)",
        nicheWash: "غسيل السيارات (Car Wash)",
        nicheBeauty: "صالونات التجميل (Beauty)",
        nicheLaundry: "المصابن (Laundry)",
        nicheOther: "أنشطة أخرى",
        planStarter: "باقة STARTER",
        planGrowth: "باقة GROWTH",
        planMulti: "باقة MULTI",
      },
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
    enterprise: {
      worksWithApple: "متوافق رسمياً مع Apple Wallet",
      googleWalletCertified: "معتمد على Google Wallet",
      nfcForumStandard: "معيار NFC Contactless العالمي",
      bankGradeSecurity: "تشفير بنكي مصفح 256-Bit AES",
      infraTitle: "بنية تحتية بمواصفات الشركات العالمية",
      infraSubtitle: "تم تصميم منصة والينك لتعمل بأقصى درجات الاستقرار والسرعة والأمان المصرفي للمتاجر والمؤسسات الكبرى.",
      uptimeTitle: "99.99% نسبة الجاهزية (SLA)",
      uptimeDesc: "سيرفرات سحابية عالية التوافر تضمن عمل بطاقات العملاء على مدار الساعة دون أي انقطاع.",
      latencyTitle: "< 45ms زمن المعالجة",
      latencyDesc: "مسح فوري واستجابة لحظية في أجزاء من الثانية لضمان انسيابية العمل في أوقات الذروة.",
      securityTitle: "تشفير بنكي مصفح 256-bit",
      securityDesc: "حماية تامة لبيانات المتاجر والزبائن مع الامتثال الكامل لمعايير الخصوصية الدولية.",
      capacityTitle: "+100,000 عملية متزامنة",
      capacityDesc: "بنية تحتية مرنة تستوعب كبرى السلاسل والمتاجر المتعددة الفروع بكل سلاسة واقتدار.",
    },
    walletEnterprise: {
      staff: {
        loginTitle: "تسجيل الدخول برمز PIN",
        ownerHint: "دخول المدير: 1234",
        staffHint: "دخول الموظف (أمين): 1111",
        currentStaff: "الموظف الحالي",
        switchAccount: "تبديل الحساب",
        recentShiftScans: "آخر العمليات في هذه الوردية",
        cooldownWarning: "⚠️ حماية من التلاعب: تم مسح بطاقة هذا العميل قبل بضع دقائق! يرجى الانتظار أو تأكيد العملية بصلاحية المدير.",
        overrideCooldown: "تجاوز القفل وتأكيد العملية (صلاحية المدير)",
        byStaff: "بواسطة",
        manageStaff: "إدارة طاقم العمل والكاشير",
        staffName: "اسم الموظف",
        staffPin: "رمز PIN (4 أرقام)",
        addStaff: "إضافة موظف جديد",
        cooldownMinutes: "فترة الحماية بين عمليات المسح (بالدقائق)",
      },
      vip: {
        badge: "👑 VIP GOLD",
        congratsTitle: "👑 ترقية لفئة VIP الذهبية!",
        congratsBody: "👑 تهانينا! لقد تمت ترقية بطاقتك إلى فئة VIP الذهبية مع مزايا ومكافآت مضاعفة!",
        vipBonusNotice: "ميزة VIP: نسبة كاش باك إضافية",
      },
      referral: {
        title: "🎁 شارك مع صديق واربح",
        stampsDesc: "أهدِ صديقك بطاقة واحصل على ختم مجاني فور تسجيله!",
        cashbackDesc: "أهدِ صديقك بطاقة واحصل على +{bonus} {currency} رصيد كاش باك مجاني فور تسجيله!",
        inviteFriend: "مشاركة عبر واتساب",
        copyLink: "نسخ الرابط",
        linkCopied: "تم النسخ!",
        friendsJoined: "الأصدقاء المسجلون",
        referredBanner: "🎁 تمت دعوتك من طرف صديق! سجل الآن واحصل على هديتك الترحيبية.",
        rewardEarned: "🎉 قام صديقك {name} بالتسجيل عبر رابطك! تمت إضافة مكافأة الإحالة إلى بطاقتك.",
      },
      backPass: {
        menu: "📖 القائمة / المنيو الرقمي",
        whatsapp: "💬 تواصل عبر واتساب",
        instagram: "📸 حساب إنستغرام",
        directions: "📍 الموقع والاتجاهات",
        terms: "📜 شروط الاستخدام",
        flipPass: "🔄 تفاصيل وروابط المتجر",
      },
      security: {
        dynamicQr: "🔒 رمز QR مشفر ومتجدد كل 60 ثانية (محمي ضد تصوير الشاشة)",
        nfcScan: "📲 مسح عبر NFC (قرب هاتف العميل)",
        nfcWaiting: "يرجى تقريب هاتف العميل من خلفية الجهاز...",
        nfcUnsupported: "تقنية NFC غير مدعومة على هذا المتصفح، جاري فتح كاميرا المسح...",
      },
      csv: {
        export: "📥 تصدير CSV",
        import: "📤 استيراد CSV",
        importModalTitle: "استيراد وتفعيل بطاقات العملاء دفعة واحدة (CSV)",
        importPlaceholder: "أدخل أسطر العملاء بالشكل: الاسم,رقم الهاتف\nمثال:\nمحمد علوي,0661223344\nسناء بناني,0665778899",
        importBtn: "بدء الاستيراد وإنشاء البطاقات",
        importSuccess: "تم استيراد وإنشاء {count} بطاقة عميل بنجاح!",
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
      ownerSettings: "Paramètres",
      saveChanges: "Enregistrer les modifications",
      saving: "Enregistrement...",
      savedSuccess: "Enregistré avec succès",
      unsavedChanges: "Modifications non enregistrées",
      storeLocation: "Emplacement du commerce",
      detectGps: "Détecter ma position (GPS)",
      mapPreview: "Voir sur la carte",
      googleMapsUrl: "Lien Google Maps",
      radarMessage: "Message de notification radar 100m",
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
      addTemplate: "Ajouter un modèle",
      saveAsTemplate: "📌 Enregistrer comme modèle",
      noTemplatesYet: "Aucun modèle enregistré pour cette boutique",
      createTemplateTitle: "Créer un modèle de promotion",
      templateName: "Nom du modèle",
      templateText: "Texte de la promo",
      presetSuggestions: "💡 Suggestions prêtes en un clic",
      deleteTemplate: "Supprimer le modèle",
      notificationMessage: "Texte de la notification",
      notificationPlaceholder: "Écrivez votre message librement ou choisissez un modèle...",
      templateSavedSuccess: "Modèle enregistré avec succès",
      templateDeletedSuccess: "Modèle supprimé",
      allBranches: "Toutes les succursales (Total)",
      branch: "Succursale",
      selectBranch: "Sélectionner la succursale",
      addBranch: "Ajouter une succursale",
      editBranch: "Modifier la succursale",
      deleteBranch: "Supprimer la succursale",
      manageBranches: "Gestion des succursales et adresses",
      branchName: "Nom de la succursale",
      mainBranch: "Succursale principale",
      setAsMainBranch: "Définir comme principale",
      branchLocationSaved: "Coordonnées de la succursale enregistrées",
      branchDeleted: "Succursale supprimée",
      branchStatsComparison: "Comparatif des performances par succursale",
      branchActivityBreakdown: "Répartition des visites par succursale",
      branchVisitsLabel: "Visites de la succursale",
      currentDeviceBranch: "Succursale active sur cet appareil",
      changeDeviceBranch: "Changer la succursale de cet appareil",
    },
    engines: {
      sectionTitle: "4 moteurs de croissance automatisés pour décupler vos ventes",
      sectionSubtitle: "Des automatisations natives dans Apple Wallet et Google Wallet qui réactivent vos clients et augmentent vos revenus en continu.",
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
      row1Walink: "✅ Aucune application à télécharger (accès direct en 5s)",
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
      roiTitle: "Simulateur de rentabilité & revenus additionnels",
      roiSubtitle: "Ajustez les curseurs pour estimer le chiffre d'affaires additionnel généré par vos clients fidélisés",
      costCompareTitle: "Comparatif des coûts & économies annuelles",
      costCompareSubtitle: "Pourquoi payer un abonnement mensuel et du développement sur-mesure coûteux quand Walink vous offre une solution clé en main à vie ?",
      costSavingsCallout: "Économisez plus de 12 000 DH dès la première année par rapport à une application sur-mesure ! 🎉",
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
      supportWa: "Support WhatsApp (+212 661 848 790)",
      adminLink: "Console d'administration",
      outreachLink: "Studio de prospection",
      supportLink: "Support & Centre d'aide",
      privacyLink: "Politique de confidentialité",
      termsLink: "Conditions d'utilisation",
      homeLink: "Accueil",
      brandTagline: "La 1ère plateforme marocaine de cartes de fidélité intelligentes sur Apple Wallet et Google Wallet, sans application et sans abonnement mensuel.",
      moroccoBadge: "Conçu et développé avec passion pour les commerces au Maroc 🇲🇦",
      colPlatform: "Plateforme & Outils",
      colPricing: "Tarifs & Packs",
      colEssential: "Pages Essentielles & Support",
      colAdmin: "Administration",
      colSamples: "Aperçus en Direct",
      demoLink: "Démo Interactive en Direct",
      enginesLink: "Les 4 Moteurs de Croissance",
      radarLink: "Radar de Proximité 100m (GPS)",
      standLink: "Chevalet de Comptoir Connecté (NFC)",
      roiLink: "Calculateur de Rentabilité (ROI)",
      faqLink: "Foire Aux Questions (FAQ)",
      starterPack: "Pack Starter (1 200 DH)",
      growthPack: "Pack Croissance Populaire (2 400 DH)",
      multiPack: "Pack Multi-Points de Vente (4 500 DH)",
      sampleCardLink: "Aperçu Carte en Direct",
      sampleJoinLink: "Expérience Inscription Client",
      adminLoginLink: "Connexion Super Admin",
      cndpNotice: "Conforme aux normes de protection des données personnelles au Maroc (Loi 09-08 / CNDP)",
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
      sidebar: {
        mainMenu: "MENU PRINCIPAL",
        dashboard: "Tableau de Bord Central",
        dashboardDesc: "Vue d'ensemble des commerces et soldes",
        automations: "Moteur d'Automatisation & IA",
        automationsDesc: "Radar de proximité, avis et push",
        outreach: "Studio Commercial & Prospection",
        outreachDesc: "Génération de stands et campagnes",
        newMerchant: "Ajouter un Nouveau Commerce",
        newMerchantDesc: "Enregistrer un café, restaurant ou salon",
        serverStatus: "Serveur de Production",
        serverConnected: "Connecté 99.9%",
        serverNode: "Casablanca Node 22 (Hostinger Cloud)",
        quickLinks: "PORTAIL VISITEURS & LIENS",
        developerPortal: "Portail Développeurs & Accueil",
        support: "Centre de Support Technique",
        terms: "Conditions d'Utilisation",
        privacy: "Politique de Confidentialité",
        logout: "Se déconnecter de la plateforme",
        closeMenu: "Fermer le menu",
        openMenu: "Ouvrir le menu latéral",
        superAdminSuite: "Super Admin Suite v2.5",
        viewWebsite: "Voir le site",
        navHome: "Accueil",
        navAutomations: "Automatisations",
        navOutreach: "Prospection",
        navNewMerchant: "Nouveau",
        addShort: "Commerce",
      },
      dashboard: {
        pageTitle: "Console d'Administration Centrale (Super Admin)",
        pageSubtitle: "Suivi global de tous les commerces, cartes activées et soldes au Maroc 🇲🇦",
        kpiMerchants: "Total Commerces Partenaires",
        kpiMerchantsActive: "actifs actuellement",
        kpiMerchantsSub: "Cafés, restaurants et salons de coiffure",
        kpiCustomers: "Total Cartes Activées",
        kpiCustomersUnit: "clients fidèles",
        kpiCustomersSub: "Via Apple Wallet, Google Wallet & Web Pass",
        kpiTransactions: "Total Visites & Tampons",
        kpiTransactionsUnit: "opérations enregistrées",
        kpiTransactionsSub: "Tampons attribués et récompenses utilisées",
        kpiCredits: "Solde de Crédits Distribué",
        kpiCreditsUnit: "crédits disponibles",
        kpiCreditsSub: "Prêt pour les alertes radar et campagnes",
        searchPlaceholder: "Rechercher par nom de commerce, slug ou ville...",
        allNiches: "Toutes les activités",
        allPlans: "Tous les forfaits",
        merchantsListTitle: "Liste des Commerces Partenaires",
        noMerchants: "Aucun commerce correspondant",
        noMerchantsDesc: "Modifiez vos filtres ou ajoutez un nouveau commerce maintenant.",
        addMerchantBtn: "Nouveau commerce",
        clients: "Clients",
        visits: "Visites",
        credits: "Crédits",
        reward: "Récompense :",
        stampsRequired: "Tampons requis :",
        stampsCount: "tampons",
        topupCredits: "Recharger le solde",
        standNfc: "Chevalet (NFC)",
        viewLivePass: "Voir carte test (Live Pass)",
        registerFirstCustomer: "Enregistrer premier client",
        merchantDashboard: "Portail commerçant",
        customerLink: "Lien clients",
        editMerchant: "Modifier",
        enableMerchant: "Activer le commerce",
        disableMerchant: "Désactiver le commerce",
        activeStatus: "Actif",
        inactiveStatus: "Désactivé",
        pinLabel: "Code PIN :",
        nicheCafe: "Cafés (Café)",
        nicheBarber: "Salons de coiffure (Barber)",
        nicheSnack: "Restauration rapide (Snack)",
        nicheWash: "Lavage auto (Car Wash)",
        nicheBeauty: "Instituts de beauté (Beauty)",
        nicheLaundry: "Pressings (Laundry)",
        nicheOther: "Autres activités",
        planStarter: "Forfait STARTER",
        planGrowth: "Forfait GROWTH",
        planMulti: "Forfait MULTI",
      },
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
    enterprise: {
      worksWithApple: "Compatible officiel Apple Wallet",
      googleWalletCertified: "Certifié Google Wallet",
      nfcForumStandard: "Norme mondiale NFC Contactless",
      bankGradeSecurity: "Chiffrement bancaire 256-Bit AES",
      infraTitle: "Infrastructure de classe Entreprise",
      infraSubtitle: "Walink est conçu pour offrir une stabilité maximale, une vitesse ultra-rapide et une sécurité bancaire aux grandes enseignes.",
      uptimeTitle: "99.99% Disponibilité garantie (SLA)",
      uptimeDesc: "Serveurs cloud haute disponibilité garantissant le fonctionnement continu de vos cartes sans interruption.",
      latencyTitle: "< 45ms Temps de réponse",
      latencyDesc: "Scan instantané et réaction en millisecondes pour fluidifier l'encaissement aux heures de pointe.",
      securityTitle: "Chiffrement bancaire 256-bit",
      securityDesc: "Protection intégrale des données des commerces et des clients conforme aux normes RGPD.",
      capacityTitle: "+100 000 Opérations simultanées",
      capacityDesc: "Architecture évolutive capable de gérer les plus grands réseaux de franchise en toute sérénité.",
    },
    walletEnterprise: {
      staff: {
        loginTitle: "Connexion par code PIN",
        ownerHint: "Accès Directeur : 1234",
        staffHint: "Accès Employé (Amine) : 1111",
        currentStaff: "Employé actuel",
        switchAccount: "Changer de compte",
        recentShiftScans: "Opérations récentes du service",
        cooldownWarning: "⚠️ Protection anti-fraude : Cette carte a déjà été scannée récemment ! Veuillez patienter ou valider avec les droits Directeur.",
        overrideCooldown: "Ignorer le délai et valider (Directeur)",
        byStaff: "Par",
        manageStaff: "Gestion du personnel et caisse",
        staffName: "Nom de l'employé",
        staffPin: "Code PIN (4 chiffres)",
        addStaff: "Ajouter un employé",
        cooldownMinutes: "Délai anti-fraude entre scans (minutes)",
      },
      vip: {
        badge: "👑 VIP GOLD",
        congratsTitle: "👑 Statut VIP Gold débloqué !",
        congratsBody: "👑 Félicitations ! Votre carte est passée au statut VIP Gold avec des avantages exclusifs !",
        vipBonusNotice: "Avantage VIP : Taux de cashback bonifié",
      },
      referral: {
        title: "🎁 Parrainez un ami et gagnez",
        stampsDesc: "Offrez une carte à un ami et recevez un tampon gratuit dès son inscription !",
        cashbackDesc: "Offrez une carte à un ami et recevez +{bonus} {currency} de cashback dès son inscription !",
        inviteFriend: "Partager sur WhatsApp",
        copyLink: "Copier le lien",
        linkCopied: "Copié !",
        friendsJoined: "Amis inscrits",
        referredBanner: "🎁 Vous avez été invité par un ami ! Inscrivez-vous et profitez de votre cadeau de bienvenue.",
        rewardEarned: "🎉 Votre ami {name} s'est inscrit grâce à vous ! Votre bonus parrainage a été crédité.",
      },
      backPass: {
        menu: "📖 Carte & Menu digital",
        whatsapp: "💬 Contact WhatsApp",
        instagram: "📸 Page Instagram",
        directions: "📍 Itinéraire Google Maps",
        terms: "📜 Conditions d'utilisation",
        flipPass: "🔄 Infos & Liens utiles",
      },
      security: {
        dynamicQr: "🔒 QR code sécurisé renouvelé toutes les 60s (anti-capture d'écran)",
        nfcScan: "📲 Scan sans contact NFC (approchez le mobile)",
        nfcWaiting: "Approchez le smartphone du client...",
        nfcUnsupported: "NFC non supporté sur ce navigateur, activation de la caméra...",
      },
      csv: {
        export: "📥 Exporter CSV",
        import: "📤 Importer CSV",
        importModalTitle: "Importation groupée de clients (CSV)",
        importPlaceholder: "Entrez les lignes: Nom,Téléphone\nExemple:\nMohamed Alami,0661223344\nSanaa Bennani,0665778899",
        importBtn: "Lancer l'importation",
        importSuccess: "{count} cartes clients créées avec succès !",
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
      ownerSettings: "Ajustes",
      saveChanges: "Guardar cambios",
      saving: "Guardando...",
      savedSuccess: "Guardado con éxito",
      unsavedChanges: "Cambios no guardados",
      storeLocation: "Ubicación del comercio",
      detectGps: "Detectar mi ubicación (GPS)",
      mapPreview: "Ver en el mapa",
      googleMapsUrl: "Enlace de Google Maps",
      radarMessage: "Mensaje de notificación radar 100m",
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
      addTemplate: "Añadir plantilla",
      saveAsTemplate: "📌 Guardar como plantilla",
      noTemplatesYet: "No hay plantillas guardadas para esta tienda",
      createTemplateTitle: "Crear plantilla de promoción",
      templateName: "Nombre de la plantilla",
      templateText: "Texto de la promoción",
      presetSuggestions: "💡 Sugerencias rápidas en un clic",
      deleteTemplate: "Eliminar plantilla",
      notificationMessage: "Texto de la notificación",
      notificationPlaceholder: "Escribe tu mensaje libremente o elige una plantilla...",
      templateSavedSuccess: "Plantilla guardada con éxito",
      templateDeletedSuccess: "Plantilla eliminada",
      allBranches: "Todas las sucursales (Total)",
      branch: "Sucursal",
      selectBranch: "Seleccionar sucursal",
      addBranch: "Añadir sucursal",
      editBranch: "Modificar sucursal",
      deleteBranch: "Eliminar sucursal",
      manageBranches: "Gestión de sucursales y ubicaciones",
      branchName: "Nombre de la sucursal",
      mainBranch: "Sucursal principal",
      setAsMainBranch: "Marcar como principal",
      branchLocationSaved: "Coordenadas de la sucursal guardadas",
      branchDeleted: "Sucursal eliminada",
      branchStatsComparison: "Comparativa de rendimiento por sucursal",
      branchActivityBreakdown: "Distribución de visitas por sucursal",
      branchVisitsLabel: "Visitas de la sucursal",
      currentDeviceBranch: "Sucursal activa en este dispositivo",
      changeDeviceBranch: "Cambiar sucursal de este dispositivo",
    },
    engines: {
      sectionTitle: "4 motores de crecimiento automatizados para disparar tus ventas",
      sectionSubtitle: "Automatizaciones nativas en Apple Wallet y Google Wallet que reactivan a tus clientes y maximizan tus ingresos en piloto automático.",
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
      row1Walink: "✅ Sin descargas de apps (acceso inmediato en 5s)",
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
      roiTitle: "Calculadora de rentabilidad e ingresos adicionales",
      roiSubtitle: "Ajusta los controles para estimar los ingresos adicionales generados gracias a la recurrencia de tus clientes",
      costCompareTitle: "Comparativa de costes y ahorro anual",
      costCompareSubtitle: "¿Por qué pagar cuotas mensuales y desarrollos caros cuando Walink te ofrece una solución definitiva de un solo pago?",
      costSavingsCallout: "¡Ahorra más de 12.000 DH en el primer año frente al desarrollo de una app a medida! 🎉",
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
      supportWa: "WhatsApp de soporte (+212 661 848 790)",
      adminLink: "Panel de administración",
      outreachLink: "Estudio de prospección",
      supportLink: "Soporte y Atención al Cliente",
      privacyLink: "Política de Privacidad",
      termsLink: "Condiciones de Uso",
      homeLink: "Inicio",
      brandTagline: "La 1.ª plataforma marroquí de tarjetas de fidelización inteligentes en Apple Wallet y Google Wallet, sin aplicaciones y sin cuotas mensuales.",
      moroccoBadge: "Diseñado y desarrollado con orgullo para los comercios de Marruecos 🇲🇦",
      colPlatform: "Plataforma y Funciones",
      colPricing: "Precios y Planes",
      colEssential: "Páginas Esenciales y Soporte",
      colAdmin: "Administración",
      colSamples: "Vistas Previas en Vivo",
      demoLink: "Demostración Interactiva en Vivo",
      enginesLink: "Los 4 Motores de Crecimiento",
      radarLink: "Radar de Proximidad 100m (GPS)",
      standLink: "Soporte de Mesa Conectado (NFC)",
      roiLink: "Calculadora de Rentabilidad (ROI)",
      faqLink: "Preguntas Frecuentes (FAQ)",
      starterPack: "Pack Starter (1.200 DH)",
      growthPack: "Pack Crecimiento Popular (2.400 DH)",
      multiPack: "Pack Multisede (4.500 DH)",
      sampleCardLink: "Vista Previa de Tarjeta en Vivo",
      sampleJoinLink: "Experiencia de Registro de Cliente",
      adminLoginLink: "Acceso Super Admin",
      cndpNotice: "Conforme con las normas de protección de datos personales en Marruecos (Ley 09-08 / CNDP)",
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
      sidebar: {
        mainMenu: "MENÚ PRINCIPAL",
        dashboard: "Panel de Control Central",
        dashboardDesc: "Resumen de comercios y saldos",
        automations: "Motor de Automatización e IA",
        automationsDesc: "Radar de proximidad, reseñas y push",
        outreach: "Estudio Comercial y Ventas",
        outreachDesc: "Generación de stands y campañas",
        newMerchant: "Añadir Nuevo Comercio",
        newMerchantDesc: "Registrar cafetería, restaurante o salón",
        serverStatus: "Servidor de Producción",
        serverConnected: "Conectado 99.9%",
        serverNode: "Casablanca Node 22 (Hostinger Cloud)",
        quickLinks: "PORTAL DE VISITANTES Y ENLACES",
        developerPortal: "Portal de Desarrolladores e Inicio",
        support: "Centro de Soporte Técnico",
        terms: "Términos de Servicio",
        privacy: "Política de Privacidad",
        logout: "Cerrar sesión en la plataforma",
        closeMenu: "Cerrar menú",
        openMenu: "Abrir menú lateral",
        superAdminSuite: "Super Admin Suite v2.5",
        viewWebsite: "Ver sitio web",
        navHome: "Inicio",
        navAutomations: "Automatización",
        navOutreach: "Ventas",
        navNewMerchant: "Nuevo",
        addShort: "Comercio",
      },
      dashboard: {
        pageTitle: "Consola de Administración Central (Super Admin)",
        pageSubtitle: "Seguimiento integral de todos los comercios, tarjetas activadas y saldos en Marruecos 🇲🇦",
        kpiMerchants: "Total Comercios Asociados",
        kpiMerchantsActive: "activos actualmente",
        kpiMerchantsSub: "Cafeterías, restaurantes y barberías",
        kpiCustomers: "Total Tarjetas Activadas",
        kpiCustomersUnit: "clientes fieles",
        kpiCustomersSub: "A través de Apple Wallet, Google Wallet y Web Pass",
        kpiTransactions: "Total Visitas y Sellos",
        kpiTransactionsUnit: "operaciones registradas",
        kpiTransactionsSub: "Sellos otorgados y recompensas canjeadas",
        kpiCredits: "Saldo de Créditos Distribuido",
        kpiCreditsUnit: "créditos disponibles",
        kpiCreditsSub: "Listo para alertas de radar y campañas",
        searchPlaceholder: "Buscar por nombre de comercio, enlace (slug) o ciudad...",
        allNiches: "Todas las actividades",
        allPlans: "Todos los planes",
        merchantsListTitle: "Lista de Comercios Asociados",
        noMerchants: "No se encontraron comercios coincidentes",
        noMerchantsDesc: "Intente cambiar los filtros o agregue un nuevo comercio ahora.",
        addMerchantBtn: "Nuevo comercio",
        clients: "Clientes",
        visits: "Visitas",
        credits: "Créditos",
        reward: "Recompensa:",
        stampsRequired: "Sellos requeridos:",
        stampsCount: "sellos",
        topupCredits: "Recargar saldo",
        standNfc: "Soporte de mesa (NFC)",
        viewLivePass: "Ver tarjeta de prueba (Live Pass)",
        registerFirstCustomer: "Registrar primer cliente",
        merchantDashboard: "Portal del comercio",
        customerLink: "Enlace para clientes",
        editMerchant: "Editar",
        enableMerchant: "Activar comercio",
        disableMerchant: "Desactivar comercio",
        activeStatus: "Activo",
        inactiveStatus: "Desactivado",
        pinLabel: "Código PIN:",
        nicheCafe: "Cafeterías (Café)",
        nicheBarber: "Barberías y peluquerías (Barber)",
        nicheSnack: "Comida rápida y restaurantes (Snack)",
        nicheWash: "Lavado de autos (Car Wash)",
        nicheBeauty: "Salones de belleza (Beauty)",
        nicheLaundry: "Tintorerías y lavanderías (Laundry)",
        nicheOther: "Otras actividades",
        planStarter: "Plan STARTER",
        planGrowth: "Plan GROWTH",
        planMulti: "Plan MULTI",
      },
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
    enterprise: {
      worksWithApple: "Compatible oficial con Apple Wallet",
      googleWalletCertified: "Certificado para Google Wallet",
      nfcForumStandard: "Estándar mundial NFC Contactless",
      bankGradeSecurity: "Seguridad bancaria 256-Bit AES",
      infraTitle: "Infraestructura de nivel Empresarial",
      infraSubtitle: "Walink está diseñado para ofrecer máxima estabilidad, velocidad instantánea y seguridad bancaria a grandes marcas.",
      uptimeTitle: "99.99% Disponibilidad SLA",
      uptimeDesc: "Servidores en la nube de alta disponibilidad que garantizan el funcionamiento ininterrumpido 24/7.",
      latencyTitle: "< 45ms Tiempo de respuesta",
      latencyDesc: "Escaneo instantáneo y respuesta en milisegundos para agilizar el cobro en horas pico.",
      securityTitle: "Cifrado bancario 256-bit",
      securityDesc: "Protección total de datos de comercios y clientes cumpliendo estrictas normas de privacidad.",
      capacityTitle: "+100.000 Operaciones simultáneas",
      capacityDesc: "Arquitectura escalable para gestionar cadenas comerciales y franquicias con total fluidez.",
    },
    walletEnterprise: {
      staff: {
        loginTitle: "Iniciar sesión con código PIN",
        ownerHint: "Acceso Director: 1234",
        staffHint: "Acceso Empleado (Amine): 1111",
        currentStaff: "Empleado actual",
        switchAccount: "Cambiar cuenta",
        recentShiftScans: "Operaciones recientes del turno",
        cooldownWarning: "⚠️ Protección antifraude: ¡Esta tarjeta ya fue escaneada recientemente! Espere o confirme con permisos de Administrador.",
        overrideCooldown: "Omitir espera y confirmar (Director)",
        byStaff: "Por",
        manageStaff: "Gestión del personal y caja",
        staffName: "Nombre del empleado",
        staffPin: "Código PIN (4 dígitos)",
        addStaff: "Añadir empleado",
        cooldownMinutes: "Tiempo antifraude entre escaneos (minutos)",
      },
      vip: {
        badge: "👑 VIP ORO",
        congratsTitle: "👑 ¡Nivel VIP Oro desbloqueado!",
        congratsBody: "👑 ¡Felicidades! Tu tarjeta ha subido al nivel VIP Oro con beneficios y recompensas exclusivas.",
        vipBonusNotice: "Ventaja VIP: Cashback aumentado",
      },
      referral: {
        title: "🎁 Invita a un amigo y gana",
        stampsDesc: "¡Regala una tarjeta a un amigo y recibe un sello gratis al registrarse!",
        cashbackDesc: "¡Regala una tarjeta a un amigo y recibe +{bonus} {currency} de saldo cashback al registrarse!",
        inviteFriend: "Compartir por WhatsApp",
        copyLink: "Copiar enlace",
        linkCopied: "¡Copiado!",
        friendsJoined: "Amigos inscritos",
        referredBanner: "🎁 ¡Has sido invitado por un amigo! Regístrate y recibe tu regalo de bienvenida.",
        rewardEarned: "🎉 ¡Tu amigo {name} se ha registrado con tu enlace! Se ha añadido la recompensa a tu tarjeta.",
      },
      backPass: {
        menu: "📖 Menú digital",
        whatsapp: "💬 Contacto WhatsApp",
        instagram: "📸 Página de Instagram",
        directions: "📍 Cómo llegar (Google Maps)",
        terms: "📜 Términos y condiciones",
        flipPass: "🔄 Detalles y enlaces",
      },
      security: {
        dynamicQr: "🔒 Código QR dinámico renovado cada 60s (protegido contra capturas)",
        nfcScan: "📲 Escaneo sin contacto NFC (acerque el teléfono)",
        nfcWaiting: "Acerque el móvil del cliente al dispositivo...",
        nfcUnsupported: "NFC no soportado en este navegador, activando cámara...",
      },
      csv: {
        export: "📥 Exportar CSV",
        import: "📤 Importar CSV",
        importModalTitle: "Importación masiva de clientes (CSV)",
        importPlaceholder: "Introduzca líneas: Nombre,Teléfono\nEjemplo:\nCarlos Ruiz,0661223344\nAna Moreno,0665778899",
        importBtn: "Iniciar importación",
        importSuccess: "¡{count} tarjetas de clientes creadas con éxito!",
      },
    },
  },
};


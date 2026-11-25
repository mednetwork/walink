"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { getAdminUrl, getPassUrl } from "@/lib/urls";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Sparkles,
  Camera,
  Coins,
  QrCode,
  Lock,
  Unlock,
  KeyRound,
  TrendingUp,
  ArrowUpRight,
  Gift,
  Star,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Radio,
  ExternalLink,
  Smartphone,
  ChevronRight,
  Coffee,
  Scissors,
  Clock,
  Search,
  Check,
  Zap,
  Settings,
  MapPin,
  Save,
  Loader2,
  Globe,
  Navigation,
  Plus,
  Trash2,
  Edit3,
  BookmarkPlus,
  Building2,
  X,
  ShieldCheck,
  Download,
  Share2,
  Stamp,
  BarChart3,
  Menu,
  UserPlus,
} from "lucide-react";
import { soundEngine } from "@/lib/sound";
import type { MonthlyAnalyticsResponse } from "@/app/api/m/[slug]/analytics/monthly/route";

function formatMonthTitle(monthKey: string, loc: string): string {
  if (!monthKey || !monthKey.includes("-")) return monthKey;
  const [yearStr, monthStr] = monthKey.split("-");
  const m = parseInt(monthStr, 10);
  const arMonths = [
    "يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو",
    "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"
  ];
  const frMonths = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const esMonths = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const idx = m - 1;
  if (loc === "fr") return `${frMonths[idx] || monthStr} ${yearStr}`;
  if (loc === "es") return `${esMonths[idx] || monthStr} ${yearStr}`;
  return `${arMonths[idx] || monthStr} ${yearStr}`;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

function isStandaloneNavigator(nav: Navigator): nav is NavigatorWithStandalone {
  return "standalone" in nav;
}
import MerchantScannerModal, { CustomerSummary, ActionSuccessPayload } from "@/components/MerchantScannerModal";
import StandPreviewModal from "@/components/StandPreviewModal";
import LockScreenPeekModal from "@/components/LockScreenPeekModal";
import MerchantCreditsModal from "@/components/MerchantCreditsModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { formatTimeAgoArabic } from "@/lib/utils";

export interface PromoTemplateItem {
  id: string;
  label: string;
  text: string;
}

export interface BranchItem {
  id: string;
  name: string;
  city: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  radarMessage?: string;
  phone?: string;
  isMain?: boolean;
}

export type MerchantAuthRole = "OWNER" | "BRANCH_STAFF" | "STAFF";

export interface InitialAuthSession {
  authenticated: boolean;
  role: MerchantAuthRole;
  branch: BranchItem | null;
  staffName?: string | null;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  passSerial: string;
  loyaltyType?: "STAMPS" | "CASHBACK";
  stamps: number;
  cashbackBalance?: number;
  totalCashbackEarned?: number;
  totalSpent?: number;
  totalVisits: number;
  rewardsRedeemed: number;
  lastVisitAt: string | Date;
  securityPin?: string;
  failedPinAttempts?: number;
  pinLockedUntil?: string | null;
  isActivated?: boolean;
}

interface TransactionData {
  id: string;
  type: string;
  stampsDelta: number;
  billAmount?: number | null;
  cashbackDelta?: number | null;
  branchName?: string | null;
  note: string | null;
  createdAt: string | Date;
  customer: {
    id: string;
    name: string;
    memberCode: string;
    phone: string;
  };
}

interface CampaignData {
  id: string;
  title: string;
  message: string;
  audience: string;
  sentCount: number;
  creditsUsed: number;
  returnedCount: number;
  createdAt: string | Date;
}

interface MerchantDashboardClientProps {
  initialMerchant: {
    id: string;
    name: string;
    slug: string;
    niche: string;
    city: string;
    pinCode: string;
    hasBranchPins?: boolean;
    primaryColor: string;
    bgGradient: string;
    stampsRequired: number;
    rewardName: string;
    customerPrefix: string;
    plan: string;
    maxBranches?: number;
    credits: number;
    loyaltyMode?: string;
    cashbackRate?: number;
    welcomeCashback?: number;
    minCashbackRedeem?: number;
    currency?: string;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
    radarMessage?: string;
    phone?: string;
    promoTemplates?: string;
    branches?: string;
    staffMembers?: string;
    autoWinback: boolean;
    autoReview: boolean;
    autoRadar: boolean;
    autoNearReward: boolean;
  };
  initialAuthSession?: InitialAuthSession;
  initialCustomers: CustomerData[];
  initialTransactions: TransactionData[];
  initialCampaigns: CampaignData[];
  initialMetrics: {
    totalVisits: number;
    returningCustomers: number;
    totalRewards: number;
    audienceCounts: {
      all: number;
      quiet: number;
      near: number;
      vip: number;
    };
  };
}

export default function MerchantDashboardClient({
  initialMerchant,
  initialAuthSession,
  initialCustomers,
  initialTransactions,
  initialCampaigns,
  initialMetrics,
}: MerchantDashboardClientProps) {
  const { locale, dir, t, isRTL, setLocale } = useI18n();

  // PIN Gate State (Server-verified HttpOnly session)
  const [isUnlocked, setIsUnlocked] = useState(
    Boolean(initialAuthSession?.authenticated)
  );
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);
  const [verifyingPin, setVerifyingPin] = useState(false);

  // Session Role State (Phase 63: Server-enforced OWNER vs BRANCH_STAFF vs STAFF)
  const [authRole, setAuthRole] = useState<MerchantAuthRole>(
    initialAuthSession?.authenticated ? initialAuthSession.role : "OWNER"
  );
  const [authBranch, setAuthBranch] = useState<BranchItem | null>(
    initialAuthSession?.authenticated ? initialAuthSession.branch : null
  );
  const [authStaffName, setAuthStaffName] = useState<string | null>(
    initialAuthSession?.authenticated ? initialAuthSession.staffName || null : null
  );

  const isOwner = authRole === "OWNER";
  const isRestrictedStaff = authRole !== "OWNER";

  // Active Tab
  const [activeTab, setActiveTab] = useState<"home" | "customers" | "analytics" | "promo" | "settings">("home");

  // Monthly Analytics State (Phase 54)
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalyticsResponse | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");
  const [analyticsBranchFilter, setAnalyticsBranchFilter] = useState<string>(
    initialAuthSession?.authenticated &&
      initialAuthSession.role === "BRANCH_STAFF" &&
      initialAuthSession.branch
      ? initialAuthSession.branch.name
      : "ALL"
  );
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Phone Bezel Frame Mode
  const [isFrameMode, setIsFrameMode] = useState(false);

  // Data States
  const [merchant, setMerchant] = useState(initialMerchant);
  const [customers, setCustomers] = useState<CustomerData[]>(initialCustomers);
  const [transactions, setTransactions] = useState<TransactionData[]>(initialTransactions);
  const [campaigns, setCampaigns] = useState<CampaignData[]>(initialCampaigns);
  const [metrics, setMetrics] = useState(initialMetrics);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isStandOpen, setIsStandOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  // Drawer Menu & Manual Add Customer Modal States (Phase 58)
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustPin, setNewCustPin] = useState("");
  const [newCustLoyaltyType, setNewCustLoyaltyType] = useState<"STAMPS" | "CASHBACK">(
    merchant.loyaltyMode === "CASHBACK" ? "CASHBACK" : "STAMPS"
  );
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [addCustomerError, setAddCustomerError] = useState<string | null>(null);

  // Live Customer Polling Reference Snapshot (Phase 58)
  const customersRef = useRef<CustomerData[]>(initialCustomers);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  // Direct Customer Action States (Phase 53)
  const [stampingCustomerId, setStampingCustomerId] = useState<string | null>(null);
  const [preselectedCustomer, setPreselectedCustomer] = useState<CustomerData | null>(null);
  const activeRole: "OWNER" | "STAFF" = "OWNER";

  // Floating Cashier Action Success Toast State & Debounced Timer Ref
  const [actionSuccessToast, setActionSuccessToast] = useState<{
    message: string;
    customerName: string;
    memberCode: string;
  } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 3-Second Celebratory Operation Success Modal State (Phase 59)
  const [successModalData, setSuccessModalData] = useState<ActionSuccessPayload | null>(null);
  const successModalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
      if (successModalTimeoutRef.current) {
        clearTimeout(successModalTimeoutRef.current);
        successModalTimeoutRef.current = null;
      }
    };
  }, []);

  // Non-Disruptive 4-Second Live Customer Polling with customersRef Diffing (Phase 58)
  // Real-Time Customer & Credits Auto-Sync (Polls only when authenticated)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`walink_branches_${merchant.slug}`);
      } catch {
        // ignore
      }
    }
    if (!isUnlocked) return;

    let isMounted = true;
    const controller = new AbortController();

    const pollMerchantData = async () => {
      if (typeof document !== "undefined" && document.hidden) return;

      try {
        const res = await fetch(`/api/m/${merchant.slug}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.customers || !Array.isArray(data.customers)) return;

        const incomingCustomers: CustomerData[] = data.customers;
        const currentCustomers = customersRef.current;

        // Check if anything meaningful changed
        const currentIds = new Set(currentCustomers.map((c) => c.id));
        const newCustomer = incomingCustomers.find((c) => !currentIds.has(c.id));
        const hasLengthChanged = incomingCustomers.length !== currentCustomers.length;

        let hasDataChanged = hasLengthChanged || Boolean(newCustomer);

        if (!hasDataChanged) {
          // Check if any customer stamps, cashback, visits, or activation state changed
          const currentMap = new Map(currentCustomers.map((c) => [c.id, c]));
          for (const inc of incomingCustomers) {
            const cur = currentMap.get(inc.id);
            if (!cur) {
              hasDataChanged = true;
              break;
            }
            if (
              cur.stamps !== inc.stamps ||
              Math.abs(Number(cur.cashbackBalance || 0) - Number(inc.cashbackBalance || 0)) >= 0.01 ||
              cur.totalVisits !== inc.totalVisits ||
              cur.rewardsRedeemed !== inc.rewardsRedeemed ||
              cur.isActivated !== inc.isActivated ||
              cur.securityPin !== inc.securityPin
            ) {
              hasDataChanged = true;
              break;
            }
          }
        }

        if (hasDataChanged) {
          customersRef.current = incomingCustomers;
          setCustomers(incomingCustomers);

          // If a brand-new customer joined, notify merchant with chime & floating toast!
          if (newCustomer) {
            soundEngine.playRewardChime();
            setActionSuccessToast({
              message:
                locale === "fr"
                  ? `✨ Nouveau client inscrit : ${newCustomer.name} (#${newCustomer.memberCode})`
                  : locale === "es"
                  ? `✨ Nuevo cliente registrado: ${newCustomer.name} (#${newCustomer.memberCode})`
                  : `✨ انضم زبون جديد الآن: ${newCustomer.name} (#${newCustomer.memberCode})`,
              customerName: newCustomer.name,
              memberCode: newCustomer.memberCode,
            });

            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            toastTimeoutRef.current = setTimeout(() => {
              setActionSuccessToast(null);
            }, 5000);
          }
        }

        // Sync metrics, credits & scoped branches
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        if (data.merchant && typeof data.merchant.credits === "number") {
          setMerchant((prev) =>
            prev.credits !== data.merchant.credits
              ? { ...prev, credits: data.merchant.credits }
              : prev
          );
        }
        if (data.merchant?.branches) {
          try {
            const parsedBranches: unknown = JSON.parse(data.merchant.branches);
            if (Array.isArray(parsedBranches)) {
              setBranches(parsedBranches as BranchItem[]);
            }
          } catch {
            // ignore
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          // Silently ignore transient polling network blips
        }
      }
    };

    const interval = setInterval(pollMerchantData, 4000);
    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [merchant.slug, locale, isUnlocked]);

  // Handler for Manual Customer Creation (Phase 58)
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      setAddCustomerError(
        locale === "fr"
          ? "Veuillez entrer le nom du client"
          : locale === "es"
          ? "Por favor introduce el nombre del cliente"
          : "يرجى كتابة اسم الزبون"
      );
      return;
    }
    if (!newCustPhone.trim()) {
      setAddCustomerError(
        locale === "fr"
          ? "Veuillez entrer le numéro de téléphone"
          : locale === "es"
          ? "Por favor introduce el número de teléfono"
          : "يرجى كتابة رقم الهاتف"
      );
      return;
    }

    setIsAddingCustomer(true);
    setAddCustomerError(null);

    try {
      const res = await fetch(`/api/join/${merchant.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustName.trim(),
          phone: newCustPhone.trim(),
          loyaltyType: newCustLoyaltyType,
          securityPin: newCustPin.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر إضافة الزبون");
      }

      // Add newly created customer immediately to local list
      const createdCustomer: CustomerData = {
        id: data.customerId || `cust-${Date.now()}`,
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        memberCode: data.memberCode || data.passSerial?.slice(-4) || "0000",
        passSerial: data.passSerial || `pass-${Date.now()}`,
        loyaltyType: newCustLoyaltyType,
        stamps: newCustLoyaltyType === "STAMPS" ? 1 : 0,
        cashbackBalance: newCustLoyaltyType === "CASHBACK" ? Number(merchant.welcomeCashback || 0) : 0,
        totalCashbackEarned: newCustLoyaltyType === "CASHBACK" ? Number(merchant.welcomeCashback || 0) : 0,
        totalSpent: 0,
        totalVisits: 1,
        rewardsRedeemed: 0,
        lastVisitAt: new Date(),
        isActivated: true,
        securityPin: newCustPin.trim() || undefined,
      };

      setCustomers((prev) => [createdCustomer, ...prev]);
      customersRef.current = [createdCustomer, ...customersRef.current];

      soundEngine.playRewardChime();
      setActionSuccessToast({
        message:
          locale === "fr"
            ? `Client ajouté avec succès : ${createdCustomer.name}`
            : locale === "es"
            ? `Cliente añadido con éxito: ${createdCustomer.name}`
            : `🎉 تمت إضافة الزبون بنجاح: ${createdCustomer.name}`,
        customerName: createdCustomer.name,
        memberCode: createdCustomer.memberCode,
      });

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActionSuccessToast(null);
      }, 5000);

      setIsAddCustomerOpen(false);
      setNewCustName("");
      setNewCustPhone("");
      setNewCustPin("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إضافة الزبون";
      setAddCustomerError(msg);
    } finally {
      setIsAddingCustomer(false);
    }
  };
  const [peekNotification, setPeekNotification] = useState<{ isOpen: boolean; message: string; title: string; shopName?: string }>({
    isOpen: false,
    message: "",
    title: "",
    shopName: "",
  });

  // PWA Home Screen Installation State
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallDismissed, setIsInstallDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Tab 2 (CRM) Search & Filter
  const [crmSearch, setCrmSearch] = useState("");
  const [crmFilter, setCrmFilter] = useState<"ALL" | "VIP" | "ACTIVE" | "QUIET">("ALL");

  // Cashier PIN Reset & Account Security Modal State
  const [pinResetModal, setPinResetModal] = useState<{
    isOpen: boolean;
    customer: CustomerData | null;
    newPin: string;
    isSubmitting: boolean;
    error: string | null;
    success: string | null;
  }>({
    isOpen: false,
    customer: null,
    newPin: "",
    isSubmitting: false,
    error: null,
    success: null,
  });

  const handleOpenPinReset = (cust: CustomerData) => {
    setPinResetModal({
      isOpen: true,
      customer: cust,
      newPin: "",
      isSubmitting: false,
      error: null,
      success: null,
    });
  };

  const handleResetPinSubmit = async () => {
    if (!pinResetModal.customer) return;
    if (!/^\d{4}$/.test(pinResetModal.newPin.trim())) {
      setPinResetModal((prev) => ({
        ...prev,
        error:
          locale === "ar"
            ? "رمز PIN يجب أن يتكون من 4 أرقام حصراً (مثال: 1234)"
            : locale === "fr"
            ? "Le PIN doit être composé de 4 chiffres (ex: 1234)"
            : "El PIN debe tener 4 dígitos (ej: 1234)",
      }));
      return;
    }
    setPinResetModal((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const res = await fetch(`/api/m/${merchant.slug}/customers/security`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: pinResetModal.customer.id,
          action: "RESET_PIN",
          newPin: pinResetModal.newPin.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset PIN");
      }
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === pinResetModal.customer?.id
            ? {
                ...c,
                securityPin: data.customer.securityPin,
                failedPinAttempts: 0,
                pinLockedUntil: null,
              }
            : c
        )
      );
      setPinResetModal((prev) => ({
        ...prev,
        isSubmitting: false,
        success:
          data.message ||
          (locale === "ar"
            ? "تم تعيين رمز PIN بنجاح!"
            : "Code PIN mis à jour avec succès !"),
      }));
      setTimeout(() => {
        setPinResetModal({
          isOpen: false,
          customer: null,
          newPin: "",
          isSubmitting: false,
          error: null,
          success: null,
        });
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setPinResetModal((prev) => ({ ...prev, isSubmitting: false, error: msg }));
    }
  };

  const handleUnlockCustomer = async (cust: CustomerData) => {
    try {
      const res = await fetch(`/api/m/${merchant.slug}/customers/security`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: cust.id,
          action: "UNLOCK_ACCOUNT",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to unlock");
      }
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === cust.id
            ? { ...c, failedPinAttempts: 0, pinLockedUntil: null }
            : c
        )
      );
    } catch (err) {
      console.error("Error unlocking customer:", err);
    }
  };

  // Tab 3 (Promo) States & Dynamic Templates
  const [templates, setTemplates] = useState<PromoTemplateItem[]>(() => {
    if (merchant.promoTemplates) {
      try {
        const parsed = JSON.parse(merchant.promoTemplates);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.warn("Failed to parse initial promoTemplates:", err);
      }
    }
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`walink_promo_templates_${merchant.slug}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (err) {
        console.warn("Failed to load promoTemplates from localStorage:", err);
      }
    }
    return [];
  });
  const [promoTemplate, setPromoTemplate] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoAudience, setPromoAudience] = useState<"ALL" | "QUIET" | "NEAR_REWARD" | "VIP">("ALL");
  const [sendingPromo, setSendingPromo] = useState(false);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateLabelInput, setTemplateLabelInput] = useState("");
  const [templateTextInput, setTemplateTextInput] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const syncTemplates = async (newTemplates: PromoTemplateItem[]) => {
    setTemplates(newTemplates);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `walink_promo_templates_${merchant.slug}`,
          JSON.stringify(newTemplates)
        );
      } catch (err) {
        console.warn("Failed to save promoTemplates to localStorage:", err);
      }
    }
    try {
      await fetch(`/api/m/${merchant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          actorRole: authRole,
          promoTemplates: JSON.stringify(newTemplates),
        }),
      });
    } catch (err) {
      console.warn("Could not sync templates to server:", err);
    }
  };

  const handleOpenAddTemplate = (prefillMessage?: string) => {
    setEditingTemplateId(null);
    setTemplateLabelInput("");
    setTemplateTextInput(prefillMessage || "");
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tpl: PromoTemplateItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTemplateId(tpl.id);
    setTemplateLabelInput(tpl.label);
    setTemplateTextInput(tpl.text);
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = async (tplId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newTemplates = templates.filter((t) => t.id !== tplId);
    if (promoTemplate === tplId) {
      setPromoTemplate(null);
    }
    await syncTemplates(newTemplates);
  };

  const handleSaveTemplate = async () => {
    const label = templateLabelInput.trim();
    const text = templateTextInput.trim();
    if (!label || !text) return;

    setIsSavingTemplate(true);
    try {
      let updated: PromoTemplateItem[];
      if (editingTemplateId) {
        updated = templates.map((t) =>
          t.id === editingTemplateId ? { ...t, label, text } : t
        );
      } else {
        const newTpl: PromoTemplateItem = {
          id: `tpl_${Date.now()}`,
          label,
          text,
        };
        updated = [...templates, newTpl];
        setPromoTemplate(newTpl.id);
        const resolvedText = text.replace(/\{shop\}/g, merchant.name);
        setPromoMessage(resolvedText);
      }
      await syncTemplates(updated);
      setIsTemplateModalOpen(false);
      setEditingTemplateId(null);
      setTemplateLabelInput("");
      setTemplateTextInput("");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleSelectTemplate = (tpl: PromoTemplateItem) => {
    setPromoTemplate(tpl.id);
    const resolvedText = tpl.text.replace(/\{shop\}/g, merchant.name);
    setPromoMessage(resolvedText);
  };

  const PRESET_SUGGESTIONS = [
    {
      id: "weekend",
      label: locale === "fr" ? "Promo weekend" : locale === "es" ? "Promo fin de semana" : "عرض الويكاند",
      text:
        locale === "fr"
          ? `Promo Weekend : -20% ce samedi et dimanche chez ${merchant.name}`
          : locale === "es"
          ? `Promo Fin de Semana: -20% este sábado y domingo en ${merchant.name}`
          : `عرض الويكاند: -20% هاد السبت والحد ف ${merchant.name}`,
    },
    {
      id: "new",
      label: locale === "fr" ? "Nouveau au menu" : locale === "es" ? "Novedad en carta" : "جديد فالمونيو",
      text:
        locale === "fr"
          ? `Nouveau au menu chez ${merchant.name}. Venez le tester en avant-première !`
          : locale === "es"
          ? `¡Novedad en la carta de ${merchant.name}! Pruébalo antes que nadie.`
          : `جديد فالمونيو ف ${merchant.name}. أجي ذوقو قبل الناس`,
    },
    {
      id: "double",
      label: locale === "fr" ? "Double tampon" : locale === "es" ? "Doble sello" : "طابع دوبل",
      text:
        locale === "fr"
          ? `Aujourd'hui, double tampon chez ${merchant.name} jusqu'à 18h !`
          : locale === "es"
          ? `¡Hoy doble sello en ${merchant.name} hasta las 18h!`
          : `اليوم الطابع دوبل ف ${merchant.name} حتى لـ 6 دالعشية`,
    },
    {
      id: "miss",
      label: locale === "fr" ? "Vous nous manquez" : locale === "es" ? "Te echamos de menos" : "توحشناك",
      text:
        locale === "fr"
          ? `Vous nous manquez ! Passez cette semaine chez ${merchant.name} : un tampon offert.`
          : locale === "es"
          ? `¡Te echamos de menos! Pásate esta semana por ${merchant.name} y llévate un sello de regalo.`
          : `توحشناك! دوز هاد السيمانة لـ ${merchant.name} وعندك طابع هدية`,
    },
  ];

  // Multi-Branch Management (MULTI Plan or maxBranches > 1)
  const isMultiBranch = merchant.plan === "MULTI" || ((merchant.maxBranches ?? 1) > 1);

  const [branches, setBranches] = useState<BranchItem[]>(() => {
    if (merchant.branches) {
      try {
        const parsed = JSON.parse(merchant.branches);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (err) {
        console.warn("Failed to parse initial branches:", err);
      }
    }
    return [];
  });

  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialAuthSession?.authenticated &&
      initialAuthSession.role === "BRANCH_STAFF" &&
      initialAuthSession.branch
      ? initialAuthSession.branch.id
      : "ALL"
  );

  const [deviceBranchId, setDeviceBranchId] = useState<string>(() => {
    if (
      initialAuthSession?.authenticated &&
      initialAuthSession.role === "BRANCH_STAFF" &&
      initialAuthSession.branch
    ) {
      return initialAuthSession.branch.id;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`walink_device_branch_${merchant.slug}`);
      if (stored) return stored;
    }
    return "br_main";
  });

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchNameInput, setBranchNameInput] = useState("");
  const [branchCityInput, setBranchCityInput] = useState(merchant.city || "الدار البيضاء");
  const [branchPinInput, setBranchPinInput] = useState("");
  const [branchPinError, setBranchPinError] = useState<string | null>(null);
  const [branchLatInput, setBranchLatInput] = useState<string | number>(merchant.latitude ?? 33.5731);
  const [branchLngInput, setBranchLngInput] = useState<string | number>(merchant.longitude ?? -7.5898);
  const [branchGmapsInput, setBranchGmapsInput] = useState("");
  const [branchRadarMsgInput, setBranchRadarMsgInput] = useState(merchant.radarMessage || "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة.");
  const [branchPhoneInput, setBranchPhoneInput] = useState(merchant.phone || "");
  const [branchIsMainInput, setBranchIsMainInput] = useState(false);
  const [isSavingBranch, setIsSavingBranch] = useState(false);
  const [isDetectingBranchGps, setIsDetectingBranchGps] = useState(false);
  const [branchGpsStatus, setBranchGpsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const syncBranches = async (
    newBranches: BranchItem[]
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/m/${merchant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          actorRole: authRole,
          branches: JSON.stringify(newBranches),
        }),
      });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        return {
          ok: false,
          error: errData.error || "تعذر حفظ بيانات الفروع على الخادم.",
        };
      }
      setBranches(newBranches);
      return { ok: true };
    } catch (err) {
      console.warn("Could not sync branches to server:", err);
      return { ok: false, error: "تعذر الاتصال بالخادم لحفظ الفروع." };
    }
  };

  const handleOpenAddBranch = () => {
    const maxAllowed = merchant.maxBranches ?? (merchant.plan === "MULTI" ? 3 : 1);
    if (branches.length >= maxAllowed) {
      alert(`لقد بلغت الحد الأقصى لعدد الفروع المسموح به في باقتك (${maxAllowed} فروع). يرجى التواصل مع الإدارة للترقية.`);
      return;
    }
    setEditingBranchId(null);
    setBranchNameInput("");
    setBranchCityInput(merchant.city || "الدار البيضاء");
    setBranchPinInput("");
    setBranchPinError(null);
    setBranchLatInput(merchant.latitude ?? 33.5731);
    setBranchLngInput(merchant.longitude ?? -7.5898);
    setBranchGmapsInput("");
    setBranchRadarMsgInput("أنت بالقرب من فرعنا! تفضل بزيارتنا وبطاقتك جاهزة.");
    setBranchPhoneInput("");
    setBranchIsMainInput(branches.length === 0);
    setBranchGpsStatus(null);
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: BranchItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingBranchId(b.id);
    setBranchNameInput(b.name);
    setBranchCityInput(b.city);
    setBranchPinInput(b.pinCode || "");
    setBranchPinError(null);
    setBranchLatInput(b.latitude ?? 33.5731);
    setBranchLngInput(b.longitude ?? -7.5898);
    setBranchGmapsInput(b.googleMapsUrl || "");
    setBranchRadarMsgInput(b.radarMessage || "أنت بالقرب من فرعنا! تفضل بزيارتنا وبطاقتك جاهزة.");
    setBranchPhoneInput(b.phone || "");
    setBranchIsMainInput(Boolean(b.isMain));
    setBranchGpsStatus(null);
    setIsBranchModalOpen(true);
  };

  const handleDeleteBranch = async (bId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (branches.length <= 1) {
      alert("يجب أن يحتوي المتجر على فرع واحد على الأقل.");
      return;
    }
    const newBranches = branches.filter((b) => b.id !== bId);
    if (newBranches.length > 0 && !newBranches.some((b) => b.isMain)) {
      newBranches[0].isMain = true;
    }
    if (selectedBranchId === bId) {
      setSelectedBranchId("ALL");
    }
    await syncBranches(newBranches);
  };

  const handleSaveBranch = async () => {
    const name = branchNameInput.trim();
    if (!name) return;
    setBranchPinError(null);

    const maxAllowed = merchant.maxBranches ?? (merchant.plan === "MULTI" ? 3 : 1);
    if (!editingBranchId && branches.length >= maxAllowed) {
      setBranchPinError(`لقد بلغت الحد الأقصى للفروع المسموح به في باقتك (${maxAllowed}). يرجى التواصل مع الإدارة للترقية.`);
      return;
    }

    const cleanPin = branchPinInput.trim();
    if (cleanPin) {
      if (!/^\d{4}$/.test(cleanPin)) {
        setBranchPinError(
          locale === "fr"
            ? "Le code PIN de la succursale doit comporter exactement 4 chiffres (ex: 2222)."
            : locale === "es"
            ? "El código PIN de la sucursal debe contener exactamente 4 dígitos (ej: 2222)."
            : "رمز PIN للفرع يجب أن يتكون من 4 أرقام حصراً (مثال: 2222)."
        );
        return;
      }
      const duplicatePin = branches.find((b) => b.id !== editingBranchId && b.pinCode && b.pinCode.trim() === cleanPin);
      if (duplicatePin) {
        setBranchPinError(
          locale === "fr"
            ? `Ce code PIN est déjà utilisé pour la succursale (${duplicatePin.name}). Chaque succursale doit avoir un PIN unique.`
            : locale === "es"
            ? `Este código PIN ya está en uso en la sucursal (${duplicatePin.name}). Cada sucursal debe tener un PIN único.`
            : `رمز PIN هذا مستعمل بالفعل في فرع (${duplicatePin.name}). يرجى اختيار رمز مختلف لكل فرع.`
        );
        return;
      }
    }

    setIsSavingBranch(true);
    try {
      let updated: BranchItem[];
      const branchPayload: BranchItem = {
        id: editingBranchId || `br_${Date.now()}`,
        name,
        city: branchCityInput.trim() || merchant.city || "الدار البيضاء",
        pinCode: cleanPin || undefined,
        latitude: Number(branchLatInput) || 33.5731,
        longitude: Number(branchLngInput) || -7.5898,
        googleMapsUrl: branchGmapsInput.trim(),
        radarMessage: branchRadarMsgInput.trim(),
        phone: branchPhoneInput.trim(),
        isMain: branchIsMainInput,
      };

      if (editingBranchId) {
        updated = branches.map((b) => {
          if (b.id === editingBranchId) return branchPayload;
          if (branchIsMainInput) return { ...b, isMain: false };
          return b;
        });
      } else {
        let list = branches;
        if (branchIsMainInput) {
          list = list.map((b) => ({ ...b, isMain: false }));
        }
        updated = [...list, branchPayload];
      }
      const syncResult = await syncBranches(updated);
      if (!syncResult.ok) {
        setBranchPinError(syncResult.error || "تعذر حفظ بيانات الفرع.");
        return;
      }
      setIsBranchModalOpen(false);
      setEditingBranchId(null);
    } finally {
      setIsSavingBranch(false);
    }
  };

  const handleDetectBranchGps = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setBranchGpsStatus({ type: "error", msg: "المتصفح لا يدعم تحديد الموقع GPS." });
      return;
    }
    setIsDetectingBranchGps(true);
    setBranchGpsStatus(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setBranchLatInput(lat);
        setBranchLngInput(lng);
        setBranchGmapsInput(`https://www.google.com/maps?q=${lat},${lng}`);
        setIsDetectingBranchGps(false);
        setBranchGpsStatus({ type: "success", msg: "تم تحديد موقع الفرع بنجاح!" });
      },
      (error) => {
        console.warn("GPS detection error:", error);
        setIsDetectingBranchGps(false);
        setBranchGpsStatus({ type: "error", msg: "تعذر التقاط إحداثيات GPS. تأكد من تفعيل إذن الموقع." });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleBranchGoogleMapsUrlChange = (url: string) => {
    setBranchGmapsInput(url);
    const coords = extractCoordinatesFromGoogleMapsUrl(url);
    if (coords) {
      setBranchLatInput(coords.lat);
      setBranchLngInput(coords.lng);
      setBranchGpsStatus({
        type: "success",
        msg: `تم استخراج الإحداثيات تلقائياً (${coords.lat}, ${coords.lng})`,
      });
    }
  };

  const liveAuthBranch = useMemo<BranchItem | null>(() => {
    if (authRole !== "BRANCH_STAFF" || !authBranch) return null;
    return branches.find((b) => b.id === authBranch.id) || authBranch;
  }, [authRole, authBranch, branches]);

  const activeBranch = authRole === "BRANCH_STAFF" && liveAuthBranch
    ? liveAuthBranch
    : (branches.find((b) => b.id === deviceBranchId) || branches.find((b) => b.isMain) || branches[0]);
  const activeBranchName = (isMultiBranch || authRole === "BRANCH_STAFF") && activeBranch ? activeBranch.name : undefined;

  const effectiveSelectedBranchId = authRole === "BRANCH_STAFF" && liveAuthBranch ? liveAuthBranch.id : selectedBranchId;
  const selectedBranch = effectiveSelectedBranchId === "ALL" ? null : branches.find((b) => b.id === effectiveSelectedBranchId);

  // Filter transactions by branch if selected
  const displayedTransactions = useMemo<TransactionData[]>(() => {
    if (!isMultiBranch || !selectedBranch) return transactions;
    return transactions.filter((t: TransactionData) => t.branchName === selectedBranch.name);
  }, [transactions, selectedBranch, isMultiBranch]);

  // Branch-specific statistics
  const branchVisitsCount = useMemo<number>(() => {
    if (!isMultiBranch || !selectedBranch) return metrics.totalVisits;
    return displayedTransactions.filter((t: TransactionData) => t.type === "STAMP_ADDED" || t.type === "CASHBACK_EARNED").length;
  }, [displayedTransactions, selectedBranch, metrics.totalVisits, isMultiBranch]);

  // Tab 4 (Settings) States
  const [merchantLoyaltyMode, setMerchantLoyaltyMode] = useState(merchant.loyaltyMode || "BOTH");
  const [merchantCashbackRate, setMerchantCashbackRate] = useState(merchant.cashbackRate || 10);
  const [merchantLatitude, setMerchantLatitude] = useState<number | string>(merchant.latitude ?? 33.5731);
  const [merchantLongitude, setMerchantLongitude] = useState<number | string>(merchant.longitude ?? -7.5898);
  const [merchantGoogleMapsUrl, setMerchantGoogleMapsUrl] = useState(merchant.googleMapsUrl || "");
  const [merchantRadarMessage, setMerchantRadarMessage] = useState(
    merchant.radarMessage || "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة."
  );

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [automations, setAutomations] = useState({
    autoWinback: merchant.autoWinback,
    autoReview: merchant.autoReview,
    autoRadar: merchant.autoRadar,
    autoNearReward: merchant.autoNearReward,
  });

  const hasUnsavedChanges =
    merchantLoyaltyMode !== (merchant.loyaltyMode || "BOTH") ||
    Number(merchantCashbackRate) !== Number(merchant.cashbackRate || 10) ||
    Number(merchantLatitude) !== Number(merchant.latitude ?? 33.5731) ||
    Number(merchantLongitude) !== Number(merchant.longitude ?? -7.5898) ||
    merchantGoogleMapsUrl !== (merchant.googleMapsUrl || "") ||
    merchantRadarMessage !== (merchant.radarMessage || "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة.");

  // Smart Coordinate Extraction from Google Maps URL
  const extractCoordinatesFromGoogleMapsUrl = (url: string): { lat: number; lng: number } | null => {
    if (!url) return null;
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
    const destMatch = url.match(/[?&]destination=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (destMatch) return { lat: parseFloat(destMatch[1]), lng: parseFloat(destMatch[2]) };
    return null;
  };

  const handleGoogleMapsUrlChange = (val: string) => {
    setMerchantGoogleMapsUrl(val);
    const parsed = extractCoordinatesFromGoogleMapsUrl(val);
    if (parsed) {
      setMerchantLatitude(parsed.lat);
      setMerchantLongitude(parsed.lng);
      setGpsStatus({
        type: "success",
        msg:
          locale === "fr"
            ? "Coordonnées extraites du lien Google Maps !"
            : locale === "es"
            ? "¡Coordenadas extraídas del enlace de Google Maps!"
            : "تم استخراج الإحداثيات تلقائياً من رابط خرائط Google بنجاح 🎯",
      });
    }
  };

  const handleDetectGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsStatus({
        type: "error",
        msg:
          locale === "fr"
            ? "La géolocalisation n'est pas supportée par votre navigateur"
            : locale === "es"
            ? "Geolocalización no soportada por su navegador"
            : "خاصية تحديد الموقع غير مدعومة في متصفحك",
      });
      return;
    }
    setIsDetectingGps(true);
    setGpsStatus(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setMerchantLatitude(lat);
        setMerchantLongitude(lng);
        setIsDetectingGps(false);
        setGpsStatus({
          type: "success",
          msg:
            locale === "fr"
              ? `Position GPS détectée avec succès (±${Math.round(pos.coords.accuracy)}m)`
              : locale === "es"
              ? `Ubicación GPS detectada con éxito (±${Math.round(pos.coords.accuracy)}m)`
              : `تم التقاط إحداثيات موقعك الجغرافي بنجاح (دقة ±${Math.round(pos.coords.accuracy)} متر) 📍`,
        });
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsStatus({
          type: "error",
          msg:
            locale === "fr"
              ? "Impossible d'accéder au GPS. Veuillez autoriser la localisation."
              : locale === "es"
              ? "Acceso GPS denegado. Permita la localización."
              : "تعذر الوصول للموقع. يرجى تفعيل إذن الموقع الجغرافي بالمتصفح.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSaveSuccessMsg(null);
    try {
      const latNum = Number(merchantLatitude);
      const lngNum = Number(merchantLongitude);

      const res = await fetch(`/api/m/${merchant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          actorRole: authRole,
          loyaltyMode: merchantLoyaltyMode,
          cashbackRate: Number(merchantCashbackRate),
          latitude: isNaN(latNum) ? undefined : latNum,
          longitude: isNaN(lngNum) ? undefined : lngNum,
          googleMapsUrl: merchantGoogleMapsUrl.trim(),
          radarMessage: merchantRadarMessage.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setMerchant((m) => ({
        ...m,
        loyaltyMode: merchantLoyaltyMode,
        cashbackRate: Number(merchantCashbackRate),
        latitude: isNaN(latNum) ? m.latitude : latNum,
        longitude: isNaN(lngNum) ? m.longitude : lngNum,
        googleMapsUrl: merchantGoogleMapsUrl.trim(),
        radarMessage: merchantRadarMessage.trim(),
      }));

      setSaveSuccessMsg(t.demo.savedSuccess);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Error saving merchant settings:", err);
      setGpsStatus({
        type: "error",
        msg:
          locale === "fr"
            ? "Erreur lors de l'enregistrement"
            : locale === "es"
            ? "Error al guardar"
            : "تعذر حفظ الإعدادات، يرجى المحاولة ثانية",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Clear legacy insecure sessionStorage keys on mount (now verified strictly via HttpOnly cookie)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`walink_m_pin_${merchant.slug}`);
        sessionStorage.removeItem(`walink_m_role_${merchant.slug}`);
        sessionStorage.removeItem(`walink_m_branch_${merchant.slug}`);
      } catch {
        // ignore
      }
    }
  }, [merchant.slug]);

  // PWA Home Screen Installation & Detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect standalone display mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (isStandaloneNavigator(navigator) && navigator.standalone === true);
    if (isStandaloneMode) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    // Ensure dynamic merchant manifest link is present in document head
    const existingLink = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
    const manifestUrl = `/api/m/${merchant.slug}/manifest`;
    if (existingLink) {
      existingLink.href = manifestUrl;
    } else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = manifestUrl;
      document.head.appendChild(link);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [merchant.slug]);

  const handleInstallApp = async () => {
    if (isInstalled) return;

    if (deferredInstallPrompt) {
      try {
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setDeferredInstallPrompt(null);
        }
      } catch (err) {
        console.warn("PWA install error:", err);
      }
    } else if (isIOS) {
      setShowIOSInstallGuide(true);
    } else {
      setShowIOSInstallGuide(true);
    }
  };

  const handleVerifyPin = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode || verifyingPin) return;

    setVerifyingPin(true);
    setPinError(false);
    setPinErrorMsg(null);

    try {
      const res = await fetch(`/api/m/${merchant.slug}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ pin: cleanCode }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        role?: MerchantAuthRole;
        branch?: BranchItem | null;
        staffName?: string | null;
        branches?: BranchItem[];
      };

      if (!res.ok || !data.ok || !data.role) {
        setPinError(true);
        setPinErrorMsg(data.error || "الكود غير صحيح، عاود المحاولة");
        setPinInput("");
        return;
      }

      const verifiedRole: MerchantAuthRole = data.role;
      const verifiedBranch = data.branch || null;
      const scopedBranches = Array.isArray(data.branches) ? data.branches : [];

      setAuthRole(verifiedRole);
      setAuthBranch(verifiedBranch);
      setAuthStaffName(data.staffName || null);
      setBranches(scopedBranches);

      if (verifiedRole === "BRANCH_STAFF" && verifiedBranch) {
        setSelectedBranchId(verifiedBranch.id);
        setDeviceBranchId(verifiedBranch.id);
        setAnalyticsBranchFilter(verifiedBranch.name);
      } else {
        setSelectedBranchId("ALL");
        setAnalyticsBranchFilter("ALL");
      }

      // Immediately hydrate authorized store data from /api/m/[slug] using newly issued HttpOnly cookie
      try {
        const storeRes = await fetch(`/api/m/${merchant.slug}?t=${Date.now()}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (storeRes.ok) {
          const storeData = await storeRes.json();
          if (Array.isArray(storeData.customers)) {
            customersRef.current = storeData.customers;
            setCustomers(storeData.customers);
          }
          if (Array.isArray(storeData.transactions)) {
            setTransactions(storeData.transactions);
          }
          if (Array.isArray(storeData.campaigns)) {
            setCampaigns(storeData.campaigns);
          }
          if (storeData.metrics) {
            setMetrics(storeData.metrics);
          }
          if (storeData.merchant) {
            setMerchant((prev) => ({
              ...prev,
              ...storeData.merchant,
            }));
          }
        }
      } catch (hydrateErr) {
        console.warn("Store post-auth hydration warning:", hydrateErr);
      }

      setActiveTab("home");
      setPinInput("");
      setIsUnlocked(true);
    } catch (err) {
      console.error("PIN verification request failed:", err);
      setPinError(true);
      setPinErrorMsg("تعذر الاتصال بالخادم، حاول مجدداً");
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleLogoutOrSwitchAccount = async () => {
    try {
      await fetch(`/api/m/${merchant.slug}/auth`, {
        method: "DELETE",
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // ignore network blip on logout
    }
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(`walink_m_pin_${merchant.slug}`);
        sessionStorage.removeItem(`walink_m_role_${merchant.slug}`);
        sessionStorage.removeItem(`walink_m_branch_${merchant.slug}`);
        localStorage.removeItem(`walink_branches_${merchant.slug}`);
      } catch {
        // ignore
      }
    }
    setIsUnlocked(false);
    setPinInput("");
    setPinError(false);
    setPinErrorMsg(null);
    setAuthRole("OWNER");
    setAuthBranch(null);
    setAuthStaffName(null);
    setBranches([]);
    setCustomers([]);
    customersRef.current = [];
    setTransactions([]);
    setCampaigns([]);
    setMonthlyAnalytics(null);
    setActiveTab("home");
    setIsMenuDrawerOpen(false);
  };

  // Monthly Analytics Data Fetcher (Phase 54)
  const fetchMonthlyAnalytics = useCallback(async (forceRefresh = false) => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const res = await fetch(`/api/m/${merchant.slug}/analytics/monthly?t=${Date.now()}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error("Failed to load analytics");
      const data: MonthlyAnalyticsResponse = await res.json();
      setMonthlyAnalytics(data);
      if (data.months && data.months.length > 0) {
        setSelectedMonthKey((prev) =>
          prev && data.months.some((m) => m.monthKey === prev) ? prev : data.months[0].monthKey
        );
      }
    } catch (err: unknown) {
      console.error("Failed to fetch monthly analytics:", err);
      setAnalyticsError(
        locale === "fr"
          ? "Erreur lors du chargement des données"
          : locale === "es"
          ? "Error al cargar los datos"
          : "تعذر تحميل التحليلات الشهرية"
      );
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [merchant.slug, locale]);

  useEffect(() => {
    if (activeTab === "analytics" && !monthlyAnalytics && !isLoadingAnalytics) {
      fetchMonthlyAnalytics(false);
    }
  }, [activeTab, monthlyAnalytics, isLoadingAnalytics, fetchMonthlyAnalytics]);

  const handleActionComplete = useCallback((
    updatedCustomer: CustomerSummary,
    msg: string,
    remainingCredits?: number,
    successData?: ActionSuccessPayload
  ) => {
    // Clear any existing toast and success modal timeouts before starting a new one
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    if (successModalTimeoutRef.current) {
      clearTimeout(successModalTimeoutRef.current);
      successModalTimeoutRef.current = null;
    }

    // Sync live credits count immediately when returned from transaction
    if (typeof remainingCredits === "number") {
      setMerchant((prev) => ({ ...prev, credits: remainingCredits }));
    }

    // Trigger light haptic feedback on mobile if supported
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // ignore
      }
    }

    // Set 3-Second Celebratory Operation Success Modal State
    if (successData) {
      setSuccessModalData(successData);
      successModalTimeoutRef.current = setTimeout(() => {
        setSuccessModalData(null);
        successModalTimeoutRef.current = null;
      }, 3000);
    } else {
      const isCb = updatedCustomer.loyaltyType === "CASHBACK";
      setSuccessModalData({
        type: isCb ? "CASHBACK" : "STAMP",
        customerName: updatedCustomer.name,
        memberCode: updatedCustomer.memberCode,
        stamps: updatedCustomer.stamps,
        stampsRequired: merchant.stampsRequired,
        cashbackBalance: updatedCustomer.cashbackBalance,
        currency: "DH",
      });
      successModalTimeoutRef.current = setTimeout(() => {
        setSuccessModalData(null);
        successModalTimeoutRef.current = null;
      }, 3000);
    }

    // Set trilingual floating toast banner
    setActionSuccessToast({
      message: msg,
      customerName: updatedCustomer.name,
      memberCode: updatedCustomer.memberCode,
    });

    // 4.5s debounce timeout for toast
    toastTimeoutRef.current = setTimeout(() => {
      setActionSuccessToast(null);
      toastTimeoutRef.current = null;
    }, 4500);

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === updatedCustomer.id
          ? {
            ...c,
            ...updatedCustomer,
            lastVisitAt: updatedCustomer.lastVisitAt || new Date().toISOString(),
          }
          : c
      )
    );

    // Update live metrics
    setMetrics((prev) => {
      const isNowReturning = updatedCustomer.totalVisits > 1;
      return {
        ...prev,
        totalVisits: prev.totalVisits + 1,
        returningCustomers: isNowReturning ? prev.returningCustomers : prev.returningCustomers,
      };
    });

    // Add local transaction
    const newTx: TransactionData = {
      id: `tx-${Date.now()}`,
      type: "STAMP_ADDED",
      stampsDelta: 1,
      note: msg,
      createdAt: new Date().toISOString(),
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        memberCode: updatedCustomer.memberCode,
        phone: updatedCustomer.phone,
      },
    };
    setTransactions((prev) => [newTx, ...prev.slice(0, 14)]);

    // Invalidate/refresh monthly analytics in background on new cashier action (Phase 54 Refinement 2)
    fetchMonthlyAnalytics(true);
  }, [fetchMonthlyAnalytics, merchant.stampsRequired]);

  // Direct 1-Click Customer Loyalty Actions (Phase 53)
  const handleDirectStamp = async (c: CustomerData) => {
    if (stampingCustomerId) return;
    if (merchant.credits <= 0) {
      soundEngine.playAlert();
      setIsCreditsOpen(true);
      return;
    }

    setStampingCustomerId(c.id);
    try {
      const res = await fetch(`/api/m/${merchant.slug}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: c.id,
          identifier: c.passSerial || c.memberCode,
          action: "STAMP",
          staffName: authRole === "BRANCH_STAFF" && liveAuthBranch ? liveAuthBranch.name : authStaffName || (locale === "fr" ? "Gérant" : locale === "es" ? "Gerente" : "المدير"),
          branchName: authRole === "BRANCH_STAFF" && liveAuthBranch ? liveAuthBranch.name : (isMultiBranch ? activeBranchName : undefined),
          overrideCooldown: isOwner,
          lang: locale,
        }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error === "OUT_OF_CREDITS") {
        soundEngine.playAlert();
        setIsCreditsOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || (locale === "fr" ? "Échec de l'ajout du tampon" : locale === "es" ? "Error al agregar sello" : "فشل إضافة الختم"));
      }

      soundEngine.playStampChime();
      const successPayload: ActionSuccessPayload = {
        type: "STAMP",
        customerName: data.customer.name,
        memberCode: data.customer.memberCode,
        stamps: data.customer.stamps,
        stampsRequired: merchant.stampsRequired,
        isRewardEarned: data.customer.stamps >= merchant.stampsRequired,
        rewardName: merchant.rewardName,
      };
      handleActionComplete(data.customer, data.message, data.remainingCredits, successPayload);
    } catch (err: unknown) {
      soundEngine.playAlert();
      const msg = err instanceof Error ? err.message : (locale === "fr" ? "Erreur lors du traitement" : "خطأ أثناء إضافة الختم");
      alert(msg);
    } finally {
      setStampingCustomerId(null);
    }
  };

  const handleDirectRedeem = async (c: CustomerData) => {
    if (stampingCustomerId) return;
    if (merchant.credits <= 0) {
      soundEngine.playAlert();
      setIsCreditsOpen(true);
      return;
    }

    setStampingCustomerId(c.id);
    try {
      const res = await fetch(`/api/m/${merchant.slug}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: c.id,
          identifier: c.passSerial || c.memberCode,
          action: "REDEEM",
          staffName: authRole === "BRANCH_STAFF" && liveAuthBranch ? liveAuthBranch.name : authStaffName || (locale === "fr" ? "Gérant" : locale === "es" ? "Gerente" : "المدير"),
          branchName: authRole === "BRANCH_STAFF" && liveAuthBranch ? liveAuthBranch.name : (isMultiBranch ? activeBranchName : undefined),
          overrideCooldown: isOwner,
          lang: locale,
        }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error === "OUT_OF_CREDITS") {
        soundEngine.playAlert();
        setIsCreditsOpen(true);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || (locale === "fr" ? "Échec de la remise du cadeau" : locale === "es" ? "Error al canjear regalo" : "فشل تسليم المكافأة"));
      }

      soundEngine.playRewardChime();
      const successPayload: ActionSuccessPayload = {
        type: "REDEEM",
        customerName: data.customer.name,
        memberCode: data.customer.memberCode,
        stamps: data.customer.stamps,
        stampsRequired: merchant.stampsRequired,
        rewardName: merchant.rewardName,
      };
      handleActionComplete(data.customer, data.message, data.remainingCredits, successPayload);
    } catch (err: unknown) {
      soundEngine.playAlert();
      const msg = err instanceof Error ? err.message : (locale === "fr" ? "Erreur lors du traitement" : "خطأ أثناء تسليم المكافأة");
      alert(msg);
    } finally {
      setStampingCustomerId(null);
    }
  };

  const handleOpenCashbackModal = (c: CustomerData) => {
    setPreselectedCustomer(c);
    setIsScannerOpen(true);
  };

  // Handle Switch to Promo Tab from Home Alert
  const handleSwitchToPromoQuiet = () => {
    if (isRestrictedStaff) return;
    setActiveTab("promo");
    setPromoAudience("QUIET");
    setPromoMessage(`توحشناك! دوز هاد السيمانة لـ ${merchant.name} وعندك طابع هدية`);
  };

  // Handle Promo Send
  const handleSendCampaign = async () => {
    if (isRestrictedStaff || !promoMessage.trim()) return;
    setSendingPromo(true);
    setPromoSuccessMsg(null);

    try {
      const res = await fetch(`/api/m/${merchant.slug}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          actorRole: authRole,
          title: "عرض ترويجي من " + merchant.name,
          message: promoMessage.trim(),
          audience: promoAudience,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "فشل إرسال الحملة");
      }

      setMerchant((prev) => ({ ...prev, credits: data.remainingCredits }));
      setCampaigns((prev) => [data.campaign, ...prev]);
      setPromoSuccessMsg(data.message);

      // Trigger lock screen peek overlay
      setPeekNotification({
        isOpen: true,
        shopName: merchant.name,
        title: "عرض حصري فـ شاشة الزبون",
        message: promoMessage,
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطأ أثناء إرسال الحملة");
    } finally {
      setSendingPromo(false);
    }
  };

  // Handle Automation Toggle
  const handleToggleAutomation = async (key: keyof typeof automations) => {
    if (isRestrictedStaff) return;
    const updated = { ...automations, [key]: !automations[key] };
    setAutomations(updated);
    setSavingSettings(true);

    try {
      await fetch(`/api/m/${merchant.slug}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ actorRole: authRole, [key]: updated[key] }),
      });
    } catch (err) {
      console.error("Error saving automation setting:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Test Merchant Automations Trigger
  const [testingCron, setTestingCron] = useState(false);
  const [cronTestMessage, setCronTestMessage] = useState<string | null>(null);

  const handleTestCronForMerchant = async () => {
    setTestingCron(true);
    setCronTestMessage(null);
    try {
      const res = await fetch("/api/cron/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          merchantId: merchant.id,
          forceDemo: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCronTestMessage(`تم تشغيل الأتمتة بنجاح! (${data.stats.totalNotifications} إشعار أرسل)`);
        setPeekNotification({
          isOpen: true,
          shopName: merchant.name,
          title: "توحشناك! 🎁 (رسالة استرجاع تجريبية)",
          message: `توحشناك ${merchant.customerPrefix}! هادي كثر من 15 يوم ما بانتيش عندنا في ${merchant.name}. دوز هاد السيمانة وعندك طابع هدية 🎁`,
        });
        if (data.stats && data.stats.creditsDeducted > 0) {
          setMerchant((prev) => ({
            ...prev,
            credits: Math.max(0, prev.credits - data.stats.creditsDeducted),
          }));
        }
      } else {
        setCronTestMessage("تعذر تشغيل الاختبار: " + (data.error || "خطأ غير معروف"));
      }
    } catch (err) {
      console.error("Test cron error:", err);
      setCronTestMessage("حدث خطأ أثناء تجربة الأتمتة");
    } finally {
      setTestingCron(false);
    }
  };

  // Filtered CRM customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(crmSearch.toLowerCase()) ||
      c.memberCode.includes(crmSearch) ||
      c.phone.includes(crmSearch);

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const isQuiet = new Date(c.lastVisitAt) <= fourteenDaysAgo;
    const isVip = c.totalVisits >= 10;
    const isActive = !isQuiet;

    if (crmFilter === "VIP") return matchesSearch && isVip;
    if (crmFilter === "QUIET") return matchesSearch && isQuiet;
    if (crmFilter === "ACTIVE") return matchesSearch && isActive;
    return matchesSearch;
  });

  // Calculate target count for selected audience
  const audienceTargetCount =
    promoAudience === "ALL"
      ? metrics.audienceCounts.all
      : promoAudience === "QUIET"
        ? metrics.audienceCounts.quiet
        : promoAudience === "NEAR_REWARD"
          ? metrics.audienceCounts.near
          : metrics.audienceCounts.vip;

  const costCredits = Math.max(1, audienceTargetCount);
  const remainingCredits = merchant.credits - costCredits;

  // PIN Gate Screen (Server-Verified HttpOnly Auth — Zero PIN Leakage)
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 text-[#173E30]">
        <div className="w-full max-w-xs bg-[#FFFDF7] p-6 rounded-3xl border border-[#DCE0D4] shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#008069]/10 text-[#008069] border border-[#008069]/20 mx-auto flex items-center justify-center shadow-sm">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <h2 className="font-bold text-lg text-[#173E30]">{merchant.name}</h2>
            <p className="text-xs text-[#5F655D] mt-1">
              {merchant.hasBranchPins
                ? locale === "fr"
                  ? "Entrez le PIN propriétaire ou le PIN de votre succursale"
                  : locale === "es"
                  ? "Introduce el PIN de gerente o de tu sucursal"
                  : "أدخل رمز المدير أو رمز الكاشير الخاص بالفرع"
                : locale === "fr"
                ? "Tableau de bord commerçant • Entrez votre code PIN"
                : "لوحة تشغيل التاجر • أدخل الرمز السري (PIN)"}
            </p>
          </div>

          {merchant.slug === "cafe-atlas" && (
            <div className="p-2.5 rounded-xl bg-[#008069]/10 border border-[#008069]/20 text-[#008069] text-xs flex items-center justify-center gap-1.5 font-semibold">
              <span>كود التجربة (Demo):</span>
              <strong className="font-mono text-sm tracking-widest">1234</strong>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyPin(pinInput);
            }}
            className="space-y-3"
          >
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                setPinInput(digitsOnly);
                if (pinError) {
                  setPinError(false);
                  setPinErrorMsg(null);
                }
              }}
              placeholder="••••"
              aria-label="رمز PIN للتاجر أو الكاشير"
              className="w-full bg-[#FAF7F2] border border-[#C8D1BE] rounded-2xl py-3 text-center text-xl font-mono tracking-widest text-[#008069] focus:outline-none focus:border-[#008069] focus:bg-white"
            />
            <span className="text-[10px] text-[#5F655D] block">
              {locale === "fr"
                ? "Code PIN de 4 à 6 chiffres"
                : locale === "es"
                ? "Código PIN de 4 a 6 dígitos"
                : "رمز سري من 4 إلى 6 أرقام"}
            </span>

            {pinError && (
              <p className="text-xs text-red-600 font-semibold">
                {pinErrorMsg || "الكود غير صحيح، عاود المحاولة"}
              </p>
            )}

            <button
              type="submit"
              disabled={verifyingPin || pinInput.trim().length < 4}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#008069]/20 transition cursor-pointer"
            >
              {verifyingPin ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              <span>
                {verifyingPin
                  ? locale === "fr"
                    ? "Vérification..."
                    : "جاري التحقق..."
                  : locale === "fr"
                  ? "Se connecter"
                  : locale === "es"
                  ? "Iniciar sesión"
                  : "تسجيل الدخول"}
              </span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <a href={getAdminUrl()} className="text-[11px] text-[#5F655D] hover:text-[#008069] font-medium transition">
              الرجوع للوحة السوبر أدمن
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAF7F2] flex justify-center text-[#173E30] selection:bg-[#008069] selection:text-white font-arabic ${isFrameMode ? "py-8" : ""}`}>
      {/* Floating Cashier Action Success Toast Banner (Trilingual: AR, FR, ES) */}
      {actionSuccessToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-top-3 fade-in duration-300"
        >
          <div className="bg-gradient-to-r from-[#008069] to-[#00A884] text-white p-3.5 rounded-2xl shadow-xl shadow-[#008069]/30 border border-white/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 rounded-xl bg-white/20 text-white shrink-0 shadow-sm">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs">
                    {locale === "ar"
                      ? "تمت العملية بنجاح! ⭐"
                      : locale === "fr"
                      ? "Opération réussie ! ⭐"
                      : "¡Operación completada! ⭐"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono font-bold">
                    #{actionSuccessToast.memberCode}
                  </span>
                </div>
                <p className="text-[11px] text-white/95 truncate font-medium mt-0.5">
                  {actionSuccessToast.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (toastTimeoutRef.current) {
                  clearTimeout(toastTimeoutRef.current);
                  toastTimeoutRef.current = null;
                }
                setActionSuccessToast(null);
              }}
              aria-label={locale === "ar" ? "إغلاق الإشعار" : locale === "fr" ? "Fermer l'alerte" : "Cerrar aviso"}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* 3-Second Celebratory Operation Success Modal (Phase 59) */}
      {successModalData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          {/* Accessible Backdrop */}
          <button
            type="button"
            aria-label="إغلاق نافذة النجاح"
            className="fixed inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              if (successModalTimeoutRef.current) {
                clearTimeout(successModalTimeoutRef.current);
                successModalTimeoutRef.current = null;
              }
              setSuccessModalData(null);
            }}
          />

          <div
            className="relative z-10 w-full max-w-sm bg-[#FFFDF7] border-2 border-[#008069]/30 rounded-3xl p-6 text-center text-[#173E30] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 cursor-default"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                if (successModalTimeoutRef.current) {
                  clearTimeout(successModalTimeoutRef.current);
                  successModalTimeoutRef.current = null;
                }
                setSuccessModalData(null);
              }}
              aria-label={locale === "ar" ? "إغلاق" : "Fermer"}
              className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-[#FAF7F2] text-[#5F655D] hover:text-[#173E30] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Celebration Icon Header */}
            <div className="flex justify-center mb-3">
              {successModalData.type === "CASHBACK" ? (
                <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 shadow-md">
                  <Coins className="w-9 h-9 stroke-[2.2] animate-bounce" />
                </div>
              ) : successModalData.type === "REDEEM" ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-[#008069] shadow-md">
                  <Gift className="w-9 h-9 stroke-[2.2] animate-bounce" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#008069]/15 border-2 border-[#008069]/40 flex items-center justify-center text-[#008069] shadow-md">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.4] text-[#008069]" />
                </div>
              )}
            </div>

            {/* Title & Customer Pill */}
            <div className="space-y-1 mb-4">
              <h3 className="font-extrabold text-lg text-[#173E30]">
                {successModalData.type === "CASHBACK"
                  ? locale === "ar"
                    ? "تمت إضافة الكاش باك بنجاح! 💰"
                    : locale === "fr"
                    ? "Cashback ajouté avec succès ! 💰"
                    : "¡Cashback añadido con éxito! 💰"
                  : successModalData.type === "REDEEM"
                  ? locale === "ar"
                    ? "تم تسليم المكافأة بنجاح! 🎁"
                    : locale === "fr"
                    ? "Récompense remise avec succès ! 🎁"
                    : "¡Recompensa entregada con éxito! 🎁"
                  : successModalData.isRewardEarned
                  ? locale === "ar"
                    ? "🎉 مبروك! الزبون أكمل البطاقة!"
                    : locale === "fr"
                    ? "🎉 Félicitations ! Carte complétée !"
                    : "🎉 ¡Felicidades! ¡Tarjeta completada!"
                  : locale === "ar"
                  ? "تمت إضافة الختم بنجاح! ⭐"
                  : locale === "fr"
                  ? "Tampon ajouté avec succès ! ⭐"
                  : "¡Sello añadido con éxito! ⭐"}
              </h3>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#DCE0D4] text-xs">
                <span className="font-bold text-[#173E30]">{successModalData.customerName}</span>
                <span className="text-[#5F655D] font-mono font-semibold">#{successModalData.memberCode}</span>
              </div>
            </div>

            {/* Metrics Display Box */}
            {successModalData.type === "CASHBACK" ? (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 mb-4 text-xs">
                <div className="flex items-baseline justify-center gap-1 font-mono text-amber-700">
                  <span className="text-2xl font-black">
                    +{Number(successModalData.cashbackEarned || 0).toFixed(2)}
                  </span>
                  <span className="text-sm font-bold">{successModalData.currency || "DH"}</span>
                </div>
                <p className="text-[11px] text-amber-800 font-semibold">
                  {locale === "ar"
                    ? "أُضيف إلى رصيد المحفظة"
                    : locale === "fr"
                    ? "Ajouté au solde du portefeuille"
                    : "Añadido al saldo del monedero"}
                  {successModalData.billAmount ? (
                    <span className="block text-[10px] text-amber-700/80 mt-0.5">
                      {locale === "ar"
                        ? `(من فاتورة بقيمة ${successModalData.billAmount} DH)`
                        : `(Facture de ${successModalData.billAmount} DH)`}
                    </span>
                  ) : null}
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-[#5F655D] font-medium">
                    {locale === "ar" ? "رصيد المحفظة الجديد:" : "Nouveau solde :"}
                  </span>
                  <span className="font-mono font-bold text-amber-900">
                    {Number(successModalData.cashbackBalance || 0).toFixed(2)} {successModalData.currency || "DH"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5 mb-4 text-xs">
                <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-800 text-sm">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-mono font-black text-base shadow-sm">
                    +1
                  </span>
                  <span>
                    {locale === "ar" ? "طابع مضاف للبطاقة" : "Tampon ajouté"}
                  </span>
                </div>

                {/* Stamp Circles Visual Indicator */}
                <div className="flex items-center justify-center gap-1.5 py-1 flex-wrap">
                  {Array.from({ length: successModalData.stampsRequired || merchant.stampsRequired || 8 }).map((_, idx) => {
                    const isFilled = idx < (successModalData.stamps ?? 0);
                    return (
                      <div
                        key={idx}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          isFilled
                            ? "bg-[#008069] text-white shadow-sm scale-105"
                            : "bg-white border border-[#C8D1BE] text-[#5F655D]"
                        }`}
                      >
                        {isFilled ? "✓" : idx + 1}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-[#5F655D]">
                  <span>{locale === "ar" ? "مجموع الأختام:" : "Total tampons :"}</span>
                  <span className="font-mono font-bold text-[#008069]">
                    {successModalData.stamps} / {successModalData.stampsRequired || merchant.stampsRequired}
                  </span>
                </div>

                {successModalData.isRewardEarned && (
                  <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] animate-pulse">
                    🎁 {merchant.rewardName || "مكافأة الزبون المميز"}
                  </div>
                )}
              </div>
            )}

            {/* Auto-Dismiss Timer Bar */}
            <div className="space-y-1">
              <div className="w-full bg-[#E8EDE3] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#008069] h-full animate-shrink-progress" />
              </div>
              <p className="text-[10px] text-[#5F655D]">
                {locale === "ar"
                  ? "تختفي هذه النافذة تلقائياً خلال 3 ثوانٍ (أو انقر للمتابعة)"
                  : locale === "fr"
                  ? "Fermeture automatique dans 3s (ou cliquez)"
                  : "Cierre automático en 3s (o haga clic)"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Centered Mobile Container */}
      <div
        className={`w-full max-w-[440px] flex flex-col justify-between bg-[#FAF7F2] text-[#173E30] relative ${isFrameMode
          ? "rounded-[48px] border-[6px] border-slate-400 shadow-2xl shadow-slate-400/50 overflow-hidden min-h-[820px] bg-[#FAF7F2]"
          : "min-h-screen border-x border-[#DCE0D4]"
          }`}
      >
        {/* Top App Bar - WhatsApp Business Dark Teal Header with Safe Area Insets */}
        <header
          className="sticky top-0 z-30 px-3.5 pb-3 bg-[#075E54] text-white shadow-md flex items-center justify-between transition-all"
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          }}
        >
          {/* Menu Drawer Toggle Button + Merchant Branding */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMenuDrawerOpen(true)}
              aria-label={locale === "ar" ? "فتح القائمة الرئيسية" : "Ouvrir le menu"}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-white transition flex items-center justify-center shadow-sm cursor-pointer"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm text-white truncate max-w-[140px]">
                {merchant.name}
              </h1>
              {isRestrictedStaff ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-[#075E54] font-extrabold flex items-center gap-1 shadow-sm">
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[90px]">
                    {liveAuthBranch ? liveAuthBranch.name : authStaffName || (locale === "fr" ? "Caissier" : "كاشير")}
                  </span>
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-bold">
                  {merchant.plan}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Credits Counter Pill */}
            <button
              type="button"
              onClick={() => setIsCreditsOpen(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-xs font-bold transition shadow-sm ${
                merchant.credits <= 20
                  ? "bg-amber-500/25 border border-amber-400 text-amber-200 ring-2 ring-amber-400/50 animate-pulse"
                  : "bg-white/15 hover:bg-white/25 border border-white/20 text-amber-300"
              }`}
              title={
                merchant.credits <= 20
                  ? locale === "ar"
                    ? "رصيد النقاط منخفض! اضغط للشحن"
                    : locale === "fr"
                    ? "Crédits faibles ! Cliquez pour recharger"
                    : "¡Créditos bajos! Haga clic para recargar"
                  : undefined
              }
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{merchant.credits}</span>
            </button>

            {/* Stand QR Button */}
            <button
              type="button"
              onClick={() => setIsStandOpen(true)}
              title="عرض ستاند الكاونتر الذكي"
              aria-label="عرض ستاند الكاونتر الذكي"
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-white" />
            </button>
          </div>
        </header>

        {/* Prominent Scanner Bar Button (Always on Top) */}
        <div className="p-3.5 pb-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-[#008069]/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Camera className="w-5 h-5 stroke-[2.5]" />
            <span>
              {locale === "ar"
                ? "📷 مسح بطاقة العميل / إضافة ختم أو كاش باك"
                : locale === "fr"
                  ? "📷 Scanner la carte / Tampon ou Cashback"
                  : "📷 Escanear tarjeta / Sello o Cashback"}
            </span>
          </button>
        </div>

        {/* Tab 1: الرئيسية (Home) */}
        {activeTab === "home" && (
          <div className="p-3.5 space-y-4 flex-1 animate-in fade-in duration-200">
            {/* Multi-Branch Selector Header (MULTI Plan Exclusive) */}
            {isMultiBranch && branches.length > 0 && (
              isRestrictedStaff && liveAuthBranch ? (
                <div className="flex items-center justify-between p-3 bg-[#FFFDF7] rounded-2xl border border-[#DCE0D4] shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-[#173E30] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#008069]" />
                      <span>{locale === "fr" ? "Point de vente :" : locale === "es" ? "Sucursal:" : "الفرع النشط:"}</span>
                      <span className="text-[#008069]">{liveAuthBranch.name}</span>
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    {locale === "fr" ? "Compte caissier" : locale === "es" ? "Cajero" : "حساب فرع"}
                  </span>
                </div>
              ) : isOwner ? (
                <div className="space-y-2 p-3 bg-[#FFFDF7] rounded-2xl border border-[#DCE0D4] shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#008069]" />
                      <span className="font-bold text-xs text-[#173E30]">
                        {t.demo.branch}:
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#008069]/10 text-[#008069] font-bold border border-[#008069]/20">
                        MULTI ({branches.length} {locale === "fr" ? "succursales" : locale === "es" ? "sucursales" : "فروع"})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("settings")}
                      className="text-[11px] text-[#008069] hover:underline font-bold flex items-center gap-1"
                    >
                      <span>{t.demo.manageBranches}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Branches Horizontal Pill Switcher */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedBranchId("ALL")}
                      className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition text-xs font-bold flex items-center gap-1.5 ${
                        selectedBranchId === "ALL"
                          ? "bg-[#008069] border-[#008069] text-white shadow-sm"
                          : "bg-[#FAF7F2] border-[#C8D1BE] text-[#5F655D] hover:bg-[#DCE0D4]"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{t.demo.allBranches}</span>
                    </button>

                    {branches.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBranchId(b.id)}
                        className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition text-xs font-semibold flex items-center gap-1.5 ${
                          selectedBranchId === b.id
                            ? "bg-[#008069] border-[#008069] text-white shadow-sm"
                            : "bg-white border-[#C8D1BE] text-[#5F655D] hover:bg-[#FAF7F2]"
                        }`}
                      >
                        <span>📍 {b.name}</span>
                        {b.isMain && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-bold">
                            {t.demo.mainBranch}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null
            )}

            {/* 2x2 KPI Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm">
                <span className="text-[11px] text-[#5F655D] block">
                  {selectedBranch ? `${t.demo.branchVisitsLabel} (${selectedBranch.name})` : "زيارات (إجمالي)"}
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#173E30]">
                    {selectedBranch ? branchVisitsCount : metrics.totalVisits}
                  </span>
                  <span className="text-[10px] text-[#008069] font-bold font-mono">
                    +18%
                  </span>
                </div>
              </div>

              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm">
                <span className="text-[11px] text-[#5F655D] block">كليان رجعو</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-[#173E30]">
                    {metrics.returningCustomers}
                  </span>
                  <span className="text-[10px] text-[#008069] font-bold font-mono">
                    +11%
                  </span>
                </div>
              </div>

              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm">
                <span className="text-[11px] text-[#5F655D] block">كادوات تعطاو</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-amber-600">
                    {metrics.totalRewards}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">مكافأة</span>
                </div>
              </div>

              <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm">
                <span className="text-[11px] text-[#5F655D] block">تقييم Google</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-amber-600 flex items-center gap-1">
                    4.8 <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </span>
                </div>
              </div>
            </div>

            {/* Inactive Customers Alert (Owner Promo Trigger Only) */}
            {isOwner && metrics.audienceCounts.quiet > 0 && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between shadow-sm">
                <div>
                  <span className="font-bold text-xs text-red-900 block">
                    {metrics.audienceCounts.quiet} كليان غبرو هادي 15 يوم
                  </span>
                  <span className="text-[10px] text-red-700">
                    صيفط ليهم إشعار &quot;توحشناك&quot; يرجعو دابا
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchToPromoQuiet}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-sm"
                >
                  رجعهم
                </button>
              </div>
            )}

            {/* Branch Performance Comparison Card (MULTI Plan Global View) */}
            {isMultiBranch && isOwner && selectedBranchId === "ALL" && branches.length > 1 && (
              <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#DCE0D4] shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#173E30] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#008069]" />
                    <span>{t.demo.branchStatsComparison}</span>
                  </span>
                  <span className="text-[10px] text-[#5F655D]">
                    {branches.length} {t.demo.branch}
                  </span>
                </div>

                <div className="space-y-2">
                  {branches.map((b) => {
                    const branchTxs = transactions.filter((t) => t.branchName === b.name);
                    const bVisits = branchTxs.filter((t) => t.type === "STAMP_ADDED" || t.type === "CASHBACK_EARNED").length;
                    const pct = metrics.totalVisits > 0 ? Math.min(100, Math.round((bVisits / metrics.totalVisits) * 100)) : 0;
                    return (
                      <div key={b.id} className="p-2.5 rounded-xl bg-[#FAF7F2] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#173E30]">{b.name}</span>
                            <span className="text-[10px] text-[#5F655D]">({b.city})</span>
                            {b.isMain && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-bold">
                                {t.demo.mainBranch}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-[#008069]">
                            {bVisits} زيارة ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#C8D1BE] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#00A884] to-[#008069] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weekly Visits Dynamic Bar Chart */}
            <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#DCE0D4] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#173E30]">هاد السيمانة — زيارات</span>
                <span className="text-[11px] text-[#008069] font-mono font-bold">
                  +{metrics.totalVisits * 12} درهم نشاط
                </span>
              </div>

              <div className="h-24 flex items-end justify-between gap-2 pt-2 px-1">
                {[
                  { day: "إثن", h: "45%" },
                  { day: "ثلا", h: "60%" },
                  { day: "أرب", h: "35%" },
                  { day: "خمي", h: "80%" },
                  { day: "جمع", h: "95%" },
                  { day: "سبت", h: "100%" },
                  { day: "أحد", h: `${Math.min(100, Math.max(30, metrics.totalVisits * 8))}%`, today: true },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${bar.today
                        ? "bg-gradient-to-t from-[#008069] to-[#00A884] shadow-sm"
                        : "bg-[#DCE0D4] hover:bg-[#C8D1BE]"
                        }`}
                      style={{ height: bar.h }}
                    />
                    <span className={`text-[10px] ${bar.today ? "text-[#008069] font-bold" : "text-[#5F655D]"}`}>
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#DCE0D4] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#173E30]">آخر الحركات</span>
                {selectedBranch && (
                  <span className="text-[10px] text-[#008069] font-bold">
                    📍 {selectedBranch.name}
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {displayedTransactions.length === 0 ? (
                  <p className="text-center py-4 text-xs text-[#5F655D]">
                    لا توجد معاملات مسجلة في هذا الفرع بعد.
                  </p>
                ) : (
                  displayedTransactions.slice(0, 6).map((tx: TransactionData) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DCE0D4] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#008069]/10 text-[#008069] flex items-center justify-center font-bold text-[11px]">
                          {tx.customer.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#173E30]">
                              {tx.customer.name}
                            </span>
                            {tx.branchName && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white border border-[#C8D1BE] text-[#5F655D]">
                                📍 {tx.branchName}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#5F655D] font-mono block">
                            {formatTimeAgoArabic(tx.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold font-mono ${tx.stampsDelta > 0 ? "text-[#008069]" : "text-amber-600"
                          }`}
                      >
                        {tx.note || (tx.stampsDelta > 0 ? "+1 طابع" : "استلام مكافأة")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: الكليان (CRM) */}
        {activeTab === "customers" && (
          <div className="p-3.5 space-y-3.5 flex-1 animate-in fade-in duration-200">
            {/* Search Input & Quick Add Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={crmSearch}
                  onChange={(e) => setCrmSearch(e.target.value)}
                  placeholder="قلّب بالسمية، النمرة، ولا الكود #..."
                  aria-label="بحث في قائمة الزبائن"
                  className="w-full bg-white border border-[#C8D1BE] rounded-2xl px-4 py-2.5 text-xs text-[#173E30] placeholder-[#5F655D] focus:outline-none focus:border-[#008069] shadow-sm"
                />
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#5F655D]" />
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(true)}
                className="px-3 py-2.5 rounded-2xl bg-[#008069] hover:bg-[#00705a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition shrink-0 cursor-pointer"
                title="إضافة زبون جديد يدوياً"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">إضافة زبون</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: "ALL", label: `الكل (${customers.length})` },
                { id: "VIP", label: `VIP (${metrics.audienceCounts.vip})` },
                { id: "ACTIVE", label: "نشيط" },
                { id: "QUIET", label: `غبر (${metrics.audienceCounts.quiet})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCrmFilter(f.id as typeof crmFilter)}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition font-medium ${crmFilter === f.id
                    ? "bg-[#008069] text-white font-bold border-[#008069] shadow-sm"
                    : "bg-white border-[#C8D1BE] text-[#5F655D] hover:bg-[#FAF7F2]"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Customers List */}
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-xs text-[#5F655D] py-8">لا يوجد زبائن مطابقين</p>
              ) : (
                filteredCustomers.map((c) => {
                  const isQuiet = new Date(c.lastVisitAt) <= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                  const isVip = c.totalVisits >= 10;
                  const isCashbackCust = c.loyaltyType === "CASHBACK";
                  const isLocked = Boolean(c.pinLockedUntil && new Date(c.pinLockedUntil) > new Date());
                  return (
                    <div
                      key={c.id}
                      className={`w-full p-3.5 rounded-2xl bg-[#FFFDF7] border ${
                        isLocked ? "border-red-300 ring-1 ring-red-300 bg-red-50/20" : "border-[#DCE0D4]"
                      } shadow-sm space-y-2.5 text-xs transition`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#173E30] border border-[#DCE0D4] font-bold flex items-center justify-center shrink-0">
                            {c.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#173E30]">{c.name}</span>
                              <span className="font-mono text-[10px] text-[#5F655D]">
                                #{c.memberCode}
                              </span>
                              {isLocked && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                                  🔒 مقفل مؤقتاً
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#5F655D] block">
                              {c.phone} • {c.totalVisits} زيارات • آخر زيارة: {formatTimeAgoArabic(c.lastVisitAt)}
                            </span>
                          </div>
                        </div>

                        <div className="text-end flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isVip
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : isQuiet
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : isCashbackCust
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-[#008069]/10 text-[#008069] border border-[#008069]/20"
                              }`}
                          >
                            {isVip ? "VIP" : isQuiet ? "غائب" : isCashbackCust ? "كاش باك" : "أختام"}
                          </span>
                          <div className="text-end">
                            {isCashbackCust ? (
                              <span className="font-mono font-bold text-amber-600 text-xs block">
                                {Number(c.cashbackBalance || 0).toFixed(2)} {merchant.currency || "DH"}
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-[#008069] text-xs block">
                                {c.stamps}/{merchant.stampsRequired}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Cashier Actions Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#FAF7F2] gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Security PIN Badge & Cashier Reset Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenPinReset(c)}
                            className="px-2.5 py-1 rounded-xl bg-[#FAF7F2] hover:bg-[#DCE0D4] border border-[#C8D1BE] text-[#173E30] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            title="إدارة أو تغيير رمز PIN"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-[#008069]" />
                            <span>PIN: <strong className="font-mono">{c.securityPin || c.memberCode}</strong></span>
                          </button>

                          {/* Instant Account Unlock Action */}
                          {isLocked && (
                            <button
                              type="button"
                              onClick={() => handleUnlockCustomer(c)}
                              className="px-2.5 py-1 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                              title="إلغاء قفل الحساب فوراً"
                            >
                              <Unlock className="w-3.5 h-3.5 text-red-600" />
                              <span>{locale === "ar" ? "فك القفل" : "Débloquer"}</span>
                            </button>
                          )}
                        </div>

                        {isCashbackCust || merchant.loyaltyMode === "CASHBACK" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCashbackModal(c)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-300/60 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ms-auto shadow-sm active:scale-95"
                          >
                            <Coins className="w-3.5 h-3.5 text-amber-600" />
                            <span>{locale === "fr" ? "+ Cashback" : locale === "es" ? "+ Cashback" : "+ كاش باك"}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 ms-auto">
                            {c.stamps >= merchant.stampsRequired && (
                              <button
                                type="button"
                                disabled={stampingCustomerId === c.id}
                                onClick={() => handleDirectRedeem(c)}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                                title={locale === "fr" ? "Remettre le cadeau" : locale === "es" ? "Entregar premio" : "تسليم المكافأة"}
                              >
                                {stampingCustomerId === c.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Gift className="w-3.5 h-3.5 text-purple-200" />
                                )}
                                <span>{locale === "fr" ? "Cadeau 🎁" : locale === "es" ? "Regalo 🎁" : "تسليم 🎁"}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={stampingCustomerId === c.id}
                              onClick={() => handleDirectStamp(c)}
                              className="px-3 py-1.5 rounded-xl bg-[#008069] hover:bg-[#00705a] text-white text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                              title={locale === "fr" ? "Ajouter un tampon directement" : locale === "es" ? "Agregar sello directamente" : "إضافة ختم مباشرة للزبون"}
                            >
                              {stampingCustomerId === c.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Stamp className="w-3.5 h-3.5" />
                              )}
                              <span>{locale === "fr" ? "+1 Tampon" : locale === "es" ? "+1 Sello" : "+1 ختم"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab: التقارير الشهرية (Monthly Multi-Branch Analytics) */}
        {activeTab === "analytics" && (
          <div className="p-3.5 space-y-4 flex-1 animate-in fade-in duration-200">
            {/* Header with Title and Refresh Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#008069]/10 text-[#008069] flex items-center justify-center font-bold">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#173E30]">
                    {t.demo.monthlyReports}
                  </h2>
                  <p className="text-[10px] text-[#5F655D]">
                    {locale === "fr"
                      ? "Performances & historique mensuel"
                      : locale === "es"
                      ? "Rendimiento e historial mensual"
                      : "تحليلات وأداء الأشهر الفائتة"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchMonthlyAnalytics(true)}
                disabled={isLoadingAnalytics}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#C8D1BE] text-[#5F655D] text-[11px] font-semibold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                title={locale === "fr" ? "Actualiser" : locale === "es" ? "Actualizar" : "تحديث البيانات"}
              >
                <Loader2 className={`w-3.5 h-3.5 ${isLoadingAnalytics ? "animate-spin text-[#008069]" : ""}`} />
                <span>{locale === "fr" ? "Actualiser" : locale === "es" ? "Actualizar" : "تحديث"}</span>
              </button>
            </div>

            {/* Skeleton Loading State */}
            {isLoadingAnalytics && !monthlyAnalytics && (
              <div className="space-y-3 animate-pulse">
                <div className="h-10 bg-white rounded-2xl border border-[#DCE0D4]" />
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="h-24 bg-white rounded-2xl border border-[#DCE0D4]" />
                  <div className="h-24 bg-white rounded-2xl border border-[#DCE0D4]" />
                  <div className="h-24 bg-white rounded-2xl border border-[#DCE0D4]" />
                  <div className="h-24 bg-white rounded-2xl border border-[#DCE0D4]" />
                </div>
                <div className="h-36 bg-white rounded-2xl border border-[#DCE0D4]" />
              </div>
            )}

            {/* Error State */}
            {!isLoadingAnalytics && analyticsError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-2">
                <p className="text-xs font-bold text-red-700">{analyticsError}</p>
                <button
                  type="button"
                  onClick={() => fetchMonthlyAnalytics(true)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  {locale === "fr" ? "Réessayer" : locale === "es" ? "Reintentar" : "إعادة المحاولة"}
                </button>
              </div>
            )}

            {/* Populated Analytics View */}
            {monthlyAnalytics && (
              <div className="space-y-3.5">
                {/* 1. Month Selector Pills (Horizontal Scroll) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {monthlyAnalytics.months.map((m) => {
                    const isSelected = m.monthKey === selectedMonthKey;
                    return (
                      <button
                        key={m.monthKey}
                        type="button"
                        onClick={() => setSelectedMonthKey(m.monthKey)}
                        className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                          isSelected
                            ? "bg-[#008069] border-[#008069] text-white shadow-sm"
                            : "bg-white border-[#C8D1BE] text-[#5F655D] hover:bg-[#FAF7F2]"
                        }`}
                      >
                        <span>{formatMonthTitle(m.monthKey, locale)}</span>
                        {m.isCurrentMonth && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {locale === "fr" ? "En cours" : locale === "es" ? "Actual" : "الحالي"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 2. Branch Filter Tabs (For Multi-Branch Merchants) */}
                {monthlyAnalytics.isMultiBranch && monthlyAnalytics.branches.length > 1 && (
                  isRestrictedStaff && liveAuthBranch ? (
                    <div className="p-2.5 bg-[#FFFDF7] rounded-2xl border border-[#DCE0D4] shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#173E30]">
                        <Building2 className="w-3.5 h-3.5 text-[#008069]" />
                        <span>{locale === "fr" ? "Rapport de succursale :" : locale === "es" ? "Informe de sucursal:" : "تقرير الفرع:"}</span>
                        <span className="text-[#008069]">{liveAuthBranch.name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {locale === "fr" ? "Verrouillé" : "مقفل للفرع"}
                      </span>
                    </div>
                  ) : isOwner ? (
                    <div className="space-y-1.5 p-2.5 bg-[#FFFDF7] rounded-2xl border border-[#DCE0D4] shadow-sm">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#173E30]">
                        <Building2 className="w-3.5 h-3.5 text-[#008069]" />
                        <span>{locale === "fr" ? "Filtrer par succursale :" : locale === "es" ? "Filtrar por sucursal:" : "تصفية حسب الفرع:"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                        <button
                          type="button"
                          onClick={() => setAnalyticsBranchFilter("ALL")}
                          className={`px-2.5 py-1 rounded-xl border whitespace-nowrap transition text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                            analyticsBranchFilter === "ALL"
                              ? "bg-[#008069] border-[#008069] text-white shadow-sm"
                              : "bg-[#FAF7F2] border-[#C8D1BE] text-[#5F655D] hover:bg-[#DCE0D4]"
                          }`}
                        >
                          <Globe className="w-3 h-3" />
                          <span>{t.demo.allBranchesCombined}</span>
                        </button>

                        {monthlyAnalytics.branches.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setAnalyticsBranchFilter(b.name)}
                            className={`px-2.5 py-1 rounded-xl border whitespace-nowrap transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                              analyticsBranchFilter === b.name
                                ? "bg-[#008069] border-[#008069] text-white shadow-sm"
                                : "bg-white border-[#C8D1BE] text-[#5F655D] hover:bg-[#FAF7F2]"
                            }`}
                          >
                            <span>📍 {b.name}</span>
                            {b.isMain && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-amber-400 text-amber-950 font-bold">
                                {t.demo.mainBranch}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}

                {/* 3. Selected Month KPIs */}
                {(() => {
                  const selectedMonth =
                    monthlyAnalytics.months.find((m) => m.monthKey === selectedMonthKey) ||
                    monthlyAnalytics.months[0];

                  if (!selectedMonth) {
                    return (
                      <p className="text-center text-xs text-[#5F655D] py-8">
                        {locale === "fr" ? "Aucune donnée disponible" : "لا توجد بيانات متاحة لهذا الشهر"}
                      </p>
                    );
                  }

                  // Determine effective stats based on branch filter
                  const isAllBranches = analyticsBranchFilter === "ALL";
                  const targetBranchStat = !isAllBranches
                    ? selectedMonth.branches.find((b) => b.branchName === analyticsBranchFilter)
                    : null;

                  const displayVisits = isAllBranches
                    ? selectedMonth.combined.totalVisits
                    : targetBranchStat?.visits || 0;

                  const displayRewards = isAllBranches
                    ? selectedMonth.combined.rewardsRedeemed
                    : targetBranchStat?.rewardsRedeemed || 0;

                  const displayNewCust = isAllBranches
                    ? selectedMonth.combined.newCustomers
                    : "—";

                  const displaySales = isAllBranches
                    ? selectedMonth.combined.totalBillAmount
                    : targetBranchStat?.billAmount || 0;

                  const growth = isAllBranches ? selectedMonth.combined.growthVsPrevMonth : null;

                  return (
                    <div className="space-y-3.5">
                      {/* Active Filter Title Banner */}
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-[#008069]/10 via-[#00A884]/10 to-transparent border border-[#008069]/20 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#173E30] block">
                            📅 {formatMonthTitle(selectedMonth.monthKey, locale)}
                          </span>
                          <span className="text-[10px] text-[#5F655D]">
                            {isAllBranches
                              ? t.demo.allBranchesCombined
                              : `فرع: ${analyticsBranchFilter}`}
                          </span>
                        </div>
                        {selectedMonth.isCurrentMonth ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            {locale === "fr" ? "Mois en cours" : locale === "es" ? "Mes en curso" : "الشهر الجاري"}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#5F655D] font-bold border border-[#DCE0D4]">
                            {locale === "fr" ? "Mois clôturé" : locale === "es" ? "Mes cerrado" : "شهر منتهي"}
                          </span>
                        )}
                      </div>

                      {/* 2x2 KPI Cards */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* 1. Visits & Growth */}
                        <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm space-y-1">
                          <span className="text-[11px] text-[#5F655D] block">
                            {t.demo.kpiTotalVisits}
                          </span>
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-2xl font-bold font-mono text-[#173E30]">
                              {displayVisits}
                            </span>
                            {growth !== null && (
                              <span
                                className={`text-[10px] font-bold font-mono flex items-center ${
                                  growth >= 0 ? "text-[#008069]" : "text-red-500"
                                }`}
                              >
                                {growth >= 0 ? `+${growth}%` : `${growth}%`}
                              </span>
                            )}
                          </div>
                          {growth !== null && (
                            <span className="text-[9px] text-[#5F655D] block">
                              {t.demo.growthVsPrevMonth}
                            </span>
                          )}
                        </div>

                        {/* 2. New Customers */}
                        <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm space-y-1">
                          <span className="text-[11px] text-[#5F655D] block">
                            {t.demo.newCustomersLabel}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold font-mono text-[#173E30]">
                              {displayNewCust}
                            </span>
                            <span className="text-[10px] text-[#008069] font-bold">
                              {locale === "fr" ? "clients" : "زبون"}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#5F655D] block">
                            {locale === "fr" ? "Inscrits ce mois" : "انضموا هذا الشهر"}
                          </span>
                        </div>

                        {/* 3. Rewards Delivered */}
                        <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm space-y-1">
                          <span className="text-[11px] text-[#5F655D] block">
                            {t.demo.rewardsDeliveredLabel}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold font-mono text-amber-600">
                              {displayRewards}
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold">
                              🎁 {locale === "fr" ? "cadeaux" : "مكافأة"}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#5F655D] block">
                            {locale === "fr" ? "Récompenses utilisées" : "تم استلامها"}
                          </span>
                        </div>

                        {/* 4. Sales / Cashback Activity */}
                        <div className="bg-[#FFFDF7] p-3.5 rounded-2xl border border-[#DCE0D4] shadow-sm space-y-1">
                          <span className="text-[11px] text-[#5F655D] block">
                            {merchant.loyaltyMode === "CASHBACK"
                              ? (locale === "fr" ? "Cashback distribué" : "كاش باك ممنوح")
                              : t.demo.salesVolumeLabel}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-bold font-mono text-emerald-600">
                              {merchant.loyaltyMode === "CASHBACK"
                                ? isAllBranches
                                  ? selectedMonth.combined.cashbackDistributed
                                  : targetBranchStat?.cashbackDistributed || 0
                                : displaySales}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold font-mono">
                              {merchant.currency || "DH"}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#5F655D] block">
                            {locale === "fr" ? "Activité enregistrée" : "النشاط المسجل"}
                          </span>
                        </div>
                      </div>

                      {/* 4. Branch Performance Breakdown Card (Only shown when "ALL" branches is selected in Multi-Branch mode) */}
                      {monthlyAnalytics.isMultiBranch && isOwner && isAllBranches && selectedMonth.branches.length > 1 && (
                        <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-[#DCE0D4] shadow-sm space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#173E30] flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-[#008069]" />
                              <span>{t.demo.branchBreakdown}</span>
                            </span>
                            <span className="text-[10px] text-[#5F655D]">
                              {selectedMonth.branches.length} {t.demo.branch}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {selectedMonth.branches.map((b) => (
                              <div
                                key={b.branchName}
                                className="p-3 rounded-xl bg-[#FAF7F2] space-y-2 border border-[#DCE0D4]"
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#173E30]">📍 {b.branchName}</span>
                                    {b.city && (
                                      <span className="text-[10px] text-[#5F655D]">({b.city})</span>
                                    )}
                                    {b.isMain && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-bold">
                                        {t.demo.mainBranch}
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono font-bold text-[#008069]">
                                    {b.visits} {locale === "fr" ? "visites" : "زيارة"} ({b.visitsShare}%)
                                  </span>
                                </div>

                                {/* Progress Bar showing branch share of total visits */}
                                <div className="w-full bg-[#C8D1BE] h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-[#00A884] to-[#008069] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(5, b.visitsShare)}%` }}
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-[#5F655D] pt-0.5">
                                  <span>
                                    🎁 {b.rewardsRedeemed} {locale === "fr" ? "cadeaux" : "مكافأة"}
                                  </span>
                                  {b.billAmount > 0 && (
                                    <span className="font-mono">
                                      💳 {b.billAmount} {merchant.currency || "DH"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: پروموسيون (Broadcast Promotions - Owner Only) */}
        {activeTab === "promo" && isOwner && (
          <div className="p-3.5 space-y-4 flex-1 animate-in fade-in duration-200">
            {/* Dynamic Template Chips or Empty State */}
            {templates.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] shadow-sm flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#173E30] block">
                    {t.demo.noTemplatesYet}
                  </span>
                  <p className="text-[11px] text-[#5F655D]">
                    {locale === "fr"
                      ? "Créez vos modèles d'offres pour les envoyer en un clic."
                      : locale === "es"
                      ? "Crea tus plantillas para enviar ofertas en un solo clic."
                      : "أنشئ قوالب العروض المفضلة لديك لإرسالها بنقرة واحدة."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddTemplate()}
                  className="px-3 py-2 rounded-xl bg-[#008069]/10 hover:bg-[#008069]/20 text-[#008069] border border-[#008069]/30 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.demo.addTemplate}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#5F655D] font-semibold">
                    {t.demo.presetSuggestions}:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddTemplate()}
                    className="text-[11px] text-[#008069] hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t.demo.addTemplate}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className={`group inline-flex items-center rounded-xl border whitespace-nowrap transition text-[11px] font-semibold px-2 py-1 gap-1 ${
                        promoTemplate === tpl.id
                          ? "bg-[#008069] border-[#008069] text-white shadow-sm"
                          : "bg-white border-[#C8D1BE] text-[#5F655D] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className="py-0.5 px-0.5 text-inherit font-semibold"
                      >
                        {tpl.label}
                      </button>
                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditTemplate(tpl, e)}
                          title="تعديل القالب"
                          aria-label="تعديل القالب"
                          className="p-1 rounded-md hover:bg-black/10 transition"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                          title="حذف القالب"
                          aria-label="حذف القالب"
                          className="p-1 rounded-md hover:bg-black/10 transition text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleOpenAddTemplate()}
                    className="p-1.5 rounded-xl border border-dashed border-[#008069] text-[#008069] hover:bg-[#008069]/10 transition text-xs flex items-center gap-1 flex-shrink-0"
                    title={t.demo.addTemplate}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Message Textarea - ALWAYS AVAILABLE */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#5F655D]">
                <span className="font-semibold text-[#173E30]">
                  {t.demo.notificationMessage}:
                </span>
                <span className="font-mono text-[10px]">{promoMessage.length}/110</span>
              </div>
              <textarea
                rows={3}
                maxLength={110}
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                placeholder={t.demo.notificationPlaceholder}
                className="w-full bg-white border border-[#C8D1BE] rounded-2xl p-3 text-xs text-[#173E30] focus:outline-none focus:border-[#008069] shadow-sm leading-relaxed"
              />

              {/* Requirement 2: Subtle Quick "Save Current Text as Template" Shortcut */}
              {promoMessage.trim().length > 0 && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleOpenAddTemplate(promoMessage.trim())}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#008069] hover:text-[#00705c] bg-[#008069]/10 hover:bg-[#008069]/15 px-2.5 py-1 rounded-lg border border-[#008069]/20 transition active:scale-95"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{t.demo.saveAsTemplate}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2x2 Audience Selector Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-[#5F655D] font-semibold block">لمن غادي تصيفط:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "ALL", label: "كاع الكليان", count: metrics.audienceCounts.all },
                  { id: "QUIET", label: "اللي غبرو (15 يوم+)", count: metrics.audienceCounts.quiet },
                  { id: "NEAR_REWARD", label: "قراب من الكادو", count: metrics.audienceCounts.near },
                  { id: "VIP", label: "كليان VIP", count: metrics.audienceCounts.vip },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setPromoAudience(a.id as typeof promoAudience)}
                    className={`p-3 rounded-2xl border text-right transition ${promoAudience === a.id
                      ? "bg-[#008069]/10 border-[#008069] text-[#173E30] ring-1 ring-[#008069]"
                      : "bg-white border-[#DCE0D4] text-[#5F655D] shadow-sm hover:border-[#C8D1BE]"
                      }`}
                  >
                    <span className="font-bold text-[#173E30] block">{a.label}</span>
                    <span className="text-[10px] text-[#008069] font-mono font-bold">
                      {a.count} زبون
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Summary Row */}
            <div className="p-3 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] shadow-sm flex items-center justify-between text-xs">
              <span className="text-[#5F655D]">
                غادي يتخصم: <strong className="text-amber-600 font-mono font-bold">{costCredits}</strong> كريدي
              </span>
              <span className="text-[#5F655D]">
                يبقى ليك: <strong className="text-[#008069] font-mono font-bold">{Math.max(0, remainingCredits)}</strong> كريدي
              </span>
            </div>

            {promoSuccessMsg && (
              <div className="p-3 rounded-xl bg-[#008069]/10 border border-[#008069]/30 text-[#008069] text-xs font-semibold">
                {promoSuccessMsg}
              </div>
            )}

            {/* Send Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={sendingPromo || merchant.credits < costCredits}
                onClick={handleSendCampaign}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#008069]/20 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{sendingPromo ? "جاري الإرسال..." : "صيفط دابا (Broadcast)"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setPeekNotification({
                    isOpen: true,
                    shopName: merchant.name,
                    title: "معاينة قفل الشاشة",
                    message: promoMessage,
                  })
                }
                title="معاينة كيف يظهر على هاتف الزبون"
                aria-label="معاينة كيف يظهر على هاتف الزبون"
                className="p-3 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#C8D1BE] text-[#5F655D] shadow-sm transition"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Past Campaigns */}
            <div className="space-y-2 pt-2 border-t border-[#DCE0D4]">
              <span className="text-[11px] font-bold text-[#173E30] block">سجل الحملات السابقة:</span>
              {campaigns.slice(0, 3).map((camp) => (
                <div key={camp.id} className="p-3 rounded-xl bg-white border border-[#DCE0D4] shadow-sm text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#173E30]">
                    <span>{camp.title}</span>
                    <span className="font-mono text-[#008069]">+{camp.returnedCount} رجعو</span>
                  </div>
                  <p className="text-[11px] text-[#5F655D] truncate">{camp.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: الإعدادات (Settings & Location) */}
        {(activeTab === "settings" || (activeTab as string) === "auto") && (
          <div className="p-3.5 space-y-3.5 flex-1 animate-in fade-in duration-200">
            {/* Branch Staff Security Alert Banner */}
            {isRestrictedStaff && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>
                    {liveAuthBranch
                      ? locale === "fr"
                        ? `Compte succursale : ${liveAuthBranch.name}`
                        : locale === "es"
                        ? `Cuenta de sucursal: ${liveAuthBranch.name}`
                        : `حساب كاشير خاص بالفرع: ${liveAuthBranch.name}`
                      : locale === "fr"
                      ? `Compte caissier : ${authStaffName || ""}`
                      : `حساب كاشير${authStaffName ? `: ${authStaffName}` : ""}`}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {locale === "fr"
                    ? "Vous êtes connecté avec les accès de cette succursale. La configuration du programme de fidélité, les campagnes, les automatisations et les autres succursales sont réservées au propriétaire."
                    : locale === "es"
                    ? "Ha iniciado sesión con credenciales de cajero. La configuración de fidelidad, promociones, automatizaciones y otras sucursales están reservadas para el propietario."
                    : "أنت مسجل الدخول بحساب كاشير مخصص. تغيير نظام الولاء، الحملات الترويجية، الأتمتة التلقائية وإدارة باقي الفروع محصورة بحساب المدير الرئيسي."}
                </p>
              </div>
            )}
            {/* Language Switcher Bar */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#173E30] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#008069]" />
                  <span>
                    {locale === "fr"
                      ? "Langue de la plateforme"
                      : locale === "es"
                      ? "Idioma de la plataforma"
                      : "لغة لوحة التحكم"}
                  </span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#5F655D] font-mono font-bold uppercase">
                  {locale}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "ar" as const, label: "العربية", flag: "🇲🇦" },
                  { key: "fr" as const, label: "Français", flag: "🇫🇷" },
                  { key: "es" as const, label: "Español", flag: "🇪🇸" },
                ].map((l) => {
                  const isSel = locale === l.key;
                  return (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setLocale(l.key)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        isSel
                          ? "bg-[#008069] text-white border-[#008069] shadow-sm scale-[1.02]"
                          : "bg-[#F7F8FA] hover:bg-[#FAF7F2] text-[#5F655D] border-[#DCE0D4]"
                      }`}
                    >
                      <span className="text-sm">{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loyalty Program Settings Card (OWNER ONLY) */}
            {isOwner && (
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#DCE0D4]">
                  <span className="font-bold text-xs text-[#173E30] flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>نظام الولاء للمحل</span>
                  </span>
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300 animate-pulse">
                        {t.demo.unsavedChanges}
                      </span>
                    )}
                    <span className="text-[10px] text-[#008069] font-bold font-mono">
                      {merchantLoyaltyMode === "BOTH"
                        ? "أختام + كاش باك"
                        : merchantLoyaltyMode === "CASHBACK"
                          ? "كاش باك فقط"
                          : "أختام فقط"}
                    </span>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#5F655D] font-semibold block">
                    البرنامج المفعّل للعملاء:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                    {[
                      { id: "BOTH", label: "معاً (اختياري)" },
                      { id: "STAMPS", label: "أختام فقط" },
                      { id: "CASHBACK", label: "كاش باك فقط" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMerchantLoyaltyMode(m.id)}
                        className={`py-1.5 px-2 rounded-xl border text-center transition ${
                          merchantLoyaltyMode === m.id
                            ? "bg-[#008069] text-white border-[#008069] shadow-sm"
                            : "bg-white border-[#C8D1BE] text-[#5F655D] hover:bg-[#FAF7F2]"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cashback Rate Selector */}
                {(merchantLoyaltyMode === "CASHBACK" || merchantLoyaltyMode === "BOTH") && (
                  <div className="space-y-1 pt-1.5 border-t border-[#DCE0D4]">
                    <div className="flex items-center justify-between text-[10px] text-[#5F655D]">
                      <span className="font-semibold text-[#173E30]">نسبة الكاش باك من كل فاتورة:</span>
                      <span className="font-bold text-amber-600 font-mono text-xs">
                        {merchantCashbackRate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[5, 10, 15, 20].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setMerchantCashbackRate(rate)}
                          className={`flex-1 py-1 rounded-lg border text-center text-[11px] font-bold font-mono transition ${
                            Number(merchantCashbackRate) === rate
                              ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                              : "bg-white border-[#C8D1BE] text-[#5F655D] hover:bg-[#FAF7F2]"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explicit Save Changes Button for Loyalty */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={handleSaveSettings}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                      hasUnsavedChanges
                        ? "bg-gradient-to-r from-[#00A884] to-[#008069] text-white hover:opacity-95 shadow-md shadow-[#008069]/20 scale-[1.01]"
                        : "bg-[#008069] text-white hover:bg-[#00705c]"
                    } disabled:opacity-50`}
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.demo.saving}</span>
                      </>
                    ) : saveSuccessMsg ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{saveSuccessMsg}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{t.demo.saveChanges}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Store Location & Multi-Branch Management Card */}
            {isMultiBranch && (isOwner || liveAuthBranch) ? (
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] shadow-sm space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#DCE0D4]">
                  <span className="font-bold text-xs text-[#173E30] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#008069]" />
                    <span>
                      {isRestrictedStaff
                        ? locale === "fr"
                          ? "Ma succursale"
                          : locale === "es"
                          ? "Mi sucursal"
                          : "معلومات الفرع الخاص بك"
                        : t.demo.manageBranches}
                    </span>
                  </span>
                  {isOwner && (
                    <button
                      type="button"
                      disabled={branches.length >= (merchant.maxBranches ?? (merchant.plan === "MULTI" ? 3 : 1))}
                      onClick={handleOpenAddBranch}
                      className="px-2.5 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-[#C8E6C9] disabled:opacity-40 disabled:hover:bg-[#E8F5E9] text-[#008069] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.demo.addBranch}</span>
                    </button>
                  )}
                </div>

                {/* Branch Quota Progress Card (OWNER ONLY) */}
                {isOwner && (
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#DCE0D4] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#173E30] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#008069]" />
                        <span>{locale === "fr" ? "Quota de succursales :" : locale === "es" ? "Cuota de sucursales:" : "كوطا الفروع المسموح بها:"}</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-[#008069]">
                        {branches.length} / {merchant.maxBranches ?? (merchant.plan === "MULTI" ? 3 : 1)} {locale === "fr" ? "succursales" : locale === "es" ? "sucursales" : "فروع"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#DCE0D4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00A884] to-[#008069] transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.round((branches.length / (merchant.maxBranches ?? (merchant.plan === "MULTI" ? 3 : 1))) * 100))}%`,
                        }}
                      />
                    </div>
                    {branches.length >= (merchant.maxBranches ?? (merchant.plan === "MULTI" ? 3 : 1)) && (
                      <p className="text-[10px] text-amber-800 font-medium">
                        ⚠️ {locale === "fr"
                          ? "Limite maximale de succursales atteinte. Contactez l'administrateur pour augmenter votre quota."
                          : locale === "es"
                          ? "Límite máximo de sucursales alcanzado. Contacte al administrador para aumentar su cuota."
                          : "لقد استهلكت كامل الفروع المسموح بها في باقتك. تواصل مع الإدارة لترقية باقتك وفتح فروع إضافية."}
                      </p>
                    )}
                  </div>
                )}

                {/* Current Cashier Device Branch Selector (OWNER ONLY) */}
                {isOwner && (
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#C8D1BE] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="device-branch-select" className="text-[10px] text-[#5F655D] font-bold flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-[#008069]" />
                        <span>{t.demo.currentDeviceBranch}:</span>
                      </label>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {activeBranchName || "نشط"}
                      </span>
                    </div>
                    <select
                      id="device-branch-select"
                      value={deviceBranchId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setDeviceBranchId(newId);
                        if (typeof window !== "undefined") {
                          try {
                            localStorage.setItem(`walink_device_branch_${merchant.slug}`, newId);
                          } catch (err) {
                            console.warn("Failed to save deviceBranch to localStorage:", err);
                          }
                        }
                      }}
                      className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-[#C8D1BE] bg-white text-[#173E30] font-semibold focus:outline-none focus:ring-2 focus:ring-[#008069]"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city}) {b.isMain ? "⭐" : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-[9px] text-[#5F655D] leading-tight">
                      {locale === "fr"
                        ? "Chaque scan effectué sur cet appareil sera enregistré sous ce point de vente et dirigera le client vers ses avis Google."
                        : locale === "es"
                        ? "Cada escaneo en este dispositivo se registrará para esta sucursal y dirigirá las reseñas de Google a ella."
                        : "كل عملية مسح وطابع من هذا الجهاز ستسجل تلقائياً باسم هذا الفرع وتوجه تقييم Google إليه."}
                    </p>
                  </div>
                )}

                {/* Branches List (Scoped to ONLY Cashier's Own Branch when BRANCH_STAFF) */}
                <div className="space-y-2">
                  {isOwner && (
                    <span className="text-[10px] text-[#5F655D] font-bold uppercase block">
                      {locale === "fr" ? "Liste des points de vente" : locale === "es" ? "Lista de sucursales" : "قائمة الفروع المسجلة:"} ({branches.length})
                    </span>
                  )}
                  {(isRestrictedStaff && liveAuthBranch ? [liveAuthBranch] : branches).map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl border border-[#DCE0D4] bg-[#FAF7F2] hover:bg-white transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#173E30]">{b.name}</span>
                          {b.isMain && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center gap-0.5">
                              ⭐ {t.demo.mainBranch}
                            </span>
                          )}
                        </div>
                        {isOwner && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditBranch(b, e)}
                              className="p-1 rounded-lg text-[#5F655D] hover:text-[#008069] hover:bg-white transition"
                              title={t.demo.editBranch}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {branches.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteBranch(b.id, e)}
                                className="p-1 rounded-lg text-[#5F655D] hover:text-rose-600 hover:bg-white transition"
                                title={t.demo.deleteBranch}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#5F655D]">
                        <div className="flex items-center gap-2">
                          <span>📍 {b.city}</span>
                          <span className="font-mono font-bold text-[#008069] bg-white px-2 py-0.5 rounded-md border border-[#DCE0D4]">
                            PIN: {b.pinCode ? b.pinCode : (locale === "fr" ? "Non défini" : locale === "es" ? "Sin definir" : "غير معين")}
                          </span>
                        </div>
                        {b.latitude && b.longitude ? (
                          <a
                            href={b.googleMapsUrl || `https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#008069] hover:underline flex items-center gap-0.5 font-semibold"
                          >
                            <span>{t.demo.mapPreview}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : null}
                      </div>

                      {b.radarMessage && (
                        <p className="text-[9px] text-[#5F655D] bg-[#FFFDF7] p-1.5 rounded-lg border border-[#DCE0D4] italic line-clamp-1">
                          🔔 &quot;{b.radarMessage}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {isOwner && (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-800 leading-relaxed">
                    💡 {locale === "fr"
                      ? "Toutes ces succursales sont synchronisées automatiquement dans le radar Apple & Google Wallet (jusqu'à 10 points de vente). La carte s'affiche sur l'écran verrouillé du client dès qu'il est à 100m de n'importe quel point !"
                      : locale === "es"
                      ? "Todas estas sucursales se sincronizan automáticamente en el radar de Apple y Google Wallet (hasta 10). La tarjeta aparece en la pantalla de bloqueo a menos de 100m de cualquier sucursal."
                      : "جميع هذه الفروع مسجلة تلقائياً في رادار بطاقة المحفظة (Apple & Google Wallet) حتى 10 فروع، وتظهر البطاقة على شاشة قفل الزبون فور اقترابه من أي فرع بـ 100 متر!"}
                  </div>
                )}
              </div>
            ) : isOwner ? (
              /* Store Location & GPS Radar Card (OWNER ONLY) */
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#DCE0D4]">
                  <span className="font-bold text-xs text-[#173E30] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{t.demo.storeLocation}</span>
                  </span>
                  {Number(merchantLatitude) && Number(merchantLongitude) ? (
                    <a
                      href={`https://www.google.com/maps?q=${merchantLatitude},${merchantLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#008069] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{t.demo.mapPreview}</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  ) : null}
                </div>

                <p className="text-[11px] text-[#5F655D] leading-relaxed">
                  {locale === "fr"
                    ? "Coordonnées GPS utilisées pour le radar de proximité 100m et la géolocalisation sur Apple et Google Wallet."
                    : locale === "es"
                    ? "Coordenadas GPS utilizadas para el radar de proximidad de 100m y la ubicación en Apple y Google Wallet."
                    : "إحداثيات GPS تُستخدم لتشغيل رادار الـ 100 متر على بطاقات Apple و Google Wallet ومساعدة الزبائن في العثور عليك."}
                </p>

                {/* Google Maps Link Input with Smart Coordinate Parser */}
                <div className="space-y-1">
                  <label htmlFor="gmaps-url-input" className="text-[10px] text-[#5F655D] font-semibold block">
                    {t.demo.googleMapsUrl}:
                  </label>
                  <div className="relative">
                    <input
                      id="gmaps-url-input"
                      type="url"
                      value={merchantGoogleMapsUrl}
                      onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                      placeholder="https://maps.app.goo.gl/... أو https://www.google.com/maps/..."
                      className="w-full py-2 px-3 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] text-[#173E30] placeholder-[#5F655D]"
                      dir="ltr"
                    />
                  </div>
                  <span className="text-[9px] text-[#5F655D] block">
                    {locale === "fr"
                      ? "💡 Collez un lien Google Maps et les coordonnées GPS seront extraites automatiquement."
                      : locale === "es"
                      ? "💡 Pegue un enlace de Google Maps y las coordenadas GPS se extraerán automáticamente."
                      : "💡 الصق رابط موقعك من Google Maps وسيتم استخراج الإحداثيات تلقائياً حتى لو كنت في المنزل."}
                  </span>
                </div>

                {/* Coordinates Inputs: Latitude & Longitude */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="lat-input" className="text-[10px] text-[#5F655D] font-semibold block">
                      {locale === "fr" ? "Latitude" : locale === "es" ? "Latitud" : "خط العرض (Latitude)"}
                    </label>
                    <input
                      id="lat-input"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={merchantLatitude}
                      onChange={(e) => setMerchantLatitude(e.target.value)}
                      placeholder="33.5731"
                      className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] font-mono text-[#173E30]"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="lng-input" className="text-[10px] text-[#5F655D] font-semibold block">
                      {locale === "fr" ? "Longitude" : locale === "es" ? "Longitud" : "خط الطول (Longitude)"}
                    </label>
                    <input
                      id="lng-input"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={merchantLongitude}
                      onChange={(e) => setMerchantLongitude(e.target.value)}
                      placeholder="-7.5898"
                      className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] font-mono text-[#173E30]"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* GPS Auto-detect Button */}
                <div>
                  <button
                    type="button"
                    disabled={isDetectingGps}
                    onClick={handleDetectGps}
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#DCE0D4] border border-[#C8D1BE] text-xs font-bold text-[#173E30] flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isDetectingGps ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008069]" />
                        <span>
                          {locale === "fr"
                            ? "Recherche de la position GPS..."
                            : locale === "es"
                            ? "Buscando ubicación GPS..."
                            : "جاري التقاط إحداثيات GPS الدقيقة..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5 text-[#008069]" />
                        <span>{t.demo.detectGps}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* GPS Status Message Toast */}
                {gpsStatus && (
                  <div
                    className={`p-2 rounded-xl text-[11px] font-semibold ${
                      gpsStatus.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {gpsStatus.msg}
                  </div>
                )}

                {/* Radar Lock Screen Message */}
                <div className="space-y-1 pt-1.5 border-t border-[#DCE0D4]">
                  <label htmlFor="radar-msg-input" className="text-[10px] text-[#5F655D] font-semibold block">
                    {t.demo.radarMessage}:
                  </label>
                  <input
                    id="radar-msg-input"
                    type="text"
                    value={merchantRadarMessage}
                    onChange={(e) => setMerchantRadarMessage(e.target.value)}
                    placeholder="أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة."
                    className="w-full py-2 px-3 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] text-[#173E30]"
                  />
                </div>

                {/* Save Location Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={savingSettings}
                    onClick={handleSaveSettings}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                      hasUnsavedChanges
                        ? "bg-gradient-to-r from-[#00A884] to-[#008069] text-white hover:opacity-95 shadow-md shadow-[#008069]/20 scale-[1.01]"
                        : "bg-[#008069] text-white hover:bg-[#00705c]"
                    } disabled:opacity-50`}
                  >
                    {savingSettings ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.demo.saving}</span>
                      </>
                    ) : saveSuccessMsg ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{saveSuccessMsg}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{t.demo.saveChanges}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Smart Automations Toggles Card & Cron Test (OWNER ONLY) */}
            {isOwner && (
              <>
                <div className="space-y-2.5">
                  {[
                    {
                      key: "autoWinback" as const,
                      title: "رجوع الغابرين",
                      badge: "بالكريدي",
                      message: `توحشناك! دوز هاد السيمانة لـ ${merchant.name} وعندك طابع هدية`,
                      active: automations.autoWinback,
                      locked: merchant.plan === "STARTER",
                    },
                    {
                      key: "autoReview" as const,
                      title: "تقييمات Google",
                      badge: "فابور ديما",
                      message: `شكراً على الزيارة! عجباتك الخدمة؟ خلي لينا رأيك ف Google`,
                      active: automations.autoReview,
                      locked: merchant.plan === "STARTER",
                    },
                    {
                      key: "autoRadar" as const,
                      title: "تذكير 100 ميترو",
                      badge: "فابور ديما",
                      message: `راك قريب من ${merchant.name}، الكارط ديالك واجدة`,
                      active: automations.autoRadar,
                      locked: merchant.plan === "STARTER",
                    },
                    {
                      key: "autoNearReward" as const,
                      title: "الكادو قريب",
                      badge: "فابور ديما",
                      message: `باقي ليك غير طابع واحد على ${merchant.rewardName}`,
                      active: automations.autoNearReward,
                      locked: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-3 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] shadow-sm flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#173E30]">{item.title}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FAF7F2] text-[#5F655D] border border-[#DCE0D4]">
                            {item.badge}
                          </span>
                          {item.locked && (
                            <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Growth
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#5F655D] mt-1 truncate max-w-[200px]">
                          {item.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPeekNotification({
                              isOpen: true,
                              shopName: merchant.name,
                              title: item.title,
                              message: item.message,
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#DCE0D4] text-[#5F655D] text-[10px] border border-[#C8D1BE] font-medium"
                        >
                          شوف
                        </button>

                        <button
                          type="button"
                          disabled={savingSettings || item.locked}
                          onClick={() => handleToggleAutomation(item.key)}
                          className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${item.active ? "bg-[#008069] justify-end" : "bg-[#C8D1BE] justify-start"
                            } ${item.locked ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          <div className="w-5 h-5 rounded-full bg-white shadow-md"></div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Test Automations Trigger Button */}
                <div className="pt-2 border-t border-[#DCE0D4] space-y-2">
                  <button
                    type="button"
                    disabled={testingCron}
                    onClick={handleTestCronForMerchant}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{testingCron ? "جاري تجربة الأتمتة..." : "⚡ جرّب إرسال الرسائل الأوتوماتيكية دابا"}</span>
                  </button>

                  {cronTestMessage && (
                    <div className="p-2.5 rounded-xl bg-[#008069]/10 border border-[#008069]/20 text-[#008069] text-[11px] text-center font-bold">
                      {cronTestMessage}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Bottom Navigation Bar with Safe Area Bottom Padding */}
        <nav
          className="sticky bottom-0 z-30 bg-[#FFFDF7] border-t border-[#DCE0D4] grid grid-cols-5 items-center px-1 py-1 text-center text-xs shadow-lg"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)",
          }}
        >
          {/* 1. الرئيسية */}
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={`py-1.5 px-0.5 rounded-xl flex flex-col items-center gap-1 transition ${
              activeTab === "home" ? "text-[#008069] font-bold" : "text-[#5F655D] hover:text-[#173E30]"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${activeTab === "home" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] sm:text-xs font-medium truncate w-full block text-center leading-tight">
              {t.demo.ownerHome}
            </span>
          </button>

          {/* 2. الزبائن */}
          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`py-1.5 px-0.5 rounded-xl flex flex-col items-center gap-1 transition ${
              activeTab === "customers" ? "text-[#008069] font-bold" : "text-[#5F655D] hover:text-[#173E30]"
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === "customers" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] sm:text-xs font-medium truncate w-full block text-center leading-tight">
              {t.demo.ownerClients}
            </span>
          </button>

          {/* 3. Center Elevated Floating Camera FAB (Strictly matches reference image media_1795566331431_8ed38111.png) */}
          <div className="relative flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setPreselectedCustomer(null);
                setIsScannerOpen(true);
              }}
              aria-label={locale === "ar" ? "مسح بطاقة العميل / إضافة ختم أو كاش باك" : "Scanner / Ajouter un tampon ou cashback"}
              className="group -mt-6 flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-90 hover:scale-105"
            >
              {/* Outer Translucent Halo Ring */}
              <div className="w-14 h-14 rounded-full bg-[#008069]/15 group-hover:bg-[#008069]/25 p-1.5 flex items-center justify-center transition-all duration-300 shadow-md">
                {/* Inner Solid Gradient Circle with Camera Icon */}
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#075E54] via-[#008069] to-[#00A884] text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <Camera className="w-6 h-6 stroke-[2.3] text-white" />
                </div>
              </div>
            </button>
          </div>

          {/* 4. التقارير */}
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`py-1.5 px-0.5 rounded-xl flex flex-col items-center gap-1 transition ${
              activeTab === "analytics" ? "text-[#008069] font-bold" : "text-[#5F655D] hover:text-[#173E30]"
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === "analytics" ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] sm:text-xs font-medium truncate w-full block text-center leading-tight">
              {t.demo.ownerAnalytics}
            </span>
          </button>

          {/* 5. الإعدادات */}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`py-1.5 px-0.5 rounded-xl flex flex-col items-center gap-1 transition ${
              activeTab === "settings" ? "text-[#008069] font-bold" : "text-[#5F655D] hover:text-[#173E30]"
            }`}
          >
            <div className="relative">
              <Settings className={`w-4 h-4 ${activeTab === "settings" ? "stroke-[2.5]" : ""}`} />
              {isOwner && hasUnsavedChanges && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium truncate w-full block text-center leading-tight">
              {t.demo.ownerSettings}
            </span>
          </button>
        </nav>
      </div>

      {/* Floating Bezel Frame Toggle (Desktop Helper) */}
      <div className="hidden lg:flex fixed bottom-4 left-4 z-40 items-center gap-2">
        <button
          type="button"
          onClick={() => setIsFrameMode(!isFrameMode)}
          className="px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#C8D1BE] text-[#173E30] text-xs flex items-center gap-1.5 shadow-md font-medium"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#008069]" />
          <span>{isFrameMode ? "إلغاء إطار الهاتف" : "معاينة داخل آيفون"}</span>
        </button>

        <a
          href={getPassUrl(customers[0]?.passSerial || "pass-atlas-4821")}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl bg-[#008069] hover:bg-[#00A884] text-white text-xs flex items-center gap-1.5 shadow-md font-bold"
        >
          <span>فتح كارط الزبون (Live Pass) ↗</span>
        </a>
      </div>

      {/* Modals */}
      <MerchantScannerModal
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          setPreselectedCustomer(null);
        }}
        initialCustomer={preselectedCustomer}
        slug={merchant.slug}
        rewardName={merchant.rewardName}
        stampsRequired={merchant.stampsRequired}
        loyaltyMode={merchant.loyaltyMode}
        cashbackRate={merchant.cashbackRate}
        currency={merchant.currency}
        minCashbackRedeem={merchant.minCashbackRedeem}
        customers={customers}
        onActionComplete={handleActionComplete}
        onOpenCredits={() => setIsCreditsOpen(true)}
        locale={locale}
        branchName={authRole === "BRANCH_STAFF" && liveAuthBranch ? liveAuthBranch.name : (isMultiBranch ? activeBranchName : undefined)}
        staffName={authRole === "BRANCH_STAFF" && liveAuthBranch ? liveAuthBranch.name : authStaffName || (merchant.name || "المدير")}
        userRole={isRestrictedStaff ? "STAFF" : "OWNER"}
      />

      <StandPreviewModal
        isOpen={isStandOpen}
        onClose={() => setIsStandOpen(false)}
        merchant={merchant}
      />

      <MerchantCreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        credits={merchant.credits}
        merchantName={merchant.name}
        locale={locale}
      />

      <LockScreenPeekModal
        isOpen={peekNotification.isOpen}
        onClose={() => setPeekNotification({ isOpen: false, message: "", title: "" })}
        shopName={peekNotification.shopName || merchant.name}
        title={peekNotification.title}
        message={peekNotification.message}
        locale={locale}
      />

      {/* Add/Edit Template Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-[#FFFDF7] rounded-3xl p-5 border border-[#DCE0D4] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE0D4]">
              <h3 className="text-sm font-bold text-[#173E30] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#008069]" />
                <span>
                  {editingTemplateId
                    ? locale === "fr"
                      ? "Modifier le modèle"
                      : locale === "es"
                      ? "Editar plantilla"
                      : "تعديل القالب"
                    : t.demo.createTemplateTitle}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] hover:bg-[#DCE0D4] text-[#5F655D] flex items-center justify-center text-xs transition"
              >
                ✕
              </button>
            </div>

            {/* Preset Quick Fill Suggestions */}
            {!editingTemplateId && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#5F655D] uppercase block">
                  {t.demo.presetSuggestions}:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SUGGESTIONS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setTemplateLabelInput(preset.label);
                        setTemplateTextInput(preset.text);
                      }}
                      className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#DCE0D4] border border-[#C8D1BE] text-start transition text-[11px] font-medium text-[#173E30]"
                    >
                      <span className="font-bold text-[#008069] block truncate">
                        {preset.label}
                      </span>
                      <span className="text-[9px] text-[#5F655D] line-clamp-1">
                        {preset.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Template Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="tpl-label-input" className="text-xs font-semibold text-[#173E30] block">
                  {t.demo.templateName}:
                </label>
                <input
                  id="tpl-label-input"
                  type="text"
                  maxLength={30}
                  value={templateLabelInput}
                  onChange={(e) => setTemplateLabelInput(e.target.value)}
                  placeholder={locale === "fr" ? "Ex: Promo weekend" : locale === "es" ? "Ej: Promo fin de semana" : "مثال: عرض الويكاند"}
                  className="w-full bg-[#FAF7F2] border border-[#C8D1BE] rounded-xl px-3 py-2 text-xs text-[#173E30] focus:outline-none focus:border-[#008069] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="tpl-text-input" className="font-semibold text-[#173E30]">
                    {t.demo.templateText}:
                  </label>
                  <span className="font-mono text-[10px] text-[#5F655D]">
                    {templateTextInput.length}/110
                  </span>
                </div>
                <textarea
                  id="tpl-text-input"
                  rows={3}
                  maxLength={110}
                  value={templateTextInput}
                  onChange={(e) => setTemplateTextInput(e.target.value)}
                  placeholder={locale === "fr" ? "Texte de la notification..." : locale === "es" ? "Texto de la notificación..." : "نص الإشعار..."}
                  className="w-full bg-[#FAF7F2] border border-[#C8D1BE] rounded-xl p-3 text-xs text-[#173E30] focus:outline-none focus:border-[#008069] focus:bg-white leading-relaxed"
                />
                <p className="text-[10px] text-[#5F655D]">
                  {locale === "fr"
                    ? "Astuce : Vous pouvez utiliser {shop} pour insérer le nom du magasin automatiquement."
                    : locale === "es"
                    ? "Consejo: Puedes usar {shop} para insertar el nombre de la tienda automáticamente."
                    : "نصيحة: يمكنك كتابة {shop} لإدراج اسم متجرك تلقائياً."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSavingTemplate || !templateLabelInput.trim() || !templateTextInput.trim()}
                onClick={handleSaveTemplate}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#008069]/20 transition disabled:opacity-50"
              >
                {isSavingTemplate ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>
                  {editingTemplateId
                    ? locale === "fr"
                      ? "Enregistrer les modifications"
                      : locale === "es"
                      ? "Guardar cambios"
                      : "حفظ التعديلات"
                    : t.demo.addTemplate}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#DCE0D4] text-[#5F655D] font-bold text-xs transition"
              >
                {locale === "fr" ? "Annuler" : locale === "es" ? "Cancelar" : "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-[#FFFDF7] rounded-3xl p-5 border border-[#DCE0D4] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE0D4]">
              <h3 className="text-sm font-bold text-[#173E30] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#008069]" />
                <span>
                  {editingBranchId ? t.demo.editBranch : t.demo.addBranch}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] hover:bg-[#DCE0D4] text-[#5F655D] flex items-center justify-center text-xs transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Branch Name */}
              <div className="space-y-1">
                <label htmlFor="branch-name-input" className="text-[10px] text-[#5F655D] font-semibold block">
                  {t.demo.branchName} *:
                </label>
                <input
                  id="branch-name-input"
                  type="text"
                  value={branchNameInput}
                  onChange={(e) => setBranchNameInput(e.target.value)}
                  placeholder="مثال: فرع المعاريف"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] text-[#173E30]"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label htmlFor="branch-city-input" className="text-[10px] text-[#5F655D] font-semibold block">
                  {locale === "fr" ? "Ville" : locale === "es" ? "Ciudad" : "المدينة"}:
                </label>
                <input
                  id="branch-city-input"
                  type="text"
                  value={branchCityInput}
                  onChange={(e) => setBranchCityInput(e.target.value)}
                  placeholder="مثال: الدار البيضاء"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] text-[#173E30]"
                />
              </div>

              {/* Branch Cashier PIN */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="branch-pin-input" className="text-[10px] text-[#5F655D] font-semibold block">
                    {locale === "fr" ? "Code PIN de la succursale (4 chiffres)" : locale === "es" ? "Código PIN de la sucursal (4 dígitos)" : "رمز PIN الخاص بالفرع (4 أرقام)"} *:
                  </label>
                  <span className="text-[9px] text-[#008069] font-bold">حساب فرع مستقل</span>
                </div>
                <input
                  id="branch-pin-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={branchPinInput}
                  onChange={(e) => {
                    setBranchPinInput(e.target.value);
                    setBranchPinError(null);
                  }}
                  placeholder="مثال: 2222"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] font-mono font-bold tracking-widest text-[#008069]"
                  dir="ltr"
                />
                <span className="text-[9px] text-[#5F655D] block">
                  {locale === "fr"
                    ? "Permet aux caissiers de cette succursale de se connecter directement à leur compte dédié."
                    : locale === "es"
                    ? "Permite a los cajeros de esta sucursal iniciar sesión en su cuenta dedicada."
                    : "يستخدمه كاشير هذا الفرع لتسجيل الدخول إلى حسابه المخصص وتوثيق العمليات باسم الفرع."}
                </span>
                {branchPinError && (
                  <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold">
                    {branchPinError}
                  </div>
                )}
              </div>

              {/* Google Maps URL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="branch-gmaps-input" className="text-[10px] text-[#5F655D] font-semibold block">
                    {t.demo.googleMapsUrl}:
                  </label>
                  {Number(branchLatInput) && Number(branchLngInput) ? (
                    <a
                      href={`https://www.google.com/maps?q=${branchLatInput},${branchLngInput}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#008069] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{t.demo.mapPreview}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : null}
                </div>
                <input
                  id="branch-gmaps-input"
                  type="url"
                  value={branchGmapsInput}
                  onChange={(e) => handleBranchGoogleMapsUrlChange(e.target.value)}
                  placeholder="https://maps.app.goo.gl/... أو https://www.google.com/maps/..."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] text-[#173E30] placeholder-[#5F655D]"
                  dir="ltr"
                />
                <span className="text-[9px] text-[#5F655D] block">
                  💡 {locale === "fr"
                    ? "Collez le lien Google Maps du point de vente pour extraire les coordonnées GPS automatiquement."
                    : locale === "es"
                    ? "Pegue el enlace de Google Maps de la sucursal para extraer las coordenadas automáticamente."
                    : "الصق رابط Google Maps الخاص بالفرع وسيتم استخراج الإحداثيات تلقائياً."}
                </span>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label htmlFor="branch-lat-input" className="text-[10px] text-[#5F655D] font-semibold block">
                    {locale === "fr" ? "Latitude" : locale === "es" ? "Latitud" : "خط العرض"}
                  </label>
                  <input
                    id="branch-lat-input"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={branchLatInput}
                    onChange={(e) => setBranchLatInput(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] font-mono text-[#173E30]"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="branch-lng-input" className="text-[10px] text-[#5F655D] font-semibold block">
                    {locale === "fr" ? "Longitude" : locale === "es" ? "Longitud" : "خط الطول"}
                  </label>
                  <input
                    id="branch-lng-input"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={branchLngInput}
                    onChange={(e) => setBranchLngInput(e.target.value)}
                    className="w-full py-1.5 px-2.5 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] font-mono text-[#173E30]"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* GPS Auto-detect Button */}
              <div>
                <button
                  type="button"
                  disabled={isDetectingBranchGps}
                  onClick={handleDetectBranchGps}
                  className="w-full py-2 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#DCE0D4] border border-[#C8D1BE] text-xs font-bold text-[#173E30] flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  {isDetectingBranchGps ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#008069]" />
                      <span>جاري التقاط إحداثيات الفرع...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 text-[#008069]" />
                      <span>{t.demo.detectGps}</span>
                    </>
                  )}
                </button>
              </div>

              {/* GPS Status Message Toast */}
              {branchGpsStatus && (
                <div
                  className={`p-2 rounded-xl text-[11px] font-semibold ${
                    branchGpsStatus.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {branchGpsStatus.msg}
                </div>
              )}

              {/* Radar Lock Screen Message */}
              <div className="space-y-1">
                <label htmlFor="branch-radar-msg-input" className="text-[10px] text-[#5F655D] font-semibold block">
                  {t.demo.radarMessage}:
                </label>
                <input
                  id="branch-radar-msg-input"
                  type="text"
                  value={branchRadarMsgInput}
                  onChange={(e) => setBranchRadarMsgInput(e.target.value)}
                  placeholder="أنت بالقرب من فرعنا! تفضل بزيارتنا وبطاقتك جاهزة."
                  className="w-full py-2 px-3 text-xs rounded-xl border border-[#C8D1BE] focus:outline-none focus:ring-2 focus:ring-[#008069] text-[#173E30]"
                />
              </div>

              {/* Main Branch Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={branchIsMainInput}
                  onChange={(e) => setBranchIsMainInput(e.target.checked)}
                  className="w-4 h-4 text-[#008069] rounded focus:ring-[#008069]"
                />
                <span className="text-xs text-[#173E30] font-medium">
                  {t.demo.setAsMainBranch}
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isSavingBranch || !branchNameInput.trim()}
                onClick={handleSaveBranch}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#008069]/20 transition disabled:opacity-50"
              >
                {isSavingBranch ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>
                  {editingBranchId
                    ? locale === "fr"
                      ? "Enregistrer les modifications"
                      : locale === "es"
                      ? "Guardar cambios"
                      : "حفظ التعديلات"
                    : t.demo.addBranch}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#DCE0D4] text-[#5F655D] font-bold text-xs transition"
              >
                {locale === "fr" ? "Annuler" : locale === "es" ? "Cancelar" : "إلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cashier PIN Reset Modal */}
      {pinResetModal.isOpen && pinResetModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="relative w-full max-w-sm bg-[#FFFDF7] border border-[#DCE0D4] rounded-3xl shadow-2xl p-6 text-[#173E30] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE0D4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#008069] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#173E30]">
                    {locale === "ar"
                      ? "إدارة رمز الأمان (PIN) للزبون"
                      : "Gestion du code PIN client"}
                  </h3>
                  <span className="text-[10px] text-[#5F655D] block">
                    {pinResetModal.customer.name} (#{pinResetModal.customer.memberCode})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPinResetModal({
                    isOpen: false,
                    customer: null,
                    newPin: "",
                    isSubmitting: false,
                    error: null,
                    success: null,
                  })
                }
                className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-[#5F655D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinResetModal.error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {pinResetModal.error}
              </div>
            )}

            {pinResetModal.success && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-600" />
                <span>{pinResetModal.success}</span>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#DCE0D4] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5F655D]">
                  {locale === "ar" ? "الرمز الحالي المسجل:" : "Code PIN actuel :"}
                </span>
                <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-[#C8D1BE]">
                  {pinResetModal.customer.securityPin || pinResetModal.customer.memberCode}
                </span>
              </div>
              <span className="text-[10px] text-[#5F655D] block">
                {locale === "ar"
                  ? "يستخدم الزبون هذا الرمز لاسترجاع بطاقته إذا غير هاتفه أو حذفها."
                  : "Le client utilise ce code pour récupérer son pass en cas de perte."}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#173E30] flex items-center justify-between">
                <span>
                  {locale === "ar"
                    ? "تعيين رمز PIN جديد (4 أرقام):"
                    : "Nouveau PIN (4 chiffres) :"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const rnd = Math.floor(1000 + Math.random() * 9000).toString();
                    setPinResetModal((prev) => ({ ...prev, newPin: rnd }));
                  }}
                  className="text-[10px] text-[#008069] font-bold hover:underline cursor-pointer"
                >
                  {locale === "ar" ? "توليد عشوائي 🎲" : "Générer aléatoire 🎲"}
                </button>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pinResetModal.newPin}
                onChange={(e) =>
                  setPinResetModal((prev) => ({
                    ...prev,
                    newPin: e.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
                placeholder="••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#C8D1BE] focus:border-[#008069] text-center text-xl font-mono font-bold tracking-widest text-[#173E30]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setPinResetModal({
                    isOpen: false,
                    customer: null,
                    newPin: "",
                    isSubmitting: false,
                    error: null,
                    success: null,
                  })
                }
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#C8D1BE] text-xs font-bold text-[#5F655D] hover:bg-[#FAF7F2] transition"
              >
                {locale === "ar" ? "إلغاء" : "Annuler"}
              </button>
              <button
                type="button"
                onClick={handleResetPinSubmit}
                disabled={
                  pinResetModal.isSubmitting ||
                  pinResetModal.newPin.length !== 4
                }
                className="flex-2 py-2.5 px-4 rounded-xl bg-[#008069] hover:bg-[#006D59] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {pinResetModal.isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {locale === "ar"
                        ? "حفظ رمز PIN الجديد"
                        : "Enregistrer PIN"}
                    </span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Home Screen Visual Guide Modal */}
      {showIOSInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            type="button"
            aria-label="إغلاق الدليل"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowIOSInstallGuide(false)}
          />
          <div className="relative z-10 bg-[#FFFDF7] border border-[#DCE0D4] rounded-3xl p-5 max-w-sm w-full text-[#173E30] shadow-2xl">
            <button
              type="button"
              onClick={() => setShowIOSInstallGuide(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-[#FAF7F2] text-[#5F655D] hover:text-[#173E30]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#008069]/10 border border-[#008069]/20 flex items-center justify-center text-[#008069]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#173E30]">
                  {locale === "ar"
                    ? `إضافة ${merchant.name} للشاشة الرئيسية`
                    : locale === "fr"
                    ? `Ajouter ${merchant.name} à l'écran d'accueil`
                    : `Añadir ${merchant.name} a inicio`}
                </h3>
                <p className="text-xs text-[#5F655D]">iPhone / iPad Safari</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-[#173E30]">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DCE0D4]">
                <span className="w-5 h-5 rounded-full bg-[#008069]/15 text-[#008069] font-bold flex items-center justify-center shrink-0">1</span>
                <p>
                  {locale === "ar"
                    ? "اضغط على زر المشاركة (Share) في أسفل شاشة Safari"
                    : locale === "fr"
                    ? "Appuyez sur le bouton Partager en bas de Safari"
                    : "Toca el botón Compartir en la parte inferior de Safari"}
                </p>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DCE0D4]">
                <span className="w-5 h-5 rounded-full bg-[#008069]/15 text-[#008069] font-bold flex items-center justify-center shrink-0">2</span>
                <p>
                  {locale === "ar"
                    ? 'مرّر للأسفل واختر "إضافة إلى الصفحة الرئيسية" (+)'
                    : locale === "fr"
                    ? 'Faites défiler vers le bas et sélectionnez "Sur l\'écran d\'accueil" (+)'
                    : 'Desplaza hacia abajo y selecciona "Añadir a pantalla de inicio" (+)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSInstallGuide(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#008069] hover:bg-[#006D59] text-white font-bold text-xs transition"
            >
              {locale === "ar" ? "فهمت" : locale === "fr" ? "J'ai compris" : "Entendido"}
            </button>
          </div>
        </div>
      )}

      {/* Slide-Over Drawer Menu (Phase 58) */}
      {isMenuDrawerOpen && (
        <div className="fixed inset-0 z-50 flex" dir={locale === "ar" ? "rtl" : "ltr"}>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-pointer"
            onClick={() => setIsMenuDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs bg-[#FFFDF7] text-[#173E30] h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header with Safe-Area Top Padding */}
            <div
              className="px-4 pb-4 bg-[#075E54] text-white flex items-center justify-between shadow-sm"
              style={{
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 14px)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-sm border border-white/20"
                  style={{ background: merchant.bgGradient || merchant.primaryColor }}
                >
                  {merchant.name.slice(0, 2)}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white truncate max-w-[170px]">
                    {merchant.name}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/20 text-white font-bold inline-block mt-0.5">
                    {merchant.plan}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links & Tools */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Navigation Sections */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#5F655D] px-2 uppercase tracking-wider">
                  {locale === "ar" ? "الأقسام الرئيسية" : "Sections"}
                </p>
                {[
                  { id: "home" as const, label: t.demo.ownerHome, icon: LayoutDashboard, ownerOnly: false },
                  { id: "customers" as const, label: t.demo.ownerClients, icon: Users, ownerOnly: false },
                  { id: "analytics" as const, label: t.demo.ownerAnalytics, icon: BarChart3, ownerOnly: false },
                  { id: "promo" as const, label: t.demo.ownerPromos, icon: Megaphone, ownerOnly: true },
                  { id: "settings" as const, label: t.demo.ownerSettings, icon: Settings, ownerOnly: false },
                ]
                  .filter((item) => !item.ownerOnly || isOwner)
                  .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMenuDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-start cursor-pointer ${
                        isActive
                          ? "bg-[#008069]/10 text-[#008069] border border-[#008069]/20"
                          : "hover:bg-[#FAF7F2] text-[#173E30]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#008069]" : "text-[#5F655D]"}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.id === "settings" && isOwner && hasUnsavedChanges && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-[#DCE0D4]" />

              {/* Quick Tools & Shortcuts */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-[#5F655D] px-2 uppercase tracking-wider">
                  {locale === "ar" ? "أدوات سريعة" : "Outils rapides"}
                </p>

                {/* Credits recharge */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    setIsCreditsOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#FAF7F2] text-[#173E30] transition text-start cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{locale === "ar" ? "رصيد العمليات" : "Solde de crédits"}</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    {merchant.credits}
                  </span>
                </button>

                {/* Counter Stand QR */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    setIsStandOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#FAF7F2] text-[#173E30] transition text-start cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#008069]" />
                  <span>{locale === "ar" ? "ستاند الكاونتر الذكي" : "Stand QR Comptoir"}</span>
                </button>

                {/* Join Link in New Tab */}
                <a
                  href={`/join/${merchant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#FAF7F2] text-[#173E30] transition text-start"
                >
                  <ExternalLink className="w-4 h-4 text-[#008069]" />
                  <span>{locale === "ar" ? "صفحة تسجيل العملاء" : "Page d'inscription"}</span>
                </a>

                {/* PWA Install in Drawer if available */}
                {!isInstalled && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuDrawerOpen(false);
                      handleInstallApp();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#FAF7F2] text-[#173E30] transition text-start cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>{locale === "ar" ? "تثبيت التطبيق على الهاتف" : "Installer l'application"}</span>
                  </button>
                )}
              </div>

              <div className="h-px bg-[#DCE0D4]" />

              {/* Language Switcher */}
              <div className="p-2 space-y-2">
                <p className="text-[11px] font-bold text-[#5F655D] uppercase tracking-wider">
                  {locale === "ar" ? "اللغة" : "Langue"}
                </p>
                <LanguageSwitcher size="sm" variant="light" />
              </div>
            </div>

            {/* Drawer Footer with Role Badge & Account Switcher */}
            <div className="p-4 border-t border-[#DCE0D4] bg-[#FAF7F2] space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FFFDF7] border border-[#DCE0D4]">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isRestrictedStaff ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                  <div className="text-start">
                    <span className="font-bold text-[#173E30] block text-xs">
                      {isRestrictedStaff && liveAuthBranch
                        ? liveAuthBranch.name
                        : isRestrictedStaff
                        ? authStaffName || (locale === "fr" ? "Caissier" : "كاشير")
                        : (locale === "fr" ? "Compte Propriétaire" : locale === "es" ? "Cuenta Propietario" : "صاحب المشروع")}
                    </span>
                    <span className="text-[10px] text-[#5F655D]">
                      {isRestrictedStaff
                        ? (locale === "fr" ? "Accès succursale" : locale === "es" ? "Acceso sucursal" : "حساب كاشير فرع مستقل")
                        : (locale === "fr" ? "Accès complet multi-succursales" : locale === "es" ? "Acceso global completo" : "صلاحيات شاملة لكل الفروع")}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#008069] border border-[#DCE0D4]">
                  {isRestrictedStaff ? "STAFF" : "OWNER"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogoutOrSwitchAccount}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 active:scale-98 border border-[#DCE0D4] hover:border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{locale === "fr" ? "Changer de compte / Déconnexion" : locale === "es" ? "Cambiar cuenta / Salir" : "تبديل الحساب / قفل اللوحة"}</span>
              </button>

              <div className="text-center pt-1">
                <span className="text-[10px] text-[#5F655D] font-mono">
                  Walink Engine v3.2 • {merchant.slug}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Customer Modal (Phase 58) */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            type="button"
            aria-label="إغلاق نافذة إضافة زبون"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsAddCustomerOpen(false)}
          />
          <div
            className="relative z-10 bg-[#FFFDF7] border border-[#DCE0D4] rounded-3xl p-5 max-w-sm w-full text-[#173E30] shadow-2xl animate-in zoom-in-95 duration-200"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE0D4] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008069]/10 text-[#008069] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#173E30]">
                    {locale === "ar" ? "إضافة زبون جديد" : "Ajouter un client"}
                  </h3>
                  <p className="text-[11px] text-[#5F655D]">
                    {locale === "ar" ? "تسجيل فوري وظهور مباشر في اللوحة" : "Enregistrement direct en temps réel"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#5F655D] hover:text-[#173E30] transition cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCustomerSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#173E30] mb-1">
                  {locale === "ar" ? "اسم الزبون *" : "Nom du client *"}
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder={locale === "ar" ? "مثال: يوسف العلمي" : "Ex: Youssef El Alami"}
                  className="w-full bg-[#FAF7F2] border-2 border-[#DCE0D4] focus:border-[#008069] rounded-xl px-3.5 py-2 text-xs text-[#173E30] outline-none transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#173E30] mb-1">
                  {locale === "ar" ? "رقم الهاتف / الواتساب *" : "Téléphone / WhatsApp *"}
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="06XXXXXXXX"
                  className="w-full bg-[#FAF7F2] border-2 border-[#DCE0D4] focus:border-[#008069] rounded-xl px-3.5 py-2 text-xs font-mono text-[#173E30] outline-none transition text-start"
                  dir="ltr"
                />
              </div>

              {/* Loyalty Type Selector */}
              <div>
                <label className="block text-xs font-bold text-[#173E30] mb-1">
                  {locale === "ar" ? "نوع برنامج الولاء" : "Type de fidélité"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCustLoyaltyType("STAMPS")}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      newCustLoyaltyType === "STAMPS"
                        ? "bg-[#008069] text-white border-[#008069] shadow-sm"
                        : "bg-[#FAF7F2] text-[#5F655D] border-[#DCE0D4] hover:bg-[#E8EDE3]"
                    }`}
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    <span>{locale === "ar" ? "طوابع" : "Tampons"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCustLoyaltyType("CASHBACK")}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      newCustLoyaltyType === "CASHBACK"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-[#FAF7F2] text-[#5F655D] border-[#DCE0D4] hover:bg-[#E8EDE3]"
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{locale === "ar" ? "كاش باك" : "Cashback"}</span>
                  </button>
                </div>
              </div>

              {/* Optional PIN */}
              <div>
                <label className="block text-xs font-bold text-[#173E30] mb-1">
                  {locale === "ar" ? "رمز PIN (اختياري 4 أرقام)" : "Code PIN (optionnel 4 chiffres)"}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newCustPin}
                  onChange={(e) => setNewCustPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full bg-[#FAF7F2] border-2 border-[#DCE0D4] focus:border-[#008069] rounded-xl px-3.5 py-2 text-center text-sm font-mono tracking-widest text-[#173E30] outline-none transition"
                />
              </div>

              {/* Error Message */}
              {addCustomerError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
                  {addCustomerError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAddingCustomer}
                className="w-full py-2.5 rounded-xl bg-[#008069] hover:bg-[#00705a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isAddingCustomer ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{locale === "ar" ? "إضافة وتفعيل البطاقة فوراً" : "Ajouter & Activer"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

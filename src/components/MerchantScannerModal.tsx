"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { Html5Qrcode } from "html5-qrcode";
import {
  X,
  Camera,
  Search,
  Sparkles,
  Gift,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  Award,
  Users,
  Coins,
  ArrowRightLeft,
} from "lucide-react";
import { soundEngine } from "@/lib/sound";
import { Locale, translations } from "@/lib/i18n/translations";

export interface CustomerSummary {
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
  lastVisitAt?: string | Date;
}

interface MerchantScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  rewardName: string;
  stampsRequired: number;
  loyaltyMode?: string;
  cashbackRate?: number;
  currency?: string;
  minCashbackRedeem?: number;
  customers: CustomerSummary[];
  onActionComplete: (updatedCustomer: CustomerSummary, message: string) => void;
  locale?: Locale;
  staffName?: string;
  userRole?: "OWNER" | "STAFF";
  branchName?: string;
}

export default function MerchantScannerModal({
  isOpen,
  onClose,
  slug,
  rewardName,
  stampsRequired,
  loyaltyMode = "BOTH",
  cashbackRate = 10,
  currency = "DH",
  minCashbackRedeem = 0,
  customers,
  onActionComplete,
  locale = "ar",
  staffName = "المدير",
  userRole = "OWNER",
  branchName,
}: MerchantScannerModalProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Cashback POS Calculator State
  const [posTab, setPosTab] = useState<"earn" | "redeem">("earn");
  const [billAmount, setBillAmount] = useState<string>("150");
  const [redeemAmount, setRedeemAmount] = useState<string>("");
  const [redeemBillTotal, setRedeemBillTotal] = useState<string>("");

  // Anti-Fraud Cooldown & Web NFC State
  const [cooldownWarning, setCooldownWarning] = useState<{
    minutesLeft: number;
    message: string;
    payload: Record<string, unknown>;
  } | null>(null);
  const [nfcScanning, setNfcScanning] = useState(false);

  const t = translations[locale] || translations.ar;
  const isRTL = locale === "ar";

  // Camera & Real-Time QR Scanner State
  const [cameraState, setCameraState] = useState<
    "idle" | "requesting" | "active" | "permission_denied" | "error"
  >("idle");
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef<boolean>(false);

  const handleSelectCustomer = useCallback((c: CustomerSummary) => {
    setSelectedCustomer(c);
    setMessage(null);
    setRedeemAmount(
      c.cashbackBalance && c.cashbackBalance > 0
        ? String(c.cashbackBalance)
        : ""
    );
  }, []);

  // Unified API Action Executor with Anti-Fraud Cooldown Interception & Staff Attribution
  const executeStampRequest = useCallback(
    async (payload: Record<string, unknown>, override = false) => {
      setLoading(true);
      setMessage(null);
      setCooldownWarning(null);

      try {
        const res = await fetch(`/api/m/${slug}/stamp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            ...payload,
            lang: locale,
            staffName:
              staffName ||
              (locale === "fr" ? "Gérant" : locale === "es" ? "Gerente" : "المدير"),
            branchName: branchName || undefined,
            overrideCooldown: override,
          }),
        });

        const data = await res.json();

        if (res.status === 429 && data.error === "COOLDOWN_ACTIVE") {
          setCooldownWarning({
            minutesLeft: data.minutesLeft || 5,
            message: data.message || "تم مسح بطاقة هذا العميل مؤخراً",
            payload,
          });
          soundEngine.playAlert();
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "فشل تنفيذ العملية");
        }

        setSelectedCustomer(data.customer);
        setMessage({ text: data.message, type: "success" });

        if (
          payload.action === "REDEEM" ||
          payload.action === "CASHBACK_REDEEM" ||
          payload.action === "CASHBACK_EARN"
        ) {
          soundEngine.playRewardChime();
        } else {
          soundEngine.playStampChime();
        }

        onActionComplete(data.customer, data.message);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "خطأ أثناء المعالجة";
        setMessage({ text: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [slug, locale, staffName, branchName, onActionComplete]
  );

  // Stop Camera & Release Hardware
  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Could not cleanly stop scanner:", err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
    setCameraState("idle");
  }, []);

  // Process decoded QR text
  const handleScannedCode = useCallback(
    (code: string) => {
      const raw = code.trim();
      if (!raw) return;

      // 1. Check if URL matches /pass/([a-zA-Z0-9_-]+)
      const urlMatch = raw.match(/\/pass\/([a-zA-Z0-9_-]+)/);
      const passSerialFromUrl = urlMatch
        ? urlMatch[1].split("?")[0].split(":")[0].trim()
        : null;

      // 2. Check if WALINK:pass-serial:token or WALINK:4821
      const walinkPayload = raw.startsWith("WALINK:")
        ? raw.replace("WALINK:", "").split(":")[0].trim()
        : null;

      // Look up customer in local customers cache
      const matched =
        customers.find((c) => {
          if (passSerialFromUrl && c.passSerial === passSerialFromUrl) return true;
          if (
            walinkPayload &&
            (c.passSerial === walinkPayload ||
              c.memberCode === walinkPayload ||
              c.id === walinkPayload)
          ) {
            return true;
          }
          if (c.passSerial === raw || c.memberCode === raw || c.phone === raw) {
            return true;
          }
          return false;
        }) || null;

      if (matched) {
        handleSelectCustomer(matched);
        setMessage({
          text:
            locale === "ar"
              ? `✅ تم التعرف على بطاقة ${matched.name} (#${matched.memberCode})`
              : locale === "fr"
              ? `✅ Carte de ${matched.name} (#${matched.memberCode}) identifiée`
              : `✅ Tarjeta de ${matched.name} (#${matched.memberCode}) identificada`,
          type: "success",
        });
      } else {
        // Not in local cache, resolve via server stamp API
        executeStampRequest({ identifier: raw, action: "STAMP" });
      }
    },
    [customers, handleSelectCustomer, locale, executeStampRequest]
  );

  // Start Camera with Dynamic Import & Fallbacks
  const startCamera = useCallback(async () => {
    if (typeof window === "undefined") return;
    setCameraState("requesting");
    setCameraErrorMessage(null);
    scanLockRef.current = false;

    try {
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch {
          // ignore
        }
      }

      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("walink-qr-viewfinder", { verbose: false });
      html5QrCodeRef.current = scanner;

      const onScanSuccess = (decodedText: string) => {
        if (scanLockRef.current) return;
        scanLockRef.current = true;

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([40, 60, 40]);
        }
        soundEngine.playStampChime();

        // Release camera hardware immediately
        stopCamera();

        // Process decoded string
        handleScannedCode(decodedText);
      };

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.floor(minEdge * 0.75);
          return { width: edge, height: edge };
        },
        aspectRatio: 1.777778,
      };

      try {
        await scanner.start(
          { facingMode: { ideal: "environment" } },
          config,
          onScanSuccess,
          () => {}
        );
        setCameraState("active");
      } catch (envErr: unknown) {
        console.warn("Camera facingMode ideal environment failed, attempting fallback:", envErr);
        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        if (cameras && cameras.length > 0) {
          const backCam =
            cameras.find((c) => /back|rear|environment/i.test(c.label)) || cameras[0];
          await scanner.start(backCam.id, config, onScanSuccess, () => {});
          setCameraState("active");
        } else {
          await scanner.start({ facingMode: "user" }, config, onScanSuccess, () => {});
          setCameraState("active");
        }
      }
    } catch (err: unknown) {
      console.warn("Camera initialization failed:", err);
      const isNotAllowed =
        err instanceof Error &&
        (err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError" ||
          err.message.toLowerCase().includes("permission") ||
          err.message.toLowerCase().includes("not allowed"));

      if (isNotAllowed) {
        setCameraState("permission_denied");
      } else {
        setCameraState("error");
      }
      setCameraErrorMessage(
        err instanceof Error ? err.message : "تعذر تشغيل الكاميرا"
      );
    }
  }, [stopCamera, handleScannedCode]);

  // Scanner Lifecycle
  useEffect(() => {
    if (!isOpen || activeTab !== "camera") {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  if (!isOpen) return null;

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await executeStampRequest({
      identifier: searchQuery.trim(),
      action: "STAMP",
    });
  };

  const handleStampOrRedeem = async (action: "STAMP" | "REDEEM") => {
    if (!selectedCustomer) return;
    await executeStampRequest({
      customerId: selectedCustomer.id,
      action,
    });
  };

  // Handle Cashback Earn
  const handleCashbackEarn = async () => {
    if (!selectedCustomer) return;
    const bill = parseFloat(billAmount);
    if (isNaN(bill) || bill <= 0) {
      setMessage({
        text: "يرجى إدخال مبلغ فاتورة صحيح",
        type: "error",
      });
      return;
    }
    await executeStampRequest({
      customerId: selectedCustomer.id,
      action: "CASHBACK_EARN",
      billAmount: bill,
    });
  };

  // Handle Cashback Redeem
  const handleCashbackRedeem = async () => {
    if (!selectedCustomer) return;
    const redeem = parseFloat(redeemAmount);
    if (isNaN(redeem) || redeem <= 0) {
      setMessage({
        text: "يرجى إدخال مبلغ صحيح للخصم",
        type: "error",
      });
      return;
    }
    await executeStampRequest({
      customerId: selectedCustomer.id,
      action: "CASHBACK_REDEEM",
      redeemAmount: redeem,
    });
  };

  // Handle Switch Customer Loyalty Type
  const handleSwitchType = async () => {
    if (!selectedCustomer) return;
    await executeStampRequest({
      customerId: selectedCustomer.id,
      action: "SWITCH_TYPE",
    });
  };

  // Web NFC Scan Support
  const handleNfcScan = async () => {
    if (typeof window !== "undefined" && "NDEFReader" in window) {
      try {
        setNfcScanning(true);
        interface NDEFReadingEvent {
          serialNumber?: string;
          message: { records: Array<{ data: BufferSource }> };
        }
        interface NDEFReaderInstance {
          scan: () => Promise<void>;
          onreading: ((event: NDEFReadingEvent) => void) | null;
        }
        type NDEFConstructor = new () => NDEFReaderInstance;
        const NfcConstructor = ("NDEFReader" in window ? (window as Window & { NDEFReader: NDEFConstructor }).NDEFReader : null);
        if (!NfcConstructor) {
          throw new Error("NDEFReader not available");
        }
        const ndef = new NfcConstructor();
        await ndef.scan();
        ndef.onreading = (event: NDEFReadingEvent) => {
          let text = "";
          for (const record of event.message.records) {
            const decoder = new TextDecoder();
            text = decoder.decode(record.data);
            if (text) break;
          }
          const scanned = text || event.serialNumber || "";
          if (scanned) {
            setNfcScanning(false);
            executeStampRequest({ identifier: scanned, action: "STAMP" });
          }
        };
      } catch (err) {
        console.warn("NFC Error:", err);
        setNfcScanning(false);
        setMessage({ text: t.walletEnterprise.security.nfcUnsupported, type: "error" });
        setActiveTab("camera");
      }
    } else {
      setNfcScanning(true);
      setTimeout(() => {
        setNfcScanning(false);
        if (customers.length > 0) {
          const sample = customers[0];
          handleSelectCustomer(sample);
          setMessage({ text: `📲 تم قراءة بطاقة ${sample.name} بنجاح عبر NFC!`, type: "success" });
        } else {
          setMessage({ text: t.walletEnterprise.security.nfcUnsupported, type: "error" });
          setActiveTab("camera");
        }
      }, 1000);
    }
  };

  const handleModalClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  const isCashback = selectedCustomer?.loyaltyType === "CASHBACK";
  const isRewardReady = selectedCustomer
    ? selectedCustomer.stamps >= stampsRequired
    : false;

  const calculatedEarned = Number(
    (((parseFloat(billAmount) || 0) * cashbackRate) / 100).toFixed(2)
  );

  const parsedRedeem = parseFloat(redeemAmount) || 0;
  const parsedBillTotal = parseFloat(redeemBillTotal) || 0;
  const remainingCashToPay = Math.max(0, parsedBillTotal - parsedRedeem);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white border border-[#E9EDEF] rounded-3xl shadow-2xl p-5 text-[#111B21] my-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9EDEF]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#008069]/10 text-[#008069] border border-[#008069]/20 shadow-sm">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-[#111B21]">
                {t.merchant.scannerBtn}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[11px] text-[#54656F]">
                  امسح الرمز أو اختر عميلاً بالرقم
                </p>
                {branchName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#008069]/10 text-[#008069] font-bold border border-[#008069]/20">
                    📍 {branchName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="p-1.5 rounded-xl hover:bg-[#F0F2F5] text-[#54656F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F0F2F5] rounded-2xl border border-[#E9EDEF] text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              setMessage(null);
            }}
            className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === "camera"
                ? "bg-[#008069] text-white shadow-sm"
                : "text-[#54656F] hover:text-[#111B21]"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>كاميرا QR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              setMessage(null);
            }}
            className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === "manual"
                ? "bg-[#008069] text-white shadow-sm"
                : "text-[#54656F] hover:text-[#111B21]"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>بحث يدوي</span>
          </button>

          <button
            type="button"
            onClick={handleNfcScan}
            disabled={nfcScanning}
            className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition border ${
              nfcScanning
                ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                : "bg-white text-[#008069] border-[#D1D7DB] hover:bg-[#F0F2F5]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{nfcScanning ? "جاري التقريب..." : "مسح NFC"}</span>
          </button>
        </div>

        {/* Anti-Fraud Cooldown Warning Banner */}
        {cooldownWarning && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{cooldownWarning.message}</span>
            </div>
            <button
              type="button"
              onClick={() => executeStampRequest(cooldownWarning.payload, true)}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>{t.walletEnterprise.staff.overrideCooldown}</span>
            </button>
          </div>
        )}

        {/* Camera View Mode */}
        {activeTab === "camera" && (
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
              {/* HTML5 QR Code Mount Element (Always in DOM with full dimensions) */}
              <div
                id="walink-qr-viewfinder"
                className="absolute inset-0 w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>video]:rounded-2xl overflow-hidden"
              />

              {/* Viewfinder Target Overlays & Laser when active */}
              {cameraState === "active" && (
                <div className="absolute inset-8 border-2 border-[#00A884] rounded-2xl pointer-events-none flex items-center justify-center z-10">
                  <span className="w-full h-0.5 bg-[#00A884] absolute shadow-[0_0_12px_#00A884] animate-pulse" />
                </div>
              )}

              {/* Camera State 1: Requesting / Loading */}
              {cameraState === "requesting" && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 space-y-2.5 z-10 text-center">
                  <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">
                    {locale === "ar"
                      ? "جاري تهيئة الكاميرا والماسح..."
                      : locale === "fr"
                      ? "Initialisation de la caméra..."
                      : "Inicializando la cámara..."}
                  </p>
                </div>
              )}

              {/* Camera State 2: Idle (Prompt to start with direct user gesture) */}
              {cameraState === "idle" && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 space-y-3 z-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto text-emerald-300">
                    <Camera className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {locale === "ar"
                        ? "جاهز للمسح الضوئي"
                        : locale === "fr"
                        ? "Prêt pour le scan"
                        : "Listo para escanear"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {locale === "ar"
                        ? "اضغط لتشغيل الكاميرا ومسح كود الزبون"
                        : locale === "fr"
                        ? "Appuyez pour activer la caméra"
                        : "Toca para activar la cámara"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#008069]/30 active:scale-95 transition mx-auto cursor-pointer"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {locale === "ar"
                        ? "تشغيل الكاميرا والمسح 📷"
                        : locale === "fr"
                        ? "Activer la caméra 📷"
                        : "Activar la cámara 📷"}
                    </span>
                  </button>
                </div>
              )}

              {/* Camera State 3: Permission Denied or Error */}
              {(cameraState === "permission_denied" || cameraState === "error") && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 space-y-3 z-10 text-center">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center mx-auto text-rose-300">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      {cameraState === "permission_denied"
                        ? locale === "ar"
                          ? "تم رفض إذن الكاميرا"
                          : locale === "fr"
                          ? "Accès caméra refusé"
                          : "Acceso a cámara denegado"
                        : locale === "ar"
                        ? "تعذر تشغيل الكاميرا"
                        : locale === "fr"
                        ? "Erreur de caméra"
                        : "Error de cámara"}
                    </p>
                    <p className="text-[11px] text-rose-200/90 mt-1 leading-relaxed">
                      {cameraState === "permission_denied"
                        ? locale === "ar"
                          ? "يرجى تفعيل إذن الكاميرا من إعدادات المتصفح أو التطبيق ثم إعادة المحاولة."
                          : locale === "fr"
                          ? "Veuillez autoriser la caméra dans les paramètres de votre navigateur."
                          : "Active el permiso de cámara en los ajustes del navegador."
                        : cameraErrorMessage ||
                          (locale === "ar"
                            ? "تأكد من عدم استخدام الكاميرا من قِبل تطبيق آخر."
                            : locale === "fr"
                            ? "Vérifiez qu'aucune autre application n'utilise la caméra."
                            : "Verifique que otra aplicación no esté usando la cámara.")}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-white/20 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{locale === "ar" ? "إعادة المحاولة" : locale === "fr" ? "Réessayer" : "Reintentar"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("manual")}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{locale === "ar" ? "بحث يدوي" : locale === "fr" ? "Recherche" : "Buscar"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Control Bar when Active */}
            {cameraState === "active" && (
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {locale === "ar" ? "الماسح نشط، وجّه الكاميرا إلى كود QR" : locale === "fr" ? "Scanner actif, visez le QR code" : "Escáner activo, enfoque el código QR"}
                </span>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-[11px] text-[#54656F] hover:text-[#111B21] font-bold underline cursor-pointer"
                >
                  {locale === "ar" ? "إيقاف الكاميرا" : locale === "fr" ? "Arrêter" : "Detener"}
                </button>
              </div>
            )}

            {/* Quick Fast-Picker from seeded customers */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#54656F] block">
                اختر عميلاً سريعاً للتجربة الفورية:
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {customers.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCustomer(c)}
                    className={`p-2 rounded-xl border text-start text-xs transition flex items-center justify-between ${
                      selectedCustomer?.id === c.id
                        ? "bg-[#008069]/10 border-[#008069] text-[#111B21] font-semibold"
                        : "bg-[#F0F2F5] border-[#E9EDEF] hover:bg-[#E9EDEF] text-[#111B21]"
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold block truncate">{c.name}</span>
                      <span className="text-[10px] text-[#54656F] font-mono">
                        #{c.memberCode}
                      </span>
                    </div>
                    {c.loyaltyType === "CASHBACK" ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                        كاش باك
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#008069] bg-[#008069]/10 px-1.5 py-0.5 rounded border border-[#008069]/20">
                        {c.stamps}/{stampsRequired}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manual Search Mode */}
        {activeTab === "manual" && (
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#111B21] block">
                {t.merchant.manualLookup}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="tel"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.merchant.searchPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F0F2F5] border border-[#D1D7DB] text-[#111B21] placeholder-[#54656F] text-xs font-mono focus:outline-none focus:border-[#008069] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute left-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-gradient-to-r from-[#00A884] to-[#008069] text-white font-bold text-xs flex items-center gap-1 hover:from-[#008069] disabled:opacity-50 shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>بحث وختم</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Status Feedback Message */}
        {message && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                : "bg-rose-50 border border-rose-200 text-rose-900"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            )}
            <span className="leading-snug font-semibold">{message.text}</span>
          </div>
        )}

        {/* Selected Customer Card & Dual POS Controls */}
        {selectedCustomer && (
          <div className="p-4 rounded-2xl bg-[#F0F2F5] border border-[#E9EDEF] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9EDEF]">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#111B21]">
                    {selectedCustomer.name}
                  </h4>
                  {isCashback ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span>{t.merchant.badgeCashback} ({cashbackRate}%)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#008069] bg-[#008069]/10 px-2 py-0.5 rounded-full border border-[#008069]/20 flex items-center gap-1">
                      <Gift className="w-3 h-3 text-[#008069]" />
                      <span>{t.merchant.badgeStamps}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#54656F] font-mono">
                  #{selectedCustomer.memberCode} • {selectedCustomer.phone}
                </span>
              </div>

              {loyaltyMode === "BOTH" && (
                <button
                  type="button"
                  onClick={handleSwitchType}
                  disabled={loading}
                  className="px-2 py-1 rounded-lg bg-white border border-[#D1D7DB] text-[10px] font-semibold text-[#111B21] flex items-center gap-1 transition shadow-sm hover:bg-[#F0F2F5]"
                  title="تحويل نظام العميل"
                >
                  <ArrowRightLeft className="w-3 h-3 text-[#008069]" />
                  <span>تبديل</span>
                </button>
              )}
            </div>

            {/* IF CUSTOMER HAS STAMPS */}
            {!isCashback && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#54656F] font-semibold">الأختام المجمّعة:</span>
                  <span className="font-mono font-bold text-[#008069] text-sm">
                    {selectedCustomer.stamps} / {stampsRequired}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleStampOrRedeem("STAMP")}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.merchant.addStampBtn}</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading || selectedCustomer.stamps < stampsRequired}
                    onClick={() => handleStampOrRedeem("REDEEM")}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-30 ${
                      selectedCustomer.stamps >= stampsRequired
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md animate-pulse"
                        : "bg-white text-[#54656F] border border-[#D1D7DB]"
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>{t.merchant.redeemRewardBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* IF CUSTOMER HAS CASHBACK (2-Tab POS Action Box) */}
            {isCashback && (
              <div className="space-y-3">
                {/* Available Balance Display */}
                <div className="p-3 rounded-xl bg-white border border-amber-300 flex items-center justify-between shadow-sm">
                  <span className="text-xs text-[#54656F] font-semibold">
                    {t.merchant.currentBalance}
                  </span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-xl font-extrabold text-amber-700">
                      {Number(selectedCustomer.cashbackBalance || 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-amber-600 font-bold">{currency}</span>
                  </div>
                </div>

                {/* Sub-tabs: Earn vs Redeem */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-white rounded-xl border border-[#D1D7DB] text-[11px] font-semibold shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPosTab("earn")}
                    className={`py-1.5 rounded-lg transition ${
                      posTab === "earn"
                        ? "bg-[#008069] text-white font-bold shadow-sm"
                        : "text-[#54656F] hover:text-[#111B21]"
                    }`}
                  >
                    {t.merchant.earnCashbackTab}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosTab("redeem")}
                    className={`py-1.5 rounded-lg transition ${
                      posTab === "redeem"
                        ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                        : "text-[#54656F] hover:text-[#111B21]"
                    }`}
                  >
                    {t.merchant.redeemCashbackTab}
                  </button>
                </div>

                {/* Tab A: Add Cashback */}
                {posTab === "earn" && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#54656F] font-semibold block">
                        {t.merchant.billAmountLabel.replace("{currency}", currency)}
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        step="any"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#D1D7DB] text-[#111B21] font-mono text-sm focus:outline-none focus:border-[#008069] shadow-sm"
                      />
                    </div>

                    {/* Quick Pills */}
                    <div className="flex items-center gap-1.5">
                      {["50", "100", "150", "200", "300"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBillAmount(val)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-[#E9EDEF] text-[10px] font-mono text-[#111B21] border border-[#D1D7DB] transition shadow-sm font-semibold"
                        >
                          {val}
                        </button>
                      ))}
                    </div>

                    {/* Calculation Preview */}
                    <p className="text-[11px] text-[#008069] font-semibold leading-tight">
                      {t.merchant.calculatePreview
                        .replace("{amount}", String(calculatedEarned))
                        .replace("{currency}", currency)
                        .replace("{rate}", String(cashbackRate))}
                    </p>

                    <button
                      type="button"
                      disabled={loading || calculatedEarned <= 0}
                      onClick={handleCashbackEarn}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-[#008069]/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {t.merchant.confirmEarnBtn
                          .replace("{amount}", String(calculatedEarned))
                          .replace("{currency}", currency)}
                      </span>
                    </button>
                  </div>
                )}

                {/* Tab B: Redeem Cashback */}
                {posTab === "redeem" && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-[#54656F] font-semibold block">
                          {t.merchant.redeemAmountLabel.replace(
                            "{currency}",
                            currency
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setRedeemAmount(
                              String(selectedCustomer.cashbackBalance || 0)
                            )
                          }
                          className="text-[10px] text-amber-700 font-bold underline hover:text-amber-800"
                        >
                          {t.merchant.redeemFullBtn
                            .replace(
                              "{amount}",
                              String(
                                Number(
                                  selectedCustomer.cashbackBalance || 0
                                ).toFixed(2)
                              )
                            )
                            .replace("{currency}", currency)}
                        </button>
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        max={selectedCustomer.cashbackBalance || 0}
                        step="any"
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(e.target.value)}
                        placeholder="0.00"
                        aria-label="مبلغ الكاش باك المراد صرفه"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#D1D7DB] text-[#111B21] font-mono text-sm focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#54656F] block">
                        قيمة الفاتورة الإجمالية (اختياري لحساب الباقي):
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        value={redeemBillTotal}
                        onChange={(e) => setRedeemBillTotal(e.target.value)}
                        placeholder="100"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#D1D7DB] text-[#111B21] font-mono text-xs focus:outline-none shadow-sm"
                      />
                    </div>

                    {parsedBillTotal > 0 && (
                      <p className="text-[11px] text-[#111B21] font-semibold">
                        {t.merchant.remainingToPay
                          .replace("{amount}", remainingCashToPay.toFixed(2))
                          .replace("{currency}", currency)}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={
                        loading ||
                        parsedRedeem <= 0 ||
                        parsedRedeem > (selectedCustomer.cashbackBalance || 0)
                      }
                      onClick={handleCashbackRedeem}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-amber-500/20"
                    >
                      <Coins className="w-4 h-4" />
                      <span>
                        {t.merchant.confirmRedeemBtn
                          .replace("{amount}", String(parsedRedeem))
                          .replace("{currency}", currency)}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

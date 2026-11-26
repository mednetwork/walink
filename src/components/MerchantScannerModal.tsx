"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import jsQR from "jsqr";
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
  Minus,
  RefreshCw,
  Award,
  Users,
  Coins,
  ArrowRightLeft,
  Zap,
} from "lucide-react";
import { soundEngine } from "@/lib/sound";
import { Locale, translations } from "@/lib/i18n/translations";
import { formatStamps } from "@/lib/utils";

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect: (source: CanvasImageSource) => Promise<BarcodeDetectorResult[]>;
}

type BarcodeDetectorConstructor = new (options?: { formats: string[] }) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

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

export interface ActionSuccessPayload {
  type: "STAMP" | "CASHBACK" | "REDEEM";
  customerName: string;
  memberCode: string;
  stamps?: number;
  stampsRequired?: number;
  isRewardEarned?: boolean;
  rewardName?: string;
  cashbackEarned?: number;
  cashbackBalance?: number;
  billAmount?: number;
  currency?: string;
}

export interface CreatedTransactionSummary {
  id: string;
  type: string;
  stampsDelta: number;
  branchName?: string | null;
  note?: string | null;
  createdAt?: string | Date;
}

interface MerchantScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomer?: CustomerSummary | null;
  slug: string;
  rewardName: string;
  stampsRequired: number;
  loyaltyMode?: string;
  cashbackRate?: number;
  currency?: string;
  minCashbackRedeem?: number;
  customers: CustomerSummary[];
  onActionComplete: (
    updatedCustomer: CustomerSummary,
    message: string,
    remainingCredits?: number,
    successData?: ActionSuccessPayload,
    createdTransaction?: CreatedTransactionSummary
  ) => void;
  onOpenCredits?: () => void;
  locale?: Locale;
  staffName?: string;
  userRole?: "OWNER" | "STAFF";
  branchName?: string;
  allowMultiStamps?: boolean;
}

export default function MerchantScannerModal({
  isOpen,
  onClose,
  initialCustomer,
  slug,
  rewardName,
  stampsRequired,
  loyaltyMode = "BOTH",
  cashbackRate = 10,
  currency = "DH",
  minCashbackRedeem = 0,
  customers,
  onActionComplete,
  onOpenCredits,
  locale = "ar",
  staffName = "المدير",
  userRole = "OWNER",
  branchName,
  allowMultiStamps = false,
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
  const [billAmount, setBillAmount] = useState<string>("");
  const [redeemAmount, setRedeemAmount] = useState<string>("");
  const [redeemBillTotal, setRedeemBillTotal] = useState<string>("");
  const billInputRef = useRef<HTMLInputElement | null>(null);

  const calculatedEarned = Number(
    (((parseFloat(billAmount) || 0) * cashbackRate) / 100).toFixed(2)
  );

  // Anti-Fraud Cooldown & Web NFC State
  const [stampDelta, setStampDelta] = useState<number>(1);
  const [stampCooldownMinutesLeft, setStampCooldownMinutesLeft] = useState<number>(0);
  const [cooldownWarning, setCooldownWarning] = useState<{
    minutesLeft: number;
    message: string;
    payload: Record<string, unknown>;
  } | null>(null);
  const [nfcScanning, setNfcScanning] = useState(false);

  const t = translations[locale] || translations.ar;
  const isRTL = locale === "ar";

  // Camera & Real-Time QR Scanner State (Native <video> + jsQR & BarcodeDetector)
  const [cameraState, setCameraState] = useState<
    "idle" | "requesting" | "active" | "permission_denied" | "error"
  >("idle");
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const scanLockRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop Camera & Release Hardware Cleanly
  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current as NodeJS.Timeout);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn("Could not stop stream tracks:", err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState("idle");
  }, []);

  const handleModalClose = useCallback(() => {
    stopCamera();
    setSelectedCustomer(null);
    setCooldownWarning(null);
    setMessage(null);
    setStampDelta(1);
    setStampCooldownMinutesLeft(0);
    scanLockRef.current = false;
    onClose();
  }, [stopCamera, onClose]);

  const fetchCustomerCooldown = useCallback(
    async (customerId: string) => {
      if (!allowMultiStamps) {
        setStampCooldownMinutesLeft(0);
        setStampDelta(1);
        return;
      }
      try {
        const res = await fetch(`/api/m/${slug}/stamp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            customerId,
            action: "LOOKUP",
            lang: locale,
            staffName,
            branchName,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        const left = Number(data.stampCooldownMinutesLeft || 0);
        const liveCustomer: CustomerSummary | undefined = data.customer;
        if (liveCustomer) {
          setSelectedCustomer(liveCustomer);
        }
        const availableStamps = liveCustomer?.stamps ?? 0;
        setStampCooldownMinutesLeft(left > 0 ? left : 0);
        if (left > 0) {
          setStampDelta(availableStamps >= 1 ? -1 : 1);
        } else {
          setStampDelta(1);
        }
      } catch {
        // Fallback to server-side validation on submit
      }
    },
    [allowMultiStamps, slug, locale, staffName, branchName]
  );

  const handleSelectCustomer = useCallback((c: CustomerSummary) => {
    stopCamera();
    setSelectedCustomer(c);
    setCooldownWarning(null);
    setMessage(null);
    setStampDelta(1);
    setStampCooldownMinutesLeft(0);
    const isCustCashback = c.loyaltyType === "CASHBACK" || loyaltyMode === "CASHBACK";
    if (isCustCashback) {
      setPosTab("earn");
      setBillAmount("");
    } else if (allowMultiStamps) {
      void fetchCustomerCooldown(c.id);
    }
    setRedeemAmount(
      c.cashbackBalance && c.cashbackBalance > 0
        ? String(c.cashbackBalance)
        : ""
    );
  }, [stopCamera, loyaltyMode, allowMultiStamps, fetchCustomerCooldown]);

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
            overrideCooldown: allowMultiStamps
              ? false
              : userRole === "OWNER"
              ? true
              : override,
          }),
        });

        const data = await res.json();

        if (res.status === 429 && data.error === "COOLDOWN_ACTIVE") {
          stopCamera();
          if (allowMultiStamps && selectedCustomer) {
            const left = Number(data.minutesLeft || 30);
            setStampCooldownMinutesLeft(left);
            if ((selectedCustomer.stamps || 0) >= 1) {
              setStampDelta(-1);
            }
            setMessage({
              text:
                data.message ||
                (locale === "fr"
                  ? "Tampon déjà ajouté. Veuillez patienter 30 min (vous pouvez déduire un tampon)."
                  : locale === "es"
                  ? "Sello añadido recientemente. Espere 30 min (puede restar un sello)."
                  : "تم إضافة ختم مؤخراً، يرجى انتظار 30 دقيقة (يمكنك خصم ختم لتصحيح خطأ)."),
              type: "error",
            });
            soundEngine.playAlert();
            return;
          }

          setCooldownWarning({
            minutesLeft: data.minutesLeft || 30,
            message:
              data.message ||
              (locale === "fr"
                ? "Cette carte a déjà été tamponnée récemment (règle des 30 min)."
                : locale === "es"
                ? "Esta tarjeta ya fue sellada recientemente (regla de 30 min)."
                : "تم عمل ختم لهذا الزبون مؤخراً، يرجى الانتظار 30 دقيقة."),
            payload,
          });
          soundEngine.playAlert();
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "فشل تنفيذ العملية");
        }

        if (payload.action === "SWITCH_TYPE") {
          setSelectedCustomer(data.customer);
          setMessage({ text: data.message, type: "success" });
        } else if (payload.action === "LOOKUP") {
          // Rule 1: Do NOT auto-close modal on LOOKUP! Keep open in POS Calculator mode
          const cust = data.customer;
          const isCustCashback = cust?.loyaltyType === "CASHBACK" || loyaltyMode === "CASHBACK";
          const cooldownLeft = Number(data.stampCooldownMinutesLeft || 0);
          stopCamera();
          setSelectedCustomer(cust);
          setStampCooldownMinutesLeft(cooldownLeft > 0 ? cooldownLeft : 0);
          if (cooldownLeft > 0) {
            setStampDelta((cust?.stamps ?? 0) >= 1 ? -1 : 1);
          } else {
            setStampDelta(1);
          }
          if (isCustCashback) {
            setPosTab("earn");
            setBillAmount("");
            soundEngine.playRewardChime();
          } else {
            soundEngine.playStampChime();
          }
          setMessage({
            text:
              locale === "ar"
                ? isCustCashback
                  ? `✅ تم التعرف على بطاقة ${cust.name}! أدخل ثمن الفاتورة لحساب الكاش باك 💰`
                  : `✅ تم التعرف على بطاقة ${cust.name} (#${cust.memberCode})`
                : locale === "fr"
                ? `✅ Carte de ${cust.name} (#${cust.memberCode}) identifiée`
                : `✅ Tarjeta de ${cust.name} (#${cust.memberCode}) identificada`,
            type: "success",
          });
          return;
        } else {
          // Action succeeded (STAMP, REDEEM, CASHBACK_EARN, CASHBACK_REDEEM)
          // Close modal immediately and notify parent dashboard
          setSelectedCustomer(null);
          handleModalClose();
        }

        if (
          payload.action === "REDEEM" ||
          payload.action === "CASHBACK_REDEEM" ||
          payload.action === "CASHBACK_EARN"
        ) {
          soundEngine.playRewardChime();
        } else {
          soundEngine.playStampChime();
        }

        // Construct rich OperationSuccessPayload for the 3-second celebratory modal
        let successPayload: ActionSuccessPayload | undefined = undefined;
        if (payload.action === "STAMP" || payload.action === "STAMP_ADJUST") {
          successPayload = {
            type: "STAMP",
            customerName: data.customer.name,
            memberCode: data.customer.memberCode,
            stamps: data.customer.stamps,
            stampsRequired,
            isRewardEarned:
              payload.action === "STAMP" && data.customer.stamps >= stampsRequired,
            rewardName,
          };
        } else if (payload.action === "CASHBACK_EARN") {
          successPayload = {
            type: "CASHBACK",
            customerName: data.customer.name,
            memberCode: data.customer.memberCode,
            cashbackEarned: data.earned ?? data.earnedAmount ?? calculatedEarned,
            cashbackBalance: data.customer.cashbackBalance,
            billAmount: Number(payload.billAmount) || parseFloat(billAmount) || 0,
            currency,
          };
        } else if (payload.action === "REDEEM" || payload.action === "CASHBACK_REDEEM") {
          successPayload = {
            type: "REDEEM",
            customerName: data.customer.name,
            memberCode: data.customer.memberCode,
            stamps: data.customer.stamps,
            stampsRequired,
            rewardName,
          };
        }

        const txSummary: CreatedTransactionSummary | undefined = data.transaction
          ? {
              id: data.transaction.id,
              type: data.transaction.type,
              stampsDelta: data.transaction.stampsDelta ?? 0,
              branchName: data.transaction.branchName ?? branchName ?? null,
              note: data.transaction.note ?? message,
              createdAt: data.transaction.createdAt,
            }
          : undefined;

        onActionComplete(
          data.customer,
          data.message,
          data.remainingCredits,
          successPayload,
          txSummary
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "خطأ أثناء المعالجة";
        setMessage({ text: msg, type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [slug, locale, staffName, branchName, userRole, allowMultiStamps, selectedCustomer, loyaltyMode, stopCamera, onActionComplete, handleModalClose, stampsRequired, rewardName, calculatedEarned, billAmount, currency]
  );

  // Process decoded QR text: Direct Auto-Stamp on STAMPS or Instant Bill Calculator on CASHBACK
  const handleScannedCode = useCallback(
    async (code: string) => {
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
      let matched: CustomerSummary | null =
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

      if (!matched) {
        // Not in local cache (freshly registered customer). Fetch live via LOOKUP
        setLoading(true);
        try {
          const res = await fetch(`/api/m/${slug}/stamp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: raw,
              action: "LOOKUP",
              lang: locale,
              staffName,
              branchName,
            }),
          });
          const data = await res.json();
          if (res.ok && data.customer) {
            matched = data.customer;
          } else {
            soundEngine.playAlert();
            setMessage({
              text: data.error || (locale === "ar" ? "لم يتم العثور على بطاقة مطابقة" : "Carte introuvable"),
              type: "error",
            });
            setTimeout(() => {
              scanLockRef.current = false;
            }, 1800);
            return;
          }
        } catch {
          soundEngine.playAlert();
          setMessage({
            text: locale === "ar" ? "فشل الاتصال بالخادم" : "Erreur de connexion",
            type: "error",
          });
          setTimeout(() => {
            scanLockRef.current = false;
          }, 1800);
          return;
        } finally {
          setLoading(false);
        }
      }

      if (!matched) return;

      const isCustCashback = matched.loyaltyType === "CASHBACK" || loyaltyMode === "CASHBACK";

      if (isCustCashback) {
        // Stop camera, show Bill Amount POS Calculator modal view with auto-focused bill input
        stopCamera();
        setSelectedCustomer(matched);
        setPosTab("earn");
        setBillAmount("");
        soundEngine.playRewardChime();
        setTimeout(() => {
          billInputRef.current?.focus();
        }, 150);
      } else {
        // STAMPS loyalty program:
        if (allowMultiStamps) {
          stopCamera();
          setSelectedCustomer(matched);
          setMessage(null);
          setStampDelta(1);
          soundEngine.playStampChime();
          void fetchCustomerCooldown(matched.id);
        } else if (matched.stamps >= stampsRequired) {
          // Card already completed and ready to redeem! Show redeem view
          stopCamera();
          setSelectedCustomer(matched);
          soundEngine.playRewardChime();
        } else {
          // Under stampsRequired: Auto-Execute action: "STAMP" immediately!
          stopCamera();
          await executeStampRequest({
            customerId: matched.id,
            identifier: matched.passSerial || matched.memberCode,
            action: "STAMP",
          });
        }
      }
    },
    [customers, loyaltyMode, stampsRequired, allowMultiStamps, slug, locale, staffName, branchName, stopCamera, executeStampRequest, fetchCustomerCooldown]
  );

  // Real-Time Frame Scanner (Engine A: jsQR + Engine B: BarcodeDetector Boost)
  const scanFrame = useCallback(() => {
    if (scanLockRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (vw <= 0 || vh <= 0) return;

    // Centered crop (80% of min dimension) for maximum QR precision
    const minDim = Math.min(vw, vh);
    const cropSize = Math.floor(minDim * 0.8);
    const sx = (vw - cropSize) / 2;
    const sy = (vh - cropSize) / 2;

    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, targetSize, targetSize);
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);

    // Engine A: jsQR with both regular and inverted pattern recognition
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });

    if (code && code.data && code.data.trim()) {
      scanLockRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
      soundEngine.playStampChime();
      stopCamera();
      handleScannedCode(code.data.trim());
      return;
    }

    // Engine B: Native hardware-accelerated BarcodeDetector if supported
    if (typeof window !== "undefined" && window.BarcodeDetector) {
      try {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        detector
          .detect(canvas)
          .then((barcodes) => {
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue && !scanLockRef.current) {
              scanLockRef.current = true;
              if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([40, 60, 40]);
              }
              soundEngine.playStampChime();
              stopCamera();
              handleScannedCode(barcodes[0].rawValue.trim());
            }
          })
          .catch(() => {});
      } catch {
        // jsQR already handles frames
      }
    }
  }, [handleScannedCode, stopCamera]);

  // 3-Tier Progressive getUserMedia Waterfall (Multi-Lens iPhone Safe)
  const startCamera = useCallback(async () => {
    if (typeof window === "undefined") return;
    stopCamera();
    setCameraState("requesting");
    setCameraErrorMessage(null);
    scanLockRef.current = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState("error");
      setCameraErrorMessage(
        locale === "ar"
          ? "الكاميرا غير مدعومة في هذا المتصفح أو يتطلب الموقع اتصالاً آمناً (HTTPS)."
          : locale === "fr"
          ? "Caméra non prise en charge ou connexion sécurisée (HTTPS) requise."
          : "Cámara no soportada o se requiere conexión segura (HTTPS)."
      );
      return;
    }

    let activeStream: MediaStream | null = null;

    // Attempt 1: Ideal environment
    try {
      activeStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
    } catch (err1: unknown) {
      console.warn("Camera Attempt 1 (ideal environment) failed, trying Attempt 2:", err1);
      // Attempt 2: Plain environment string (Safari / iOS multi-lens friendly)
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "environment" },
        });
      } catch (err2: unknown) {
        console.warn("Camera Attempt 2 (environment) failed, trying Attempt 3:", err2);
        // Attempt 3: Universal video fallback
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
          });
        } catch (err3: unknown) {
          console.error("All 3 Camera attempts failed:", err3);
          const errObj = err3 as { name?: string; message?: string } | null;
          const errName = errObj?.name || "";
          const rawMsg = typeof err3 === "string" ? err3 : errObj?.message || String(err3);

          if (
            errName === "NotAllowedError" ||
            errName === "PermissionDeniedError" ||
            rawMsg.toLowerCase().includes("denied") ||
            rawMsg.toLowerCase().includes("not allowed")
          ) {
            setCameraState("permission_denied");
          } else {
            setCameraState("error");
          }
          setCameraErrorMessage(errName ? `${errName}: ${rawMsg}` : rawMsg);
          return;
        }
      }
    }

    if (!activeStream) {
      setCameraState("error");
      setCameraErrorMessage("تعذر استلام بث الكاميرا");
      return;
    }

    streamRef.current = activeStream;

    const video = videoRef.current;
    if (video) {
      video.srcObject = activeStream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;
      try {
        await video.play();
      } catch (playErr) {
        console.warn("Video play was interrupted or pending:", playErr);
      }
    }

    setCameraState("active");

    // Start throttled frame scanning loop (~10 FPS = 100ms)
    scanTimerRef.current = setInterval(() => {
      scanFrame();
    }, 100);
  }, [scanFrame, stopCamera, locale]);

  // Reset Customer & Return to Square Scanner View
  const handleResetCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCooldownWarning(null);
    setMessage(null);
    setStampDelta(1);
    setStampCooldownMinutesLeft(0);
    setBillAmount("");
    setRedeemAmount("");
    scanLockRef.current = false;
    setActiveTab("camera");
    startCamera();
  }, [startCamera]);

  // Native Camera Photo Snapshot Fallback (capture="environment")
  const handleNativeImageCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1000;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data && code.data.trim()) {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([40, 60, 40]);
          }
          soundEngine.playStampChime();
          stopCamera();
          handleScannedCode(code.data.trim());
        } else {
          setMessage({
            text:
              locale === "ar"
                ? "لم يتم العثور على رمز QR واضح في الصورة. حاول التقاط الصورة من مسافة أقرب."
                : locale === "fr"
                ? "Aucun code QR détecté dans la photo. Rapprochez l'appareil."
                : "No se detectó código QR en la foto. Acerque la cámara.",
            type: "error",
          });
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [handleScannedCode, locale, stopCamera]);

  // Scanner Lifecycle: Auto-start camera immediately when opened without pre-selected customer
  useEffect(() => {
    if (isOpen) {
      if (!initialCustomer && !selectedCustomer) {
        startCamera();
      }
    } else {
      stopCamera();
      setSelectedCustomer(null);
      setMessage(null);
      setCameraState("idle");
    }
  }, [isOpen, initialCustomer, selectedCustomer, startCamera, stopCamera]);

  // Direct Pre-Selected Customer Handler: Open Zero-Scroll POS view directly without starting camera
  useEffect(() => {
    if (isOpen && initialCustomer) {
      stopCamera();
      setSelectedCustomer(initialCustomer);
      setMessage(null);
      setStampDelta(1);
      setStampCooldownMinutesLeft(0);
      const isCustCashback = initialCustomer.loyaltyType === "CASHBACK" || loyaltyMode === "CASHBACK";
      if (isCustCashback) {
        setPosTab("earn");
        setBillAmount("");
      } else if (allowMultiStamps) {
        void fetchCustomerCooldown(initialCustomer.id);
      }
      setRedeemAmount(
        initialCustomer.cashbackBalance && initialCustomer.cashbackBalance > 0
          ? String(initialCustomer.cashbackBalance)
          : ""
      );
    } else if (!isOpen) {
      setSelectedCustomer(null);
      setMessage(null);
      setStampDelta(1);
      setStampCooldownMinutesLeft(0);
    }
  }, [isOpen, initialCustomer, stopCamera, loyaltyMode, allowMultiStamps, fetchCustomerCooldown]);

  // Auto-focus bill amount input when Cashback POS Calculator is active
  useEffect(() => {
    if (
      isOpen &&
      selectedCustomer &&
      (selectedCustomer.loyaltyType === "CASHBACK" || loyaltyMode === "CASHBACK") &&
      posTab === "earn"
    ) {
      const timer = setTimeout(() => {
        billInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedCustomer, loyaltyMode, posTab]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    await executeStampRequest({
      identifier: searchQuery.trim(),
      action: "LOOKUP",
    });
  };

  const handleStampOrRedeem = async (action: "STAMP" | "REDEEM") => {
    if (!selectedCustomer) return;
    await executeStampRequest({
      customerId: selectedCustomer.id,
      action,
    });
  };

  const handleConfirmControlledStamps = async () => {
    if (!selectedCustomer) return;
    if (stampDelta > 0) {
      await executeStampRequest({
        customerId: selectedCustomer.id,
        action: "STAMP",
        stampsCount: stampDelta,
      });
    } else if (stampDelta < 0) {
      await executeStampRequest({
        customerId: selectedCustomer.id,
        action: "STAMP_ADJUST",
        adjustDelta: stampDelta,
      });
    }
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

  const isCashback = selectedCustomer?.loyaltyType === "CASHBACK";
  const isRewardReady = selectedCustomer
    ? selectedCustomer.stamps >= stampsRequired
    : false;

  const parsedRedeem = parseFloat(redeemAmount) || 0;
  const parsedBillTotal = parseFloat(redeemBillTotal) || 0;
  const remainingCashToPay = Math.max(0, parsedBillTotal - parsedRedeem);

  if (!isOpen) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      style={{
        paddingTop: "max(env(safe-area-inset-top, 0px), 0.75rem)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.75rem)",
      }}
    >
      <div className="relative w-full max-w-md bg-[#FFFDF7] border border-[#DCE0D4] rounded-3xl shadow-2xl p-5 text-[#173E30] my-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE0D4]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#008069]/10 text-[#008069] border border-[#008069]/20 shadow-sm">
              {selectedCustomer ? <Users className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="font-bold text-base text-[#173E30]">
                {selectedCustomer
                  ? locale === "ar"
                    ? "بطاقة العميل"
                    : locale === "fr"
                    ? "Fiche Client"
                    : "Ficha de Cliente"
                  : t.merchant.scannerBtn}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[11px] text-[#5F655D]">
                  {selectedCustomer
                    ? locale === "ar"
                      ? "إضافة طابع أو إدارة الكاش باك"
                      : locale === "fr"
                      ? "Ajouter un tampon ou gérer le cashback"
                      : "Añadir sello o gestionar cashback"
                    : locale === "ar"
                    ? "امسح الرمز أو اختر عميلاً بالرقم"
                    : locale === "fr"
                    ? "Scannez le code ou recherchez par numéro"
                    : "Escanee el código o busque por número"}
                </p>
                {branchName && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#008069]/10 text-[#008069] font-bold border border-[#008069]/20">
                    📍 {branchName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedCustomer && (
              <button
                type="button"
                onClick={handleResetCustomer}
                className="py-1.5 px-3 rounded-xl bg-[#008069]/10 hover:bg-[#008069]/20 text-[#008069] font-bold text-xs flex items-center gap-1.5 transition border border-[#008069]/20 shadow-sm cursor-pointer"
                title={
                  locale === "ar"
                    ? "مسح عميل آخر"
                    : locale === "fr"
                    ? "Scanner un autre client"
                    : "Escanear otro cliente"
                }
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>
                  {locale === "ar"
                    ? "مسح آخر 🔄"
                    : locale === "fr"
                    ? "Scanner un autre 🔄"
                    : "Escanear otro 🔄"}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={handleModalClose}
              aria-label={locale === "ar" ? "إغلاق" : locale === "fr" ? "Fermer" : "Cerrar"}
              className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-[#5F655D] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Anti-Fraud 30-Minute Cross-Branch Cooldown Warning Card (Cashiers Only) */}

        {/* Anti-Fraud Cooldown Warning Banner */}
        {cooldownWarning && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-3 animate-in fade-in shadow-sm">
            <div className="flex items-start gap-2.5 font-bold text-amber-900 leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <span>{cooldownWarning.message}</span>
            </div>
            <div className="flex flex-col gap-2">
              {userRole === "OWNER" && !allowMultiStamps && (
                <button
                  type="button"
                  onClick={() => executeStampRequest(cooldownWarning.payload, true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>{t.walletEnterprise.staff.overrideCooldown}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetCustomer}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF7] hover:bg-[#FAF7F2] text-[#173E30] border border-[#C8D1BE] font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#008069]" />
                <span>
                  {locale === "fr"
                    ? "Scanner un autre client"
                    : locale === "es"
                    ? "Escanear otro cliente"
                    : "🔄 مسح بطاقة عميل آخر"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Direct Camera Stream View (Active Immediately on Modal Open) */}
        <div className={`space-y-3 ${selectedCustomer || cooldownWarning ? "hidden" : ""}`}>
          <div className="relative aspect-square w-full max-w-[340px] mx-auto rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
            {/* Native Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-300 ${
                cameraState === "active" ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            />

            {/* Offscreen Canvas for Frame Decoding */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Fallback Camera Photo Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleNativeImageCapture}
              className="hidden"
            />

            {/* Target Overlays & Laser Animation when Active */}
            {cameraState === "active" && (
              <div className="absolute inset-8 border-2 border-[#00A884] rounded-2xl pointer-events-none flex items-center justify-center z-10">
                <span className="w-full h-0.5 bg-[#00A884] absolute shadow-[0_0_12px_#00A884] animate-pulse" />
              </div>
            )}

            {/* Camera Requesting or Initializing */}
            {(cameraState === "requesting" || cameraState === "idle") && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 space-y-2.5 z-10 text-center">
                <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-medium">
                  {locale === "ar"
                    ? "جاري تشغيل الكاميرا والماسح..."
                    : locale === "fr"
                    ? "Initialisation de la caméra..."
                    : "Iniciando cámara..."}
                </p>
              </div>
            )}

            {/* Camera Permission Denied or Hardware Error */}
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
                        : "Accès caméra refusé"
                      : locale === "ar"
                      ? "تعذر تشغيل الكاميرا"
                      : "Error de cámara"}
                  </p>
                  <p className="text-[11px] text-rose-200/90 mt-1 leading-relaxed">
                    {cameraState === "permission_denied"
                      ? locale === "ar"
                        ? "يرجى تفعيل إذن الكاميرا من إعدادات المتصفح، أو التقط صورة للرمز أدناه."
                        : "Veuillez autoriser la caméra dans les paramètres de votre navigateur, ou prenez une photo."
                      : cameraErrorMessage ||
                        (locale === "ar"
                          ? "تأكد من عدم استخدام الكاميرا من قِبل تطبيق آخر، أو التقط صورة مباشرة للرمز."
                          : "Vérifiez qu'aucune autre application n'utilise la caméra.")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-white/20 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{locale === "ar" ? "إعادة المحاولة" : "Réessayer"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{locale === "ar" ? "📸 التقاط صورة للرمز" : "📸 Prendre photo"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Status Live Indicator */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {locale === "ar"
                ? "الماسح نشط، وجّه الكاميرا إلى كود QR"
                : locale === "fr"
                ? "Scanner actif, visez le QR code"
                : "Escáner activo, enfoque el código QR"}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-[#5F655D] hover:text-[#008069] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              <span>{locale === "ar" ? "التقاط صورة" : "Prendre photo"}</span>
            </button>
          </div>
        </div>

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

        {/* Selected Customer Card & Dual POS Controls (Single Focus View: Centered, Zero Scroll) */}
        {selectedCustomer && (
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DCE0D4] space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE0D4]">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#173E30]">
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
                <span className="text-[11px] text-[#5F655D] font-mono">
                  #{selectedCustomer.memberCode} • {selectedCustomer.phone}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {loyaltyMode === "BOTH" && (
                  <button
                    type="button"
                    onClick={handleSwitchType}
                    disabled={loading}
                    className="px-2 py-1 rounded-lg bg-[#FFFDF7] border border-[#C8D1BE] text-[10px] font-semibold text-[#173E30] flex items-center gap-1 transition shadow-sm hover:bg-[#FAF7F2] cursor-pointer"
                    title="تحويل نظام العميل"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-[#008069]" />
                    <span>{locale === "ar" ? "تبديل" : locale === "fr" ? "Changer" : "Cambiar"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetCustomer}
                  className="px-2 py-1 rounded-lg bg-[#FFFDF7] border border-[#C8D1BE] text-[10px] font-semibold text-[#5F655D] hover:text-[#008069] flex items-center gap-1 transition shadow-sm hover:bg-[#FAF7F2] cursor-pointer"
                  title={
                    locale === "ar"
                      ? "مسح عميل آخر"
                      : locale === "fr"
                      ? "Scanner un autre client"
                      : "Escanear otro cliente"
                  }
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    {locale === "ar"
                      ? "مسح آخر 🔄"
                      : locale === "fr"
                      ? "Scanner autre 🔄"
                      : "Otro cliente 🔄"}
                  </span>
                </button>
              </div>
            </div>

            {/* IF CUSTOMER HAS STAMPS */}
            {!isCashback && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5F655D] font-semibold">
                    {locale === "fr"
                      ? "Tampons collectés :"
                      : locale === "es"
                      ? "Sellos acumulados:"
                      : "الأختام المجمّعة:"}
                  </span>
                  <span className="font-mono font-bold text-[#008069] text-sm">
                    {formatStamps(selectedCustomer.stamps)} / {stampsRequired}
                  </span>
                </div>

                {allowMultiStamps ? (
                  (() => {
                    const maxDeduct = Math.min(
                      5,
                      Math.floor(selectedCustomer.stamps || 0)
                    );
                    const isCooldownLocked = stampCooldownMinutesLeft > 0;
                    const canStepMinus =
                      stampDelta > 1 ||
                      (stampDelta === 1 && maxDeduct >= 1) ||
                      (stampDelta < 0 && stampDelta > -maxDeduct);
                    const canStepPlus =
                      stampDelta < -1 ||
                      (stampDelta === -1 && !isCooldownLocked) ||
                      (stampDelta >= 1 && stampDelta < 10 && !isCooldownLocked);
                    const isSubmitDisabled =
                      loading ||
                      (stampDelta > 0 && isCooldownLocked) ||
                      (stampDelta < 0 && maxDeduct < 1);
                    const projectedStamps = Math.max(
                      0,
                      Number(((selectedCustomer.stamps || 0) + stampDelta).toFixed(1))
                    );

                    const handleStepMinus = () => {
                      if (stampDelta > 1) {
                        setStampDelta((prev) => prev - 1);
                      } else if (stampDelta === 1 && maxDeduct >= 1) {
                        setStampDelta(-1);
                      } else if (stampDelta < 0 && stampDelta > -maxDeduct) {
                        setStampDelta((prev) => prev - 1);
                      }
                    };

                    const handleStepPlus = () => {
                      if (stampDelta < -1) {
                        setStampDelta((prev) => prev + 1);
                      } else if (stampDelta === -1 && !isCooldownLocked) {
                        setStampDelta(1);
                      } else if (stampDelta >= 1 && stampDelta < 10 && !isCooldownLocked) {
                        setStampDelta((prev) => prev + 1);
                      }
                    };

                    const absCount = Math.abs(stampDelta);
                    const confirmLabel =
                      stampDelta < 0
                        ? locale === "fr"
                          ? `Retirer ${absCount} tampon${absCount > 1 ? "s" : ""}`
                          : locale === "es"
                          ? `Restar ${absCount} sello${absCount > 1 ? "s" : ""}`
                          : `خصم ${absCount} ${absCount === 1 ? "ختم" : "أختام"}`
                        : locale === "fr"
                        ? `Ajouter ${absCount} tampon${absCount > 1 ? "s" : ""}`
                        : locale === "es"
                        ? `Añadir ${absCount} sello${absCount > 1 ? "s" : ""}`
                        : `إضافة ${absCount} ${absCount === 1 ? "ختم" : "أختام"}`;

                    return (
                      <div className="space-y-3">
                        {isCooldownLocked && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-bold flex items-start gap-2 leading-relaxed">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              {locale === "fr"
                                ? `Ajout bloqué pendant ${stampCooldownMinutesLeft} min (règle 30 min) — vous pouvez retirer un tampon en cas d'erreur.`
                                : locale === "es"
                                ? `Adición bloqueada por ${stampCooldownMinutesLeft} min (regla 30 min) — puedes restar un sello si hubo error.`
                                : `⏳ لا يمكن إضافة ختم آخر قبل ${stampCooldownMinutesLeft} دقيقة (قفل 30 دقيقة) — يمكنك خصم ختم لتصحيح خطأ.`}
                            </span>
                          </div>
                        )}

                        {/* + / - Quantity Stepper Box */}
                        <div className="p-2.5 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] flex items-center justify-between gap-2 shadow-sm">
                          <button
                            type="button"
                            disabled={!canStepMinus || loading}
                            onClick={handleStepMinus}
                            aria-label={
                              locale === "fr"
                                ? "Diminuer le nombre de tampons"
                                : locale === "es"
                                ? "Disminuir sellos"
                                : "إنقاص أو خصم ختم"
                            }
                            className="w-11 h-11 rounded-xl bg-[#FAF7F2] hover:bg-rose-50 hover:text-rose-700 border border-[#C8D1BE] text-[#173E30] flex items-center justify-center transition disabled:opacity-35 cursor-pointer shrink-0 active:scale-95"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="text-center flex-1 min-w-0">
                            <div
                              dir="ltr"
                              className={`text-lg font-mono font-extrabold leading-tight ${
                                stampDelta < 0 ? "text-rose-600" : "text-[#008069]"
                              }`}
                            >
                              {stampDelta > 0 ? `+${stampDelta}` : stampDelta}
                            </div>
                            <div className="text-[10px] text-[#5F655D] font-semibold mt-0.5">
                              {locale === "fr"
                                ? "Nouveau solde :"
                                : locale === "es"
                                ? "Nuevo saldo:"
                                : "الرصيد الجديد:"}{" "}
                              <span dir="ltr" className="font-mono font-bold text-[#173E30]">
                                {formatStamps(projectedStamps)} / {stampsRequired}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!canStepPlus || loading}
                            onClick={handleStepPlus}
                            aria-label={
                              locale === "fr"
                                ? "Augmenter le nombre de tampons"
                                : locale === "es"
                                ? "Aumentar sellos"
                                : "زيادة عدد الأختام"
                            }
                            className="w-11 h-11 rounded-xl bg-[#FAF7F2] hover:bg-emerald-50 hover:text-[#008069] border border-[#C8D1BE] text-[#173E30] flex items-center justify-center transition disabled:opacity-35 cursor-pointer shrink-0 active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isSubmitDisabled}
                            onClick={handleConfirmControlledStamps}
                            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-45 shadow-sm cursor-pointer min-h-[44px] ${
                              stampDelta < 0
                                ? "bg-rose-600 hover:bg-rose-700 text-white"
                                : "bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#008069] text-white"
                            }`}
                          >
                            {stampDelta < 0 ? (
                              <Minus className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            <span>{confirmLabel}</span>
                          </button>

                          <button
                            type="button"
                            disabled={loading || selectedCustomer.stamps < stampsRequired}
                            onClick={() => handleStampOrRedeem("REDEEM")}
                            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-30 min-h-[44px] ${
                              selectedCustomer.stamps >= stampsRequired
                                ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md animate-pulse cursor-pointer"
                                : "bg-[#FFFDF7] text-[#5F655D] border border-[#C8D1BE]"
                            }`}
                          >
                            <Gift className="w-4 h-4" />
                            <span>{t.merchant.redeemRewardBtn}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
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
                          : "bg-[#FFFDF7] text-[#5F655D] border border-[#C8D1BE]"
                      }`}
                    >
                      <Gift className="w-4 h-4" />
                      <span>{t.merchant.redeemRewardBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* IF CUSTOMER HAS CASHBACK (2-Tab POS Action Box) */}
            {isCashback && (
              <div className="space-y-3">
                {/* Available Balance Display */}
                <div className="p-3 rounded-xl bg-[#FFFDF7] border border-amber-300 flex items-center justify-between shadow-sm">
                  <span className="text-xs text-[#5F655D] font-semibold">
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
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#FFFDF7] rounded-xl border border-[#C8D1BE] text-[11px] font-semibold shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPosTab("earn")}
                    className={`py-1.5 rounded-lg transition ${
                      posTab === "earn"
                        ? "bg-[#008069] text-white font-bold shadow-sm"
                        : "text-[#5F655D] hover:text-[#173E30]"
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
                        : "text-[#5F655D] hover:text-[#173E30]"
                    }`}
                  >
                    {t.merchant.redeemCashbackTab}
                  </button>
                </div>

                {/* Tab A: Add Cashback */}
                {posTab === "earn" && (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#5F655D] font-semibold block">
                        {t.merchant.billAmountLabel.replace("{currency}", currency)}
                      </label>
                      <input
                        ref={billInputRef}
                        type="number"
                        inputMode="decimal"
                        min="1"
                        step="any"
                        placeholder="0.00"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF7] border border-[#C8D1BE] text-[#173E30] font-mono text-sm focus:outline-none focus:border-[#008069] shadow-sm"
                      />
                    </div>

                    {/* Quick Pills */}
                    <div className="flex items-center gap-1.5">
                      {["50", "100", "150", "200", "300"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBillAmount(val)}
                          className="px-2 py-1 rounded-lg bg-[#FFFDF7] hover:bg-[#FAF7F2] text-[10px] font-mono text-[#173E30] border border-[#C8D1BE] transition shadow-sm font-semibold"
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
                        <label className="text-[11px] text-[#5F655D] font-semibold block">
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
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF7] border border-[#C8D1BE] text-[#173E30] font-mono text-sm focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-[#5F655D] block">
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
                        className="w-full px-3 py-2 rounded-xl bg-[#FFFDF7] border border-[#C8D1BE] text-[#173E30] font-mono text-xs focus:outline-none shadow-sm"
                      />
                    </div>

                    {parsedBillTotal > 0 && (
                      <p className="text-[11px] text-[#173E30] font-semibold">
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

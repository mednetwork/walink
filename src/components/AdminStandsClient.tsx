"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Plus,
  Search,
  Printer,
  Download,
  FileImage,
  Package,
  Link2,
  Unlink,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  FileSpreadsheet,
  Store,
  Activity,
  X,
} from "lucide-react";
import { getStandUrl } from "@/lib/urls";
import { parseBranchesJson } from "@/lib/branches";
import {
  generateBatchStandPostersZip,
  renderStandPosterBlob,
  renderStandPosterPreviewDataUrl,
} from "@/lib/stand-poster";

export interface StandMerchantOption {
  id: string;
  name: string;
  slug: string;
  city: string;
  isActive: boolean;
  branches: string | null;
}

export interface QrStandDto {
  id: string;
  code: string;
  merchantId: string | null;
  branchName: string | null;
  batchLabel: string | null;
  scanCount: number;
  lastScannedAt: string | null;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
  merchant: StandMerchantOption | null;
}

interface AdminStandsClientProps {
  initialStands: QrStandDto[];
  initialMerchants: StandMerchantOption[];
}

function escapeCsvCell(raw: string): string {
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function AdminStandsClient({
  initialStands,
  initialMerchants,
}: AdminStandsClientProps) {
  const [stands, setStands] = useState<QrStandDto[]>(initialStands);
  const [merchants] = useState<StandMerchantOption[]>(initialMerchants);
  const [qrPreviews, setQrPreviews] = useState<Record<string, string>>({});

  // Batch generator state
  const [prefix, setPrefix] = useState("WLK");
  const [batchCount, setBatchCount] = useState<number>(20);
  const [batchLabel, setBatchLabel] = useState("");
  const [generating, setGenerating] = useState(false);

  // Filter & feedback state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "UNASSIGNED" | "ASSIGNED">("ALL");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Draft merchant/branch selection per stand ID
  const [draftAssignments, setDraftAssignments] = useState<
    Record<string, { merchantId: string; branchName: string }>
  >({});
  const [busyStandId, setBusyStandId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printSheetMode, setPrintSheetMode] = useState<"POSTER" | "COMPACT">("POSTER");
  const [posterPreviews, setPosterPreviews] = useState<Record<string, string>>({});
  const [downloadingPosterCode, setDownloadingPosterCode] = useState<string | null>(null);
  const [zipProgress, setZipProgress] = useState<{ done: number; total: number } | null>(null);

  const summary = useMemo(() => {
    const total = stands.length;
    const assigned = stands.filter((s) => Boolean(s.merchantId)).length;
    const unassigned = total - assigned;
    const totalScans = stands.reduce((sum, s) => sum + (s.scanCount || 0), 0);
    return { total, assigned, unassigned, totalScans };
  }, [stands]);

  const batchOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of stands) {
      if (s.batchLabel && s.batchLabel.trim()) {
        set.add(s.batchLabel.trim());
      }
    }
    return Array.from(set);
  }, [stands]);

  const filteredStands = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stands.filter((s) => {
      if (filterMode === "ASSIGNED" && !s.merchantId) return false;
      if (filterMode === "UNASSIGNED" && Boolean(s.merchantId)) return false;
      if (
        selectedBatchFilter !== "ALL" &&
        (s.batchLabel || "").trim() !== selectedBatchFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        (s.batchLabel || "").toLowerCase().includes(q) ||
        (s.merchant?.name || "").toLowerCase().includes(q) ||
        (s.merchant?.slug || "").toLowerCase().includes(q) ||
        (s.merchant?.city || "").toLowerCase().includes(q) ||
        (s.branchName || "").toLowerCase().includes(q)
      );
    });
  }, [stands, filterMode, selectedBatchFilter, searchQuery]);

  const readyPosterCount = useMemo(
    () => filteredStands.filter((s) => Boolean(posterPreviews[s.code])).length,
    [filteredStands, posterPreviews]
  );

  const postersLoading =
    printSheetMode === "POSTER" && readyPosterCount < filteredStands.length;

  const isPrintDisabled =
    filteredStands.length === 0 ||
    postersLoading ||
    (printSheetMode === "COMPACT" &&
      filteredStands.some((s) => !qrPreviews[s.code]));

  // Generate crisp High-EC QR previews for visible stands
  useEffect(() => {
    let cancelled = false;
    const missing = filteredStands.filter((s) => !qrPreviews[s.code]);
    if (missing.length === 0) return;

    (async () => {
      const nextEntries: Array<[string, string]> = [];
      for (const s of missing) {
        try {
          const url = getStandUrl(s.code);
          const dataUrl = await QRCode.toDataURL(url, {
            width: 320,
            margin: 2,
            errorCorrectionLevel: "H",
            color: {
              dark: "#173E30",
              light: "#FFFFFF",
            },
          });
          nextEntries.push([s.code, dataUrl]);
        } catch (err) {
          console.warn("QR generation warning:", err);
        }
      }
      if (!cancelled && nextEntries.length > 0) {
        setQrPreviews((prev) => {
          const updated = { ...prev };
          for (const [code, dataUrl] of nextEntries) {
            updated[code] = dataUrl;
          }
          return updated;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filteredStands, qrPreviews]);

  // Generate print-sheet poster previews lazily when the Print/PDF modal is opened in POSTER mode
  useEffect(() => {
    if (!showPrintModal || printSheetMode !== "POSTER") return;

    let cancelled = false;
    const missing = filteredStands.filter((s) => !posterPreviews[s.code]);
    if (missing.length === 0) return;

    (async () => {
      for (const s of missing) {
        if (cancelled) break;
        try {
          const dataUrl = await renderStandPosterPreviewDataUrl(s.code);
          if (!cancelled) {
            setPosterPreviews((prev) => ({ ...prev, [s.code]: dataUrl }));
          }
          await new Promise<void>((resolve) => {
            setTimeout(resolve, 0);
          });
        } catch (err) {
          console.warn("Poster preview generation warning:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showPrintModal, printSheetMode, filteredStands, posterPreviews]);

  const handleGenerateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/admin/stands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix,
          count: batchCount,
          batchLabel: batchLabel.trim() || null,
        }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر توليد دفعة الستاندات");
      }

      if (Array.isArray(data.stands)) {
        setStands((prev) => [...data.stands, ...prev]);
      }
      setBatchLabel("");
      setFeedback({ type: "success", text: data.message || "تم التوليد بنجاح" });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "خطأ أثناء توليد الدفعة",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAssignStand = async (stand: QrStandDto, unassign = false) => {
    setFeedback(null);
    setBusyStandId(stand.id);

    const draft = draftAssignments[stand.id] ?? {
      merchantId: stand.merchantId || "",
      branchName: stand.branchName || "",
    };

    try {
      const res = await fetch("/api/admin/stands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stand.id,
          merchantId: unassign ? null : draft.merchantId || null,
          branchName: unassign ? null : draft.branchName || null,
        }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر تحديث ربط الستاند");
      }

      if (data.stand) {
        setStands((prev) =>
          prev.map((item) => (item.id === stand.id ? data.stand : item))
        );
        if (unassign) {
          setDraftAssignments((prev) => ({
            ...prev,
            [stand.id]: { merchantId: "", branchName: "" },
          }));
        }
      }
      setFeedback({ type: "success", text: data.message });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "تعذر تحديث الستاند",
      });
    } finally {
      setBusyStandId(null);
    }
  };

  const handleDeleteStand = async (stand: QrStandDto) => {
    setFeedback(null);
    setBusyStandId(stand.id);
    try {
      const res = await fetch(`/api/admin/stands?id=${encodeURIComponent(stand.id)}`, { method: "DELETE", signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "تعذر حذف الستاند");
      }
      setStands((prev) => prev.filter((item) => item.id !== stand.id));
      setFeedback({ type: "success", text: data.message });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "تعذر الحذف",
      });
    } finally {
      setBusyStandId(null);
    }
  };

  const handleDownloadPosterPng = async (code: string) => {
    setFeedback(null);
    setDownloadingPosterCode(code);
    let blobUrl: string | null = null;
    try {
      const blob = await renderStandPosterBlob(code);
      blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `walink-poster-${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "تعذر تجهيز بوستر الستاند للطباعة",
      });
    } finally {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      setDownloadingPosterCode(null);
    }
  };

  const handleDownloadBatchZip = async () => {
    if (filteredStands.length === 0 || zipProgress) return;
    setFeedback(null);
    const codes = filteredStands.map((s) => s.code);
    setZipProgress({ done: 0, total: codes.length });
    let blobUrl: string | null = null;
    try {
      const zipBlob = await generateBatchStandPostersZip(codes, (done, total) => {
        setZipProgress({ done, total });
      });
      blobUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `walink-stand-posters-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setFeedback({
        type: "success",
        text: `تم تجهيز وتنزيل ${codes.length} بوستر ستاند عالي الدقة في ملف ZIP بنجاح!`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "تعذر إنشاء أرشيف البوسترات للمطبعة",
      });
    } finally {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      setZipProgress(null);
    }
  };

  const handleDownloadHighResPng = async (code: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(getStandUrl(code), {
        width: 1024,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `walink-stand-${code}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  };

  const handleDownloadSvg = async (code: string) => {
    try {
      const svgString = await QRCode.toString(getStandUrl(code), {
        type: "svg",
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `walink-stand-${code}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("SVG export failed:", err);
    }
  };

  const handleExportCsvForPrintShop = () => {
    const header = ["code", "url", "batchLabel", "status", "merchantName"].join(",");
    const lines = filteredStands.map((s) =>
      [
        escapeCsvCell(s.code),
        escapeCsvCell(getStandUrl(s.code)),
        escapeCsvCell(s.batchLabel || ""),
        escapeCsvCell(s.merchantId ? "ASSIGNED" : "READY_FOR_SALE"),
        escapeCsvCell(s.merchant?.name || ""),
      ].join(",")
    );
    const csvContent = "\uFEFF" + [header, ...lines].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `walink-qr-stands-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleCopyUrl = async (code: string) => {
    try {
      await navigator.clipboard.writeText(getStandUrl(code));
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    } catch (err) {
      console.warn("Clipboard failed:", err);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 print:space-y-0">
      <div className="space-y-6 print:hidden">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#161514] flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-[#F85B04] text-white flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5" />
            </span>
            <span>ستاندات الكاونتر المطبوعة مسبقاً (Dynamic QR)</span>
          </h1>
          <p className="text-xs text-[#161514]/65 mt-1">
            اطبع دفعات QR مسبقاً قبل النزول للميدان، ثم اربط كل ستاند بمتجر المشتري في ثوانٍ دون إعادة طباعة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadBatchZip}
            disabled={filteredStands.length === 0 || Boolean(zipProgress)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#161514] hover:bg-[#2A2826] text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50 min-h-[44px] tabular-nums"
          >
            <Package className="w-4 h-4 text-[#F85B04]" />
            <span>
              {zipProgress
                ? `جاري التجهيز (${zipProgress.done} / ${zipProgress.total})...`
                : `تحميل الكل بوسترات ZIP (${filteredStands.length})`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportCsvForPrintShop}
            disabled={filteredStands.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#EFEAE4] border border-[#161514]/10 text-[#161514] text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#DA5004]" />
            <span>تصدير CSV للمطبعة</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            disabled={filteredStands.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50 min-h-[44px] tabular-nums"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ PDF ({filteredStands.length})</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        <div className="p-4 rounded-2xl bg-white border border-[#161514]/10 shadow-sm">
          <span className="text-[11px] font-semibold text-[#161514]/65 block">
            إجمالي الستاندات المطبوعة
          </span>
          <span className="text-2xl font-extrabold font-mono text-[#161514] mt-1 block">
            {summary.total}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-800 block">
            متاح للبيع (غير مربوط)
          </span>
          <span className="text-2xl font-extrabold font-mono text-amber-600 mt-1 block">
            {summary.unassigned}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#A7F3D0] shadow-sm">
          <span className="text-[11px] font-semibold text-[#DA5004] block">
            مربوط ونشط عند التجار
          </span>
          <span className="text-2xl font-extrabold font-mono text-[#DA5004] mt-1 block">
            {summary.assigned}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#161514]/10 shadow-sm">
          <span className="text-[11px] font-semibold text-[#161514]/65 block">
            إجمالي مسوحات الزبائن
          </span>
          <span className="text-2xl font-extrabold font-mono text-[#161514] mt-1 flex items-center gap-1.5">
            <Activity className="w-5 h-5 text-[#DA5004]" />
            <span>{summary.totalScans}</span>
          </span>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 print:hidden ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="إغلاق التنبيه"
            className="p-1 rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Batch Generator Form */}
      <form
        onSubmit={handleGenerateBatch}
        className="p-4 sm:p-5 rounded-3xl bg-white border border-[#161514]/10 shadow-sm space-y-4 print:hidden"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[#161514]">
          <Plus className="w-4 h-4 text-[#DA5004]" />
          <span>توليد دفعة ستاندات جديدة للطباعة</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label
              htmlFor="stand-prefix"
              className="text-[11px] font-bold text-[#161514]/65 block mb-1"
            >
              بادئة الكود (مثال: WLK)
            </label>
            <input
              id="stand-prefix"
              type="text"
              value={prefix}
              maxLength={6}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#161514]/15 text-sm font-mono font-bold text-[#161514] focus:outline-none focus:border-[#F85B04]"
            />
          </div>

          <div>
            <label
              htmlFor="stand-count"
              className="text-[11px] font-bold text-[#161514]/65 block mb-1"
            >
              عدد الستاندات (1–200)
            </label>
            <input
              id="stand-count"
              type="number"
              min={1}
              max={200}
              value={batchCount}
              onChange={(e) => setBatchCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#161514]/15 text-sm font-mono font-bold text-[#161514] focus:outline-none focus:border-[#F85B04]"
            />
          </div>

          <div>
            <label
              htmlFor="stand-batch-label"
              className="text-[11px] font-bold text-[#161514]/65 block mb-1"
            >
              اسم الدفعة (اختياري للفرز)
            </label>
            <input
              id="stand-batch-label"
              type="text"
              value={batchLabel}
              placeholder="مثال: دفعة كازا - نوفمبر"
              onChange={(e) => setBatchLabel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#161514]/15 text-xs font-medium text-[#161514] focus:outline-none focus:border-[#F85B04]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F9742A] to-[#F85B04] hover:from-[#F85B04] text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{generating ? "جاري التوليد..." : "توليد الأكواد الآن"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#161514]/65 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            aria-label="ابحث بكود الستاند أو اسم المتجر أو المدينة"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالكود (WLK-001) أو المتجر أو الدفعة..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white border border-[#161514]/10 text-xs text-[#161514] focus:outline-none focus:border-[#F85B04]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "ALL", label: "الكل" },
              { id: "UNASSIGNED", label: "متاح للبيع" },
              { id: "ASSIGNED", label: "مربوط بمتجر" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-[44px] ${
                filterMode === tab.id
                  ? "bg-[#F85B04] text-white shadow-sm"
                  : "bg-white text-[#161514]/65 border border-[#161514]/10 hover:text-[#161514]"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {batchOptions.length > 0 && (
            <select
              aria-label="تصفية حسب الدفعة"
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-[#161514]/10 text-xs font-semibold text-[#161514] focus:outline-none focus:border-[#F85B04] min-h-[44px]"
            >
              <option value="ALL">كل الدفعات</option>
              {batchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Stands Grid */}
      {filteredStands.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white border border-[#161514]/10 text-center space-y-2 print:hidden">
          <QrCode className="w-10 h-10 text-[#DA5004]/40 mx-auto" />
          <h2 className="text-sm font-bold text-[#161514]">
            لا توجد ستاندات مطابقة حالياً
          </h2>
          <p className="text-xs text-[#161514]/65">
            قم بتوليد دفعة جديدة من الأعلى لتجهيز أكواد QR للطباعة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:hidden">
          {filteredStands.map((stand) => {
            const draft = draftAssignments[stand.id] ?? {
              merchantId: stand.merchantId || "",
              branchName: stand.branchName || "",
            };
            const selectedMerchantObj = merchants.find(
              (m) => m.id === draft.merchantId
            );
            const branchOptions = selectedMerchantObj?.branches
              ? parseBranchesJson(selectedMerchantObj.branches)
              : [];
            const standUrl = getStandUrl(stand.code);
            const isBusy = busyStandId === stand.id;
            const qrImg = qrPreviews[stand.code];

            return (
              <div
                key={stand.id}
                className={`p-4 rounded-3xl bg-white border shadow-sm space-y-3.5 ${
                  stand.merchantId
                    ? "border-[#A7F3D0]"
                    : "border-[#161514]/10"
                }`}
              >
                {/* Top Stand Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        dir="ltr"
                        className="font-mono font-extrabold text-base text-[#161514]"
                      >
                        {stand.code}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stand.merchantId
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {stand.merchantId ? "مربوط ومفعل" : "متاح للبيع"}
                      </span>
                    </div>
                    {stand.batchLabel && (
                      <span className="text-[10px] text-[#161514]/65 block mt-0.5">
                        الدفعة: {stand.batchLabel}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono font-bold text-[#DA5004] bg-[#F85B04]/10 px-2.5 py-1 rounded-xl">
                    {stand.scanCount} مسح
                  </span>
                </div>

                {/* QR Preview & Quick Downloads */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#161514]/10">
                  <div className="w-24 h-24 rounded-xl bg-white border border-[#161514]/10 flex items-center justify-center shrink-0 overflow-hidden p-1">
                    {qrImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrImg}
                        alt={`QR Stand ${stand.code}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-8 h-8 text-[#DA5004]/30 animate-pulse" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-1">
                      <span
                        dir="ltr"
                        className="text-[10px] font-mono text-[#161514]/65 truncate block flex-1"
                      >
                        {standUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(stand.code)}
                        aria-label={`نسخ رابط ${stand.code}`}
                        className="p-1.5 rounded-lg hover:bg-[#EFEAE4] text-[#DA5004]"
                      >
                        {copiedCode === stand.code ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={standUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`فتح رابط ${stand.code}`}
                        className="p-1.5 rounded-lg hover:bg-[#EFEAE4] text-[#161514]/65"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        type="button"
                        disabled={downloadingPosterCode === stand.code}
                        onClick={() => handleDownloadPosterPng(stand.code)}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                      >
                        <FileImage className="w-3.5 h-3.5" />
                        <span>
                          {downloadingPosterCode === stand.code
                            ? "جاري تجهيز البوستر..."
                            : "تحميل بوستر المطبعة (PNG)"}
                        </span>
                      </button>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadHighResPng(stand.code)}
                          className="flex-1 min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#EFEAE4] hover:bg-[#DCE0D4] border border-[#161514]/15 text-[10px] font-bold text-[#161514] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-[#DA5004]" />
                          <span>QR صافي PNG</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSvg(stand.code)}
                          className="flex-1 min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#EFEAE4] hover:bg-[#DCE0D4] border border-[#161514]/15 text-[10px] font-bold text-[#161514] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-[#DA5004]" />
                          <span>SVG فيكتور</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Click Store Assignment */}
                <div className="space-y-2 pt-1">
                  {stand.merchant && (
                    <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5 truncate">
                        <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {stand.merchant.name} ({stand.merchant.city})
                          {stand.branchName ? ` • ${stand.branchName}` : ""}
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label
                      htmlFor={`stand-merchant-${stand.id}`}
                      className="text-[11px] font-bold text-[#161514]/65 block"
                    >
                      ربط بمتجر العميل:
                    </label>
                    <select
                      id={`stand-merchant-${stand.id}`}
                      value={draft.merchantId}
                      onChange={(e) =>
                        setDraftAssignments((prev) => ({
                          ...prev,
                          [stand.id]: {
                            merchantId: e.target.value,
                            branchName: "",
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#161514]/15 text-xs font-semibold text-[#161514] focus:outline-none focus:border-[#F85B04]"
                    >
                      <option value="">-- اختر متجراً للربط --</option>
                      {merchants.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.city}) — /{m.slug}
                        </option>
                      ))}
                    </select>
                  </div>

                  {branchOptions.length > 0 && (
                    <div>
                      <label
                        htmlFor={`stand-branch-${stand.id}`}
                        className="text-[11px] font-bold text-[#161514]/65 block mb-1"
                      >
                        الفرع المخصص (اختياري):
                      </label>
                      <select
                        id={`stand-branch-${stand.id}`}
                        value={draft.branchName}
                        onChange={(e) =>
                          setDraftAssignments((prev) => ({
                            ...prev,
                            [stand.id]: {
                              ...draft,
                              branchName: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#161514]/15 text-xs font-semibold text-[#161514] focus:outline-none focus:border-[#F85B04]"
                      >
                        <option value="">المتجر كامل (بدون تحديد فرع)</option>
                        {branchOptions.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isBusy || !draft.merchantId}
                      onClick={() => handleAssignStand(stand, false)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-45 min-h-[44px]"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>
                        {stand.merchantId ? "تحديث الربط" : "ربط الآن"}
                      </span>
                    </button>

                    {stand.merchantId ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAssignStand(stand, true)}
                        className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-45 min-h-[44px]"
                        title="فك الربط وإعادة الاستخدام"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>فك</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDeleteStand(stand)}
                        aria-label={`حذف الستاند ${stand.code}`}
                        className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 cursor-pointer disabled:opacity-45 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Printable A4 Sheet Modal */}
      {showPrintModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 print:static print:inset-auto print:block print:w-full print:h-auto print:max-h-none print:overflow-visible print:bg-white print:p-0 print:m-0"
          style={{
            printColorAdjust: "exact",
            WebkitPrintColorAdjust: "exact",
          }}
        >
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 space-y-5 print:max-w-none print:w-full print:rounded-none print:p-0 print:m-0 print:space-y-0 print:shadow-none print:border-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#161514]/10 pb-4 print:hidden">
              <div>
                <h2 className="text-base font-extrabold text-[#161514] tabular-nums">
                  ورقة طباعة ستاندات QR ({filteredStands.length} ستاند)
                </h2>
                <p className="text-xs text-[#161514]/65">
                  عند الطباعة أو الحفظ بصيغة PDF يظهر بوستر واحد فقط في كل صفحة بشكل نقي تماماً بدون أي قوائم أو زوائد.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex p-1 rounded-xl bg-[#EFEAE4] border border-[#161514]/10">
                  <button
                    type="button"
                    onClick={() => setPrintSheetMode("POSTER")}
                    className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      printSheetMode === "POSTER"
                        ? "bg-[#F85B04] text-white shadow-sm"
                        : "text-[#161514]/70 hover:text-[#161514]"
                    }`}
                  >
                    البوسترات الكاملة للمطبعة
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintSheetMode("COMPACT")}
                    className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      printSheetMode === "COMPACT"
                        ? "bg-[#161514] text-white shadow-sm"
                        : "text-[#161514]/70 hover:text-[#161514]"
                    }`}
                  >
                    أكواد QR المدمجة فقط
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isPrintDisabled}
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] tabular-nums"
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {postersLoading
                      ? `جاري التجهيز (${readyPosterCount} / ${filteredStands.length})...`
                      : "طباعة / حفظ PDF"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  aria-label="إغلاق نافذة الطباعة"
                  className="p-2.5 rounded-xl bg-[#EFEAE4] hover:bg-[#DCE0D4] text-[#161514] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {printSheetMode === "POSTER" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 print:block print:space-y-0">
                {filteredStands.map((stand) => (
                  <div
                    key={stand.id}
                    className="p-2.5 rounded-2xl border border-dashed border-[#161514]/25 bg-white flex flex-col items-center gap-2 print-one-per-page"
                  >
                    <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#EFEAE4] flex items-center justify-center print:w-full print:h-full print:aspect-auto print:rounded-none print:bg-transparent">
                      {posterPreviews[stand.code] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={posterPreviews[stand.code]}
                          alt={`Walink Poster ${stand.code}`}
                          width={1024}
                          height={1536}
                          className="w-full h-full object-contain print-poster-img"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-xs text-[#161514]/55 p-4 text-center print:hidden">
                          <QrCode className="w-8 h-8 text-[#F85B04]/50 animate-pulse" />
                          <span>جاري تجهيز بوستر {stand.code}...</span>
                        </div>
                      )}
                    </div>
                    <div className="w-full flex items-center justify-between px-1 text-[11px] font-mono text-[#161514]/70 tabular-nums print:hidden">
                      <span dir="ltr" className="font-bold text-[#161514]">
                        {stand.code}
                      </span>
                      <span className="truncate max-w-[160px] font-sans">
                        {stand.merchant ? stand.merchant.name : stand.batchLabel || "جاهز للربط"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:block print:space-y-0">
                {filteredStands.map((stand) => (
                  <div
                    key={stand.id}
                    className="p-4 rounded-2xl border-2 border-dashed border-[#161514]/15 flex flex-col items-center justify-center text-center space-y-2 print-one-per-page"
                  >
                    <span className="text-[11px] font-bold text-[#DA5004] print:hidden">
                      امسح الكود واحصل على بطاقة الوفاء
                    </span>
                    <div className="w-40 h-40 p-1 bg-white flex items-center justify-center print:w-80 print:h-80 print:p-0">
                      {qrPreviews[stand.code] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrPreviews[stand.code]}
                          alt={`Print QR ${stand.code}`}
                          width={160}
                          height={160}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div
                      dir="ltr"
                      className="px-3 py-1 rounded-lg bg-[#161514] text-white font-mono font-extrabold text-sm tracking-widest tabular-nums print:hidden"
                    >
                      {stand.code}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

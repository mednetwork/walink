"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import {
  X,
  Copy,
  Check,
  Printer,
  Radio,
  Sparkles,
  QrCode as QrIcon,
} from "lucide-react";

interface StandPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: {
    name: string;
    slug: string;
    niche?: string;
    rewardName?: string;
    stampsRequired?: number;
    primaryColor?: string;
  };
}

export default function StandPreviewModal({
  isOpen,
  onClose,
  merchant,
}: StandPreviewModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>("https://walink.ma");
  const standRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const joinUrl = `${origin}/join/${merchant.slug}`;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(joinUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error creating QR for stand:", err));
  }, [isOpen, joinUrl]);

  if (!isOpen) return null;

  const handleCopyNfcUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0D1528] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 text-white my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600/10 text-sky-400 border border-blue-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-white">ستاند الكاونتر الذكي (NFC + QR)</h3>
              <p className="text-xs text-white/60">مخصص لـ: {merchant.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Acrylic Counter Stand Preview */}
        <div className="my-6 flex justify-center">
          <div
            ref={standRef}
            className="relative w-72 bg-gradient-to-b from-[#1E293B] to-[#060B18] rounded-3xl border-2 border-blue-500/30 p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            style={{
              boxShadow: "0 20px 40px -10px rgba(37, 99, 235, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Top NFC Sensor Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 text-sky-300 border border-blue-500/30 rounded-full text-[11px] font-semibold mb-3">
              <Radio className="w-3.5 h-3.5" />
              <span>قرب تيليفونك (NFC)</span>
            </div>

            {/* Merchant Brand */}
            <h4 className="font-bold text-xl text-white drop-shadow mb-1">
              {merchant.name}
            </h4>
            <p className="text-xs text-sky-400 font-medium mb-3">
              برنامج الوفاء والمكافآت
            </p>

            {/* High-Resolution QR Code */}
            <div className="bg-white p-3 rounded-2xl shadow-xl my-2 border-4 border-white/90">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR Stand for ${merchant.name}`}
                  width={176}
                  height={176}
                  className="w-44 h-44 aspect-square object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-gray-100 text-gray-400">
                  <QrIcon className="w-10 h-10 animate-pulse" />
                </div>
              )}
            </div>

            {/* Darija Call to Action */}
            <div className="mt-3">
              <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>سكاني وخود الكارط ديالك</span>
              </div>
              <p className="text-[11px] text-white/60 mt-1">
                خدمة سريعة في ثواني بدون تحميل أي تطبيق
              </p>
            </div>

            {/* Footer Stand Platform Line */}
            <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between text-[10px] text-white/50 font-mono">
              <span>walink.ma</span>
              <span>والينك</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          {/* NFC Tag URL copy */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="text-right overflow-hidden mr-2">
              <div className="text-xs font-semibold text-white/90">
                رابط برمجة لاصقة NFC (NTAG215)
              </div>
              <div className="text-[11px] text-sky-400 font-mono truncate dir-ltr text-left">
                {joinUrl}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyNfcUrl}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition whitespace-nowrap shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>

          {/* Print button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الستاند (Print Stand)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-semibold text-sm transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


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
import { getJoinUrl } from "@/lib/urls";

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
  const standRef = useRef<HTMLDivElement>(null);
  const joinUrl = getJoinUrl(merchant.slug);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-[#161514]/10 rounded-3xl shadow-2xl overflow-hidden p-6 text-[#161514] my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#161514]/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#F85B04]/10 text-[#F85B04] border border-[#F85B04]/25 shadow-sm">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-[#161514]">ستاند الكاونتر الذكي (NFC + QR)</h3>
              <p className="text-xs text-[#161514]/65">مخصص لـ: {merchant.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-[#EFEAE4] text-[#161514]/65 hover:text-[#161514] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Acrylic Counter Stand Preview */}
        <div className="my-6 flex justify-center">
          <div
            ref={standRef}
            className="relative w-72 bg-gradient-to-b from-white to-[#EFEAE4] rounded-3xl border-2 border-[#F85B04]/35 p-6 shadow-xl flex flex-col items-center text-center overflow-hidden"
            style={{
              boxShadow: "0 20px 40px -10px rgba(248, 91, 4, 0.16), 0 0 0 1px rgba(22, 21, 20, 0.05)",
            }}
          >
            {/* Top NFC Sensor Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F85B04]/10 text-[#DA5004] border border-[#F85B04]/25 rounded-full text-[11px] font-semibold mb-3">
              <Radio className="w-3.5 h-3.5" />
              <span>قرب تيليفونك (NFC)</span>
            </div>

            {/* Merchant Brand */}
            <h4 className="font-bold text-xl text-[#161514] mb-1">
              {merchant.name}
            </h4>
            <p className="font-script text-lg text-[#DA5004] font-bold mb-3">
              برنامج الوفاء والمكافآت
            </p>

            {/* High-Resolution QR Code */}
            <div className="bg-white p-3 rounded-2xl shadow-sm my-2 border border-[#161514]/10">
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
                <div className="w-44 h-44 flex items-center justify-center bg-[#EFEAE4] text-[#161514]/60">
                  <QrIcon className="w-10 h-10 animate-pulse" />
                </div>
              )}
            </div>

            {/* Darija Call to Action */}
            <div className="mt-3">
              <div className="text-sm font-bold text-[#161514] flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-[#F85B04]" />
                <span>سكاني وخود الكارط ديالك</span>
              </div>
              <p className="text-[11px] text-[#161514]/65 mt-1">
                خدمة سريعة في ثواني بدون تحميل أي تطبيق
              </p>
            </div>

            {/* Footer Stand Platform Line */}
            <div className="mt-4 pt-3 border-t border-[#161514]/10 w-full flex items-center justify-between text-[10px] text-[#161514]/55 font-mono">
              <span className="inline-flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-mark.png"
                  alt="Walink"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded object-contain inline-block"
                />
                <span>walink.ma</span>
              </span>
              <span>والينك</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          {/* NFC Tag URL copy */}
          <div className="p-3 bg-[#EFEAE4] rounded-2xl border border-[#161514]/10 flex items-center justify-between">
            <div className="text-right overflow-hidden mr-2">
              <div className="text-xs font-semibold text-[#161514]">
                رابط برمجة لاصقة NFC (NTAG215)
              </div>
              <div className="text-[11px] text-[#DA5004] font-mono truncate dir-ltr text-left">
                {joinUrl}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyNfcUrl}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#161514] hover:bg-[#2A2826] text-white font-semibold text-xs flex items-center gap-1.5 transition whitespace-nowrap shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
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
              className="flex-1 min-h-[44px] py-3 px-4 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-[0_3px_0_#C14703]"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الستاند (Print Stand)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] py-3 px-5 rounded-xl bg-[#EFEAE4] hover:bg-[#E5DFD7] text-[#161514] border border-[#161514]/15 font-semibold text-sm transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


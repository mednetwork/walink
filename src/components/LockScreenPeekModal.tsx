"use client";

import React, { useEffect } from "react";
import { X, Sparkles, ShieldCheck, Bell } from "lucide-react";
import { soundEngine } from "@/lib/sound";

interface LockScreenPeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  message: string;
  title?: string;
}

export default function LockScreenPeekModal({
  isOpen,
  onClose,
  shopName,
  message,
  title = "إشعار جديد فـ شاشة الهاتف",
}: LockScreenPeekModalProps) {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playStampChime();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[48px] border-[6px] border-slate-300 bg-gradient-to-b from-[#F0F2F5] via-[#EFEAE2] to-[#E9EDEF] p-6 text-[#111B21] shadow-2xl overflow-hidden flex flex-col justify-between min-h-[520px]">
        {/* Dynamic Island */}
        <div className="w-24 h-5 bg-black rounded-full mx-auto border border-black/10 flex items-center justify-end px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></span>
        </div>

        {/* Lock Screen Time & Date */}
        <div className="text-center pt-8 pb-4">
          <div className="text-xs font-semibold text-[#54656F]">
            الأحد، 15 نونبر
          </div>
          <div className="text-6xl font-light tracking-tight font-sans text-[#111B21]">
            9:41
          </div>
        </div>

        {/* Dropping Lock Screen Notification Banner */}
        <div className="my-auto animate-in slide-in-from-top-6 duration-300">
          <div className="p-4 rounded-3xl border border-[#E9EDEF] bg-white/95 backdrop-blur-md shadow-xl text-right space-y-1.5">
            {/* Header: App Name & Time */}
            <div className="flex items-center justify-between text-[11px] text-[#54656F]">
              <div className="flex items-center gap-1.5 font-bold text-[#111B21]">
                <div className="w-4 h-4 rounded-md bg-[#008069] text-white flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 stroke-[3]" />
                </div>
                <span>WALINK • {shopName}</span>
              </div>
              <span className="font-mono text-[10px]">الآن</span>
            </div>

            {/* Title & Content */}
            <div className="font-bold text-xs text-[#111B21]">
              {title}
            </div>
            <p className="text-xs text-[#54656F] leading-relaxed font-arabic">
              {message}
            </p>
          </div>

          <div className="text-center mt-3">
            <span className="text-[10px] text-[#008069] font-mono font-bold tracking-wider">
              ✦ هكا كيوصل الإشعار للكليان فـ شاشة التيليفون ✦
            </span>
          </div>
        </div>

        {/* Close Button & Home Bar */}
        <div className="pt-6 space-y-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F0F2F5] text-[#111B21] border border-[#D1D7DB] font-semibold text-xs transition shadow-sm"
          >
            إغلاق المعاينة
          </button>
          <div className="w-28 h-1 bg-slate-400 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
}


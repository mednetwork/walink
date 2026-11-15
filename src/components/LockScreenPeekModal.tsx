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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[48px] border-[6px] border-slate-700 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl overflow-hidden flex flex-col justify-between min-h-[520px]">
        {/* Dynamic Island */}
        <div className="w-24 h-5 bg-black rounded-full mx-auto border border-white/10 flex items-center justify-end px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-white/20"></span>
        </div>

        {/* Lock Screen Time & Date */}
        <div className="text-center pt-8 pb-4">
          <div className="text-xs font-semibold text-white/70">
            الأحد، 15 نونبر
          </div>
          <div className="text-6xl font-light tracking-tight font-sans text-white drop-shadow-md">
            9:41
          </div>
        </div>

        {/* Dropping Lock Screen Notification Banner */}
        <div className="my-auto animate-in slide-in-from-top-6 duration-300">
          <div className="glass-panel p-4 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl text-right space-y-1.5">
            {/* Header: App Name & Time */}
            <div className="flex items-center justify-between text-[11px] text-white/70">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <div className="w-4 h-4 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 stroke-[3]" />
                </div>
                <span>WALINK • {shopName}</span>
              </div>
              <span className="font-mono text-[10px]">الآن</span>
            </div>

            {/* Title & Content */}
            <div className="font-bold text-xs text-white">
              {title}
            </div>
            <p className="text-xs text-white/90 leading-relaxed font-arabic">
              {message}
            </p>
          </div>

          <div className="text-center mt-3">
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider">
              ✦ هكا كيوصل الإشعار للكليان فـ شاشة التيليفون ✦
            </span>
          </div>
        </div>

        {/* Close Button & Home Bar */}
        <div className="pt-6 space-y-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition"
          >
            إغلاق المعاينة
          </button>
          <div className="w-28 h-1 bg-white/30 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
}


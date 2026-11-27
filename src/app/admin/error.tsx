"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LogIn, Home } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error captured:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#EFEAE4]">
      <div className="w-full max-w-md bg-white border border-[#161514]/10 rounded-3xl p-8 shadow-xl shadow-black/5 text-center relative overflow-hidden">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 shadow-sm">
          <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h1 className="text-xl font-bold text-[#161514] tracking-tight">
          تعذر تحميل لوحة الإدارة
        </h1>

        <p className="text-xs text-[#161514]/65 mt-2 leading-relaxed">
          حدث خطأ غير متوقع أثناء معالجة بيانات لوحة التحكم. يمكنك إعادة المحاولة أو التحقق من صحة جلسة الدخول.
        </p>

        {error.message && (
          <div className="mt-4 p-3 rounded-xl bg-[#EFEAE4] border border-[#161514]/10 text-start">
            <span className="text-[10px] font-bold text-[#161514]/55 uppercase tracking-wider block mb-1">
              تفاصيل الخطأ التقني:
            </span>
            <code className="text-xs text-rose-600 font-mono break-all line-clamp-3">
              {error.message}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:flex-1 min-h-[44px] py-3 px-4 rounded-xl bg-[#F85B04] hover:bg-[#E25102] text-white font-bold text-xs shadow-[0_3px_0_#C14703] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/admin/login"
            className="w-full sm:flex-1 min-h-[44px] py-3 px-4 rounded-xl border border-[#161514]/15 bg-white hover:bg-[#EFEAE4] text-[#161514] font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4 text-[#161514]/60" />
            <span>تسجيل الدخول</span>
          </Link>
        </div>

        <div className="mt-5 pt-4 border-t border-[#161514]/10 text-center">
          <Link
            href="/"
            className="text-[11px] font-medium text-[#161514]/65 hover:text-[#DA5004] inline-flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>العودة للموقع الرئيسي</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

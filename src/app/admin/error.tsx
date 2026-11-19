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
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E9EDEF] rounded-3xl p-8 shadow-xl shadow-black/5 text-center relative overflow-hidden">
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-5 shadow-sm">
          <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h1 className="text-xl font-bold text-[#111B21] tracking-tight">
          تعذر تحميل لوحة الإدارة
        </h1>

        <p className="text-xs text-[#54656F] mt-2 leading-relaxed">
          حدث خطأ غير متوقع أثناء معالجة بيانات لوحة التحكم. يمكنك إعادة المحاولة أو التحقق من صحة جلسة الدخول.
        </p>

        {error.message && (
          <div className="mt-4 p-3 rounded-xl bg-[#F7F8FA] border border-[#E9EDEF] text-start">
            <span className="text-[10px] font-bold text-[#8696A0] uppercase tracking-wider block mb-1">
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
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#009071] hover:to-[#006D59] text-white font-bold text-xs shadow-md shadow-[#008069]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/admin/login"
            className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-[#D1D7DB] bg-white hover:bg-[#F0F2F5] text-[#111B21] font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogIn className="w-4 h-4 text-[#54656F]" />
            <span>تسجيل الدخول</span>
          </Link>
        </div>

        <div className="mt-5 pt-4 border-t border-[#E9EDEF] text-center">
          <Link
            href="/"
            className="text-[11px] font-medium text-[#54656F] hover:text-[#008069] inline-flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>العودة للموقع الرئيسي</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMainUrl } from "@/lib/urls";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const { locale, isRTL } = useI18n();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  // Countdown timer if locked
  useEffect(() => {
    if (retryAfter && retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter((prev) => {
          if (!prev || prev <= 1) {
            clearInterval(timer);
            setStatus("idle");
            setErrorMsg("");
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setStatus("error");
      setErrorMsg(
        locale === "fr"
          ? "Veuillez remplir tous les champs obligatoires."
          : locale === "es"
          ? "Por favor complete todos los campos obligatorios."
          : "يرجى ملء جميع الحقول المطلوبة."
      );
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          remember,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setTimeout(() => {
          router.push(from);
          router.refresh();
        }, 500);
      } else {
        setStatus("error");
        setErrorMsg(
          data.error ||
            (locale === "fr"
              ? "Identifiants invalides."
              : locale === "es"
              ? "Credenciales inválidas."
              : "اسم المستخدم أو كلمة المرور غير صحيحة.")
        );
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        if (data.retryAfterSeconds) {
          setRetryAfter(data.retryAfterSeconds);
        }
      }
    } catch {
      setStatus("error");
      setErrorMsg(
        locale === "fr"
          ? "Erreur de connexion au serveur d'authentification."
          : locale === "es"
          ? "Error de conexión con el servidor de autenticación."
          : "تعذر الاتصال بخادم المصادقة، يرجى المحاولة لاحقاً."
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F0F2F5] text-[#111B21] flex flex-col justify-between selection:bg-[#008069] selection:text-white relative overflow-hidden font-sans"
      style={{
        backgroundImage:
          "radial-gradient(rgba(0, 128, 105, 0.07) 1.2px, transparent 1.2px)",
        backgroundSize: "24px 24px",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Ambient background glows in Walink Brand Emerald */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[720px] h-[460px] rounded-full pointer-events-none blur-[140px] opacity-35"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 168, 132, 0.25) 0%, rgba(0, 128, 105, 0.12) 50%, transparent 80%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[520px] h-[420px] rounded-full pointer-events-none blur-[120px] opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 128, 105, 0.2) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Header Bar matching walink.ma Navbar */}
      <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-[#E9EDEF] shadow-[0_1px_3px_rgba(11,20,26,0.04)]">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <a
            href={getMainUrl("/")}
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
            aria-label="Walink.ma Homepage"
          >
            {/* SVG Brand Mark */}
            <svg
              className="w-8 h-8 flex-none transition-transform group-hover:scale-105 duration-200"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="walink-mark-grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#00A884" />
                  <stop offset="50%" stopColor="#008069" />
                  <stop offset="100%" stopColor="#075E54" />
                </linearGradient>
              </defs>
              <path
                fill="url(#walink-mark-grad)"
                d="M16 3L4 7v9c0 8.3 5.1 12.8 12 14 6.9-1.2 12-5.7 12-14V7L16 3z"
              />
              <path
                fill="#FFFFFF"
                d="M16 8a7 7 0 0 1 7 7h-2.5a4.5 4.5 0 0 0-4.5-4.5V8zm0 4.5a2.5 2.5 0 0 1 2.5 2.5H16v-2.5z"
              />
            </svg>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#111B21]">
                walink<span className="text-[#008069]">.ma</span>
              </span>
              <span className="text-xs text-[#54656F] font-semibold ps-2 border-s border-[#D1D7DB] hidden sm:inline leading-none">
                {locale === "fr"
                  ? "Console d'administration"
                  : locale === "es"
                  ? "Panel de control"
                  : "ولينك المغرب"}
              </span>
            </div>
          </a>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-3">
            {/* Back to Homepage Link */}
            <a
              href={getMainUrl("/")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#54656F] hover:text-[#008069] transition-colors duration-150 py-1.5 px-2.5 rounded-lg hover:bg-[#F0F2F5]"
            >
              <svg
                className="w-4 h-4 rtl:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>
                {locale === "fr"
                  ? "Retour au site"
                  : locale === "es"
                  ? "Volver al sitio"
                  : "الموقع الرئيسي"}
              </span>
            </a>

            {/* Subdomain / Status Indicator Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008069]/10 border border-[#008069]/20 text-[#008069] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008069] animate-pulse" />
              <span>Super Admin Portal</span>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher size="sm" variant="light" />
          </div>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 z-10">
        <div className="w-full max-w-[430px]">
          {/* Card Box in WhatsApp Crisp White */}
          <div className="bg-white border border-[#E9EDEF] border-t-4 border-t-[#00A884] rounded-3xl p-7 sm:p-9 shadow-[0_4px_24px_-4px_rgba(11,20,26,0.08),0_1px_3px_rgba(11,20,26,0.05)] relative transition-all">
            {/* Brand Logo & Title Area */}
            <div className="text-center mb-7">
              {/* Shield Icon Badge */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#008069] text-white shadow-lg shadow-[#008069]/25 mb-4 ring-4 ring-[#008069]/10">
                <svg
                  className="w-7 h-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              {/* Title & Badge */}
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <h1 className="text-xl font-black text-[#111B21] tracking-tight">
                  {locale === "fr"
                    ? "Console d'administration"
                    : locale === "es"
                    ? "Panel de administración"
                    : "بوابة الإدارة المركزية"}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#008069]/10 border border-[#008069]/20 text-[#008069] text-[10.5px] font-bold">
                  Admin
                </span>
              </div>

              <p className="text-xs text-[#54656F] leading-relaxed max-w-[340px] mx-auto">
                {locale === "fr"
                  ? "Veuillez vous authentifier pour accéder aux outils de gestion"
                  : locale === "es"
                  ? "Ingrese sus credenciales autorizadas para acceder al panel"
                  : "أدخل بيانات الاعتماد المعتمدة للوصول إلى لوحة التحكم والتحليلات"}
              </p>
            </div>

            {/* Error Notification Banner */}
            {status === "error" && errorMsg && (
              <div
                className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-sm animate-shake"
                role="alert"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-none text-rose-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="flex-1 leading-relaxed">
                  <p className="font-bold text-rose-900">{errorMsg}</p>
                  {retryAfter && retryAfter > 0 ? (
                    <p className="mt-1 text-[11px] text-rose-700 font-semibold font-mono">
                      {locale === "fr"
                        ? `Trop de tentatives. Réessayez dans ${retryAfter}s`
                        : locale === "es"
                        ? `Demasiados intentos. Reintentar en ${retryAfter}s`
                        : `تم تجاوز الحد المسموح. يمكنك المحاولة بعد ${retryAfter} ثانية`}
                    </p>
                  ) : remainingAttempts !== null && remainingAttempts > 0 ? (
                    <p className="mt-1 text-[11px] text-rose-700">
                      {locale === "fr"
                        ? `${remainingAttempts} tentative(s) restante(s) avant verrouillage`
                        : locale === "es"
                        ? `${remainingAttempts} intento(s) restante(s) antes del bloqueo`
                        : `المحاولات المتبقية قبل الإغلاق الأمني: ${remainingAttempts}`}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {/* Success Notification Banner */}
            {status === "success" && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 shadow-sm">
                <svg
                  className="w-5 h-5 text-[#008069] flex-none animate-bounce"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="font-bold text-emerald-900">
                  {locale === "fr"
                    ? "Authentification réussie ! Redirection..."
                    : locale === "es"
                    ? "¡Autenticación correcta! Redirigiendo..."
                    : "تم تأكيد الهوية بنجاح! جاري التوجيه إلى لوحة التحكم..."}
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="admin-user"
                  className="block text-xs font-bold text-[#111B21] mb-1.5"
                >
                  {locale === "fr"
                    ? "Identifiant administrateur"
                    : locale === "es"
                    ? "Usuario administrador"
                    : "اسم المستخدم"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#54656F]">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="admin-user"
                    type="text"
                    required
                    autoComplete="username"
                    disabled={
                      status === "loading" ||
                      (retryAfter !== null && retryAfter > 0)
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      locale === "fr"
                        ? "ex: admin"
                        : locale === "es"
                        ? "ej: admin"
                        : "مثال: admin"
                    }
                    className="w-full bg-[#F7F8FA] hover:bg-white focus:bg-white border border-[#D1D7DB] rounded-xl py-3 ps-10 pe-3.5 text-sm text-[#111B21] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] focus:ring-4 focus:ring-[#008069]/10 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="admin-pass"
                  className="block text-xs font-bold text-[#111B21] mb-1.5"
                >
                  {locale === "fr"
                    ? "Mot de passe secret"
                    : locale === "es"
                    ? "Contraseña secreta"
                    : "كلمة المرور السرية"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#54656F]">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    id="admin-pass"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    disabled={
                      status === "loading" ||
                      (retryAfter !== null && retryAfter > 0)
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-[#F7F8FA] hover:bg-white focus:bg-white border border-[#D1D7DB] rounded-xl py-3 ps-10 pe-11 text-sm text-[#111B21] placeholder-[#8696A0] focus:outline-none focus:border-[#008069] focus:ring-4 focus:ring-[#008069]/10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-[#54656F] hover:text-[#111B21] transition-colors p-2"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D1D7DB] text-[#008069] focus:ring-[#008069] focus:ring-offset-0 focus:ring-1 cursor-pointer accent-[#008069]"
                  />
                  <span className="text-xs text-[#54656F] font-medium">
                    {locale === "fr"
                      ? "Garder ma session active (30 jours)"
                      : locale === "es"
                      ? "Mantener la sesión iniciada (30 días)"
                      : "تذكر جلسة الدخول (30 يوماً)"}
                  </span>
                </label>
              </div>

              {/* Submit CTA Button in WhatsApp Emerald */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    status === "loading" ||
                    (retryAfter !== null && retryAfter > 0)
                  }
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#009071] hover:to-[#006D59] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#008069]/25 hover:shadow-lg hover:shadow-[#008069]/35 transition-all flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>
                        {locale === "fr"
                          ? "Vérification en cours..."
                          : locale === "es"
                          ? "Verificando acceso..."
                          : "جاري التحقق من الصلاحيات..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 rtl:rotate-180"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span>
                        {locale === "fr"
                          ? "Accéder à la console"
                          : locale === "es"
                          ? "Iniciar sesión en el panel"
                          : "تسجيل الدخول إلى الإدارة"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security & Moroccan Pride Assurance Box */}
          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <div className="inline-flex items-center gap-2 text-[11.5px] text-[#54656F] font-medium bg-white/70 backdrop-blur-sm border border-[#E9EDEF] px-3.5 py-1.5 rounded-full shadow-sm">
              <svg
                className="w-3.5 h-3.5 text-[#008069] flex-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>
                {locale === "fr"
                  ? "Chiffrement HMAC-SHA256 • Protection anti-intrusion"
                  : locale === "es"
                  ? "Cifrado HMAC-SHA256 • Protección contra intrusiones"
                  : "جلسة مشفرة بتوقيع HMAC-SHA256 • حماية متقدمة"}
              </span>
            </div>

            <p className="text-[11px] text-[#8696A0]">
              صُنع بكل فخر في المغرب 🇲🇦 • Walink Enterprise Platform
            </p>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="w-full text-center py-4 text-[11px] text-[#8696A0] border-t border-[#E9EDEF]/60 bg-white/50 backdrop-blur-sm z-10">
        © {new Date().getFullYear()} Walink (walink.ma) • All Rights Reserved.
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center text-[#54656F] text-sm font-sans">
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-white border border-[#E9EDEF] shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008069] animate-ping" />
            <span className="font-semibold text-xs text-[#111B21]">
              تحميل لوحة الإدارة...
            </span>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

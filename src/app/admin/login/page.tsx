"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
          ? "Veuillez remplir tous les champs."
          : locale === "es"
          ? "Por favor complete todos los campos."
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
        }, 600);
      } else {
        setStatus("error");
        setErrorMsg(
          data.error ||
            (locale === "fr"
              ? "Échec de connexion."
              : locale === "es"
              ? "Error de autenticación."
              : "فشل تسجيل الدخول.")
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
          ? "Erreur de connexion au serveur."
          : locale === "es"
          ? "Error al conectar con el servidor."
          : "تعذر الاتصال بخادم المصادقة."
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0B141A] text-[#E9EDEF] flex flex-col justify-between selection:bg-[#008069] selection:text-white relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Ambient background glows */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none blur-[140px] opacity-25"
        style={{
          background: "radial-gradient(circle, #008069 0%, rgba(7, 94, 84, 0.4) 50%, transparent 80%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[400px] rounded-full pointer-events-none blur-[120px] opacity-15"
        style={{
          background: "radial-gradient(circle, #00A884 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#8696A0] hover:text-[#00A884] transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 rtl:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>
            {locale === "fr"
              ? "Retour au site public"
              : locale === "es"
              ? "Volver al sitio público"
              : "العودة للموقع الرئيسي"}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00A884] text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-pulse" />
            <span>wadmin.walink.ma</span>
          </div>
          <LanguageSwitcher size="sm" variant="dark" />
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-[420px]">
          {/* Card Box */}
          <div className="bg-[#111B21]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/60 relative">
            {/* Brand Logo & Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A884] to-[#075E54] text-white shadow-lg shadow-emerald-900/40 mb-4 ring-4 ring-emerald-500/15">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <div className="inline-flex items-center gap-2 mb-1.5">
                <span className="text-xl font-black tracking-tight text-white font-sans">
                  walink<span className="text-[#00A884]">.ma</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#008069]/20 border border-[#008069]/30 text-[#00A884] text-[10.5px] font-bold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>

              <h1 className="text-lg font-bold text-white">
                {locale === "fr"
                  ? "Console d'administration sécurisée"
                  : locale === "es"
                  ? "Panel de administración seguro"
                  : "بوابة الإدارة المركزية"}
              </h1>
              <p className="text-xs text-[#8696A0] mt-1.5">
                {locale === "fr"
                  ? "Veuillez vous authentifier pour accéder à la console"
                  : locale === "es"
                  ? "Autentíquese para acceder al panel de control"
                  : "أدخل بيانات الاعتماد المعتمدة للوصول إلى لوحة التحكم"}
              </p>
            </div>

            {/* Error Notification Banner */}
            {status === "error" && errorMsg && (
              <div
                className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-shake"
                role="alert"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-none text-rose-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold">{errorMsg}</p>
                  {retryAfter && retryAfter > 0 ? (
                    <p className="mt-1 text-[11px] text-rose-400 font-mono">
                      {locale === "fr"
                        ? `Réessayez dans ${retryAfter}s`
                        : locale === "es"
                        ? `Reintentar en ${retryAfter}s`
                        : `يمكنك المحاولة مجدداً بعد ${retryAfter} ثانية`}
                    </p>
                  ) : remainingAttempts !== null && remainingAttempts > 0 ? (
                    <p className="mt-1 text-[11px] text-rose-400/80">
                      {locale === "fr"
                        ? `${remainingAttempts} tentative(s) restante(s)`
                        : locale === "es"
                        ? `${remainingAttempts} intento(s) restante(s)`
                        : `المحاولات المتبقية: ${remainingAttempts}`}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {/* Success Notification Banner */}
            {status === "success" && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#00A884] flex-none animate-bounce"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>
                  {locale === "fr"
                    ? "Connexion réussie ! Redirection en cours..."
                    : locale === "es"
                    ? "¡Acceso correcto! Redirigiendo..."
                    : "تم التحقق بنجاح! جاري توجيهك إلى لوحة التحكم..."}
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="admin-user"
                  className="block text-xs font-bold text-[#8696A0] mb-1.5"
                >
                  {locale === "fr"
                    ? "Identifiant administrateur"
                    : locale === "es"
                    ? "Usuario administrador"
                    : "اسم المستخدم"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#8696A0]">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                    disabled={status === "loading" || (retryAfter !== null && retryAfter > 0)}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={locale === "fr" ? "ex: admin" : "admin"}
                    className="w-full bg-[#1F2C34] border border-white/10 rounded-xl py-3 ps-10 pe-3.5 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#00A884] focus:ring-2 focus:ring-[#00A884]/20 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="admin-pass"
                  className="block text-xs font-bold text-[#8696A0] mb-1.5"
                >
                  {locale === "fr"
                    ? "Mot de passe secret"
                    : locale === "es"
                    ? "Contraseña secreta"
                    : "كلمة المرور السرية"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-[#8696A0]">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    id="admin-pass"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    disabled={status === "loading" || (retryAfter !== null && retryAfter > 0)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-[#1F2C34] border border-white/10 rounded-xl py-3 ps-10 pe-11 text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#00A884] focus:ring-2 focus:ring-[#00A884]/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-[#8696A0] hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
                    className="w-4 h-4 rounded bg-[#1F2C34] border-white/20 text-[#008069] focus:ring-[#00A884] focus:ring-offset-0 focus:ring-1 cursor-pointer"
                  />
                  <span className="text-xs text-[#8696A0]">
                    {locale === "fr"
                      ? "Garder ma session active (7 jours)"
                      : locale === "es"
                      ? "Mantener la sesión iniciada (7 días)"
                      : "تذكر هذا الجهاز (7 أيام)"}
                  </span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "loading" || (retryAfter !== null && retryAfter > 0)}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#00A884] to-[#008069] hover:from-[#00B890] hover:to-[#009277] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
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
                          : "جاري التحقق من التشفير..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span>
                        {locale === "fr"
                          ? "Accéder à la console"
                          : locale === "es"
                          ? "Iniciar sesión en la consola"
                          : "دخول آمن إلى لوحة الإدارة"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Assurance Footer Note */}
          <div className="text-center mt-6 text-[11.5px] text-[#8696A0] flex items-center justify-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-[#00A884]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              {locale === "fr"
                ? "Connexion chiffrée de bout en bout • Protection anti-brute force"
                : locale === "es"
                ? "Conexión cifrada de extremo a extremo • Protección anti fuerza bruta"
                : "اتصال مشفر بتوقيع HMAC • محمي ضد هجمات القوة الغاشمة"}
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-[11px] text-[#64748B] z-10">
        © {new Date().getFullYear()} Walink (wadmin.walink.ma) • All Rights Reserved.
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B141A] flex items-center justify-center text-[#8696A0] text-sm font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00A884] animate-ping" />
            <span>Loading Walink Admin...</span>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060B18] text-white flex flex-col items-center justify-center p-6 text-center selection:bg-[#00A884]">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-black/40">
        🔍
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
      <p className="text-white/70 text-sm max-w-sm mb-6 leading-relaxed">
        الصفحة المطلوبة غير موجودة أو تم نقلها.
        <br />
        <span className="text-white/40 text-xs">Page non trouvée / Page not found</span>
      </p>
      <Link
        href="https://walink.ma"
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008069] text-white text-xs font-bold hover:opacity-90 transition shadow-md shadow-[#008069]/20"
      >
        الرجوع إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}

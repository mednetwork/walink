export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#173E30] flex flex-col items-center justify-center p-6 text-center selection:bg-[#008069] selection:text-white">
      <div className="w-16 h-16 rounded-2xl bg-[#FFFDF7] border border-[#DCE0D4] flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
        🔍
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[#173E30]">404</h1>
      <p className="text-[#5F655D] text-sm max-w-sm leading-relaxed">
        الصفحة المطلوبة غير موجودة أو تم نقلها.
        <br />
        <span className="text-[#5F655D]/70 text-xs">Page non trouvée / Page not found</span>
      </p>
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#EFEAE4] text-[#161514] flex flex-col items-center justify-center p-6 text-center selection:bg-[#F85B04] selection:text-white">
      <div className="w-16 h-16 rounded-2xl bg-white border border-[#161514]/10 flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
        🔍
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[#161514]">404</h1>
      <p className="text-[#161514]/65 text-sm max-w-sm leading-relaxed">
        الصفحة المطلوبة غير موجودة أو تم نقلها.
        <br />
        <span className="text-[#161514]/50 text-xs">Page non trouvée / Page not found</span>
      </p>
    </div>
  );
}

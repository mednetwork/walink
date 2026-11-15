import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Walink (والينك) | بطاقات الوفاء الرقمية للمحلات التجارية بالمغرب",
  description:
    "المنصة المغربية الأولى لبطاقات الوفاء الذكية عبر Apple Wallet و Google Wallet و Web Pass مع إشعارات الرادار والـ Geofencing ومراجعات خرائط جوجل.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexArabic.variable} ${inter.variable}`}>
      <body className="bg-[#0B0F17] text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}


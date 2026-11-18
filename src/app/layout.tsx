import type { Metadata } from "next";
import { Noto_Sans_Arabic, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-arabic",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
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
    <html
      lang="ar"
      dir="rtl"
      className={`${notoSansArabic.variable} ${plusJakartaSans.variable} ${inter.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-[#F0F2F5] text-[#111B21] min-h-screen selection:bg-[#008069] selection:text-white">
        {children}
      </body>
    </html>
  );
}


import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/lib/i18n/context";
import PreventZoomClient from "@/components/PreventZoomClient";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F85B04",
};

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
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-[#EFEAE4] text-[#161514] min-h-screen selection:bg-[#F85B04] selection:text-white antialiased">
        <PreventZoomClient />
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

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
  metadataBase: new URL("https://walink.ma"),
  title: "Walink (والينك) | بطاقات الوفاء الرقمية للمحلات التجارية بالمغرب",
  description:
    "المنصة المغربية الأولى لبطاقات الوفاء الذكية عبر Apple Wallet و Google Wallet و Web Pass مع إشعارات الرادار والـ Geofencing ومراجعات خرائط جوجل.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Walink (والينك) | بطاقات الوفاء الرقمية بالمغرب",
    description:
      "بطاقة وفاء رقمية في Apple Wallet و Google Wallet بدون تطبيقات — بإشعارات شاشة القفل ورادار 100 متر.",
    images: [{ url: "/og-image.png?v=2", width: 1200, height: 630, alt: "Walink Loyalty Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Walink (والينك) | بطاقات الوفاء الرقمية بالمغرب",
    images: ["/og-image.png?v=2"],
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
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Caveat:wght@600;700&family=Aref+Ruqaa:wght@400;700&display=swap"
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

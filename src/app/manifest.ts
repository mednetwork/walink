import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Walink • والينك بطاقات الوفاء الرقمية",
    short_name: "Walink",
    description: "بطاقات الوفاء الذكية للمحلات التجارية بالمغرب عبر Apple Wallet و Google Wallet و Web Pass.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0F17",
    theme_color: "#10B981",
    dir: "rtl",
    lang: "ar",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}


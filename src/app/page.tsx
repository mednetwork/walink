import React, { Suspense } from "react";
import { Metadata } from "next";
import MarketingLandingClient from "@/components/MarketingLandingClient";

export const metadata: Metadata = {
  title: "Walink (والينك) • بطاقات الوفاء الذكية في المغرب | Apple & Google Wallet",
  description:
    "خلّي كليانك يرجعو لمحلك بكارط وفاء رقمية فـ Apple Wallet و Google Wallet. رادار 100 ميترو، تقييمات خرائط Google، واسترجاع الغابرين لجميع المحلات بالمغرب.",
};

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <MarketingLandingClient />
    </Suspense>
  );
}

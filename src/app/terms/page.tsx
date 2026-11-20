import type { Metadata } from "next";
import TermsOfServiceClient from "@/components/TermsOfServiceClient";

export const metadata: Metadata = {
  title: "شروط الخدمة والاستخدام | Walink.ma",
  description:
    "الشروط والأحكام الرسمية لاستخدام منصة Walink المغربية لبطاقات الولاء الذكية. تفاصيل الباقات، ستاند الكاونتر الذكي، وحقوق الشركاء والمستهلكين.",
  alternates: {
    canonical: "https://walink.ma/terms",
  },
};

export default function TermsPage() {
  return <TermsOfServiceClient />;
}

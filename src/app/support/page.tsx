import type { Metadata } from "next";
import CustomerSupportClient from "@/components/CustomerSupportClient";

export const metadata: Metadata = {
  title: "مركز الدعم والمساعدة وخدمة العملاء | Walink.ma",
  description:
    "تواصل مع فريق الدعم الفني لمنصة Walink المغربية لبطاقات الولاء الذكية. دعم مباشر عبر الواتساب والهاتف والبريد الإلكتروني للإجابة على استفسارات التجار والمستهلكين.",
  alternates: {
    canonical: "https://walink.ma/support",
  },
};

export default function SupportPage() {
  return <CustomerSupportClient />;
}

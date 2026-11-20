import type { Metadata } from "next";
import PrivacyPolicyClient from "@/components/PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "سياسة الخصوصية وحماية المعطيات الشخصية | Walink.ma",
  description:
    "سياسة الخصوصية الرسمية لمنصة Walink المغربية لبطاقات الولاء الذكية. التزام تام بحماية البيانات الشخصية وفق القانون المغربي 09-08 ومعايير Apple و Google Wallet.",
  alternates: {
    canonical: "https://walink.ma/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicyClient />;
}

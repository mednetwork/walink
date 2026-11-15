import React from "react";
import MerchantForm from "@/components/MerchantForm";

export default function NewMerchantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          إضافة شريك جديد إلى منصة والينك
        </h1>
        <p className="text-xs text-white/60 mt-1">
          قم بتحديد بيانات المحل، قواعد بطاقة الوفاء، وموقع الرادار الجغرافي
        </p>
      </div>

      <MerchantForm />
    </div>
  );
}


import React from "react";
import prisma from "@/lib/prisma";
import MerchantForm from "@/components/MerchantForm";

export const dynamic = "force-dynamic";

export default async function NewMerchantPage() {
  const unassignedStands = await prisma.qrStand.findMany({
    where: { merchantId: null },
    orderBy: [{ batchLabel: "asc" }, { code: "asc" }],
    select: {
      id: true,
      code: true,
      batchLabel: true,
      createdAt: true,
    },
  });

  const availableStands = unassignedStands.map((stand) => ({
    id: stand.id,
    code: stand.code,
    batchLabel: stand.batchLabel,
    createdAt: stand.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#161514] tracking-tight">
          إضافة شريك جديد إلى منصة والينك
        </h1>
        <p className="text-xs text-[#161514]/65 mt-1">
          قم بتحديد بيانات المحل، قواعد بطاقة الوفاء، وموقع الرادار الجغرافي
        </p>
      </div>

      <MerchantForm availableStands={availableStands} />
    </div>
  );
}


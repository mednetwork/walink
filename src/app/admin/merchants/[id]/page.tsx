import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import MerchantForm from "@/components/MerchantForm";

interface EditMerchantPageProps {
  params: {
    id: string;
  };
}

export default async function EditMerchantPage({ params }: EditMerchantPageProps) {
  const { id } = params;

  const merchant = await prisma.merchant.findUnique({
    where: { id },
    include: {
      qrStands: {
        orderBy: { assignedAt: "desc" },
        select: {
          id: true,
          code: true,
          branchName: true,
          batchLabel: true,
          scanCount: true,
          assignedAt: true,
        },
      },
    },
  });

  if (!merchant) {
    notFound();
  }

  const linkedStands = merchant.qrStands.map((stand) => ({
    id: stand.id,
    code: stand.code,
    branchName: stand.branchName,
    batchLabel: stand.batchLabel,
    scanCount: stand.scanCount,
    assignedAt: stand.assignedAt ? stand.assignedAt.toISOString() : null,
  }));

  const initialData = {
    id: merchant.id,
    name: merchant.name,
    slug: merchant.slug,
    niche: merchant.niche,
    city: merchant.city,
    phone: merchant.phone || "",
    pinCode: merchant.pinCode,
    logoIcon: merchant.logoIcon,
    primaryColor: merchant.primaryColor,
    bgGradient: merchant.bgGradient,
    stampsRequired: merchant.stampsRequired,
    rewardName: merchant.rewardName,
    customerPrefix: merchant.customerPrefix,
    latitude: merchant.latitude,
    longitude: merchant.longitude,
    radarMessage: merchant.radarMessage,
    googleMapsUrl: merchant.googleMapsUrl || "",
    plan: merchant.plan,
    maxBranches: merchant.maxBranches ?? 1,
    credits: merchant.credits,
    autoWinback: merchant.autoWinback,
    autoReview: merchant.autoReview,
    autoRadar: merchant.autoRadar,
    autoNearReward: merchant.autoNearReward,
    allowMultiStamps: Boolean(merchant.allowMultiStamps),
    isActive: merchant.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#161514] tracking-tight">
          تعديل بيانات المحل: {merchant.name}
        </h1>
        <p className="text-xs text-[#161514]/65 mt-1">
          تعديل إعدادات البطاقة، الرصيد، أو قواعد الأتمتة للمحل
        </p>
      </div>

      <MerchantForm
        initialData={initialData}
        isEdit={true}
        linkedStands={linkedStands}
      />
    </div>
  );
}


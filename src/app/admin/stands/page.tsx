import React from "react";
import prisma from "@/lib/prisma";
import AdminStandsClient from "@/components/AdminStandsClient";

export const dynamic = "force-dynamic";

export default async function AdminStandsPage() {
  const [stands, merchants] = await Promise.all([
    prisma.qrStand.findMany({
      orderBy: [{ createdAt: "desc" }, { code: "desc" }],
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            isActive: true,
            branches: true,
          },
        },
      },
    }),
    prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        isActive: true,
        branches: true,
      },
    }),
  ]);

  const serializedStands = stands.map((s) => ({
    ...s,
    assignedAt: s.assignedAt ? s.assignedAt.toISOString() : null,
    lastScannedAt: s.lastScannedAt ? s.lastScannedAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <AdminStandsClient
      initialStands={serializedStands}
      initialMerchants={merchants}
    />
  );
}

import React from "react";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import AdminOutreachClient from "@/components/AdminOutreachClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "استوديو استقطاب المتاجر وإدارة الطلبات | لوحة إدارة Walink",
  description: "توليد روابط مخصصة بنقرة واحدة ورسائل واتساب جاهزة وإدارة الطلبات الواردة وتحويلها إلى متاجر شريكة.",
};

export default async function AdminOutreachPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedLeads = leads.map((l) => ({
    id: l.id,
    shopName: l.shopName,
    niche: l.niche,
    city: l.city,
    phone: l.phone,
    plan: l.plan,
    price: l.price,
    usedDemo: l.usedDemo,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));

  return <AdminOutreachClient initialLeads={serializedLeads} />;
}


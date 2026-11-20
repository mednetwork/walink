import React from "react";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import AdminAutomationsClient from "@/components/AdminAutomationsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "محرك الأتمتة والرسائل الذكية | لوحة إدارة Walink",
  description: "التحكم في رسائل الاسترجاع بعد 15 يوماً، تنبيهات قرب المكافأة، ورادار القرب لجميع المحلات.",
};

export default async function AdminAutomationsPage() {
  const [
    totalNotifications,
    winbackCount,
    nearRewardCount,
    radarCount,
    reviewCount,
    merchants,
    recentNotifications,
  ] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { type: "WINBACK" } }),
    prisma.notification.count({ where: { type: "NEAR_REWARD" } }),
    prisma.notification.count({ where: { type: "RADAR" } }),
    prisma.notification.count({ where: { type: "REVIEW" } }),
    prisma.merchant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        credits: true,
        autoWinback: true,
        autoNearReward: true,
        autoRadar: true,
        autoReview: true,
        _count: {
          select: {
            customers: true,
            notifications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      take: 40,
      orderBy: { createdAt: "desc" },
      include: {
        merchant: {
          select: {
            name: true,
            slug: true,
          },
        },
        customer: {
          select: {
            name: true,
            passSerial: true,
            phone: true,
          },
        },
      },
    }),
  ]);

  const activeAutomatedMerchants = merchants.filter(
    (m) => m.autoWinback || m.autoNearReward || m.autoRadar || m.autoReview
  ).length;

  const initialStats = {
    totalNotifications,
    winbackCount,
    nearRewardCount,
    radarCount,
    reviewCount,
    activeAutomatedMerchants,
  };

  const serializedMerchants = merchants.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    credits: m.credits,
    autoWinback: m.autoWinback,
    autoNearReward: m.autoNearReward,
    autoRadar: m.autoRadar,
    autoReview: m.autoReview,
    customersCount: m._count.customers,
    notificationsCount: m._count.notifications,
  }));

  const serializedNotifications = recentNotifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    actionUrl: n.actionUrl,
    createdAt: n.createdAt.toISOString(),
    merchant: n.merchant,
    customer: n.customer,
  }));

  return (
    <AdminAutomationsClient
      initialStats={initialStats}
      initialNotifications={serializedNotifications}
      merchants={serializedMerchants}
    />
  );
}


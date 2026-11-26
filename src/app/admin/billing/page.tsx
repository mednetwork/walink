import React from "react";
import { buildBillingRows } from "@/lib/billing";
import AdminBillingClient from "@/components/AdminBillingClient";

export const dynamic = "force-dynamic";

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams?: { month?: string };
}) {
  const initialData = await buildBillingRows(searchParams?.month);

  return (
    <AdminBillingClient
      initialMonth={initialData.month}
      initialRows={initialData.rows}
      initialSummary={initialData.summary}
    />
  );
}

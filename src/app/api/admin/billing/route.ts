import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildBillingRows } from "@/lib/billing";
import {
  INSTALLATION_FEE_MAD,
  computeMonthlySubscriptionFee,
  computePointsFee,
  formatBillingMonth,
  normalizeBillingMonth,
  normalizeMerchantPlan,
} from "@/lib/pricing";

export async function GET(req: NextRequest) {
  try {
    const monthParam = req.nextUrl.searchParams.get("month");
    const data = await buildBillingRows(monthParam);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("[AdminBilling] GET error:", error);
    const msg = error instanceof Error ? error.message : "تعذر جلب بيانات الفوترة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      merchantId?: string;
      month?: string;
      status?: string;
      installationFee?: number;
      notes?: string | null;
    };

    if (!body.merchantId) {
      return NextResponse.json(
        { error: "معرف المتجر مطلوب" },
        { status: 400 }
      );
    }

    const month = normalizeBillingMonth(body.month);

    const merchant = await prisma.merchant.findUnique({
      where: { id: body.merchantId },
      select: {
        id: true,
        plan: true,
        maxBranches: true,
        createdAt: true,
      },
    });

    if (!merchant) {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    const createdMonth = formatBillingMonth(merchant.createdAt);
    if (createdMonth > month) {
      return NextResponse.json(
        { error: "لا يمكن إصدار فاتورة لشهر يسبق تاريخ إنشاء المتجر" },
        { status: 400 }
      );
    }

    const safeBranches = Math.max(1, merchant.maxBranches || 1);
    const normalizedPlan = normalizeMerchantPlan(merchant.plan, safeBranches);
    const liveSubscriptionFee = computeMonthlySubscriptionFee(
      normalizedPlan,
      safeBranches
    );

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // Lock the Merchant row exclusively to serialize concurrent invoice updates for the same period
      await tx.$queryRaw`SELECT id FROM \`Merchant\` WHERE id = ${merchant.id} FOR UPDATE`;

      const [existing, pointAgg] = await Promise.all([
        tx.merchantInvoice.findUnique({
          where: {
            merchantId_month: {
              merchantId: merchant.id,
              month,
            },
          },
        }),
        tx.pointUsage.aggregate({
          where: {
            merchantId: merchant.id,
            billingMonth: month,
          },
          _sum: { points: true },
        }),
      ]);

      const nextStatus =
        body.status === "PAID" || body.status === "UNPAID"
          ? body.status
          : existing?.status === "PAID"
          ? "PAID"
          : "UNPAID";

      const livePointsUsed = pointAgg._sum.points ?? 0;
      const livePointsFee = computePointsFee(livePointsUsed);

      const resolvedInstallationFee =
        typeof body.installationFee === "number" && !isNaN(body.installationFee)
          ? Math.max(0, Number(body.installationFee))
          : existing
          ? existing.installationFee
          : createdMonth === month
          ? INSTALLATION_FEE_MAD
          : 0;

      const subscriptionFee =
        existing && existing.status === "PAID" && nextStatus === "PAID"
          ? existing.subscriptionFee
          : liveSubscriptionFee;
      const pointsUsed =
        existing && existing.status === "PAID" && nextStatus === "PAID"
          ? existing.pointsUsed
          : livePointsUsed;
      const pointsFee =
        existing && existing.status === "PAID" && nextStatus === "PAID"
          ? existing.pointsFee
          : livePointsFee;
      const totalAmount = Number(
        (subscriptionFee + resolvedInstallationFee + pointsFee).toFixed(2)
      );

      return tx.merchantInvoice.upsert({
        where: {
          merchantId_month: {
            merchantId: merchant.id,
            month,
          },
        },
        create: {
          merchantId: merchant.id,
          month,
          planSnapshot: normalizedPlan,
          branchesSnapshot:
            normalizedPlan === "MULTI" ? Math.max(2, safeBranches) : 1,
          subscriptionFee,
          installationFee: resolvedInstallationFee,
          pointsUsed,
          pointsFee,
          totalAmount,
          status: nextStatus,
          paidAt: nextStatus === "PAID" ? new Date() : null,
          notes: body.notes ?? null,
        },
        update: {
          planSnapshot: normalizedPlan,
          branchesSnapshot:
            normalizedPlan === "MULTI" ? Math.max(2, safeBranches) : 1,
          subscriptionFee,
          installationFee: resolvedInstallationFee,
          pointsUsed,
          pointsFee,
          totalAmount,
          status: nextStatus,
          paidAt:
            nextStatus === "PAID"
              ? existing?.paidAt || new Date()
              : null,
          ...(body.notes !== undefined ? { notes: body.notes } : {}),
        },
      });
    });

    const refreshed = await buildBillingRows(month);
    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      ...refreshed,
    });
  } catch (error: unknown) {
    console.error("[AdminBilling] PATCH error:", error);
    const msg = error instanceof Error ? error.message : "تعذر تحديث حالة الفاتورة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

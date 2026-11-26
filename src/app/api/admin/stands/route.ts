import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { invalidateStandCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

async function requireSuperAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminToken(token);
  return Boolean(session);
}

function sanitizePrefix(raw?: string | null): string {
  const cleaned = (raw || "WLK")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  return cleaned || "WLK";
}

function formatStandCode(prefix: string, seqNumber: number): string {
  return `${prefix}-${String(seqNumber).padStart(3, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireSuperAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const summary = {
      total: stands.length,
      assigned: stands.filter((s) => Boolean(s.merchantId)).length,
      unassigned: stands.filter((s) => !s.merchantId).length,
      totalScans: stands.reduce((acc, s) => acc + (s.scanCount || 0), 0),
    };

    return NextResponse.json({
      stands: stands.map((s) => ({
        ...s,
        assignedAt: s.assignedAt ? s.assignedAt.toISOString() : null,
        lastScannedAt: s.lastScannedAt ? s.lastScannedAt.toISOString() : null,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      merchants,
      summary,
    });
  } catch (error: unknown) {
    console.error("[AdminStands] GET error:", error);
    return NextResponse.json(
      { error: "تعذر جلب قائمة ستاندات QR" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireSuperAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      prefix?: string;
      count?: number;
      batchLabel?: string | null;
    };

    const prefix = sanitizePrefix(body.prefix);
    const requestedCount = Math.floor(Number(body.count) || 10);
    const count = Math.max(1, Math.min(200, requestedCount));
    const batchLabel =
      typeof body.batchLabel === "string" && body.batchLabel.trim()
        ? body.batchLabel.trim().slice(0, 80)
        : `${prefix} • ${new Date().toISOString().slice(0, 10)}`;

    // Find highest numeric suffix for this prefix (collision-free even after deletions)
    const prefixStart = `${prefix}-`;
    const existingRows = await prisma.qrStand.findMany({
      where: {
        code: { startsWith: prefixStart },
      },
      select: { code: true },
    });

    const existingSet = new Set(existingRows.map((r) => r.code.toUpperCase()));
    let maxSeq = 0;
    const regex = new RegExp(`^${prefix}-(\\d+)$`);
    for (const row of existingRows) {
      const m = regex.exec(row.code.toUpperCase());
      if (m && m[1]) {
        const parsed = parseInt(m[1], 10);
        if (Number.isFinite(parsed) && parsed > maxSeq) {
          maxSeq = parsed;
        }
      }
    }

    const toInsert: Array<{ code: string; batchLabel: string }> = [];
    let nextSeq = maxSeq + 1;
    while (toInsert.length < count) {
      const candidate = formatStandCode(prefix, nextSeq);
      nextSeq += 1;
      if (!existingSet.has(candidate)) {
        existingSet.add(candidate);
        toInsert.push({ code: candidate, batchLabel });
      }
    }

    await prisma.qrStand.createMany({
      data: toInsert,
      skipDuplicates: true,
    });

    const createdCodes = toInsert.map((item) => item.code);
    for (const c of createdCodes) {
      invalidateStandCache(c);
    }

    const createdStands = await prisma.qrStand.findMany({
      where: { code: { in: createdCodes } },
      orderBy: { code: "asc" },
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
    });

    return NextResponse.json({
      success: true,
      count: createdStands.length,
      stands: createdStands.map((s) => ({
        ...s,
        assignedAt: s.assignedAt ? s.assignedAt.toISOString() : null,
        lastScannedAt: s.lastScannedAt ? s.lastScannedAt.toISOString() : null,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      message: `تم توليد ${createdStands.length} ستاند جاهز للطباعة بنجاح (${createdCodes[0]} → ${createdCodes[createdCodes.length - 1]})!`,
    });
  } catch (error: unknown) {
    console.error("[AdminStands] POST error:", error);
    return NextResponse.json(
      { error: "تعذر توليد دفعة ستاندات QR" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireSuperAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      id?: string;
      code?: string;
      merchantId?: string | null;
      branchName?: string | null;
    };

    if (!body.id && !body.code) {
      return NextResponse.json(
        { error: "معرف أو كود الستاند مطلوب" },
        { status: 400 }
      );
    }

    const targetStand = await prisma.qrStand.findUnique({
      where: body.id
        ? { id: body.id }
        : { code: String(body.code).trim().toUpperCase() },
      select: { id: true, code: true },
    });

    if (!targetStand) {
      return NextResponse.json(
        { error: "الستاند غير موجود" },
        { status: 404 }
      );
    }

    const cleanMerchantId =
      typeof body.merchantId === "string" && body.merchantId.trim()
        ? body.merchantId.trim()
        : null;

    let validatedMerchantName: string | null = null;
    if (cleanMerchantId) {
      const m = await prisma.merchant.findUnique({
        where: { id: cleanMerchantId },
        select: { id: true, name: true },
      });
      if (!m) {
        return NextResponse.json(
          { error: "المتجر المحدد غير موجود" },
          { status: 404 }
        );
      }
      validatedMerchantName = m.name;
    }

    const cleanBranchName =
      cleanMerchantId && typeof body.branchName === "string" && body.branchName.trim()
        ? body.branchName.trim()
        : null;

    const updated = await prisma.qrStand.update({
      where: { id: targetStand.id },
      data: {
        merchantId: cleanMerchantId,
        branchName: cleanBranchName,
        assignedAt: cleanMerchantId ? new Date() : null,
      },
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
    });

    invalidateStandCache(updated.code);

    return NextResponse.json({
      success: true,
      stand: {
        ...updated,
        assignedAt: updated.assignedAt ? updated.assignedAt.toISOString() : null,
        lastScannedAt: updated.lastScannedAt
          ? updated.lastScannedAt.toISOString()
          : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
      message: cleanMerchantId
        ? `تم ربط الستاند ${updated.code} بمتجر (${validatedMerchantName}) بنجاح!`
        : `تم فك ربط الستاند ${updated.code} وأصبح متاحاً للبيع من جديد.`,
    });
  } catch (error: unknown) {
    console.error("[AdminStands] PATCH error:", error);
    return NextResponse.json(
      { error: "تعذر تحديث ربط الستاند" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await requireSuperAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "معرف الستاند مطلوب" },
        { status: 400 }
      );
    }

    const deleted = await prisma.qrStand.delete({
      where: { id },
      select: { code: true },
    });

    invalidateStandCache(deleted.code);

    return NextResponse.json({
      success: true,
      message: `تم حذف الستاند ${deleted.code} بنجاح.`,
    });
  } catch (error: unknown) {
    console.error("[AdminStands] DELETE error:", error);
    return NextResponse.json(
      { error: "تعذر حذف الستاند" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import { getStoreSessionFromCookies } from "@/lib/auth";
import {
  normalizeMoroccanPhone,
  isValidMoroccanPhone,
  chunkArray,
} from "@/lib/utils";

interface ImportRow {
  name: string;
  phone: string;
}

const IMPORT_CHUNK_SIZE = 250;

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await getStoreSessionFromCookies(req.cookies, slug);
    const body = await req.json();

    if (
      !session ||
      session.role !== "OWNER" ||
      body.actorRole === "BRANCH_STAFF" ||
      body.actorRole === "STAFF"
    ) {
      return NextResponse.json(
        {
          error:
            "غير مصرح: استيراد قوائم العملاء محصور بحساب صاحب المشروع فقط.",
        },
        { status: 403 }
      );
    }

    const { rows } = body as { rows: ImportRow[] };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "يرجى تزويد قائمة بأسماء وأرقام هواتف العملاء" },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        loyaltyMode: true,
        welcomeCashback: true,
        currency: true,
      },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "المتجر غير موجود" },
        { status: 404 }
      );
    }

    // 1. Validate & deduplicate CSV rows in memory before touching the database
    const uniqueCandidates = new Map<string, { name: string; phone: string }>();
    for (const row of rows) {
      if (!row?.name || !row?.phone) continue;
      const normalizedPhone = normalizeMoroccanPhone(row.phone);
      if (!isValidMoroccanPhone(normalizedPhone)) continue;
      if (!uniqueCandidates.has(normalizedPhone)) {
        uniqueCandidates.set(normalizedPhone, {
          name: row.name.trim(),
          phone: normalizedPhone,
        });
      }
    }

    const candidatePhones = Array.from(uniqueCandidates.keys());
    if (candidatePhones.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "تم استيراد وإنشاء 0 بطاقة عميل بنجاح!",
      });
    }

    // 2. Batch-load existing customers & active memberCodes in parallel (2 queries instead of 3N)
    const [existingCustomers, existingCodeRows] = await Promise.all([
      prisma.customer.findMany({
        where: {
          merchantId: merchant.id,
          phone: { in: candidatePhones },
        },
        select: { phone: true },
      }),
      prisma.customer.findMany({
        where: { merchantId: merchant.id },
        select: { memberCode: true },
      }),
    ]);

    const existingPhoneSet = new Set(existingCustomers.map((c) => c.phone));
    const usedMemberCodes = new Set(existingCodeRows.map((c) => c.memberCode));

    const allocateUniqueMemberCode = (): string => {
      for (let attempt = 0; attempt < 25; attempt++) {
        const candidate = Math.floor(1000 + Math.random() * 9000).toString();
        if (!usedMemberCodes.has(candidate)) {
          usedMemberCodes.add(candidate);
          return candidate;
        }
      }
      const fallback = crypto.randomInt(1000, 10000).toString();
      usedMemberCodes.add(fallback);
      return fallback;
    };

    const isCashback = merchant.loyaltyMode === "CASHBACK";
    const welcomeBonus = isCashback ? Number(merchant.welcomeCashback || 0) : 0;

    interface PendingCustomerInsert {
      id: string;
      merchantId: string;
      name: string;
      phone: string;
      memberCode: string;
      passSerial: string;
      securityPin: string;
      loyaltyType: string;
      stamps: number;
      cashbackBalance: number;
      totalCashbackEarned: number;
      totalVisits: number;
      walletType: string;
    }

    interface PendingTxInsert {
      merchantId: string;
      customerId: string;
      type: string;
      stampsDelta: number;
      cashbackDelta: number;
      staffName: string;
      note: string;
    }

    const customersToInsert: PendingCustomerInsert[] = [];
    const transactionsToInsert: PendingTxInsert[] = [];

    for (const candidate of Array.from(uniqueCandidates.values())) {
      if (existingPhoneSet.has(candidate.phone)) continue;

      const customerId = crypto.randomUUID();
      const passSerial = crypto.randomBytes(12).toString("hex"); // 24 URL-safe chars for Apple/Google Wallet
      const memberCode = allocateUniqueMemberCode();

      customersToInsert.push({
        id: customerId,
        merchantId: merchant.id,
        name: candidate.name,
        phone: candidate.phone,
        memberCode,
        passSerial,
        securityPin: memberCode,
        loyaltyType: isCashback ? "CASHBACK" : "STAMPS",
        stamps: isCashback ? 0 : 1,
        cashbackBalance: welcomeBonus,
        totalCashbackEarned: welcomeBonus,
        totalVisits: 1,
        walletType: "WEBPASS",
      });

      transactionsToInsert.push({
        merchantId: merchant.id,
        customerId,
        type: "CARD_CREATED",
        stampsDelta: isCashback ? 0 : 1,
        cashbackDelta: isCashback ? welcomeBonus : 0,
        staffName: "استيراد CSV",
        note: "إنشاء البطاقة عبر الاستيراد الجماعي",
      });
    }

    if (customersToInsert.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "جميع الأرقام الصالحة مسجلة مسبقاً لدى المتجر (0 بطاقة جديدة).",
      });
    }

    // 3. Chunked bulk inserts inside one atomic transaction (packet-safe for large imports)
    const customerChunks = chunkArray(customersToInsert, IMPORT_CHUNK_SIZE);
    const txByCustomerId = new Map(transactionsToInsert.map((t) => [t.customerId, t]));

    let createdCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const customerChunk of customerChunks) {
        if (customerChunk.length === 0) continue;

        await tx.customer.createMany({
          data: customerChunk,
          skipDuplicates: true,
        });

        // Verify which chunk IDs actually inserted (safe if skipDuplicates skipped a concurrent duplicate)
        const insertedRows = await tx.customer.findMany({
          where: {
            merchantId: merchant.id,
            id: { in: customerChunk.map((c) => c.id) },
          },
          select: { id: true },
        });

        if (insertedRows.length === 0) continue;
        createdCount += insertedRows.length;

        const matchingTxs: PendingTxInsert[] = [];
        for (const inserted of insertedRows) {
          const txRow = txByCustomerId.get(inserted.id);
          if (txRow) matchingTxs.push(txRow);
        }

        if (matchingTxs.length > 0) {
          await tx.transaction.createMany({
            data: matchingTxs,
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      count: createdCount,
      message: `تم استيراد وإنشاء ${createdCount} بطاقة عميل بنجاح!`,
    });
  } catch (error: unknown) {
    console.error("Error importing CSV customers:", error);
    const msg = error instanceof Error ? error.message : "تعذر استيراد العملاء";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

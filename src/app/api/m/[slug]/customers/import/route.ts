import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStoreSessionFromCookies } from "@/lib/auth";
import { normalizeMoroccanPhone, isValidMoroccanPhone } from "@/lib/utils";

interface ImportRow {
  name: string;
  phone: string;
}

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

    let createdCount = 0;
    const isCashback = merchant.loyaltyMode === "CASHBACK";
    const welcomeBonus = isCashback ? Number(merchant.welcomeCashback || 0) : 0;

    for (const row of rows) {
      if (!row.name || !row.phone) continue;
      const normalizedPhone = normalizeMoroccanPhone(row.phone);
      if (!isValidMoroccanPhone(normalizedPhone)) continue;

      // Check if already exists
      const exists = await prisma.customer.findUnique({
        where: {
          merchantId_phone: {
            merchantId: merchant.id,
            phone: normalizedPhone,
          },
        },
      });

      if (exists) continue;

      // Unique 4-digit member code
      const memberCode = Math.floor(1000 + Math.random() * 9000).toString();

      const customer = await prisma.customer.create({
        data: {
          merchantId: merchant.id,
          name: row.name.trim(),
          phone: normalizedPhone,
          memberCode,
          loyaltyType: isCashback ? "CASHBACK" : "STAMPS",
          stamps: isCashback ? 0 : 1,
          cashbackBalance: welcomeBonus,
          totalCashbackEarned: welcomeBonus,
          totalVisits: 1,
          walletType: "WEBPASS",
        },
      });

      await prisma.transaction.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          type: "CARD_CREATED",
          stampsDelta: isCashback ? 0 : 1,
          cashbackDelta: isCashback ? welcomeBonus : 0,
          staffName: "استيراد CSV",
          note: "إنشاء البطاقة عبر الاستيراد الجماعي",
        },
      });

      createdCount++;
    }

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

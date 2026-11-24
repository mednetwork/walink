import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      deviceLibraryId: string;
      passTypeId: string;
    };
  }
) {
  try {
    const { searchParams } = new URL(req.url);
    const passesUpdatedSince = searchParams.get("passesUpdatedSince");

    // Query customers with active apple push tokens
    const queryWhere: Record<string, unknown> = {
      applePushToken: { not: null },
    };

    if (passesUpdatedSince) {
      let sinceDate: Date | null = null;
      if (/^\d+$/.test(passesUpdatedSince)) {
        const num = Number(passesUpdatedSince);
        sinceDate = new Date(num > 1e11 ? num : num * 1000);
      } else {
        const d = new Date(passesUpdatedSince);
        if (!isNaN(d.getTime())) sinceDate = d;
      }
      if (sinceDate && !isNaN(sinceDate.getTime())) {
        queryWhere.updatedAt = { gt: sinceDate };
      }
    }

    const customers = await prisma.customer.findMany({
      where: queryWhere,
      select: { passSerial: true, updatedAt: true },
    });

    if (customers.length === 0) {
      return new NextResponse(null, { status: 204 });
    }

    const serialNumbers = customers.map((c) => c.passSerial);
    const latestDate = customers.reduce(
      (max, c) => (c.updatedAt > max ? c.updatedAt : max),
      new Date(0)
    );

    return NextResponse.json({
      lastUpdated: latestDate.toISOString(),
      serialNumbers,
    });
  } catch (error: unknown) {
    console.error("Apple Wallet device passes query error:", error);
    return NextResponse.json({ error: "Failed to query device passes" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();

    const allowedSettings = [
      "autoWinback",
      "autoBirthday",
      "autoReview",
      "autoRadar",
      "autoNearReward",
    ];

    const updateData: Record<string, boolean> = {};

    for (const key of allowedSettings) {
      if (key in body && typeof body[key] === "boolean") {
        updateData[key] = body[key];
      }
    }

    const updated = await prisma.merchant.update({
      where: { slug },
      data: updateData,
      select: {
        id: true,
        slug: true,
        autoWinback: true,
        autoBirthday: true,
        autoReview: true,
        autoRadar: true,
        autoNearReward: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ إعدادات الأتمتة بنجاح",
      settings: updated,
    });
  } catch (error: unknown) {
    console.error("Error updating merchant settings:", error);
    const msg = error instanceof Error ? error.message : "تعذر حفظ الإعدادات";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


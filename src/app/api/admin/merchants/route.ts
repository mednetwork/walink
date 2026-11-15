import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            customers: true,
            transactions: true,
            campaigns: true,
          },
        },
      },
    });

    return NextResponse.json(merchants);
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return NextResponse.json(
      { error: "تعذر جلب قائمة المحلات" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      slug: customSlug,
      niche = "cafe",
      city = "الدار البيضاء",
      phone,
      pinCode = "1234",
      logoIcon = "coffee",
      primaryColor = "#5b3519",
      bgGradient = "linear-gradient(150deg,#6b4226 0%,#3d2414 100%)",
      stampsRequired = 5,
      rewardName = "قهوة فابور",
      customerPrefix = "آ السي",
      latitude = 33.5731,
      longitude = -7.5898,
      radarMessage = "راك دايز من حدانا! دوز مرحبا بيك، الكارط ديالك واجدة.",
      googleMapsUrl,
      plan = "GROWTH",
      credits = 1000,
      autoWinback = true,
      autoBirthday = true,
      autoReview = true,
      autoRadar = true,
      autoNearReward = false,
      isActive = true,
    } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "اسم المحل مطلوب" },
        { status: 400 }
      );
    }

    // Generate safe slug
    let generatedSlug = (customSlug || name)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!generatedSlug || generatedSlug === "") {
      generatedSlug = `merchant-${Date.now().toString(36)}`;
    }

    // Check slug collision
    const existing = await prisma.merchant.findUnique({
      where: { slug: generatedSlug },
    });
    if (existing) {
      generatedSlug = `${generatedSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const merchant = await prisma.merchant.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        niche,
        city,
        phone,
        pinCode: pinCode ? String(pinCode).slice(0, 8) : "1234",
        logoIcon,
        primaryColor,
        bgGradient,
        stampsRequired: Number(stampsRequired) || 5,
        rewardName,
        customerPrefix,
        latitude: latitude ? parseFloat(String(latitude)) : null,
        longitude: longitude ? parseFloat(String(longitude)) : null,
        radarMessage,
        googleMapsUrl,
        plan,
        credits: Number(credits) || 0,
        autoWinback: Boolean(autoWinback),
        autoBirthday: Boolean(autoBirthday),
        autoReview: Boolean(autoReview),
        autoRadar: Boolean(autoRadar),
        autoNearReward: Boolean(autoNearReward),
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json(merchant, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating merchant:", error);
    const msg = error instanceof Error ? error.message : "تعذر إنشاء المحل";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


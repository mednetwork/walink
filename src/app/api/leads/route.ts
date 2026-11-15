import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, leads });
  } catch (error: unknown) {
    console.error("Error fetching leads:", error);
    const msg = error instanceof Error ? error.message : "تعذر جلب الطلبات";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      shopName,
      niche = "cafe",
      city = "الدار البيضاء",
      phone = "",
      plan = "growth",
      price = "2,400",
      usedDemo = false,
    } = body;

    if (!shopName || typeof shopName !== "string" || shopName.trim() === "") {
      return NextResponse.json(
        { ok: false, error: "اسم المحل التجاري مطلوب" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        shopName: shopName.trim(),
        niche: String(niche).toLowerCase(),
        city: String(city).trim(),
        phone: phone ? String(phone).trim() : null,
        plan: String(plan).toLowerCase(),
        price: String(price),
        usedDemo: Boolean(usedDemo),
        status: "NEW",
      },
    });

    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating lead:", error);
    const msg = error instanceof Error ? error.message : "تعذر تسجيل الطلب";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, status, action } = body;

    if (!leadId) {
      return NextResponse.json(
        { ok: false, error: "معرف الطلب مطلوب" },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    // Convert Lead directly to a live Merchant in 1-Click
    if (action === "CONVERT") {
      // Generate clean unique slug
      const baseSlug = lead.shopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `shop-${Date.now().toString().slice(-4)}`;

      let uniqueSlug = baseSlug;
      let counter = 1;
      while (await prisma.merchant.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Determine niche defaults
      let primaryColor = "#10B981";
      let rewardName = "قهوة فابور";
      let customerPrefix = "السي/للا";

      switch (lead.niche.toLowerCase()) {
        case "barber":
          primaryColor = "#3B82F6";
          rewardName = "حسانة فابور";
          customerPrefix = "السي";
          break;
        case "snack":
          primaryColor = "#F59E0B";
          rewardName = "وجبة فابور";
          customerPrefix = "السي/للا";
          break;
        case "carwash":
          primaryColor = "#06B6D4";
          rewardName = "غسلة فابور";
          customerPrefix = "السي/للا";
          break;
        case "beauty":
          primaryColor = "#EC4899";
          rewardName = "سوان فابور";
          customerPrefix = "للا";
          break;
        case "laundry":
          primaryColor = "#8B5CF6";
          rewardName = "تصبين فابور";
          customerPrefix = "السي/للا";
          break;
        case "other":
          primaryColor = "#10B981";
          rewardName = "كادو فابور";
          customerPrefix = "الزبون المحترم";
          break;
        default:
          primaryColor = "#10B981";
          rewardName = "قهوة فابور";
          customerPrefix = "السي/للا";
          break;
      }

      const planUpper = (lead.plan || "growth").toUpperCase();
      const credits =
        planUpper === "STARTER" ? 200 : planUpper === "MULTI" ? 3000 : 1000;

      // Create Merchant
      const merchant = await prisma.merchant.create({
        data: {
          slug: uniqueSlug,
          name: lead.shopName,
          niche: lead.niche,
          city: lead.city,
          phone: lead.phone || "0600000000",
          primaryColor,
          stampsRequired: 5,
          rewardName,
          customerPrefix,
          credits,
          plan: planUpper === "MULTI" ? "MULTI" : planUpper === "STARTER" ? "STARTER" : "GROWTH",
          pinCode: "1234",
          isActive: true,
          autoWinback: true,
          autoNearReward: true,
          autoBirthday: true,
          autoRadar: true,
          autoReview: true,
          radarMessage: `راك قريب من ${lead.shopName}! الكارط ديالك واجدة 🎁`,
        },
      });

      // Create a demo customer with 1 welcome stamp
      const random4Digit = Math.floor(1000 + Math.random() * 9000).toString();
      const passSerial = `pass-${uniqueSlug}-${random4Digit}`;
      await prisma.customer.create({
        data: {
          merchantId: merchant.id,
          name: "كريم بناني",
          phone: "0661234567",
          memberCode: random4Digit,
          passSerial,
          stamps: 1,
          totalVisits: 1,
          walletType: "WEBPASS",
          transactions: {
            create: {
              merchantId: merchant.id,
              type: "CARD_CREATED",
              stampsDelta: 1,
              note: "تسجيل أولي + طابع الترحيب هدية",
            },
          },
        },
      });

      // Mark Lead as CONVERTED
      const updatedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: { status: "CONVERTED" },
      });

      return NextResponse.json({
        ok: true,
        message: `تم تحويل الطلب إلى محل مفعّل بنجاح: ${merchant.name}`,
        lead: updatedLead,
        merchant,
      });
    }

    // Standard Status Update
    if (status) {
      const updatedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: { status },
      });
      return NextResponse.json({ ok: true, lead: updatedLead });
    }

    return NextResponse.json(
      { ok: false, error: "لا يوجد إجراء محدد للتنفيذ" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error updating/converting lead:", error);
    const msg = error instanceof Error ? error.message : "فشل تحديث الطلب";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}


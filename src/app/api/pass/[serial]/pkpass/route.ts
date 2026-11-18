import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const { serial } = params;
    const urlLang = req.nextUrl.searchParams.get("lang");
    const acceptLang = req.headers.get("accept-language") || "";

    let locale = "ar";
    if (urlLang === "fr" || (!urlLang && acceptLang.toLowerCase().includes("fr"))) {
      locale = "fr";
    } else if (urlLang === "es" || (!urlLang && acceptLang.toLowerCase().includes("es"))) {
      locale = "es";
    } else if (urlLang === "ar") {
      locale = "ar";
    }

    const customer = await prisma.customer.findUnique({
      where: { passSerial: serial },
      include: {
        merchant: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "البطاقة غير موجودة" },
        { status: 404 }
      );
    }

    const { merchant } = customer;

    // Convert hex color to rgb string for Apple Wallet (e.g. "rgb(91, 53, 25)")
    const hexToRgb = (hex: string) => {
      const cleaned = hex.replace("#", "");
      if (cleaned.length === 6) {
        const r = parseInt(cleaned.substring(0, 2), 16);
        const g = parseInt(cleaned.substring(2, 4), 16);
        const b = parseInt(cleaned.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      return "rgb(22, 31, 48)";
    };

    const bgColor = hexToRgb(merchant.primaryColor || "#5b3519");
    const origin = req.nextUrl.origin || "https://walink.ma";

    const isCashback = customer.loyaltyType === "CASHBACK";
    const currency = merchant.currency || "DH";

    // Parse multi-zone geofencing locations (up to 10 zones per Apple PassKit spec)
    let parsedZones: Array<{ name: string; lat: number; lng: number; message?: string }> = [];
    try {
      if (merchant.radarZones) {
        parsedZones = JSON.parse(merchant.radarZones);
      }
    } catch {
      parsedZones = [];
    }

    const locationsList = [];
    if (merchant.latitude && merchant.longitude) {
      locationsList.push({
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        relevantText:
          merchant.radarMessage ||
          (locale === "ar"
            ? "أنت بالقرب منا! تفضل بزيارتنا، بطاقتك ومكافآتك جاهزة."
            : locale === "fr"
            ? "Vous êtes tout près ! Passez nous voir, votre carte vous attend."
            : "¡Estás muy cerca! Pasa a visitarnos, tus beneficios te esperan."),
        maxDistance: 100,
      });
    }

    for (const z of parsedZones) {
      if (locationsList.length >= 10) break;
      if (z.lat && z.lng) {
        locationsList.push({
          latitude: Number(z.lat),
          longitude: Number(z.lng),
          relevantText: z.message || `${z.name} - ${merchant.name}`,
          maxDistance: 100,
        });
      }
    }

    // Localized Apple Pass strings
    const passStrings = {
      description:
        locale === "ar"
          ? `بطاقة ولاء - ${merchant.name}`
          : locale === "fr"
          ? `Carte de fidélité - ${merchant.name}`
          : `Tarjeta de fidelidad - ${merchant.name}`,
      headerLabel: isCashback
        ? locale === "ar"
          ? "نسبة الاسترداد"
          : "CASHBACK"
        : locale === "ar"
        ? "الأختام"
        : locale === "fr"
        ? "TAMPONS"
        : "SELLOS",
      headerValue: isCashback
        ? `${merchant.cashbackRate}%`
        : `${customer.stamps} / ${merchant.stampsRequired}`,
      primaryLabel: isCashback
        ? locale === "ar"
          ? "الرصيد المتاح"
          : locale === "fr"
          ? "SOLDE DISPONIBLE"
          : "SALDO DISPONIBLE"
        : locale === "ar"
        ? "المكافأة القادمة"
        : locale === "fr"
        ? "RÉCOMPENSE"
        : "RECOMPENSA",
      primaryValue: isCashback
        ? `${Number(customer.cashbackBalance || 0).toFixed(2)} ${currency}`
        : merchant.rewardName,
      changeMsg: isCashback
        ? locale === "ar"
          ? "تم تحديث رصيدك: %@"
          : locale === "fr"
          ? "Solde fidélité mis à jour : %@"
          : "Saldo actualizado: %@"
        : locale === "ar"
        ? "تمت إضافة ختم جديد! مجموع أختامك: %@"
        : locale === "fr"
        ? "Nouveau tampon ajouté ! Total : %@"
        : "¡Nuevo sello añadido! Total: %@",
      holderLabel:
        locale === "ar"
          ? "حامل البطاقة"
          : locale === "fr"
          ? "Titulaire"
          : "Titular",
      memberLabel:
        locale === "ar"
          ? "رقم العضوية"
          : locale === "fr"
          ? "N° Membre"
          : "N° Socio",
      aboutLabel:
        locale === "ar"
          ? "عن المتجر"
          : locale === "fr"
          ? "À propos"
          : "Acerca del comercio",
      termsLabel:
        locale === "ar"
          ? "الشروط والأحكام"
          : locale === "fr"
          ? "Conditions"
          : "Condiciones",
      termsValue: isCashback
        ? locale === "ar"
          ? `استرجع ${merchant.cashbackRate}% من قيمة كل فاتورة كرصيد متاح للاستخدام في مشترياتك القادمة.`
          : locale === "fr"
          ? `Récupérez ${merchant.cashbackRate}% du montant de chaque achat en solde fidélité déductible.`
          : `Recupera el ${merchant.cashbackRate}% de cada compra en saldo para tus próximas visitas.`
        : locale === "ar"
        ? `اجمع ${merchant.stampsRequired} أختام واستفد فورياً من ${merchant.rewardName}. صالحة بدون تاريخ انتهاء.`
        : locale === "fr"
        ? `Cumulez ${merchant.stampsRequired} tampons et profitez de ${merchant.rewardName} offert.`
        : `Acumula ${merchant.stampsRequired} sellos y disfruta de ${merchant.rewardName} gratis.`,
    };

    // Official Apple Wallet PassKit storeCard Schema
    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || "pass.ma.walink.loyalty",
      serialNumber: customer.passSerial,
      teamIdentifier: process.env.APPLE_TEAM_ID || "WALINKMA01",
      webServiceURL: `${origin}/api/apple`,
      authenticationToken: customer.passSerial,
      organizationName: merchant.name,
      description: passStrings.description,
      logoText: merchant.name,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: bgColor,
      labelColor: isCashback ? "rgb(251, 191, 36)" : "rgb(52, 211, 153)",
      // Multi-Zone Geofencing Radar Locations (Up to 10 zones)
      locations: locationsList,
      // High-resolution scannable barcode
      barcodes: [
        {
          format: "PKBarcodeFormatQR",
          message: `WALINK:${customer.passSerial}`,
          messageEncoding: "iso-8859-1",
          altText: `WALINK #${customer.memberCode}`,
        },
      ],
      barcode: {
        format: "PKBarcodeFormatQR",
        message: `WALINK:${customer.passSerial}`,
        messageEncoding: "iso-8859-1",
        altText: `WALINK #${customer.memberCode}`,
      },
      storeCard: {
        headerFields: [
          {
            key: "program_header",
            label: passStrings.headerLabel,
            value: passStrings.headerValue,
            textAlignment: "PKTextAlignmentRight",
          },
        ],
        primaryFields: [
          {
            key: "main_field",
            label: passStrings.primaryLabel,
            value: passStrings.primaryValue,
            changeMessage: passStrings.changeMsg,
          },
        ],
        secondaryFields: [
          {
            key: "customer_name",
            label: passStrings.holderLabel,
            value: customer.name,
          },
          {
            key: "member_code",
            label: passStrings.memberLabel,
            value: `#${customer.memberCode}`,
            textAlignment: "PKTextAlignmentRight",
          },
        ],
        backFields: [
          {
            key: "shop_info",
            label: passStrings.aboutLabel,
            value: `${merchant.name} - ${merchant.city}`,
          },
          ...(merchant.menuUrl
            ? [
                {
                  key: "menu_url",
                  label: "Digital Menu",
                  value: merchant.menuUrl,
                },
              ]
            : []),
          ...(merchant.phone
            ? [
                {
                  key: "whatsapp_contact",
                  label: "WhatsApp",
                  value: `https://wa.me/${merchant.phone.replace(/\D/g, "")}`,
                },
              ]
            : []),
          ...(merchant.instagramUrl
            ? [
                {
                  key: "instagram",
                  label: "Instagram",
                  value: merchant.instagramUrl,
                },
              ]
            : []),
          {
            key: "terms",
            label: passStrings.termsLabel,
            value: merchant.termsText || passStrings.termsValue,
          },
          {
            key: "support",
            label: "Walink",
            value: "walink.ma - Smart Digital Loyalty Cards",
          },
        ],
      },
    };

    return NextResponse.json({
      mode: "smart_pass",
      customerName: customer.name,
      merchantName: merchant.name,
      loyaltyType: customer.loyaltyType,
      passSerial: customer.passSerial,
      memberCode: customer.memberCode,
      geofence: {
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        radarMessage: merchant.radarMessage,
        radiusMeters: 100,
      },
      passJson,
    });
  } catch (error: unknown) {
    console.error("Error generating pass JSON:", error);
    const msg = error instanceof Error ? error.message : "تعذر توليد ملف المحفظة";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

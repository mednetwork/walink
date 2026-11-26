import fs from "fs";
import path from "path";
import crypto from "crypto";
import http2 from "http2";
import { PKPass } from "passkit-generator";
import prisma from "@/lib/prisma";
import { buildDeduplicatedRadarLocations } from "@/lib/radar";
import { formatStamps, roundStamps, runWithBoundedConcurrency } from "@/lib/utils";
import { renderStampsStripPng } from "@/lib/stamps-png";

export interface AppleWalletConfig {
  isConfigured: boolean;
  passTypeIdentifier: string;
  teamIdentifier: string;
  keyId: string;
  webServiceUrl: string;
  signerCert: Buffer | null;
  signerKey: Buffer | null;
  wwdrCert: Buffer | null;
  authKeyP8: string | null;
}

export interface CustomerPassData {
  id: string;
  name: string;
  memberCode: string;
  passSerial: string;
  stamps: number;
  loyaltyType?: string | null;
  cashbackBalance?: number | null;
  totalCashbackEarned?: number | null;
  totalVisits?: number | null;
  rewardsRedeemed?: number | null;
  isVip?: boolean | null;
  isActivated?: boolean | null;
  applePushToken?: string | null;
  updatedAt?: Date | string | null;
  latestPromoMessage?: {
    title: string;
    body: string;
    createdAt?: Date | string | null;
  } | null;
}

export interface MerchantPassData {
  id: string;
  slug: string;
  name: string;
  niche?: string | null;
  logoIcon?: string | null;
  city?: string | null;
  phone?: string | null;
  primaryColor?: string | null;
  plan?: string | null;
  autoRadar?: boolean | null;
  stampsRequired: number;
  rewardName: string;
  loyaltyMode?: string | null;
  cashbackRate?: number | null;
  vipVisitsThreshold?: number | null;
  vipCashbackBonus?: number | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radarMessage?: string | null;
  radarZones?: string | null;
  googleMapsUrl?: string | null;
  menuUrl?: string | null;
  instagramUrl?: string | null;
  termsText?: string | null;
}

/**
 * Loads Apple Wallet configuration from filesystem or environment variables (Base64)
 */
export function getAppleWalletConfig(): AppleWalletConfig {
  const passTypeIdentifier =
    process.env.APPLE_PASS_TYPE_ID?.trim() || "pass.ma.walink.loyalty";
  const teamIdentifier =
    process.env.APPLE_TEAM_ID?.trim() || "ZNM6JZ2DD4";
  const keyId = process.env.APPLE_KEY_ID?.trim() || "69CLS94YY8";
  const webServiceUrl =
    process.env.APPLE_WEB_SERVICE_URL?.trim() ||
    (process.env.NODE_ENV === "production"
      ? "https://wclient.walink.ma/api/apple"
      : "https://walink.ma/api/apple");

  const cwd = process.cwd();

  // Helper to extract environment variable values that might be split across multiple chunks (e.g. <= 1000 chars)
  const getChunkedOrDirectEnv = (baseKey: string): string => {
    let combined = "";
    for (let i = 1; i <= 10; i++) {
      const raw = process.env[`${baseKey}_${i}`];
      if (!raw) continue;
      let chunk = raw.trim();
      if (
        (chunk.startsWith('"') && chunk.endsWith('"')) ||
        (chunk.startsWith("'") && chunk.endsWith("'"))
      ) {
        chunk = chunk.slice(1, -1);
      }
      combined += chunk.trim();
    }
    if (combined) {
      return combined.replace(/[^A-Za-z0-9+/=]/g, "");
    }
    let direct = (process.env[baseKey] || "").trim();
    if (
      (direct.startsWith('"') && direct.endsWith('"')) ||
      (direct.startsWith("'") && direct.endsWith("'"))
    ) {
      direct = direct.slice(1, -1);
    }
    return direct.replace(/[^A-Za-z0-9+/=]/g, "");
  };

  // Helper to read buffer from base64 env (chunked or direct) or file fallback
  const loadBuffer = (
    filePathEnv: string | undefined,
    base64EnvKey: string,
    defaultRelPath: string
  ): Buffer | null => {
    const b64 = getChunkedOrDirectEnv(base64EnvKey);
    if (b64) {
      try {
        const buf = Buffer.from(b64, "base64");
        if (buf.length > 500) {
          return buf;
        }
      } catch {
        // Fallback
      }
    }
    const resolvedPath = filePathEnv?.trim() || path.join(cwd, defaultRelPath);
    if (fs.existsSync(resolvedPath)) {
      try {
        return fs.readFileSync(resolvedPath);
      } catch {
        // Fallback
      }
    }
    return null;
  };

  const signerCert = loadBuffer(
    process.env.APPLE_PASS_CERT_PATH,
    "APPLE_SIGNER_CERT_BASE64",
    "certificates/apple/pass.pem"
  );

  const signerKey = loadBuffer(
    process.env.APPLE_PASS_KEY_PATH,
    "APPLE_SIGNER_KEY_BASE64",
    "certificates/apple/walink_pass.key"
  );

  const wwdrCert = loadBuffer(
    process.env.APPLE_WWDR_CERT_PATH,
    "APPLE_WWDR_CERT_BASE64",
    "certificates/apple/AppleWWDRCAG4.pem"
  );

  let authKeyP8: string | null = null;
  const authKeyB64 = getChunkedOrDirectEnv("APPLE_AUTH_KEY_P8_BASE64");
  if (authKeyB64) {
    try {
      authKeyP8 = Buffer.from(authKeyB64, "base64").toString("utf8");
    } catch {
      authKeyP8 = null;
    }
  }
  if (!authKeyP8) {
    const p8Path =
      process.env.APPLE_AUTH_KEY_PATH?.trim() ||
      path.join(cwd, "certificates/apple/AuthKey_69CLS94YY8.p8");
    if (fs.existsSync(p8Path)) {
      try {
        authKeyP8 = fs.readFileSync(p8Path, "utf8");
      } catch {
        authKeyP8 = null;
      }
    }
  }

  const isConfigured = Boolean(
    passTypeIdentifier &&
      teamIdentifier &&
      signerCert &&
      signerKey &&
      wwdrCert
  );

  return {
    isConfigured,
    passTypeIdentifier,
    teamIdentifier,
    keyId,
    webServiceUrl,
    signerCert,
    signerKey,
    wwdrCert,
    authKeyP8,
  };
}

// In-memory cache for pass graphic assets to ensure high performance
let cachedAssets: Record<string, Buffer> | null = null;

function getPassAssets(): Record<string, Buffer> {
  if (cachedAssets) return cachedAssets;

  const cwd = process.cwd();
  const assetsDir = path.join(cwd, "public", "apple-pass-assets");
  const assetFiles = [
    "icon.png",
    "icon@2x.png",
    "icon@3x.png",
    "logo.png",
    "logo@2x.png",
    "logo@3x.png",
  ];

  const loaded: Record<string, Buffer> = {};
  for (const filename of assetFiles) {
    const filePath = path.join(assetsDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        loaded[filename] = fs.readFileSync(filePath);
      } catch {
        // Continue loading other assets
      }
    }
  }

  cachedAssets = loaded;
  return cachedAssets;
}

/**
 * Converts hex color to rgb string (e.g. #5b3519 -> rgb(91, 53, 25))
 */
function hexToRgb(hex?: string | null): string {
  if (!hex) return "rgb(22, 31, 48)";
  const cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return "rgb(22, 31, 48)";
}

/**
 * Generates an official signed Apple Wallet (.pkpass) binary buffer
 */
export async function generateApplePass(
  customer: CustomerPassData,
  merchant: MerchantPassData,
  locale = "ar"
): Promise<Buffer> {
  const config = getAppleWalletConfig();

  if (
    !config.isConfigured ||
    !config.signerCert ||
    !config.signerKey ||
    !config.wwdrCert
  ) {
    throw new Error(
      "Apple Wallet credentials not configured (certificates or keys missing)"
    );
  }

  const baseAssets = getPassAssets();
  const isCashback = customer.loyaltyType === "CASHBACK";
  const currency = merchant.currency || "DH";
  const bgColor = hexToRgb(merchant.primaryColor || "#5b3519");

  // Visual Stamp Progress & Status Calculations (supports 0.5 half-stamps with ◐)
  const isUnactivated = customer.isActivated === false;
  const stampsRequired = Math.max(1, merchant.stampsRequired || 5);
  const currentStamps = isUnactivated ? 0 : roundStamps(customer.stamps || 0);
  const formattedStamps = formatStamps(currentStamps);
  const isStampsFull = !isCashback && !isUnactivated && currentStamps >= stampsRequired;
  const stampsRemaining = Math.max(0, roundStamps(stampsRequired - currentStamps));
  const formattedRemaining = formatStamps(stampsRemaining);

  const assets: Record<string, Buffer> = { ...baseAssets };
  if (!isCashback) {
    const stripOptions = {
      primaryColor: merchant.primaryColor,
      stamps: currentStamps,
      stampsRequired,
      isCashback: false,
      isVip: Boolean(customer.isVip),
      isActivated: !isUnactivated,
      totalVisits: customer.totalVisits || 0,
      vipVisitsThreshold: merchant.vipVisitsThreshold || 10,
      iconOrNiche: merchant.logoIcon || merchant.niche,
    };
    assets["strip.png"] = renderStampsStripPng({ ...stripOptions, width: 375, height: 144 });
    assets["strip@2x.png"] = renderStampsStripPng({ ...stripOptions, width: 750, height: 288 });
    assets["strip@3x.png"] = renderStampsStripPng({ ...stripOptions, width: 1125, height: 432 });
  }

  let stampsProgressDisplay = `${formattedStamps} / ${stampsRequired}`;
  if (isUnactivated) {
    const dots = "○".repeat(Math.min(stampsRequired, 5));
    stampsProgressDisplay = `${dots} (0/${stampsRequired})`;
  } else if (stampsRequired <= 10) {
    const clamped = Math.max(0, Math.min(stampsRequired, currentStamps));
    const fullCount = Math.floor(clamped);
    const hasHalf = clamped - fullCount >= 0.25 && fullCount < stampsRequired;
    const remainingCount = Math.max(0, stampsRequired - fullCount - (hasHalf ? 1 : 0));
    const dots = "●".repeat(fullCount) + (hasHalf ? "◐" : "") + "○".repeat(remainingCount);
    stampsProgressDisplay = `${dots} (${formattedStamps}/${stampsRequired})`;
  }

  // Localized PassKit Field Strings
  const passStrings = {
    description:
      locale === "ar"
        ? `بطاقة ولاء - ${merchant.name}`
        : locale === "fr"
        ? `Carte de fidélité - ${merchant.name}`
        : `Tarjeta de fidelidad - ${merchant.name}`,
    headerLabel: isCashback
      ? locale === "ar"
        ? "الرصيد"
        : locale === "fr"
        ? "SOLDE"
        : "SALDO"
      : locale === "ar"
      ? "الأختام"
      : locale === "fr"
      ? "TAMPONS"
      : "SELLOS",
    headerValue: isCashback
      ? `${Number(customer.cashbackBalance || 0).toFixed(2)} ${currency}`
      : `${formattedStamps} / ${stampsRequired}`,
    primaryLabel: isUnactivated
      ? locale === "ar"
        ? "الهدية الأولى"
        : locale === "fr"
        ? "PREMIER CADEAU"
        : "PRIMER REGALO"
      : isCashback
      ? locale === "ar"
        ? "الرصيد المتاح"
        : locale === "fr"
        ? "SOLDE DISPONIBLE"
        : "SALDO DISPONIBLE"
      : locale === "ar"
      ? "المكافأة القادمة"
      : locale === "fr"
      ? "PROCHAINE RÉCOMPENSE"
      : "PRÓXIMA RECOMPENSA",
    primaryValue: isUnactivated
      ? locale === "ar"
        ? "زرنا لتفعيل هديتك الأولى 🎁"
        : locale === "fr"
        ? "Visitez-nous pour l'activer 🎁"
        : "¡Visítenos para activar! 🎁"
      : isCashback
      ? `${Number(customer.cashbackBalance || 0).toFixed(2)} ${currency}`
      : isStampsFull
      ? `🎉 ${merchant.rewardName} ${locale === "ar" ? "(جاهزة للاستلام!)" : locale === "fr" ? "(Prête !)" : "(¡Lista!)"}`
      : merchant.rewardName,
    changeMsg: isCashback
      ? locale === "ar"
        ? "تم تحديث رصيدك: %@"
        : locale === "fr"
        ? "Solde fidélité mis à jour : %@"
        : "Saldo actualizado: %@"
      : locale === "ar"
      ? "المكافأة: %@"
      : locale === "fr"
      ? "Récompense : %@"
      : "Recompensa: %@",
    holderLabel:
      locale === "ar"
        ? "حامل البطاقة"
        : locale === "fr"
        ? "TITULAIRE"
        : "TITULAR",
    progressLabel:
      locale === "ar"
        ? "التقدم"
        : locale === "fr"
        ? "PROGRESSION"
        : "PROGRESO",
    statusLabel:
      locale === "ar"
        ? "الحالة"
        : locale === "fr"
        ? "STATUT"
        : "ESTADO",
    statusValue: isUnactivated
      ? locale === "ar"
        ? "بانتظار زيارتك الأولى"
        : locale === "fr"
        ? "En attente de visite"
        : "Esperando primera visita"
      : isCashback
      ? customer.isVip
        ? "👑 VIP GOLD"
        : locale === "ar"
        ? "نشط"
        : locale === "fr"
        ? "Actif"
        : "Activo"
      : isStampsFull
      ? locale === "ar"
        ? "🎁 جاهزة للاستلام!"
        : locale === "fr"
        ? "🎁 Récompense prête !"
        : "🎁 ¡Recompensa lista!"
      : locale === "ar"
      ? `باقي ${formattedRemaining} أختام`
      : locale === "fr"
      ? `Reste ${formattedRemaining} tampons`
      : `Quedan ${formattedRemaining} sellos`,
    cashbackRateLabel:
      locale === "ar"
        ? "نسبة الكاش باك"
        : locale === "fr"
        ? "TAUX CASHBACK"
        : "TASA CASHBACK",
    totalSavedLabel:
      locale === "ar"
        ? "إجمالي التوفير"
        : locale === "fr"
        ? "TOTAL ÉCONOMISÉ"
        : "TOTAL AHORRADO",
    memberLabel:
      locale === "ar"
        ? "رقم العضوية"
        : locale === "fr"
        ? "N° MEMBRE"
        : "N° SOCIO",
    tierLabel:
      locale === "ar"
        ? "الفئة"
        : locale === "fr"
        ? "NIVEAU"
        : "NIVEL",
    tierValue: customer.isVip
      ? "👑 VIP GOLD"
      : locale === "ar"
      ? "عضو قياسي"
      : locale === "fr"
      ? "Membre Standard"
      : "Miembro Estándar",
    visitsLabel:
      locale === "ar"
        ? "الزيارات"
        : locale === "fr"
        ? "VISITES"
        : "VISITAS",
    offerLabel:
      locale === "ar"
        ? "تفاصيل العرض والمكافأة"
        : locale === "fr"
        ? "Détails de l'offre"
        : "Detalles de la oferta",
    offerValue: isCashback
      ? locale === "ar"
        ? `استرجع ${merchant.cashbackRate || 10}% من قيمة كل فاتورة كرصيد متاح للاستخدام في مشترياتك القادمة.`
        : locale === "fr"
        ? `Recevez ${merchant.cashbackRate || 10}% du montant de chaque achat en solde fidélité pour vos prochaines visites.`
        : `Recibe el ${merchant.cashbackRate || 10}% de cada compra en saldo para tus próximas visitas.`
      : locale === "ar"
      ? `اجمع ${stampsRequired} أختام واحصل فوراً على ${merchant.rewardName}. كل زيارة أو طلب يمنحك ختماً إضافياً.`
      : locale === "fr"
      ? `Cumulez ${stampsRequired} tampons pour obtenir immédiatement ${merchant.rewardName}.`
      : `Acumula ${stampsRequired} sellos para obtener ${merchant.rewardName}.`,
    storeLocationLabel:
      locale === "ar"
        ? "المتجر والفرع"
        : locale === "fr"
        ? "Établissement & Ville"
        : "Establecimiento y Ciudad",
    referralLabel:
      locale === "ar"
        ? "ادعُ أصدقاءك واكسب"
        : locale === "fr"
        ? "Invitez vos proches"
        : "Invita a tus amigos",
    termsLabel:
      locale === "ar"
        ? "الشروط والأحكام"
        : locale === "fr"
        ? "Conditions générales"
        : "Condiciones",
    termsValue:
      merchant.termsText ||
      (locale === "ar"
        ? "البطاقة شخصية وغير قابلة للتحويل. المكافآت والأرصدة غير قابلة للاستبدال نقداً. تطبق شروط المتجر."
        : "La carte de fidélité est strictement personnelle. Les récompenses et soldes ne sont pas échangeables contre des espèces. Valable dans tous les points de vente participants."),
  };

  // Build deduplicated geofencing locations (up to 10 zones)
  const locations = buildDeduplicatedRadarLocations(merchant, locale);

  // Ensure authenticationToken is at least 16 characters per Apple PassKit requirement
  const authToken = (customer.passSerial + "walink2026").padEnd(20, "0");

  const pass = new PKPass(
    assets,
    {
      signerCert: config.signerCert,
      signerKey: config.signerKey,
      wwdr: config.wwdrCert,
    },
    {
      formatVersion: 1,
      passTypeIdentifier: config.passTypeIdentifier,
      teamIdentifier: config.teamIdentifier,
      serialNumber: customer.passSerial,
      webServiceURL: config.webServiceUrl,
      authenticationToken: authToken,
      organizationName: merchant.name,
      description: passStrings.description,
      logoText: merchant.name,
      ...(locations.length > 0 ? { maxDistance: 100 } : {}),
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: bgColor,
      labelColor:
        isCashback || customer.isVip
          ? "rgb(253, 230, 138)"
          : "rgb(209, 250, 229)",
    }
  );

  pass.type = ["store", "Card"].join("") as "storeCard";

  // 1. Header Fields (Top Right Corner — Lock-Screen trigger ONLY for STAMPS)
  pass.headerFields.push({
    key: "program_header",
    label: passStrings.headerLabel,
    value: passStrings.headerValue,
    textAlignment: "PKTextAlignmentRight",
    ...(isCashback
      ? {}
      : {
          changeMessage:
            locale === "fr"
              ? "Vos tampons : %@"
              : locale === "es"
              ? "Tus sellos: %@"
              : "تم تحديث رصيد الأختام: %@",
        }),
  });

  // 2. Primary Fields: ONLY used on CASHBACK passes so STAMPS strip.png renders unobstructed
  if (isCashback) {
    pass.primaryFields.push({
      key: "cashback_balance",
      label: passStrings.primaryLabel,
      value: passStrings.primaryValue,
      changeMessage: passStrings.changeMsg,
    });
  }

  // 3. Secondary Fields (3 Clean High-Contrast Columns Guaranteed Visible Above Barcode)
  if (isCashback) {
    const effectiveRate = customer.isVip
      ? (merchant.cashbackRate || 10) + (merchant.vipCashbackBonus || 0)
      : merchant.cashbackRate || 10;
    const totalSaved = Number(
      customer.totalCashbackEarned || customer.cashbackBalance || 0
    ).toFixed(2);

    pass.secondaryFields.push({
      key: "customer_name",
      label: passStrings.holderLabel,
      value: customer.name,
      textAlignment: "PKTextAlignmentLeft",
    });

    pass.secondaryFields.push({
      key: "cashback_rate",
      label: passStrings.cashbackRateLabel,
      value: `${effectiveRate}%${customer.isVip ? " 👑" : ""}`,
      textAlignment: "PKTextAlignmentCenter",
    });

    pass.secondaryFields.push({
      key: "total_saved",
      label: passStrings.totalSavedLabel,
      value: `${totalSaved} ${currency}`,
      textAlignment: "PKTextAlignmentRight",
    });
  } else {
    pass.secondaryFields.push({
      key: "customer_name",
      label: passStrings.holderLabel,
      value: customer.name,
      textAlignment: "PKTextAlignmentLeft",
    });

    pass.secondaryFields.push({
      key: "reward_name",
      label: passStrings.primaryLabel,
      value: passStrings.primaryValue,
      textAlignment: "PKTextAlignmentCenter",
    });

    pass.secondaryFields.push({
      key: "loyalty_status",
      label: passStrings.statusLabel,
      value: passStrings.statusValue,
      textAlignment: "PKTextAlignmentRight",
    });
  }

  // 4. Auxiliary Fields (Extra Membership Details)
  pass.auxiliaryFields.push({
    key: "member_code",
    label: passStrings.memberLabel,
    value: `#${customer.memberCode}`,
    textAlignment: "PKTextAlignmentLeft",
  });

  pass.auxiliaryFields.push({
    key: "membership_tier",
    label: passStrings.tierLabel,
    value: passStrings.tierValue,
    textAlignment: "PKTextAlignmentCenter",
  });

  pass.auxiliaryFields.push({
    key: "total_visits",
    label: passStrings.visitsLabel,
    value: `${customer.totalVisits || currentStamps || 1}`,
    textAlignment: "PKTextAlignmentRight",
  });

  // 5. Back Fields (Rich Back-of-Pass Details + Single Dedicated Promo Trigger)
  const promoTitleLabel =
    locale === "fr"
      ? "Dernière offre"
      : locale === "es"
      ? "Última oferta"
      : "آخر عرض وتنبيه";
  let promoValueText =
    locale === "fr"
      ? "Découvrez nos offres exclusives ici"
      : locale === "es"
      ? "Descubre nuestras ofertas exclusivas aquí"
      : "ترقّب عروضنا الحصرية هنا";

  if (customer.latestPromoMessage?.body) {
    const cleanTitle = (customer.latestPromoMessage.title || "").trim();
    const promoPrefix =
      cleanTitle && cleanTitle !== merchant.name ? `${cleanTitle}: ` : "";
    const rawDate = customer.latestPromoMessage.createdAt
      ? new Date(customer.latestPromoMessage.createdAt)
      : null;
    const timeStampTag =
      rawDate && !isNaN(rawDate.getTime())
        ? ` (${rawDate.toISOString().slice(11, 19)})`
        : "";
    promoValueText = `${promoPrefix}${customer.latestPromoMessage.body.trim()}${timeStampTag}`;
  }

  pass.backFields.push({
    key: "latest_promo_message",
    label: promoTitleLabel,
    value: promoValueText,
    changeMessage: "📢 %@",
  });

  pass.backFields.push({
    key: "offer_details",
    label: passStrings.offerLabel,
    value: passStrings.offerValue,
  });

  pass.backFields.push({
    key: "store_location",
    label: passStrings.storeLocationLabel,
    value: `${merchant.name} - ${merchant.city || (locale === "ar" ? "المغرب" : "Maroc")}`,
  });

  if (merchant.phone) {
    const cleanPhone = merchant.phone.replace(/\D/g, "");
    pass.backFields.push({
      key: "whatsapp_contact",
      label: "WhatsApp",
      value: `https://wa.me/${cleanPhone}`,
    });
  }

  if (merchant.googleMapsUrl || (merchant.latitude && merchant.longitude)) {
    pass.backFields.push({
      key: "google_maps",
      label: "Google Maps",
      value:
        merchant.googleMapsUrl ||
        `https://maps.google.com/?q=${merchant.latitude},${merchant.longitude}`,
    });
  }

  pass.backFields.push({
    key: "referral_link",
    label: passStrings.referralLabel,
    value: `https://wjoin.walink.ma/join/${merchant.slug}?ref=${customer.memberCode}`,
  });

  if (merchant.menuUrl) {
    pass.backFields.push({
      key: "digital_menu",
      label: "Menu",
      value: merchant.menuUrl,
    });
  }

  if (merchant.instagramUrl) {
    pass.backFields.push({
      key: "instagram",
      label: "Instagram",
      value: merchant.instagramUrl,
    });
  }

  pass.backFields.push({
    key: "terms",
    label: passStrings.termsLabel,
    value: passStrings.termsValue,
  });

  pass.backFields.push({
    key: "support",
    label: merchant.name,
    value: `${merchant.name} - البطاقة الرقمية الذكية`,
  });

  // Geofencing Radar Locations
  if (locations.length > 0) {
    pass.setLocations(...locations);
  }

  // Barcode (High-resolution 2D QR Code)
  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: `WALINK:${customer.passSerial}`,
    messageEncoding: "iso-8859-1",
    altText: `WALINK #${customer.memberCode}`,
  });

  return pass.getAsBuffer();
}

/**
 * Generates an ES256 JWT for Apple Push Notification service (APNs)
 */
function createApnsToken(
  keyId: string,
  teamId: string,
  privateKey: string
): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "ES256", kid: keyId })
  ).toString("base64url");

  const payload = Buffer.from(
    JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) })
  ).toString("base64url");

  const sign = crypto.createSign("SHA256");
  sign.update(`${header}.${payload}`);
  sign.end();

  const signature = sign
    .sign({ key: privateKey, dsaEncoding: "ieee-p1363" })
    .toString("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Sends a background HTTP/2 APNs push notification to an iPhone device to silently update its Apple Wallet pass.
 * Uses mutual TLS (mTLS) with the official Pass Type ID certificate and private key, authenticated directly by Apple APNs.
 */
export async function sendApplePassUpdate(pushToken: string): Promise<boolean> {
  const config = getAppleWalletConfig();

  if (!config.signerCert || !config.signerKey) {
    console.warn(
      "[AppleWallet APNs] Missing pass certificate or private key, skipping push"
    );
    return false;
  }

  const cleanToken = pushToken.trim();
  if (!cleanToken || cleanToken === "apns-token-registered") {
    return false;
  }

  return new Promise((resolve) => {
    try {
      const { signerCert, signerKey } = config;
      if (!signerCert || !signerKey) {
        resolve(false);
        return;
      }
      // Connect to Apple APNs production gateway using mutual TLS (mTLS) with the Pass Type ID certificate
      const client = http2.connect("https://api.push.apple.com:443", {
        cert: signerCert,
        key: signerKey,
      });

      client.on("error", (err) => {
        console.warn("[AppleWallet APNs] Client error:", err.message);
        client.destroy();
        resolve(false);
      });

      const req = client.request({
        ":method": "POST",
        ":path": `/3/device/${cleanToken}`,
        "apns-topic": config.passTypeIdentifier,
      });

      req.on("response", (headers) => {
        const status = Number(headers[":status"]);
        client.close();
        if (status === 200) {
          console.log(`[AppleWallet APNs] Pass update push delivered successfully (200 OK)`);
          resolve(true);
        } else {
          console.warn(`[AppleWallet APNs] Push failed with status: ${status}`);
          resolve(false);
        }
      });

      req.on("error", (err) => {
        console.warn("[AppleWallet APNs] Request error:", err.message);
        client.destroy();
        resolve(false);
      });

      // Apple PassKit APNs push requires an empty JSON dictionary: {}
      req.write(JSON.stringify({}));
      req.end();

      // Timeout safeguard: 5 seconds
      setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 5000);
    } catch (err: unknown) {
      console.warn("[AppleWallet APNs] Exception sending push:", err);
      resolve(false);
    }
  });
}

/**
 * Updates `updatedAt` in a single batch write for all eligible Apple Wallet pass holders
 * of a merchant and dispatches non-blocking silent APNs pushes so updated GPS locations sync
 * in the background without triggering unwanted lock-screen banners.
 */
export async function syncMerchantAppleWalletLocations(merchantId: string): Promise<void> {
  const customers = await prisma.customer.findMany({
    where: {
      merchantId,
      applePushToken: { not: null },
    },
    select: {
      id: true,
      applePushToken: true,
    },
  });

  const eligibleIds: string[] = [];
  const uniqueTokens = new Set<string>();

  for (const c of customers) {
    const cleanToken = (c.applePushToken || "").trim();
    if (!cleanToken || cleanToken === "apns-token-registered") continue;
    eligibleIds.push(c.id);
    uniqueTokens.add(cleanToken);
  }

  if (eligibleIds.length === 0 || uniqueTokens.size === 0) {
    return;
  }

  await prisma.customer.updateMany({
    where: { id: { in: eligibleIds } },
    data: { updatedAt: new Date() },
  });

  const tokens = Array.from(uniqueTokens);
  void runWithBoundedConcurrency(tokens, 10, (token) =>
    sendApplePassUpdate(token).catch(() => false)
  ).catch(() => {});
}

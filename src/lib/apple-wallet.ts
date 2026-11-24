import fs from "fs";
import path from "path";
import crypto from "crypto";
import http2 from "http2";
import { PKPass } from "passkit-generator";

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
  isVip?: boolean | null;
  applePushToken?: string | null;
  updatedAt?: Date | string | null;
}

export interface MerchantPassData {
  id: string;
  name: string;
  city?: string | null;
  phone?: string | null;
  primaryColor?: string | null;
  stampsRequired: number;
  rewardName: string;
  loyaltyMode?: string | null;
  cashbackRate?: number | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radarMessage?: string | null;
  radarZones?: string | null;
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

  // Helper to read buffer from file or base64 env
  const loadBuffer = (
    filePathEnv: string | undefined,
    base64Env: string | undefined,
    defaultRelPath: string
  ): Buffer | null => {
    if (base64Env && base64Env.trim()) {
      try {
        return Buffer.from(base64Env.trim(), "base64");
      } catch {
        // Fallback
      }
    }
    const resolvedPath = filePathEnv?.trim() || path.join(cwd, defaultRelPath);
    if (fs.existsSync(resolvedPath)) {
      try {
        return fs.readFileSync(resolvedPath);
      } catch {
        return null;
      }
    }
    return null;
  };

  const signerCert = loadBuffer(
    process.env.APPLE_PASS_CERT_PATH,
    process.env.APPLE_SIGNER_CERT_BASE64,
    "certificates/apple/pass.pem"
  );

  const signerKey = loadBuffer(
    process.env.APPLE_PASS_KEY_PATH,
    process.env.APPLE_SIGNER_KEY_BASE64,
    "certificates/apple/walink_pass.key"
  );

  const wwdrCert = loadBuffer(
    process.env.APPLE_WWDR_CERT_PATH,
    process.env.APPLE_WWDR_CERT_BASE64,
    "certificates/apple/AppleWWDRCAG4.pem"
  );

  let authKeyP8: string | null = null;
  if (
    process.env.APPLE_AUTH_KEY_P8_BASE64 &&
    process.env.APPLE_AUTH_KEY_P8_BASE64.trim()
  ) {
    try {
      authKeyP8 = Buffer.from(
        process.env.APPLE_AUTH_KEY_P8_BASE64.trim(),
        "base64"
      ).toString("utf8");
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
    "strip.png",
    "strip@2x.png",
    "strip@3x.png",
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

  const assets = getPassAssets();
  const isCashback = customer.loyaltyType === "CASHBACK";
  const currency = merchant.currency || "DH";
  const bgColor = hexToRgb(merchant.primaryColor || "#5b3519");

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
        ? "نسبة الاسترداد"
        : "CASHBACK"
      : locale === "ar"
      ? "الأختام"
      : locale === "fr"
      ? "TAMPONS"
      : "SELLOS",
    headerValue: isCashback
      ? `${merchant.cashbackRate || 10}%`
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
        ? `استرجع ${merchant.cashbackRate || 10}% من قيمة كل فاتورة كرصيد متاح للاستخدام في مشترياتك القادمة.`
        : locale === "fr"
        ? `Récupérez ${merchant.cashbackRate || 10}% du montant de chaque achat en solde fidélité déductible.`
        : `Recupera el ${merchant.cashbackRate || 10}% de cada compra en saldo para tus próximas visitas.`
      : locale === "ar"
      ? `اجمع ${merchant.stampsRequired} أختام واستفد فورياً من ${merchant.rewardName}. صالحة بدون تاريخ انتهاء.`
      : locale === "fr"
      ? `Cumulez ${merchant.stampsRequired} tampons et profitez de ${merchant.rewardName} offert.`
      : `Acumula ${merchant.stampsRequired} sellos y disfruta de ${merchant.rewardName} gratis.`,
  };

  // Build Geofencing Locations (up to 10 zones)
  const locations: Array<{
    latitude: number;
    longitude: number;
    relevantText?: string;
    maxDistance?: number;
  }> = [];

  if (merchant.latitude && merchant.longitude) {
    locations.push({
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

  if (merchant.radarZones) {
    try {
      const parsed = JSON.parse(merchant.radarZones);
      if (Array.isArray(parsed)) {
        for (const z of parsed) {
          if (locations.length >= 10) break;
          if (z.lat && z.lng) {
            locations.push({
              latitude: Number(z.lat),
              longitude: Number(z.lng),
              relevantText: z.message || `${z.name} - ${merchant.name}`,
              maxDistance: 100,
            });
          }
        }
      }
    } catch {
      // Ignore radarZones JSON parse error
    }
  }

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
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: bgColor,
      labelColor: isCashback ? "rgb(251, 191, 36)" : "rgb(52, 211, 153)",
    }
  );

  pass.type = ["store", "Card"].join("") as "storeCard";

  // Header Fields
  pass.headerFields.push({
    key: "program_header",
    label: passStrings.headerLabel,
    value: passStrings.headerValue,
    textAlignment: "PKTextAlignmentRight",
  });

  // Primary Fields (Reward or Cashback Balance with Native iOS Lock-Screen changeMessage!)
  pass.primaryFields.push({
    key: "main_field",
    label: passStrings.primaryLabel,
    value: passStrings.primaryValue,
    changeMessage: passStrings.changeMsg,
  });

  // Secondary Fields
  pass.secondaryFields.push({
    key: "customer_name",
    label: passStrings.holderLabel,
    value: customer.name,
  });

  pass.secondaryFields.push({
    key: "member_code",
    label: passStrings.memberLabel,
    value: `#${customer.memberCode}`,
    textAlignment: "PKTextAlignmentRight",
  });

  if (customer.isVip) {
    pass.secondaryFields.push({
      key: "vip_tier",
      label: "TIER",
      value: "👑 VIP GOLD",
      textAlignment: "PKTextAlignmentCenter",
    });
  }

  // Back Fields
  pass.backFields.push({
    key: "shop_info",
    label: passStrings.aboutLabel,
    value: `${merchant.name} - ${merchant.city || "المغرب"}`,
  });

  if (merchant.phone) {
    pass.backFields.push({
      key: "whatsapp_contact",
      label: "WhatsApp",
      value: `https://wa.me/${merchant.phone.replace(/\D/g, "")}`,
    });
  }

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
    value: merchant.termsText || passStrings.termsValue,
  });

  pass.backFields.push({
    key: "support",
    label: "Walink",
    value: "walink.ma - Smart Digital Loyalty Cards",
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
 * Sends a background HTTP/2 APNs push notification to an iPhone device to silently update its Apple Wallet pass
 */
export async function sendApplePassUpdate(pushToken: string): Promise<boolean> {
  const config = getAppleWalletConfig();

  if (!config.authKeyP8 || !config.keyId || !config.teamIdentifier) {
    console.warn(
      "[AppleWallet APNs] Missing APNs auth key or credentials, skipping push"
    );
    return false;
  }

  const cleanToken = pushToken.trim();
  if (!cleanToken || cleanToken === "apns-token-registered") {
    return false;
  }

  return new Promise((resolve) => {
    try {
      const jwtToken = createApnsToken(
        config.keyId,
        config.teamIdentifier,
        config.authKeyP8!
      );

      const client = http2.connect("https://api.push.apple.com:443");

      client.on("error", (err) => {
        console.warn("[AppleWallet APNs] Client error:", err.message);
        client.destroy();
        resolve(false);
      });

      const req = client.request({
        ":method": "POST",
        ":path": `/3/device/${cleanToken}`,
        authorization: `bearer ${jwtToken}`,
        "apns-topic": config.passTypeIdentifier,
        "apns-push-type": "background",
        "apns-priority": "5",
      });

      req.on("response", (headers) => {
        const status = Number(headers[":status"]);
        client.close();
        if (status === 200) {
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

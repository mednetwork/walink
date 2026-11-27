import crypto from "crypto";
import { buildDeduplicatedRadarLocations } from "@/lib/radar";
import { formatStamps, roundStamps } from "@/lib/utils";

export interface GoogleWalletConfig {
  isConfigured: boolean;
  issuerId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Normalizes and extracts Google Wallet credentials from environment variables.
 * Handles escaped newlines (\n) and surrounding quotes for cross-platform/host compatibility.
 */
export function getGoogleWalletConfig(): GoogleWalletConfig {
  const issuerId = (process.env.GOOGLE_WALLET_ISSUER_ID || "").trim();
  const clientEmail = (process.env.GOOGLE_WALLET_CLIENT_EMAIL || "").trim();
  let privateKey = (process.env.GOOGLE_WALLET_PRIVATE_KEY || "").trim();

  // Strip wrapping quotes if provided in .env
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }

  // Normalize literal \n to actual newline characters
  privateKey = privateKey.replace(/\\n/g, "\n");

  const isConfigured = Boolean(
    issuerId &&
    clientEmail &&
    privateKey &&
    privateKey.includes("BEGIN PRIVATE KEY")
  );

  return {
    isConfigured,
    issuerId,
    clientEmail,
    privateKey,
  };
}

/**
 * Sanitizes resource IDs to adhere strictly to Google Wallet API rules: [a-zA-Z0-9._-]
 */
export function sanitizeResourceId(str: string): string {
  if (!str) return "walink_default";
  return str.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Base64URL encoder without padding
 */
function base64UrlEncode(data: string | Buffer): string {
  return Buffer.from(data).toString("base64url");
}

/**
 * Native RS256 JWT Signer using Node.js crypto module. Zero external dependencies.
 */
export function signGoogleJwt(
  payload: Record<string, unknown>,
  clientEmail: string,
  privateKey: string
): string {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(message);
  signer.end();

  const signatureBuf = signer.sign(privateKey);
  const signature = signatureBuf.toString("base64url");
  return `${message}.${signature}`;
}

export interface MerchantPassModel {
  id: string;
  slug: string;
  name: string;
  niche?: string | null;
  logoIcon?: string | null;
  primaryColor?: string | null;
  plan?: string | null;
  autoRadar?: boolean | null;
  currency?: string | null;
  stampsRequired: number;
  rewardName: string;
  loyaltyMode?: string | null;
  cashbackRate?: number | null;
  welcomeCashback?: number | null;
  vipVisitsThreshold?: number | null;
  vipCashbackBonus?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  radarMessage?: string | null;
  radarZones?: string | null;
  googleMapsUrl?: string | null;
  menuUrl?: string | null;
  instagramUrl?: string | null;
  phone?: string | null;
  termsText?: string | null;
}

export interface CustomerPassModel {
  id: string;
  merchantId: string;
  name: string;
  phone: string;
  passSerial: string;
  memberCode: string;
  stamps: number;
  loyaltyType: string;
  cashbackBalance: number;
  totalCashbackEarned?: number | null;
  totalSpent?: number | null;
  totalVisits: number;
  isVip: boolean;
  isActivated?: boolean | null;
  walletType?: string | null;
}

/**
 * Builds the official Google Wallet LoyaltyClass representation for a merchant.
 */
export function buildLoyaltyClass(
  merchant: MerchantPassModel,
  locale: string = "ar"
): Record<string, unknown> {
  const { issuerId } = getGoogleWalletConfig();
  const classId = `${issuerId}.merchant_${sanitizeResourceId(merchant.slug)}`;

  // Clean hex background color
  let hexColor = (merchant.primaryColor || "#008069").trim();
  if (!hexColor.startsWith("#")) hexColor = `#${hexColor}`;
  if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) {
    hexColor = "#008069";
  }

  // Parse deduplicated Geofencing Locations (up to 10 points)
  const locationsList = buildDeduplicatedRadarLocations(merchant, locale).map((loc) => ({
    kind: "walletobjects#latLongPoint",
    latitude: loc.latitude,
    longitude: loc.longitude,
  }));

  // Public Links Module
  const linksList: Array<{ uri: string; description: string }> = [];
  if (merchant.phone) {
    linksList.push({
      uri: `https://wa.me/${merchant.phone.replace(/\D/g, "")}`,
      description:
        locale === "fr" ? "WhatsApp" : locale === "es" ? "WhatsApp" : "محادثة واتساب",
    });
  }
  if (merchant.googleMapsUrl) {
    linksList.push({
      uri: merchant.googleMapsUrl,
      description:
        locale === "fr"
          ? "Google Maps"
          : locale === "es"
          ? "Google Maps"
          : "موقعنا في خرائط Google",
    });
  }
  if (merchant.menuUrl) {
    linksList.push({
      uri: merchant.menuUrl,
      description:
        locale === "fr" ? "Menu Digital" : locale === "es" ? "Menú Digital" : "قائمة الطلبات",
    });
  }
  if (merchant.instagramUrl) {
    linksList.push({
      uri: merchant.instagramUrl,
      description: "Instagram",
    });
  }

  // Google Wallet requires public HTTPS logo (cache-busted for new brand logo)
  const logoUrl = "https://walink.ma/icon-512.png?v=2";

  return {
    id: classId,
    issuerName: "Walink.ma",
    programName: merchant.name,
    programLogo: {
      kind: "walletobjects#image",
      sourceUri: {
        uri: logoUrl,
      },
      contentDescription: {
        defaultValue: {
          language: locale === "fr" ? "fr" : locale === "es" ? "es" : "ar",
          value: merchant.name,
        },
      },
    },
    hexBackgroundColor: hexColor,
    reviewStatus: "UNDER_REVIEW", // Enables instant creation via JWT save link
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.loyaltyPoints" }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.secondaryLoyaltyPoints" }],
                },
              },
            },
          },
        ],
      },
    },
    locations: locationsList,
    linksModuleData: linksList.length > 0 ? { uris: linksList } : undefined,
  };
}

/**
 * Builds the official Google Wallet LoyaltyObject representation for a customer pass.
 */
export function buildLoyaltyObject(
  customer: CustomerPassModel,
  merchant: MerchantPassModel,
  locale: string = "ar"
): Record<string, unknown> {
  const { issuerId } = getGoogleWalletConfig();
  const classId = `${issuerId}.merchant_${sanitizeResourceId(merchant.slug)}`;
  const objectId = `${issuerId}.pass_${sanitizeResourceId(customer.passSerial)}`;
  const currency = merchant.currency || "DH";

  const isCashback = customer.loyaltyType === "CASHBACK";
  const isUnactivated = customer.isActivated === false;
  const effectiveCashbackRate =
    (merchant.cashbackRate || 10) + (customer.isVip ? (merchant.vipCashbackBonus || 5) : 0);

  // Dynamic Primary & Secondary Loyalty Points
  let loyaltyPoints: Record<string, unknown>;
  let secondaryLoyaltyPoints: Record<string, unknown>;

  if (isUnactivated) {
    const pointsLabel =
      locale === "fr" ? "Premier Cadeau" : locale === "es" ? "Primer Regalo" : "الهدية الأولى";
    const statusLabel =
      locale === "fr" ? "Statut" : locale === "es" ? "Estado" : "الحالة";

    loyaltyPoints = {
      label: pointsLabel,
      balance: {
        string:
          locale === "fr"
            ? "Visitez-nous 🎁"
            : locale === "es"
            ? "Visítanos 🎁"
            : "زرنا لتفعيل هديتك الأولى 🎁",
      },
    };

    secondaryLoyaltyPoints = {
      label: statusLabel,
      balance: {
        string:
          locale === "fr"
            ? "En attente de visite"
            : locale === "es"
            ? "Esperando primera visita"
            : "بانتظار زيارتك الأولى",
      },
    };
  } else if (isCashback) {
    const pointsLabel =
      locale === "fr"
        ? "Solde Cashback"
        : locale === "es"
        ? "Saldo Cashback"
        : "رصيد الكاش باك";
    const secLabel = customer.isVip ? "VIP GOLD" : "Cashback";

    loyaltyPoints = {
      label: pointsLabel,
      balance: {
        string: `${Number(customer.cashbackBalance || 0).toFixed(2)} ${currency}`,
      },
    };

    secondaryLoyaltyPoints = {
      label: secLabel,
      balance: {
        string: `${effectiveCashbackRate}%`,
      },
    };
  } else {
    const pointsLabel =
      locale === "fr" ? "Tampons" : locale === "es" ? "Sellos" : "الأختام";
    const rewardLabel =
      locale === "fr" ? "Récompense" : locale === "es" ? "Recompensa" : "المكافأة";

    loyaltyPoints = {
      label: pointsLabel,
      balance: {
        string: `${formatStamps(customer.stamps || 0)} / ${merchant.stampsRequired}`,
      },
    };

    secondaryLoyaltyPoints = {
      label: rewardLabel,
      balance: {
        string: customer.isVip ? `👑 ${merchant.rewardName}` : merchant.rewardName,
      },
    };
  }

  // Text Modules (Tier, Visits, Referral link, Terms)
  const tierLabel = locale === "fr" ? "Statut" : locale === "es" ? "Estado" : "فئة العضوية";
  const tierValue = customer.isVip
    ? locale === "fr"
      ? "Membre VIP GOLD 👑"
      : locale === "es"
      ? "Miembro VIP GOLD 👑"
      : "عضوية VIP الذهبية 👑"
    : locale === "fr"
    ? "Membre Standard"
    : locale === "es"
    ? "Miembro Estándar"
    : "عضوية قياسية";

  const visitsLabel = locale === "fr" ? "Visites" : locale === "es" ? "Visitas" : "مجموع الزيارات";
  const referralLabel =
    locale === "fr" ? "Inviter un ami" : locale === "es" ? "Invitar amigo" : "رابط دعوة أصدقائك";
  const referralUrl = `https://wjoin.walink.ma/join/${merchant.slug}?ref=${customer.memberCode}`;

  const textModulesData: Array<{ id: string; header: string; body: string }> = [
    {
      id: "member_tier",
      header: tierLabel,
      body: tierValue,
    },
    {
      id: "total_visits",
      header: visitsLabel,
      body: `${customer.totalVisits || 1} ${locale === "fr" ? "visite(s)" : locale === "es" ? "visita(s)" : "زيارة"}`,
    },
    {
      id: "referral_link",
      header: referralLabel,
      body: referralUrl,
    },
  ];

  if (!isCashback) {
    const safeRequired = Math.max(1, merchant.stampsRequired || 5);
    const rawStamps = isUnactivated ? 0 : roundStamps(customer.stamps || 0);
    const safeStamps = Math.max(0, Math.min(safeRequired, rawStamps));
    const formattedTotalStamps = formatStamps(rawStamps);
    const dotsLimit = Math.min(safeRequired, 15);
    const scaledStamps = isUnactivated ? 0 : (safeStamps / safeRequired) * dotsLimit;
    const fullDots = Math.min(dotsLimit, Math.floor(scaledStamps));
    const hasHalfDot = scaledStamps - fullDots >= 0.25 && fullDots < dotsLimit;
    const emptyDots = Math.max(0, dotsLimit - fullDots - (hasHalfDot ? 1 : 0));
    const dotsDisplay = `${"●".repeat(fullDots)}${hasHalfDot ? "◐" : ""}${"○".repeat(emptyDots)} (${formattedTotalStamps} / ${safeRequired})`;

    textModulesData.unshift({
      id: "stamps_progress",
      header:
        locale === "fr"
          ? "Progression des tampons"
          : locale === "es"
          ? "Progreso de sellos"
          : "تقدم الأختام",
      body: dotsDisplay,
    });
  }

  if (merchant.termsText) {
    textModulesData.push({
      id: "terms",
      header: locale === "fr" ? "Conditions" : locale === "es" ? "Condiciones" : "الشروط والأحكام",
      body: merchant.termsText,
    });
  }

  // Dynamic Visual Stamps Strip PNG (1032x336 heroImage) with explicit .png path & cache-busting params
  const heroRequired = Math.max(1, merchant.stampsRequired || 5);
  const heroStamps = isUnactivated
    ? 0
    : Math.max(0, Math.min(heroRequired, roundStamps(customer.stamps || 0)));
  const formattedHeroStamps = formatStamps(heroStamps);
  const cleanHeroColor = (merchant.primaryColor || "008069").replace(/^#/, "").trim();
  const heroImageUrl = `https://wclient.walink.ma/api/pass/${encodeURIComponent(
    customer.passSerial
  )}/strip.png?s=${formattedHeroStamps}&t=${heroRequired}&c=${encodeURIComponent(
    cleanHeroColor
  )}&a=${isUnactivated ? 0 : 1}&vip=${customer.isVip ? 1 : 0}&v=${Date.now()}`;

  const heroImage = {
    kind: "walletobjects#image",
    sourceUri: {
      uri: heroImageUrl,
    },
    contentDescription: {
      defaultValue: {
        language: locale === "fr" ? "fr" : locale === "es" ? "es" : "ar",
        value: isCashback
          ? `${merchant.name} - ${Number(customer.cashbackBalance || 0).toFixed(2)} ${currency}`
          : `${merchant.name} - ${formatStamps(isUnactivated ? 0 : roundStamps(customer.stamps || 0))} / ${heroRequired}`,
      },
    },
  };

  return {
    id: objectId,
    classId: classId,
    state: "ACTIVE",
    accountId: `#${customer.memberCode}`,
    accountName: customer.name,
    loyaltyPoints,
    secondaryLoyaltyPoints,
    heroImage,
    barcode: {
      type: "QR_CODE",
      value: `WALINK:${customer.passSerial}`,
      alternateText: `WALINK #${customer.memberCode}`,
    },
    textModulesData,
  };
}

/**
 * Generates the official "Save to Google Wallet" URL.
 * If credentials are not configured, returns mode: "mock" with full preview payload.
 */
export function generateGoogleWalletSaveUrl(
  customer: CustomerPassModel,
  merchant: MerchantPassModel,
  locale: string = "ar",
  origin: string = "https://walink.ma"
): {
  configured: boolean;
  mode: "live" | "mock";
  saveUrl: string | null;
  previewPayload: {
    loyaltyClass: Record<string, unknown>;
    loyaltyObject: Record<string, unknown>;
  };
} {
  const config = getGoogleWalletConfig();
  const loyaltyClass = buildLoyaltyClass(merchant, locale);
  const loyaltyObject = buildLoyaltyObject(customer, merchant, locale);

  if (!config.isConfigured) {
    return {
      configured: false,
      mode: "mock",
      saveUrl: null,
      previewPayload: {
        loyaltyClass,
        loyaltyObject,
      },
    };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const origins = Array.from(
    new Set([
      "https://walink.ma",
      "https://www.walink.ma",
      "https://wclient.walink.ma",
      "https://wjoin.walink.ma",
      "https://wstore.walink.ma",
      "https://wadmin.walink.ma",
      origin,
    ].filter(Boolean))
  );

  const jwtPayload: Record<string, unknown> = {
    iss: config.clientEmail,
    aud: "google",
    typ: "savetowallet",
    iat: nowSeconds,
    origins: origins,
    payload: {
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects: [loyaltyObject],
    },
  };

  const token = signGoogleJwt(jwtPayload, config.clientEmail, config.privateKey);
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

  return {
    configured: true,
    mode: "live",
    saveUrl,
    previewPayload: {
      loyaltyClass,
      loyaltyObject,
    },
  };
}

/**
 * Fetches an OAuth2 access token for the Google Wallet REST API using service account assertion.
 */
async function getGoogleWalletAccessToken(
  clientEmail: string,
  privateKey: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const assertionPayload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/wallet_object.issuer",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const assertion = signGoogleJwt(assertionPayload, clientEmail, privateKey);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: assertion,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth2 Token exchange failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function patchGoogleWalletClassAndObject(
  accessToken: string,
  customer: CustomerPassModel,
  merchant: MerchantPassModel,
  locale: string
): Promise<{ objectStatus: number; error?: string }> {
  const { issuerId } = getGoogleWalletConfig();
  const classId = `${issuerId}.merchant_${sanitizeResourceId(merchant.slug)}`;
  const objectId = `${issuerId}.pass_${sanitizeResourceId(customer.passSerial)}`;

  const loyaltyClass = buildLoyaltyClass(merchant, locale);
  const loyaltyObject = buildLoyaltyObject(customer, merchant, locale);

  // Isolate LoyaltyClass PATCH so any template rejection never blocks LoyaltyObject.heroImage update
  try {
    const classPatchRes = await fetch(
      `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${encodeURIComponent(
        classId
      )}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify({
          hexBackgroundColor: loyaltyClass.hexBackgroundColor,
          classTemplateInfo: loyaltyClass.classTemplateInfo,
          programLogo: loyaltyClass.programLogo,
          linksModuleData: loyaltyClass.linksModuleData,
        }),
      }
    );
    if (!classPatchRes.ok && classPatchRes.status !== 404) {
      const classErr = await classPatchRes.text();
      console.warn(`[GoogleWallet] PATCH class warning (${classPatchRes.status}):`, classErr);
    }
  } catch (classErr: unknown) {
    console.warn("[GoogleWallet] PATCH class exception (ignored):", classErr);
  }

  // Always PATCH LoyaltyObject with fresh heroImage & points
  const patchRes = await fetch(
    `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(
      objectId
    )}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        loyaltyPoints: loyaltyObject.loyaltyPoints,
        secondaryLoyaltyPoints: loyaltyObject.secondaryLoyaltyPoints,
        heroImage: loyaltyObject.heroImage,
        textModulesData: loyaltyObject.textModulesData,
      }),
    }
  );

  if (!patchRes.ok) {
    const errText = await patchRes.text();
    if (patchRes.status === 404) {
      return { objectStatus: 404, error: "Pass not yet saved in Google Wallet" };
    }
    console.warn(`[GoogleWallet] PATCH object warning (${patchRes.status}):`, errText);
    return { objectStatus: patchRes.status, error: errText };
  }

  return { objectStatus: 200 };
}

/**
 * Ensures an existing Google Wallet class & object are silently updated before re-opening Save URL.
 */
export async function syncGoogleWalletPassOnSave(
  customer: CustomerPassModel,
  merchant: MerchantPassModel,
  locale: string = "ar"
): Promise<{ success: boolean; error?: string }> {
  const config = getGoogleWalletConfig();
  if (!config.isConfigured) {
    return { success: false, error: "Google Wallet is not configured in .env" };
  }
  try {
    const accessToken = await getGoogleWalletAccessToken(
      config.clientEmail,
      config.privateKey
    );
    const result = await patchGoogleWalletClassAndObject(
      accessToken,
      customer,
      merchant,
      locale
    );
    if (result.objectStatus === 404) {
      return { success: false, error: result.error };
    }
    return { success: result.objectStatus === 200, error: result.error };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("[GoogleWallet] syncGoogleWalletPassOnSave warning:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Pushes real-time updates and lock-screen push notifications (TEXT_AND_NOTIFY) to Android devices.
 * Non-blocking: failures are logged without disrupting customer checkout.
 */
export async function pushGoogleWalletUpdate(
  customer: CustomerPassModel,
  merchant: MerchantPassModel,
  notificationHeader?: string,
  notificationBody?: string,
  locale: string = "ar"
): Promise<{ success: boolean; error?: string }> {
  const config = getGoogleWalletConfig();
  if (!config.isConfigured) {
    return { success: false, error: "Google Wallet is not configured in .env" };
  }

  const objectId = `${config.issuerId}.pass_${sanitizeResourceId(customer.passSerial)}`;

  try {
    const accessToken = await getGoogleWalletAccessToken(
      config.clientEmail,
      config.privateKey
    );

    const patchResult = await patchGoogleWalletClassAndObject(
      accessToken,
      customer,
      merchant,
      locale
    );
    if (patchResult.objectStatus === 404) {
      return { success: false, error: patchResult.error };
    }

    // 2. If notification message requested, send TEXT_AND_NOTIFY lock-screen notification
    if (notificationHeader && notificationBody) {
      const messageRes = await fetch(
        `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${encodeURIComponent(
          objectId
        )}/addMessage`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            message: {
              header: notificationHeader,
              body: notificationBody,
              id: `msg_${Date.now()}`,
              messageType: "TEXT_AND_NOTIFY",
            },
          }),
        }
      );

      if (!messageRes.ok) {
        const msgErr = await messageRes.text();
        console.warn(`[GoogleWallet] addMessage warning (${messageRes.status}):`, msgErr);
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[GoogleWallet] pushGoogleWalletUpdate error:", msg);
    return { success: false, error: msg };
  }
}

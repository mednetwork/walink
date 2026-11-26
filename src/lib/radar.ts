export interface RadarZoneInput {
  name?: string;
  lat?: number | string | null;
  lng?: number | string | null;
  message?: string | null;
}

export interface RadarMerchantSource {
  name: string;
  plan?: string | null;
  autoRadar?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  radarMessage?: string | null;
  radarZones?: string | null;
}

export interface ApplePassLocationEntry {
  latitude: number;
  longitude: number;
  relevantText: string;
}

const MAX_APPLE_LOCATIONS = 10;
const MAX_RELEVANT_TEXT_LEN = 128;
const CASABLANCA_DEFAULT_LAT = 33.5731;
const CASABLANCA_DEFAULT_LNG = -7.5898;

/**
 * Validates that latitude and longitude are finite coordinates within Earth bounds
 * and not an unset (0, 0) placeholder.
 */
export function isValidCoordinatePair(lat: unknown, lng: unknown): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  if (typeof lat === "string" && lat.trim() === "") return false;
  if (typeof lng === "string" && lng.trim() === "") return false;

  const numLat = Number(lat);
  const numLng = Number(lng);
  if (!Number.isFinite(numLat) || !Number.isFinite(numLng)) {
    return false;
  }
  if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
    return false;
  }
  if (Math.abs(numLat) < 0.00001 && Math.abs(numLng) < 0.00001) {
    return false;
  }
  return true;
}

/**
 * Detects whether stored coordinates are still the hardcoded Casablanca default
 * while the merchant's registered city is a different city.
 */
export function isCasablancaPlaceholderCoords(
  lat: unknown,
  lng: unknown,
  city?: string | null
): boolean {
  if (!isValidCoordinatePair(lat, lng)) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  const matchesDefault =
    Math.abs(numLat - CASABLANCA_DEFAULT_LAT) < 0.0005 &&
    Math.abs(numLng - CASABLANCA_DEFAULT_LNG) < 0.0005;
  if (!matchesDefault) return false;

  const normalizedCity = (city || "").trim().toLowerCase();
  if (!normalizedCity) return false;
  if (
    normalizedCity.includes("الدار البيضاء") ||
    normalizedCity.includes("casablanca") ||
    normalizedCity === "casa"
  ) {
    return false;
  }
  return true;
}

function getDefaultRadarText(locale: string): string {
  if (locale === "fr") {
    return "Vous êtes tout près ! Passez nous voir, votre carte vous attend.";
  }
  if (locale === "es") {
    return "¡Estás muy cerca! Pasa a visitarnos, tus beneficios te esperan.";
  }
  return "أنت بالقرب منا! تفضل بزيارتنا، بطاقتك ومكافآتك جاهزة.";
}

function formatRelevantText(
  rawMessage: string | null | undefined,
  merchantName: string,
  locale: string
): string {
  const fallback = getDefaultRadarText(locale);
  const base = (rawMessage || "").trim() || fallback;
  const replaced = base.replace(/\{shop\}/g, merchantName).trim();
  if (replaced.length <= MAX_RELEVANT_TEXT_LEN) {
    return replaced;
  }
  return `${replaced.slice(0, MAX_RELEVANT_TEXT_LEN - 1).trimEnd()}…`;
}

/**
 * Builds up to 10 deduplicated Apple PassKit geofence location entries.
 * Returns an empty array when radar is disabled or on STARTER plan.
 */
export function buildDeduplicatedRadarLocations(
  merchant: RadarMerchantSource,
  locale: string = "ar"
): ApplePassLocationEntry[] {
  if (!merchant.autoRadar || merchant.plan === "STARTER") {
    return [];
  }

  const locations: ApplePassLocationEntry[] = [];
  const seenCoords = new Set<string>();

  const pushPoint = (
    latVal: unknown,
    lngVal: unknown,
    messageVal: string | null | undefined
  ): void => {
    if (locations.length >= MAX_APPLE_LOCATIONS) return;
    if (!isValidCoordinatePair(latVal, lngVal)) return;

    const latitude = Number(Number(latVal).toFixed(6));
    const longitude = Number(Number(lngVal).toFixed(6));
    const coordKey = `${latitude.toFixed(5)}:${longitude.toFixed(5)}`;
    if (seenCoords.has(coordKey)) return;

    seenCoords.add(coordKey);
    locations.push({
      latitude,
      longitude,
      relevantText: formatRelevantText(messageVal, merchant.name, locale),
    });
  };

  if (merchant.radarZones) {
    try {
      const parsed: unknown = JSON.parse(merchant.radarZones);
      if (Array.isArray(parsed)) {
        for (const rawZone of parsed) {
          if (locations.length >= MAX_APPLE_LOCATIONS) break;
          if (!rawZone || typeof rawZone !== "object") continue;
          const zone = rawZone as RadarZoneInput;
          const zoneMsg =
            (zone.message || "").trim() ||
            (zone.name ? `${zone.name} - ${merchant.name}` : merchant.radarMessage);
          pushPoint(zone.lat, zone.lng, zoneMsg);
        }
      }
    } catch {
      // Ignore malformed radarZones JSON and fall back to merchant coordinates
    }
  }

  pushPoint(merchant.latitude, merchant.longitude, merchant.radarMessage);

  return locations;
}

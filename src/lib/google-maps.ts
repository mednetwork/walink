import { isValidCoordinatePair } from "@/lib/radar";

export const GOOGLE_REVIEW_URL_PREFIX =
  "https://search.google.com/local/writereview?placeid=";

export const GOOGLE_PLACE_ID_FINDER_URL =
  "https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder";

const ALLOWED_MAPS_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
  "maps.google.com",
  "www.google.com",
  "google.com",
  "www.google.ma",
  "google.ma",
  "www.google.fr",
  "google.fr",
  "www.google.es",
  "google.es",
  "search.google.com",
]);

function isIpLiteralHostname(hostname: string): boolean {
  const clean = hostname.replace(/^\[|\]$/g, "");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) return true;
  if (clean.includes(":")) return true;
  return clean === "localhost" || clean.endsWith(".local") || clean.endsWith(".internal");
}

/**
 * Validates that a URL is HTTPS and strictly belongs to the Google Maps / short-link domain allowlist.
 */
export function isAllowedGoogleMapsUrl(rawUrl: string): URL | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return null;
    if (parsed.username || parsed.password) return null;

    const host = parsed.hostname.toLowerCase();
    if (isIpLiteralHostname(host)) return null;
    if (!ALLOWED_MAPS_HOSTS.has(host)) return null;

    // On root goo.gl, restrict strictly to Google Maps short links
    if (host === "goo.gl" && !parsed.pathname.startsWith("/maps")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Unwraps EU Hostinger consent redirects (`https://consent.google.com/m?continue=...`)
 * strictly back through the Google Maps allowlist.
 */
export function unwrapGoogleConsentUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") return null;
    if (parsed.hostname.toLowerCase() !== "consent.google.com") return null;

    const continueTarget = parsed.searchParams.get("continue");
    if (!continueTarget) return null;

    return isAllowedGoogleMapsUrl(continueTarget);
  } catch {
    return null;
  }
}

export function isShortGoogleMapsUrl(rawUrl: string): boolean {
  const allowed = isAllowedGoogleMapsUrl(rawUrl);
  if (!allowed) return false;
  const host = allowed.hostname.toLowerCase();
  return host === "maps.app.goo.gl" || host === "goo.gl";
}

/**
 * Extracts a `placeid` strictly from a URL or HTML string containing `placeid=` / `query_place_id=`.
 * Never treats arbitrary strings or HTML bodies as raw Place IDs.
 */
export function extractPlaceIdFromUrl(urlOrHtml: string): string {
  const trimmed = urlOrHtml.trim();
  if (!trimmed) return "";

  const urlMatch = /[?&](?:placeid|query_place_id)=([A-Za-z0-9_-]{8,128})/i.exec(trimmed);
  if (urlMatch && urlMatch[1]) {
    try {
      return decodeURIComponent(urlMatch[1]).trim();
    } catch {
      return urlMatch[1].trim();
    }
  }

  return "";
}

/**
 * Extracts a clean Place ID whether the user pastes just `ChIJ...` or a full URL containing `placeid=...`.
 */
export function extractPlaceIdFromInput(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return "";

  const fromUrl = extractPlaceIdFromUrl(trimmed);
  if (fromUrl) return fromUrl;

  // If user pasted some other URL without placeid=, don't accidentally store a URL as Place ID
  if (/^https?:/i.test(trimmed)) {
    return "";
  }

  return trimmed.replace(/\s+/g, "");
}

export function buildGoogleReviewUrl(placeIdInput: string): string {
  const cleanPlaceId = extractPlaceIdFromInput(placeIdInput);
  if (!cleanPlaceId) return "";
  return `${GOOGLE_REVIEW_URL_PREFIX}${encodeURIComponent(cleanPlaceId)}`;
}

/**
 * Extracts coordinates from any Google Maps URL, prioritizing the exact `!3dlat!4dlng` pin coordinate.
 */
export function extractCoordsFromMapsUrl(
  rawUrl: string
): { lat: number; lng: number } | null {
  const input = rawUrl.trim();
  if (!input) return null;

  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    decoded = input;
  }

  const patterns: RegExp[] = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|ll|destination|center|sll)=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/i,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  for (const candidate of [decoded, input]) {
    for (const regex of patterns) {
      const match = regex.exec(candidate);
      if (match && match[1] && match[2]) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (isValidCoordinatePair(lat, lng)) {
          return { lat, lng };
        }
      }
    }
  }

  return null;
}

/**
 * Fallback coordinate scanner for bounded HTML snippets (e.g. `og:image` `center=lat,lng` or `!3d...!4d...`).
 */
export function extractCoordsFromHtmlSnippet(
  html: string
): { lat: number; lng: number } | null {
  if (!html) return null;

  const patterns: RegExp[] = [
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /center=(-?\d+(?:\.\d+)?)(?:,|%2C)(-?\d+(?:\.\d+)?)/i,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  for (const regex of patterns) {
    const match = regex.exec(html);
    if (match && match[1] && match[2]) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (isValidCoordinatePair(lat, lng)) {
        return { lat, lng };
      }
    }
  }

  return null;
}

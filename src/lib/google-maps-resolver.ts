import {
  extractCoordsFromHtmlSnippet,
  extractCoordsFromMapsUrl,
  extractPlaceIdFromInput,
  extractPlaceIdFromUrl,
  isAllowedGoogleMapsUrl,
  unwrapGoogleConsentUrl,
} from "@/lib/google-maps";
import { isValidCoordinatePair } from "@/lib/radar";

const MAX_REDIRECT_HOPS = 5;
const MAX_HTML_BYTES = 250 * 1024; // 250KB hard cap for fallback body scan

export interface ResolvedGoogleMapsSuccess {
  ok: true;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
  resolvedUrl?: string;
  needsApiKey?: boolean;
  message?: string;
}

export interface ResolvedGoogleMapsError {
  ok: false;
  status: number;
  error: string;
  placeId?: string | null;
}

export type ResolveGoogleMapsResult =
  | ResolvedGoogleMapsSuccess
  | ResolvedGoogleMapsError;

async function readBoundedText(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let totalBytes = 0;
  let result = "";

  try {
    while (totalBytes < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const remaining = maxBytes - totalBytes;
      const slice =
        value.byteLength > remaining ? value.subarray(0, remaining) : value;
      totalBytes += slice.byteLength;
      result += decoder.decode(slice, { stream: true });
    }
  } finally {
    reader.cancel().catch(() => undefined);
  }

  result += decoder.decode();
  return result;
}

/**
 * Resolves coordinates (lat, lng) and Place ID from any whitelisted Google Maps URL
 * (including short links via maps.app.goo.gl and EU consent.google.com hops),
 * or directly from a Google Place ID when GOOGLE_MAPS_API_KEY is configured.
 */
export async function resolveGoogleMapsInput(params: {
  url?: string;
  placeId?: string;
}): Promise<ResolveGoogleMapsResult> {
  const rawUrl = typeof params.url === "string" ? params.url.trim() : "";
  const rawPlaceId =
    typeof params.placeId === "string" ? params.placeId.trim() : "";

  // Mode 1: Resolve Google Maps URL (including maps.app.goo.gl & consent.google.com hops)
  if (rawUrl) {
    let currentUrl =
      isAllowedGoogleMapsUrl(rawUrl) || unwrapGoogleConsentUrl(rawUrl);

    if (!currentUrl) {
      return {
        ok: false,
        status: 400,
        error:
          "يرجى إدخال رابط HTTPS صالح من خرائط Google (مثل google.com/maps أو maps.app.goo.gl).",
      };
    }

    const immediateCoords = extractCoordsFromMapsUrl(currentUrl.toString());
    const immediatePlaceId = extractPlaceIdFromUrl(currentUrl.toString());
    if (immediateCoords) {
      return {
        ok: true,
        lat: immediateCoords.lat,
        lng: immediateCoords.lng,
        placeId: immediatePlaceId || null,
        resolvedUrl: currentUrl.toString(),
      };
    }

    let foundPlaceId = immediatePlaceId || "";

    for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
      const res = await fetch(currentUrl.href, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(6000),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WalinkMapsResolver/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      const locationHeader = res.headers.get("location");
      if (locationHeader) {
        res.body?.cancel().catch(() => undefined);

        let resolvedLocationStr: string;
        try {
          resolvedLocationStr = new URL(locationHeader, currentUrl).href;
        } catch {
          return {
            ok: false,
            status: 400,
            error: "تعذر قراءة مسار التوجيه من رابط خرائط Google.",
          };
        }

        const nextUrl =
          unwrapGoogleConsentUrl(resolvedLocationStr) ||
          isAllowedGoogleMapsUrl(resolvedLocationStr);

        if (!nextUrl) {
          return {
            ok: false,
            status: 400,
            error:
              "تم حظر إعادة التوجيه لأنها تخرج عن نطاقات خرائط Google المسموحة.",
          };
        }

        if (!foundPlaceId) {
          foundPlaceId = extractPlaceIdFromUrl(nextUrl.href);
        }

        const hopCoords = extractCoordsFromMapsUrl(nextUrl.href);
        if (hopCoords) {
          return {
            ok: true,
            lat: hopCoords.lat,
            lng: hopCoords.lng,
            placeId: foundPlaceId || null,
            resolvedUrl: nextUrl.href,
          };
        }

        currentUrl = nextUrl;
        continue;
      }

      if (res.ok) {
        const snippet = await readBoundedText(res, MAX_HTML_BYTES);
        const snippetCoords = extractCoordsFromHtmlSnippet(snippet);
        if (!foundPlaceId) {
          const snippetPlace = extractPlaceIdFromUrl(snippet);
          if (snippetPlace) foundPlaceId = snippetPlace;
        }

        if (snippetCoords) {
          return {
            ok: true,
            lat: snippetCoords.lat,
            lng: snippetCoords.lng,
            placeId: foundPlaceId || null,
            resolvedUrl: currentUrl.href,
          };
        }
      } else {
        res.body?.cancel().catch(() => undefined);
      }

      break;
    }

    return {
      ok: false,
      status: 422,
      error:
        "تعذر استخراج خط العرض والطول من هذا الرابط. جرب فتح المتجر في خرائط Google ونسخ الرابط الذي يحتوي على الإحداثيات أو تحديدها يدوياً.",
      placeId: foundPlaceId || null,
    };
  }

  // Mode 2: Resolve Coordinates directly from Place ID (when GOOGLE_MAPS_API_KEY is configured)
  if (rawPlaceId) {
    const cleanPlaceId = extractPlaceIdFromInput(rawPlaceId);
    if (!cleanPlaceId) {
      return {
        ok: false,
        status: 400,
        error: "صيغة Place ID غير صالحة.",
      };
    }

    const apiKey = (
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      ""
    ).trim();

    if (!apiKey) {
      return {
        ok: true,
        lat: null,
        lng: null,
        placeId: cleanPlaceId,
        needsApiKey: true,
        message:
          "مفتاح Google Places API غير مفعّل في الخادم حالياً. الصق رابط المتجر من خرائط Google في الحقل أعلاه لاستخراج Latitude و Longitude مجاناً وفوراً.",
      };
    }

    const placesEndpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(
      cleanPlaceId
    )}`;
    const apiRes = await fetch(placesEndpoint, {
      method: "GET",
      signal: AbortSignal.timeout(6000),
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "location",
      },
    });

    if (!apiRes.ok) {
      return {
        ok: false,
        status: 422,
        error: "تعذر جلب الإحداثيات لهذا الـ Place ID من Google Places API.",
      };
    }

    const placeData = (await apiRes.json()) as {
      location?: { latitude?: number; longitude?: number };
    };
    const lat = placeData.location?.latitude;
    const lng = placeData.location?.longitude;

    if (!isValidCoordinatePair(lat, lng)) {
      return {
        ok: false,
        status: 422,
        error: "لم يتم العثور على إحداثيات صالحة لهذا الـ Place ID.",
      };
    }

    return {
      ok: true,
      lat: lat as number,
      lng: lng as number,
      placeId: cleanPlaceId,
    };
  }

  return {
    ok: false,
    status: 400,
    error: "يرجى تمرير رابط خرائط Google أو Place ID.",
  };
}

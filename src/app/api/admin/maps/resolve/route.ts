import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import {
  extractCoordsFromHtmlSnippet,
  extractCoordsFromMapsUrl,
  extractPlaceIdFromInput,
  extractPlaceIdFromUrl,
  isAllowedGoogleMapsUrl,
  unwrapGoogleConsentUrl,
} from "@/lib/google-maps";
import { isValidCoordinatePair } from "@/lib/radar";

export const dynamic = "force-dynamic";

const MAX_REDIRECT_HOPS = 5;
const MAX_HTML_BYTES = 250 * 1024; // 250KB hard cap for fallback body scan

async function requireSuperAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminToken(token);
  return Boolean(session);
}

async function readBoundedText(
  res: Response,
  maxBytes: number
): Promise<string> {
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
      const slice = value.byteLength > remaining ? value.subarray(0, remaining) : value;
      totalBytes += slice.byteLength;
      result += decoder.decode(slice, { stream: true });
    }
  } finally {
    reader.cancel().catch(() => undefined);
  }

  result += decoder.decode();
  return result;
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireSuperAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      url?: string;
      placeId?: string;
    };

    const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
    const rawPlaceId =
      typeof body.placeId === "string" ? body.placeId.trim() : "";

    // Mode 1: Resolve Google Maps URL (including maps.app.goo.gl & consent.google.com hops)
    if (rawUrl) {
      let currentUrl =
        isAllowedGoogleMapsUrl(rawUrl) || unwrapGoogleConsentUrl(rawUrl);

      if (!currentUrl) {
        return NextResponse.json(
          {
            error:
              "يرجى إدخال رابط HTTPS صالح من خرائط Google (مثل google.com/maps أو maps.app.goo.gl).",
          },
          { status: 400 }
        );
      }

      const immediateCoords = extractCoordsFromMapsUrl(currentUrl.toString());
      const immediatePlaceId = extractPlaceIdFromUrl(currentUrl.toString());
      if (immediateCoords) {
        return NextResponse.json({
          lat: immediateCoords.lat,
          lng: immediateCoords.lng,
          placeId: immediatePlaceId || null,
          resolvedUrl: currentUrl.toString(),
        });
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
          // Cancel unused body stream before jumping to the next redirect hop
          res.body?.cancel().catch(() => undefined);

          let resolvedLocationStr: string;
          try {
            resolvedLocationStr = new URL(locationHeader, currentUrl).href;
          } catch {
            return NextResponse.json(
              { error: "تعذر قراءة مسار التوجيه من رابط خرائط Google." },
              { status: 400 }
            );
          }

          const nextUrl =
            unwrapGoogleConsentUrl(resolvedLocationStr) ||
            isAllowedGoogleMapsUrl(resolvedLocationStr);

          if (!nextUrl) {
            return NextResponse.json(
              {
                error:
                  "تم حظر إعادة التوجيه لأنها تخرج عن نطاقات خرائط Google المسموحة.",
              },
              { status: 400 }
            );
          }

          if (!foundPlaceId) {
            foundPlaceId = extractPlaceIdFromUrl(nextUrl.href);
          }

          const hopCoords = extractCoordsFromMapsUrl(nextUrl.href);
          if (hopCoords) {
            return NextResponse.json({
              lat: hopCoords.lat,
              lng: hopCoords.lng,
              placeId: foundPlaceId || null,
              resolvedUrl: nextUrl.href,
            });
          }

          currentUrl = nextUrl;
          continue;
        }

        // Final whitelisted Google Maps document: inspect up to 250KB for embedded coordinates
        if (res.ok) {
          const snippet = await readBoundedText(res, MAX_HTML_BYTES);
          const snippetCoords = extractCoordsFromHtmlSnippet(snippet);
          if (!foundPlaceId) {
            const snippetPlace = extractPlaceIdFromUrl(snippet);
            if (snippetPlace) foundPlaceId = snippetPlace;
          }

          if (snippetCoords) {
            return NextResponse.json({
              lat: snippetCoords.lat,
              lng: snippetCoords.lng,
              placeId: foundPlaceId || null,
              resolvedUrl: currentUrl.href,
            });
          }
        } else {
          res.body?.cancel().catch(() => undefined);
        }

        break;
      }

      return NextResponse.json(
        {
          error:
            "تعذر استخراج خط العرض والطول من هذا الرابط. جرب فتح المتجر في خرائط Google ونسخ الرابط الذي يحتوي على الإحداثيات أو تحديدها يدوياً.",
          placeId: foundPlaceId || null,
        },
        { status: 422 }
      );
    }

    // Mode 2: Resolve Coordinates directly from Place ID (when GOOGLE_MAPS_API_KEY is configured)
    if (rawPlaceId) {
      const cleanPlaceId = extractPlaceIdFromInput(rawPlaceId);
      if (!cleanPlaceId) {
        return NextResponse.json(
          { error: "صيغة Place ID غير صالحة." },
          { status: 400 }
        );
      }

      const apiKey = (
        process.env.GOOGLE_MAPS_API_KEY ||
        process.env.GOOGLE_PLACES_API_KEY ||
        ""
      ).trim();

      if (!apiKey) {
        return NextResponse.json({
          lat: null,
          lng: null,
          placeId: cleanPlaceId,
          needsApiKey: true,
          message:
            "مفتاح Google Places API غير مفعّل في الخادم حالياً. الصق رابط المتجر من خرائط Google في الحقل أعلاه لاستخراج Latitude و Longitude مجاناً وفوراً.",
        });
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
        return NextResponse.json(
          { error: "تعذر جلب الإحداثيات لهذا الـ Place ID من Google Places API." },
          { status: 422 }
        );
      }

      const placeData = (await apiRes.json()) as {
        location?: { latitude?: number; longitude?: number };
      };
      const lat = placeData.location?.latitude;
      const lng = placeData.location?.longitude;

      if (!isValidCoordinatePair(lat, lng)) {
        return NextResponse.json(
          { error: "لم يتم العثور على إحداثيات صالحة لهذا الـ Place ID." },
          { status: 422 }
        );
      }

      return NextResponse.json({
        lat,
        lng,
        placeId: cleanPlaceId,
      });
    }

    return NextResponse.json(
      { error: "يرجى تمرير رابط خرائط Google أو Place ID." },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("[AdminMapsResolve] POST error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة رابط خرائط Google." },
      { status: 500 }
    );
  }
}

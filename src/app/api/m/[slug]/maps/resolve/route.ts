import { NextRequest, NextResponse } from "next/server";
import { getStoreSessionFromCookies } from "@/lib/auth";
import { resolveGoogleMapsInput } from "@/lib/google-maps-resolver";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const session = await getStoreSessionFromCookies(req.cookies, slug);

    if (!session) {
      return NextResponse.json(
        { error: "غير مصرح بالوصول، يرجى تسجيل الدخول برمز PIN" },
        { status: 401 }
      );
    }

    if (session.role !== "OWNER" || session.slug !== slug) {
      return NextResponse.json(
        {
          error:
            "غير مصرح: استخراج إحداثيات المتجر والفروع متاح لحساب صاحب المشروع فقط.",
        },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      url?: string;
      placeId?: string;
    };

    const result = await resolveGoogleMapsInput({
      url: body.url,
      placeId: body.placeId,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          ...(result.placeId !== undefined ? { placeId: result.placeId } : {}),
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      lat: result.lat,
      lng: result.lng,
      placeId: result.placeId,
      ...(result.resolvedUrl ? { resolvedUrl: result.resolvedUrl } : {}),
      ...(result.needsApiKey !== undefined
        ? { needsApiKey: result.needsApiKey }
        : {}),
      ...(result.message ? { message: result.message } : {}),
    });
  } catch (error: unknown) {
    console.error("[MerchantMapsResolve] POST error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة رابط خرائط Google." },
      { status: 500 }
    );
  }
}

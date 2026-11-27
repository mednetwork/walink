import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { resolveGoogleMapsInput } from "@/lib/google-maps-resolver";

export const dynamic = "force-dynamic";

async function requireSuperAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  const session = await verifyAdminToken(token);
  return Boolean(session);
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
    console.error("[AdminMapsResolve] POST error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة رابط خرائط Google." },
      { status: 500 }
    );
  }
}

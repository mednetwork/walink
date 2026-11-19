import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts,
  timingSafeCompare,
  createAdminToken,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Extract client IP address
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "تم تجاوز الحد الأقصى للمحاولات الخاطئة. الحساب مقفل مؤقتاً لحمايته.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
      );
    }

    // 2. Parse payload
    const body = await req.json().catch(() => ({}));
    const { username, password, remember } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "يرجى إدخال اسم المستخدم وكلمة المرور كاملين." },
        { status: 400 }
      );
    }

    const expectedUser = process.env.ADMIN_USERNAME || "admin";
    const expectedPass = process.env.ADMIN_PASSWORD || "WalinkAdmin2026_SecureKey!";

    const userMatches = timingSafeCompare(String(username).trim(), expectedUser);
    const passMatches = timingSafeCompare(String(password), expectedPass);

    if (!userMatches || !passMatches) {
      const attemptResult = recordFailedAttempt(ip);
      if (attemptResult.locked) {
        return NextResponse.json(
          {
            error: "بيانات الدخول غير صحيحة. تم قفل الحساب مؤقتاً لمدة 15 دقيقة بعد 5 محاولات خاطئة.",
            locked: true,
            retryAfterSeconds: attemptResult.retryAfterSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `بيانات الدخول غير صحيحة. المحاولات المتبقية: ${attemptResult.remainingAttempts}`,
          remainingAttempts: attemptResult.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 3. Success: Reset rate limits
    resetFailedAttempts(ip);

    // 4. Generate signed session token
    const token = await createAdminToken(expectedUser);

    // 5. Build response and set HttpOnly cookie
    const maxAge = remember ? SESSION_DURATION_SECONDS : 24 * 60 * 60; // 7 days or 1 day
    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع في خادم المصادقة." },
      { status: 500 }
    );
  }
}

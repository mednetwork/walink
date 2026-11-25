import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /_next/ (Next.js internals, static files, image optimization)
     * 2. Static files with extensions: .png, .jpg, .jpeg, .svg, .ico, .webp, .css, .js, .webmanifest
     * 3. Service worker & manifest files
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest)).*)",
  ],
};

/**
 * Returns a Stealth 404 response completely masking internal routes
 */
function stealth404(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  const notFoundUrl = req.nextUrl.clone();
  notFoundUrl.pathname = "/_not-found";
  return NextResponse.rewrite(notFoundUrl, { status: 404 });
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const host = rawHost.toLowerCase().split(":")[0].trim();

  const isLocalhost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local") ||
    host.includes("webcontainer") ||
    !host.includes(".");

  // -------------------------------------------------------------
  // 0. UNIVERSAL PASSKIT & GOOGLE WALLET MEDIA BYPASS
  // Required so iPhones calling webServiceURL (/api/apple/v1/...) and Google Wallet
  // fetching /api/pass/*/stamps-image or /api/pass/*/pkpass on ANY domain
  // (walink.ma, www.walink.ma, wclient.walink.ma) never hit Stealth 404!
  // -------------------------------------------------------------
  if (pathname.startsWith("/api/apple/") || pathname.startsWith("/api/pass/")) {
    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // 1. LOCAL DEVELOPMENT / TEST ENVIRONMENT
  // -------------------------------------------------------------
  if (isLocalhost) {
    const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
    const isPublicAdmin =
      pathname === "/admin/login" ||
      pathname.startsWith("/api/admin/auth") ||
      pathname.startsWith("/api/cron");

    if (isAdminPath && !isPublicAdmin) {
      const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      const session = token ? await verifyAdminToken(token) : null;
      if (!session) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Unauthorized access to Admin API. Please authenticate." },
            { status: 401 }
          );
        }
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // 2. SUPER ADMIN SUBDOMAIN: wadmin.walink.ma
  // -------------------------------------------------------------
  if (host === "wadmin.walink.ma") {
    // Strictly dedicated to Super Admin
    const isAllowedAdminPath =
      pathname === "/" ||
      pathname === "/login" ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/admin") ||
      pathname.startsWith("/api/cron");

    if (!isAllowedAdminPath) {
      return stealth404(req);
    }

    // Subdomain path normalization
    let effectivePath = pathname;
    if (pathname === "/") {
      effectivePath = "/admin";
    } else if (pathname === "/login") {
      effectivePath = "/admin/login";
    } else if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
      effectivePath = `/admin${pathname}`;
    }

    const isPublicAdminRoute =
      effectivePath === "/admin/login" ||
      effectivePath.startsWith("/api/admin/auth") ||
      effectivePath.startsWith("/api/cron");

    // Public admin routes (login & auth API)
    if (isPublicAdminRoute) {
      if (effectivePath !== pathname) {
        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = effectivePath;
        return NextResponse.rewrite(rewriteUrl);
      }
      return NextResponse.next();
    }

    // Protected admin routes: Verify token
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await verifyAdminToken(token) : null;

    if (!session) {
      if (effectivePath.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized access to Admin API. Please authenticate." },
          { status: 401 }
        );
      }

      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      if (pathname !== "/" && pathname !== "/admin") {
        loginUrl.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (effectivePath !== pathname) {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = effectivePath;
      return NextResponse.rewrite(rewriteUrl);
    }

    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // 3. MERCHANT STORE SUBDOMAIN: wstore.walink.ma
  // -------------------------------------------------------------
  if (host === "wstore.walink.ma") {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("https://walink.ma", req.url));
    }

    const isAllowedStorePath =
      pathname.startsWith("/m/") ||
      pathname.startsWith("/api/m/") ||
      pathname.startsWith("/api/leads");

    if (!isAllowedStorePath) {
      return stealth404(req);
    }

    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // 4. CUSTOMER PASS HUB SUBDOMAIN: wclient.walink.ma
  // -------------------------------------------------------------
  if (host === "wclient.walink.ma") {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("https://walink.ma", req.url));
    }

    const isAllowedPassPath =
      pathname.startsWith("/pass/") ||
      pathname.startsWith("/api/pass/") ||
      pathname.startsWith("/api/apple/");

    if (!isAllowedPassPath) {
      return stealth404(req);
    }

    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // 5. CUSTOMER ONBOARDING SUBDOMAIN: wjoin.walink.ma
  // -------------------------------------------------------------
  if (host === "wjoin.walink.ma") {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("https://walink.ma", req.url));
    }

    const isAllowedJoinPath =
      pathname.startsWith("/join/") ||
      pathname.startsWith("/api/join/");

    if (!isAllowedJoinPath) {
      return stealth404(req);
    }

    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // 6. MAIN PUBLIC LANDING DOMAIN: walink.ma & www.walink.ma
  // -------------------------------------------------------------
  if (host === "walink.ma" || host === "www.walink.ma") {
    // Only public marketing, legal, and Google Wallet pass media routes are permitted
    const isPublicAllowed =
      pathname === "/" ||
      pathname === "/privacy" ||
      pathname === "/terms" ||
      pathname === "/support" ||
      pathname.startsWith("/api/leads") ||
      pathname.startsWith("/api/pass/");

    if (!isPublicAllowed) {
      // 404 Stealth Mode: Any access to /admin, /m, /pass, /join, /api/* is masked
      return stealth404(req);
    }

    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // 7. UNKNOWN OR UNMAPPED HOST (STEALTH 404)
  // -------------------------------------------------------------
  return stealth404(req);
}

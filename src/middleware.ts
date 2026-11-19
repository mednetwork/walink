import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /_next/ (Next.js internals, static files, image optimization)
     * 2. Static files with extensions: .png, .jpg, .jpeg, .svg, .ico, .webp, .css, .js, .webmanifest
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest)).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const isWadmin = host.startsWith("wadmin.");

  // 1. Subdomain URL Normalization:
  // If accessing via wadmin.walink.ma, map routes cleanly
  let effectivePath = pathname;
  if (isWadmin) {
    if (pathname === "/") {
      effectivePath = "/admin";
    } else if (pathname === "/login") {
      effectivePath = "/admin/login";
    } else if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
      effectivePath = `/admin${pathname}`;
    }
  }

  // 2. Identify if route belongs to Admin Portal
  const isAdminPage = effectivePath.startsWith("/admin");
  const isAdminApi = effectivePath.startsWith("/api/admin");
  const isAuthApi = effectivePath.startsWith("/api/admin/auth");
  const isLoginPage = effectivePath === "/admin/login";

  // Public admin routes (login page & auth API endpoints)
  if (isLoginPage || isAuthApi) {
    if (isWadmin && effectivePath !== pathname) {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = effectivePath;
      return NextResponse.rewrite(rewriteUrl);
    }
    return NextResponse.next();
  }

  // 3. Security Shield for Admin Portal
  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = token ? await verifyAdminToken(token) : null;

    if (!session) {
      // API requests: 401 Unauthorized
      if (isAdminApi) {
        return NextResponse.json(
          { error: "Unauthorized access to Admin API. Please authenticate." },
          { status: 401 }
        );
      }

      // Page requests: Redirect to Login
      const loginUrl = req.nextUrl.clone();
      if (isWadmin) {
        loginUrl.pathname = "/login";
      } else {
        loginUrl.pathname = "/admin/login";
      }

      // Preserve return URL for seamless post-login redirect
      if (pathname !== "/" && pathname !== "/admin") {
        loginUrl.searchParams.set("from", pathname);
      }

      return NextResponse.redirect(loginUrl);
    }

    // Authenticated! If on wadmin subdomain with rewritten path, rewrite
    if (isWadmin && effectivePath !== pathname) {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = effectivePath;
      return NextResponse.rewrite(rewriteUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

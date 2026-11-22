/**
 * Centralized Multi-Tenant Subdomain URL Routing Utility (Walink Platform)
 * Ensures seamless cross-origin navigation between isolated subdomains:
 * - walink.ma: Public Landing & Marketing
 * - wadmin.walink.ma: Super Admin
 * - wstore.walink.ma: Merchant Dashboard
 * - wclient.walink.ma: Customer Pass Hub
 * - wjoin.walink.ma: Customer Onboarding
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Returns the public merchant store dashboard URL
 */
export function getStoreUrl(slug: string): string {
  const cleanSlug = encodeURIComponent(slug.trim());
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("walink.ma")) {
      return `https://wstore.walink.ma/m/${cleanSlug}`;
    }
    return `/m/${cleanSlug}`;
  }
  return isProduction()
    ? `https://wstore.walink.ma/m/${cleanSlug}`
    : `/m/${cleanSlug}`;
}

/**
 * Returns the customer registration / smart stand URL
 */
export function getJoinUrl(slug: string, ref?: string | null): string {
  const cleanSlug = encodeURIComponent(slug.trim());
  const refQuery = ref && /^\d{4}$/.test(ref.trim()) ? `?ref=${ref.trim()}` : "";
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("walink.ma")) {
      return `https://wjoin.walink.ma/join/${cleanSlug}${refQuery}`;
    }
    return `${window.location.origin}/join/${cleanSlug}${refQuery}`;
  }
  return isProduction()
    ? `https://wjoin.walink.ma/join/${cleanSlug}${refQuery}`
    : `/join/${cleanSlug}${refQuery}`;
}

/**
 * Returns the customer digital pass URL
 */
export function getPassUrl(serial: string, lang?: string | null): string {
  const cleanSerial = encodeURIComponent(serial.trim());
  const langQuery = lang && (lang === "ar" || lang === "fr" || lang === "es")
    ? `?lang=${lang}`
    : "";
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("walink.ma")) {
      return `https://wclient.walink.ma/pass/${cleanSerial}${langQuery}`;
    }
    return `/pass/${cleanSerial}${langQuery}`;
  }
  return isProduction()
    ? `https://wclient.walink.ma/pass/${cleanSerial}${langQuery}`
    : `/pass/${cleanSerial}${langQuery}`;
}

/**
 * Returns the Super Admin portal URL
 */
export function getAdminUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("walink.ma")) {
      return `https://wadmin.walink.ma/admin${cleanPath}`;
    }
    return `/admin${cleanPath}`;
  }
  return isProduction()
    ? `https://wadmin.walink.ma/admin${cleanPath}`
    : `/admin${cleanPath}`;
}

/**
 * Returns the main public landing page URL
 */
export function getMainUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("walink.ma")) {
      return `https://walink.ma${cleanPath}`;
    }
    return cleanPath || "/";
  }
  return isProduction()
    ? `https://walink.ma${cleanPath}`
    : cleanPath || "/";
}

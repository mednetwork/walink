export const STARTER_MONTHLY_PRICE_MAD = 149;
export const GROWTH_MONTHLY_PRICE_MAD = 199;
export const EXTRA_BRANCH_MONTHLY_PRICE_MAD = 100;
export const INSTALLATION_FEE_MAD = 300;
export const POINT_PRICE_MAD = 0.1;

export type NormalizedMerchantPlan = "STARTER" | "GROWTH" | "MULTI";

/**
 * Normalizes raw plan strings into one of the 3 official subscription tiers.
 */
export function normalizeMerchantPlan(
  plan?: string | null,
  maxBranches: number = 1
): NormalizedMerchantPlan {
  const upper = (plan || "GROWTH").trim().toUpperCase();
  const safeBranches = Math.max(1, Number(maxBranches) || 1);
  if (safeBranches > 1 || upper === "MULTI") {
    return "MULTI";
  }
  if (upper === "STARTER") {
    return "STARTER";
  }
  return "GROWTH";
}

/**
 * Computes the monthly subscription fee in MAD:
 * - STARTER: 149 DH/mo (1 branch, no 100m Radar, no 5-star Google Reviews)
 * - GROWTH:  199 DH/mo (1 branch, full features)
 * - MULTI:   199 DH base + 100 DH per extra branch (starts at 299 DH/mo for 2 branches)
 */
export function computeMonthlySubscriptionFee(
  plan?: string | null,
  maxBranches: number = 1
): number {
  const safeBranches = Math.max(1, Math.floor(Number(maxBranches) || 1));
  const normalized = normalizeMerchantPlan(plan, safeBranches);

  if (normalized === "STARTER") {
    return STARTER_MONTHLY_PRICE_MAD;
  }
  if (normalized === "MULTI") {
    const billableBranches = Math.max(2, safeBranches);
    return GROWTH_MONTHLY_PRICE_MAD + (billableBranches - 1) * EXTRA_BRANCH_MONTHLY_PRICE_MAD;
  }
  return GROWTH_MONTHLY_PRICE_MAD;
}

/**
 * Returns true if the store tier has access to 100m Radar & 5-Star Google Maps Reviews.
 */
export function hasRadarAndReviewsFeature(plan?: string | null): boolean {
  return (plan || "GROWTH").trim().toUpperCase() !== "STARTER";
}

/**
 * Formats a Date into UTC/server YYYY-MM billing month key (e.g. "2026-11").
 */
export function formatBillingMonth(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Validates and normalizes a YYYY-MM billing month string, defaulting to the current month.
 */
export function normalizeBillingMonth(rawMonth?: string | null): string {
  const trimmed = (rawMonth || "").trim();
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(trimmed)) {
    return trimmed;
  }
  return formatBillingMonth(new Date());
}

/**
 * Computes the monetary fee in MAD for consumed points (rounded cleanly to 2 decimals).
 */
export function computePointsFee(pointsUsed: number): number {
  const safePoints = Math.max(0, Math.floor(Number(pointsUsed) || 0));
  return Number((safePoints * POINT_PRICE_MAD).toFixed(2));
}

/**
 * Normalizes a Moroccan/international phone number to digits-only for wa.me links.
 */
export function formatWhatsAppDigits(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0") && digits.length === 10) {
    return `212${digits.slice(1)}`;
  }
  if (digits.startsWith("212") || digits.length >= 10) {
    return digits;
  }
  return `212${digits}`;
}

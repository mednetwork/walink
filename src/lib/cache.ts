import prisma from "@/lib/prisma";

export interface CachedMerchantPublic {
  id: string;
  slug: string;
  name: string;
  niche: string;
  city: string;
  logoIcon: string;
  primaryColor: string;
  bgGradient: string;
  stampsRequired: number;
  rewardName: string;
  customerPrefix: string;
  loyaltyMode: string;
  cashbackRate: number;
  welcomeCashback: number;
  minCashbackRedeem: number;
  currency: string;
  referralBonus: number;
  allowMultiStamps: boolean;
  isActive: boolean;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}

/**
 * In-memory O(1) Least-Recently-Used (LRU) + Time-To-Live (TTL) cache.
 * Leverages Map insertion order: hits promote to the tail; overflow evicts from the head.
 */
export class LRUTTLCache<T> {
  private readonly store = new Map<string, { value: T; expiresAt: number }>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(options: { maxSize: number; defaultTtlMs: number }) {
    this.maxSize = Math.max(1, options.maxSize);
    this.defaultTtlMs = Math.max(1, options.defaultTtlMs);
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses += 1;
      return undefined;
    }

    // LRU promotion: move accessed entry to the most-recently-used tail
    this.store.delete(key);
    this.store.set(key, entry);
    this.hits += 1;
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (this.store.has(key)) {
      this.store.delete(key);
    }
    while (this.store.size >= this.maxSize) {
      const lruKey = this.store.keys().next().value;
      if (lruKey === undefined) break;
      this.store.delete(lruKey);
      this.evictions += 1;
    }

    const effectiveTtl = ttlMs ?? this.defaultTtlMs;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + Math.max(1, effectiveTtl),
    });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: total > 0 ? Number(((this.hits / total) * 100).toFixed(2)) : 0,
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __walinkMerchantPublicCache: LRUTTLCache<CachedMerchantPublic | null> | undefined;
}

export const merchantPublicCache =
  globalThis.__walinkMerchantPublicCache ??
  new LRUTTLCache<CachedMerchantPublic | null>({
    maxSize: 250,
    defaultTtlMs: 60_000, // 60-second TTL for public store config
  });

globalThis.__walinkMerchantPublicCache = merchantPublicCache;

/**
 * Fetches slow-changing public Merchant metadata via bounded LRU + TTL cache.
 * Mutable customer balances, cooldown transactions, and financial rows bypass cache.
 */
export async function getCachedMerchantPublicBySlug(
  slug: string
): Promise<CachedMerchantPublic | null> {
  const cacheKey = `merchant:${slug.trim().toLowerCase()}`;
  const cached = merchantPublicCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      niche: true,
      city: true,
      logoIcon: true,
      primaryColor: true,
      bgGradient: true,
      stampsRequired: true,
      rewardName: true,
      customerPrefix: true,
      loyaltyMode: true,
      cashbackRate: true,
      welcomeCashback: true,
      minCashbackRedeem: true,
      currency: true,
      referralBonus: true,
      allowMultiStamps: true,
      isActive: true,
    },
  });

  // Use shorter TTL (15s) for negative lookups so newly created stores appear quickly
  merchantPublicCache.set(cacheKey, merchant, merchant ? 60_000 : 15_000);
  return merchant;
}

export function invalidateMerchantCache(slug?: string | null): void {
  if (!slug || typeof slug !== "string") return;
  merchantPublicCache.delete(`merchant:${slug.trim().toLowerCase()}`);
}

export interface CachedStandRedirect {
  code: string;
  merchantId: string | null;
  merchantSlug: string | null;
  merchantName: string | null;
  merchantIsActive: boolean;
  branchName: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __walinkStandByCodeCache: LRUTTLCache<CachedStandRedirect | null> | undefined;
}

export const standByCodeCache =
  globalThis.__walinkStandByCodeCache ??
  new LRUTTLCache<CachedStandRedirect | null>({
    maxSize: 500,
    defaultTtlMs: 60_000,
  });

globalThis.__walinkStandByCodeCache = standByCodeCache;

export async function getCachedStandByCode(
  rawCode: string
): Promise<CachedStandRedirect | null> {
  const normalizedCode = rawCode.trim().toUpperCase();
  const cacheKey = `stand:${normalizedCode}`;
  const cached = standByCodeCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const stand = await prisma.qrStand.findUnique({
    where: { code: normalizedCode },
    select: {
      code: true,
      merchantId: true,
      branchName: true,
      merchant: {
        select: {
          slug: true,
          name: true,
          isActive: true,
        },
      },
    },
  });

  const mapped: CachedStandRedirect | null = stand
    ? {
        code: stand.code,
        merchantId: stand.merchantId,
        merchantSlug: stand.merchant?.slug ?? null,
        merchantName: stand.merchant?.name ?? null,
        merchantIsActive: Boolean(stand.merchant?.isActive),
        branchName: stand.branchName,
      }
    : null;

  standByCodeCache.set(cacheKey, mapped, mapped ? 60_000 : 15_000);
  return mapped;
}

export function invalidateStandCache(code?: string | null): void {
  if (!code || typeof code !== "string") return;
  standByCodeCache.delete(`stand:${code.trim().toUpperCase()}`);
}

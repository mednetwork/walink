import type { StoreSessionPayload } from "@/lib/auth";

export interface StoredBranchItem {
  id: string;
  name: string;
  city: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  radarMessage?: string;
  phone?: string;
  isMain?: boolean;
}

export interface StoredStaffMember {
  name: string;
  pin: string;
}

interface BranchSourceMerchant {
  city: string;
  phone?: string | null;
  plan: string;
  maxBranches?: number | null;
  branches?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  radarMessage?: string | null;
}

/**
 * Parse merchant branches JSON array safely.
 */
export function parseBranchesJson(
  rawBranches?: string | null
): StoredBranchItem[] {
  if (!rawBranches) return [];
  try {
    const parsed: unknown = JSON.parse(rawBranches);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredBranchItem =>
        Boolean(item && typeof item === "object" && "id" in item && "name" in item)
    );
  } catch {
    return [];
  }
}

/**
 * Parse merchant branches JSON and synthesize a default main branch for multi-branch stores when empty.
 */
export function resolveEffectiveBranches(
  merchant: BranchSourceMerchant
): StoredBranchItem[] {
  const isMultiBranch =
    merchant.plan === "MULTI" || (merchant.maxBranches ?? 1) > 1;

  const parsedBranches = parseBranchesJson(merchant.branches);
  if (parsedBranches.length > 0) {
    return parsedBranches;
  }

  if (isMultiBranch) {
    return [
      {
        id: "br_main",
        name: `الفرع الرئيسي (${merchant.city})`,
        city: merchant.city,
        latitude: merchant.latitude ?? undefined,
        longitude: merchant.longitude ?? undefined,
        googleMapsUrl: merchant.googleMapsUrl || "",
        radarMessage:
          merchant.radarMessage ||
          "أنت بالقرب منا! تفضل بزيارتنا وبطاقتك جاهزة.",
        phone: merchant.phone || "",
        isMain: true,
      },
    ];
  }

  return [];
}

/**
 * Parse legacy staffMembers JSON array safely.
 */
export function parseStaffMembers(
  rawStaffMembers?: string | null
): StoredStaffMember[] {
  if (!rawStaffMembers) return [];
  try {
    const parsed: unknown = JSON.parse(rawStaffMembers);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredStaffMember =>
        Boolean(
          item &&
            typeof item === "object" &&
            "pin" in item &&
            typeof (item as StoredStaffMember).pin === "string"
        )
    );
  } catch {
    return [];
  }
}

/**
 * Filter and sanitize branch data according to the authenticated store session role.
 */
export function filterBranchesForSession(
  branches: StoredBranchItem[],
  session: StoreSessionPayload | null
): {
  branches: StoredBranchItem[];
  matchedBranch: StoredBranchItem | null;
} {
  if (!session) {
    return { branches: [], matchedBranch: null };
  }

  if (session.role === "OWNER") {
    return { branches, matchedBranch: null };
  }

  if (session.role === "BRANCH_STAFF") {
    const matchedBranch =
      branches.find(
        (b) =>
          (session.branchId && b.id === session.branchId) ||
          (session.branchName && b.name === session.branchName)
      ) || null;
    return {
      branches: matchedBranch ? [matchedBranch] : [],
      matchedBranch,
    };
  }

  return { branches: [], matchedBranch: null };
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes Moroccan mobile phone numbers into standard format: 06XXXXXXXX or 07XXXXXXXX
 */
export function normalizeMoroccanPhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");

  // International 212 prefix handling
  if (digits.startsWith("00212")) {
    digits = digits.slice(5);
  } else if (digits.startsWith("212")) {
    digits = digits.slice(3);
  }

  // Prepend 0 if 9 digits (e.g. 6XXXXXXXX -> 06XXXXXXXX)
  if (digits.length === 9 && (digits.startsWith("6") || digits.startsWith("7") || digits.startsWith("5"))) {
    digits = "0" + digits;
  }

  return digits;
}

export function isValidMoroccanPhone(phone: string): boolean {
  const normalized = normalizeMoroccanPhone(phone);
  return /^(06|07|05)\d{8}$/.test(normalized);
}

export function formatMoroccanPhone(phone?: string | null): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("212") && cleaned.length >= 11) {
    return "+212 " + cleaned.slice(3, 5) + " " + cleaned.slice(5, 7) + " " + cleaned.slice(7, 9) + " " + cleaned.slice(9);
  }
  if (cleaned.length === 10) {
    return cleaned.slice(0, 4) + " " + cleaned.slice(4, 6) + " " + cleaned.slice(6, 8) + " " + cleaned.slice(8);
  }
  return phone;
}

export function formatTimeAgoArabic(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "منذ لحظات";
  if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
  if (diffInDays === 1) return "أمس";
  if (diffInDays === 2) return "منذ يومين";
  if (diffInDays < 10) return `منذ ${diffInDays} أيام`;
  if (diffInDays < 30) return `منذ ${diffInDays} يوماً`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `منذ ${diffInMonths} شهر`;
}

/**
 * Calculates distance in meters between two GPS coordinates (Haversine formula)
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Rounds stamp values cleanly to 2 decimal places (avoiding IEEE-754 float noise like 1.5000000001).
 */
export function roundStamps(value: number | null | undefined): number {
  return Number((Number(value) || 0).toFixed(2));
}

/**
 * Formats stamps nicely for display without trailing ".0" (e.g. 2 -> "2", 1.5 -> "1.5").
 */
export function formatStamps(value: number | null | undefined): string {
  return String(roundStamps(value));
}

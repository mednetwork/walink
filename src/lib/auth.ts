/**
 * Walink Super Admin Security & Authentication Layer
 * - HMAC-SHA256 Signed Session Tokens (Edge-compatible Web Crypto API)
 * - Timing-attack resistant credential verification
 * - In-memory IP-based brute-force protection & rate limiting
 */

export const ADMIN_COOKIE_NAME = "walink_admin_token";
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

interface RateLimitEntry {
  attempts: number;
  lockUntil: number;
  firstAttempt: number;
}

// In-memory sliding window rate limiter
const loginAttempts = new Map<string, RateLimitEntry>();

// Clean up stale rate limit entries periodically (every 10 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    loginAttempts.forEach((entry, ip) => {
      if (now > entry.lockUntil && now - entry.firstAttempt > 15 * 60 * 1000) {
        loginAttempts.delete(ip);
      }
    });
  }, 10 * 60 * 1000);
}

/**
 * Check if an IP address is currently locked out from login attempts
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) {
    return { allowed: true, remainingAttempts: 5, retryAfterSeconds: 0 };
  }

  // If currently locked
  if (entry.lockUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // If previous window expired (older than 15 minutes)
  if (now - entry.firstAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(ip);
    return { allowed: true, remainingAttempts: 5, retryAfterSeconds: 0 };
  }

  const remaining = Math.max(0, 5 - entry.attempts);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
    retryAfterSeconds: 0,
  };
}

/**
 * Record a failed login attempt for an IP
 */
export function recordFailedAttempt(ip: string): {
  locked: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  let entry = loginAttempts.get(ip);

  if (!entry || now - entry.firstAttempt > 15 * 60 * 1000) {
    entry = { attempts: 1, lockUntil: 0, firstAttempt: now };
  } else {
    entry.attempts += 1;
  }

  if (entry.attempts >= 5) {
    // Lock out for 15 minutes
    entry.lockUntil = now + 15 * 60 * 1000;
    loginAttempts.set(ip, entry);
    return { locked: true, remainingAttempts: 0, retryAfterSeconds: 15 * 60 };
  }

  loginAttempts.set(ip, entry);
  return {
    locked: false,
    remainingAttempts: 5 - entry.attempts,
    retryAfterSeconds: 0,
  };
}

/**
 * Reset failed attempts upon successful login
 */
export function resetFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Helper to convert ArrayBuffer or Uint8Array to hex string
 */
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Get the secret key as a CryptoKey for HMAC-SHA256
 */
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Compute HMAC-SHA256 signature
 */
async function hmacSign(secret: string, data: string): Promise<string> {
  const key = await getCryptoKey(secret);
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  return bufferToHex(signatureBuffer);
}

/**
 * Create a signed admin session token
 */
export async function createAdminToken(
  username: string,
  secret: string = process.env.ADMIN_SESSION_SECRET || "fallback_secret_walink_2026"
): Promise<string> {
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_SECONDS * 1000;
  const nonce = bufferToHex(crypto.getRandomValues(new Uint8Array(8)));
  const payloadStr = `${username}:${now}:${expiresAt}:${nonce}`;
  const encodedPayload = typeof btoa === "function" 
    ? btoa(payloadStr) 
    : Buffer.from(payloadStr).toString("base64");

  const signature = await hmacSign(secret, encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify a signed admin session token (returns username if valid, null if invalid/expired)
 */
export async function verifyAdminToken(
  token: string,
  secret: string = process.env.ADMIN_SESSION_SECRET || "fallback_secret_walink_2026"
): Promise<{ username: string; expiresAt: number } | null> {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSignature = await hmacSign(secret, encodedPayload);

    // Constant-time check on signature
    if (!timingSafeCompare(signature, expectedSignature)) {
      return null;
    }

    const payloadStr = typeof atob === "function"
      ? atob(encodedPayload)
      : Buffer.from(encodedPayload, "base64").toString("utf-8");

    const [username, , expiresAtStr] = payloadStr.split(":");
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return null; // Expired
    }

    return { username, expiresAt };
  } catch {
    return null;
  }
}

import net from "node:net";
import * as webpush from "web-push";
import prisma from "@/lib/prisma";

export interface ValidWebPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface VapidKeyPair {
  publicKey: string;
  privateKey: string;
  subject: string;
}

const TRUSTED_PUSH_DOMAINS = [
  "googleapis.com",
  "push.apple.com",
  "services.mozilla.com",
  "notify.windows.com",
  "push.samsungosp.com",
  "push.opera.com",
  "push.huawei.com",
] as const;

declare global {
  // eslint-disable-next-line no-var
  var __walinkVapidKeysPromise: Promise<VapidKeyPair> | undefined;
}

function isTrustedPushHost(rawHost: string): boolean {
  const host = rawHost.toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".local")) {
    return false;
  }
  if (net.isIP(host) !== 0) {
    return false;
  }
  return TRUSTED_PUSH_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );
}

/**
 * Validates and parses a browser PushSubscription JSON or object with strict SSRF endpoint checks.
 */
export function parseAndValidatePushSubscription(
  raw: unknown
): ValidWebPushSubscription | null {
  if (!raw) return null;

  let obj: unknown = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed.startsWith("{")) return null;
    try {
      obj = JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  if (!obj || typeof obj !== "object") return null;
  const candidate = obj as Record<string, unknown>;

  if (
    typeof candidate.endpoint !== "string" ||
    candidate.endpoint.length < 12 ||
    candidate.endpoint.length > 2048
  ) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(candidate.endpoint);
  } catch {
    return null;
  }

  if (parsedUrl.protocol !== "https:") return null;
  if (parsedUrl.username || parsedUrl.password) return null;
  if (!isTrustedPushHost(parsedUrl.hostname)) return null;

  const keys = candidate.keys;
  if (!keys || typeof keys !== "object") return null;
  const keysRec = keys as Record<string, unknown>;

  if (
    typeof keysRec.p256dh !== "string" ||
    keysRec.p256dh.length < 40 ||
    typeof keysRec.auth !== "string" ||
    keysRec.auth.length < 16
  ) {
    return null;
  }

  return {
    endpoint: parsedUrl.toString(),
    expirationTime:
      typeof candidate.expirationTime === "number"
        ? candidate.expirationTime
        : null,
    keys: {
      p256dh: keysRec.p256dh,
      auth: keysRec.auth,
    },
  };
}

async function resolveOrCreateVapidKeys(): Promise<VapidKeyPair> {
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:support@walink.ma";
  const envPublic = process.env.VAPID_PUBLIC_KEY?.trim();
  const envPrivate = process.env.VAPID_PRIVATE_KEY?.trim();

  if (envPublic && envPrivate) {
    return { publicKey: envPublic, privateKey: envPrivate, subject };
  }

  const existing = await prisma.systemSetting.findMany({
    where: {
      key: { in: ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"] },
    },
  });

  const existingMap = new Map(existing.map((row) => [row.key, row.value]));
  const storedPublic = existingMap.get("VAPID_PUBLIC_KEY");
  const storedPrivate = existingMap.get("VAPID_PRIVATE_KEY");

  if (storedPublic && storedPrivate) {
    return { publicKey: storedPublic, privateKey: storedPrivate, subject };
  }

  // Generate fresh VAPID keypair and insert race-safely (skipDuplicates avoids P2002 race)
  const generated = webpush.generateVAPIDKeys();
  await prisma.systemSetting.createMany({
    data: [
      { key: "VAPID_PUBLIC_KEY", value: generated.publicKey },
      { key: "VAPID_PRIVATE_KEY", value: generated.privateKey },
    ],
    skipDuplicates: true,
  });

  // Re-read authoritative pair in case a concurrent worker inserted first
  const authoritative = await prisma.systemSetting.findMany({
    where: {
      key: { in: ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"] },
    },
  });
  const authMap = new Map(authoritative.map((row) => [row.key, row.value]));
  return {
    publicKey: authMap.get("VAPID_PUBLIC_KEY") || generated.publicKey,
    privateKey: authMap.get("VAPID_PRIVATE_KEY") || generated.privateKey,
    subject,
  };
}

async function getVapidKeyPair(): Promise<VapidKeyPair> {
  if (!globalThis.__walinkVapidKeysPromise) {
    globalThis.__walinkVapidKeysPromise = resolveOrCreateVapidKeys().catch(
      (err) => {
        globalThis.__walinkVapidKeysPromise = undefined;
        throw err;
      }
    );
  }
  return globalThis.__walinkVapidKeysPromise;
}

/**
 * Returns ONLY the non-secret VAPID Public Key for browser PushManager.subscribe().
 */
export async function getPublicVapidKey(): Promise<string> {
  const keys = await getVapidKeyPair();
  return keys.publicKey;
}

export interface WebPushDispatchInput {
  customerId: string;
  pushSubscription: string | null | undefined;
  title: string;
  body: string;
  url: string;
  tag?: string;
}

/**
 * Sends a cryptographic RFC 8291 Web Push background notification via web-push.
 * Automatically clears stale 404/410 subscriptions from the database.
 */
export async function sendWebPushToCustomer(
  input: WebPushDispatchInput
): Promise<boolean> {
  const subscription = parseAndValidatePushSubscription(input.pushSubscription);
  if (!subscription) {
    return false;
  }

  try {
    const keys = await getVapidKeyPair();
    webpush.setVapidDetails(keys.subject, keys.publicKey, keys.privateKey);

    const payload = JSON.stringify({
      title: input.title,
      body: input.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      url: input.url,
      tag: input.tag || `walink-${Date.now()}`,
      renotify: true,
    });

    await webpush.sendNotification(subscription, payload, {
      TTL: 86400,
      urgency: "high",
    });

    return true;
  } catch (error: unknown) {
    const statusCode =
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : null;

    if (statusCode === 404 || statusCode === 410) {
      // Subscription revoked or expired — clear cleanly so future sends skip it
      await prisma.customer
        .update({
          where: { id: input.customerId },
          data: { pushSubscription: null },
        })
        .catch(() => {});
    } else {
      console.warn("[WebPush] Notification delivery warning:", error);
    }

    return false;
  }
}

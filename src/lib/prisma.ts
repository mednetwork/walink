import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolves the optimal database connection string.
 * On Hostinger Linux production servers, MySQL runs locally on 127.0.0.1:3306.
 * Attempting to connect to the external srvNNNN.hstgr.io domain from inside Hostinger
 * is rejected by Hostinger's server firewall. We automatically normalize it to 127.0.0.1.
 */
function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  if (
    process.env.NODE_ENV === "production" &&
    process.platform === "linux" &&
    url.includes(".hstgr.io")
  ) {
    return url.replace(/@srv\d+\.hstgr\.io:3306/, "@127.0.0.1:3306");
  }

  return url;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

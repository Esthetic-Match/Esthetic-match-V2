import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const dbTarget =
  process.env.DB_TARGET?.toLowerCase() ?? "local";

let connectionString: string;

if (dbTarget === "production") {
  if (
    process.env.ALLOW_PRODUCTION_DB !==
    "YES_I_KNOW_THIS_IS_PRODUCTION"
  ) {
    throw new Error(`
===================================================
🚨 PRODUCTION DATABASE ACCESS BLOCKED 🚨
===================================================

DB_TARGET="production"

Set:

ALLOW_PRODUCTION_DB="YES_I_KNOW_THIS_IS_PRODUCTION"

if you really intend to use production.
===================================================
`);
  }

  connectionString =
    process.env.DATABASE_URL_PRODUCTION ?? "";

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL_PRODUCTION is not set"
    );
  }
} else {
  connectionString =
    process.env.DATABASE_URL_LOCAL ?? "";

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL_LOCAL is not set"
    );
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: pg.Pool;
};

const pool =
  globalForPrisma.pool ??
  new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = prisma;
}
import "dotenv/config";

import { defineConfig } from "prisma/config";

const dbTarget =
  process.env.DB_TARGET?.toLowerCase() ?? "local";

let databaseUrl: string;

if (dbTarget === "production") {
  if (
    process.env.ALLOW_PRODUCTION_DB !==
    "YES_I_KNOW_THIS_IS_PRODUCTION"
  ) {
    throw new Error(`
===================================================
      PRODUCTION DATABASE ACCESS BLOCKED
===================================================

DB_TARGET="production"

But production access has NOT been explicitly authorized.

If you really intend to work on production, set:

ALLOW_PRODUCTION_DB="YES_I_KNOW_THIS_IS_PRODUCTION"

===================================================
`);
  }

  databaseUrl =
    process.env.DATABASE_URL_PRODUCTION ?? "";

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL_PRODUCTION is not defined."
    );
  }

  console.warn(`
===================================================
        USING PRODUCTION DATABASE
===================================================
`);
} else {
  databaseUrl =
    process.env.DATABASE_URL_LOCAL ?? "";

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL_LOCAL is not defined."
    );
  }

  console.log("✅ Using LOCAL database");
}

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: databaseUrl,
  },
});
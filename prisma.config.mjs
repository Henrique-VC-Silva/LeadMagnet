// Plain ES module - no TypeScript, no dotenv.
// Prisma 7 requires datasource.url here (removed from schema.prisma).
// DATABASE_URL is injected at runtime by Dokploy (or from .env locally).
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config"; // 👈 FIXED: Correct Prisma 7 configuration import target

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // ✅ FIXED: Explicitly prioritize the serverless connection pooler (Port 6543)
    url: env("DATABASE_URL"),
  },
});
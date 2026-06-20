// prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

// ✅ FIXED FOR PRISMA 7: Point the CLI to the Direct URL (Port 5432) for migrations & pushes
const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing database connection parameters inside your environment variables configuration.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl, // Passes the Direct Connection port smoothly to the CLI runner
  },
});
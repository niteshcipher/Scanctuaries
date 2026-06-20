import "dotenv/config";
import { defineConfig } from "prisma/config";

const prismaUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!prismaUrl) {
  throw new Error(
    "Set either DIRECT_URL or DATABASE_URL in your .env file before running Prisma commands."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: prismaUrl,
  },
});

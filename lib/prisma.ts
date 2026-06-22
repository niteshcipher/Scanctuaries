// import "dotenv/config";
// import { PrismaClient } from "@/generated/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { Pool } from "pg";

// const globalForPrisma = globalThis as unknown as {
//   prisma?: PrismaClient;
// };

// // ✅ FIX 1: Prioritize the Transaction Pooler (DATABASE_URL) for serverless queries!
// const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

// if (!connectionString) {
//   throw new Error("Neither DATABASE_URL nor DIRECT_URL is set for the Prisma runtime environment.");
// }

// // ✅ FIX 2: Instantiate pool configuration explicitly for pg serverless nodes
// const pool = new Pool({
//   connectionString: connectionString,
//   max: 1, // Keeps connection footprints small per serverless lambda thread instance
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
// });

// const adapter = new PrismaPg(pool);

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//     log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }



// lib/prisma.ts
import { PrismaClient } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 🛡️ SECURITY GUARD: Block runtime bundle rendering if this file leaks into a "use client" view
if (typeof window !== "undefined"|| process.env.NEXT_RUNTIME === "edge") {
  throw new Error("Internal Server Error: PrismaClient cannot be evaluated or rendered on the browser client.");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// 1. Pick the correct connection string based on the environment
const isDev = process.env.NODE_ENV === "development";
const connectionString = isDev 
  ? (process.env.DIRECT_URL ?? process.env.DATABASE_URL)
  : (process.env.DATABASE_URL ?? process.env.DIRECT_URL);

if (!connectionString) {
  throw new Error("Neither DATABASE_URL nor DIRECT_URL is set for the Prisma runtime environment.");
}

// 2. Instantiate pg pool configuration
const pool = new Pool({
  connectionString: connectionString,
  // 3. Scale down connections per lambda instance in production, allow a bit more room locally
  max: isDev ? 5 : 1, 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Raised to 5000ms to handle colder local connection spins
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isDev ? ["query", "error", "warn"] : ["error"],
  });

// ✅ FIXED CRITICAL GAP: Keep the database client cached in globalThis across ALL development hot-reloads.
// Changing this to run only in production or dev can cause connection pooling exhaustion overflows.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
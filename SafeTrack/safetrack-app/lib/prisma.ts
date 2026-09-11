import { PrismaClient } from "@prisma/client";

// Reuse the client across hot reloads in dev so we don't exhaust
// Postgres connections every time a file changes.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

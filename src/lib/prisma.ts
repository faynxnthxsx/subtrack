// src/lib/prisma.ts
// Prisma Client Singleton — สร้างครั้งเดียวใช้ทั้ง app
// ป้องกัน connection หลุดตอน hot reload ใน dev mode

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
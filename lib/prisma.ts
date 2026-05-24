import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("prisma+postgres://") || url.startsWith("prisma://")) {
    return new PrismaClient({ accelerateUrl: url }).$extends(
      withAccelerate()
    ) as unknown as PrismaClient;
  }

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

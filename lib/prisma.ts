import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { pgConnectionString } from "@/lib/pg-connection";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL não está definida.");
  }
  const connectionString = pgConnectionString(raw);

  const pool = globalForPrisma.pgPool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/** Delegates novos após `prisma generate` — recria o client se o cache do dev for antigo. */
function clientHasTrackingBreakdown(client: PrismaClient) {
  const extended = client as PrismaClient & {
    trackingEventDailyMetric?: { groupBy?: unknown };
    trackingCampaignDailyMetric?: { groupBy?: unknown };
  };
  return (
    typeof extended.trackingEventDailyMetric?.groupBy === "function" &&
    typeof extended.trackingCampaignDailyMetric?.groupBy === "function"
  );
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && clientHasTrackingBreakdown(cached)) {
    return cached;
  }
  const fresh = createPrismaClient();
  if (!clientHasTrackingBreakdown(fresh)) {
    throw new Error(
      "Prisma Client desatualizado. Rode npm run db:generate e reinicie o next dev.",
    );
  }
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = fresh;
  }
  return fresh;
}

export const prisma = getPrismaClient();

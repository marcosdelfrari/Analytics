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

type CachedPrismaClient = PrismaClient & {
  trackingEventDailyMetric?: { groupBy?: unknown };
  trackingCampaignDailyMetric?: { groupBy?: unknown };
  _runtimeDataModel?: {
    models?: {
      AccessGrant?: { fields?: Array<{ name: string }> };
    };
  };
};

/** Recria o client se o singleton do dev foi criado antes do schema atual. */
function clientMatchesCurrentSchema(client: PrismaClient) {
  if (client.constructor !== PrismaClient) return false;

  const extended = client as CachedPrismaClient;
  const hasTracking =
    typeof extended.trackingEventDailyMetric?.groupBy === "function" &&
    typeof extended.trackingCampaignDailyMetric?.groupBy === "function";
  const hasOwner =
    extended._runtimeDataModel?.models?.AccessGrant?.fields?.some(
      (field) => field.name === "isOwner",
    ) === true;

  return hasTracking && hasOwner;
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  if (cached && clientMatchesCurrentSchema(cached)) {
    return cached;
  }
  const fresh = createPrismaClient();
  if (!clientMatchesCurrentSchema(fresh)) {
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

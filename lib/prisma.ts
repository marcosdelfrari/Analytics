import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { pgConnectionString } from "@/lib/pg-connection";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  pgPoolConnectionString: string | undefined;
};

function getOrCreatePool(connectionString: string) {
  if (
    globalForPrisma.pgPool &&
    globalForPrisma.pgPoolConnectionString === connectionString
  ) {
    return globalForPrisma.pgPool;
  }

  void globalForPrisma.pgPool?.end().catch(() => undefined);

  const pool = new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
    globalForPrisma.pgPoolConnectionString = connectionString;
  }
  return pool;
}

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL não está definida.");
  }
  const connectionString = pgConnectionString(raw);

  const pool = getOrCreatePool(connectionString);

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

type CachedPrismaClient = PrismaClient & {
  trackingEventDailyMetric?: { groupBy?: unknown };
  trackingCampaignDailyMetric?: { groupBy?: unknown };
  leadForm?: { findMany?: unknown };
  _runtimeDataModel?: {
    models?: {
      AccessGrant?: { fields?: Array<{ name: string }> };
      AccessGrantCompany?: { fields?: Array<{ name: string }> };
      LeadForm?: { fields?: Array<{ name: string }> };
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
  const hasOrgProprietario =
    extended._runtimeDataModel?.models?.AccessGrant?.fields?.some(
      (field) => field.name === "isOrgProprietario",
    ) === true;
  const hasCompanyAccessRole =
    extended._runtimeDataModel?.models?.AccessGrantCompany?.fields?.some(
      (field) => field.name === "role",
    ) === true;
  const hasLeadForm = typeof extended.leadForm?.findMany === "function";

  return hasTracking && hasOrgProprietario && hasCompanyAccessRole && hasLeadForm;
}

function getPrismaClient() {
  const raw = process.env.DATABASE_URL;
  const connectionString = raw ? pgConnectionString(raw) : "";

  const cached = globalForPrisma.prisma;
  if (
    cached &&
    clientMatchesCurrentSchema(cached) &&
    globalForPrisma.pgPoolConnectionString === connectionString
  ) {
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

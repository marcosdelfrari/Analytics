import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { pgConnectionString } from "@/lib/pg-connection";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  pgPoolConnectionString: string | undefined;
  pgAdapter: PrismaPg | undefined;
};

function getOrCreatePool(connectionString: string) {
  if (
    globalForPrisma.pgPool &&
    globalForPrisma.pgPoolConnectionString === connectionString
  ) {
    return globalForPrisma.pgPool;
  }

  void globalForPrisma.pgPool?.end().catch(() => undefined);
  globalForPrisma.pgAdapter = undefined;

  const pool = new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") {
    // HMR recria o Prisma Client; cada adapter registra um listener "error" no pool.
    pool.setMaxListeners(0);
  }
  globalForPrisma.pgPool = pool;
  globalForPrisma.pgPoolConnectionString = connectionString;
  return pool;
}

function getOrCreatePgAdapter(pool: Pool) {
  if (globalForPrisma.pgAdapter && globalForPrisma.pgPool === pool) {
    return globalForPrisma.pgAdapter;
  }
  const adapter = new PrismaPg(pool);
  globalForPrisma.pgAdapter = adapter;
  return adapter;
}

function disconnectCachedPrismaClient() {
  const previous = globalForPrisma.prisma;
  if (!previous) return;
  globalForPrisma.prisma = undefined;
  void previous.$disconnect().catch(() => undefined);
}

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL não está definida.");
  }
  const connectionString = pgConnectionString(raw);

  const pool = getOrCreatePool(connectionString);

  const adapter = getOrCreatePgAdapter(pool);
  return new PrismaClient({ adapter });
}

type CachedPrismaClient = PrismaClient & {
  trackingEventDailyMetric?: { groupBy?: unknown };
  trackingCampaignDailyMetric?: { groupBy?: unknown };
  leadForm?: { findMany?: unknown };
  trafficProposal?: { findFirst?: unknown };
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
  const hasTrafficProposal =
    typeof extended.trafficProposal?.findFirst === "function";

  return (
    hasTracking &&
    hasOrgProprietario &&
    hasCompanyAccessRole &&
    hasLeadForm &&
    hasTrafficProposal
  );
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

  disconnectCachedPrismaClient();

  const fresh = createPrismaClient();
  if (!clientMatchesCurrentSchema(fresh)) {
    void fresh.$disconnect().catch(() => undefined);
    throw new Error(
      "Prisma Client desatualizado. Rode npm run db:generate e reinicie o next dev.",
    );
  }
  globalForPrisma.prisma = fresh;
  return fresh;
}

export const prisma = getPrismaClient();

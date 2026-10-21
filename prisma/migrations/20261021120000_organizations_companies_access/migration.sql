-- DropForeignKey (idempotente)
ALTER TABLE "tracking_sites" DROP CONSTRAINT IF EXISTS "tracking_sites_user_id_fkey";
ALTER TABLE "tracking_sites" DROP CONSTRAINT IF EXISTS "tracking_sites_company_id_fkey";

-- CreateTable
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "companies" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "access_grants" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "all_companies" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "access_grant_companies" (
    "grant_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "access_grant_companies_pkey" PRIMARY KEY ("grant_id","company_id")
);

-- Backfill legado (clientes e qualquer conta com site de rastreamento)
INSERT INTO "organizations" ("id", "name", "created_at", "updated_at")
SELECT
    u."id",
    u."name",
    u."created_at",
    u."updated_at"
FROM "users" u
WHERE u."role" = 'client'
   OR EXISTS (
        SELECT 1 FROM "tracking_sites" ts
        WHERE ts."user_id" = u."id"
   )
ON CONFLICT DO NOTHING;

INSERT INTO "companies" ("id", "organization_id", "name", "plan_active", "created_at", "updated_at")
SELECT
    u."id",
    u."id",
    u."name",
    u."plan_active",
    u."created_at",
    u."updated_at"
FROM "users" u
WHERE u."role" = 'client'
   OR EXISTS (
        SELECT 1 FROM "tracking_sites" ts
        WHERE ts."user_id" = u."id"
   )
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tracking_sites'
      AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "tracking_sites" RENAME COLUMN "user_id" TO "company_id";
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.tracking_sites_user_id_key') IS NOT NULL THEN
    ALTER INDEX "tracking_sites_user_id_key" RENAME TO "tracking_sites_company_id_key";
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "companies_organization_id_idx" ON "companies"("organization_id");
CREATE INDEX IF NOT EXISTS "access_grants_email_idx" ON "access_grants"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "access_grants_organization_id_email_key" ON "access_grants"("organization_id", "email");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'companies_organization_id_fkey'
  ) THEN
    ALTER TABLE "companies" ADD CONSTRAINT "companies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'access_grants_organization_id_fkey'
  ) THEN
    ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'access_grant_companies_grant_id_fkey'
  ) THEN
    ALTER TABLE "access_grant_companies" ADD CONSTRAINT "access_grant_companies_grant_id_fkey" FOREIGN KEY ("grant_id") REFERENCES "access_grants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'access_grant_companies_company_id_fkey'
  ) THEN
    ALTER TABLE "access_grant_companies" ADD CONSTRAINT "access_grant_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tracking_sites_company_id_fkey'
  ) THEN
    ALTER TABLE "tracking_sites" ADD CONSTRAINT "tracking_sites_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "access_grants" ("id", "organization_id", "email", "all_companies", "created_at")
SELECT
    gen_random_uuid()::text,
    u."id",
    u."email",
    true,
    u."created_at"
FROM "users" u
WHERE u."role" = 'client'
ON CONFLICT ("organization_id", "email") DO NOTHING;

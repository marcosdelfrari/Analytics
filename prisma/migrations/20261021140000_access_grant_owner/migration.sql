-- Proprietário da organização (gerencia empresas e convites); membros só usam a plataforma.
ALTER TABLE "access_grants" ADD COLUMN "is_owner" BOOLEAN NOT NULL DEFAULT false;

UPDATE "access_grants" SET "is_owner" = true WHERE "all_companies" = true;

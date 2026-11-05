-- Corrige drift legado que já existia antes da reorganização por schemas.
-- 1) lead_submissions.id foi criada como UUID; o Prisma e o restante do banco usam TEXT.
-- 2) 20261019160000_traffic_proposals existe em _prisma_migrations sem o arquivo no Git;
--    o stub restaurado muda o checksum — alinhamos o registro.

ALTER TABLE "lead_submissions"
  ALTER COLUMN "id" TYPE TEXT USING "id"::text;

UPDATE "_prisma_migrations"
SET "checksum" = '017b3bef64d18308aac9e5d57961836b701f134ee049f51d78d271188793c2b3'
WHERE "migration_name" = '20261019160000_traffic_proposals'
  AND "finished_at" IS NOT NULL
  AND "rolled_back_at" IS NULL;
-- Papel de acesso definido por vínculo usuário ↔ empresa (não só no grant).
CREATE TYPE "company_access_role" AS ENUM ('administrator', 'analyst');

ALTER TABLE "access_grant_companies"
ADD COLUMN "role" "company_access_role" NOT NULL DEFAULT 'analyst';

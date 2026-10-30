-- Backfill único (idempotente). Runtime não reexecuta migração de orgs legadas.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO app_meta (key, value)
VALUES ('legacy_orgs_migrated_v2', '1')
ON CONFLICT (key) DO NOTHING;

-- Org/empresa do admin da plataforma
INSERT INTO organizations (id, name, created_at, updated_at)
SELECT u.id, 'Lótus', NOW(), NOW()
FROM users u
WHERE u.role = 'admin'
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

INSERT INTO companies (id, organization_id, name, plan_active, created_at, updated_at)
SELECT u.id, u.id, 'Lótus', true, NOW(), NOW()
FROM users u
WHERE u.role = 'admin'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  plan_active = true,
  updated_at = NOW();

INSERT INTO access_grants (id, organization_id, email, all_companies, is_owner, created_at)
SELECT gen_random_uuid(), u.id, u.email, true, true, NOW()
FROM users u
WHERE u.role = 'admin'
ON CONFLICT (organization_id, email) DO UPDATE SET
  all_companies = true,
  is_owner = true;

-- Clientes legados: org id = user id (exceto convidados só em org alheia)
INSERT INTO organizations (id, name, created_at, updated_at)
SELECT u.id, u.name, NOW(), NOW()
FROM users u
WHERE u.role = 'client'
  AND NOT (
    EXISTS (SELECT 1 FROM access_grants g WHERE lower(g.email) = lower(u.email))
    AND NOT EXISTS (
      SELECT 1 FROM access_grants g
      WHERE lower(g.email) = lower(u.email) AND g.organization_id = u.id
    )
  )
  AND (
    NOT EXISTS (SELECT 1 FROM access_grants g WHERE lower(g.email) = lower(u.email))
    OR EXISTS (
      SELECT 1 FROM access_grants g
      WHERE lower(g.email) = lower(u.email) AND g.organization_id = u.id
    )
    OR EXISTS (SELECT 1 FROM organizations o WHERE o.id = u.id)
  )
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

INSERT INTO companies (id, organization_id, name, plan_active, created_at, updated_at)
SELECT u.id, u.id, u.name, COALESCE(u.plan_active, false), NOW(), NOW()
FROM users u
WHERE u.role = 'client'
  AND EXISTS (SELECT 1 FROM organizations o WHERE o.id = u.id)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

INSERT INTO access_grants (id, organization_id, email, all_companies, is_owner, created_at)
SELECT gen_random_uuid(), u.id, u.email, true, true, NOW()
FROM users u
WHERE u.role = 'client'
  AND EXISTS (SELECT 1 FROM organizations o WHERE o.id = u.id)
ON CONFLICT (organization_id, email) DO UPDATE SET
  is_owner = true,
  all_companies = true;

-- Usuários referenciados em grants
INSERT INTO users (id, email, name, role, plan_active, created_at, updated_at)
SELECT gen_random_uuid(), lower(g.email), split_part(lower(g.email), '@', 1), 'client', false, NOW(), NOW()
FROM access_grants g
WHERE g.email LIKE '%@%'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.email) = lower(g.email))
ON CONFLICT (email) DO NOTHING;

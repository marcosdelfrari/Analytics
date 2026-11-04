-- Contas que só existiam em organizações removidas (sem grant restante).
DELETE FROM "login_otps" AS o
WHERE NOT EXISTS (
  SELECT 1 FROM "access_grants" g WHERE lower(g.email) = lower(o.email)
);

DELETE FROM "users" AS u
WHERE NOT EXISTS (
  SELECT 1 FROM "access_grants" g WHERE lower(g.email) = lower(u.email)
);

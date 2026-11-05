-- Contas que só existiam em organizações removidas (sem grant restante).
DELETE FROM "dbo"."aux_login_otp" AS o
WHERE NOT EXISTS (
  SELECT 1 FROM "dbo"."cad_acesso" g WHERE lower(g.email) = lower(o.email)
);

DELETE FROM "dbo"."cad_usuario" AS u
WHERE NOT EXISTS (
  SELECT 1 FROM "dbo"."cad_acesso" g WHERE lower(g.email) = lower(u.email)
);

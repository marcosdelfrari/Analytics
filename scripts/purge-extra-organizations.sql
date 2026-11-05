-- Remove organizações exceto Lótus e Varte Company (CASCADE apaga empresas, grants, forms, etc.).
DELETE FROM "dbo"."cad_organizacao"
WHERE "name" NOT IN ('Lótus', 'Varte Company');

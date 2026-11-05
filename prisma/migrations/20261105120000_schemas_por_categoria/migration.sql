-- Reorganiza o banco em schemas por categoria e renomeia as tabelas.
-- Só move/renomeia objetos (sem cópia de dados). Índices, PKs e FKs
-- ganham o prefixo da nova tabela para casar com os nomes padrão do Prisma.

CREATE SCHEMA IF NOT EXISTS "dbo";
CREATE SCHEMA IF NOT EXISTS "leads";
CREATE SCHEMA IF NOT EXISTS "tracking";
CREATE SCHEMA IF NOT EXISTS "marketing";

ALTER TYPE "public"."Role" SET SCHEMA "dbo";
ALTER TYPE "public"."company_access_role" SET SCHEMA "dbo";
ALTER TYPE "public"."LeadFormKind" SET SCHEMA "leads";

DO $$
DECLARE
  m RECORD;
  obj RECORD;
BEGIN
  FOR m IN
    SELECT * FROM (VALUES
      ('users',                                 'dbo',       'cad_usuario'),
      ('app_meta',                              'dbo',       'cfg_parametro'),
      ('login_otps',                            'dbo',       'aux_login_otp'),
      ('organizations',                         'dbo',       'cad_organizacao'),
      ('companies',                             'dbo',       'cad_empresa'),
      ('access_grants',                         'dbo',       'cad_acesso'),
      ('access_grant_companies',                'dbo',       'cad_acesso_empresa'),
      ('lead_forms',                            'leads',     'cad_formulario'),
      ('lead_submissions',                      'leads',     'mov_submissao'),
      ('tracking_sites',                        'tracking',  'cad_site'),
      ('tracking_allowed_domains',              'tracking',  'cad_dominio_permitido'),
      ('tracking_hits',                         'tracking',  'mov_hit'),
      ('tracking_visitor_daily',                'tracking',  'agr_visitante_dia'),
      ('tracking_daily_metrics',                'tracking',  'agr_metrica_dia'),
      ('tracking_event_daily_metrics',          'tracking',  'agr_evento_dia'),
      ('tracking_event_platform_daily_metrics', 'tracking',  'agr_evento_plataforma_dia'),
      ('tracking_campaign_daily_metrics',       'tracking',  'agr_campanha_dia'),
      ('tracking_attribution_daily_metrics',    'tracking',  'agr_atribuicao_dia'),
      ('tracking_path_daily_metrics',           'tracking',  'agr_pagina_dia'),
      ('tracking_path_flow_daily_metrics',      'tracking',  'agr_fluxo_pagina_dia'),
      ('short_links',                           'marketing', 'cad_link_curto'),
      ('published_reports',                     'marketing', 'mov_relatorio_publicado')
    ) AS t(old_name, new_schema, new_name)
  LOOP
    EXECUTE format('ALTER TABLE "public".%I SET SCHEMA %I', m.old_name, m.new_schema);
    EXECUTE format('ALTER TABLE %I.%I RENAME TO %I', m.new_schema, m.old_name, m.new_name);

    -- PK/FK: renomear a constraint também renomeia o índice da PK.
    FOR obj IN
      SELECT co.conname
      FROM pg_constraint co
      WHERE co.conrelid = format('%I.%I', m.new_schema, m.new_name)::regclass
        AND left(co.conname, length(m.old_name) + 1) = m.old_name || '_'
    LOOP
      EXECUTE format(
        'ALTER TABLE %I.%I RENAME CONSTRAINT %I TO %I',
        m.new_schema, m.new_name, obj.conname,
        m.new_name || substr(obj.conname, length(m.old_name) + 1)
      );
    END LOOP;

    FOR obj IN
      SELECT ic.relname AS indexname
      FROM pg_index i
      JOIN pg_class ic ON ic.oid = i.indexrelid
      WHERE i.indrelid = format('%I.%I', m.new_schema, m.new_name)::regclass
        AND left(ic.relname, length(m.old_name) + 1) = m.old_name || '_'
    LOOP
      EXECUTE format(
        'ALTER INDEX %I.%I RENAME TO %I',
        m.new_schema, obj.indexname,
        m.new_name || substr(obj.indexname, length(m.old_name) + 1)
      );
    END LOOP;
  END LOOP;
END $$;

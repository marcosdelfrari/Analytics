CREATE TABLE "marketing"."mov_importacao_ads" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "period_from" TEXT,
    "period_to" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "campaign_name" TEXT NOT NULL DEFAULT '',
    "parsed" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mov_importacao_ads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mov_importacao_ads_company_id_created_at_idx" ON "marketing"."mov_importacao_ads"("company_id", "created_at");

CREATE UNIQUE INDEX "mov_importacao_ads_company_id_content_hash_key" ON "marketing"."mov_importacao_ads"("company_id", "content_hash");

ALTER TABLE "marketing"."mov_importacao_ads" ADD CONSTRAINT "mov_importacao_ads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "dbo"."cad_empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
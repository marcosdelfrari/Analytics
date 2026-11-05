-- Tabelas da aplicação Lótus (schema public), espelhando o banco Lotus legado no Prisma Cloud.

CREATE TYPE "ProposalStatus" AS ENUM ('requested', 'sent', 'accepted', 'cancelled');

CREATE TABLE "traffic_proposals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT '',
    "monthly_media_budget" INTEGER,
    "goals" TEXT NOT NULL DEFAULT '',
    "contact_phone" TEXT NOT NULL DEFAULT '',
    "title" TEXT,
    "scope" JSONB NOT NULL DEFAULT '[]',
    "services" JSONB NOT NULL DEFAULT '[]',
    "ad_budget_suggestion" INTEGER,
    "deadline_days" INTEGER,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "valid_until" DATE,
    "status" "ProposalStatus" NOT NULL DEFAULT 'requested',
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traffic_proposals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "traffic_proposals_user_id_idx" ON "traffic_proposals"("user_id");

CREATE TABLE "interessados" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interessados_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "interessados_user_id_idx" ON "interessados"("user_id");
CREATE INDEX "interessados_created_at_idx" ON "interessados"("created_at");

ALTER TABLE "traffic_proposals" ADD COLUMN "acceptance" JSONB;

ALTER TYPE "ProposalStatus" ADD VALUE IF NOT EXISTS 'draft';

ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "intro" TEXT NOT NULL DEFAULT '';
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "setup_fee" INTEGER;
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "implementation_plan" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "terms" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "client_email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "traffic_proposals" ADD COLUMN IF NOT EXISTS "client_name" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "traffic_proposals_client_email_idx" ON "traffic_proposals"("client_email");

CREATE TYPE "BillingItemKind" AS ENUM ('setup', 'monthly');
CREATE TYPE "BillingItemStatus" AS ENUM ('pending', 'paid');

CREATE TABLE "proposal_billing_items" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "kind" "BillingItemKind" NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "due_date" DATE,
    "status" "BillingItemStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_billing_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "proposal_billing_items_proposal_id_idx" ON "proposal_billing_items"("proposal_id");
CREATE INDEX "proposal_billing_items_status_idx" ON "proposal_billing_items"("status");

ALTER TABLE "proposal_billing_items" ADD CONSTRAINT "proposal_billing_items_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "traffic_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "MarketingPlanStatus" AS ENUM ('draft', 'saved');

CREATE TABLE "marketing_plans" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "analytics_company_id" TEXT NOT NULL,
    "operation_proposal" TEXT NOT NULL,
    "funnel_touchpoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "media_channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ad_formats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "custom_assets" TEXT NOT NULL DEFAULT '',
    "status" "MarketingPlanStatus" NOT NULL DEFAULT 'saved',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_plans_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "marketing_plans_proposal_id_idx" ON "marketing_plans"("proposal_id");
CREATE UNIQUE INDEX "marketing_plans_proposal_id_analytics_company_id_key" ON "marketing_plans"("proposal_id", "analytics_company_id");

ALTER TABLE "marketing_plans" ADD CONSTRAINT "marketing_plans_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "traffic_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

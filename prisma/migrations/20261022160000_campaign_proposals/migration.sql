-- CreateEnum
CREATE TYPE "CampaignProposalStatus" AS ENUM ('draft', 'saved');

-- CreateTable
CREATE TABLE "campaign_proposals" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "traffic_proposal_id" TEXT,
    "campaign_purpose" TEXT NOT NULL,
    "acquisition_flow" TEXT NOT NULL,
    "campaign_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "status" "CampaignProposalStatus" NOT NULL DEFAULT 'saved',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_proposals_company_id_idx" ON "campaign_proposals"("company_id");

-- CreateIndex
CREATE INDEX "campaign_proposals_traffic_proposal_id_idx" ON "campaign_proposals"("traffic_proposal_id");

-- AddForeignKey
ALTER TABLE "campaign_proposals" ADD CONSTRAINT "campaign_proposals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

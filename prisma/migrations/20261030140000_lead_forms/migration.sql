-- CreateEnum
CREATE TYPE "LeadFormKind" AS ENUM ('whatsapp_button', 'popup', 'exit_intent');

-- CreateTable
CREATE TABLE "lead_forms" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "company_id" TEXT,
    "name" TEXT NOT NULL,
    "kind" "LeadFormKind" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "subtitle" TEXT NOT NULL DEFAULT '',
    "cta_label" TEXT NOT NULL DEFAULT 'Enviar',
    "whatsapp_number" TEXT NOT NULL DEFAULT '',
    "whatsapp_message" TEXT NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL,
    "send_confirmation_email" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_email_subject" TEXT NOT NULL DEFAULT '',
    "confirmation_email_body" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_forms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_forms_organization_id_idx" ON "lead_forms"("organization_id");

-- CreateIndex
CREATE INDEX "lead_forms_company_id_idx" ON "lead_forms"("company_id");

-- AddForeignKey
ALTER TABLE "lead_forms" ADD CONSTRAINT "lead_forms_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_forms" ADD CONSTRAINT "lead_forms_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

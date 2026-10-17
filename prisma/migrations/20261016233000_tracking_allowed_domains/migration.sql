-- CreateTable
CREATE TABLE "tracking_allowed_domains" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_allowed_domains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tracking_allowed_domains_site_id_host_key" ON "tracking_allowed_domains"("site_id", "host");

-- CreateIndex
CREATE INDEX "tracking_allowed_domains_site_id_idx" ON "tracking_allowed_domains"("site_id");

-- AddForeignKey
ALTER TABLE "tracking_allowed_domains" ADD CONSTRAINT "tracking_allowed_domains_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

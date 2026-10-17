-- AlterTable
ALTER TABLE "tracking_hits" ADD COLUMN "client_event_id" TEXT;
ALTER TABLE "tracking_hits" ADD COLUMN "processed_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "tracking_hits_client_event_id_key" ON "tracking_hits"("client_event_id");

-- CreateIndex
CREATE INDEX "tracking_hits_processed_at_created_at_idx" ON "tracking_hits"("processed_at", "created_at");

-- CreateTable
CREATE TABLE "tracking_daily_metrics" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tracking_daily_metrics_pkey" PRIMARY KEY ("site_id","day")
);

-- AddForeignKey
ALTER TABLE "tracking_daily_metrics" ADD CONSTRAINT "tracking_daily_metrics_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

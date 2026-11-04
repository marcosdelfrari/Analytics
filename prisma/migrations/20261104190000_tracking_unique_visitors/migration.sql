-- AlterTable
ALTER TABLE "tracking_hits" ADD COLUMN IF NOT EXISTS "visitor_id" TEXT;

-- AlterTable
ALTER TABLE "tracking_daily_metrics" ADD COLUMN IF NOT EXISTS "visitors" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "tracking_visitor_daily" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "visitor_id" TEXT NOT NULL,

    CONSTRAINT "tracking_visitor_daily_pkey" PRIMARY KEY ("site_id", "day", "visitor_id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tracking_hits_site_id_visitor_id_created_at_idx"
  ON "tracking_hits"("site_id", "visitor_id", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tracking_visitor_daily_site_id_day_idx"
  ON "tracking_visitor_daily"("site_id", "day");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tracking_visitor_daily_site_id_fkey'
  ) THEN
    ALTER TABLE "tracking_visitor_daily"
      ADD CONSTRAINT "tracking_visitor_daily_site_id_fkey"
      FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

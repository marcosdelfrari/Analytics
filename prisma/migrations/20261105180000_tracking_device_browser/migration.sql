-- AlterTable
ALTER TABLE "tracking"."mov_hit" ADD COLUMN IF NOT EXISTS "browser" TEXT NOT NULL DEFAULT '';
ALTER TABLE "tracking"."mov_hit" ADD COLUMN IF NOT EXISTS "os" TEXT NOT NULL DEFAULT '';
ALTER TABLE "tracking"."mov_hit" ADD COLUMN IF NOT EXISTS "device_type" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE IF NOT EXISTS "tracking"."agr_dispositivo_dia" (
    "site_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "device_type" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "agr_dispositivo_dia_pkey" PRIMARY KEY ("site_id","day","device_type","browser","os")
);

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agr_dispositivo_dia_site_id_fkey'
  ) THEN
    ALTER TABLE "tracking"."agr_dispositivo_dia"
      ADD CONSTRAINT "agr_dispositivo_dia_site_id_fkey"
      FOREIGN KEY ("site_id") REFERENCES "tracking"."cad_site"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

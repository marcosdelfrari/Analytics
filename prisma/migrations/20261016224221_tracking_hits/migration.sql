-- CreateTable
CREATE TABLE "tracking_sites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_hits" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT '',
    "params" JSONB NOT NULL,
    "properties" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_hits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tracking_sites_user_id_key" ON "tracking_sites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_sites_public_key_key" ON "tracking_sites"("public_key");

-- CreateIndex
CREATE INDEX "tracking_hits_site_id_created_at_idx" ON "tracking_hits"("site_id", "created_at");

-- AddForeignKey
ALTER TABLE "tracking_sites" ADD CONSTRAINT "tracking_sites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_hits" ADD CONSTRAINT "tracking_hits_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

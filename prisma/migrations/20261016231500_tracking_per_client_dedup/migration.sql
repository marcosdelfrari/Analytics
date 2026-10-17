-- DropIndex
DROP INDEX "tracking_hits_client_event_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "tracking_hits_site_id_client_event_id_key" ON "tracking_hits"("site_id", "client_event_id");

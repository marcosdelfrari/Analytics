import { randomUUID } from "node:crypto";
import { pool } from "./db.js";
import type { NormalizedHit } from "./types.js";

export type InsertResult = {
  accepted: number;
  duplicates: number;
};

export async function insertHits(
  siteId: string,
  hits: NormalizedHit[],
): Promise<InsertResult> {
  if (hits.length === 0) {
    return { accepted: 0, duplicates: 0 };
  }

  const values: unknown[] = [];
  const rows: string[] = [];

  hits.forEach((hit, index) => {
    const base = index * 10;
    rows.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}::jsonb, $${base + 10}::jsonb, NOW())`,
    );
    values.push(
      randomUUID(),
      hit.clientEventId,
      siteId,
      hit.kind,
      hit.name,
      hit.url,
      hit.path,
      hit.referrer,
      JSON.stringify(hit.params),
      JSON.stringify(hit.properties),
    );
  });

  const result = await pool.query(
    `INSERT INTO tracking_hits
      (id, client_event_id, site_id, kind, name, url, path, referrer, params, properties, created_at)
     VALUES ${rows.join(", ")}
     ON CONFLICT (site_id, client_event_id) DO NOTHING`,
    values,
  );

  const accepted = result.rowCount ?? 0;
  return {
    accepted,
    duplicates: hits.length - accepted,
  };
}

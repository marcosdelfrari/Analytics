import { WORKER_BATCH_SIZE } from "../shared/constants.js";
import { campaignFromParams } from "../shared/campaign-key.js";
import { dayKeyInTimeZone } from "../shared/day-key.js";
import { pool } from "../shared/db.js";

type ClaimedHit = {
  id: string;
  site_id: string;
  kind: string;
  name: string;
  params: unknown;
  created_at: Date;
};

type DailyDelta = {
  pageviews: number;
  events: number;
};

function compositeKey(parts: string[]) {
  return parts.join("\u001f");
}

function splitCompositeKey(key: string) {
  return key.split("\u001f");
}

export async function processBatch(): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const claimed = await client.query<ClaimedHit>(
      `SELECT id, site_id, kind, name, params, created_at
       FROM tracking_hits
       WHERE processed_at IS NULL
       ORDER BY created_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [WORKER_BATCH_SIZE],
    );

    if (claimed.rowCount === 0) {
      await client.query("COMMIT");
      return 0;
    }

    const metrics = new Map<string, DailyDelta>();
    const eventMetrics = new Map<string, number>();
    const campaignMetrics = new Map<string, DailyDelta>();
    const ids: string[] = [];

    for (const row of claimed.rows) {
      ids.push(row.id);
      const day = dayKeyInTimeZone(row.created_at);
      const bucketKey = compositeKey([row.site_id, day]);
      const daily = metrics.get(bucketKey) ?? { pageviews: 0, events: 0 };
      const campaign = campaignFromParams(row.params);
      const campaignKey = compositeKey([row.site_id, day, campaign]);
      const campaignDaily = campaignMetrics.get(campaignKey) ?? {
        pageviews: 0,
        events: 0,
      };

      if (row.kind === "pageview") {
        daily.pageviews += 1;
        campaignDaily.pageviews += 1;
      } else {
        daily.events += 1;
        campaignDaily.events += 1;
        const eventKey = compositeKey([
          row.site_id,
          day,
          row.name.slice(0, 80),
        ]);
        eventMetrics.set(eventKey, (eventMetrics.get(eventKey) ?? 0) + 1);
      }

      metrics.set(bucketKey, daily);
      campaignMetrics.set(campaignKey, campaignDaily);
    }

    for (const [bucketKey, delta] of metrics) {
      const [siteId, day] = splitCompositeKey(bucketKey);
      await client.query(
        `INSERT INTO tracking_daily_metrics (site_id, day, pageviews, events)
         VALUES ($1, $2::date, $3, $4)
         ON CONFLICT (site_id, day)
         DO UPDATE SET
           pageviews = tracking_daily_metrics.pageviews + EXCLUDED.pageviews,
           events = tracking_daily_metrics.events + EXCLUDED.events`,
        [siteId, day, delta.pageviews, delta.events],
      );
    }

    for (const [bucketKey, count] of eventMetrics) {
      const [siteId, day, eventName] = splitCompositeKey(bucketKey);
      await client.query(
        `INSERT INTO tracking_event_daily_metrics (site_id, day, event_name, count)
         VALUES ($1, $2::date, $3, $4)
         ON CONFLICT (site_id, day, event_name)
         DO UPDATE SET
           count = tracking_event_daily_metrics.count + EXCLUDED.count`,
        [siteId, day, eventName, count],
      );
    }

    for (const [bucketKey, delta] of campaignMetrics) {
      const [siteId, day, campaign] = splitCompositeKey(bucketKey);
      await client.query(
        `INSERT INTO tracking_campaign_daily_metrics (site_id, day, campaign, pageviews, events)
         VALUES ($1, $2::date, $3, $4, $5)
         ON CONFLICT (site_id, day, campaign)
         DO UPDATE SET
           pageviews = tracking_campaign_daily_metrics.pageviews + EXCLUDED.pageviews,
           events = tracking_campaign_daily_metrics.events + EXCLUDED.events`,
        [siteId, day, campaign, delta.pageviews, delta.events],
      );
    }

    await client.query(
      `UPDATE tracking_hits
       SET processed_at = NOW()
       WHERE id = ANY($1::text[])`,
      [ids],
    );

    await client.query("COMMIT");
    return ids.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

import { NextResponse } from "next/server";
import { isSystemAdminAccount } from "@/lib/access-roles";
import { authEnabled } from "@/lib/auth-config";
import { getActiveCompanyIdForSession, getSession } from "@/lib/auth";
import {
  daysInRange,
  isDateKey,
  MAX_REPORT_RANGE_DAYS,
  type TrackingWindow,
} from "@/lib/report-period";
import {
  HIT_HISTORY_LIMIT,
  jsonStringEntries,
  listEventHitHistory,
  listPageHitHistory,
  trackingSiteForCompany,
} from "@/lib/tracking";
import type { TrackingMediaOrigin } from "@/lib/utm-platform";

const MEDIA_ORIGINS = new Set<TrackingMediaOrigin>([
  "google",
  "meta",
  "other",
  "none",
]);

function parseMediaOrigin(raw: string | null): TrackingMediaOrigin | undefined {
  if (!raw) return undefined;
  if (MEDIA_ORIGINS.has(raw as TrackingMediaOrigin)) {
    return raw as TrackingMediaOrigin;
  }
  return undefined;
}

const MAX_PATH = 500;
const MAX_EVENT_NAME = 200;

function serializeHit(
  hit: Awaited<ReturnType<typeof listPageHitHistory>>["hits"][number],
) {
  return {
    id: hit.id,
    at: hit.createdAt.toISOString(),
    kind: hit.kind,
    name: hit.name,
    path: hit.path,
    url: hit.url,
    referrer: hit.referrer,
    visitorId: hit.visitorId,
    params: jsonStringEntries(hit.params),
    properties: jsonStringEntries(hit.properties),
  };
}

function parseWindow(fromRaw: string | null, toRaw: string | null) {
  if (!fromRaw || !toRaw || !isDateKey(fromRaw) || !isDateKey(toRaw)) {
    return { error: "Informe um período válido (from e to)." as const };
  }
  const from = fromRaw <= toRaw ? fromRaw : toRaw;
  const to = fromRaw <= toRaw ? toRaw : fromRaw;
  if (daysInRange(from, to) > MAX_REPORT_RANGE_DAYS) {
    return { error: "Período acima do limite." as const };
  }
  return { window: { from, to } satisfies TrackingWindow };
}

export async function GET(request: Request) {
  if (!authEnabled) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!isSystemAdminAccount(session.role) && session.role !== "client") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const companyId = await getActiveCompanyIdForSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Sem empresa ativa." }, { status: 403 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const parsed = parseWindow(
    url.searchParams.get("from"),
    url.searchParams.get("to"),
  );
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const site = await trackingSiteForCompany(companyId);
  if (!site) {
    return NextResponse.json({ error: "Site de coleta não encontrado." }, { status: 404 });
  }

  if (type === "page") {
    const path = url.searchParams.get("path")?.trim() ?? "";
    if (!path || path.length > MAX_PATH) {
      return NextResponse.json({ error: "Informe a página." }, { status: 400 });
    }
    const { total, hits } = await listPageHitHistory(
      site.id,
      path,
      parsed.window,
    );
    return NextResponse.json({
      type,
      value: path,
      total,
      limit: HIT_HISTORY_LIMIT,
      hits: hits.map(serializeHit),
    });
  }

  if (type === "event") {
    const name = url.searchParams.get("name")?.trim() ?? "";
    if (!name || name.length > MAX_EVENT_NAME) {
      return NextResponse.json({ error: "Informe o evento." }, { status: 400 });
    }
    const origin = parseMediaOrigin(url.searchParams.get("origin"));
    const { total, hits } = await listEventHitHistory(
      site.id,
      name,
      parsed.window,
      origin,
    );
    return NextResponse.json({
      type,
      value: name,
      origin: origin ?? null,
      total,
      limit: HIT_HISTORY_LIMIT,
      hits: hits.map(serializeHit),
    });
  }

  return NextResponse.json(
    { error: "Informe type=page ou type=event." },
    { status: 400 },
  );
}

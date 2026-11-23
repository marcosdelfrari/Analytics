import { connection } from "next/server";
import { isSystemAdminAccount } from "@/lib/access-roles";
import { analyticsToCsv } from "@/lib/analytics-export";
import { loadClientAnalytics } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { csvAttachment } from "@/lib/csv";
import { getClientPageContext } from "@/lib/client-page";
import { localDateKey, parseReportPeriod } from "@/lib/report-period";
import type { ReportMediaFilter } from "@/lib/utm-platform";

const MEDIA_FILTERS = new Set<ReportMediaFilter>([
  "all",
  "google",
  "meta",
  "other",
  "none",
]);

function parseMediaFilter(value: string | null): ReportMediaFilter {
  if (value && MEDIA_FILTERS.has(value as ReportMediaFilter)) {
    return value as ReportMediaFilter;
  }
  return "all";
}

export async function GET(request: Request) {
  await connection();
  if (authEnabled) {
    const session = await getSession();
    if (!session) return new Response("Não autenticado", { status: 401 });
    if (!isSystemAdminAccount(session.role) && session.role !== "client") {
      return new Response("Sem permissão", { status: 403 });
    }
  }

  const params = new URL(request.url).searchParams;
  const period = parseReportPeriod(
    {
      dias: params.get("dias") ?? undefined,
      de: params.get("de") ?? undefined,
      ate: params.get("ate") ?? undefined,
    },
    localDateKey(),
  );
  const mediaFilter = parseMediaFilter(params.get("origem"));
  const { planActive, clientId, title } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive, period);
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filterSlug = mediaFilter === "all" ? "" : `-${mediaFilter}`;
  const filename = `fractal-relatorio${slug ? `-${slug}` : ""}${filterSlug}.csv`;
  return csvAttachment(
    filename,
    analyticsToCsv(analytics, { mediaFilter }),
  );
}

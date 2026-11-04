import { connection } from "next/server";
import { isSystemAdminAccount } from "@/lib/access-roles";
import { analyticsToCsv } from "@/lib/analytics-export";
import { loadClientAnalytics } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { csvAttachment } from "@/lib/csv";
import { getClientPageContext } from "@/lib/client-page";
import { parseReportPeriodDays } from "@/lib/report-period";

export async function GET(request: Request) {
  await connection();
  if (authEnabled) {
    const session = await getSession();
    if (!session) return new Response("Não autenticado", { status: 401 });
    if (!isSystemAdminAccount(session.role) && session.role !== "client") {
      return new Response("Sem permissão", { status: 403 });
    }
  }

  const days = parseReportPeriodDays(
    new URL(request.url).searchParams.get("dias") ?? undefined,
  );
  const { planActive, clientId, title } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive, days);
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `fractal-relatorio${slug ? `-${slug}` : ""}.csv`;
  return csvAttachment(filename, analyticsToCsv(analytics));
}

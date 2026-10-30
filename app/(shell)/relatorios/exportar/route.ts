import { connection } from "next/server";
import { analyticsToCsv } from "@/lib/analytics-export";
import { loadClientAnalytics } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { csvAttachment } from "@/lib/csv";
import { getClientPageContext } from "@/lib/client-page";

export async function GET() {
  await connection();
  if (authEnabled) {
    const session = await getSession();
    if (!session) return new Response("Não autenticado", { status: 401 });
    if (session.role !== "admin" && session.role !== "client") {
      return new Response("Sem permissão", { status: 403 });
    }
  }

  const { planActive, clientId, title } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive);
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `fractal-relatorio${slug ? `-${slug}` : ""}.csv`;
  return csvAttachment(filename, analyticsToCsv(analytics));
}

import { connection } from "next/server";
import { isSystemAdminAccount } from "@/lib/access-roles";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { csvAttachment } from "@/lib/csv";
import { leadsToCsv, loadLeadsView } from "@/lib/leads-view";
import { canRegisterResources } from "@/lib/organization-access";

export async function GET(request: Request) {
  await connection();
  const session = await getSession();
  if (authEnabled && !session) {
    return new Response("Não autenticado", { status: 401 });
  }
  if (!session) {
    return new Response("Não autenticado", { status: 401 });
  }
  if (!isSystemAdminAccount(session.role) && session.role !== "client") {
    return new Response("Sem permissão", { status: 403 });
  }

  const url = new URL(request.url);
  const view = await loadLeadsView({
    email: session.email,
    canRegister: canRegisterResources(session),
    orgId: url.searchParams.get("org") ?? undefined,
    formId: url.searchParams.get("form") ?? undefined,
    companyId: url.searchParams.get("empresa") ?? undefined,
    limit: 2000,
  });

  return csvAttachment("fractal-leads.csv", leadsToCsv(view.submissions));
}

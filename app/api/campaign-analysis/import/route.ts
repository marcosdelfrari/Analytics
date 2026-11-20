import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getActiveCompanyIdForSession, getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { isSystemAdminAccount } from "@/lib/access-roles";
import { upsertCampaignAdsImport } from "@/lib/campaign-analysis-store";
import { userHasLotusPartnerAccess } from "@/lib/lotus-proposal";

export async function POST(request: Request) {
  if (!authEnabled) {
    return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const allowed =
    isSystemAdminAccount(session.role) ||
    (await userHasLotusPartnerAccess(session.userId, session.email));
  if (!allowed) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const companyId = await getActiveCompanyIdForSession(session);
  if (!companyId) {
    return NextResponse.json({ error: "Empresa ativa não encontrada." }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const campaignHint = String(form.get("campaign") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo CSV." }, { status: 400 });
  }

  const raw = await file.text();
  if (!raw.trim()) {
    return NextResponse.json({ error: "Arquivo vazio." }, { status: 400 });
  }

  try {
    const result = await upsertCampaignAdsImport({
      companyId,
      fileName: file.name,
      raw,
      campaignHint,
    });
    revalidatePath("/campanhas");
    return NextResponse.json({
      ok: true,
      updated: result.updated,
      reportType: result.parsed.reportType,
      periodFrom: result.parsed.periodFrom,
      periodTo: result.parsed.periodTo,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao processar o arquivo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
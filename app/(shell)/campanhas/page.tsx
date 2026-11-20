import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShellMain } from "@/app/components/app-shell";
import { CampaignAnalysisPanel } from "@/app/components/campaign-analysis-panel";
import { CampaignsLoadingFallback } from "@/app/components/loading-fallbacks";
import { ReportPeriodSelect } from "@/app/components/report-period-select";
import { isSystemAdminAccount } from "@/lib/access-roles";
import {
  campaignAnalysisPeriodFromSearch,
  loadCampaignAnalysis,
} from "@/lib/campaign-analysis/load";
import { authEnabled } from "@/lib/auth-config";
import { clientSubtitle, getClientPageContext } from "@/lib/client-page";
import { userHasLotusPartnerAccess } from "@/lib/lotus-proposal";

async function CampaignsPageContent({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; de?: string; ate?: string; campanha?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const period = campaignAnalysisPeriodFromSearch(params);
  const { planActive, clientId, title, session } = await getClientPageContext();
  if (authEnabled && session) {
    const allowed =
      isSystemAdminAccount(session.role) ||
      (await userHasLotusPartnerAccess(session.userId, session.email));
    if (!allowed) {
      redirect("/dashboard");
    }
  }

  const analysis = await loadCampaignAnalysis({
    companyId: clientId,
    planActive,
    period,
    campaign: params.campanha,
  });

  const alignPeriodHref =
    analysis.reportWindow && !analysis.periodAligned
      ? (() => {
          const query = new URLSearchParams();
          query.set("de", analysis.reportWindow!.from);
          query.set("ate", analysis.reportWindow!.to);
          if (analysis.campaign) query.set("campanha", analysis.campaign);
          return `/campanhas?${query.toString()}`;
        })()
      : null;

  return (
    <AppShellMain
      title={title}
      subtitle={clientSubtitle(
        planActive,
        analysis.demo
          ? "Demonstração · análise de campanhas"
          : "Análise de campanhas",
      )}
      planActive={planActive}
    >
      <CampaignAnalysisPanel
        view={analysis}
        periodControls={
          <ReportPeriodSelect
            period={period}
            plain
            pathname="/campanhas"
            extraQuery={analysis.campaign ? { campanha: analysis.campaign } : undefined}
          />
        }
        alignPeriodHref={alignPeriodHref}
      />
    </AppShellMain>
  );
}

export default function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; de?: string; ate?: string; campanha?: string }>;
}) {
  return (
    <Suspense fallback={<CampaignsLoadingFallback />}>
      <CampaignsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
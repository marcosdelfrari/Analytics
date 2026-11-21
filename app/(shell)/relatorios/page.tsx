import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AppShellMain } from "@/app/components/app-shell";
import {
  ReportsContentLoadingFallback,
  ReportsLoadingFallback,
} from "@/app/components/loading-fallbacks";
import { ReportPeriodCalendar } from "@/app/components/report-period-calendar";
import { ReportPeriodSelect } from "@/app/components/report-period-select";
import { ReportsSectionTabs } from "@/app/components/reports-section-tabs";
import {
  filterReportsByPlatform,
  loadClientAnalytics,
  summaryForPlatform,
} from "@/lib/analytics";
import type { ReportsPublishedAdsData } from "@/lib/reports-ads-props";
import { clientSubtitle, getClientPageContext } from "@/lib/client-page";
import { canRegisterResources } from "@/lib/organization-access";
import {
  formatRangeLabel,
  localDateKey,
  parseReportPeriod,
  reportExportHref,
} from "@/lib/report-period";

async function ReportsPageContent({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; de?: string; ate?: string }>;
}) {
  await connection();
  const { dias, de, ate } = await searchParams;
  const period = parseReportPeriod({ dias, de, ate }, localDateKey());
  const { planActive, clientId, title, session } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive, period);
  const tracking = analytics.siteTracking;
  const showSetupLink = !session || canRegisterResources(session);
  const publishedAds: ReportsPublishedAdsData = {
    google: {
      summary: summaryForPlatform(analytics, "google"),
      reports: filterReportsByPlatform(analytics.dashboard.reports, "google"),
    },
    meta: {
      summary: summaryForPlatform(analytics, "meta"),
      reports: filterReportsByPlatform(analytics.dashboard.reports, "meta"),
    },
  };

  return (
    <AppShellMain
      title={title}
      subtitle={clientSubtitle(planActive, "Relatórios analíticos")}
      planActive={planActive}
    >
      <ReportsSectionTabs
        toolbarStart={
          <>
            <ReportPeriodSelect period={period} plain />
            {tracking?.ready ? (
              <ReportPeriodCalendar
                label={formatRangeLabel(tracking.range.from, tracking.range.to)}
                from={tracking.range.from}
                to={tracking.range.to}
              />
            ) : null}
          </>
        }
        toolbarEnd={
          <>
            {showSetupLink ? (
              <Link
                href="/rastreamento"
                className="text-[11px] text-muted-foreground transition hover:text-foreground"
              >
                Script e testes →
              </Link>
            ) : null}
            <Link
              href={reportExportHref(period)}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-surface-elevated"
            >
              Exportar CSV
            </Link>
          </>
        }
        tracking={tracking}
        publishedAds={publishedAds}
      />
    </AppShellMain>
  );
}

export default function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; de?: string; ate?: string }>;
}) {
  return (
    <Suspense fallback={<ReportsLoadingFallback />}>
      <ReportsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
import { Suspense } from "react";
import { connection } from "next/server";
import { AppShellMain } from "@/app/components/app-shell";
import { ReportsLoadingFallback } from "@/app/components/loading-fallbacks";
import { RefreshReportsButton } from "@/app/components/refresh-reports-button";
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
import {
  formatRangeLabel,
  localDateKey,
  parseReportPeriod,
} from "@/lib/report-period";

async function ReportsPageContent({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; de?: string; ate?: string }>;
}) {
  await connection();
  const { dias, de, ate } = await searchParams;
  const period = parseReportPeriod({ dias, de, ate }, localDateKey());
  const { planActive, clientId, title } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive, period);
  const tracking = analytics.siteTracking;
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
      headerActions={<RefreshReportsButton />}
    >
      <ReportsSectionTabs
        period={period}
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

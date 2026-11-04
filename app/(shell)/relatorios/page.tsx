import { Suspense } from "react";
import Link from "next/link";
import { AppShellMain } from "@/app/components/app-shell";
import {
  EventAnalysisPanel,
  TrackingSummaryBar,
} from "@/app/components/event-analysis-panel";
import { ReportsLoadingFallback } from "@/app/components/loading-fallbacks";
import { PlatformTabs } from "@/app/components/platform-tabs";
import { ReportPeriodSelect } from "@/app/components/report-period-select";
import { ReportPlatformPanel } from "@/app/components/report-platform-panel";
import { ReportsSectionTabs } from "@/app/components/reports-section-tabs";
import { TrackingBreakdownTables } from "@/app/components/tracking-breakdown-tables";
import { TrackingPlatformPanel } from "@/app/components/tracking-platform-panel";
import {
  filterReportsByPlatform,
  loadClientAnalytics,
  summaryForPlatform,
} from "@/lib/analytics";
import { clientSubtitle, getClientPageContext } from "@/lib/client-page";
import { canRegisterResources } from "@/lib/organization-access";
import {
  parseReportPeriodDays,
  reportExportHref,
} from "@/lib/report-period";

async function ReportsPageContent({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias } = await searchParams;
  const days = parseReportPeriodDays(dias);
  const { planActive, clientId, title, session } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive, days);
  const tracking = analytics.siteTracking;
  const showSetupLink = !session || canRegisterResources(session);
  const periodLabel = tracking?.period ?? analytics.dashboard.period;

  return (
    <AppShellMain
      title={title}
      subtitle={`Relatórios analíticos · ${clientSubtitle(planActive, periodLabel)}`}
      planActive={planActive}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ReportPeriodSelect days={days} />
          <Link
            href={reportExportHref(days)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-surface-elevated"
          >
            Exportar CSV
          </Link>
        </div>

        {tracking && (
          <TrackingSummaryBar
            tracking={tracking}
            showSetupLink={showSetupLink}
          />
        )}

        <ReportsSectionTabs
          events={
            tracking && tracking.ready ? (
              <EventAnalysisPanel tracking={tracking} />
            ) : (
              <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
                Sem eventos coletados no período.
              </p>
            )
          }
          pages={
            tracking && tracking.ready ? (
              <TrackingBreakdownTables
                eventsByName={tracking.eventsByName}
                byAttribution={tracking.byAttribution}
                byPath={tracking.byPath}
                byPathFlow={tracking.byPathFlow}
                showEvents={false}
              />
            ) : (
              <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
                Sem páginas ou UTMs coletados no período.
              </p>
            )
          }
          platforms={
            <PlatformTabs
              google={
                <div className="space-y-3">
                  {tracking && (
                    <TrackingPlatformPanel
                      platform="google"
                      attribution={tracking.byPlatform.google.attribution}
                      eventsByName={tracking.byPlatform.google.eventsByName}
                    />
                  )}
                  <ReportPlatformPanel
                    summary={summaryForPlatform(analytics, "google")}
                    reports={filterReportsByPlatform(
                      analytics.dashboard.reports,
                      "google",
                    )}
                  />
                </div>
              }
              meta={
                <div className="space-y-3">
                  {tracking && (
                    <TrackingPlatformPanel
                      platform="meta"
                      attribution={tracking.byPlatform.meta.attribution}
                      eventsByName={tracking.byPlatform.meta.eventsByName}
                    />
                  )}
                  <ReportPlatformPanel
                    summary={summaryForPlatform(analytics, "meta")}
                    reports={filterReportsByPlatform(
                      analytics.dashboard.reports,
                      "meta",
                    )}
                  />
                </div>
              }
            />
          }
        />
      </div>
    </AppShellMain>
  );
}

export default function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  return (
    <Suspense fallback={<ReportsLoadingFallback />}>
      <ReportsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

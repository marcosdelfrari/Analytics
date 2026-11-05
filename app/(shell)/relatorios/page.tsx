import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AppShellMain } from "@/app/components/app-shell";
import { EventAnalysisPanel } from "@/app/components/event-analysis-panel";
import {
  ReportsContentLoadingFallback,
  ReportsLoadingFallback,
} from "@/app/components/loading-fallbacks";
import { ReportPeriodCalendar } from "@/app/components/report-period-calendar";
import { ReportPeriodSelect } from "@/app/components/report-period-select";
import { ReportPlatformPanel } from "@/app/components/report-platform-panel";
import { ReportsSectionTabs } from "@/app/components/reports-section-tabs";
import { TrackingBreakdownTables } from "@/app/components/tracking-breakdown-tables";
import { TrackingPlatformPanel } from "@/app/components/tracking-platform-panel";
import { TrackingReportPanel } from "@/app/components/tracking-report-panel";
import {
  filterReportsByPlatform,
  loadClientAnalytics,
  summaryForPlatform,
} from "@/lib/analytics";
import { clientSubtitle, getClientPageContext } from "@/lib/client-page";
import { canRegisterResources } from "@/lib/organization-access";
import {
  formatRangeLabel,
  localDateKey,
  parseReportPeriod,
  reportExportHref,
} from "@/lib/report-period";

async function ReportsAnalyticsContent({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; de?: string; ate?: string }>;
}) {
  await connection();
  const { dias, de, ate } = await searchParams;
  const period = parseReportPeriod({ dias, de, ate }, localDateKey());
  const { planActive, clientId, session } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive, period);
  const tracking = analytics.siteTracking;
  const showSetupLink = !session || canRegisterResources(session);

  return (
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
      trafficSummary={
        tracking && tracking.ready ? (
          <TrackingReportPanel
            tracking={tracking}
            variant="metrics"
            showSetupLink={false}
            showReportLink={false}
          />
        ) : null
      }
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
            byDevice={tracking.byDevice}
            byBrowser={tracking.byBrowser}
            showEvents={false}
            range={tracking.range}
          />
        ) : (
          <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
            Sem páginas ou UTMs coletados no período.
          </p>
        )
      }
      google={
        <div className="space-y-3">
          {tracking && (
            <TrackingPlatformPanel
              origin="google"
              attribution={tracking.byPlatform.google.attribution}
              eventsByName={tracking.byPlatform.google.eventsByName}
              range={tracking.range}
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
              origin="meta"
              attribution={tracking.byPlatform.meta.attribution}
              eventsByName={tracking.byPlatform.meta.eventsByName}
              range={tracking.range}
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
      other={
        tracking ? (
          <TrackingPlatformPanel
            origin="other"
            attribution={tracking.byPlatform.other.attribution}
            eventsByName={tracking.byPlatform.other.eventsByName}
            range={tracking.range}
          />
        ) : (
          <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
            Sem coleta do site no período.
          </p>
        )
      }
      none={
        tracking ? (
          <TrackingPlatformPanel
            origin="none"
            attribution={tracking.byPlatform.none.attribution}
            eventsByName={tracking.byPlatform.none.eventsByName}
            range={tracking.range}
          />
        ) : (
          <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
            Sem coleta do site no período.
          </p>
        )
      }
    />
  );
}

async function ReportsPageShell({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; de?: string; ate?: string }>;
}) {
  const { planActive, title } = await getClientPageContext();

  return (
    <AppShellMain
      title={title}
      subtitle={clientSubtitle(planActive, "Relatórios analíticos")}
      planActive={planActive}
    >
      <Suspense fallback={<ReportsContentLoadingFallback />}>
        <ReportsAnalyticsContent searchParams={searchParams} />
      </Suspense>
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
      <ReportsPageShell searchParams={searchParams} />
    </Suspense>
  );
}

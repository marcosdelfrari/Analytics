import { Suspense } from "react";
import { AppShellMain } from "@/app/components/app-shell";
import { ReportsLoadingFallback } from "@/app/components/loading-fallbacks";
import { PlatformTabs } from "@/app/components/platform-tabs";
import { ReportPlatformPanel } from "@/app/components/report-platform-panel";
import { TrackingPlatformPanel } from "@/app/components/tracking-platform-panel";
import { TrackingReportPanel } from "@/app/components/tracking-report-panel";
import {
  filterReportsByPlatform,
  loadClientAnalytics,
  summaryForPlatform,
} from "@/lib/analytics";
import { clientSubtitle, getClientPageContext } from "@/lib/client-page";

async function ReportsPageContent() {
  const { planActive, clientId, title } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive);
  const tracking = analytics.siteTracking;

  return (
    <AppShellMain
      title={title}
      subtitle={clientSubtitle(planActive, analytics.dashboard.period)}
      planActive={planActive}
    >
      <div className="space-y-6">
        <header>
          <p className="text-[11px] uppercase tracking-wider text-muted">
            Relatórios
          </p>
          <h2 className="mt-1 text-lg font-medium tracking-tight">
            Dados por plataforma
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Google Ads e Meta Ads: relatórios publicados e tráfego do script
            filtrado por origem (utm_source).
          </p>
        </header>

        <PlatformTabs
          google={
            <div className="space-y-4">
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
            <div className="space-y-4">
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

        {tracking && (
          <TrackingReportPanel
            tracking={tracking}
            variant="overview"
          />
        )}
      </div>
    </AppShellMain>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsLoadingFallback />}>
      <ReportsPageContent />
    </Suspense>
  );
}

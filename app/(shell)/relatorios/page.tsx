import { Suspense } from "react";
import Link from "next/link";
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
import { canRegisterResources } from "@/lib/organization-access";

async function ReportsPageContent() {
  const { planActive, clientId, title, session } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive);
  const tracking = analytics.siteTracking;
  const showSetupLink = !session || canRegisterResources(session);

  return (
    <AppShellMain
      title={title}
      subtitle={clientSubtitle(planActive, analytics.dashboard.period)}
      planActive={planActive}
    >
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
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
          </div>
          <Link
            href="/relatorios/exportar"
            className="rounded-xl border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-foreground transition hover:bg-surface-elevated"
          >
            Exportar CSV
          </Link>
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
            showSetupLink={showSetupLink}
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

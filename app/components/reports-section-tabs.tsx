"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { EventAnalysisPanel } from "@/app/components/event-analysis-panel";
import { PlatformLogoLabel } from "@/app/components/platform-logo";
import { ReportPlatformPanel } from "@/app/components/report-platform-panel";
import { ReportsTabPanelSkeleton } from "@/app/components/loading-fallbacks";
import {
  ReportsNavigationProvider,
  useReportsNavigation,
} from "@/app/components/reports-navigation-context";
import { TrackingBreakdownTables } from "@/app/components/tracking-breakdown-tables";
import { TrackingPlatformPanel } from "@/app/components/tracking-platform-panel";
import { TrackingReportPanel } from "@/app/components/tracking-report-panel";
import type { ReportsPublishedAdsData } from "@/lib/reports-ads-props";
import { reportExportHref, type ReportPeriod } from "@/lib/report-period";
import { trackingTotalsForFilter } from "@/lib/tracking-filter-totals";
import type { SiteTrackingAnalytics } from "@/lib/tracking-analytics-shared";
import type { Platform } from "@/lib/types";
import {
  type ReportMediaFilter,
  type TrackingMediaOrigin,
} from "@/lib/utm-platform";

type SectionTab = "events" | "pages" | "platforms";

const TABS: { id: SectionTab; label: string }[] = [
  { id: "events", label: "Eventos" },
  { id: "pages", label: "Páginas" },
  { id: "platforms", label: "Mídia" },
];

const MEDIA_TABS: { id: ReportMediaFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "google", label: "Google Ads" },
  { id: "meta", label: "Meta Ads" },
  { id: "other", label: "Outros" },
  { id: "none", label: "Sem dados" },
];

const tabClass = (selected: boolean) =>
  `rounded-md px-3 py-1 text-[11px] font-medium transition ${
    selected
      ? "bg-surface-elevated text-foreground shadow-sm ring-1 ring-border"
      : "text-muted-foreground hover:text-foreground"
  }`;

function mediaChipClass(origin: ReportMediaFilter, selected: boolean) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition";
  if (!selected) {
    return `${base} text-muted-foreground hover:text-foreground`;
  }
  if (origin === "all") {
    return `${base} bg-surface-elevated text-foreground ring-1 ring-border`;
  }
  if (origin === "google") {
    return `${base} bg-google/15 text-foreground ring-1 ring-google/40`;
  }
  if (origin === "meta") {
    return `${base} bg-meta/15 text-foreground ring-1 ring-meta/40`;
  }
  return `${base} bg-surface-elevated text-foreground ring-1 ring-border`;
}

function trackingUnavailable(message: string) {
  return (
    <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
      {message}
    </p>
  );
}

function ReportsSectionTabsInner({
  period,
  toolbarStart,
  tracking,
  publishedAds,
}: {
  period: ReportPeriod;
  toolbarStart: ReactNode;
  tracking: SiteTrackingAnalytics | null;
  publishedAds: ReportsPublishedAdsData;
}) {
  const { navigationPending } = useReportsNavigation();
  const [active, setActive] = useState<SectionTab>("events");
  const [platform, setPlatform] = useState<ReportMediaFilter>("all");
  const [tabPending, startTabTransition] = useTransition();

  const mediaOrigin =
    platform === "all" ? undefined : (platform as TrackingMediaOrigin);

  const trafficTotals = useMemo(
    () =>
      tracking?.ready
        ? trackingTotalsForFilter(tracking, platform)
        : null,
    [platform, tracking],
  );

  const panelContent = useMemo(() => {
    if (!tracking?.ready) {
      if (active === "events") {
        return trackingUnavailable("Sem eventos coletados no período.");
      }
      if (active === "pages") {
        return trackingUnavailable(
          "Sem páginas ou UTMs coletados no período.",
        );
      }
      return trackingUnavailable("Sem coleta do site no período.");
    }

    if (active === "events") {
      return (
        <EventAnalysisPanel tracking={tracking} mediaOrigin={mediaOrigin} />
      );
    }

    if (active === "pages") {
      const slice = mediaOrigin ? tracking.byPlatform[mediaOrigin] : null;
      return (
        <TrackingBreakdownTables
          eventsByName={slice?.eventsByName ?? tracking.eventsByName}
          byAttribution={slice?.attribution ?? tracking.byAttribution}
          byPath={tracking.byPath}
          byPathFlow={tracking.byPathFlow}
          byDevice={tracking.byDevice}
          byBrowser={tracking.byBrowser}
          showEvents={false}
          range={tracking.range}
        />
      );
    }

    const slice =
      platform === "all"
        ? {
            attribution: tracking.byAttribution,
            eventsByName: tracking.eventsByName,
          }
        : tracking.byPlatform[platform as TrackingMediaOrigin];
    const adsPlatform: Platform | null =
      platform === "google" || platform === "meta" ? platform : null;

    return (
      <div className="space-y-3">
        <TrackingPlatformPanel
          origin={platform}
          attribution={slice.attribution}
          eventsByName={slice.eventsByName}
          range={tracking.range}
        />
        {adsPlatform ? (
          <ReportPlatformPanel
            summary={publishedAds[adsPlatform].summary}
            reports={publishedAds[adsPlatform].reports}
          />
        ) : null}
      </div>
    );
  }, [active, mediaOrigin, platform, publishedAds, tracking]);

  const showTrafficSummary =
    Boolean(tracking?.ready) && (active === "events" || active === "pages");

  const panelLoading = navigationPending || tabPending;

  function selectSection(id: SectionTab) {
    if (id === active) return;
    startTabTransition(() => setActive(id));
  }

  function selectPlatform(id: ReportMediaFilter) {
    if (id === platform) return;
    startTabTransition(() => setPlatform(id));
  }

  return (
    <div className="space-y-3">
      <section
        className={`rounded-xl border border-border bg-surface transition-opacity ${
          navigationPending ? "opacity-80" : ""
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            {toolbarStart}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={reportExportHref(period, platform)}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-surface-elevated"
            >
              Exportar CSV
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 border-t border-border px-3 py-2">
          <div
            className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-background p-0.5"
            role="tablist"
            aria-label="Seções do relatório"
          >
            {TABS.map((item) => {
              const isSelected = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  disabled={panelLoading}
                  onClick={() => selectSection(item.id)}
                  className={`${tabClass(isSelected)} disabled:cursor-wait disabled:opacity-70`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div
            className="inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-border bg-background p-0.5"
            role="tablist"
            aria-label="Origem da mídia"
          >
            {MEDIA_TABS.map((item) => {
              const selected = platform === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  disabled={panelLoading}
                  onClick={() => selectPlatform(item.id)}
                  className={`${mediaChipClass(item.id, selected)} disabled:cursor-wait disabled:opacity-70`}
                >
                  {item.id === "google" || item.id === "meta" ? (
                    <PlatformLogoLabel platform={item.id} size={14} />
                  ) : (
                    item.label
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {showTrafficSummary && !panelLoading && trafficTotals ? (
        <TrackingReportPanel
          tracking={tracking!}
          totals={trafficTotals}
          variant="metrics"
          showSetupLink={false}
          showReportLink={false}
        />
      ) : null}
      {showTrafficSummary && panelLoading ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-surface px-3.5 py-2.5"
            >
              <div className="h-2.5 w-20 animate-pulse rounded-sm bg-border" />
              <div className="mt-2 h-5 w-24 animate-pulse rounded-sm bg-border" />
            </div>
          ))}
        </div>
      ) : null}

      <div role="tabpanel" className="relative min-h-[12rem]">
        {panelLoading ? (
          <ReportsTabPanelSkeleton showTrafficSummary={false} />
        ) : (
          panelContent
        )}
      </div>
    </div>
  );
}

export function ReportsSectionTabs({
  period,
  toolbarStart,
  tracking,
  publishedAds,
}: {
  period: ReportPeriod;
  toolbarStart: ReactNode;
  tracking: SiteTrackingAnalytics | null;
  publishedAds: ReportsPublishedAdsData;
}) {
  return (
    <ReportsNavigationProvider>
      <ReportsSectionTabsInner
        period={period}
        toolbarStart={toolbarStart}
        tracking={tracking}
        publishedAds={publishedAds}
      />
    </ReportsNavigationProvider>
  );
}
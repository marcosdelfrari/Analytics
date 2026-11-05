"use client";

import { useState, useTransition, type ReactNode } from "react";
import { PlatformLogoLabel } from "@/app/components/platform-logo";
import { ReportsTabPanelSkeleton } from "@/app/components/loading-fallbacks";
import {
  ReportsNavigationProvider,
  useReportsNavigation,
} from "@/app/components/reports-navigation-context";
import type { TrackingMediaOrigin } from "@/lib/utm-platform";

type SectionTab = "events" | "pages" | "platforms";

const TABS: { id: SectionTab; label: string }[] = [
  { id: "events", label: "Eventos" },
  { id: "pages", label: "Páginas" },
  { id: "platforms", label: "Mídia" },
];

const MEDIA_TABS: { id: TrackingMediaOrigin; label: string }[] = [
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

function mediaChipClass(origin: TrackingMediaOrigin, selected: boolean) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition";
  if (!selected) {
    return `${base} text-muted-foreground hover:text-foreground`;
  }
  if (origin === "google") {
    return `${base} bg-google/15 text-foreground ring-1 ring-google/40`;
  }
  if (origin === "meta") {
    return `${base} bg-meta/15 text-foreground ring-1 ring-meta/40`;
  }
  return `${base} bg-surface-elevated text-foreground ring-1 ring-border`;
}

function ReportsSectionTabsInner({
  toolbarStart,
  toolbarEnd,
  trafficSummary,
  events,
  pages,
  google,
  meta,
  other,
  none,
}: {
  toolbarStart: ReactNode;
  toolbarEnd?: ReactNode;
  trafficSummary?: ReactNode;
  events: ReactNode;
  pages: ReactNode;
  google: ReactNode;
  meta: ReactNode;
  other: ReactNode;
  none: ReactNode;
}) {
  const { navigationPending } = useReportsNavigation();
  const [active, setActive] = useState<SectionTab>("events");
  const [platform, setPlatform] = useState<TrackingMediaOrigin>("google");
  const [tabPending, startTabTransition] = useTransition();

  const mediaPanel =
    platform === "google"
      ? google
      : platform === "meta"
        ? meta
        : platform === "other"
          ? other
          : none;

  const showTrafficSummary =
    Boolean(trafficSummary) && (active === "events" || active === "pages");

  const panelLoading = navigationPending || tabPending;

  function selectSection(id: SectionTab) {
    if (id === active) return;
    startTabTransition(() => setActive(id));
  }

  function selectPlatform(id: TrackingMediaOrigin) {
    if (id === platform) return;
    startTabTransition(() => setPlatform(id));
  }

  const panelContent =
    active === "events" ? events : active === "pages" ? pages : mediaPanel;

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
          {toolbarEnd ? (
            <div className="flex shrink-0 items-center gap-3">{toolbarEnd}</div>
          ) : null}
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

          {active === "platforms" ? (
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
          ) : null}
        </div>
      </section>

      {showTrafficSummary && !panelLoading ? trafficSummary : null}
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

export function ReportsSectionTabs(props: {
  toolbarStart: ReactNode;
  toolbarEnd?: ReactNode;
  trafficSummary?: ReactNode;
  events: ReactNode;
  pages: ReactNode;
  google: ReactNode;
  meta: ReactNode;
  other: ReactNode;
  none: ReactNode;
}) {
  return (
    <ReportsNavigationProvider>
      <ReportsSectionTabsInner {...props} />
    </ReportsNavigationProvider>
  );
}

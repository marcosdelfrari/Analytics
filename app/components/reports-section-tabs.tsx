"use client";

import { useState, type ReactNode } from "react";
import { PlatformLogoLabel } from "@/app/components/platform-logo";
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

export function ReportsSectionTabs({
  toolbarStart,
  toolbarEnd,
  events,
  pages,
  google,
  meta,
  other,
  none,
}: {
  toolbarStart: ReactNode;
  toolbarEnd?: ReactNode;
  events: ReactNode;
  pages: ReactNode;
  google: ReactNode;
  meta: ReactNode;
  other: ReactNode;
  none: ReactNode;
}) {
  const [active, setActive] = useState<SectionTab>("events");
  const [platform, setPlatform] = useState<TrackingMediaOrigin>("google");

  const mediaPanel =
    platform === "google"
      ? google
      : platform === "meta"
        ? meta
        : platform === "other"
          ? other
          : none;

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-border bg-surface">
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
                  onClick={() => setActive(item.id)}
                  className={tabClass(isSelected)}
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
                    onClick={() => setPlatform(item.id)}
                    className={mediaChipClass(item.id, selected)}
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

      <div role="tabpanel">
        {active === "events" && events}
        {active === "pages" && pages}
        {active === "platforms" && mediaPanel}
      </div>
    </div>
  );
}

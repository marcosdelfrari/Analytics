"use client";

import { useState, type ReactNode } from "react";

type SectionTab = "events" | "pages" | "platforms";

const TABS: { id: SectionTab; label: string }[] = [
  { id: "events", label: "1 · Eventos" },
  { id: "pages", label: "2 · Páginas e UTMs" },
  { id: "platforms", label: "3 · Mídia por plataforma" },
];

export function ReportsSectionTabs({
  events,
  pages,
  platforms,
  rightSlot,
}: {
  events: ReactNode;
  pages: ReactNode;
  platforms: ReactNode;
  rightSlot?: ReactNode;
}) {
  const [active, setActive] = useState<SectionTab>("events");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex max-w-full flex-wrap rounded-xl border border-border bg-surface p-1"
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
                className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
                  isSelected
                    ? "bg-surface-elevated text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {rightSlot}
      </div>

      <div role="tabpanel">
        {active === "events" && events}
        {active === "pages" && pages}
        {active === "platforms" && platforms}
      </div>
    </div>
  );
}

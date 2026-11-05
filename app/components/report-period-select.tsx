"use client";

import Link from "next/link";
import {
  REPORT_PERIOD_OPTIONS,
  reportPeriodHref,
  type ReportPeriod,
} from "@/lib/report-period";
import { useReportsNavigation } from "@/app/components/reports-navigation-context";

export function ReportPeriodSelect({
  period,
  plain = false,
}: {
  period: ReportPeriod;
  plain?: boolean;
}) {
  const { beginNavigation } = useReportsNavigation();

  return (
    <div
      className={
        plain
          ? "inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-lg border border-border bg-background p-0.5"
          : "inline-flex max-w-full flex-wrap rounded-xl border border-border bg-surface p-1"
      }
      role="group"
      aria-label="Período do relatório"
    >
      {REPORT_PERIOD_OPTIONS.map((option) => {
        const selected = period.kind === "days" && option.days === period.days;
        return (
          <Link
            key={option.days}
            href={reportPeriodHref(option.days)}
            aria-current={selected ? "true" : undefined}
            onClick={() => {
              if (!selected) beginNavigation();
            }}
            className={`rounded-md px-3 py-1 text-[11px] font-medium transition ${
              selected
                ? "bg-surface-elevated text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

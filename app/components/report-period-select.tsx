import Link from "next/link";
import {
  REPORT_PERIOD_OPTIONS,
  reportPeriodHref,
} from "@/lib/report-period";

export function ReportPeriodSelect({ days }: { days: number }) {
  return (
    <div
      className="inline-flex max-w-full flex-wrap rounded-xl border border-border bg-surface p-1"
      role="group"
      aria-label="Período do relatório"
    >
      {REPORT_PERIOD_OPTIONS.map((option) => {
        const selected = option.days === days;
        return (
          <Link
            key={option.days}
            href={reportPeriodHref(option.days)}
            aria-current={selected ? "true" : undefined}
            className={`rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
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

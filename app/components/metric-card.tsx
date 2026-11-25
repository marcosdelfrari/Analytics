import type { ReactNode } from "react";

type MetricIcon =
  | "spend"
  | "conversion"
  | "ctr"
  | "cost"
  | "pageview"
  | "event";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  change?: number;
  tone?: "default" | "positive" | "accent";
  icon?: MetricIcon;
  /** Layout compacto (dashboard / relatórios). */
  compact?: boolean;
}

const iconStyles: Record<MetricIcon, { wrap: string; icon: ReactNode }> = {
  spend: {
    wrap: "bg-amber-50 text-amber-600 ring-amber-100",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.35" />
        <path
          d="M8 5v6M6.2 6.8h2.2a1.4 1.4 0 100-2.8H6.2M6.2 9.2h2.6a1.4 1.4 0 100-2.8H6.2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  conversion: {
    wrap: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
        <path
          d="M3 8.5l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  ctr: {
    wrap: "bg-sky-50 text-sky-600 ring-sky-100",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
        <path
          d="M2 12l4-5 3 3 5-7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  cost: {
    wrap: "bg-violet-50 text-violet-600 ring-violet-100",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
        <rect
          x="2.5"
          y="4"
          width="11"
          height="8"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.35"
        />
        <path d="M5 8h6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      </svg>
    ),
  },
  pageview: {
    wrap: "bg-blue-50 text-blue-600 ring-blue-100",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
        <path
          d="M2 4.5h12M2 8h8M2 11.5h10"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  event: {
    wrap: "bg-orange-50 text-orange-600 ring-orange-100",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="h-3.5 w-3.5">
        <path
          d="M8 2.5v3M8 10.5v3M4.2 5.2l2.1 2.1M9.7 8.7l2.1 2.1M2.5 8h3M10.5 8h3M4.2 10.8l2.1-2.1M9.7 7.3l2.1-2.1"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
};

export function MetricCard({
  label,
  value,
  hint,
  change,
  tone = "default",
  icon,
  compact = false,
}: MetricCardProps) {
  const changePositive = change !== undefined && change >= 0;
  const highlighted = tone === "positive";
  const accentTone = tone === "accent";
  const iconDef = icon ? iconStyles[icon] : null;

  if (compact) {
    return (
      <div
        className={`rounded-xl border px-3.5 py-2.5 shadow-sm ${
          highlighted
            ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-white"
            : accentTone
              ? "border-blue-200/70 bg-gradient-to-br from-blue-50/60 via-white to-white"
              : "border-border bg-surface"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={`truncate text-[10px] font-medium uppercase tracking-wider ${
              highlighted
                ? "text-emerald-700/80"
                : accentTone
                  ? "text-blue-700/75"
                  : "text-muted"
            }`}
          >
            {label}
          </p>
          {iconDef ? (
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${iconDef.wrap}`}
            >
              {iconDef.icon}
            </span>
          ) : null}
        </div>
        <h3
          className={`mt-1 truncate font-semibold tracking-tight ${
            compact ? "text-lg" : "text-2xl"
          } ${highlighted ? "text-emerald-700" : "text-foreground"}`}
        >
          {value}
        </h3>
        {(change !== undefined || hint) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {change !== undefined && (
              <span
                className={`font-mono text-[10px] ${
                  changePositive ? "text-positive" : "text-negative"
                }`}
              >
                {changePositive ? "+" : ""}
                {change.toFixed(1)}%
              </span>
            )}
            {hint ? (
              <span className="truncate text-[10px] text-muted-foreground">
                {hint}
              </span>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
        highlighted
          ? "border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-white"
          : accentTone
            ? "border-blue-200/70 bg-gradient-to-br from-blue-50/80 via-white to-white"
            : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] font-medium uppercase tracking-wider ${
            highlighted
              ? "text-emerald-700/80"
              : accentTone
                ? "text-blue-700/75"
                : "text-muted"
          }`}
        >
          {label}
        </p>
        {iconDef ? (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${iconDef.wrap}`}
          >
            {iconDef.icon}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          highlighted
            ? "text-emerald-700"
            : accentTone
              ? "text-blue-700"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {change !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-medium ${
              changePositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {changePositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}
        {hint ? (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
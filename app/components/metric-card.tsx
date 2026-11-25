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
    wrap: "bg-google-yellow/15 text-google-yellow ring-google-yellow/25",
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
    wrap: "bg-positive/15 text-positive ring-positive/25",
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
    wrap: "bg-meta/15 text-meta ring-meta/25",
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
    wrap: "bg-surface-elevated text-muted-foreground ring-border",
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
    wrap: "bg-google/15 text-google ring-google/25",
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
    wrap: "bg-surface-elevated text-accent-muted ring-border",
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

function cardSurfaceClass(
  highlighted: boolean,
  accentTone: boolean,
  compact: boolean,
) {
  if (highlighted) {
    return "border-positive/25 bg-surface bg-gradient-to-br from-positive/20 via-positive/10 to-transparent";
  }
  if (accentTone) {
    return "border-meta/25 bg-surface bg-gradient-to-br from-meta/15 via-meta/5 to-transparent";
  }
  return compact
    ? "border-border bg-surface"
    : "border-border bg-surface";
}

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
  const surface = cardSurfaceClass(highlighted, accentTone, compact);

  if (compact) {
    return (
      <div className={`rounded-xl border px-3.5 py-2.5 ${surface}`}>
        <div className="flex items-start justify-between gap-2">
          <p
            className={`truncate text-[10px] uppercase tracking-wider ${
              highlighted
                ? "text-positive/75"
                : accentTone
                  ? "text-meta/80"
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
        <p
          className={`mt-1 truncate font-mono text-lg font-medium tracking-tight ${
            highlighted ? "text-positive" : "text-foreground"
          }`}
        >
          {value}
        </p>
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
              <span className="truncate text-[10px] text-muted">{hint}</span>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 ${surface}`}>
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[11px] uppercase tracking-wider ${
            highlighted
              ? "text-positive/75"
              : accentTone
                ? "text-meta/80"
                : "text-muted"
          }`}
        >
          {label}
        </p>
        {iconDef ? (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${iconDef.wrap}`}
          >
            {iconDef.icon}
          </span>
        ) : null}
      </div>
      <p
        className={`mt-2 font-mono text-2xl font-medium tracking-tight ${
          highlighted ? "text-positive" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {change !== undefined && (
          <span
            className={`font-mono text-[11px] ${
              changePositive ? "text-positive" : "text-negative"
            }`}
          >
            {changePositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        )}
        {hint ? <span className="text-[11px] text-muted">{hint}</span> : null}
      </div>
    </div>
  );
}
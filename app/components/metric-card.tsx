interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  change?: number;
  tone?: "default" | "positive";
}

export function MetricCard({
  label,
  value,
  hint,
  change,
  tone = "default",
}: MetricCardProps) {
  const changePositive = change !== undefined && change >= 0;
  const highlighted = tone === "positive";

  return (
    <div
      className={`rounded-xl border px-3.5 py-2.5 ${
        highlighted
          ? "border-positive/25 bg-surface bg-gradient-to-br from-positive/15 via-positive/5 to-transparent shadow-[inset_0_1px_0_rgba(74,222,128,0.2)]"
          : "border-border bg-surface"
      }`}
    >
      <p
        className={`truncate text-[10px] uppercase tracking-wider ${
          highlighted ? "text-positive/80" : "text-muted"
        }`}
      >
        {label}
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p
          className={`truncate font-mono text-lg font-medium tracking-tight ${
            highlighted ? "text-positive" : "text-foreground"
          }`}
        >
          {value}
        </p>
        {(change !== undefined || hint) && (
          <div className="flex shrink-0 items-center gap-1.5">
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
            {hint && (
              <span className="truncate text-[10px] text-muted">{hint}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

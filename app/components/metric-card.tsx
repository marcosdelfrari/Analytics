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
      className={`border p-4 ${
        highlighted
          ? "rounded-lg border-positive/25 bg-surface bg-gradient-to-br from-positive/20 via-positive/10 to-transparent shadow-[inset_0_1px_0_rgba(74,222,128,0.28)]"
          : "border-border bg-surface"
      }`}
    >
      <p
        className={`text-[11px] uppercase tracking-wider ${
          highlighted ? "text-positive/75" : "text-muted"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 font-mono text-2xl font-medium tracking-tight ${
          highlighted ? "text-positive" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
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
        {hint && <span className="text-[11px] text-muted">{hint}</span>}
      </div>
    </div>
  );
}

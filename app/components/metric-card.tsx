interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  change?: number;
}

export function MetricCard({ label, value, hint, change }: MetricCardProps) {
  const changePositive = change !== undefined && change >= 0;

  return (
    <div className="border border-border bg-surface p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-mono text-2xl font-medium tracking-tight text-foreground">
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

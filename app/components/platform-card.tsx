import { PlatformLogoLabel } from "@/app/components/platform-logo";
import type { PlatformSummary } from "@/lib/types";
import { formatChange, formatCurrency, formatNumber } from "@/lib/format";

export function PlatformCard({ summary }: { summary: PlatformSummary }) {
  const positive = (summary.spendChange ?? 0) >= 0;
  const campaignLabel =
    summary.activeCampaigns !== null && summary.totalCampaigns !== null
      ? `${summary.activeCampaigns}/${summary.totalCampaigns} ativas`
      : summary.period;

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PlatformLogoLabel platform={summary.platform} size={16} />
          <p className="text-xs font-medium">{summary.label}</p>
        </div>
        <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
          {campaignLabel}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div>
          <p className="text-[10px] text-muted">Investimento</p>
          <p className="mt-0.5 font-mono text-sm font-medium">
            {formatCurrency(summary.spend)}
          </p>
          {summary.spendChange !== null && (
            <p
              className={`font-mono text-[10px] ${positive ? "text-positive" : "text-negative"}`}
            >
              {formatChange(summary.spendChange)}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-muted">Conversões</p>
          <p className="mt-0.5 font-mono text-sm font-medium">
            {formatNumber(summary.conversions)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted">Impressões</p>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground">
            {formatNumber(summary.impressions)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted">Cliques</p>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground">
            {formatNumber(summary.clicks)}
          </p>
        </div>
      </div>
    </div>
  );
}

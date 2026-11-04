import Link from "next/link";
import { PlatformLogoLabel } from "@/app/components/platform-logo";
import type { PlatformSummary, PublishedReport } from "@/lib/types";
import {
  formatChange,
  formatCurrency,
  formatCurrencyDetailed,
  formatNumber,
  formatPercent,
} from "@/lib/format";

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle py-2.5 last:border-b-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[12px]">{value}</span>
    </div>
  );
}

export function ReportPlatformPanel({
  summary,
  reports,
}: {
  summary: PlatformSummary | undefined;
  reports: PublishedReport[];
}) {
  if (!summary) {
    return (
      <p className="rounded-xl border border-border bg-surface px-3.5 py-3 text-[12px] text-muted-foreground">
        Sem relatório de mídia publicado nesta plataforma.
      </p>
    );
  }

  const ctr =
    summary.impressions > 0
      ? (summary.clicks / summary.impressions) * 100
      : 0;
  const cpc = summary.clicks > 0 ? summary.spend / summary.clicks : 0;
  const costPerConversion =
    summary.conversions > 0 ? summary.spend / summary.conversions : 0;

  return (
    <div className="space-y-3 border-t border-border-subtle pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PlatformLogoLabel
            platform={summary.platform}
            size={16}
            className="text-xs font-medium"
          />
          <span className="font-mono text-[11px] text-muted">
            {summary.period}
          </span>
        </div>
        {summary.spendChange !== null && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {formatChange(summary.spendChange)} vs. anterior
          </span>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface px-3.5 py-1.5">
          <MetricRow label="Investimento" value={formatCurrency(summary.spend)} />
          <MetricRow
            label="Impressões"
            value={formatNumber(summary.impressions)}
          />
          <MetricRow label="Cliques" value={formatNumber(summary.clicks)} />
          <MetricRow label="Conversões" value={formatNumber(summary.conversions)} />
          <MetricRow label="CTR" value={formatPercent(ctr, 2)} />
          <MetricRow label="CPC médio" value={formatCurrencyDetailed(cpc)} />
          <MetricRow
            label="Custo por conversão"
            value={formatCurrencyDetailed(costPerConversion)}
          />
          {summary.activeCampaigns !== null && summary.totalCampaigns !== null && (
            <MetricRow
              label="Campanhas ativas"
              value={`${summary.activeCampaigns}/${summary.totalCampaigns}`}
            />
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-3.5 py-2.5">
            <h3 className="text-xs font-medium">Histórico publicado</h3>
          </div>
          {reports.length === 0 ? (
            <p className="px-3.5 py-4 text-[12px] text-muted-foreground">
              Sem envios anteriores nesta plataforma.
            </p>
          ) : (
            <ul>
              {reports.map((report) => (
                <li
                  key={report.id}
                  className="flex items-center justify-between gap-3 border-b border-border-subtle px-3.5 py-2.5 last:border-b-0"
                >
                  <div>
                    <p className="text-xs font-medium">{report.period}</p>
                    <p className="font-mono text-[11px] text-muted">
                      {formatCurrency(report.spend)} ·{" "}
                      {formatNumber(report.conversions)} conv.
                    </p>
                  </div>
                  {report.storedFile ? (
                    <Link
                      href={`/relatorios/arquivo/${report.id}`}
                      className="rounded-lg border border-border px-2.5 py-1 text-[11px] transition hover:bg-surface-elevated"
                    >
                      Baixar
                    </Link>
                  ) : report.fileName ? (
                    <span className="rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                      Baixar
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

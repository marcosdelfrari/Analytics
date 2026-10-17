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
      <p className="text-[12px] leading-5 text-muted-foreground">
        Nenhum relatório de mídia (Google/Meta Ads) publicado pela equipe nesta
        plataforma. Os dados do script abaixo vêm da coleta no site (UTM).
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
    <div className="space-y-4 border-t border-border-subtle pt-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">
        Relatório de mídia publicado
      </p>
      <section className="border border-border bg-surface px-4 py-3">
        <PlatformLogoLabel
          platform={summary.platform}
          size={20}
          className="text-sm font-medium"
        />
        <p className="mt-1 text-sm font-medium">{summary.period}</p>
        {summary.spendChange !== null && (
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {formatChange(summary.spendChange)} vs. período anterior
          </p>
        )}
      </section>

      <section className="border border-border bg-surface px-4 py-2">
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

      <section className="border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-medium">Histórico publicado</h3>
        </div>
        {reports.length === 0 ? (
          <p className="px-4 py-6 text-[12px] text-muted-foreground">
            Sem envios anteriores nesta plataforma.
          </p>
        ) : (
          <ul>
            {reports.map((report) => (
              <li
                key={report.id}
                className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm">{report.period}</p>
                  <p className="font-mono text-[11px] text-muted">
                    {formatCurrency(report.spend)} ·{" "}
                    {formatNumber(report.conversions)} conv.
                  </p>
                </div>
                {report.storedFile ? (
                  <Link
                    href={`/relatorios/arquivo/${report.id}`}
                    className="border border-border px-2.5 py-1.5 text-[12px] hover:bg-surface-elevated"
                  >
                    Baixar
                  </Link>
                ) : report.fileName ? (
                  <span className="border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground">
                    Baixar
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import type { CampaignStatus, CampaignTreeNode } from "@/lib/types";
import {
  formatCurrencyDetailed,
  formatNumber,
} from "@/lib/format";

const statusLabel: Record<CampaignStatus, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  aprendizado: "Aprendizado",
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
      {statusLabel[status]}
    </span>
  );
}

function MetricsLine({
  spend,
  clicks,
  conversions,
}: {
  spend: number;
  clicks: number;
  conversions: number;
}) {
  return (
    <p className="font-mono text-[11px] text-muted-foreground">
      {formatCurrencyDetailed(spend)} · {formatNumber(clicks)} cliques ·{" "}
      {formatNumber(conversions)} conv.
    </p>
  );
}

export function CampaignsHierarchy({
  campaigns,
}: {
  campaigns: CampaignTreeNode[];
}) {
  if (campaigns.length === 0) {
    return (
      <section className="border border-border bg-surface px-4 py-10 text-[13px] text-muted-foreground">
        Nenhuma campanha publicada ainda. Quando a equipe enviar a estrutura de
        campanhas, ela aparece aqui por plataforma.
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => (
        <details
          key={campaign.id}
          className="group border border-border bg-surface open:bg-surface"
        >
          <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{campaign.name}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {campaign.type}
                </p>
                <MetricsLine
                  spend={campaign.spend}
                  clicks={campaign.clicks}
                  conversions={campaign.conversions}
                />
              </div>
              <StatusBadge status={campaign.status} />
            </div>
          </summary>
          <div className="border-t border-border-subtle px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-muted">
              Grupos de anúncios
            </p>
            <ul className="mt-3 space-y-3">
              {campaign.adGroups.map((group) => (
                <li
                  key={group.id}
                  className="rounded-sm border border-border-subtle bg-background/40 px-3 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium">{group.name}</p>
                      <MetricsLine
                        spend={group.spend}
                        clicks={group.clicks}
                        conversions={group.conversions}
                      />
                    </div>
                    <StatusBadge status={group.status} />
                  </div>
                  <ul className="mt-3 space-y-2 border-l border-border pl-3">
                    {group.ads.map((ad) => (
                      <li key={ad.id} className="text-[12px]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">{ad.name}</span>
                          <StatusBadge status={ad.status} />
                        </div>
                        <MetricsLine
                          spend={ad.spend}
                          clicks={ad.clicks}
                          conversions={ad.conversions}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </div>
  );
}

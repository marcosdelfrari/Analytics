import { PlanUpgradeBanner } from "@/app/components/plan-upgrade-banner";
import { LockedScreenPreview } from "@/app/components/locked-screen-preview";
import { MetricCard } from "@/app/components/metric-card";

export function ClientFreemiumDashboard() {
  return (
    <div className="space-y-6">
      <PlanUpgradeBanner />

      <LockedScreenPreview
        title="Visão geral"
        description="Exemplo de totais do período publicado."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Investimento total" value="R$ 48.320" hint="Último envio" />
          <MetricCard label="Conversões" value="1.284" />
          <MetricCard label="CTR médio" value="3,42%" />
          <MetricCard label="Custo por conversão" value="R$ 37,63" />
        </div>
      </LockedScreenPreview>

      <div className="grid gap-3 lg:grid-cols-2">
        <LockedScreenPreview
          title="Google Ads"
          description="Resumo da última publicação."
        >
          <div className="space-y-3 p-2">
            <p className="font-mono text-[10px] uppercase text-google">Google</p>
            <p className="font-mono text-2xl">R$ 27.840</p>
            <div className="h-16 rounded bg-border/40" />
          </div>
        </LockedScreenPreview>
        <LockedScreenPreview
          title="Meta Ads"
          description="Resumo da última publicação."
        >
          <div className="space-y-3 p-2">
            <p className="font-mono text-[10px] uppercase text-meta">Meta</p>
            <p className="font-mono text-2xl">R$ 20.480</p>
            <div className="h-16 rounded bg-border/40" />
          </div>
        </LockedScreenPreview>
      </div>

      <LockedScreenPreview
        title="Histórico de períodos"
        description="Relatórios e downloads liberados no plano."
      >
        <ul className="divide-y divide-border-subtle">
          {["Outubro 2026 · Google Ads", "Outubro 2026 · Meta Ads", "Setembro 2026 · Google Ads"].map(
            (row) => (
              <li key={row} className="flex items-center justify-between py-3 text-sm">
                <span>{row}</span>
                <span className="border border-border px-2 py-1 text-[11px]">Baixar</span>
              </li>
            ),
          )}
        </ul>
      </LockedScreenPreview>
    </div>
  );
}

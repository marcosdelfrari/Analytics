import { RevealGroup, RevealItem } from "@/app/components/fractal/motion";
import { SectionShell } from "@/app/components/fractal/section-shell";

export function FractalPlatformHighlights() {
  return (
    <SectionShell
      id="highlights"
      title="Da atração ao lead atribuído, sem ferramentas soltas."
      subtitle="Além de cruzar Google Ads e Meta Ads com o tráfego do site, o Fractal entrega captura de leads nativa, rastreamento de links e governança de acesso para sua equipe."
      className="border-t border-border-subtle bg-surface/20"
    >
      <RevealGroup className="grid gap-4 lg:grid-cols-3">
        {/* Card 1: Formulários e Leads Atribuídos */}
        <RevealItem className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-positive">
                Captura nativa
              </span>
              <span className="rounded-full border border-positive/25 bg-positive/10 px-2.5 py-0.5 text-[10.5px] font-medium text-positive">
                Novo
              </span>
            </div>
            <h3 className="mt-3 text-lg font-medium tracking-tight">
              Formulários que já nascem com a campanha do lead
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Monte formulários em formato de botão flutuante de WhatsApp, popup, corpo em seção
              ou intenção de saída. Cada envio registra automaticamente a UTM, a
              página e a empresa de origem.
            </p>
          </div>

          <div className="mt-6 space-y-2.5 rounded-lg border border-border-subtle bg-background/70 p-3.5">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md border border-foreground/20 bg-surface-elevated px-2 py-1 text-[11px] font-medium text-foreground">
                Botão WhatsApp
              </span>
              <span className="rounded-md border border-border-subtle bg-surface px-2 py-1 text-[11px] text-muted-foreground">
                Popup
              </span>
              <span className="rounded-md border border-border-subtle bg-surface px-2 py-1 text-[11px] text-muted-foreground">
                Intenção de saída
              </span>
              <span className="rounded-md border border-border-subtle bg-surface px-2 py-1 text-[11px] text-muted-foreground">
                Corpo (seção)
              </span>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12px] font-medium text-foreground">
                   Mariana Souza · (11) 99812-••••
                </p>
                <span className="shrink-0 font-mono text-[10px] text-positive">
                  há 2 min
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                <span className="rounded border border-meta/30 bg-meta/10 px-1.5 py-0.5 text-meta">
                  utm_source=meta
                </span>
                <span className="rounded border border-border-subtle bg-background/60 px-1.5 py-0.5">
                  campanha_escala
                </span>
                <span className="ml-auto text-foreground/80">CSV ↓</span>
              </div>
            </div>
          </div>
        </RevealItem>

        {/* Card 2: Montador UTM, Encurtador e Verificador ao Vivo */}
        <RevealItem className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                Rastreamento ponta a ponta
              </span>
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                UTM + Pixel
              </span>
            </div>
            <h3 className="mt-3 text-lg font-medium tracking-tight">
              Montador de UTMs, encurtador e teste de script ao vivo
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Gere URLs padronizadas para seus anúncios, crie links curtos para
              WhatsApp, bio ou QR code e valide a instalação do script em tempo
              real antes de subir as campanhas.
            </p>
          </div>

          <div className="mt-6 space-y-2 rounded-lg border border-border-subtle bg-background/70 p-3.5">
            <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface px-2.5 py-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  Link curto · Bio & WhatsApp
                </p>
                <p className="truncate font-mono text-[11.5px] text-foreground">
                  /r/promo-outubro
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-border-subtle bg-background px-2 py-0.5 font-mono text-[11px] tabular-nums text-foreground">
                412 cliques
              </span>
            </div>

            <div className="flex items-center justify-between rounded-md border border-positive/25 bg-positive/5 px-2.5 py-2">
              <span className="flex items-center gap-2 text-[11.5px] text-foreground">
                <span className="h-2 w-2 rounded-full bg-positive" aria-hidden />
                Tag detectada no &lt;head&gt;
              </span>
              <span className="font-mono text-[10.5px] text-positive">
                Ativo
              </span>
            </div>
          </div>
        </RevealItem>

        {/* Card 3: Multi-empresa, Papéis e Exportação */}
        <RevealItem className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                Governança & Dados
              </span>
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                Multi-empresa
              </span>
            </div>
            <h3 className="mt-3 text-lg font-medium tracking-tight">
              Permissões por empresa e exportação completa
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Separe o papel de Proprietário e Analista, libere apenas as
              empresas desejadas em um painel visual e exporte relatórios de
              mídia, tráfego, eventos e leads em CSV.
            </p>
          </div>

          <div className="mt-6 space-y-2 rounded-lg border border-border-subtle bg-background/70 p-3.5">
            <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface px-2.5 py-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  Empresa ativa
                </p>
                <p className="truncate text-[12px] font-medium text-foreground">
                  Clínica Horizonte · Matriz
                </p>
              </div>
              <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                Trocar ▾
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-border-subtle bg-surface px-2.5 py-2">
                <p className="text-[10px] text-muted">Papéis de acesso</p>
                <p className="mt-0.5 text-[11.5px] font-medium text-foreground">
                  Proprietário & Analista
                </p>
              </div>
              <div className="rounded-md border border-border-subtle bg-surface px-2.5 py-2">
                <p className="text-[10px] text-muted">Portabilidade</p>
                <p className="mt-0.5 text-[11.5px] font-medium text-foreground">
                  CSV + Planilha/PDF
                </p>
              </div>
            </div>
          </div>
        </RevealItem>
      </RevealGroup>
    </SectionShell>
  );
}

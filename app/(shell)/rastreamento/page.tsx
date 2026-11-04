import { Suspense } from "react";
import { isSystemAdminAccount } from "@/lib/access-roles";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { CopyButton } from "@/app/(shell)/encurtador/copy-button";
import { AppShellMain } from "@/app/components/app-shell";
import { RastreamentoLoadingFallback } from "@/app/components/loading-fallbacks";
import { authEnabled } from "@/lib/auth-config";
import { getActiveCompanyIdForSession, getSession } from "@/lib/auth";
import {
  isSiteConversionEvent,
  SITE_CONVERSION_EVENT_NAME,
  siteConversionTrackExampleSnippet,
  siteConversionTrackSnippet,
} from "@/lib/tracking-events";
import { AllowedDomainsPanel } from "@/app/(shell)/rastreamento/allowed-domains-panel";
import { InstallationTestPanel } from "@/app/(shell)/rastreamento/installation-test-panel";
import { orderedParamEntries } from "@/lib/tracking-attribution";
import {
  ensureTrackingSite,
  listAllowedDomains,
  listRecentHits,
  trackingSnippet,
} from "@/lib/tracking";

const eventSnippet = siteConversionTrackSnippet();
const conversionExampleSnippet = siteConversionTrackExampleSnippet();

function formatWhen(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

async function TrackingPageContent() {
  await connection();
  let planActive = true;

  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (!isSystemAdminAccount(session.role) && session.role !== "client") {
      redirect("/login");
    }
    if (session.role === "client" && !session.isProprietario) {
      redirect("/dashboard");
    }
    planActive = isSystemAdminAccount(session.role) || session.planActive;

    const companyId = await getActiveCompanyIdForSession(session);
    if (!companyId) {
      redirect(
        isSystemAdminAccount(session.role) ? "/dashboard" : "/login?erro=sem-acesso",
      );
    }
    const site = await ensureTrackingSite(companyId);
    const [hits, domains] = await Promise.all([
      listRecentHits(site.id),
      listAllowedDomains(site.id),
    ]);
    const snippet = trackingSnippet(site.publicKey);

    return (
      <AppShellMain
        title="Script"
        subtitle="Chave e script exclusivos desta conta de cliente"
        planActive={planActive}
      >
        <ScriptPanels snippet={snippet} hits={hits} domains={domains} />
      </AppShellMain>
    );
  }

  return (
    <AppShellMain
      title="Script"
      subtitle="Chave e script exclusivos desta conta de cliente"
      planActive={planActive}
    >
      <p className="text-[12px] text-muted">
        Entre com uma conta para gerar a chave do script.
      </p>
    </AppShellMain>
  );
}

function ScriptPanels({
  snippet,
  hits,
  domains,
}: {
  snippet: string;
  hits: Awaited<ReturnType<typeof listRecentHits>>;
  domains: Awaited<ReturnType<typeof listAllowedDomains>>;
}) {
  return (
    <div className="grid gap-6">
      <AllowedDomainsPanel domains={domains} />

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            <h2 className="text-sm font-medium">Link do tracker</h2>
            <p className="text-[12px] text-muted">
              Recomendado: dentro do <code className="font-mono text-[11px]">&lt;head&gt;</code>,
              entre as demais tags. O script envia todos os parâmetros da URL (UTM,
              gclid, gbraid, gad_source, gad_campaignid, etc.) e mantém na sessão
              enquanto o visitante navega no site.
            </p>
          </div>
          <CopyButton value={snippet} />
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-5 text-foreground">
          {snippet}
        </pre>
      </section>

      <section className="overflow-hidden rounded-2xl border border-positive/35 bg-surface bg-gradient-to-br from-positive/10 via-transparent to-transparent">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-positive/20 px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-medium">Evento de conversão do site</h2>
              <span className="rounded-full border border-positive/40 bg-positive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-positive">
                Conversão · script
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
              No dashboard, o card{" "}
              <strong className="font-medium text-foreground">Conversões</strong>{" "}
              vem dos relatórios de mídia publicados (Google Ads / Meta Ads). Na
              coleta do site, a conversão é este evento — use exatamente o nome
              abaixo no{" "}
              <code className="font-mono text-[11px] text-foreground">
                fractal.track(...)
              </code>
              :
            </p>
            <p className="mt-3 font-mono text-lg font-medium tracking-tight text-positive">
              &quot;{SITE_CONVERSION_EVENT_NAME}&quot;
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Ex.: clique em WhatsApp, envio de formulário ou lead qualificado.
              Outros nomes entram como eventos customizados, não como conversão
              do site.
            </p>
          </div>
          <CopyButton value={conversionExampleSnippet} />
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-5 text-foreground">
          {conversionExampleSnippet}
        </pre>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            <h2 className="text-sm font-medium">Outros eventos customizados</h2>
            <p className="text-[12px] text-muted">
              Chame depois que o script carregar. A campanha da sessão vai junto.
              Para conversão do site, use o nome{" "}
              <code className="font-mono text-[11px]">{SITE_CONVERSION_EVENT_NAME}</code>{" "}
              na seção acima.
            </p>
          </div>
          <CopyButton value={eventSnippet} />
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-5 text-foreground">
          {eventSnippet}
        </pre>
      </section>

      <InstallationTestPanel hasDomains={domains.length > 0} />

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-medium">Últimas coletas</h2>
          <p className="text-[12px] text-muted">
            {hits.length === 1 ? "1 registro" : `${hits.length} registros`}.
            Eventos{" "}
            <code className="font-mono text-[11px]">{SITE_CONVERSION_EVENT_NAME}</code>{" "}
            aparecem como conversão do site.
          </p>
        </div>
        {hits.length === 0 ? (
          <p className="px-4 py-6 text-[12px] text-muted">
            Nenhuma visita ou evento chegou ainda.
          </p>
        ) : (
          <ul>
            {hits.map((hit) => {
              const params = orderedParamEntries(hit.params);
              const isConversion =
                hit.kind !== "pageview" && isSiteConversionEvent(hit.name);
              return (
                <li
                  key={hit.id}
                  className="border-b border-border-subtle px-4 py-4 last:border-b-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">
                        {hit.kind === "pageview" ? "Visita" : hit.name}
                      </p>
                      {isConversion ? (
                        <span className="rounded-full border border-positive/40 bg-positive/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-positive">
                          Conversão do site
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[12px] text-muted">
                      {formatWhen(hit.createdAt)}
                    </p>
                  </div>
                  <p className="mt-1 truncate font-mono text-[12px] text-muted-foreground">
                    {hit.path}
                  </p>
                  {params.length > 0 && (
                    <p className="mt-2 break-all text-[12px] text-foreground">
                      {params
                        .map(([key, value]) => `${key}=${value}`)
                        .join(" · ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<RastreamentoLoadingFallback />}>
      <TrackingPageContent />
    </Suspense>
  );
}

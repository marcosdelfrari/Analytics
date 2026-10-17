import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { CopyButton } from "@/app/encurtador/copy-button";
import { AppShell } from "@/app/components/app-shell";
import { RastreamentoLoadingFallback } from "@/app/components/loading-fallbacks";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";
import { AllowedDomainsPanel } from "@/app/rastreamento/allowed-domains-panel";
import { InstallationTestPanel } from "@/app/rastreamento/installation-test-panel";
import {
  ensureTrackingSite,
  jsonStringEntries,
  listAllowedDomains,
  listRecentHits,
  trackingSnippet,
} from "@/lib/tracking";

const eventSnippet = `lotus.track("contato", { botao: "whatsapp" });`;

function formatWhen(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

async function TrackingPageContent() {
  await connection();
  let mode: "client" | "admin" = "admin";
  let planActive = true;

  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "admin" && session.role !== "client") {
      redirect("/login");
    }
    mode = session.role === "admin" ? "admin" : "client";
    planActive = session.role === "admin" || session.planActive;

    const site = await ensureTrackingSite(session.userId);
    const [hits, domains] = await Promise.all([
      listRecentHits(site.id),
      listAllowedDomains(site.id),
    ]);
    const snippet = trackingSnippet(site.publicKey);

    return (
      <AppShell
        mode={mode}
        title="Script"
        subtitle="Chave e script exclusivos desta conta de cliente"
        planActive={planActive}
      >
        <ScriptPanels snippet={snippet} hits={hits} domains={domains} />
      </AppShell>
    );
  }

  return (
    <AppShell
      mode={mode}
      title="Script"
      subtitle="Chave e script exclusivos desta conta de cliente"
      planActive={planActive}
    >
      <p className="text-[12px] text-muted">
        Entre com uma conta para gerar a chave do script.
      </p>
    </AppShell>
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

      <InstallationTestPanel hasDomains={domains.length > 0} />

      <section className="border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-medium">Link do tracker</h2>
            <p className="text-[12px] text-muted">
              Recomendado: dentro do <code className="font-mono text-[11px]">&lt;head&gt;</code>,
              entre as demais tags. O async baixa cedo e registra a visita antes de
              quem sai rápido da página. Só eventos com a chave desta conta entram na
              coleta.
            </p>
          </div>
          <CopyButton value={snippet} />
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-5 text-foreground">
          {snippet}
        </pre>
      </section>

      <section className="border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-medium">Eventos</h2>
            <p className="text-[12px] text-muted">
              Chame no site depois que o script carregar. A campanha da sessão
              vai junto.
            </p>
          </div>
          <CopyButton value={eventSnippet} />
        </div>
        <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-5 text-foreground">
          {eventSnippet}
        </pre>
      </section>

      <section className="border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Últimas coletas</h2>
          <p className="text-[12px] text-muted">
            {hits.length === 1 ? "1 registro" : `${hits.length} registros`}
          </p>
        </div>
        {hits.length === 0 ? (
          <p className="px-4 py-6 text-[12px] text-muted">
            Nenhuma visita ou evento chegou ainda.
          </p>
        ) : (
          <ul>
            {hits.map((hit) => {
              const params = jsonStringEntries(hit.params);
              return (
                <li
                  key={hit.id}
                  className="border-b border-border-subtle px-4 py-4 last:border-b-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">
                      {hit.kind === "pageview" ? "Visita" : hit.name}
                    </p>
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

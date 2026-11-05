import { Suspense } from "react";
import { isSystemAdminAccount } from "@/lib/access-roles";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { InstallFormsPanel } from "@/app/(shell)/organizacao/formularios/instalar/install-forms-panel";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { fetchLeadFormSnippet } from "@/lib/lead-form-embed";
import { loadLeadFormsWorkspace } from "@/lib/lead-forms-view";
import {
  canAccessLeadForms,
  canRegisterResources,
} from "@/lib/organization-access";
import { ensureAdminLotusOrganization } from "@/lib/organizations-store";
import { coletaOrigin } from "@/lib/fractal-origin";

async function InstalarFormulariosContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; form?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (authEnabled) {
    if (!session) redirect("/login");
    if (!canAccessLeadForms(session)) {
      redirect("/dashboard");
    }
    if (isSystemAdminAccount(session.role)) {
      await ensureAdminLotusOrganization();
    }
  }

  const { org, form } = await searchParams;
  const canRegister = !session || canRegisterResources(session);
  const workspace = session
    ? await loadLeadFormsWorkspace({
        email: session.email,
        canRegister,
        orgId: org,
      })
    : null;

  const organizations = workspace?.organizations ?? [];
  const activeOrgId = workspace?.activeOrganizationId ?? null;
  const forms = workspace?.forms ?? [];
  const selectedFormId =
    (form && forms.some((item) => item.id === form) ? form : null) ??
    forms[0]?.id ??
    null;
  const selected = forms.find((item) => item.id === selectedFormId) ?? null;

  let snippetHtml: string | null = null;
  let snippetError: string | null = null;
  if (selected?.active) {
    const snippet = await fetchLeadFormSnippet(selected.id);
    if ("error" in snippet) {
      snippetError = snippet.error;
    } else {
      snippetHtml = snippet.html;
    }
  }

  const apiOrigin = coletaOrigin();

  return (
    <AppShellMain
      title="Instalar formulário"
      subtitle="Liste os formulários e copie o script servido pela Fractal API"
    >
      {organizations.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface px-6 py-10 shadow-sm">
          <h2 className="text-lg font-medium tracking-tight">
            Nenhuma organização disponível
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            {canRegister
              ? "Crie e ative formulários na organização para gerar o script de instalação."
              : "Os formulários das empresas liberadas para você aparecem aqui quando existirem."}
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/70 p-2.5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                Organização
              </span>
              {organizations.map((organization) => {
                const active = organization.id === activeOrgId;
                return (
                  <Link
                    key={organization.id}
                    href={`/organizacao/formularios/instalar?org=${organization.id}`}
                    className={`rounded-xl px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                      active
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                    }`}
                  >
                    {organization.name}
                  </Link>
                );
              })}
            </div>
            <Link
              href={`/organizacao/formularios?org=${activeOrgId ?? ""}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-surface-elevated hover:text-foreground"
            >
              <span>Criar formulário</span>
              <span aria-hidden>→</span>
            </Link>
          </div>

          {activeOrgId ? (
            <InstallFormsPanel
              organizationId={activeOrgId}
              forms={forms}
              selectedFormId={selectedFormId}
              snippetHtml={snippetHtml}
              snippetError={snippetError}
              apiOrigin={apiOrigin}
            />
          ) : null}
        </div>
      )}
    </AppShellMain>
  );
}

export default function InstalarFormulariosPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; form?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <InstalarFormulariosContent searchParams={searchParams} />
    </Suspense>
  );
}

import { Suspense } from "react";
import { isSystemAdminAccount } from "@/lib/access-roles";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { LeadFormBuilder } from "@/app/(shell)/organizacao/formularios/lead-form-builder";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { loadLeadFormsWorkspace } from "@/lib/lead-forms-view";
import {
  canAccessLeadForms,
  canRegisterResources,
} from "@/lib/organization-access";
import { ensureAdminLotusOrganization } from "@/lib/organizations-store";

async function FormulariosPageContent({
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

  return (
    <AppShellMain
      title="Criar formulário"
      subtitle="Monte captura dinâmica com prévia e salve as predefinições"
    >
      {organizations.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface px-6 py-10 shadow-sm">
          <h2 className="text-lg font-medium tracking-tight">
            Nenhuma organização disponível
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            {canRegister
              ? "Cadastre empresas na organização para começar a criar formulários de lead."
              : "Peça ao proprietário para liberar empresas na sua conta ou aguarde formulários nas empresas já liberadas."}
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
                    href={`/organizacao/formularios?org=${organization.id}`}
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
            {canRegister ? (
              <Link
                href={`/organizacao?org=${activeOrgId ?? ""}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-surface-elevated hover:text-foreground"
              >
                <span aria-hidden>←</span>
                <span>Voltar à organização</span>
              </Link>
            ) : (
              <Link
                href={`/organizacao/leads?org=${activeOrgId ?? ""}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-surface-elevated hover:text-foreground"
              >
                <span aria-hidden>←</span>
                <span>Leads capturados</span>
              </Link>
            )}
          </div>

          {workspace && activeOrgId ? (
            <LeadFormBuilder
              organizationId={activeOrgId}
              companies={workspace.companies}
              forms={workspace.forms}
              initialFormId={form ?? null}
            />
          ) : null}
        </div>
      )}
    </AppShellMain>
  );
}

export default function FormulariosPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; form?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <FormulariosPageContent searchParams={searchParams} />
    </Suspense>
  );
}

import { Suspense } from "react";
import { isSystemAdminAccount } from "@/lib/access-roles";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { LeadsListPanel } from "@/app/(shell)/organizacao/leads/leads-list-panel";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { loadLeadsView } from "@/lib/leads-view";
import { canRegisterResources } from "@/lib/organization-access";
import { ensureAdminLotusOrganization } from "@/lib/organizations-store";

async function LeadsPageContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; form?: string; empresa?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (authEnabled) {
    if (!session) redirect("/login");
    if (!isSystemAdminAccount(session.role) && session.role !== "client") {
      redirect("/login");
    }
    if (isSystemAdminAccount(session.role)) {
      await ensureAdminLotusOrganization();
    }
  }

  const { org, form, empresa } = await searchParams;
  const canRegister = !session || canRegisterResources(session);
  const view = session
    ? await loadLeadsView({
        email: session.email,
        canRegister: canRegisterResources(session),
        orgId: org,
        formId: form,
        companyId: empresa,
      })
    : null;

  const organizations = view?.organizations ?? [];
  const activeOrgId = view?.activeOrganizationId ?? null;

  return (
    <AppShellMain
      title="Leads capturados"
      subtitle="Envios dos formulários instalados nos sites"
    >
      {organizations.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface px-6 py-10 shadow-sm">
          <h2 className="text-lg font-medium tracking-tight">
            Nenhum lead disponível
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            {canRegister
              ? "Quando a organização tiver empresas e formulários publicados, os envios aparecem aqui."
              : "Os leads das empresas liberadas para a sua conta aparecem aqui."}
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
                const href = `/organizacao/leads?org=${organization.id}`;
                return (
                  <Link
                    key={organization.id}
                    href={href}
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
              <span aria-hidden>←</span>
              <span>Formulários</span>
            </Link>
          </div>

          {view && activeOrgId ? (
            <LeadsListPanel
              organizationId={activeOrgId}
              forms={view.forms}
              companies={view.companies}
              submissions={view.submissions}
              totalCount={view.totalCount}
              selectedFormId={view.selectedFormId}
              selectedCompanyId={view.selectedCompanyId}
              canRegister={canRegister}
            />
          ) : null}
        </div>
      )}
    </AppShellMain>
  );
}

export default function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; form?: string; empresa?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <LeadsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

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
import { listLeadFormsForOrganization } from "@/lib/lead-forms-store";
import { canAccessOrganizationWorkspace } from "@/lib/organization-access";
import {
  ensureAdminLotusOrganization,
  listOrganizationsForOwner,
} from "@/lib/organizations-store";

async function FormulariosPageContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; form?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (authEnabled) {
    if (!session) redirect("/login");
    if (!canAccessOrganizationWorkspace(session)) {
      redirect("/dashboard");
    }
    if (isSystemAdminAccount(session.role)) {
      await ensureAdminLotusOrganization();
    }
  }

  const { org, form } = await searchParams;
  const organizations = session
    ? await listOrganizationsForOwner(session.email)
    : [];
  const selectedOrgId = org ?? organizations[0]?.id ?? null;
  const activeOrg =
    organizations.find((item) => item.id === selectedOrgId) ??
    organizations[0] ??
    null;

  const forms = activeOrg
    ? await listLeadFormsForOrganization(activeOrg.id)
    : [];

  return (
    <AppShellMain
      title="Criar formulário"
      subtitle="Monte captura dinâmica com prévia e salve as predefinições"
    >
      {organizations.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface px-6 py-10 shadow-sm">
          <h2 className="text-lg font-medium tracking-tight">
            Nenhuma organização sob sua gestão
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Só proprietários podem criar formulários de lead para a organização.
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
                const active = organization.id === activeOrg?.id;
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
            <Link
              href={`/organizacao?org=${activeOrg?.id ?? ""}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/60 px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-surface-elevated hover:text-foreground"
            >
              <span aria-hidden>←</span>
              <span>Voltar à organização</span>
            </Link>
          </div>

          {activeOrg ? (
            <LeadFormBuilder
              organizationId={activeOrg.id}
              companies={activeOrg.companies.map((company) => ({
                id: company.id,
                name: company.name,
              }))}
              forms={forms}
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

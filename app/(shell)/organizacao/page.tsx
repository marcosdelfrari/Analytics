import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { OrganizationAccordions } from "@/app/(shell)/organizacao/organization-accordions";
import { OrganizationFlowPanel } from "@/app/(shell)/organizacao/organization-flow-panel";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { canAccessOrganizationWorkspace } from "@/lib/organization-access";
import {
  ensureAdminLotusOrganization,
  listOrganizationsForOwner,
} from "@/lib/organizations-store";

async function OrganizacaoPageContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (authEnabled) {
    if (!session) redirect("/login");
    if (!canAccessOrganizationWorkspace(session)) {
      redirect("/dashboard");
    }
    if (session.role === "admin") {
      await ensureAdminLotusOrganization();
    }
  }

  const { org } = await searchParams;
  const organizations = session
    ? await listOrganizationsForOwner(session.email)
    : [];
  const selectedOrgId = org ?? organizations[0]?.id ?? null;
  const activeOrg =
    organizations.find((item) => item.id === selectedOrgId) ??
    organizations[0] ??
    null;

  const isAdmin = !authEnabled || session?.role === "admin";

  return (
    <AppShellMain
      title={
        activeOrg
          ? `Empresas e acessos · ${activeOrg.name}`
          : "Empresas e acessos"
      }
      subtitle="Fluxo de pertencimento, empresas cadastradas e usuários da organização"
    >
      {!activeOrg ? (
        <section className="rounded-2xl border border-border bg-surface px-6 py-10">
          <h2 className="text-lg font-medium tracking-tight">
            Nenhuma organização sob sua gestão
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Se você deveria ser proprietário, peça ao administrador da
            plataforma para confirmar seu e-mail como responsável pela
            organização.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {organizations.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-muted">
                Organização:
              </span>
              {organizations.map((item) => {
                const selected = item.id === activeOrg.id;
                return (
                  <Link
                    key={item.id}
                    href={`/organizacao?org=${item.id}`}
                    className={`rounded-xl border px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                      selected
                        ? "border-foreground/40 bg-surface-elevated text-foreground"
                        : "border-border bg-surface text-muted-foreground hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}

          <OrganizationFlowPanel
            organization={activeOrg}
            allowOwnerRole={isAdmin}
          />

          <OrganizationAccordions
            organization={activeOrg}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </AppShellMain>
  );
}

export default function OrganizacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; empresa?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <OrganizacaoPageContent searchParams={searchParams} />
    </Suspense>
  );
}

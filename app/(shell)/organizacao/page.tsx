import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { OrganizationPanel } from "@/app/(shell)/admin/organization-panel";
import {
  AddAccessGrantForm,
  AddCompanyForm,
} from "@/app/(shell)/organizacao/org-forms";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { listOrganizationsForOwner } from "@/lib/organizations-store";

async function OrganizacaoPageContent({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (authEnabled) {
    if (!session) redirect("/login");
    if (!session.isOrganizationOwner) {
      redirect(session.role === "admin" ? "/admin" : "/dashboard");
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

  return (
    <AppShellMain
      title="Organização"
      subtitle="Empresas e quem pode acessar a plataforma"
    >
      {organizations.length === 0 ? (
        <section className="border border-border bg-surface px-6 py-10">
          <h2 className="text-lg font-medium tracking-tight">
            Nenhuma organização sob sua gestão
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Se você deveria ser proprietário, peça ao administrador da plataforma
            para confirmar seu e-mail como responsável pela organização.
          </p>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4">
            <OrganizationPanel
              basePath="/organizacao"
              organizations={organizations}
              selectedOrgId={activeOrg?.id ?? null}
              selectedCompanyId={null}
              manageAccess
            />
            {activeOrg && <AddCompanyForm organizationId={activeOrg.id} />}
            {activeOrg && <AddAccessGrantForm organization={activeOrg} />}
          </div>
          <section className="border border-border bg-surface px-6 py-10">
            <h2 className="text-lg font-medium tracking-tight">
              Papel de proprietário
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Aqui você agrupa empresas e define quais e-mails entram como{" "}
              <span className="text-foreground">usuários comuns</span>. Eles
              usam dashboard, relatórios e ferramentas, mas não criam empresas
              nem convidam outras pessoas.
            </p>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              Planos, publicação de relatórios e remoção de empresas ficam com o{" "}
              <span className="text-foreground">administrador da plataforma</span>.
            </p>
          </section>
        </div>
      )}
    </AppShellMain>
  );
}

export default function OrganizacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <OrganizacaoPageContent searchParams={searchParams} />
    </Suspense>
  );
}

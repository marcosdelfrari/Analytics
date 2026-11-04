import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CreateClientForm } from "@/app/(shell)/admin/create-client-form";
import { UsersPanel } from "@/app/(shell)/admin/users-panel";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { adminEmail } from "@/lib/access-code";
import { hasElevatedCompanyAccess } from "@/lib/company-access-role";
import { listOrganizations } from "@/lib/organizations-store";
import { requireAdmin } from "@/lib/require-admin";
import { listAccountsForDirectory } from "@/lib/users-store";

async function AdminUsersContent() {
  await connection();
  await requireAdmin();

  const [organizations, users] = await Promise.all([
    listOrganizations(),
    listAccountsForDirectory(),
  ]);

  // Owner da org ou administrador de ao menos uma empresa = nível Proprietário
  const ownerEmails = new Set(
    organizations.flatMap((org) =>
      org.grants
        .filter((grant) => hasElevatedCompanyAccess(grant))
        .map((grant) => grant.email.trim().toLowerCase()),
    ),
  );

  const rootAdminsCount = users.filter(
    (u) => u.role === "admin" || u.email === adminEmail,
  ).length;
  const ownersCount = users.filter(
    (u) =>
      u.role !== "admin" &&
      u.email !== adminEmail &&
      ownerEmails.has(u.email.trim().toLowerCase()),
  ).length;
  const analystsCount = Math.max(
    0,
    users.length - rootAdminsCount - ownersCount,
  );

  return (
    <AppShellMain
      title="Usuários da plataforma"
      subtitle="Diretório de contas, papéis de acesso e pertencimento em organizações"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Gestão de acessos
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Contas e permissões
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition hover:border-white/25 hover:text-foreground"
            >
              <span aria-hidden>←</span>
              <span>Organizações e Fluxo</span>
            </Link>
            <Link
              href="/admin/planos"
              className="inline-flex items-center gap-1.5 rounded-xl border border-positive/30 bg-positive/10 px-3.5 py-2 text-[12px] font-medium text-positive transition hover:bg-positive/20"
            >
              <span>Controle de planos →</span>
            </Link>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              Total de contas
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {users.length}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Cadastradas na plataforma
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              Proprietários (Owners)
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {ownersCount}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Administradores de organizações
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              Analistas
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {analystsCount}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Acesso operacional por empresa
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <CreateClientForm />
          </div>
        </section>

        <UsersPanel users={users} organizations={organizations} />
      </div>
    </AppShellMain>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminUsersContent />
    </Suspense>
  );
}

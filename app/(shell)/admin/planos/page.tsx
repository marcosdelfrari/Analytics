import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  setClientPlan,
  setOrganizationPlans,
  setUserPlan,
} from "@/app/(shell)/admin/actions";
import { AppShellMain } from "@/app/components/app-shell";
import { AdminLoadingFallback } from "@/app/components/loading-fallbacks";
import { adminEmail } from "@/lib/access-code";
import { listOrganizations } from "@/lib/organizations-store";
import { requireAdmin } from "@/lib/require-admin";
import {
  subscriptionPlans,
  whatsAppCheckoutUrl,
} from "@/lib/subscription-plans";
import { listAccounts } from "@/lib/users-store";

async function AdminPlansContent() {
  await connection();
  await requireAdmin();

  const [organizations, users] = await Promise.all([
    listOrganizations(),
    listAccounts(),
  ]);

  const allCompanies = organizations.flatMap((org) => org.companies);
  const activeCompaniesCount = allCompanies.filter((c) => c.planActive).length;
  const freeCompaniesCount = allCompanies.length - activeCompaniesCount;
  const fullActiveOrgsCount = organizations.filter(
    (org) =>
      org.companies.length > 0 && org.companies.every((c) => c.planActive),
  ).length;
  const clientUsers = users.filter((u) => u.email !== adminEmail);

  return (
    <AppShellMain
      title="Controle de planos"
      subtitle="Ativação de assinaturas por organização, empresa e usuário"
    >
      <div className="space-y-8">
        {/* Top bar + KPIs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Gestão de licenças
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              Assinaturas e liberação de acesso
            </h2>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-muted-foreground transition hover:border-white/25 hover:text-foreground"
          >
            <span aria-hidden>←</span>
            <span>Voltar para Plataforma</span>
          </Link>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-positive/25 bg-surface bg-gradient-to-br from-positive/10 via-transparent to-transparent p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-positive">
              Empresas com plano ativo
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {activeCompaniesCount}
              <span className="text-sm font-normal text-muted">
                {" "}
                / {allCompanies.length}
              </span>
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Visualizando dados reais publicados
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              Empresas no gratuito
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {freeCompaniesCount}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Com bloqueio de demonstração (Paywall)
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              Organizações 100% ativas
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {fullActiveOrgsCount}
              <span className="text-sm font-normal text-muted">
                {" "}
                / {organizations.length}
              </span>
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Com todas as empresas liberadas
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              Planos comerciais
            </p>
            <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
              {subscriptionPlans.length}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Pro (R$ 697) · Agency (R$ 2.997)
            </p>
          </div>
        </section>

        {/* Controle por Organização e Empresas */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Por organização e empresa
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
              Status de plano das organizações
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Ative ou desative o plano individualmente por empresa ou libere a
              organização inteira de uma vez.
            </p>
          </div>

          {organizations.length === 0 ? (
            <p className="px-6 py-8 text-[12.5px] text-muted">
              Nenhuma organização cadastrada.
            </p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {organizations.map((org) => {
                const activeCount = org.companies.filter(
                  (c) => c.planActive,
                ).length;
                const allActive =
                  org.companies.length > 0 &&
                  activeCount === org.companies.length;
                const owners = org.grants.filter((g) => g.isOrgProprietario);

                return (
                  <div key={org.id} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm font-semibold text-foreground">
                            {org.name}
                          </h3>
                          <span
                            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                              allActive
                                ? "border-positive/30 bg-positive/10 text-positive"
                                : activeCount > 0
                                  ? "border-white/20 bg-white/10 text-foreground"
                                  : "border-border bg-background/60 text-muted"
                            }`}
                          >
                            {activeCount}/{org.companies.length} ativas
                          </span>
                        </div>

                        <p className="mt-1 text-[12px] text-muted-foreground">
                          {owners.length > 0 ? (
                            <>
                              Proprietário(s):{" "}
                              <span className="font-mono text-[11px] text-foreground">
                                {owners.map((o) => o.email).join(", ")}
                              </span>
                            </>
                          ) : (
                            "Sem proprietário vinculado"
                          )}
                        </p>
                      </div>

                      {org.companies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={setOrganizationPlans}>
                            <input
                              type="hidden"
                              name="organizationId"
                              value={org.id}
                            />
                            <input
                              type="hidden"
                              name="planActive"
                              value={allActive ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className={`cursor-pointer rounded-xl border px-3 py-1.5 text-[12px] font-medium transition ${
                                allActive
                                  ? "border-border text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                                  : "border-positive/35 bg-positive/10 text-positive hover:bg-positive/20"
                              }`}
                            >
                              {allActive
                                ? "Desativar toda a organização"
                                : "Ativar toda a organização"}
                            </button>
                          </form>
                          <Link
                            href={`/admin?org=${org.id}`}
                            className="rounded-xl border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                          >
                            Ver fluxo
                          </Link>
                        </div>
                      )}
                    </div>

                    {org.companies.length === 0 ? (
                      <p className="mt-4 rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 text-[12px] text-muted">
                        Nenhuma empresa vinculada a esta organização.
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {org.companies.map((company) => (
                          <div
                            key={company.id}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
                              company.planActive
                                ? "border-positive/25 bg-background/80"
                                : "border-border-subtle bg-background/40"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full ${
                                    company.planActive
                                      ? "bg-positive"
                                      : "bg-muted/60"
                                  }`}
                                />
                                <p className="truncate text-[13px] font-medium text-foreground">
                                  {company.name}
                                </p>
                              </div>
                              <p className="mt-0.5 font-mono text-[10.5px] text-muted">
                                {company.planActive
                                  ? "Plano ativo · Liberado"
                                  : "Plano gratuito · Bloqueado"}
                              </p>
                            </div>

                            <form action={setClientPlan} className="shrink-0">
                              <input
                                type="hidden"
                                name="id"
                                value={company.id}
                              />
                              <input type="hidden" name="org" value={org.id} />
                              <input
                                type="hidden"
                                name="returnTo"
                                value="none"
                              />
                              <input
                                type="hidden"
                                name="planActive"
                                value={company.planActive ? "false" : "true"}
                              />
                              <button
                                type="submit"
                                className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition ${
                                  company.planActive
                                    ? "border-border bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                                    : "border-positive/35 bg-positive/10 text-positive hover:bg-positive/20"
                                }`}
                              >
                                {company.planActive ? "Desativar" : "Ativar"}
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Controle de Plano por Conta de Usuário */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Por conta de usuário
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
              Licença direta no cadastro do usuário
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Controle direto da flag de plano na conta do usuário (usada como
              fallback quando o usuário não tem empresa específica selecionada).
            </p>
          </div>

          {clientUsers.length === 0 ? (
            <p className="px-6 py-8 text-[12.5px] text-muted">
              Nenhum cliente cadastrado além do administrador.
            </p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {clientUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] ${
                        user.planActive
                          ? "border-positive/30 bg-positive/10 text-positive"
                          : "border-border bg-background/60 text-muted"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          user.planActive ? "bg-positive" : "bg-muted"
                        }`}
                      />
                      {user.planActive ? "Conta ativa" : "Conta gratuita"}
                    </span>

                    <form action={setUserPlan}>
                      <input type="hidden" name="id" value={user.id} />
                      <input
                        type="hidden"
                        name="planActive"
                        value={user.planActive ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[11.5px] font-medium transition ${
                          user.planActive
                            ? "border-border text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                            : "border-positive/35 bg-positive/10 text-positive hover:bg-positive/20"
                        }`}
                      >
                        {user.planActive
                          ? "Desativar conta"
                          : "Ativar conta"}
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Catálogo de Planos Comerciais */}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Catálogo comercial
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
              Ofertas exibidas no Paywall da plataforma
            </h2>
          </div>

          <div className="grid gap-4 p-6 lg:grid-cols-2">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col justify-between rounded-xl border p-5 ${
                  plan.highlighted
                    ? "border-foreground/30 bg-surface-elevated"
                    : "border-border bg-background/50"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          Plano {plan.name}
                        </h3>
                        {plan.highlighted && (
                          <span className="rounded border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground">
                            Mais popular
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-lg font-semibold text-foreground">
                      {plan.price}
                      <span className="text-xs font-normal text-muted">
                        {plan.period}
                      </span>
                    </p>
                  </div>

                  <ul className="mt-4 grid gap-1.5 text-[12px] text-muted-foreground sm:grid-cols-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-1.5">
                        <span className="text-positive">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-3">
                  <span className="font-mono text-[11px] text-muted">
                    Link de contratação (WhatsApp)
                  </span>
                  <a
                    href={whatsAppCheckoutUrl(plan.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                  >
                    Testar link →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShellMain>
  );
}

export default function AdminPlansPage() {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminPlansContent />
    </Suspense>
  );
}

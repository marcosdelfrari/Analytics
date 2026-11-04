"use client";

import { useActionState, useState } from "react";
import {
  addCompanyToOrganization,
  addOrganizationAccess,
  type FormState,
} from "@/app/(shell)/organizacao/actions";
import type { OrganizationSummary } from "@/lib/organizations-store";
import { ORG_OWNER_SCOPE_LABEL } from "@/lib/access-roles";
import { OrgMemberRole } from "@/lib/access-roles";
import { COMPANY_ACCESS_ROLE_LABELS } from "@/lib/company-access-role";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-background/80 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-white/25 focus:bg-background";

export function IncludeCompanyInlineForm({
  organizationId,
  basePath = "/organizacao",
}: {
  organizationId: string;
  basePath?: "/organizacao" | "/admin";
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    addCompanyToOrganization,
    null,
  );

  return (
    <form action={action} className="w-full sm:w-auto">
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="basePath" value={basePath} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="name"
          required
          placeholder="Nome da nova empresa..."
          className="w-full rounded-xl border border-white/10 bg-background/80 px-3.5 py-2 text-[12.5px] text-foreground outline-none transition focus:border-white/25 focus:bg-background sm:w-64"
        />
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-xl bg-foreground px-3.5 py-2 text-[12px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Incluindo..." : "Incluir empresa"}
        </button>
      </div>
      {state?.error && (
        <p className="mt-1.5 text-[11.5px] text-negative">{state.error}</p>
      )}
    </form>
  );
}

export function IncludeUserInlineForm({
  organization,
  basePath = "/organizacao",
  allowOwnerRole = false,
}: {
  organization: OrganizationSummary;
  basePath?: "/organizacao" | "/admin";
  allowOwnerRole?: boolean;
}) {
  const [scope, setScope] = useState<"by_company" | "all_companies" | "owner">(
    organization.companies.length === 0 ? "all_companies" : "by_company",
  );
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(() =>
    organization.companies.length === 1 && organization.companies[0]
      ? [organization.companies[0].id]
      : organization.companies.map((c) => c.id),
  );
  const [state, action, pending] = useActionState<FormState, FormData>(
    addOrganizationAccess,
    null,
  );

  const isOwner = scope === "owner";
  const allCompanies = scope === "all_companies" || scope === "owner";

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  return (
    <form
      action={action}
      className="border-b border-border bg-background/35 px-6 py-4"
    >
      <input type="hidden" name="organizationId" value={organization.id} />
      <input type="hidden" name="basePath" value={basePath} />
      <input type="hidden" name="isOwner" value={isOwner ? "true" : "false"} />
      <input
        type="hidden"
        name="allCompanies"
        value={allCompanies ? "true" : "false"}
      />

      <div className="grid gap-3 md:grid-cols-[1fr_1.15fr_0.95fr_auto] md:items-end">
        <label className="block text-[12px] text-muted-foreground">
          Nome do usuário
          <input
            name="name"
            placeholder="Ex.: Marcos Lacerda"
            className="mt-1 w-full rounded-xl border border-white/10 bg-background px-3.5 py-2 text-[13px] text-foreground outline-none transition focus:border-white/25"
          />
        </label>

        <label className="block text-[12px] text-muted-foreground">
          E-mail do usuário
          <input
            name="email"
            type="email"
            required
            placeholder="usuario@empresa.com.br"
            className="mt-1 w-full rounded-xl border border-white/10 bg-background px-3.5 py-2 text-[13px] text-foreground outline-none transition focus:border-white/25"
          />
        </label>

        <label className="block text-[12px] text-muted-foreground">
          Senha inicial{" "}
          <span className="font-mono text-[10.5px] text-muted">(opcional)</span>
          <input
            name="password"
            type="password"
            minLength={8}
            placeholder="Mín. 8 caracteres"
            autoComplete="new-password"
            className="mt-1 w-full rounded-xl border border-white/10 bg-background px-3.5 py-2 text-[13px] text-foreground outline-none transition focus:border-white/25"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="h-[38px] cursor-pointer rounded-xl bg-foreground px-4 text-[12.5px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Incluindo..." : "+ Incluir usuário"}
        </button>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3 text-[12px]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
          Escopo de acesso:
        </span>

        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-border-subtle bg-background/70 p-1">
          <button
            type="button"
            onClick={() => setScope("by_company")}
            className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition ${
              scope === "by_company"
                ? "bg-surface-elevated text-foreground ring-1 ring-white/15"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Por empresa
          </button>
          <button
            type="button"
            onClick={() => setScope("all_companies")}
            className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition ${
              scope === "all_companies"
                ? "bg-surface-elevated text-foreground ring-1 ring-white/15"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas as empresas
          </button>
          {allowOwnerRole && (
            <button
              type="button"
              onClick={() => setScope("owner")}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition ${
                scope === "owner"
                  ? "bg-positive/15 text-positive ring-1 ring-positive/35"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ORG_OWNER_SCOPE_LABEL}
            </button>
          )}
        </div>

        {scope === "by_company" && organization.companies.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              Empresas e papel:
            </span>
            {organization.companies.map((company) => {
              const checked = selectedCompanies.includes(company.id);
              return (
                <div
                  key={company.id}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 transition ${
                    checked
                      ? "border-positive/35 bg-positive/10"
                      : "border-border-subtle bg-background/40 opacity-65"
                  }`}
                >
                  {checked && (
                    <input
                      type="hidden"
                      name="companyIds"
                      value={company.id}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => toggleCompanySelection(company.id)}
                    className={`cursor-pointer text-[11.5px] font-medium ${
                      checked ? "text-positive" : "text-muted-foreground"
                    }`}
                  >
                    {checked ? `✓ ${company.name}` : `+ ${company.name}`}
                  </button>
                  {checked && (
                    <select
                      name={`companyRole_${company.id}`}
                      defaultValue="analyst"
                      className="rounded-md border border-border-subtle bg-background/90 px-1.5 py-0.5 text-[10.5px] text-foreground outline-none focus:border-white/25"
                      aria-label={`Papel em ${company.name}`}
                    >
                      <option value="analyst">Analista</option>
                      <option value={OrgMemberRole.proprietario}>
                        {COMPANY_ACCESS_ROLE_LABELS.proprietario}
                      </option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {state?.error && (
        <p className="mt-2 text-[12px] text-negative">{state.error}</p>
      )}
    </form>
  );
}

export function AddCompanyForm({
  organizationId,
  basePath = "/organizacao",
}: {
  organizationId: string;
  basePath?: "/organizacao" | "/admin";
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    addCompanyToOrganization,
    null,
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left text-[12.5px] font-medium transition hover:border-white/20 hover:bg-surface-elevated"
      >
        <span>Incluir nova empresa</span>
        <span aria-hidden className="text-muted-foreground">+</span>
      </button>
    );
  }

  return (
    <form
      action={action}
      className="overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="basePath" value={basePath} />
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-medium">Incluir empresa</h2>
        <p className="text-[12px] text-muted">
          Registra uma nova empresa dentro desta organização.
        </p>
      </div>
      <div className="p-4">
        <label className="block text-[12px] text-muted-foreground">
          Nome da empresa
          <input name="name" required className={fieldClass} />
        </label>
      </div>
      {state?.error && (
        <p className="px-4 text-[12px] text-negative">{state.error}</p>
      )}
      <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground transition hover:bg-surface-elevated"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Incluir empresa"}
        </button>
      </div>
    </form>
  );
}

export function AddAccessGrantForm({
  organization,
  basePath = "/organizacao",
  allowOwnerRole = false,
}: {
  organization: OrganizationSummary;
  basePath?: "/organizacao" | "/admin";
  allowOwnerRole?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    addOrganizationAccess,
    null,
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left text-[12.5px] font-medium transition hover:border-white/20 hover:bg-surface-elevated"
      >
        <span>Incluir usuário na organização</span>
        <span aria-hidden className="text-muted-foreground">+</span>
      </button>
    );
  }

  return (
    <form
      action={action}
      className="overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <input type="hidden" name="organizationId" value={organization.id} />
      <input type="hidden" name="basePath" value={basePath} />
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-medium">Incluir usuário</h2>
        <p className="text-[12px] text-muted">
          Registra o usuário no banco e vincula a {organization.name}.
        </p>
      </div>
      <div className="grid gap-4 p-4">
        <label className="block text-[12px] text-muted-foreground">
          Nome
          <input
            name="name"
            placeholder="Nome do usuário"
            className={fieldClass}
          />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          E-mail
          <input name="email" type="email" required className={fieldClass} />
        </label>
        {allowOwnerRole && (
          <label className="flex items-center gap-2 text-[12px] text-foreground">
            <input type="checkbox" name="isOwner" value="true" />
            Definir como {ORG_OWNER_SCOPE_LABEL.toLowerCase()}
          </label>
        )}
        <label className="flex items-center gap-2 text-[12px]">
          <input type="checkbox" name="allCompanies" value="true" />
          Acesso a todas as empresas da organização
        </label>
        {organization.companies.length > 0 && (
          <fieldset className="text-[12px] text-muted-foreground">
            <legend className="mb-2">
              Empresas (marque uma ou mais para usuário comum)
            </legend>
            <ul className="space-y-2">
              {organization.companies.map((company) => (
                <li
                  key={company.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle bg-background/40 px-2 py-1.5"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="companyIds"
                      value={company.id}
                    />
                    {company.name}
                  </label>
                  <select
                    name={`companyRole_${company.id}`}
                    defaultValue="analyst"
                    className="rounded-md border border-border-subtle bg-background/80 px-2 py-1 text-[11px]"
                  >
                    <option value="analyst">Analista</option>
                    <option value={OrgMemberRole.proprietario}>
                      {COMPANY_ACCESS_ROLE_LABELS.proprietario}
                    </option>
                  </select>
                </li>
              ))}
            </ul>
          </fieldset>
        )}
      </div>
      {state?.error && (
        <p className="px-4 text-[12px] text-negative">{state.error}</p>
      )}
      <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-border px-3.5 py-1.5 text-[12px] text-muted-foreground transition hover:bg-surface-elevated"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Incluir usuário"}
        </button>
      </div>
    </form>
  );
}

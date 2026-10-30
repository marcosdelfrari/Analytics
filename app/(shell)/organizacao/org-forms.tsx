"use client";

import { useActionState, useState } from "react";
import {
  addCompanyToOrganization,
  addOrganizationAccess,
  type FormState,
} from "@/app/(shell)/organizacao/actions";
import type { OrganizationSummary } from "@/lib/organizations-store";

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
  const [allCompanies, setAllCompanies] = useState(
    organization.companies.length === 0,
  );
  const [isOwner, setIsOwner] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    addOrganizationAccess,
    null,
  );

  return (
    <form
      action={action}
      className="border-b border-border bg-background/35 px-6 py-4"
    >
      <input type="hidden" name="organizationId" value={organization.id} />
      <input type="hidden" name="basePath" value={basePath} />

      <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_auto] md:items-end">
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

        <button
          type="submit"
          disabled={pending}
          className="h-[38px] cursor-pointer rounded-xl bg-foreground px-4 text-[12.5px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Incluindo..." : "Incluir usuário"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
          Empresas com acesso:
        </span>

        {allowOwnerRole && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-foreground">
            <input
              type="checkbox"
              name="isOwner"
              value="true"
              checked={isOwner}
              onChange={(e) => {
                setIsOwner(e.target.checked);
                if (e.target.checked) setAllCompanies(true);
              }}
            />
            <span>Proprietário (Owner)</span>
          </label>
        )}

        <label className="inline-flex cursor-pointer items-center gap-1.5 text-foreground">
          <input
            type="checkbox"
            name="allCompanies"
            value="true"
            checked={allCompanies || isOwner}
            onChange={(e) => setAllCompanies(e.target.checked)}
          />
          <span>Todas as empresas da organização</span>
        </label>

        {!allCompanies &&
          !isOwner &&
          organization.companies.map((company, idx) => (
            <label
              key={company.id}
              className="inline-flex cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <input
                type="checkbox"
                name="companyIds"
                value={company.id}
                defaultChecked={idx === 0}
              />
              <span>{company.name}</span>
            </label>
          ))}
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
            Definir como proprietário (Owner) da organização
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
                <li key={company.id}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="companyIds"
                      value={company.id}
                    />
                    {company.name}
                  </label>
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

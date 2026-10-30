"use client";

import { useActionState, useState } from "react";
import {
  addCompaniesToUserGrant,
  removeAccessGrant,
  type FormState,
} from "@/app/(shell)/organizacao/actions";
import { removeAccessGrant as removeAccessGrantAdmin } from "@/app/(shell)/admin/actions";
import type {
  AccessGrantSummary,
  OrganizationSummary,
} from "@/lib/organizations-store";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-background/80 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-white/25 focus:bg-background";

export function GrantAccessActions({
  grant,
  organization,
  basePath,
  selectedCompanyId,
  manageAccess,
  blockRemoveOnOrganizacaoOwner,
}: {
  grant: AccessGrantSummary;
  organization: OrganizationSummary;
  basePath: "/admin" | "/organizacao";
  selectedCompanyId: string | null;
  manageAccess: boolean;
  blockRemoveOnOrganizacaoOwner: boolean;
}) {
  const [associateOpen, setAssociateOpen] = useState(false);
  const [state, associateAction, associatePending] = useActionState<
    FormState,
    FormData
  >(addCompaniesToUserGrant, null);

  const removeAction =
    basePath === "/organizacao" ? removeAccessGrant : removeAccessGrantAdmin;

  const availableCompanies = organization.companies.filter(
    (company) => !grant.companyIds.includes(company.id),
  );

  const canAssociate =
    !grant.isOwner && !grant.allCompanies && availableCompanies.length > 0;

  const canRemove =
    manageAccess && !(blockRemoveOnOrganizacaoOwner && grant.isOwner);

  if (!canAssociate && !canRemove) {
    return null;
  }

  return (
    <div className="w-full min-w-[7.5rem] shrink-0">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {manageAccess && canAssociate && !associateOpen && (
          <button
            type="button"
            onClick={() => setAssociateOpen(true)}
            className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-surface-elevated"
          >
            + Empresa
          </button>
        )}
        {canRemove && (
          <form action={removeAction}>
            <input type="hidden" name="grantId" value={grant.id} />
            <input type="hidden" name="org" value={organization.id} />
            <input type="hidden" name="basePath" value={basePath} />
            {selectedCompanyId ? (
              <input type="hidden" name="empresa" value={selectedCompanyId} />
            ) : null}
            <button
              type="submit"
              className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
            >
              Remover
            </button>
          </form>
        )}
      </div>

      {manageAccess && canAssociate && associateOpen && (
        <form
          action={associateAction}
          className="mt-2 overflow-hidden rounded-xl border border-border-subtle bg-background/60 p-3"
        >
          <input type="hidden" name="organizationId" value={organization.id} />
          <input type="hidden" name="basePath" value={basePath} />
          <input type="hidden" name="grantId" value={grant.id} />
          {selectedCompanyId ? (
            <input type="hidden" name="empresa" value={selectedCompanyId} />
          ) : null}
          <p className="text-[11px] font-medium text-foreground">
            Associar mais empresas
          </p>
          <ul className="mt-2 space-y-1.5">
            {availableCompanies.map((company) => (
              <li key={company.id}>
                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-foreground">
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
          {state?.error ? (
            <p className="mt-2 text-[11px] text-negative">{state.error}</p>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssociateOpen(false)}
              className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-surface-elevated"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={associatePending}
              className="cursor-pointer rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {associatePending ? "Salvando..." : "Associar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AssociateUserToCompanyPanel({
  organization,
  companyId,
  companyName,
  basePath,
}: {
  organization: OrganizationSummary;
  companyId: string;
  companyName: string;
  basePath: "/admin" | "/organizacao";
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    addCompaniesToUserGrant,
    null,
  );

  const eligibleGrants = organization.grants.filter(
    (grant) =>
      !grant.isOwner &&
      !grant.allCompanies &&
      !grant.companyIds.includes(companyId),
  );

  if (eligibleGrants.length === 0) {
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left text-[12.5px] font-medium transition hover:border-white/20 hover:bg-surface-elevated"
      >
        <span>Associar analista a {companyName}</span>
        <span aria-hidden className="text-muted-foreground">
          +
        </span>
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
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="empresa" value={companyId} />
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-medium">Associar analista</h2>
        <p className="text-[12px] text-muted">
          O mesmo usuário pode acessar várias empresas da organização
        </p>
      </div>
      <div className="p-4">
        <label className="block text-[12px] text-muted-foreground">
          Analista já cadastrado na organização
          <select name="grantId" required className={fieldClass}>
            <option value="">Selecione…</option>
            {eligibleGrants.map((grant) => (
              <option key={grant.id} value={grant.id}>
                {grant.email} · {grant.companyIds.length} empresa
                {grant.companyIds.length === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
      </div>
      {state?.error ? (
        <p className="px-4 text-[12px] text-negative">{state.error}</p>
      ) : null}
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
          {pending ? "Salvando..." : "Associar à empresa"}
        </button>
      </div>
    </form>
  );
}

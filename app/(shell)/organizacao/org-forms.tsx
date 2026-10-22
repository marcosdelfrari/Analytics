"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  addCompanyToOrganization,
  addOrganizationAccess,
  type FormState,
} from "@/app/(shell)/organizacao/actions";
import type { OrganizationSummary } from "@/lib/organizations-store";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted-foreground";

export function AddCompanyForm({ organizationId }: { organizationId: string }) {
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
        className="w-full border border-border bg-surface px-4 py-3 text-left text-[12px] font-medium hover:bg-surface-elevated"
      >
        Cadastrar nova empresa
      </button>
    );
  }

  return (
    <form action={action} className="border border-border bg-surface">
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Nova empresa</h2>
        <p className="text-[12px] text-muted">
          Usuários comuns não podem criar empresas; apenas proprietários.
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
          className="border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-elevated"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="border border-border px-3 py-1.5 text-[12px] hover:bg-surface-elevated disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Adicionar empresa"}
        </button>
      </div>
    </form>
  );
}

export function AddAccessGrantForm({
  organization,
}: {
  organization: OrganizationSummary;
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
        className="w-full border border-border bg-surface px-4 py-3 text-left text-[12px] font-medium hover:bg-surface-elevated"
      >
        Convidar usuário
      </button>
    );
  }

  return (
    <form action={action} className="border border-border bg-surface">
      <input type="hidden" name="organizationId" value={organization.id} />
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Convidar usuário</h2>
        <p className="text-[12px] text-muted">
          E-mail Google de quem usará a plataforma como usuário comum
        </p>
      </div>
      <div className="grid gap-4 p-4">
        <label className="block text-[12px] text-muted-foreground">
          E-mail
          <input name="email" type="email" required className={fieldClass} />
        </label>
        <label className="flex items-center gap-2 text-[12px]">
          <input type="checkbox" name="allCompanies" value="true" defaultChecked />
          Acesso a toda a organização
        </label>
        {organization.companies.length > 0 && (
          <fieldset className="text-[12px] text-muted-foreground">
            <legend className="mb-2">Ou marque empresas específicas</legend>
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
            <p className="mt-2 text-[11px] text-muted">
              Se marcar empresas, desmarque &quot;toda a organização&quot; no envio.
            </p>
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
          className="border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-elevated"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="border border-border px-3 py-1.5 text-[12px] hover:bg-surface-elevated disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Liberar acesso"}
        </button>
      </div>
    </form>
  );
}

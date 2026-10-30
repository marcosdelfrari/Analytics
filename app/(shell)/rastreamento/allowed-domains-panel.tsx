"use client";

import { useActionState } from "react";
import {
  addTrackingDomain,
  deleteTrackingDomain,
  type DomainFormState,
} from "@/app/(shell)/rastreamento/actions";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-background/80 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-white/25 focus:bg-background";

type DomainRow = {
  id: string;
  host: string;
};

export function AllowedDomainsPanel({
  domains,
}: {
  domains: DomainRow[];
}) {
  const [state, action, pending] = useActionState<DomainFormState, FormData>(
    addTrackingDomain,
    null,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-medium">Domínios autorizados</h2>
        <p className="text-[12px] text-muted">
          Só aceitamos eventos cujo endereço da página esteja nestes domínios
          (inclui subdomínios, ex. loja.cliente.com com cliente.com cadastrado).
          Cadastre ao menos um antes de publicar o script.
        </p>
      </div>

      {domains.length === 0 ? (
        <p className="border-b border-border-subtle px-5 py-4 text-[12px] text-amber-700 dark:text-amber-400">
          Nenhum domínio cadastrado — a coleta está bloqueada até você adicionar
          um.
        </p>
      ) : (
        <ul className="border-b border-border-subtle">
          {domains.map((domain) => (
            <li
              key={domain.id}
              className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
            >
              <span className="font-mono text-[12px] text-foreground">
                {domain.host}
              </span>
              <form action={deleteTrackingDomain}>
                <input type="hidden" name="domainId" value={domain.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                >
                  Remover
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={action} className="grid gap-3 p-5">
        <label className="block text-[12px] text-muted-foreground">
          Adicionar domínio
          <input
            name="host"
            type="text"
            required
            placeholder="cliente.com.br"
            className={fieldClass}
            autoComplete="off"
          />
        </label>
        {state && "error" in state && (
          <p className="text-[12px] text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        {state && "ok" in state && (
          <p className="text-[12px] text-muted">Domínio adicionado.</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-xl bg-foreground px-4 py-2 text-[12px] font-medium text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar domínio"}
        </button>
      </form>
    </section>
  );
}

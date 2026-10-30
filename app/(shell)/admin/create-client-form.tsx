"use client";

import { useActionState, useState } from "react";
import {
  createClientAccount,
  type FormState,
} from "@/app/(shell)/admin/actions";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-background/80 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-white/25 focus:bg-background";

export function CreateClientForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(
    createClientAccount,
    null,
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left text-[12.5px] font-medium transition hover:border-white/20 hover:bg-surface-elevated"
      >
        <span>Atalho: criar cliente + organização</span>
        <span aria-hidden className="text-muted-foreground">+</span>
      </button>
    );
  }

  return (
    <form
      action={action}
      className="overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-medium">Atalho: cliente único</h2>
        <p className="text-[12px] text-muted">
          Cria organização, primeira empresa e define o e-mail como
          administrador (proprietário)
        </p>
      </div>
      <div className="grid gap-4 p-4">
        <label className="block text-[12px] text-muted-foreground">
          Nome
          <input name="name" required className={fieldClass} />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          E-mail
          <input name="email" type="email" required className={fieldClass} />
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
          {pending ? "Criando..." : "Criar acesso"}
        </button>
      </div>
    </form>
  );
}

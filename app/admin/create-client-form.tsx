"use client";

import { useActionState } from "react";
import { createClientAccount, type FormState } from "@/app/admin/actions";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted-foreground";

export function CreateClientForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createClientAccount,
    null,
  );

  return (
    <form action={action} className="border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Novo cliente</h2>
        <p className="text-[12px] text-muted">
          O cliente entra com esse e-mail e vê só o próprio dashboard
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
        <label className="block text-[12px] text-muted-foreground">
          Senha inicial
          <input
            name="password"
            type="text"
            required
            minLength={6}
            className={fieldClass}
          />
        </label>
      </div>
      {state?.error && (
        <p className="px-4 text-[12px] text-negative">{state.error}</p>
      )}
      <div className="flex justify-end border-t border-border px-4 py-3">
        <button
          type="submit"
          disabled={pending}
          className="border border-foreground bg-foreground px-3 py-1.5 text-[12px] text-background disabled:opacity-60"
        >
          {pending ? "Criando..." : "Criar acesso"}
        </button>
      </div>
    </form>
  );
}

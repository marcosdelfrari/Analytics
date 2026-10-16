"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted-foreground";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <form action={action} className="border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h1 className="text-sm font-medium">Entrar</h1>
        <p className="text-[12px] text-muted">Portal de acompanhamento</p>
      </div>
      <div className="grid gap-4 p-4">
        <label className="block text-[12px] text-muted-foreground">
          E-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className={fieldClass}
          />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Senha
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={fieldClass}
          />
        </label>
      </div>
      {state?.error && (
        <p className="px-4 text-[12px] text-negative">{state.error}</p>
      )}
      <div className="border-t border-border px-4 py-3">
        <button
          type="submit"
          disabled={pending}
          className="w-full border border-foreground bg-foreground px-3 py-1.5 text-[12px] text-background disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </form>
  );
}

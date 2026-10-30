"use client";

import { useActionState } from "react";
import {
  setPasswordSessionAction,
  type AuthFormState,
} from "@/app/login/actions";

export function SetPasswordForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    setPasswordSessionAction,
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm">
        Nova senha
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        Confirmar senha
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </label>
      {state?.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Salvar senha"}
      </button>
    </form>
  );
}

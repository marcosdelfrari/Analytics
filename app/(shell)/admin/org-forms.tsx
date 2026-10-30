"use client";

import { useActionState } from "react";
import {
  createOrganizationAccount,
  type FormState,
} from "@/app/(shell)/admin/actions";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-background/80 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-white/25 focus:bg-background";

export function CreateOrganizationForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    createOrganizationAccount,
    null,
  );

  return (
    <form action={action} className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-medium">Nova organização</h2>
      </div>
      <div className="p-4">
        <label className="block text-[12px] text-muted-foreground">
          Nome
          <input name="name" required className={fieldClass} />
        </label>
      </div>
      {state?.error && (
        <p className="px-4 text-[12px] text-negative">{state.error}</p>
      )}
      <div className="flex justify-end border-t border-border px-4 py-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Criar"}
        </button>
      </div>
    </form>
  );
}

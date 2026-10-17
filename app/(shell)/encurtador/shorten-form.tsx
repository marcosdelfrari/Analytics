"use client";

import { useActionState } from "react";
import { createShortLink, type ShortenState } from "@/app/(shell)/encurtador/actions";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted-foreground";

export function ShortenForm({
  origin,
  initialUrl = "",
}: {
  origin: string;
  initialUrl?: string;
}) {
  const [state, action, pending] = useActionState<ShortenState, FormData>(
    createShortLink,
    null,
  );
  const created = state && "url" in state ? `${origin}/s/${state.url}` : null;

  return (
    <form action={action} className="border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Novo atalho</h2>
        <p className="text-[12px] text-muted">
          O link curto redireciona para o endereço da campanha
        </p>
      </div>
      <div className="grid gap-4 p-4">
        <label className="block text-[12px] text-muted-foreground">
          Endereço de destino
          <input
            name="url"
            type="url"
            required
            defaultValue={initialUrl}
            placeholder="https://cliente.com/oferta"
            className={fieldClass}
          />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Nome
          <input
            name="label"
            placeholder="Opcional, ex. Meta — criativo A"
            className={fieldClass}
          />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Atalho
          <input
            name="code"
            placeholder="Opcional, ex. oferta-mar"
            className={fieldClass}
          />
        </label>
      </div>
      {state && "error" in state && (
        <p className="px-4 text-[12px] text-negative">{state.error}</p>
      )}
      {created && (
        <p className="px-4 font-mono text-[12px] text-foreground">{created}</p>
      )}
      <div className="flex justify-end border-t border-border px-4 py-3">
        <button
          type="submit"
          disabled={pending}
          className="border border-foreground bg-foreground px-3 py-1.5 text-[12px] text-background disabled:opacity-60"
        >
          {pending ? "Encurtando..." : "Encurtar"}
        </button>
      </div>
    </form>
  );
}

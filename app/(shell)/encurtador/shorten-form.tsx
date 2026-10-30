"use client";

import { useActionState } from "react";
import { createShortLink, type ShortenState } from "@/app/(shell)/encurtador/actions";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-background/80 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-white/25 focus:bg-background";

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
    <form action={action} className="overflow-hidden rounded-2xl border border-border bg-surface xl:self-start">
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-medium">Novo atalho</h2>
        <p className="text-[12px] text-muted">
          O link curto redireciona para o endereço da campanha
        </p>
      </div>
      <div className="grid gap-4 p-5">
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
        <p className="px-5 pb-2 text-[12px] text-negative">{state.error}</p>
      )}
      {created && (
        <p className="px-5 pb-2 font-mono text-[12px] text-foreground">{created}</p>
      )}
      <div className="flex justify-end border-t border-border px-5 py-3.5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-foreground px-4 py-2 text-[12px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Encurtando..." : "Encurtar"}
        </button>
      </div>
    </form>
  );
}

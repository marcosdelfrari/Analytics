"use client";

import { useActionState } from "react";
import { publishReport, type FormState } from "@/app/admin/actions";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted-foreground";

export function PublishForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    publishReport,
    null,
  );

  return (
    <form action={action} className="border border-border bg-surface">
      <input type="hidden" name="clientId" value={clientId} />
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Publicar período</h2>
        <p className="text-[12px] text-muted">
          Esses números passam a aparecer no dashboard desse cliente
        </p>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <label className="block text-[12px] text-muted-foreground">
          Plataforma
          <select name="platform" className={fieldClass} defaultValue="google">
            <option value="google">Google Ads</option>
            <option value="meta">Meta Ads</option>
          </select>
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Período
          <input
            name="period"
            required
            placeholder="Março 2026"
            className={fieldClass}
          />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Investimento (R$)
          <input name="spend" required inputMode="decimal" className={fieldClass} />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Variação do investimento (%)
          <input
            name="spendChange"
            inputMode="decimal"
            placeholder="Opcional, ex. 12,4"
            className={fieldClass}
          />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Impressões
          <input
            name="impressions"
            required
            inputMode="numeric"
            className={fieldClass}
          />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Cliques
          <input name="clicks" required inputMode="numeric" className={fieldClass} />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Conversões
          <input
            name="conversions"
            required
            inputMode="decimal"
            className={fieldClass}
          />
        </label>
        <label className="block text-[12px] text-muted-foreground">
          Campanhas ativas / total
          <span className="mt-1.5 grid grid-cols-2 gap-2">
            <input
              name="activeCampaigns"
              inputMode="numeric"
              placeholder="Ativas"
              className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-muted-foreground"
            />
            <input
              name="totalCampaigns"
              inputMode="numeric"
              placeholder="Total"
              className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-muted-foreground"
            />
          </span>
        </label>
        <label className="block text-[12px] text-muted-foreground sm:col-span-2">
          Arquivo do gerenciador
          <input
            name="file"
            type="file"
            accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp"
            className="mt-1.5 block w-full text-[12px] text-muted file:mr-3 file:border file:border-border file:bg-surface-elevated file:px-3 file:py-1.5 file:text-[12px] file:text-foreground"
          />
        </label>
        <label className="block text-[12px] text-muted-foreground sm:col-span-2">
          Nota para o cliente
          <textarea
            name="notes"
            rows={3}
            placeholder="O que mudou neste período"
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
          {pending ? "Publicando..." : "Publicar no dashboard"}
        </button>
      </div>
    </form>
  );
}

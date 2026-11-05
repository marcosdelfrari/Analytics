"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useMemo, useState } from "react";
import {
  upsertLeadFormAction,
  removeLeadFormAction,
  type LeadFormActionState,
} from "@/app/(shell)/organizacao/formularios/actions";
import { LeadFormPreview } from "@/app/(shell)/organizacao/formularios/lead-form-preview";
import { LeadFormWizard } from "@/app/(shell)/organizacao/formularios/lead-form-wizard";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import {
  LEAD_FORM_KIND_LABELS,
  defaultLeadFormDraft,
  type LeadFormDraft,
  type LeadFormRecord,
} from "@/lib/lead-form-types";

type CompanyOption = { id: string; name: string };

function EditGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
      />
    </svg>
  );
}

function FormPickerBar({
  forms,
  selectedId,
  draft,
  onSelect,
  onNew,
}: {
  forms: LeadFormRecord[];
  selectedId: string | "new";
  draft: LeadFormDraft;
  onSelect: (id: string | "new") => void;
  onNew: () => void;
}) {
  const showDraft = selectedId === "new";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-foreground">
            Formulários criados
          </span>
          <span className="rounded-full bg-surface-elevated px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
            {forms.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-foreground px-3 py-2 text-[12px] font-medium text-background transition hover:opacity-90"
        >
          <span aria-hidden>+</span>
          <span>Novo formulário</span>
        </button>
      </div>

      <div className="divide-y divide-border-subtle">
        {showDraft ? (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-400/[0.04] px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-foreground">
                {draft.name.trim() || "Novo formulário"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                Rascunho · ainda não salvo
              </p>
            </div>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10.5px] font-medium text-amber-300">
              Editando rascunho
            </span>
          </div>
        ) : null}

        {forms.length === 0 && !showDraft ? (
          <p className="px-4 py-5 text-[12.5px] text-muted">
            Nenhum formulário salvo ainda. Crie o primeiro com o botão acima.
          </p>
        ) : (
          forms.map((form) => {
            const active = selectedId === form.id;
            return (
              <div
                key={form.id}
                className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition ${
                  active ? "bg-surface-elevated/70" : "hover:bg-surface-elevated/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(form.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        form.active ? "bg-positive" : "bg-muted/50"
                      }`}
                      aria-hidden
                    />
                    <span className="truncate text-[12.5px] font-medium text-foreground">
                      {form.name}
                    </span>
                  </span>
                  <span className="mt-0.5 block pl-4 text-[11px] text-muted">
                    {LEAD_FORM_KIND_LABELS[form.kind]}
                    {form.companyName ? ` · ${form.companyName}` : " · organização"}
                    {form.active ? "" : " · pausado"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelect(form.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium transition ${
                    active
                      ? "border-white/20 bg-foreground text-background"
                      : "border-border bg-background/60 text-muted-foreground hover:border-white/20 hover:bg-surface-elevated hover:text-foreground"
                  }`}
                >
                  <EditGlyph />
                  {active ? "Editando" : "Editar"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function LeadFormBuilder({
  organizationId,
  companies,
  forms,
  initialFormId,
}: {
  organizationId: string;
  companies: CompanyOption[];
  forms: LeadFormRecord[];
  initialFormId: string | null;
}) {
  const router = useRouter();
  const formKey = useId();
  const initial =
    forms.find((item) => item.id === initialFormId) ??
    forms[0] ??
    defaultLeadFormDraft(organizationId, companies[0]?.id ?? null);

  const [selectedId, setSelectedId] = useState<string | "new">(
    initial.id ?? "new",
  );
  const [draft, setDraft] = useState<LeadFormDraft>(() =>
    initial.id
      ? { ...initial }
      : defaultLeadFormDraft(organizationId, companies[0]?.id ?? null),
  );
  const [state, action, pending] = useActionState<
    LeadFormActionState,
    FormData
  >(upsertLeadFormAction, null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      setSelectedId(state.formId);
      setDraft((current) => ({ ...current, id: state.formId }));
      router.replace(
        `/organizacao/formularios?org=${organizationId}&form=${state.formId}`,
      );
      router.refresh();
    }
  }, [state, router, organizationId]);

  const payload = useMemo(() => JSON.stringify(draft), [draft]);

  function loadForm(id: string | "new") {
    setSelectedId(id);
    if (id === "new") {
      setDraft(defaultLeadFormDraft(organizationId, companies[0]?.id ?? null));
      router.replace(`/organizacao/formularios?org=${organizationId}`);
      return;
    }
    const found = forms.find((item) => item.id === id);
    if (found) {
      setDraft({ ...found });
      router.replace(
        `/organizacao/formularios?org=${organizationId}&form=${id}`,
      );
    }
  }

  const isNew = selectedId === "new" && !draft.id;

  return (
    <div className="space-y-4">
      <FormPickerBar
        forms={forms}
        selectedId={selectedId}
        draft={draft}
        onSelect={loadForm}
        onNew={() => loadForm("new")}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <div className="space-y-4 min-w-0">
          <form
            key={`${formKey}-${selectedId}`}
            action={action}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_40px_-16px_rgba(0,0,0,0.4)]"
          >
            <input type="hidden" name="payload" value={payload} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-surface-elevated/40 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium tracking-tight">
                    {draft.id ? "Editar formulário" : "Novo formulário"}
                  </h2>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium ${
                      draft.active
                        ? "border-positive/30 bg-positive/10 text-positive"
                        : "border-border bg-background/60 text-muted"
                    }`}
                  >
                    {draft.active ? "Ativo" : "Pausado"}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted">
                  Preencha passo a passo. Personalização visual é opcional.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({ ...current, active: !current.active }))
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] font-medium transition ${
                  draft.active
                    ? "border-positive/30 bg-positive/10 text-positive hover:bg-positive/15"
                    : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    draft.active ? "bg-positive" : "bg-muted"
                  }`}
                />
                {draft.active ? "Formulário ativo" : "Ativar formulário"}
              </button>
            </div>

            {state && "error" in state && state.error ? (
              <div className="mx-6 mt-4 rounded-xl border border-negative/30 bg-negative/10 px-4 py-2.5 text-[12px] text-negative">
                {state.error}
              </div>
            ) : null}
            {state && "ok" in state && state.ok ? (
              <div className="mx-6 mt-4 rounded-xl border border-positive/30 bg-positive/10 px-4 py-2.5 text-[12px] text-positive">
                Formulário salvo. Você pode continuar editando ou instalar no
                site.
              </div>
            ) : null}

            <LeadFormWizard
              key={selectedId}
              draft={draft}
              setDraft={setDraft}
              companies={companies}
              pending={pending}
              isNew={isNew}
            />
          </form>

          {draft.id ? (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
              <div>
                <p className="text-[12.5px] font-medium text-foreground">
                  Instalar no site
                </p>
                <p className="mt-1 text-[11.5px] text-muted">
                  O script é gerado pela Fractal API (porta 4000). Abra Instalar
                  para listar e copiar o embed.
                </p>
              </div>
              <Link
                href={`/organizacao/formularios/instalar?org=${organizationId}&form=${draft.id}`}
                className="rounded-xl bg-foreground px-3.5 py-2 text-[12px] font-medium text-background transition hover:opacity-90"
              >
                Ir para Instalar
              </Link>
            </section>
          ) : null}

          {draft.id ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-negative/20 bg-negative/[0.04] px-5 py-3.5">
              <div>
                <p className="text-[12.5px] font-medium text-foreground">
                  Zona de exclusão
                </p>
                <p className="text-[11.5px] text-muted">
                  Remove permanentemente este modelo de formulário.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="cursor-pointer rounded-xl border border-negative/30 bg-negative/10 px-3.5 py-2 text-[12px] font-medium text-negative transition hover:bg-negative/20"
              >
                Excluir formulário
              </button>

              <form
                id={`delete-lead-form-${draft.id}`}
                action={removeLeadFormAction}
                className="hidden"
              >
                <input type="hidden" name="id" value={draft.id} />
                <input
                  type="hidden"
                  name="organizationId"
                  value={organizationId}
                />
              </form>

              <ConfirmDialog
                open={deleteConfirmOpen}
                tone="danger"
                title="Excluir este formulário?"
                description="Essa ação remove permanentemente o modelo e não pode ser desfeita."
                confirmLabel="Sim, excluir"
                cancelLabel="Cancelar"
                onCancel={() => setDeleteConfirmOpen(false)}
                onConfirm={() => {
                  setDeleteConfirmOpen(false);
                  const form = document.getElementById(
                    `delete-lead-form-${draft.id}`,
                  ) as HTMLFormElement | null;
                  form?.requestSubmit();
                }}
              />
            </div>
          ) : null}
        </div>

        <aside className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_40px_-16px_rgba(0,0,0,0.4)] lg:sticky lg:top-4 lg:self-start">
          <LeadFormPreview draft={draft} />
        </aside>
      </div>
    </div>
  );
}

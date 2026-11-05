"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  LEAD_FIELD_TYPE_LABELS,
  LEAD_FIELD_TYPES,
  LEAD_FORM_KIND_LABELS,
  LEAD_FORM_KINDS,
  type LeadFieldType,
  type LeadFormThemeMode,
  type LeadFormDraft,
  type LeadFormFieldDef,
  type LeadFormKind,
} from "@/lib/lead-form-types";
import {
  defaultAccentForKind,
  isAllowedBrandAssetUrl,
  leadFormUsesCustomTheme,
  normalizeHexColor,
} from "@/lib/lead-form-theme";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-background/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 outline-none transition-all focus:border-white/25 focus:bg-background focus:ring-2 focus:ring-white/10";

const labelClass = "block text-[12px] font-medium text-muted-foreground";

export const WIZARD_STEPS = [
  { id: "basico", label: "Básico", hint: "Nome e formato" },
  { id: "conteudo", label: "Conteúdo", hint: "Textos e CTA" },
  { id: "campos", label: "Campos", hint: "Dados capturados" },
  {
    id: "personalizar",
    label: "Personalizar",
    hint: "Opcional",
    optional: true,
  },
  { id: "finalizar", label: "Finalizar", hint: "Confirmação" },
] as const;

const ACCENT_PRESETS = [
  "#ededed",
  "#3b82f6",
  "#8b5cf6",
  "#25d366",
  "#f97316",
  "#ec4899",
] as const;

function KindIcon({ kind }: { kind: LeadFormKind }) {
  if (kind === "whatsapp_button") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      </svg>
    );
  }
  if (kind === "popup") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path strokeLinecap="round" d="M3 9h18M8 14h8" />
      </svg>
    );
  }
  if (kind === "section") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path strokeLinecap="round" d="M3 9h18M9 9v12" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </svg>
  );
}

function kindDescription(kind: LeadFormKind) {
  if (kind === "whatsapp_button") return "Botão flutuante com captura";
  if (kind === "popup") return "Modal centralizado";
  if (kind === "exit_intent") return "Dispara ao sair da página";
  return "Fixo no corpo da página";
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 select-none">
      <div>
        <span className="block text-[13px] font-medium text-foreground">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[11.5px] text-muted">{description}</span>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
          checked
            ? "border-positive/40 bg-positive/90"
            : "border-white/10 bg-background"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full transition-transform ${
            checked
              ? "translate-x-5 bg-background shadow-sm"
              : "translate-x-1 bg-muted-foreground"
          }`}
        />
      </button>
    </label>
  );
}

function newFieldId() {
  return `campo_${Math.random().toString(36).slice(2, 9)}`;
}

function createField(type: LeadFieldType = "text"): LeadFormFieldDef {
  return {
    id: newFieldId(),
    label: LEAD_FIELD_TYPE_LABELS[type],
    type,
    required: type === "email" || type === "text",
    placeholder: "",
    options: type === "select" ? ["Opção 1", "Opção 2"] : undefined,
  };
}

export function validateWizardStep(
  step: number,
  draft: LeadFormDraft,
): string | null {
  if (step === 0) {
    if (draft.name.trim().length < 2) {
      return "Informe um nome interno com pelo menos 2 caracteres.";
    }
    return null;
  }
  if (step === 1) {
    if (draft.kind === "whatsapp_button" && !draft.whatsappNumber.trim()) {
      return "Informe o número do WhatsApp para este formato.";
    }
    return null;
  }
  if (step === 2) {
    if (draft.fields.length === 0) {
      return "Adicione ao menos um campo ao formulário.";
    }
    for (const field of draft.fields) {
      if (!field.label.trim()) {
        return "Todo campo precisa de um rótulo.";
      }
      if (
        field.type === "select" &&
        (!field.options || field.options.length === 0)
      ) {
        return `O campo "${field.label || "seleção"}" precisa de opções.`;
      }
    }
    return null;
  }
  if (step === 3) {
    if (draft.brandLogoUrl.trim() && !isAllowedBrandAssetUrl(draft.brandLogoUrl)) {
      return "URL do logo inválida. Use http ou https.";
    }
    if (
      draft.brandHeaderImageUrl.trim() &&
      !isAllowedBrandAssetUrl(draft.brandHeaderImageUrl)
    ) {
      return "URL da imagem de capa inválida. Use http ou https.";
    }
    if (draft.brandAccentColor.trim() && !normalizeHexColor(draft.brandAccentColor)) {
      return "Cor inválida. Use um hex como #3b82f6.";
    }
    return null;
  }
  if (step === 4) {
    if (draft.sendConfirmationEmail) {
      if (!draft.confirmationEmailSubject.trim()) {
        return "Informe o assunto do e-mail de confirmação.";
      }
      if (!draft.confirmationEmailBody.trim()) {
        return "Informe o texto do e-mail de confirmação.";
      }
      if (!draft.fields.some((field) => field.type === "email")) {
        return "Inclua um campo do tipo E-mail para enviar confirmação.";
      }
    }
    return null;
  }
  return null;
}

function WizardStepper({
  current,
  onGoTo,
}: {
  current: number;
  onGoTo: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap gap-2 border-b border-border/80 bg-background/30 px-4 py-3 sm:px-6">
      {WIZARD_STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => {
                if (index <= current) onGoTo(index);
              }}
              disabled={index > current}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition ${
                active
                  ? "border-white/20 bg-surface-elevated shadow-sm"
                  : done
                    ? "border-border bg-background/60 hover:bg-surface-elevated"
                    : "cursor-not-allowed border-transparent bg-transparent opacity-50"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                  active
                    ? "bg-foreground text-background"
                    : done
                      ? "bg-positive/20 text-positive"
                      : "bg-surface-elevated text-muted"
                }`}
              >
                {done && !active ? "✓" : index + 1}
              </span>
              <span className="hidden sm:block">
                <span className="block text-[12px] font-medium leading-tight text-foreground">
                  {step.label}
                  {"optional" in step && step.optional ? (
                    <span className="ml-1 text-[10px] font-normal text-muted">
                      (opc.)
                    </span>
                  ) : null}
                </span>
                <span className="block text-[10.5px] text-muted">{step.hint}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

type CompanyOption = { id: string; name: string };

export function LeadFormWizard({
  draft,
  setDraft,
  companies,
  pending,
  isNew,
}: {
  draft: LeadFormDraft;
  setDraft: Dispatch<SetStateAction<LeadFormDraft>>;
  companies: CompanyOption[];
  pending: boolean;
  isNew: boolean;
}) {
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const lastStep = WIZARD_STEPS.length - 1;
  const isOptionalStep = step === 3;

  function updateField(id: string, patch: Partial<LeadFormFieldDef>) {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field) => {
        if (field.id !== id) return field;
        const next = { ...field, ...patch };
        if (patch.type && patch.type !== field.type) {
          next.options =
            patch.type === "select"
              ? field.options?.length
                ? field.options
                : ["Opção 1", "Opção 2"]
              : undefined;
        }
        return next;
      }),
    }));
  }

  function moveField(id: string, direction: -1 | 1) {
    setDraft((current) => {
      const index = current.fields.findIndex((field) => field.id === id);
      if (index < 0) return current;
      const target = index + direction;
      if (target < 0 || target >= current.fields.length) return current;
      const fields = [...current.fields];
      const [item] = fields.splice(index, 1);
      fields.splice(target, 0, item);
      return { ...current, fields };
    });
  }

  function goNext() {
    const error = validateWizardStep(step, draft);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setStep((current) => Math.min(current + 1, lastStep));
  }

  function goBack() {
    setStepError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function skipPersonalize() {
    setStepError(null);
    setStep(4);
  }

  function goToStep(index: number) {
    setStepError(null);
    setStep(index);
  }

  const accentPickerValue =
    normalizeHexColor(draft.brandAccentColor) ??
    defaultAccentForKind(draft.kind);

  return (
    <>
      <WizardStepper current={step} onGoTo={goToStep} />

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] text-muted">
            {isNew ? "Novo formulário" : "Editar formulário"} · Passo{" "}
            {step + 1} de {WIZARD_STEPS.length}
            {isOptionalStep ? " — personalização opcional" : ""}
          </p>
          {leadFormUsesCustomTheme(draft) ? (
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10.5px] text-muted-foreground">
              Visual personalizado
            </span>
          ) : null}
        </div>

        {step === 0 ? (
          <>
            <section className="rounded-2xl border border-border/80 bg-background/35 p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                Identificação
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Nome interno
                  <input
                    className={fieldClass}
                    placeholder="Ex.: Captura Landing Principal"
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className={labelClass}>
                  Empresa vinculada
                  <select
                    className={fieldClass}
                    value={draft.companyId ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        companyId: event.target.value || null,
                      }))
                    }
                  >
                    <option value="">Toda a organização</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                  Formato de exibição
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {LEAD_FORM_KINDS.map((kind) => {
                  const active = draft.kind === kind;
                  const isWa = kind === "whatsapp_button";
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          kind,
                          ctaLabel:
                            kind === "whatsapp_button" &&
                            current.ctaLabel === "Enviar"
                              ? "Falar no WhatsApp"
                              : current.ctaLabel,
                          brandAccentColor:
                            current.brandAccentColor.trim() === "" ||
                            current.brandAccentColor ===
                              defaultAccentForKind(current.kind)
                              ? ""
                              : current.brandAccentColor,
                        }))
                      }
                      className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? isWa
                            ? "border-[#25D366]/50 bg-gradient-to-br from-[#25D366]/15 via-surface-elevated to-surface ring-1 ring-[#25D366]/30"
                            : "border-white/25 bg-gradient-to-br from-white/[0.08] via-surface-elevated to-surface ring-1 ring-white/15"
                          : "border-border bg-background/40 hover:border-white/15 hover:bg-surface-elevated/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                            active
                              ? isWa
                                ? "border-[#25D366]/40 bg-[#25D366]/20 text-[#25D366]"
                                : "border-white/20 bg-white/10 text-foreground"
                              : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          <KindIcon kind={kind as LeadFormKind} />
                        </span>
                        {active ? (
                          <span className="h-2 w-2 rounded-full bg-foreground" />
                        ) : null}
                      </div>
                      <div className="mt-3">
                        <span className="block text-[13px] font-medium text-foreground">
                          {LEAD_FORM_KIND_LABELS[kind as LeadFormKind]}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-4 text-muted">
                          {kindDescription(kind as LeadFormKind)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <section className="rounded-2xl border border-border/80 bg-background/35 p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted">
                Textos e chamada (CTA)
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Título principal
                  <input
                    className={fieldClass}
                    placeholder="Ex.: Fale com um especialista"
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className={labelClass}>
                  Texto do botão (CTA)
                  <input
                    className={fieldClass}
                    placeholder="Ex.: Receber contato"
                    value={draft.ctaLabel}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        ctaLabel: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Subtítulo
                  <input
                    className={fieldClass}
                    placeholder="Ex.: Deixe seus dados e retornamos em breve."
                    value={draft.subtitle}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        subtitle: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </section>

            {draft.kind === "whatsapp_button" ? (
              <section className="rounded-2xl border border-[#25D366]/30 bg-gradient-to-br from-[#25D366]/[0.07] via-background/50 to-transparent p-4">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[#25D366]">
                  Destino do WhatsApp
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Número com DDI + DDD
                    <input
                      className={fieldClass}
                      placeholder="5511999999999"
                      value={draft.whatsappNumber}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          whatsappNumber: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className={labelClass}>
                    Mensagem pré-preenchida
                    <input
                      className={fieldClass}
                      value={draft.whatsappMessage}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          whatsappMessage: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </section>
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <section className="rounded-2xl border border-border/80 bg-background/35 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Campos do formulário</p>
                  <span className="rounded-full bg-surface-elevated px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {draft.fields.length}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-muted">
                  Defina o que o visitante precisa preencher.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    fields: [...current.fields, createField()],
                  }))
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-surface-elevated px-3.5 py-2 text-[12px] font-medium"
              >
                + Adicionar campo
              </button>
            </div>

            {draft.fields.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <p className="text-[12.5px] text-muted-foreground">
                  Nenhum campo ainda.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      fields: [...current.fields, createField()],
                    }))
                  }
                  className="mt-3 rounded-xl bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background"
                >
                  + Criar primeiro campo
                </button>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {draft.fields.map((field, index) => (
                  <li
                    key={field.id}
                    className="rounded-2xl border border-border bg-surface/90 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-background font-mono text-[10.5px] text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="text-[12.5px] font-medium">
                          {field.label || "Campo sem título"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateField(field.id, {
                              required: !field.required,
                            })
                          }
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                            field.required
                              ? "border-foreground/30 bg-foreground/10"
                              : "border-border text-muted"
                          }`}
                        >
                          {field.required ? "Obrigatório *" : "Opcional"}
                        </button>
                        <div className="flex items-center rounded-lg border border-border bg-background/60 p-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveField(field.id, -1)}
                            className="rounded-md px-2 py-1 text-[11px] disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={index === draft.fields.length - 1}
                            onClick={() => moveField(field.id, 1)}
                            className="rounded-md px-2 py-1 text-[11px] disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                fields: current.fields.filter(
                                  (item) => item.id !== field.id,
                                ),
                              }))
                            }
                            className="rounded-md px-2 py-1 text-[11px] text-negative"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className={labelClass}>
                        Rótulo
                        <input
                          className={fieldClass}
                          value={field.label}
                          onChange={(event) =>
                            updateField(field.id, { label: event.target.value })
                          }
                        />
                      </label>
                      <label className={labelClass}>
                        Tipo
                        <select
                          className={fieldClass}
                          value={field.type}
                          onChange={(event) =>
                            updateField(field.id, {
                              type: event.target.value as LeadFieldType,
                            })
                          }
                        >
                          {LEAD_FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {LEAD_FIELD_TYPE_LABELS[type]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={labelClass}>
                        Placeholder
                        <input
                          className={fieldClass}
                          value={field.placeholder ?? ""}
                          onChange={(event) =>
                            updateField(field.id, {
                              placeholder: event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    {field.type === "select" ? (
                      <label className={`${labelClass} mt-3`}>
                        Opções (uma por linha)
                        <textarea
                          rows={3}
                          className={fieldClass}
                          value={(field.options ?? []).join("\n")}
                          onChange={(event) =>
                            updateField(field.id, {
                              options: event.target.value
                                .split("\n")
                                .map((line) => line.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </label>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {step === 3 ? (
          <section className="rounded-2xl border border-dashed border-white/15 bg-background/35 p-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-foreground">
                Personalizar aparência
              </p>
              <p className="mt-1 text-[12px] leading-5 text-muted">
                Ajuste logo, cor de destaque e imagem de capa do modal. Este passo
                é opcional — use o visual padrão do tipo de formulário ou pule para
                finalizar.
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <span className={labelClass}>Tema do modal no site</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        value: "dark" as LeadFormThemeMode,
                        label: "Escuro (preto)",
                        preview: "bg-[#161615]",
                      },
                      {
                        value: "light" as LeadFormThemeMode,
                        label: "Claro (branco)",
                        preview: "bg-white",
                      },
                    ] as const
                  ).map((option) => {
                    const active = draft.brandTheme === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            brandTheme: option.value,
                          }))
                        }
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                          active
                            ? "border-white/25 bg-surface-elevated ring-1 ring-white/15"
                            : "border-border bg-background/40 hover:border-white/15"
                        }`}
                      >
                        <span
                          className={`h-8 w-8 shrink-0 rounded-lg border border-white/15 ${option.preview}`}
                          aria-hidden
                        />
                        <span className="text-[12px] font-medium text-foreground">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  Define fundo e contraste dos campos na prévia e no widget publicado.
                </p>
              </div>

              <label className={labelClass}>
                URL do logo
                <input
                  className={fieldClass}
                  placeholder="https://seusite.com/logo.png"
                  value={draft.brandLogoUrl}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      brandLogoUrl: event.target.value,
                    }))
                  }
                />
              </label>

              <label className={labelClass}>
                Imagem de capa (opcional)
                <input
                  className={fieldClass}
                  placeholder="https://seusite.com/banner.jpg"
                  value={draft.brandHeaderImageUrl}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      brandHeaderImageUrl: event.target.value,
                    }))
                  }
                />
              </label>

              <div>
                <span className={labelClass}>Cor de destaque (botão e detalhes)</span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      title={color}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          brandAccentColor: color,
                        }))
                      }
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        accentPickerValue === color
                          ? "border-white scale-105"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={accentPickerValue}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        brandAccentColor: event.target.value,
                      }))
                    }
                    className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    aria-label="Escolher cor"
                  />
                  <input
                    className={`${fieldClass} mt-0 max-w-[8.5rem] font-mono text-[12px]`}
                    placeholder="#3b82f6"
                    value={draft.brandAccentColor}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        brandAccentColor: event.target.value,
                      }))
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      brandLogoUrl: "",
                      brandAccentColor: "",
                      brandHeaderImageUrl: "",
                      brandTheme: "dark",
                    }))
                  }
                  className="mt-3 text-[11.5px] text-muted underline-offset-2 hover:text-foreground hover:underline"
                >
                  Restaurar visual padrão
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="rounded-2xl border border-border/80 bg-background/35 p-4">
            <ToggleSwitch
              checked={draft.sendConfirmationEmail}
              onChange={(checked) =>
                setDraft((current) => ({
                  ...current,
                  sendConfirmationEmail: checked,
                }))
              }
              label="E-mail automático de confirmação"
              description="Envia mensagem ao lead após o envio do formulário."
            />
            {draft.sendConfirmationEmail ? (
              <div className="mt-4 grid gap-4 border-t border-border/60 pt-4">
                <label className={labelClass}>
                  Assunto
                  <input
                    className={fieldClass}
                    value={draft.confirmationEmailSubject}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        confirmationEmailSubject: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className={labelClass}>
                  Mensagem
                  <textarea
                    rows={4}
                    className={fieldClass}
                    value={draft.confirmationEmailBody}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        confirmationEmailBody: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            ) : null}

            <div className="mt-6 rounded-xl border border-border bg-surface/80 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                Resumo
              </p>
              <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
                <li>
                  <span className="text-foreground">{draft.name.trim() || "—"}</span> ·{" "}
                  {LEAD_FORM_KIND_LABELS[draft.kind]}
                </li>
                <li>{draft.fields.length} campo(s)</li>
                <li>
                  Tema{" "}
                  {draft.brandTheme === "light" ? "claro (branco)" : "escuro (preto)"}
                  {leadFormUsesCustomTheme(draft) ? " · personalizado" : ""}
                </li>
              </ul>
            </div>
          </section>
        ) : null}

        {stepError ? (
          <div className="rounded-xl border border-negative/30 bg-negative/10 px-4 py-2.5 text-[12px] text-negative">
            {stepError}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-surface-elevated/30 px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="rounded-xl border border-border px-4 py-2 text-[12px] font-medium text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
            >
              Voltar
            </button>
          ) : (
            <span className="text-[11.5px] text-muted">
              A prévia à direita atualiza a cada passo.
            </span>
          )}
          {isOptionalStep ? (
            <button
              type="button"
              onClick={skipPersonalize}
              className="rounded-xl border border-border px-4 py-2 text-[12px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
            >
              Pular personalização
            </button>
          ) : null}
        </div>

        {step < lastStep ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-foreground px-5 py-2.5 text-[12.5px] font-medium text-background shadow-sm transition hover:opacity-90"
          >
            Continuar
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            onClick={(event) => {
              for (let index = 0; index <= lastStep; index += 1) {
                const error = validateWizardStep(index, draft);
                if (error) {
                  event.preventDefault();
                  setStepError(error);
                  setStep(index);
                  return;
                }
              }
              setStepError(null);
            }}
            className="rounded-xl bg-foreground px-5 py-2.5 text-[12.5px] font-medium text-background shadow-sm transition hover:opacity-90 disabled:opacity-60"
          >
            {pending
              ? "Salvando..."
              : isNew
                ? "Salvar formulário"
                : "Salvar alterações"}
          </button>
        )}
      </div>
    </>
  );
}

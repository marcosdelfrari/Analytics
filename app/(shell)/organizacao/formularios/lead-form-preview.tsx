"use client";

import {
  LEAD_FORM_KIND_LABELS,
  type LeadFormDraft,
} from "@/lib/lead-form-types";
import {
  contrastTextOnBackground,
  leadFormThemeStyles,
  leadFormUsesCustomTheme,
  resolveLeadFormAccent,
  type LeadFormSurfaceStyles,
} from "@/lib/lead-form-theme";

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

function FieldPreview({
  label,
  required,
  type,
  placeholder,
  options,
  surface,
}: {
  label: string;
  required: boolean;
  type: string;
  placeholder?: string;
  options?: string[];
  surface: LeadFormSurfaceStyles;
}) {
  const fieldStyle = {
    backgroundColor: surface.fieldBg,
    borderColor: surface.fieldBorder,
    color: surface.modalText,
  };

  if (type === "checkbox") {
    return (
      <label
        className="flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[12.5px]"
        style={{
          borderColor: surface.fieldBorder,
          backgroundColor: surface.fieldBg,
          color: surface.modalText,
        }}
      >
        <input type="checkbox" className="mt-0.5 rounded" disabled />
        <span>
          {label || "Checkbox"}
          {required ? <span className="text-negative"> *</span> : null}
        </span>
      </label>
    );
  }

  if (type === "textarea") {
    return (
      <label
        className="block text-[11.5px] font-medium"
        style={{ color: surface.modalMuted }}
      >
        {label || "Campo"}
        {required ? <span className="text-negative"> *</span> : null}
        <textarea
          disabled
          rows={3}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-[13px] outline-none"
          style={fieldStyle}
        />
      </label>
    );
  }

  if (type === "select") {
    return (
      <label
        className="block text-[11.5px] font-medium"
        style={{ color: surface.modalMuted }}
      >
        {label || "Seleção"}
        {required ? <span className="text-negative"> *</span> : null}
        <select
          disabled
          className="mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-[13px] outline-none"
          style={fieldStyle}
          defaultValue=""
        >
          <option value="" disabled>
            {placeholder || "Selecione"}
          </option>
          {(options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  const inputType =
    type === "email"
      ? "email"
      : type === "phone"
        ? "tel"
        : type === "number"
          ? "number"
          : "text";

  return (
    <label
      className="block text-[11.5px] font-medium"
      style={{ color: surface.modalMuted }}
    >
      {label || "Campo"}
      {required ? <span className="text-negative"> *</span> : null}
      <input
        type={inputType}
        disabled
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-[13px] outline-none"
        style={fieldStyle}
      />
    </label>
  );
}

export function LeadFormPreview({ draft }: { draft: LeadFormDraft }) {
  const kindLabel = LEAD_FORM_KIND_LABELS[draft.kind];
  const cta = draft.ctaLabel.trim() || "Enviar";
  const accent = resolveLeadFormAccent(draft);
  const ctaText = contrastTextOnBackground(accent);
  const customTheme = leadFormUsesCustomTheme(draft);
  const surface = leadFormThemeStyles(draft.brandTheme);
  const logoUrl = draft.brandLogoUrl.trim();
  const headerImageUrl = draft.brandHeaderImageUrl.trim();
  const useWaDefault =
    draft.kind === "whatsapp_button" && !draft.brandAccentColor.trim();
  const isLight = draft.brandTheme === "light";

  return (
    <div className="flex h-full min-h-[480px] flex-col">
      <div className="flex items-center justify-between border-b border-border/80 bg-surface-elevated/40 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
              Pré-visualização ao vivo
            </p>
            <p className="text-[12px] font-medium text-foreground">{kindLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] text-muted-foreground">
            {isLight ? "Claro" : "Escuro"}
          </span>
          {customTheme ? (
            <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] text-muted-foreground">
              Personalizado
            </span>
          ) : null}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium ${
              draft.active
                ? "border-positive/30 bg-positive/10 text-positive"
                : "border-border bg-background/60 text-muted"
            }`}
          >
            {draft.active ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      <div
        className="relative flex flex-1 flex-col justify-between p-5"
        style={{
          background: isLight
            ? "radial-gradient(circle at top, #e8e8e8, transparent 65%)"
            : "radial-gradient(circle at top, #222220, transparent 65%)",
        }}
      >
        <div
          className="mb-4 flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm"
          style={{
            borderColor: surface.shellBorder,
            backgroundColor: isLight ? "rgba(255,255,255,0.85)" : "rgba(12,12,12,0.7)",
            color: surface.modalMuted,
          }}
        >
          <span className="h-2 w-2 rounded-full opacity-30" style={{ background: surface.modalText }} />
          <span className="h-2 w-2 rounded-full opacity-30" style={{ background: surface.modalText }} />
          <span className="h-2 w-2 rounded-full opacity-30" style={{ background: surface.modalText }} />
          <span className="ml-1.5 truncate font-mono text-[10.5px]">
            {draft.kind === "exit_intent"
              ? "Ao mover o cursor para sair da página"
              : draft.kind === "whatsapp_button"
                ? "Widget flutuante no canto do site"
                : draft.kind === "section"
                  ? "Fixo em <section> no corpo da página"
                  : "Modal centralizado sobre a página"}
          </span>
        </div>

        <div
          className={`my-auto flex py-2 ${
            draft.kind === "section" ? "items-stretch" : "items-center justify-center"
          }`}
        >
          <div
            className={`w-full overflow-hidden rounded-2xl border backdrop-blur-md transition-all ${
              draft.kind === "section"
                ? "max-w-xl shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
                : "max-w-sm shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
            }`}
            style={{
              backgroundColor: surface.modalBg,
              color: surface.modalText,
              borderColor: customTheme
                ? `${accent}55`
                : useWaDefault
                  ? "rgba(37,211,102,0.35)"
                  : surface.shellBorder,
            }}
          >
            {headerImageUrl ? (
              <div
                className="relative h-28 w-full overflow-hidden border-b"
                style={{ borderColor: surface.fieldBorder }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={headerImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div
              className="border-b px-5 py-4"
              style={{
                borderColor: `${accent}33`,
                background: customTheme
                  ? `linear-gradient(135deg, ${accent}22 0%, transparent 70%)`
                  : useWaDefault
                    ? "linear-gradient(90deg, rgba(37,211,102,0.15), transparent)"
                    : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {logoUrl ? (
                    <div className="mb-2 flex h-9 items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="max-h-9 max-w-[140px] object-contain object-left"
                      />
                    </div>
                  ) : null}
                  <h3
                    className="text-[15px] font-semibold tracking-tight"
                    style={{ color: surface.modalText }}
                  >
                    {draft.title.trim() || "Título do formulário"}
                  </h3>
                  {draft.subtitle.trim() ? (
                    <p
                      className="mt-1 text-[12.5px] leading-5"
                      style={{ color: surface.modalMuted }}
                    >
                      {draft.subtitle}
                    </p>
                  ) : null}
                </div>
                {draft.kind !== "section" ? (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]"
                    style={{
                      borderColor: surface.fieldBorder,
                      color: surface.modalMuted,
                    }}
                  >
                    ×
                  </span>
                ) : null}
              </div>
            </div>

            <div className="space-y-3.5 px-5 py-4">
              {draft.fields.length === 0 ? (
                <p
                  className="rounded-xl border border-dashed py-6 text-center text-[12px]"
                  style={{
                    borderColor: surface.dashedBorder,
                    color: surface.modalMuted,
                  }}
                >
                  Adicione campos para visualizar o formulário.
                </p>
              ) : (
                draft.fields.map((field) => (
                  <FieldPreview
                    key={field.id}
                    label={field.label}
                    required={field.required}
                    type={field.type}
                    placeholder={field.placeholder}
                    options={field.options}
                    surface={surface}
                  />
                ))
              )}
            </div>

            <div
              className="border-t px-5 py-4"
              style={{
                borderColor: surface.fieldBorder,
                backgroundColor: surface.footerBg,
              }}
            >
              <button
                type="button"
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium shadow-sm transition"
                style={{
                  backgroundColor: accent,
                  color: ctaText,
                }}
              >
                {draft.kind === "whatsapp_button" ? <WhatsAppGlyph /> : null}
                <span>
                  {draft.kind === "whatsapp_button"
                    ? cta || "Falar no WhatsApp"
                    : cta}
                </span>
              </button>
              {draft.kind === "whatsapp_button" && draft.whatsappNumber ? (
                <p
                  className="mt-2 text-center font-mono text-[10.5px]"
                  style={{ color: surface.modalMuted }}
                >
                  wa.me/{draft.whatsappNumber.replace(/\D/g, "")}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {draft.kind === "whatsapp_button" ? (
          <div className="mt-4 flex items-center justify-end gap-2">
            <span
              className="rounded-full border px-3 py-1 text-[11px] shadow-sm"
              style={{
                borderColor: surface.shellBorder,
                backgroundColor: isLight ? "#fff" : "rgba(12,12,12,0.8)",
                color: surface.modalMuted,
              }}
            >
              Gatilho flutuante
            </span>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              style={{ backgroundColor: accent, color: ctaText }}
            >
              <WhatsAppGlyph />
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>

      {draft.sendConfirmationEmail ? (
        <div className="border-t border-border/80 bg-background/50 p-4">
          <div className="rounded-xl border border-border bg-surface p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted">
                Prévia do e-mail de confirmação
              </p>
              <span className="rounded-md bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">
                Automático
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] font-medium text-foreground">
              {draft.confirmationEmailSubject || "(sem assunto)"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[12px] leading-5 text-muted-foreground">
              {draft.confirmationEmailBody || "(sem texto)"}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

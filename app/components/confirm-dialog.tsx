"use client";

import { useEffect, useId } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "neutral",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, pending, onCancel]);

  if (!open) return null;

  const isDanger = tone === "danger";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-[#121212] shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
            Confirmação
          </p>
          <h2
            id={titleId}
            className="mt-1 text-[15px] font-semibold tracking-tight text-foreground"
          >
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-2 text-[12.5px] leading-5 text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-4">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-border px-3.5 py-2 text-[12.5px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`cursor-pointer rounded-xl px-3.5 py-2 text-[12.5px] font-medium transition disabled:opacity-60 ${
              isDanger
                ? "border border-negative/40 bg-negative/15 text-negative hover:bg-negative/25"
                : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            {pending ? "Processando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

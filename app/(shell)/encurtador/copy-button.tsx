"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      }}
      className="rounded-xl border border-border px-3 py-1.5 text-[12px] font-medium text-foreground transition hover:bg-surface-elevated"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

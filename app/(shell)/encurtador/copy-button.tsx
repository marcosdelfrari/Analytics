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
      className="border border-border px-2.5 py-1.5 text-[12px] text-foreground hover:bg-surface-elevated"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}

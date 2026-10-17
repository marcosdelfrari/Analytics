"use client";

import { useState, type ReactNode } from "react";
import { PlatformLogoLabel } from "@/app/components/platform-logo";

type PlatformTab = "google" | "meta";

export function PlatformTabs({
  google,
  meta,
}: {
  google: ReactNode;
  meta: ReactNode;
}) {
  const [tab, setTab] = useState<PlatformTab>("google");

  return (
    <div>
      <div
        className="inline-flex max-w-full flex-wrap rounded-md border border-border p-0.5"
        role="tablist"
        aria-label="Plataforma"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "google"}
          onClick={() => setTab("google")}
          className={`rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${
            tab === "google"
              ? "bg-surface-elevated text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PlatformLogoLabel platform="google" size={16} />
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "meta"}
          onClick={() => setTab("meta")}
          className={`rounded-sm px-3 py-1.5 text-[12px] font-medium transition-colors ${
            tab === "meta"
              ? "bg-surface-elevated text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PlatformLogoLabel platform="meta" size={16} />
        </button>
      </div>
      <div className="mt-4" role="tabpanel">
        {tab === "google" ? google : meta}
      </div>
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import { PlatformLogoLabel } from "@/app/components/platform-logo";
import { platformTabButtonClass } from "@/lib/platform-ui";

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
          className={platformTabButtonClass("google", tab === "google")}
        >
          <PlatformLogoLabel platform="google" size={18} />
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "meta"}
          onClick={() => setTab("meta")}
          className={platformTabButtonClass("meta", tab === "meta")}
        >
          <PlatformLogoLabel platform="meta" size={18} />
        </button>
      </div>
      <div className="mt-4" role="tabpanel">
        {tab === "google" ? google : meta}
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { BrandMark } from "@/app/components/brand-mark";
import { MobileAppNav } from "@/app/components/mobile-app-nav";
import { NavPanel } from "@/app/components/nav-panel";
import { PlanUpgradeGate } from "@/app/components/plan-upgrade-gate";
import { Skeleton } from "@/app/components/skeleton";
import { navItemsForMode } from "@/lib/nav-items";

type AppShellLayoutProps = {
  mode: "client" | "admin";
  title: string;
  subtitle: string;
  planActive?: boolean;
  headerSkeleton?: boolean;
  children: ReactNode;
};

function AppHeader({
  title,
  subtitle,
  headerSkeleton = false,
}: {
  title: string;
  subtitle: string;
  headerSkeleton?: boolean;
}) {
  return (
    <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <div className="shrink-0 md:hidden">
        <BrandMark compact />
      </div>
      <div className="min-w-0 flex-1">
        {headerSkeleton ? (
          <div className="space-y-2 py-1" aria-hidden>
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44 max-w-full" />
          </div>
        ) : (
          <>
            <h1 className="truncate text-sm font-medium tracking-tight">
              {title}
            </h1>
            <p className="truncate text-[12px] text-muted">{subtitle}</p>
          </>
        )}
      </div>
    </header>
  );
}

export function AppShellLayout({
  mode,
  title,
  subtitle,
  planActive = true,
  headerSkeleton = false,
  children,
}: AppShellLayoutProps) {
  const items = navItemsForMode(mode);

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center justify-center border-b border-border px-4">
          <BrandMark />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <NavPanel items={items} showLogout />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader
          title={title}
          subtitle={subtitle}
          headerSkeleton={headerSkeleton}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6">
          {planActive ? children : <PlanUpgradeGate>{children}</PlanUpgradeGate>}
        </main>
      </div>

      <MobileAppNav mode={mode} />
    </div>
  );
}

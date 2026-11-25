"use client";

import type { ReactNode } from "react";
import { AppShellChrome } from "@/app/components/app-shell-chrome";
import { PlanUpgradeGate } from "@/app/components/plan-upgrade-gate";
import { Skeleton } from "@/app/components/skeleton";
import type { ShellMode } from "@/lib/shell-mode";

export type AppShellMainProps = {
  title: string;
  subtitle: string;
  planActive?: boolean;
  headerSkeleton?: boolean;
  headerActions?: ReactNode;
  children: ReactNode;
};

function AppHeader({
  title,
  subtitle,
  headerSkeleton = false,
  headerActions,
}: {
  title: string;
  subtitle: string;
  headerSkeleton?: boolean;
  headerActions?: ReactNode;
}) {
  return (
    <header className="shrink-0 border-b border-border-subtle bg-background px-4 py-3 md:flex md:min-h-14 md:items-center md:gap-3 md:px-6 md:py-0">
      <div className="min-w-0 flex-1">
        {headerSkeleton ? (
          <div className="space-y-2 py-1" aria-hidden>
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-44 max-w-full" />
          </div>
        ) : (
          <>
            <h1 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground md:truncate md:text-[14px]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted line-clamp-2 md:truncate md:leading-normal">
                {subtitle}
              </p>
            ) : null}
          </>
        )}
      </div>
      {headerActions ? (
        <div className="mt-2 flex shrink-0 items-center justify-end gap-2 md:mt-0">
          {headerActions}
        </div>
      ) : null}
    </header>
  );
}

/** Área principal (header + conteúdo). Use dentro de `(shell)/layout`. */
export function AppShellMain({
  title,
  subtitle,
  planActive = true,
  headerSkeleton = false,
  headerActions,
  children,
}: AppShellMainProps) {
  return (
    <>
      <AppHeader
        title={title}
        subtitle={subtitle}
        headerSkeleton={headerSkeleton}
        headerActions={headerActions}
      />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:p-6 md:pb-8">
        {planActive ? (
          children
        ) : (
          <PlanUpgradeGate>{children}</PlanUpgradeGate>
        )}
      </main>
    </>
  );
}

type AppShellLayoutProps = AppShellMainProps & {
  mode: ShellMode;
};

/** Shell completo (sidebar + main). Evite em rotas com layout `(shell)`. */
export function AppShellLayout({ mode, ...mainProps }: AppShellLayoutProps) {
  return (
    <AppShellChrome sessionMode={mode}>
      <AppShellMain {...mainProps} />
    </AppShellChrome>
  );
}

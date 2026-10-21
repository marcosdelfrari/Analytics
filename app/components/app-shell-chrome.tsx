"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/app/components/brand-mark";
import { MobileAppNav } from "@/app/components/mobile-app-nav";
import { NavPanel } from "@/app/components/nav-panel";
import { authEnabled } from "@/lib/auth-config";
import { navItemsForMode, type NavContext } from "@/lib/nav-items";
import { shellModeFromPathname, type ShellMode } from "@/lib/shell-mode";

type AppShellChromeProps = {
  /** Com login: modo da sessão. Sem login: omitir e usar a rota. */
  sessionMode?: ShellMode;
  navContext?: NavContext;
  companySwitcher?: ReactNode;
  children: ReactNode;
};

export function AppShellChrome({
  sessionMode,
  navContext,
  companySwitcher,
  children,
}: AppShellChromeProps) {
  const pathname = usePathname();
  const mode =
    authEnabled && sessionMode ? sessionMode : shellModeFromPathname(pathname);
  const items = navItemsForMode(mode, navContext);

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden md:flex-row">
      <aside className="hidden h-full max-h-dvh w-56 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 shrink-0 items-center justify-center border-b border-border px-4">
          <BrandMark />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {companySwitcher}
          <NavPanel items={items} showLogout />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>

      <MobileAppNav mode={mode} navContext={navContext} />
    </div>
  );
}

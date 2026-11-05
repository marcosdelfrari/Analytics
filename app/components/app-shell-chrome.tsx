"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/app/components/brand-mark";
import { MobileAppNav } from "@/app/components/mobile-app-nav";
import { NavPanel, type SidebarUserInfo } from "@/app/components/nav-panel";
import { authEnabled } from "@/lib/auth-config";
import { navSectionsForMode, type NavContext } from "@/lib/nav-items";
import { shellModeFromPathname, type ShellMode } from "@/lib/shell-mode";

type SidebarContextValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  sidebarCollapsed: false,
  toggleSidebar: () => {},
  setSidebarCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

/** Chevron para recolher ou expandir a barra lateral. */
export function SidebarToggleIcon({
  expand = false,
}: {
  expand?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0"
    >
      {expand ? (
        <path
          d="M6 4L10 8L6 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M10 4L6 8L10 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

type AppShellChromeProps = {
  /** Com login: modo da sessão. Sem login: omitir e usar a rota. */
  sessionMode?: ShellMode;
  navContext?: NavContext;
  companySwitcher?: ReactNode;
  user?: SidebarUserInfo;
  children: ReactNode;
};

export function AppShellChrome({
  sessionMode,
  navContext,
  companySwitcher,
  user,
  children,
}: AppShellChromeProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mode =
    authEnabled && sessionMode ? sessionMode : shellModeFromPathname(pathname);
  const sections = navSectionsForMode(mode, navContext);
  const homeHref = "/dashboard";
  const showLotusPartner =
    !authEnabled || Boolean(navContext?.lotusPartner || navContext?.platformAdmin);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{ sidebarCollapsed, toggleSidebar, setSidebarCollapsed }}
    >
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden md:flex-row">
        <aside
          className={`hidden h-full max-h-dvh shrink-0 flex-col border-r border-border-subtle bg-background transition-[width] duration-200 ease-out md:flex ${
            sidebarCollapsed ? "w-[52px]" : "w-64"
          }`}
        >
          <div
            className={`flex shrink-0 border-b border-border-subtle ${
              sidebarCollapsed
                ? "flex-col items-center gap-2 px-1.5 py-3"
                : "h-14 flex-row items-center justify-between px-4"
            }`}
          >
            <BrandMark
              compact={sidebarCollapsed}
              fractalOnly={sidebarCollapsed || !showLotusPartner}
              href={homeHref}
            />
            <button
              type="button"
              onClick={toggleSidebar}
              title={
                sidebarCollapsed
                  ? "Expandir barra lateral"
                  : "Recolher barra lateral"
              }
              aria-label={
                sidebarCollapsed
                  ? "Expandir barra lateral"
                  : "Recolher barra lateral"
              }
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              <SidebarToggleIcon expand={sidebarCollapsed} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {!sidebarCollapsed && companySwitcher}
            <NavPanel
              sections={sections}
              user={user}
              showLogout
              collapsed={sidebarCollapsed}
            />
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>

        <MobileAppNav
          mode={mode}
          navContext={navContext}
          user={user}
          showLotusPartner={showLotusPartner}
        />
      </div>
    </SidebarContext.Provider>
  );
}

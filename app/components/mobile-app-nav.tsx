"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/app/components/brand-mark";
import {
  NavIcon,
  NavPanel,
  type SidebarUserInfo,
} from "@/app/components/nav-panel";
import {
  isNavItemActive,
  mobileMenuSections,
  mobilePrimaryNav,
  type NavContext,
} from "@/lib/nav-items";
import type { ShellMode } from "@/lib/shell-mode";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileAppNav({
  mode,
  navContext,
  user,
}: {
  mode: ShellMode;
  navContext?: NavContext;
  user?: SidebarUserInfo;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const primary = mobilePrimaryNav(mode, navContext);
  const menuSections = mobileMenuSections(mode, navContext);
  const menuItemCount = menuSections[0]?.items.length ?? 0;
  const showMenu = menuItemCount > 0;
  const tabCount = primary.length + (showMenu ? 1 : 0);
  const gridClass =
    tabCount === 2
      ? "grid-cols-2"
      : tabCount === 3
        ? "grid-cols-3"
        : tabCount === 4
          ? "grid-cols-4"
          : "grid-cols-[repeat(5,minmax(0,1fr))]";

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-md md:hidden"
        aria-label="Navegação principal"
      >
        <ul className={`grid min-h-[3.25rem] gap-0 ${gridClass}`}>
          {primary.map((item) => {
            const active = isNavItemActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-1 px-1 py-2 text-[10.5px] leading-tight transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <NavIcon name={item.icon} className="h-4 w-4 shrink-0" />
                  <span className="max-w-full truncate font-medium">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
          {showMenu && (
            <li>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-1 px-1 py-2 text-[10.5px] font-medium leading-tight text-muted-foreground"
                aria-expanded={menuOpen}
                aria-haspopup="dialog"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                  className="h-4 w-4 shrink-0"
                >
                  <path
                    d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Menu</span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu do aplicativo"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-background/70 backdrop-blur-sm"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[min(85dvh,640px)] flex-col overflow-hidden rounded-t-2xl border border-border bg-background pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <BrandMark fractalOnly />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer rounded-lg border border-border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Fechar
              </button>
            </div>
            <NavPanel
              sections={menuSections}
              user={user}
              onNavigate={() => setMenuOpen(false)}
              showLogout
              sheet
            />
          </div>
        </div>
      )}
    </>
  );
}

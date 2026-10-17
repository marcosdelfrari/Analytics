"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/app/components/brand-mark";
import { NavPanel } from "@/app/components/nav-panel";
import { authEnabled } from "@/lib/auth-config";
import {
  mobilePrimaryNav,
  mobileSecondaryNav,
} from "@/lib/nav-items";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileAppNav({ mode }: { mode: "client" | "admin" }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const primary = mobilePrimaryNav(mode);
  const secondary = mobileSecondaryNav(mode);
  const menuItems = secondary;
  const showMenu =
    secondary.length > 0 || (mode === "admin" && authEnabled);
  const gridClass =
    mode === "client"
      ? "grid-cols-4"
      : showMenu
        ? "grid-cols-[repeat(5,minmax(0,1fr))]"
        : "grid-cols-4";

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
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center px-1 py-2 text-[10px] leading-tight ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="truncate font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
          {showMenu && (
            <li>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex w-full flex-col items-center justify-center px-1 py-2 text-[10px] font-medium leading-tight text-muted-foreground"
                aria-expanded={menuOpen}
                aria-haspopup="dialog"
              >
                Menu
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
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[min(85dvh,640px)] overflow-y-auto rounded-t-xl border border-border bg-background pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <BrandMark />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-sm border border-border px-2.5 py-1 text-[12px] text-muted-foreground"
              >
                Fechar
              </button>
            </div>
            <NavPanel
              items={menuItems}
              onNavigate={() => setMenuOpen(false)}
              showLogout
            />
          </div>
        </div>
      )}
    </>
  );
}

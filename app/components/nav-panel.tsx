"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/nav-items";
import { logout } from "@/app/login/actions";
import { authEnabled } from "@/lib/auth-config";

export function NavPanel({
  items,
  onNavigate,
  showLogout = true,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  showLogout?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-0.5 p-2">
      {items.map((item) => {
        const active = pathname === item.href && !item.locked;
        const locked = Boolean(item.locked);
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            onClick={onNavigate}
            aria-disabled={locked}
            className={`flex items-center justify-between rounded-sm px-3 py-2.5 text-[13px] transition-colors ${
              active
                ? "bg-surface-elevated text-foreground"
                : locked
                  ? "text-muted/80"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <span>{item.label}</span>
            {locked && (
              <span className="text-[10px] uppercase tracking-wide text-muted">
                Plano
              </span>
            )}
          </Link>
        );
      })}
      {authEnabled && showLogout && (
        <form
          action={logout}
          className="mt-auto shrink-0 border-t border-border pt-2"
        >
          <button
            type="submit"
            className="w-full rounded-sm px-3 py-2.5 text-left text-[13px] text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            Sair
          </button>
        </form>
      )}
    </nav>
  );
}

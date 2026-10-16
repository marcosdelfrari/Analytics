"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/app/components/brand-mark";
import { logout } from "@/app/login/actions";
import { authEnabled } from "@/lib/auth-config";

export function Sidebar({
  mode,
  planActive = true,
}: {
  mode: "client" | "admin";
  planActive?: boolean;
}) {
  const pathname = usePathname();
  const items = authEnabled
    ? mode === "admin"
      ? [
          { href: "/admin", label: "Painel", locked: false },
          { href: "/parametros", label: "Parâmetros", locked: false },
          { href: "/encurtador", label: "Encurtador", locked: false },
        ]
      : [
          { href: "/dashboard", label: "Dashboard", locked: false },
          { href: "/dashboard", label: "Relatórios", locked: !planActive },
          { href: "/dashboard", label: "Campanhas", locked: !planActive },
        ]
    : [
        { href: "/dashboard", label: "Dashboard", locked: false },
        { href: "/admin", label: "Painel", locked: false },
        { href: "/parametros", label: "Parâmetros", locked: false },
        { href: "/encurtador", label: "Encurtador", locked: false },
      ];

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex h-14 items-center justify-center border-b border-border px-4">
        <BrandMark />
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {items.map((item) => {
          const active = pathname === item.href && !item.locked;
          const locked = Boolean(item.locked);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-disabled={locked}
              className={`flex items-center justify-between rounded-sm px-3 py-2 text-[13px] transition-colors ${
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
      </nav>
      {authEnabled && (
        <form action={logout} className="border-t border-border p-2">
          <button
            type="submit"
            className="w-full rounded-sm px-3 py-2 text-left text-[13px] text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            Sair
          </button>
        </form>
      )}
    </aside>
  );
}

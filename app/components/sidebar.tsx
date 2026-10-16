"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { authEnabled } from "@/lib/auth-config";

export function Sidebar({
  mode,
  eyebrow,
}: {
  mode: "client" | "admin";
  eyebrow?: string;
}) {
  const pathname = usePathname();
  const items = authEnabled
    ? mode === "admin"
      ? [
          { href: "/admin", label: "Painel" },
          { href: "/parametros", label: "Parâmetros" },
          { href: "/encurtador", label: "Encurtador" },
        ]
      : [{ href: "/", label: "Dashboard" }]
    : [
        { href: "/", label: "Dashboard" },
        { href: "/admin", label: "Painel" },
        { href: "/parametros", label: "Parâmetros" },
        { href: "/encurtador", label: "Encurtador" },
      ];

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center border border-border bg-surface-elevated">
          <span className="font-mono text-xs text-foreground">A</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium tracking-tight">Analytics</p>
          <p className="truncate text-[11px] text-muted">
            {eyebrow ?? (mode === "admin" ? "Painel admin" : "Portal do cliente")}
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-sm px-3 py-2 text-[13px] transition-colors ${
                active
                  ? "bg-surface-elevated text-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              {item.label}
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/app/components/brand-mark";
import { logout } from "@/app/login/actions";
import { authEnabled } from "@/lib/auth-config";

export function Sidebar({ mode }: { mode: "client" | "admin" }) {
  const pathname = usePathname();
  const items = authEnabled
    ? mode === "admin"
      ? [
          { href: "/admin", label: "Painel" },
          { href: "/parametros", label: "Parâmetros" },
          { href: "/encurtador", label: "Encurtador" },
        ]
      : [{ href: "/dashboard", label: "Dashboard" }]
    : [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/admin", label: "Painel" },
        { href: "/parametros", label: "Parâmetros" },
        { href: "/encurtador", label: "Encurtador" },
      ];

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex h-14 items-center justify-center border-b border-border px-4">
        <BrandMark />
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

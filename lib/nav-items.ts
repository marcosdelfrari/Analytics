import { authEnabled } from "@/lib/auth-config";
import type { ShellMode } from "@/lib/shell-mode";

export type NavItem = {
  href: string;
  label: string;
  locked?: boolean;
};

export type NavContext = {
  organizationOwner?: boolean;
};

export function navItemsForMode(
  mode: ShellMode,
  context: NavContext = {},
): NavItem[] {
  if (!authEnabled) {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/admin", label: "Plataforma" },
      { href: "/documentacao", label: "Guia" },
      { href: "/rastreamento", label: "Script" },
      { href: "/parametros", label: "Parâmetros" },
      { href: "/encurtador", label: "Encurtador" },
    ];
  }

  if (mode === "agency") {
    const items: NavItem[] = [{ href: "/admin", label: "Plataforma" }];
    if (context.organizationOwner) {
      items.push({ href: "/organizacao", label: "Organização" });
    }
    items.push(
      { href: "/documentacao", label: "Guia" },
      { href: "/rastreamento", label: "Script" },
      { href: "/parametros", label: "Parâmetros" },
      { href: "/encurtador", label: "Encurtador" },
    );
    return items;
  }

  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/relatorios", label: "Relatórios" },
    { href: "/campanhas", label: "Campanhas" },
  ];

  if (context.organizationOwner) {
    items.push({ href: "/organizacao", label: "Organização" });
  }

  items.push(
    { href: "/documentacao", label: "Guia" },
    { href: "/rastreamento", label: "Script" },
    { href: "/parametros", label: "Parâmetros" },
    { href: "/encurtador", label: "Encurtador" },
  );

  return items;
}

/** Atalhos fixos na barra inferior (mobile). */
export function mobilePrimaryNav(
  mode: ShellMode,
  context: NavContext = {},
): NavItem[] {
  const items = navItemsForMode(mode, context);
  if (mode === "agency") return items;
  return items.filter((item) =>
    ["/dashboard", "/relatorios", "/campanhas", "/organizacao"].includes(
      item.href,
    ),
  );
}

export function mobileSecondaryNav(
  mode: ShellMode,
  context: NavContext = {},
): NavItem[] {
  const items = navItemsForMode(mode, context);
  if (mode === "agency") return [];
  return items.filter(
    (item) =>
      !["/dashboard", "/relatorios", "/campanhas", "/organizacao"].includes(
        item.href,
      ),
  );
}

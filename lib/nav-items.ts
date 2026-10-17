import { authEnabled } from "@/lib/auth-config";
import type { ShellMode } from "@/lib/shell-mode";

export type NavItem = {
  href: string;
  label: string;
  locked?: boolean;
};

export function navItemsForMode(mode: ShellMode): NavItem[] {
  if (!authEnabled) {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/admin", label: "Painel" },
      { href: "/documentacao", label: "Guia" },
      { href: "/rastreamento", label: "Script" },
      { href: "/parametros", label: "Parâmetros" },
      { href: "/encurtador", label: "Encurtador" },
    ];
  }

  if (mode === "agency") {
    return [
      { href: "/admin", label: "Painel" },
      { href: "/documentacao", label: "Guia" },
      { href: "/rastreamento", label: "Script" },
      { href: "/parametros", label: "Parâmetros" },
      { href: "/encurtador", label: "Encurtador" },
    ];
  }

  return [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/relatorios", label: "Relatórios" },
    { href: "/campanhas", label: "Campanhas" },
    { href: "/documentacao", label: "Guia" },
    { href: "/rastreamento", label: "Script" },
    { href: "/parametros", label: "Parâmetros" },
    { href: "/encurtador", label: "Encurtador" },
  ];
}

/** Atalhos fixos na barra inferior (mobile). */
export function mobilePrimaryNav(mode: ShellMode): NavItem[] {
  const items = navItemsForMode(mode);
  if (mode === "agency") return items;
  return items.filter((item) =>
    ["/dashboard", "/relatorios", "/campanhas"].includes(item.href),
  );
}

export function mobileSecondaryNav(mode: ShellMode): NavItem[] {
  const items = navItemsForMode(mode);
  if (mode === "agency") return [];
  return items.filter(
    (item) => !["/dashboard", "/relatorios", "/campanhas"].includes(item.href),
  );
}

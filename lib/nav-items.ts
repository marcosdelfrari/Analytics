import { authEnabled } from "@/lib/auth-config";

export type NavItem = {
  href: string;
  label: string;
  locked?: boolean;
};

export function navItemsForMode(mode: "client" | "admin"): NavItem[] {
  if (!authEnabled) {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/admin", label: "Painel" },
      { href: "/parametros", label: "Parâmetros" },
      { href: "/rastreamento", label: "Script" },
      { href: "/encurtador", label: "Encurtador" },
    ];
  }

  if (mode === "admin") {
    return [
      { href: "/admin", label: "Painel" },
      { href: "/parametros", label: "Parâmetros" },
      { href: "/rastreamento", label: "Script" },
      { href: "/encurtador", label: "Encurtador" },
    ];
  }

  return [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/relatorios", label: "Relatórios" },
    { href: "/campanhas", label: "Campanhas" },
    { href: "/parametros", label: "Parâmetros" },
    { href: "/rastreamento", label: "Script" },
    { href: "/encurtador", label: "Encurtador" },
  ];
}

/** Atalhos fixos na barra inferior (mobile). */
export function mobilePrimaryNav(mode: "client" | "admin"): NavItem[] {
  const items = navItemsForMode(mode);
  if (mode === "admin") return items;
  return items.filter((item) =>
    ["/dashboard", "/relatorios", "/campanhas"].includes(item.href),
  );
}

export function mobileSecondaryNav(mode: "client" | "admin"): NavItem[] {
  const items = navItemsForMode(mode);
  if (mode === "admin") return [];
  return items.filter(
    (item) => !["/dashboard", "/relatorios", "/campanhas"].includes(item.href),
  );
}

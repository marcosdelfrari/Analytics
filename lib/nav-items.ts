import { authEnabled } from "@/lib/auth-config";
import type { ShellMode } from "@/lib/shell-mode";

export type NavIconName =
  | "dashboard"
  | "reports"
  | "campaigns"
  | "platform"
  | "users"
  | "plans"
  | "organization"
  | "form-create"
  | "form-install"
  | "leads"
  | "script"
  | "params"
  | "shortener"
  | "guide";

export type NavItem = {
  href: string;
  label: string;
  icon?: NavIconName;
  locked?: boolean;
  exact?: boolean;
  children?: NavItem[];
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

export type NavContext = {
  /** Administrador da plataforma (papel `admin`). */
  platformAdmin?: boolean;
  /** Proprietário de alguma organização (cliente). */
  organizationOwner?: boolean;
};

const organizationSection = (): NavSection => ({
  id: "organization",
  label: "Organização",
  items: [
    {
      href: "/organizacao",
      label: "Empresas e acessos",
      icon: "organization",
      exact: true,
    },
    {
      href: "/organizacao/formularios",
      label: "Criar formulário",
      icon: "form-create",
      exact: true,
    },
    {
      href: "/organizacao/formularios/instalar",
      label: "Instalar formulário",
      icon: "form-install",
      exact: true,
    },
    {
      href: "/organizacao/leads",
      label: "Leads capturados",
      icon: "leads",
      exact: true,
    },
  ],
});

const trackingSection = (): NavSection => ({
  id: "tracking",
  label: "Rastreamento",
  items: [
    { href: "/rastreamento", label: "Script e Pixel", icon: "script" },
    { href: "/parametros", label: "Parâmetros UTM", icon: "params" },
    { href: "/encurtador", label: "Encurtador", icon: "shortener" },
  ],
});

const utmGuideItem = (): NavItem => ({
  href: "/parametros",
  label: "Parâmetros UTM",
  icon: "params",
});

const supportSection = (): NavSection => ({
  id: "support",
  label: "Suporte",
  items: [{ href: "/documentacao", label: "Guia de uso", icon: "guide" }],
});

const analystReferenceSection = (): NavSection => ({
  id: "reference",
  label: "Referência",
  items: [utmGuideItem()],
});

const analyticsSection = (): NavSection => ({
  id: "analytics",
  label: "Análise",
  items: [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/relatorios", label: "Relatórios", icon: "reports" },
    { href: "/campanhas", label: "Campanhas", icon: "campaigns" },
  ],
});

const platformAdminSection = (): NavSection => ({
  id: "platform",
  label: "Plataforma",
  items: [
    {
      href: "/admin",
      label: "Organizações",
      icon: "platform",
      exact: true,
    },
    { href: "/admin/usuarios", label: "Usuários", icon: "users" },
    {
      href: "/admin/relatorios",
      label: "Relatórios publicados",
      icon: "reports",
    },
    { href: "/admin/planos", label: "Planos", icon: "plans" },
  ],
});

export function navSectionsForMode(
  mode: ShellMode,
  context: NavContext = {},
): NavSection[] {
  if (!authEnabled) {
    return [
      analyticsSection(),
      organizationSection(),
      trackingSection(),
      supportSection(),
    ];
  }

  const sections: NavSection[] = [];

  if (mode === "agency" || context.platformAdmin) {
    sections.push(platformAdminSection());
  }

  sections.push(analyticsSection());

  if (context.organizationOwner || context.platformAdmin) {
    sections.push(trackingSection());
    sections.push(organizationSection());
  } else {
    sections.push({
      id: "data",
      label: "Dados",
      items: [
        {
          href: "/organizacao/leads",
          label: "Leads capturados",
          icon: "leads",
          exact: true,
        },
      ],
    });
    sections.push(analystReferenceSection());
  }

  sections.push(supportSection());
  return sections;
}

export function navItemsForMode(
  mode: ShellMode,
  context: NavContext = {},
): NavItem[] {
  return navSectionsForMode(mode, context).flatMap((section) => section.items);
}

const mobileDashboardItem = (): NavItem => ({
  href: "/dashboard",
  label: "Início",
  icon: "dashboard",
});

const mobileReportsItem = (): NavItem => ({
  href: "/relatorios",
  label: "Relatórios",
  icon: "reports",
});

/** Barra inferior: analista/proprietário = Início + Relatórios + Menu; admin = Admin + Menu. */
export function mobilePrimaryNav(
  mode: ShellMode,
  _context: NavContext = {},
): NavItem[] {
  if (mode === "agency") {
    return [
      { href: "/admin", label: "Admin", icon: "platform", exact: true },
    ];
  }
  return [mobileDashboardItem(), mobileReportsItem()];
}

function mobileMenuItem(
  href: string,
  label: string,
  icon: NavIconName,
  exact?: boolean,
): NavItem {
  return { href, label, icon, exact };
}

/** Itens do sheet "Menu" — lista curta, sem repetir a barra inferior. */
export function mobileMenuItems(
  mode: ShellMode,
  context: NavContext = {},
): NavItem[] {
  const items: NavItem[] = [];

  if (mode === "agency") {
    items.push(
      mobileDashboardItem(),
      mobileReportsItem(),
      mobileMenuItem("/campanhas", "Campanhas", "campaigns"),
      mobileMenuItem("/admin/usuarios", "Usuários", "users"),
      mobileMenuItem("/admin/relatorios", "Relatórios publicados", "reports"),
      mobileMenuItem("/admin/planos", "Planos", "plans"),
    );
  } else {
    items.push(mobileMenuItem("/campanhas", "Campanhas", "campaigns"));
    if (context.platformAdmin) {
      items.push(
        mobileMenuItem("/admin/usuarios", "Usuários", "users"),
        mobileMenuItem("/admin/relatorios", "Relatórios publicados", "reports"),
        mobileMenuItem("/admin/planos", "Planos", "plans"),
      );
    }
  }

  if (context.organizationOwner || context.platformAdmin) {
    items.push(
      mobileMenuItem("/organizacao", "Empresas e acessos", "organization", true),
      mobileMenuItem("/organizacao/leads", "Leads", "leads", true),
      mobileMenuItem("/organizacao/formularios", "Formulários", "form-create", true),
      mobileMenuItem("/rastreamento", "Script e pixel", "script"),
      mobileMenuItem("/parametros", "Parâmetros UTM", "params"),
      mobileMenuItem("/encurtador", "Encurtador", "shortener"),
    );
  } else {
    items.push(
      mobileMenuItem("/organizacao/leads", "Leads", "leads", true),
      mobileMenuItem("/parametros", "Parâmetros UTM", "params"),
    );
  }

  items.push(mobileMenuItem("/documentacao", "Guia de uso", "guide"));

  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

/** Sheet mobile: uma única lista, sem blocos de seção. */
export function mobileMenuSections(
  mode: ShellMode,
  context: NavContext = {},
): NavSection[] {
  return [
    {
      id: "mobile-menu",
      label: "",
      items: mobileMenuItems(mode, context),
    },
  ];
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.locked) return false;
  if (item.children?.length) {
    return item.children.some((child) => isNavItemActive(pathname, child));
  }
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

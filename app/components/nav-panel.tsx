"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isNavItemActive,
  type NavIconName,
  type NavItem,
  type NavSection,
} from "@/lib/nav-items";
import { logout } from "@/app/login/actions";
import { authEnabled } from "@/lib/auth-config";

export type SidebarUserInfo = {
  name: string;
  email: string;
  roleLabel: string;
};

export function NavIcon({
  name,
  className = "h-4 w-4 shrink-0",
}: {
  name?: NavIconName;
  className?: string;
}) {
  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <rect
            x="2"
            y="2"
            width="5"
            height="5"
            rx="1.2"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <rect
            x="9"
            y="2"
            width="5"
            height="3.5"
            rx="1.2"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <rect
            x="9"
            y="7.5"
            width="5"
            height="6.5"
            rx="1.2"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <rect
            x="2"
            y="9"
            width="5"
            height="5"
            rx="1.2"
            stroke="currentColor"
            strokeWidth="1.35"
          />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M2.5 13.5H13.5M4.5 11V7.5M8 11V4.5M11.5 11V6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "campaigns":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <path
            d="M8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
        </svg>
      );
    case "platform":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M2.5 4.5H13.5M2.5 8H13.5M2.5 11.5H13.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <circle cx="5.5" cy="4.5" r="1.4" fill="var(--background)" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="10.5" cy="8" r="1.4" fill="var(--background)" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="6.5" cy="11.5" r="1.4" fill="var(--background)" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <circle
            cx="6.25"
            cy="5.25"
            r="2.25"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <path
            d="M2.25 13C2.25 10.9289 3.92893 9.25 6 9.25H6.5C8.57107 9.25 10.25 10.9289 10.25 13"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <path
            d="M10.75 4.25C11.7165 4.55825 12.25 5.45 12.25 6.35C12.25 7.25 11.7165 8.14175 10.75 8.45M11.5 10C12.75 10.35 13.75 11.45 13.75 13"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </svg>
      );
    case "plans":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <rect
            x="2"
            y="3.5"
            width="12"
            height="9"
            rx="1.8"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <path
            d="M2 6.75H14M5 9.75H7.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </svg>
      );
    case "organization":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M3 13.5V3.5C3 2.94772 3.44772 2.5 4 2.5H9C9.55228 2.5 10 2.94772 10 3.5V13.5M10 6.5H12C12.5523 6.5 13 6.94772 13 7.5V13.5M2 13.5H14M5.5 5.5H7.5M5.5 8H7.5M5.5 10.5H7.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "form-create":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <rect
            x="2.5"
            y="2.5"
            width="11"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.35"
          />
          <path
            d="M5.25 6H10.75M5.25 8.75H8.5M9.5 11L11.5 9"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </svg>
      );
    case "form-install":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M5.5 5L2.5 8L5.5 11M10.5 5L13.5 8L10.5 11M8.75 3.5L7.25 12.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "leads":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M3 5.5H13M3 8H10M3 10.5H8"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <rect
            x="2.5"
            y="3"
            width="11"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.35"
          />
        </svg>
      );
    case "script":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M2 8.5H4.5L6.25 4L9.25 12L11 8.5H14"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "params":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M6 2.5L4.5 13.5M11.5 2.5L10 13.5M2.5 6H13.5M2 10H13"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </svg>
      );
    case "shortener":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M6.5 9.5L9.5 6.5M5.5 7L4.25 8.25C3.14543 9.35457 3.14543 11.1454 4.25 12.25C5.35457 13.3546 7.14543 13.3546 8.25 12.25L9.5 11M10.5 9L11.75 7.75C12.8546 6.64543 12.8546 4.85457 11.75 3.75C10.6454 2.64543 8.85457 2.64543 7.75 3.75L6.5 5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </svg>
      );
    case "guide":
    default:
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
          <path
            d="M3 3.5C3 2.94772 3.44772 2.5 4 2.5H12.5V12.5H4C3.44772 12.5 3 12.9477 3 13.5V3.5ZM3 13.5C3 12.9477 3.44772 12.5 4 12.5H12.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 5.5H10M6 8H9"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

function NavLink({
  item,
  onNavigate,
  collapsed = false,
  sheet = false,
}: {
  item: NavItem;
  onNavigate?: () => void;
  collapsed?: boolean;
  sheet?: boolean;
}) {
  const pathname = usePathname();
  const active = isNavItemActive(pathname, item) && !item.locked;
  const locked = Boolean(item.locked);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-disabled={locked}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={`group relative flex cursor-pointer items-center rounded-lg transition-colors ${
        collapsed
          ? "justify-center px-0 py-2.5"
          : "justify-between gap-2.5 px-2.5 py-2 text-[13px] leading-5"
      } ${sheet ? "py-2.5" : ""} ${
        active
          ? "bg-surface-elevated font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/10"
          : locked
            ? "text-muted/60"
            : "font-normal text-muted-foreground hover:bg-surface/90 hover:text-foreground"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-foreground"
        />
      )}
      <span
        className={`flex min-w-0 items-center ${
          collapsed ? "justify-center" : "gap-2.5"
        }`}
      >
        <span
          className={`transition-colors ${
            active
              ? "text-foreground"
              : "text-muted group-hover:text-foreground"
          }`}
        >
          <NavIcon name={item.icon} />
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </span>
      {!collapsed && locked && (
        <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-muted">
          Plano
        </span>
      )}
    </Link>
  );
}

export function NavPanel({
  sections,
  items,
  user,
  onNavigate,
  showLogout = true,
  collapsed = false,
  sheet = false,
}: {
  sections?: NavSection[];
  items?: NavItem[];
  user?: SidebarUserInfo;
  onNavigate?: () => void;
  showLogout?: boolean;
  collapsed?: boolean;
  /** Menu inferior mobile: lista compacta, sem títulos de seção. */
  sheet?: boolean;
}) {
  const resolvedSections: NavSection[] =
    sections && sections.length > 0
      ? sections
      : items && items.length > 0
        ? [{ id: "default", label: "Menu", items }]
        : [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav
        aria-label={sheet ? "Menu do aplicativo" : "Menu lateral"}
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:thin] ${
          sheet
            ? "gap-0.5 px-2 py-2"
            : collapsed
              ? "gap-3 px-1.5 py-3"
              : "gap-5 px-3 py-3"
        }`}
      >
        {resolvedSections.map((section, sectionIndex) => (
          <div key={section.id} className="space-y-1">
            {!collapsed && !sheet && section.label ? (
              <p className="px-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted/75">
                {section.label}
              </p>
            ) : null}
            {collapsed && sectionIndex > 0 && (
              <div
                aria-hidden
                className="mx-auto mb-1 h-px w-6 bg-border-subtle"
              />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={`${item.href}-${item.label}`}
                  item={item}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                  sheet={sheet}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {authEnabled && showLogout && (
        <div
          className={`mt-auto shrink-0 border-t border-border-subtle ${
            collapsed ? "p-1.5" : "p-3"
          }`}
        >
          {user ? (
            <div
              className={`flex items-center rounded-xl border border-border-subtle bg-surface/60 ${
                collapsed
                  ? "justify-center px-1 py-2"
                  : "justify-between gap-2.5 px-3 py-2.5"
              }`}
            >
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                    {user.name || "Minha conta"}
                  </p>
                  <p className="mt-0.5 truncate text-[11.5px] leading-tight text-muted">
                    {user.roleLabel}
                  </p>
                </div>
              )}

              <form action={logout} className="shrink-0">
                <button
                  type="submit"
                  title="Sair da conta"
                  aria-label="Sair da conta"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className="h-3.5 w-3.5"
                  >
                    <path
                      d="M6 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H6M10.5 11L13.5 8L10.5 5M6.5 8H13.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
            </div>
          ) : (
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                <span>Encerrar sessão</span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                  className="h-4 w-4 text-muted"
                >
                  <path
                    d="M6 13.5H3.5C2.94772 13.5 2.5 13.0523 2.5 12.5V3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H6M10.5 11L13.5 8L10.5 5M6.5 8H13.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

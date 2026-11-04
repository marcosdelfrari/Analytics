import { authEnabled } from "@/lib/auth-config";
import type { AccountRole } from "@/lib/access-roles";
import { isSystemAdminAccount } from "@/lib/access-roles";
import type { Session } from "@/lib/types";

/** Modo de navegação do app (UI). Conta: `system_admin` | `client`. */
export type ShellMode = "client" | "agency";

const CLIENT_PREFIXES = [
  "/dashboard",
  "/campanhas",
  "/relatorios",
  "/organizacao",
];

export function shellModeFromRole(role: AccountRole): ShellMode {
  return isSystemAdminAccount(role) ? "agency" : "client";
}

export function shellModeFromPathname(pathname: string): ShellMode {
  if (CLIENT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return "client";
  }
  return "agency";
}

export function resolveShellMode(
  pathname: string,
  session: Session | null,
): ShellMode {
  if (authEnabled && session) {
    return shellModeFromRole(session.role);
  }
  return shellModeFromPathname(pathname);
}

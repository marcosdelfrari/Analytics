import { authEnabled } from "@/lib/auth-config";
import type { Role, Session } from "@/lib/types";

/** Modo de navegação do app (UI). Papel no banco continua `admin` | `client`. */
export type ShellMode = "client" | "agency";

const CLIENT_PREFIXES = ["/dashboard", "/campanhas", "/relatorios"];

export function shellModeFromRole(role: Role): ShellMode {
  return role === "admin" ? "agency" : "client";
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

import type { Session } from "@/lib/types";

/** Proprietário cadastra empresas, acessos, script, links e formulários. */
export function canRegisterResources(
  session: Pick<Session, "role" | "isOrganizationOwner">,
) {
  return session.role === "admin" || session.isOrganizationOwner;
}

/** Acesso às telas de cadastro da organização (empresas, formulários). */
export function canAccessOrganizationWorkspace(
  session: Pick<Session, "role" | "isOrganizationOwner">,
) {
  return canRegisterResources(session);
}

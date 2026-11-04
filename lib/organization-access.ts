import type { Session } from "@/lib/types";
import { isSystemAdminAccount } from "@/lib/access-roles";

/** Proprietário cadastra empresas, acessos, script, links e formulários. */
export function canRegisterResources(
  session: Pick<Session, "role" | "isProprietario">,
) {
  return isSystemAdminAccount(session.role) || session.isProprietario;
}

/** Acesso às telas de cadastro da organização (empresas, formulários). */
export function canAccessOrganizationWorkspace(
  session: Pick<Session, "role" | "isProprietario">,
) {
  return canRegisterResources(session);
}

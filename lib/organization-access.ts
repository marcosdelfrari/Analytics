import type { Session } from "@/lib/types";
import { AccountRole, isSystemAdminAccount } from "@/lib/access-roles";

/** Proprietário cadastra empresas, acessos, script, links e encurtador. */
export function canRegisterResources(
  session: Pick<Session, "role" | "isProprietario">,
) {
  return isSystemAdminAccount(session.role) || session.isProprietario;
}

/** Acesso às telas de cadastro da organização (empresas e acessos). */
export function canAccessOrganizationWorkspace(
  session: Pick<Session, "role" | "isProprietario">,
) {
  return canRegisterResources(session);
}

/** Criar, editar e instalar formulários (proprietário ou analista com grant). */
export function canAccessLeadForms(session: Pick<Session, "role">) {
  return (
    isSystemAdminAccount(session.role) || session.role === AccountRole.client
  );
}

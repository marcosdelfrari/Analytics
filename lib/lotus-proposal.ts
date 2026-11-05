import { cache } from "react";
import { listAccessibleCompanies } from "@/lib/organizations-store";
import { prisma } from "@/lib/prisma";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Organizações cliente Lótus: proposta aceita ligada à org via plano de marketing
 * (marketing_plans → cad_empresa) ou via acesso do signatário (cad_acesso).
 */
export const listLotusPartnerOrganizationIds = cache(async (): Promise<Set<string>> => {
  const rows = await prisma.$queryRaw<Array<{ organization_id: string }>>`
    SELECT DISTINCT c.organization_id
    FROM public.traffic_proposals p
    INNER JOIN public.marketing_plans mp ON mp.proposal_id = p.id
    INNER JOIN dbo.cad_empresa c ON c.id = mp.analytics_company_id
    WHERE p.status = CAST('accepted' AS "ProposalStatus")

    UNION

    SELECT DISTINCT g.organization_id
    FROM public.traffic_proposals p
    INNER JOIN dbo.cad_usuario u ON u.id = p.user_id
    INNER JOIN dbo.cad_acesso g ON lower(trim(g.email)) = lower(trim(u.email))
    WHERE p.status = CAST('accepted' AS "ProposalStatus")

    UNION

    SELECT DISTINCT g.organization_id
    FROM public.traffic_proposals p
    INNER JOIN dbo.cad_acesso g
      ON lower(trim(g.email)) = lower(trim(p.client_email))
    WHERE p.status = CAST('accepted' AS "ProposalStatus")
      AND trim(p.client_email) <> ''
  `;

  return new Set(rows.map((row) => row.organization_id));
});

/** Qualquer membro com acesso a uma empresa da org parceira Lótus. */
export const userHasLotusPartnerAccess = cache(
  async (_userId: string, email: string): Promise<boolean> => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return false;

    const [lotusOrgs, accessible] = await Promise.all([
      listLotusPartnerOrganizationIds(),
      listAccessibleCompanies(normalizedEmail),
    ]);

    if (lotusOrgs.size === 0 || accessible.length === 0) {
      return false;
    }

    return accessible.some((company) => lotusOrgs.has(company.organizationId));
  },
);

/** Alias legado — preferir userHasLotusPartnerAccess. */
export const userHasAcceptedTrafficProposal = userHasLotusPartnerAccess;

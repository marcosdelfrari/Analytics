"use client";

import { usePathname } from "next/navigation";
import { selectActiveCompany } from "@/app/(shell)/actions/company";
import type { CompanyAccount } from "@/lib/organizations-store";

type CompanySwitcherProps = {
  companies: CompanyAccount[];
  activeCompanyId?: string;
};

export function CompanySwitcher({
  companies,
  activeCompanyId,
}: CompanySwitcherProps) {
  const pathname = usePathname();

  if (companies.length <= 1) {
    return null;
  }

  const active =
    companies.find((company) => company.id === activeCompanyId) ?? companies[0];

  if (!active) return null;

  return (
    <div className="px-3 pt-3 pb-1">
      <form action={selectActiveCompany} className="relative">
        <input type="hidden" name="returnTo" value={pathname} />
        <div className="group relative flex items-center justify-between gap-2 rounded-xl border border-border-subtle bg-surface/80 px-3 py-2 transition-colors hover:border-border hover:bg-surface">
          <div className="min-w-0 flex-1 pr-5">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Empresa ativa
            </p>
            <p className="mt-0.5 truncate text-[12.5px] font-medium leading-tight text-foreground">
              {active.name}
            </p>
          </div>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted transition-colors group-hover:text-foreground"
          >
            <path
              d="M5.5 6L8 3.5L10.5 6M5.5 10L8 12.5L10.5 10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <select
            name="companyId"
            aria-label="Selecionar empresa ativa"
            defaultValue={active.id}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} — {company.organizationName}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { selectActiveCompany } from "@/app/(shell)/actions/company";
import type { CompanyAccount } from "@/lib/organizations-store";

type CompanySwitcherProps = {
  companies: CompanyAccount[];
  activeCompanyId: string;
};

export function CompanySwitcher({
  companies,
  activeCompanyId,
}: CompanySwitcherProps) {
  const pathname = usePathname();

  if (companies.length <= 1) {
    const only = companies[0];
    if (!only) return null;
    return (
      <div className="border-b border-border px-3 py-3">
        <p className="text-[10px] uppercase tracking-wider text-muted">Empresa</p>
        <p className="mt-1 truncate text-[12px] font-medium">{only.name}</p>
        <p className="truncate text-[10px] text-muted">{only.organizationName}</p>
      </div>
    );
  }

  return (
    <div className="border-b border-border px-3 py-3">
      <label className="block text-[10px] uppercase tracking-wider text-muted">
        Empresa ativa
      </label>
      <form action={selectActiveCompany} className="mt-1.5">
        <input type="hidden" name="returnTo" value={pathname} />
        <select
          name="companyId"
          defaultValue={activeCompanyId}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="w-full border border-border bg-background px-2 py-1.5 text-[12px] outline-none focus:border-muted-foreground"
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.organizationName} · {company.name}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}

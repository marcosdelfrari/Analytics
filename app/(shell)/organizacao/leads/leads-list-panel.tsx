"use client";

import Link from "next/link";
import type { LeadSubmissionRecord } from "@/lib/lead-submissions-store";
import type { LeadFormRecord } from "@/lib/lead-form-types";

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

type CompanyOption = { id: string; name: string };

export function LeadsListPanel({
  organizationId,
  forms,
  companies,
  submissions,
  totalCount,
  selectedFormId,
  selectedCompanyId,
  canRegister = true,
}: {
  organizationId: string;
  forms: LeadFormRecord[];
  companies: CompanyOption[];
  submissions: LeadSubmissionRecord[];
  totalCount: number;
  selectedFormId: string | null;
  selectedCompanyId: string | null;
  canRegister?: boolean;
}) {
  const base = `/organizacao/leads?org=${organizationId}`;

  function filterHref(formId: string | null, companyId: string | null) {
    const params = new URLSearchParams({ org: organizationId });
    if (formId) params.set("form", formId);
    if (companyId) params.set("empresa", companyId);
    return `/organizacao/leads?${params.toString()}`;
  }

  const exportParams = new URLSearchParams({ org: organizationId });
  if (selectedFormId) exportParams.set("form", selectedFormId);
  if (selectedCompanyId) exportParams.set("empresa", selectedCompanyId);
  const exportHref = `/organizacao/leads/exportar?${exportParams.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-4">
          <label className="flex min-w-[180px] flex-col gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
            Formulário
            <select
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={selectedFormId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                window.location.href = filterHref(
                  value || null,
                  selectedCompanyId,
                );
              }}
            >
              <option value="">Todos</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[180px] flex-col gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
            Empresa
            <select
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={selectedCompanyId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                window.location.href = filterHref(
                  selectedFormId,
                  value || null,
                );
              }}
            >
              <option value="">Todas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {totalCount === 0
              ? "Nenhum lead ainda"
              : totalCount === 1
                ? "1 lead"
                : `${totalCount} leads`}
            {submissions.length < totalCount
              ? ` · exibindo os ${submissions.length} mais recentes`
              : null}
          </p>
          <Link
            href={exportHref}
            className="rounded-xl border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-foreground transition hover:bg-surface-elevated"
          >
            Exportar CSV
          </Link>
        </div>
      </div>

      {submissions.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <h2 className="text-base font-medium tracking-tight">
            Nenhuma captura neste filtro
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {canRegister ? (
              <>
                Quando alguém enviar um formulário instalado no site, os dados
                aparecem aqui. Confira se o script está publicado em{" "}
                <Link
                  href={`/organizacao/formularios/instalar?org=${organizationId}`}
                  className="text-foreground underline underline-offset-2"
                >
                  Instalar formulário
                </Link>
                .
              </>
            ) : (
              "Quando alguém enviar um formulário no site, os dados das suas empresas aparecem aqui."
            )}
          </p>
        </section>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-elevated/60 text-[11px] font-medium uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Quando</th>
                  <th className="px-4 py-3 font-medium">Formulário</th>
                  <th className="px-4 py-3 font-medium">Empresa</th>
                  <th className="px-4 py-3 font-medium">Resumo</th>
                  <th className="px-4 py-3 font-medium">Página</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="align-top transition-colors hover:bg-surface-elevated/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {formatWhen(submission.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {submission.formName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {submission.companyName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <dl className="space-y-1">
                          {submission.lines.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            submission.lines.map((line) => (
                              <div key={line.fieldId} className="flex gap-2">
                                <dt className="shrink-0 text-muted-foreground">
                                  {line.label}:
                                </dt>
                                <dd className="break-all text-foreground">
                                  {line.value}
                                </dd>
                              </div>
                            ))
                          )}
                        </dl>
                      </td>
                      <td className="max-w-[200px] px-4 py-3">
                        {submission.pageUrl ? (
                          <a
                            href={submission.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="line-clamp-2 text-[12px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                          >
                            {submission.pageUrl}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(selectedFormId || selectedCompanyId) && (
        <div className="text-center">
          <Link
            href={base}
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Limpar filtros
          </Link>
        </div>
      )}
    </div>
  );
}

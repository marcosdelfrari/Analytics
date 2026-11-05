"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/app/(shell)/encurtador/copy-button";
import {
  LEAD_FORM_KIND_LABELS,
  type LeadFormRecord,
} from "@/lib/lead-form-types";

export function InstallFormsPanel({
  organizationId,
  forms,
  selectedFormId,
  snippetHtml,
  snippetError,
  apiOrigin,
}: {
  organizationId: string;
  forms: LeadFormRecord[];
  selectedFormId: string | null;
  snippetHtml: string | null;
  snippetError: string | null;
  apiOrigin: string;
}) {
  const router = useRouter();
  const selected =
    forms.find((form) => form.id === selectedFormId) ?? forms[0] ?? null;

  function selectForm(formId: string) {
    router.push(
      `/organizacao/formularios/instalar?org=${organizationId}&form=${formId}`,
    );
  }

  if (forms.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-surface px-6 py-10 shadow-sm">
        <h2 className="text-lg font-medium tracking-tight">
          Nenhum formulário para instalar
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          Crie e ative um formulário antes de gerar o script da Fractal API.
        </p>
        <Link
          href={`/organizacao/formularios?org=${organizationId}`}
          className="mt-5 inline-flex rounded-xl bg-foreground px-3.5 py-2 text-[12px] font-medium text-background transition hover:opacity-90"
        >
          Ir para Criar
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-border bg-surface p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-1">
          <p className="text-[12px] font-medium text-foreground">Formulários</p>
          <span className="rounded-full bg-surface-elevated px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
            {forms.length}
          </span>
        </div>
        <ul className="space-y-1">
          {forms.map((form) => {
            const active = selected?.id === form.id;
            return (
              <li key={form.id}>
                <button
                  type="button"
                  onClick={() => selectForm(form.id)}
                  className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-white/15 bg-surface-elevated shadow-sm"
                      : "border-transparent hover:border-border hover:bg-surface-elevated/70"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      form.active ? "bg-positive" : "bg-muted/50"
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-medium">
                      {form.name}
                    </span>
                    <span className="mt-0.5 block text-[10.5px] text-muted">
                      {LEAD_FORM_KIND_LABELS[form.kind]}
                      {form.active ? "" : " · inativo"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="space-y-4">
        {selected ? (
          <>
            <section className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium tracking-tight">
                    {selected.name}
                  </h2>
                  <p className="mt-1 text-[12px] text-muted">
                    {LEAD_FORM_KIND_LABELS[selected.kind]}
                    {selected.companyName
                      ? ` · ${selected.companyName}`
                      : " · toda a organização"}
                  </p>
                </div>
                <Link
                  href={`/organizacao/formularios?org=${organizationId}&form=${selected.id}`}
                  className="rounded-xl border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                >
                  Editar
                </Link>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <div>
                  <h2 className="text-sm font-medium">Como instalar</h2>
                  <p className="text-[12px] text-muted">
                    {selected.kind === "section"
                      ? "Cole a seção e o script no ponto da página onde o formulário deve aparecer. "
                      : "Cole o script antes de "}
                    {selected.kind === "section" ? null : (
                      <>
                        <code className="font-mono text-[11px]">
                          &lt;/body&gt;
                        </code>{" "}
                      </>
                    )}
                    O arquivo é servido pela Fractal API (
                    <code className="font-mono text-[11px]">{apiOrigin}</code>
                    ).
                  </p>
                </div>
                {snippetHtml ? <CopyButton value={snippetHtml} /> : null}
              </div>

              {!selected.active ? (
                <p className="px-5 py-5 text-[12.5px] leading-6 text-amber-200">
                  Este formulário está inativo. Ative-o em{" "}
                  <Link
                    href={`/organizacao/formularios?org=${organizationId}&form=${selected.id}`}
                    className="underline underline-offset-2"
                  >
                    Criar
                  </Link>{" "}
                  para a API publicar o embed em{" "}
                  <code className="font-mono text-[11px]">
                    /v1/forms/{selected.id}/snippet
                  </code>
                  .
                </p>
              ) : snippetError ? (
                <p className="px-5 py-5 text-[12.5px] leading-6 text-negative">
                  {snippetError}
                </p>
              ) : snippetHtml ? (
                <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-5 text-foreground">
                  {snippetHtml}
                </pre>
              ) : (
                <p className="px-5 py-5 text-[12px] text-muted">
                  Selecione um formulário ativo para ver o script.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
              <h2 className="text-sm font-medium">Passos</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-[12.5px] leading-6 text-muted-foreground">
                <li>Ative o formulário na tela Criar (status verde).</li>
                <li>Copie o script gerado pela Fractal API acima.</li>
                <li>
                  {selected.kind === "section" ? (
                    <>
                      Cole a{" "}
                      <code className="font-mono text-[11px] text-foreground">
                        &lt;section id=&quot;fractal-lead-form&quot;&gt;
                      </code>{" "}
                      no corpo da página (onde o formulário deve ficar fixo) e o{" "}
                      <code className="font-mono text-[11px] text-foreground">
                        &lt;script&gt;
                      </code>{" "}
                      em seguida.
                    </>
                  ) : (
                    <>
                      Cole no HTML do site do cliente, preferencialmente antes de{" "}
                      <code className="font-mono text-[11px] text-foreground">
                        &lt;/body&gt;
                      </code>
                      .
                    </>
                  )}
                </li>
                <li>
                  Instale também o tracker Fractal (menu Script) no mesmo site
                  para disparar{" "}
                  <code className="font-mono text-[11px] text-foreground">
                    lead_form_submit
                  </code>{" "}
                  e a conversão{" "}
                  <code className="font-mono text-[11px] text-foreground">
                    contato
                  </code>{" "}
                  com atribuição de campanha.
                </li>
              </ol>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

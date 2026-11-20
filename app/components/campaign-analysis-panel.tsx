"use client";

import { useRouter } from "next/navigation";
import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type {
  CampaignAnalysisTab,
  CampaignAnalysisView,
  ContactActionRow,
  KeywordAnalysisRow,
} from "@/lib/campaign-analysis/types";
import {
  formatCurrencyDetailed,
  formatNumber,
} from "@/lib/format";
import { formatRangeLabel } from "@/lib/report-period";

const TABS: { id: CampaignAnalysisTab; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "keywords", label: "Palavras-chave" },
  { id: "contacts", label: "Contatos" },
  { id: "data", label: "Dados e validações" },
];

const REPORT_TYPE_LABEL: Record<string, string> = {
  campaign: "Campanha",
  keyword: "Palavras-chave",
  ad: "Anúncios",
  search_term: "Termos de pesquisa",
  unknown: "Não identificado",
};

function formatContactWhen(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(",", " ·");
}

function contactChannelLabel(contact: ContactActionRow) {
  if (contact.kind === "form") {
    return contact.product
      ? `Formulário · ${contact.product}`
      : contact.title.includes("·")
        ? contact.title
        : "Formulário · Página inicial";
  }
  return contact.product
    ? `WhatsApp · ${contact.product}`
    : "WhatsApp · Produto não informado";
}

function AssociationBadge({
  situation,
  label,
}: {
  situation: KeywordAnalysisRow["situation"];
  label: string;
}) {
  if (situation === "review") {
    return (
      <span className="inline-flex rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
      {label}
    </span>
  );
}

export function CampaignAnalysisPanel({
  view,
  periodControls,
  alignPeriodHref,
}: {
  view: CampaignAnalysisView;
  periodControls: ReactNode;
  alignPeriodHref: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<CampaignAnalysisTab>("overview");
  const [importing, startImport] = useTransition();
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  const keywordsWithActions = useMemo(
    () =>
      view.keywords.filter(
        (row) => (row.siteActions ?? 0) > 0 || row.situation === "review",
      ),
    [view.keywords],
  );

  function openFilePicker() {
    fileRef.current?.click();
  }

  function onFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    startImport(async () => {
      setImportMessage(null);
      const body = new FormData();
      body.append("file", file);
      body.append("campaign", view.campaign);
      const response = await fetch("/api/campaign-analysis/import", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as {
        error?: string;
        reportType?: string;
        periodFrom?: string;
        periodTo?: string;
        updated?: boolean;
      };
      if (!response.ok) {
        setImportMessage(payload.error ?? "Não foi possível importar o arquivo.");
        return;
      }
      const label = payload.reportType
        ? REPORT_TYPE_LABEL[payload.reportType] ?? payload.reportType
        : "Relatório";
      const period =
        payload.periodFrom && payload.periodTo
          ? formatRangeLabel(payload.periodFrom, payload.periodTo)
          : "período não identificado";
      setImportMessage(
        `${label} identificado · ${period}${payload.updated ? " · atualização reconhecida" : ""}`,
      );
      router.refresh();
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">
              Análise de campanhas
            </p>
            <h2 className="mt-1 text-lg font-medium tracking-tight">
              Entenda quanto você investiu, quais ações aconteceram no site e o
              que virou oportunidade.
            </h2>
          </div>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={importing || view.demo}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60"
          >
            Importar relatório
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => onFileSelected(event.target.files)}
          />
        </div>

        <section className="rounded-xl border border-border bg-surface px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
            <span>
              Google Ads · {view.sourceLabels.googleAds}
            </span>
            <span>Site · {view.sourceLabels.site}</span>
            {view.campaign ? (
              <label className="inline-flex items-center gap-1.5">
                Campanha:
                <select
                  value={view.campaign}
                  onChange={(event) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("campanha", event.target.value);
                    router.push(`${url.pathname}?${url.searchParams.toString()}`);
                  }}
                  className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground"
                >
                  {view.campaignOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="ml-auto">{periodControls}</div>
          </div>
          {importMessage ? (
            <p className="mt-2 text-[11px] text-foreground">{importMessage}</p>
          ) : null}
        </section>
      </header>

      {!view.periodAligned && view.reportWindow ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3">
          <div>
            <p className="text-[13px] font-medium text-foreground">
              Valide o período para comparar custos e contatos
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              As visitas do site ainda não foram filtradas para o período do
              Google Ads.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("data")}
            className="shrink-0 text-[12px] font-medium text-amber-100 underline-offset-2 hover:underline"
          >
            Conferir fontes ↗
          </button>
        </div>
      ) : null}

      {view.imports.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center">
          <p className="text-sm text-foreground">
            Seu rastreador já mostra as visitas e ações no site.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-[13px] text-muted-foreground">
            Importe um relatório do Google Ads para acrescentar investimento,
            cliques e análise de custo por ação.
          </p>
          <button
            type="button"
            onClick={openFilePicker}
            disabled={importing || view.demo}
            className="mt-4 rounded-lg bg-foreground px-3.5 py-2 text-[12px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          >
            Importar relatório do Google Ads
          </button>
        </section>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {view.kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="rounded-xl border border-border bg-surface px-3.5 py-3"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted">
              {kpi.label}
            </p>
            <p className="mt-1 font-mono text-xl font-medium tracking-tight text-foreground">
              {kpi.value}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{kpi.hint}</p>
          </div>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-1 border-b border-border"
        role="tablist"
        aria-label="Seções da análise de campanhas"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-3 py-2 text-[12px] font-medium transition ${
                selected
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="space-y-3">
        {activeTab === "overview" ? (
          <OverviewTab view={view} onNavigate={setActiveTab} />
        ) : null}
        {activeTab === "keywords" ? (
          <KeywordsTab
            rows={keywordsWithActions}
            reportWindow={view.reportWindow}
            actionDateLabel={view.actionDateLabel}
          />
        ) : null}
        {activeTab === "contacts" ? (
          <ContactsTab
            contacts={view.contacts}
            expandedId={expandedContact}
            onToggle={(id) =>
              setExpandedContact((current) => (current === id ? null : id))
            }
          />
        ) : null}
        {activeTab === "data" ? (
          <DataTab view={view} alignPeriodHref={alignPeriodHref} />
        ) : null}
      </div>
    </div>
  );
}

function OverviewTab({
  view,
  onNavigate,
}: {
  view: CampaignAnalysisView;
  onNavigate: (tab: CampaignAnalysisTab) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.85fr)]">
      <section className="rounded-xl border border-border bg-surface px-4 py-4">
        <p className="text-[10px] uppercase tracking-[0.14em] text-sky-300/80">
          Leitura da campanha
        </p>
        <h3 className="mt-2 text-base font-medium tracking-tight text-foreground">
          {view.reading.headline}
        </h3>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {view.reading.summary}
        </p>
        <ul className="mt-4 space-y-3">
          {view.reading.actions.map((action) => (
            <li
              key={action.id}
              className="rounded-lg border border-border-subtle bg-background/40 px-3 py-2.5"
            >
              <p className="text-[13px] font-medium text-foreground">
                {action.title}
              </p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {action.detail}
              </p>
              <button
                type="button"
                onClick={() => onNavigate(action.actionTab)}
                className="mt-1.5 text-[12px] font-medium text-sky-300 underline-offset-2 hover:underline"
              >
                {action.actionLabel} →
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="rounded-xl border border-border bg-surface px-4 py-4">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
          O que já foi medido
        </p>
        <ul className="mt-3 divide-y divide-border-subtle">
          {view.measured.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-2.5">
              <div>
                <p className="text-[12px] text-foreground">{item.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {item.hint}
                </p>
              </div>
              <p className="shrink-0 font-mono text-[15px] font-medium text-foreground">
                {item.value}
              </p>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function KeywordsTab({
  rows,
  reportWindow,
  actionDateLabel,
}: {
  rows: KeywordAnalysisRow[];
  reportWindow: CampaignAnalysisView["reportWindow"];
  actionDateLabel: string | null;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
        Importe um relatório de palavras-chave para cruzar investimento, cliques
        e ações no site.
      </p>
    );
  }

  const hasReview = rows.some((row) => row.situation === "review");

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">
          Palavras com ações no site
        </h3>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          Associação por texto da UTM · vínculo ainda não validado
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-left text-[12px]">
          <thead className="border-b border-border text-[10px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Palavra-chave / UTM</th>
              <th className="px-3 py-2.5 font-medium">Cliques Ads</th>
              <th className="px-3 py-2.5 font-medium">Custo Ads</th>
              <th className="px-3 py-2.5 font-medium">Ações no site</th>
              <th className="px-3 py-2.5 font-medium">Associação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.keyword}
                className="border-b border-border-subtle last:border-0"
              >
                <td className="px-3 py-2.5 font-medium">{row.keyword}</td>
                <td className="px-3 py-2.5 font-mono text-[11px]">
                  {formatNumber(row.adClicks)}
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px]">
                  {formatCurrencyDetailed(row.spend)}
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px]">
                  {row.siteActions === null
                    ? "—"
                    : formatNumber(row.siteActions)}
                </td>
                <td className="px-3 py-2.5">
                  <AssociationBadge
                    situation={row.situation}
                    label={row.situationLabel}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Custos e cliques:{" "}
        {reportWindow
          ? formatRangeLabel(reportWindow.from, reportWindow.to)
          : "—"}
        . Ações exibidas: {actionDateLabel ?? "—"}. UTM não confirma a data do
        clique nem a pesquisa digitada.
      </p>

      {hasReview ? (
        <div className="rounded-xl border border-amber-500/30 border-l-4 bg-amber-500/5 px-3.5 py-3">
          <p className="text-[13px] font-medium text-foreground">
            Não calcular custo por contato nesta associação.
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Verifique IDs, datas de origem e persistência da UTM antes de
            atribuir custos a essa palavra-chave.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ContactsTab({
  contacts,
  expandedId,
  onToggle,
}: {
  contacts: ContactActionRow[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  if (contacts.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
        Nenhuma ação de contato atribuída à campanha no período selecionado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Registros de contato
          </h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {contacts.length} ações · abra um registro para consultar a origem
          </p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground">
          Resultado comercial pendente
        </span>
      </div>

      <ul className="overflow-hidden rounded-xl border border-border bg-surface">
        {contacts.map((contact) => {
          const open = expandedId === contact.id;
          const isForm = contact.kind === "form";
          return (
            <li
              key={contact.id}
              className="border-b border-border-subtle last:border-0"
            >
              <div className="flex flex-wrap items-center gap-3 px-3.5 py-3">
                <p className="w-24 shrink-0 text-[11px] text-muted-foreground">
                  {formatContactWhen(contact.at)}
                </p>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground">
                    {contactChannelLabel(contact)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {contact.actionPlace ?? "Local não informado"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(contact.id)}
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                    isForm
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isForm ? "Validar envio" : "A confirmar"}
                </button>
              </div>
              {open ? (
                <div className="border-t border-border-subtle bg-background/40 px-3.5 py-3 text-[11px] text-muted-foreground">
                  <p>
                    Página:{" "}
                    <span className="font-mono text-foreground">
                      {contact.path}
                    </span>
                  </p>
                  <p className="mt-1">
                    Termo registrado na UTM:{" "}
                    <span className="text-foreground">
                      {contact.utmTermLabel}
                    </span>
                  </p>
                  <ul className="mt-2 space-y-0.5 font-mono text-[10px]">
                    {contact.attribution.map(([key, value]) => (
                      <li key={key}>
                        {key}={value}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-muted-foreground">
        As ações estão associadas a identificadores diferentes de visitas. Isso
        não confirma cinco leads qualificados.
      </p>
    </div>
  );
}

function DataTab({
  view,
  alignPeriodHref,
}: {
  view: CampaignAnalysisView;
  alignPeriodHref: string | null;
}) {
  const ads = view.sourceComparison.googleAds;
  const site = view.sourceComparison.site;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <p className="text-[12px] font-medium text-foreground">
            Google Ads · relatórios recebidos
          </p>
          {ads ? (
            <dl className="mt-3 space-y-1.5 text-[12px] text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Período</dt>
                <dd className="text-foreground">{ads.periodLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Investimento da campanha</dt>
                <dd className="font-mono text-foreground">{ads.spend}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Cliques / impressões</dt>
                <dd className="font-mono text-foreground">
                  {ads.clicks} / {ads.impressions}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>CTR</dt>
                <dd className="font-mono text-foreground">{ads.ctr}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Conversões no relatório</dt>
                <dd className="font-mono text-foreground">{ads.conversions}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-[12px] text-muted-foreground">
              Nenhum relatório importado.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <p className="text-[12px] font-medium text-foreground">
            Site · rastreador próprio
          </p>
          {site ? (
            <dl className="mt-3 space-y-1.5 text-[12px] text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Período exibido</dt>
                <dd className="text-foreground">{site.periodLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Visitas</dt>
                <dd className="font-mono text-foreground">{site.visits}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Ações de contato</dt>
                <dd className="font-mono text-foreground">
                  {site.contactActions}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Datas das ações</dt>
                <dd className="text-foreground">{site.actionDates}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Data do clique de origem</dt>
                <dd className="text-foreground">{site.clickDate}</dd>
              </div>
            </dl>
          ) : null}
        </section>
      </div>

      {!view.periodAligned && alignPeriodHref ? (
        <a
          href={alignPeriodHref}
          className="inline-flex rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground transition hover:bg-surface-elevated"
        >
          Usar período do relatório
        </a>
      ) : null}

      <section className="rounded-xl border border-border bg-surface px-3.5 py-3">
        <p className="text-[12px] font-medium text-foreground">
          Validações antes de comparar
        </p>
        {view.validations.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted-foreground">
            Nenhuma divergência encontrada neste recorte.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {view.validations.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border-subtle border-l-4 border-l-amber-500/60 bg-background/40 px-3 py-2.5"
              >
                <p className="text-[13px] font-medium text-foreground">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {view.imports.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            Arquivos recebidos
          </p>
          <ul className="mt-2 divide-y divide-border-subtle text-[12px]">
            {view.imports.map((item) => (
              <li key={item.id} className="py-2">
                <p className="font-medium">{item.fileName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {REPORT_TYPE_LABEL[item.reportType] ?? item.reportType} ·{" "}
                  {item.periodLabel}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
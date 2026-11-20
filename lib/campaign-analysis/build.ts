import {
  keywordsFromImport,
  normalizeKeyword,
} from "@/lib/campaign-analysis/parse-google-ads-csv";
import type {
  CampaignAnalysisKpi,
  CampaignAnalysisView,
  CampaignReading,
  ContactActionRow,
  GoogleAdsReportType,
  ImportSummary,
  KeywordAnalysisRow,
  KeywordSituation,
  MeasuredMetric,
  ParsedGoogleAdsImport,
  SourceComparison,
  ValidationItem,
} from "@/lib/campaign-analysis/types";
import {
  formatCurrencyDetailed,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import { formatRangeLabel, type TrackingWindow } from "@/lib/report-period";
import type { SiteTrackingAnalytics } from "@/lib/tracking-analytics-shared";

type StoredImport = {
  id: string;
  fileName: string;
  reportType: GoogleAdsReportType;
  periodFrom: string | null;
  periodTo: string | null;
  campaignName: string;
  parsed: ParsedGoogleAdsImport;
  createdAt: Date;
};

function situationLabel(situation: KeywordSituation) {
  switch (situation) {
    case "validated":
      return "Validada";
    case "text":
      return "Por texto";
    case "review":
      return "Revisar vínculo";
    case "no_tracker":
      return "Sem rastreador";
  }
}

function windowsAligned(
  tracking: TrackingWindow,
  report: TrackingWindow | null,
) {
  if (!report) return true;
  return tracking.from === report.from && tracking.to === report.to;
}

function pickSpendImports(imports: StoredImport[]) {
  const keyword = imports.find((item) => item.reportType === "keyword");
  const campaign = imports.find((item) => item.reportType === "campaign");
  const ad = imports.find((item) => item.reportType === "ad");
  return { keyword, campaign, ad };
}

function reportWindow(imports: StoredImport[]): TrackingWindow | null {
  const dates = imports
    .flatMap((item) => [item.periodFrom, item.periodTo])
    .filter((value): value is string => Boolean(value));
  if (dates.length === 0) return null;
  const sorted = [...dates].sort();
  return { from: sorted[0]!, to: sorted[sorted.length - 1]! };
}

function filterCampaignRows(
  rows: ParsedGoogleAdsImport["rows"],
  campaign: string,
) {
  const needle = normalizeKeyword(campaign);
  if (!needle) return rows;
  return rows.filter((row) =>
    row.campaign
      ? normalizeKeyword(row.campaign) === needle ||
        normalizeKeyword(row.campaign).includes(needle)
      : true,
  );
}

function campaignSpendTotal(
  imports: StoredImport[],
  campaign: string,
): number | null {
  const { keyword, campaign: campaignImport, ad } = pickSpendImports(imports);

  if (campaignImport) {
    const rows = filterCampaignRows(campaignImport.parsed.rows, campaign);
    if (rows.length > 0) {
      return rows.reduce((sum, row) => sum + row.spend, 0);
    }
    return campaignImport.parsed.totals.spend;
  }

  if (keyword) {
    const rows = filterCampaignRows(keyword.parsed.rows, campaign);
    if (rows.length > 0) {
      return rows.reduce((sum, row) => sum + row.spend, 0);
    }
  }

  if (ad) return ad.parsed.totals.spend;
  return null;
}

function mediaFromImports(imports: StoredImport[], campaign: string) {
  const { keyword, campaign: campaignImport, ad } = pickSpendImports(imports);
  const source = campaignImport ?? keyword ?? ad;
  if (!source) {
    return {
      clicks: null,
      impressions: null,
      ctr: null,
      cpc: null,
      adsConversions: null,
    };
  }

  const rows = filterCampaignRows(source.parsed.rows, campaign);
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const spend = rows.reduce((sum, row) => sum + row.spend, 0);
  const adsConversions = rows.reduce((sum, row) => sum + row.conversions, 0);
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : null;
  const cpc = clicks > 0 ? spend / clicks : null;
  return { clicks, impressions, ctr, cpc, adsConversions };
}

function siteActionsByTerm(
  tracking: SiteTrackingAnalytics | null,
  campaign: string,
) {
  const map = new Map<string, number>();
  if (!tracking?.ready) return map;
  const needle = normalizeKeyword(campaign);
  for (const row of tracking.byPlatform.google.attribution) {
    if (normalizeKeyword(row.campaign) !== needle) continue;
    const term = normalizeKeyword(row.term ?? "");
    if (!term) continue;
    map.set(term, (map.get(term) ?? 0) + (row.conversions ?? 0));
  }
  return map;
}

function trackedVisits(
  tracking: SiteTrackingAnalytics | null,
  campaign: string,
) {
  if (!tracking?.ready) return null;
  const needle = normalizeKeyword(campaign);
  return tracking.byPlatform.google.attribution
    .filter((row) => normalizeKeyword(row.campaign) === needle)
    .reduce((sum, row) => sum + row.pageviews, 0);
}

function contactActionCount(
  tracking: SiteTrackingAnalytics | null,
  campaign: string,
  contactActions: ContactActionRow[],
) {
  if (contactActions.length > 0) return contactActions.length;
  if (!tracking?.ready) return null;
  const needle = normalizeKeyword(campaign);
  return tracking.byPlatform.google.attribution
    .filter((row) => normalizeKeyword(row.campaign) === needle)
    .reduce((sum, row) => sum + (row.conversions ?? 0), 0);
}

function countByKind(contacts: ContactActionRow[], kind: ContactActionRow["kind"]) {
  return contacts.filter((item) => item.kind === kind).length;
}

function uniqueVisitors(contacts: ContactActionRow[]) {
  const ids = new Set(
    contacts
      .map((item) => item.attribution.find(([key]) => key === "visitorId")?.[1])
      .filter(Boolean),
  );
  if (ids.size > 0) return ids.size;
  return contacts.length > 0 ? contacts.length : null;
}

function actionDateLabel(contacts: ContactActionRow[]) {
  if (contacts.length === 0) return null;
  const days = contacts
    .map((item) => item.at.slice(0, 10))
    .filter(Boolean)
    .sort();
  if (days.length === 0) return null;
  return formatRangeLabel(days[0]!, days[days.length - 1]!);
}

function buildKeywords(
  imports: StoredImport[],
  tracking: SiteTrackingAnalytics | null,
  campaign: string,
): KeywordAnalysisRow[] {
  const keywordImport = imports.find((item) => item.reportType === "keyword");
  const actionsByTerm = siteActionsByTerm(tracking, campaign);
  const keywordRows: KeywordAnalysisRow[] = [];

  if (keywordImport) {
    const rows = filterCampaignRows(keywordImport.parsed.rows, campaign);
    const grouped = keywordsFromImport(rows);

    for (const row of grouped) {
      const key = normalizeKeyword(row.keyword ?? "");
      const siteActions = actionsByTerm.get(key) ?? 0;
      let situation: KeywordSituation = "no_tracker";
      if (row.clicks === 0 && siteActions > 0) situation = "review";
      else if (siteActions > 0 && row.clicks > 0) situation = "text";
      else if (siteActions > 0) situation = "text";

      keywordRows.push({
        keyword: row.keyword ?? "—",
        matchType: row.matchType ?? "—",
        spend: row.spend,
        adClicks: row.clicks,
        siteActions: siteActions > 0 ? siteActions : row.clicks > 0 ? 0 : null,
        costPerAction:
          situation === "review" || siteActions === 0
            ? null
            : row.spend / siteActions,
        situation,
        situationLabel: situationLabel(situation),
      });
    }
  }

  for (const [term, count] of actionsByTerm) {
    if (count <= 0) continue;
    if (keywordRows.some((row) => normalizeKeyword(row.keyword) === term)) {
      continue;
    }
    keywordRows.push({
      keyword: term,
      matchType: "—",
      spend: 0,
      adClicks: 0,
      siteActions: count,
      costPerAction: null,
      situation: "review",
      situationLabel: situationLabel("review"),
    });
  }

  return keywordRows
    .filter((row) => (row.siteActions ?? 0) > 0 || row.situation === "review")
    .sort(
      (a, b) =>
        (b.siteActions ?? 0) - (a.siteActions ?? 0) || b.spend - a.spend,
    );
}

function spendCoverage(imports: StoredImport[], campaign: string) {
  const { keyword, campaign: campaignImport } = pickSpendImports(imports);
  if (!campaignImport || !keyword) return null;

  const campaignRows = filterCampaignRows(campaignImport.parsed.rows, campaign);
  const campaignTotal =
    campaignRows.reduce((sum, row) => sum + row.spend, 0) ||
    campaignImport.parsed.totals.spend;
  const campaignClicks =
    campaignRows.reduce((sum, row) => sum + row.clicks, 0) ||
    campaignImport.parsed.totals.clicks;

  const keywordRows = filterCampaignRows(keyword.parsed.rows, campaign).filter(
    (row) => {
      const status = (row.status ?? "").toLowerCase();
      return !status.includes("remov");
    },
  );
  const keywordTotal = keywordRows.reduce((sum, row) => sum + row.spend, 0);
  const keywordClicks = keywordRows.reduce((sum, row) => sum + row.clicks, 0);
  const unexplained = Math.max(0, campaignTotal - keywordTotal);
  if (unexplained <= 0.009) return null;
  return {
    campaignTotal,
    keywordTotal,
    unexplained,
    keywordClicks,
    campaignClicks,
  };
}

function buildReading(input: {
  contactCount: number | null;
  contacts: ContactActionRow[];
  adsConversions: number | null;
  keywords: KeywordAnalysisRow[];
  importsCount: number;
}): CampaignReading {
  const whatsapp = countByKind(input.contacts, "whatsapp");
  const form = countByKind(input.contacts, "form");
  const reviewKeyword = input.keywords.find((row) => row.situation === "review");

  if (input.importsCount === 0 && (input.contactCount ?? 0) === 0) {
    return {
      headline: "Importe um relatório para analisar custo e retorno.",
      summary:
        "Seu rastreador já mostra visitas e ações. Acrescente investimento do Google Ads para cruzar o resultado.",
      actions: [
        {
          id: "import",
          title: "Importar relatório do Google Ads",
          detail: "Aceita CSV de campanha ou palavras-chave, juntos ou separados.",
          actionLabel: "Importar relatório",
          actionTab: "overview",
        },
      ],
    };
  }

  const actions: CampaignReading["actions"] = [];

  if ((input.contactCount ?? 0) > 0) {
    actions.push({
      id: "confirm",
      title: "Confirmar o resultado dos contatos",
      detail: `${whatsapp} clique${whatsapp === 1 ? "" : "s"} no WhatsApp e ${form} evento${form === 1 ? "" : "s"} de formulário.`,
      actionLabel: "Ver os registros",
      actionTab: "contacts",
    });
  }

  if (
    input.adsConversions === 0 &&
    input.contactCount !== null &&
    input.contactCount > 0
  ) {
    actions.push({
      id: "measurement",
      title: "Conferir a medição entre as fontes",
      detail: `O Ads informa ${formatNumber(input.adsConversions)} conversões; o site informa ${formatNumber(input.contactCount)} ações.`,
      actionLabel: "Ver evidências",
      actionTab: "data",
    });
  }

  if (reviewKeyword) {
    actions.push({
      id: "keyword-review",
      title: "Revisar uma associação de palavra-chave",
      detail:
        "Há uma ação atribuída a uma palavra sem cliques no arquivo.",
      actionLabel: "Conferir palavra-chave",
      actionTab: "keywords",
    });
  }

  return {
    headline:
      (input.contactCount ?? 0) > 0
        ? "Há ações de contato. A confirmação comercial ainda está pendente."
        : "Ainda não há ações de contato no período.",
    summary:
      (input.contactCount ?? 0) > 0
        ? "O site registrou interesse. Confirme o que virou conversa ou orçamento antes de decidir sobre o investimento."
        : "Continue acompanhando o rastreador ou amplie o período da análise.",
    actions,
  };
}

function buildMeasured(input: {
  media: ReturnType<typeof mediaFromImports>;
  contacts: ContactActionRow[];
}): MeasuredMetric[] {
  const whatsapp = countByKind(input.contacts, "whatsapp");
  const form = countByKind(input.contacts, "form");
  const visitors = uniqueVisitors(input.contacts);
  const { clicks, impressions, ctr } = input.media;

  return [
    {
      id: "ads-clicks",
      label: "Cliques no Google Ads",
      value: clicks !== null ? formatNumber(clicks) : "—",
      hint:
        clicks !== null && impressions !== null && ctr !== null
          ? `${formatNumber(impressions)} impressões · CTR ${formatPercent(ctr, 2)}`
          : "Aguardando relatório",
    },
    {
      id: "whatsapp",
      label: "Cliques no WhatsApp",
      value: formatNumber(whatsapp),
      hint: "Conversa ainda não confirmada",
    },
    {
      id: "form",
      label: "Evento de formulário",
      value: formatNumber(form),
      hint: "Confirme se representa envio concluído",
    },
    {
      id: "visitors",
      label: "Visitantes com ação",
      value: visitors !== null ? formatNumber(visitors) : "—",
      hint: "Identificadores diferentes no rastreador",
    },
    {
      id: "revenue",
      label: "Receita e retorno",
      value: "—",
      hint: "Vendas ainda não foram informadas",
    },
  ];
}

function buildValidations(input: {
  spendCoverage: ReturnType<typeof spendCoverage>;
  periodAligned: boolean;
  trackingReady: boolean;
  reportRange: TrackingWindow | null;
  keywords: KeywordAnalysisRow[];
  contactCount: number | null;
  adsConversions: number | null;
}): ValidationItem[] {
  const items: ValidationItem[] = [];

  if (!input.periodAligned && input.reportRange) {
    items.push({
      id: "period",
      severity: "warning",
      title: "Mesmo intervalo e fuso horário",
      detail: `Recalcule as visitas do site para ${formatRangeLabel(input.reportRange.from, input.reportRange.to)} e confira o fuso horário usado na comparação.`,
    });
  }

  if (
    input.adsConversions === 0 &&
    input.contactCount !== null &&
    input.contactCount > 0
  ) {
    items.push({
      id: "definition",
      severity: "warning",
      title: "Mesma definição de resultado",
      detail:
        "O Ads informa conversões; o site informa ações de contato. Revise os critérios de atribuição em cada fonte.",
    });
  }

  if (input.spendCoverage) {
    items.push({
      id: "spend-gap",
      severity: "info",
      title: `${formatCurrencyDetailed(input.spendCoverage.unexplained)} sem detalhamento nas palavras listadas`,
      detail: `As palavras somam ${formatCurrencyDetailed(input.spendCoverage.keywordTotal)} e ${formatNumber(input.spendCoverage.keywordClicks)} cliques; o total da campanha é ${formatCurrencyDetailed(input.spendCoverage.campaignTotal)} e ${formatNumber(input.spendCoverage.campaignClicks)} cliques.`,
    });
  }

  const review = input.keywords.find((row) => row.situation === "review");
  if (review) {
    items.push({
      id: "keyword-review",
      severity: "warning",
      title: "Uma associação precisa ser revisada",
      detail: `O termo “${review.keyword}” tem ação no site e nenhum clique no arquivo. A causa ainda não foi identificada.`,
    });
  }

  if (!input.trackingReady) {
    items.push({
      id: "tracking-empty",
      severity: "warning",
      title: "Sem dados do rastreador no período",
      detail: "Instale o script ou amplie o período para cruzar visitas e ações.",
    });
  }

  return items;
}

function buildSourceComparison(input: {
  reportRange: TrackingWindow | null;
  trackingWindow: TrackingWindow;
  spend: number | null;
  media: ReturnType<typeof mediaFromImports>;
  visits: number | null;
  contactCount: number | null;
  actionDates: string | null;
}): SourceComparison {
  return {
    googleAds:
      input.spend !== null
        ? {
            periodLabel: input.reportRange
              ? formatRangeLabel(input.reportRange.from, input.reportRange.to)
              : "Período não identificado",
            spend: formatCurrencyDetailed(input.spend),
            clicks:
              input.media.clicks !== null
                ? formatNumber(input.media.clicks)
                : "—",
            impressions:
              input.media.impressions !== null
                ? formatNumber(input.media.impressions)
                : "—",
            ctr:
              input.media.ctr !== null
                ? formatPercent(input.media.ctr, 2)
                : "—",
            conversions:
              input.media.adsConversions !== null
                ? formatNumber(input.media.adsConversions)
                : "—",
          }
        : null,
    site: {
      periodLabel: formatRangeLabel(
        input.trackingWindow.from,
        input.trackingWindow.to,
      ),
      visits: input.visits !== null ? formatNumber(input.visits) : "—",
      contactActions:
        input.contactCount !== null ? formatNumber(input.contactCount) : "—",
      actionDates: input.actionDates ?? "Não informado",
      clickDate: "Não informada",
    },
  };
}

export function buildCampaignAnalysis(input: {
  demo: boolean;
  campaign: string;
  campaignOptions: string[];
  trackingWindow: TrackingWindow;
  tracking: SiteTrackingAnalytics | null;
  imports: StoredImport[];
  contacts: ContactActionRow[];
  updatedAt: Date | null;
}): CampaignAnalysisView {
  const reportRange = reportWindow(input.imports);
  const periodAligned = windowsAligned(input.trackingWindow, reportRange);
  const spend = campaignSpendTotal(input.imports, input.campaign);
  const visits = trackedVisits(input.tracking, input.campaign);
  const media = mediaFromImports(input.imports, input.campaign);
  const contactCount = contactActionCount(
    input.tracking,
    input.campaign,
    input.contacts,
  );
  const whatsapp = countByKind(input.contacts, "whatsapp");
  const form = countByKind(input.contacts, "form");
  const actionDates = actionDateLabel(input.contacts);

  const costPerAction =
    periodAligned && spend !== null && contactCount !== null && contactCount > 0
      ? spend / contactCount
      : null;

  const kpis: CampaignAnalysisKpi[] = [
    {
      id: "investment",
      label: "Investimento",
      value: spend !== null ? formatCurrencyDetailed(spend) : "—",
      hint:
        reportRange && spend !== null
          ? `Google Ads · ${formatRangeLabel(reportRange.from, reportRange.to)}`
          : spend !== null
            ? "Google Ads"
            : "Importe um relatório com gasto",
      state: spend !== null ? "measured" : "unavailable",
    },
    {
      id: "visits",
      label: "Visitas rastreadas",
      value: visits !== null ? formatNumber(visits) : "—",
      hint: `Site · ${formatRangeLabel(input.trackingWindow.from, input.trackingWindow.to)}`,
      state: visits !== null ? "measured" : "unavailable",
    },
    {
      id: "contact_actions",
      label: "Ações de contato",
      value: contactCount !== null ? formatNumber(contactCount) : "—",
      hint:
        contactCount !== null
          ? `Site · ${whatsapp} WhatsApp + ${form} formulário`
          : "Sem ações atribuíveis",
      state: contactCount !== null ? "measured" : "unavailable",
    },
    {
      id: "cost_per_action",
      label: "Custo por ação",
      value: costPerAction !== null ? formatCurrencyDetailed(costPerAction) : "—",
      hint: periodAligned
        ? costPerAction !== null
          ? "Gasto ÷ ações no mesmo período"
          : "Aguardando ações ou gasto compatível"
        : "Aguardando período e atribuição",
      state: costPerAction !== null ? "measured" : "pending",
    },
  ];

  const keywords = buildKeywords(input.imports, input.tracking, input.campaign);
  const coverage = spendCoverage(input.imports, input.campaign);

  const importSummaries: ImportSummary[] = input.imports.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    reportType: item.reportType,
    periodLabel:
      item.periodFrom && item.periodTo
        ? formatRangeLabel(item.periodFrom, item.periodTo)
        : "Período não identificado",
    importedAt: item.createdAt.toISOString(),
    campaignHint: item.campaignName,
  }));

  const googleAdsState =
    input.imports.length === 0
      ? "missing"
      : input.imports.some((item) => item.reportType === "unknown")
        ? "partial"
        : "ok";

  return {
    demo: input.demo,
    campaign: input.campaign,
    campaignOptions: input.campaignOptions,
    trackingWindow: input.trackingWindow,
    reportWindow: reportRange,
    periodAligned,
    actionDateLabel: actionDates,
    sources: {
      site: input.tracking?.ready ? "ok" : "empty",
      googleAds: googleAdsState,
      commercial: "missing",
    },
    sourceLabels: {
      site: reportRange
        ? `registros de ${formatRangeLabel(input.trackingWindow.from, input.trackingWindow.to)}`
        : "dados do rastreador",
      googleAds:
        reportRange
          ? `relatórios de ${formatRangeLabel(reportRange.from, reportRange.to)}`
          : input.imports.length > 0
            ? "relatório importado"
            : "ainda não importado",
      commercial: "ainda não informado",
    },
    kpis,
    mediaDetails: media,
    reading: buildReading({
      contactCount,
      contacts: input.contacts,
      adsConversions: media.adsConversions,
      keywords,
      importsCount: input.imports.length,
    }),
    measured: buildMeasured({ media, contacts: input.contacts }),
    keywords,
    contacts: input.contacts,
    validations: buildValidations({
      spendCoverage: coverage,
      periodAligned,
      trackingReady: Boolean(input.tracking?.ready),
      reportRange,
      keywords,
      contactCount,
      adsConversions: media.adsConversions,
    }),
    sourceComparison: buildSourceComparison({
      reportRange,
      trackingWindow: input.trackingWindow,
      spend,
      media,
      visits,
      contactCount,
      actionDates,
    }),
    imports: importSummaries,
    spendCoverage: coverage,
    updatedAt: input.updatedAt?.toISOString() ?? null,
  };
}
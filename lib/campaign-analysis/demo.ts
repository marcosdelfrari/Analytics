import { buildCampaignAnalysis } from "@/lib/campaign-analysis/build";
import type {
  CampaignAnalysisView,
  ContactActionRow,
  ParsedGoogleAdsImport,
} from "@/lib/campaign-analysis/types";
import type { TrackingWindow } from "@/lib/report-period";
import type { SiteTrackingAnalytics } from "@/lib/tracking-analytics-shared";

const DEMO_CAMPAIGN = "linha_estudantil";
const DEMO_REPORT_WINDOW: TrackingWindow = {
  from: "2026-11-14",
  to: "2026-11-19",
};
const DEMO_TRACKING_WINDOW: TrackingWindow = {
  from: "2026-10-20",
  to: "2026-11-19",
};

function demoKeywordImport(): ParsedGoogleAdsImport {
  const rows = [
    {
      campaign: DEMO_CAMPAIGN,
      keyword: "camisetas para formaturas",
      matchType: "Correspondência ampla",
      status: "Ativado",
      spend: 52.99,
      clicks: 9,
      impressions: 210,
      conversions: 0,
    },
    {
      campaign: DEMO_CAMPAIGN,
      keyword: "camisa de formatura",
      matchType: "Correspondência exata",
      status: "Ativado",
      spend: 105.74,
      clicks: 13,
      impressions: 320,
      conversions: 0,
    },
    {
      campaign: DEMO_CAMPAIGN,
      keyword: "uniforme escolar",
      matchType: "Correspondência de frase",
      status: "Ativado",
      spend: 114.97,
      clicks: 20,
      impressions: 236,
      conversions: 0,
    },
  ];
  return {
    reportType: "keyword",
    fileName: "palavras-chave-demo.csv",
    currency: "BRL",
    periodFrom: DEMO_REPORT_WINDOW.from,
    periodTo: DEMO_REPORT_WINDOW.to,
    campaignNames: [DEMO_CAMPAIGN],
    rows,
    totals: rows.reduce(
      (acc, row) => ({
        spend: acc.spend + row.spend,
        clicks: acc.clicks + row.clicks,
        impressions: acc.impressions + row.impressions,
        conversions: acc.conversions + row.conversions,
      }),
      { spend: 0, clicks: 0, impressions: 0, conversions: 0 },
    ),
  };
}

function demoCampaignImport(): ParsedGoogleAdsImport {
  return {
    reportType: "campaign",
    fileName: "campanha-demo.csv",
    currency: "BRL",
    periodFrom: DEMO_REPORT_WINDOW.from,
    periodTo: DEMO_REPORT_WINDOW.to,
    campaignNames: [DEMO_CAMPAIGN],
    rows: [
      {
        campaign: DEMO_CAMPAIGN,
        spend: 287.96,
        clicks: 43,
        impressions: 766,
        conversions: 0,
      },
    ],
    totals: {
      spend: 287.96,
      clicks: 43,
      impressions: 766,
      conversions: 0,
    },
  };
}

function demoTracking(): SiteTrackingAnalytics {
  return {
    ready: true,
    period: "20/10 a 19/11",
    range: DEMO_TRACKING_WINDOW,
    totals: {
      pageviews: 47,
      events: 9,
      visitors: 41,
      conversions: 5,
      conversionRate: 10.6,
      eventRate: 10.6,
      eventsPerVisit: 0.19,
    },
    topEvent: { name: "contato", count: 5, share: 55.5 },
    points: [],
    eventsByName: [{ name: "contato", count: 5 }],
    eventShare: [],
    eventPlatformMix: [],
    eventTrend: { names: [], points: [] },
    byPath: [],
    byPathFlow: [],
    byDevice: [],
    byBrowser: [],
    byAttribution: [],
    byPlatform: {
      google: {
        attribution: [
          {
            source: "google",
            medium: "cpc",
            campaign: DEMO_CAMPAIGN,
            term: "camisetas para formaturas",
            pageviews: 18,
            events: 3,
            conversions: 2,
          },
          {
            source: "google",
            medium: "cpc",
            campaign: DEMO_CAMPAIGN,
            term: "camisa de formatura",
            pageviews: 14,
            events: 2,
            conversions: 1,
          },
          {
            source: "google",
            medium: "cpc",
            campaign: DEMO_CAMPAIGN,
            term: "camisa formatura personalizada",
            pageviews: 6,
            events: 1,
            conversions: 1,
          },
          {
            source: "google",
            medium: "cpc",
            campaign: DEMO_CAMPAIGN,
            term: "uniforme escolar",
            pageviews: 9,
            events: 1,
            conversions: 0,
          },
        ],
        eventsByName: [{ name: "contato", count: 5 }],
      },
      meta: { attribution: [], eventsByName: [] },
      other: { attribution: [], eventsByName: [] },
      none: { attribution: [], eventsByName: [] },
    },
  };
}

const demoContacts: ContactActionRow[] = [
  {
    id: "demo-1",
    kind: "whatsapp",
    title: "WhatsApp · Camisa Polo",
    at: "2026-11-19T17:20:00.000Z",
    path: "/linha-estudantil/camisa-polo",
    product: "Camisa Polo",
    actionPlace: "Card do produto",
    campaign: DEMO_CAMPAIGN,
    utmTermLabel: "camisetas para formaturas",
    commercialOutcome: "pending",
    attribution: [
      ["utm_campaign", DEMO_CAMPAIGN],
      ["utm_term", "camisetas para formaturas"],
    ],
  },
  {
    id: "demo-2",
    kind: "whatsapp",
    title: "WhatsApp · Produto não informado",
    at: "2026-11-19T12:30:00.000Z",
    path: "/linha-estudantil",
    actionPlace: "Posição do botão não informada",
    campaign: DEMO_CAMPAIGN,
    utmTermLabel: "camisetas para formaturas",
    commercialOutcome: "pending",
    attribution: [
      ["utm_campaign", DEMO_CAMPAIGN],
      ["utm_term", "camisetas para formaturas"],
    ],
  },
  {
    id: "demo-3",
    kind: "whatsapp",
    title: "WhatsApp · Camiseta Casual",
    at: "2026-11-18T15:34:00.000Z",
    path: "/linha-estudantil/camiseta-casual",
    product: "Camiseta Casual",
    actionPlace: "Detalhe do produto (lightbox)",
    campaign: DEMO_CAMPAIGN,
    utmTermLabel: "camisa de formatura",
    commercialOutcome: "pending",
    attribution: [
      ["utm_campaign", DEMO_CAMPAIGN],
      ["utm_term", "camisa de formatura"],
    ],
  },
  {
    id: "demo-4",
    kind: "whatsapp",
    title: "WhatsApp · Agasalho Careca",
    at: "2026-11-18T07:56:00.000Z",
    path: "/linha-estudantil/agasalho-careca",
    product: "Agasalho Careca",
    actionPlace: "Card do produto",
    campaign: DEMO_CAMPAIGN,
    utmTermLabel: "camisa de formatura",
    commercialOutcome: "pending",
    attribution: [
      ["utm_campaign", DEMO_CAMPAIGN],
      ["utm_term", "camisa de formatura"],
    ],
  },
  {
    id: "demo-5",
    kind: "form",
    title: "Formulário · Página inicial",
    at: "2026-11-18T00:22:00.000Z",
    path: "/",
    actionPlace: "Evento com origem=formulario",
    campaign: DEMO_CAMPAIGN,
    utmTermLabel: "camisa formatura personalizada",
    commercialOutcome: "pending",
    attribution: [
      ["utm_campaign", DEMO_CAMPAIGN],
      ["utm_term", "camisa formatura personalizada"],
    ],
  },
];

export function getDemoCampaignAnalysis(
  campaign = DEMO_CAMPAIGN,
): CampaignAnalysisView {
  const keyword = demoKeywordImport();
  const campaignImport = demoCampaignImport();
  const imports = [
    {
      id: "demo-keyword",
      fileName: keyword.fileName,
      reportType: keyword.reportType,
      periodFrom: keyword.periodFrom,
      periodTo: keyword.periodTo,
      campaignName: DEMO_CAMPAIGN,
      parsed: keyword,
      createdAt: new Date("2026-11-19T12:00:00.000Z"),
    },
    {
      id: "demo-campaign",
      fileName: campaignImport.fileName,
      reportType: campaignImport.reportType,
      periodFrom: campaignImport.periodFrom,
      periodTo: campaignImport.periodTo,
      campaignName: DEMO_CAMPAIGN,
      parsed: campaignImport,
      createdAt: new Date("2026-11-19T12:05:00.000Z"),
    },
  ];

  return buildCampaignAnalysis({
    demo: true,
    campaign,
    campaignOptions: [DEMO_CAMPAIGN],
    trackingWindow: DEMO_TRACKING_WINDOW,
    tracking: demoTracking(),
    imports,
    contacts: demoContacts,
    updatedAt: new Date("2026-11-19T12:05:00.000Z"),
  });
}
import type {
  CampaignTreeNode,
  EvolutionPoint,
  PlatformSummary,
  PublishedReport,
} from "@/lib/types";

const demoPeriod = "Outubro 2026";

function demoReports(clientId: string): PublishedReport[] {
  const publishedAt = "2026-10-01T12:00:00.000Z";
  return [
    {
      id: "demo-google-out-2026",
      clientId,
      platform: "google",
      period: demoPeriod,
      spend: 27_840,
      spendChange: 12.4,
      impressions: 412_000,
      clicks: 14_280,
      conversions: 742,
      activeCampaigns: 4,
      totalCampaigns: 6,
      notes: "Demonstração",
      fileName: "google-ads-out-2026.pdf",
      storedFile: null,
      publishedAt,
    },
    {
      id: "demo-meta-out-2026",
      clientId,
      platform: "meta",
      period: demoPeriod,
      spend: 20_480,
      spendChange: 8.1,
      impressions: 286_500,
      clicks: 9_640,
      conversions: 542,
      activeCampaigns: 3,
      totalCampaigns: 5,
      notes: "Demonstração",
      fileName: "meta-ads-out-2026.pdf",
      storedFile: null,
      publishedAt,
    },
    {
      id: "demo-google-set-2026",
      clientId,
      platform: "google",
      period: "Setembro 2026",
      spend: 24_760,
      spendChange: 5.2,
      impressions: 388_000,
      clicks: 13_100,
      conversions: 698,
      activeCampaigns: 4,
      totalCampaigns: 6,
      notes: "Demonstração",
      fileName: "google-ads-set-2026.pdf",
      storedFile: null,
      publishedAt: "2026-09-01T12:00:00.000Z",
    },
  ];
}

function demoSummaries(): PlatformSummary[] {
  return [
    {
      platform: "google",
      label: "Google Ads",
      spend: 27_840,
      spendChange: 12.4,
      impressions: 412_000,
      clicks: 14_280,
      conversions: 742,
      activeCampaigns: 4,
      totalCampaigns: 6,
      period: demoPeriod,
    },
    {
      platform: "meta",
      label: "Meta Ads",
      spend: 20_480,
      spendChange: 8.1,
      impressions: 286_500,
      clicks: 9_640,
      conversions: 542,
      activeCampaigns: 3,
      totalCampaigns: 5,
      period: demoPeriod,
    },
  ];
}

export function getDemoDashboard(clientId: string) {
  const summaries = demoSummaries();
  const spend = summaries.reduce((total, item) => total + item.spend, 0);
  const impressions = summaries.reduce(
    (total, item) => total + item.impressions,
    0,
  );
  const clicks = summaries.reduce((total, item) => total + item.clicks, 0);
  const conversions = summaries.reduce(
    (total, item) => total + item.conversions,
    0,
  );

  return {
    reports: demoReports(clientId),
    summaries,
    period: demoPeriod,
    totals: {
      spend,
      impressions,
      clicks,
      conversions,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      costPerConversion: conversions > 0 ? spend / conversions : 0,
    },
  };
}

export function getDemoEvolution(): EvolutionPoint[] {
  return [
    { label: "Mai", spend: 38_200, conversions: 892 },
    { label: "Jun", spend: 41_600, conversions: 968 },
    { label: "Jul", spend: 39_800, conversions: 940 },
    { label: "Ago", spend: 44_100, conversions: 1_018 },
    { label: "Set", spend: 45_240, conversions: 1_240 },
    { label: "Out", spend: 48_320, conversions: 1_284 },
  ];
}

export function getDemoCampaignTree(): CampaignTreeNode[] {
  return [
    {
      id: "g-search-brand",
      name: "Marca · Pesquisa",
      platform: "google",
      type: "Pesquisa",
      status: "ativa",
      spend: 12_480,
      impressions: 182_000,
      clicks: 6_420,
      conversions: 318,
      adGroups: [
        {
          id: "g-ag-brand-core",
          name: "Termos institucionais",
          status: "ativa",
          spend: 7_240,
          impressions: 98_400,
          clicks: 3_820,
          conversions: 192,
          ads: [
            {
              id: "g-ad-1",
              name: "Título · serviço principal",
              status: "ativa",
              spend: 3_980,
              impressions: 52_100,
              clicks: 2_040,
              conversions: 104,
            },
            {
              id: "g-ad-2",
              name: "Título · prova social",
              status: "ativa",
              spend: 3_260,
              impressions: 46_300,
              clicks: 1_780,
              conversions: 88,
            },
          ],
        },
        {
          id: "g-ag-brand-comp",
          name: "Concorrentes",
          status: "aprendizado",
          spend: 5_240,
          impressions: 83_600,
          clicks: 2_600,
          conversions: 126,
          ads: [
            {
              id: "g-ad-3",
              name: "RSA · comparativo",
              status: "aprendizado",
              spend: 5_240,
              impressions: 83_600,
              clicks: 2_600,
              conversions: 126,
            },
          ],
        },
      ],
    },
    {
      id: "g-pmax-ret",
      name: "Performance Max · Varejo",
      platform: "google",
      type: "Performance Max",
      status: "ativa",
      spend: 15_360,
      impressions: 230_000,
      clicks: 7_860,
      conversions: 424,
      adGroups: [
        {
          id: "g-ag-pmax-all",
          name: "Grupo único PMax",
          status: "ativa",
          spend: 15_360,
          impressions: 230_000,
          clicks: 7_860,
          conversions: 424,
          ads: [
            {
              id: "g-ad-4",
              name: "Asset group · catálogo",
              status: "ativa",
              spend: 9_820,
              impressions: 148_000,
              clicks: 4_980,
              conversions: 268,
            },
            {
              id: "g-ad-5",
              name: "Asset group · promoções",
              status: "ativa",
              spend: 5_540,
              impressions: 82_000,
              clicks: 2_880,
              conversions: 156,
            },
          ],
        },
      ],
    },
    {
      id: "m-trafego",
      name: "Tráfego · Remarketing",
      platform: "meta",
      type: "Tráfego",
      status: "ativa",
      spend: 11_280,
      impressions: 164_000,
      clicks: 5_420,
      conversions: 286,
      adGroups: [
        {
          id: "m-ag-ret-7d",
          name: "Visitantes 7 dias",
          status: "ativa",
          spend: 6_640,
          impressions: 92_500,
          clicks: 3_180,
          conversions: 168,
          ads: [
            {
              id: "m-ad-1",
              name: "Carrossel · oferta",
              status: "ativa",
              spend: 3_920,
              impressions: 54_800,
              clicks: 1_860,
              conversions: 98,
            },
            {
              id: "m-ad-2",
              name: "Imagem · benefício",
              status: "ativa",
              spend: 2_720,
              impressions: 37_700,
              clicks: 1_320,
              conversions: 70,
            },
          ],
        },
        {
          id: "m-ag-ret-30d",
          name: "Visitantes 30 dias",
          status: "pausada",
          spend: 4_640,
          impressions: 71_500,
          clicks: 2_240,
          conversions: 118,
          ads: [
            {
              id: "m-ad-3",
              name: "Vídeo · depoimento",
              status: "pausada",
              spend: 4_640,
              impressions: 71_500,
              clicks: 2_240,
              conversions: 118,
            },
          ],
        },
      ],
    },
    {
      id: "m-conversao",
      name: "Conversão · Leads",
      platform: "meta",
      type: "Conversão",
      status: "ativa",
      spend: 9_200,
      impressions: 122_500,
      clicks: 4_220,
      conversions: 256,
      adGroups: [
        {
          id: "m-ag-leads-form",
          name: "Formulário instantâneo",
          status: "ativa",
          spend: 9_200,
          impressions: 122_500,
          clicks: 4_220,
          conversions: 256,
          ads: [
            {
              id: "m-ad-4",
              name: "Criativo · formulário A",
              status: "ativa",
              spend: 5_100,
              impressions: 68_400,
              clicks: 2_340,
              conversions: 142,
            },
            {
              id: "m-ad-5",
              name: "Criativo · formulário B",
              status: "aprendizado",
              spend: 4_100,
              impressions: 54_100,
              clicks: 1_880,
              conversions: 114,
            },
          ],
        },
      ],
    },
  ];
}

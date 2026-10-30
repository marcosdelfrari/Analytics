export type SubscriptionPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
};

/** Número informado para contratação via WhatsApp. */
export const SALES_WHATSAPP_PATH = "31994369932";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Pro",
    price: "R$ 697",
    period: "/mês",
    description:
      "Tudo o que você precisa para rastrear campanhas, capturar leads atribuídos e analisar resultados com precisão.",
    features: [
      "Google Ads + Meta Ads no mesmo painel",
      "Script de rastreamento + verificador ao vivo",
      "Formulários de captura (WhatsApp, Popup e Saída)",
      "Leads atribuídos por UTM + exportação CSV",
      "Montador de parâmetros UTM e encurtador de links",
      "Histórico de dados e relatórios em CSV/PDF",
    ],
    highlighted: true,
  },
  {
    name: "Agency",
    price: "R$ 2.997",
    period: "/mês",
    description:
      "A estrutura completa e escalável para agências e grupos gerenciarem múltiplas empresas e equipes.",
    features: [
      "Tudo do plano Pro",
      "Gestão multi-organização e multi-empresa",
      "Papéis de Proprietário e Analista com fluxo visual",
      "Dashboards e formulários segregados por empresa",
      "Publicação de relatórios customizados (Planilha/PDF)",
      "Domínios de rastreio ilimitados",
    ],
    highlighted: false,
  },
];

export function whatsAppCheckoutUrl(planName: string) {
  const text = encodeURIComponent(
    `Olá! Gostaria de adquirir o plano ${planName} do Fractal.`,
  );
  return `https://wa.me/${SALES_WHATSAPP_PATH}?text=${text}`;
}

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
      "Tudo o que você precisa para rastrear e otimizar suas próprias campanhas com precisão total.",
    features: [
      "Google Ads + Meta Ads",
      "Dashboards de Performance",
      "Script de Rastreamento Real-time",
      "Montador de links de campanha",
      "Encurtador para WPP, SMS e e-mail",
      "Histórico de Dados Ilimitado",
    ],
    highlighted: true,
  },
  {
    name: "Agency",
    price: "R$ 2.997",
    period: "/mês",
    description:
      "A estrutura completa e escalável para agências gerenciarem o resultado de múltiplos clientes.",
    features: [
      "Tudo do plano Pro",
      "Painel de Gestão Multi-Cliente",
      "Dashboards Individuais e Segregados",
      "Publicação de Relatórios Customizados",
      "Domínios de Rastreio Ilimitados",
      "Controle de Acessos por Cliente",
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

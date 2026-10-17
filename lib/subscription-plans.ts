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
    name: "Starter",
    price: "R$ 397",
    period: "/mês",
    description: "Para acompanhar um canal e o tráfego que ele gera no site.",
    features: [
      "Google Ads ou Meta Ads",
      "Histórico de períodos",
      "Script de rastreamento",
      "Tráfego e eventos do canal",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 897",
    period: "/mês",
    description: "Para ver os dois canais e os eventos de cada parâmetro.",
    features: [
      "Google Ads + Meta Ads",
      "Dashboards dos dados",
      "Parâmetros e links",
      "Tráfego e eventos por parâmetro",
      "Consultoria mensal",
      "Suporte via WhatsApp",
    ],
    highlighted: true,
  },
  {
    name: "Advanced",
    price: "R$ 1.497",
    period: "/mês",
    description:
      "Para quem quer acompanhamento mais próximo e orientação para melhorar os resultados.",
    features: [
      "Google Ads + Meta Ads",
      "Dashboards dos dados",
      "Parâmetros e links",
      "Tráfego e eventos por parâmetro",
      "Suporte via WhatsApp",
      "Consultoria semanal",
      "Dicas de melhorias de performance",
    ],
    highlighted: false,
  },
];

export function whatsAppCheckoutUrl(planName: string) {
  const text = encodeURIComponent(
    `Olá! Gostaria de adquirir o plano ${planName} do Lótus Analytics.`,
  );
  return `https://wa.me/${SALES_WHATSAPP_PATH}?text=${text}`;
}

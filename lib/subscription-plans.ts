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
      "A estrutura completa para rastrear campanhas no seu domínio, capturar leads atribuídos e cruzar tráfego com investimento.",
    features: [
      "Google Ads + Meta Ads no mesmo painel",
      "Script próprio + validador ao vivo e suporte a SPA",
      "Formulários nativos (WhatsApp, Popup, Saída e Seção)",
      "Leads com UTM e página de entrada + exportação CSV",
      "Montador de parâmetros UTM e encurtador de links",
      "Jornada por páginas, eventos, acessos da equipe e relatórios CSV/PDF",
    ],
    highlighted: true,
  },
];

export function whatsAppCheckoutUrl(planName: string) {
  const text = encodeURIComponent(
    `Olá! Gostaria de adquirir o plano ${planName} do Fractal.`,
  );
  return `https://wa.me/${SALES_WHATSAPP_PATH}?text=${text}`;
}

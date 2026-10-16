import Link from "next/link";
import { SectionShell } from "@/app/components/lotus/section-shell";

const plans = [
  {
    name: "Starter",
    price: "R$ 497",
    period: "/mês",
    description: "Para marcas que começam a centralizar relatórios.",
    features: [
      "1 cliente no portal",
      "Google Ads ou Meta Ads",
      "Histórico de períodos",
      "Suporte por e-mail",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 997",
    period: "/mês",
    description: "O mais escolhido por agências e times de growth.",
    features: [
      "Até 5 clientes",
      "Google Ads + Meta Ads",
      "Publicação de relatórios",
      "Encurtador e parâmetros",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "Advanced",
    price: "R$ 1.497",
    period: "/mês",
    description: "Operação completa com escala e onboarding dedicado.",
    features: [
      "Clientes ilimitados",
      "Todas as integrações",
      "Admin multi-usuário",
      "SLA e treinamento",
      "Customizações sob consulta",
    ],
    highlighted: false,
  },
];

export function LotusPricing() {
  return (
    <SectionShell
      id="pricing"
      title="Preços"
      subtitle="Por que contratar — e como o Lótus ajuda sua operação a ganhar tempo e confiança."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`relative flex flex-col rounded-xl border p-6 ${
              plan.highlighted
                ? "border-foreground/30 bg-surface-elevated shadow-lg shadow-black/30"
                : "border-border bg-surface"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-0.5 text-[11px] font-medium text-background">
                Mais popular
              </span>
            )}
            <h3 className="text-lg font-medium">{plan.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">
                {plan.price}
              </span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </p>
            <Link
              href="/login"
              className={`mt-6 block rounded-md px-4 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${
                plan.highlighted
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground hover:bg-surface-elevated"
              }`}
            >
              Começar agora
            </Link>
            <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-border-subtle pt-6 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-foreground" aria-hidden>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

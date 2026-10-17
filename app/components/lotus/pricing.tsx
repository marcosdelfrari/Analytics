import { Reveal, RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

import { subscriptionPlans as plans } from "@/lib/subscription-plans";

export function LotusPricing() {
  return (
    <SectionShell
      id="pricing"
      title="Escolha o plano ideal para acompanhar seu negócio."
      subtitle="Compare os recursos e limites de cada opção. Você pode criar sua conta gratuitamente e contratar seu plano dentro da plataforma."
    >
      <Reveal className="mb-8 text-center text-sm text-muted-foreground">
        O cadastro é gratuito. Para utilizar os recursos, é necessário assinar
        um plano.
      </Reveal>
      <RevealGroup className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <RevealItem
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
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground lg:min-h-[4.5rem]">
              {plan.description}
            </p>
            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight">
                {plan.price}
              </span>
              <span className="text-sm text-muted-foreground">
                {plan.period}
              </span>
            </p>
            <a
              href="/api/auth/google"
              className={`mt-6 block rounded-md px-4 py-2.5 text-center text-sm font-medium transition-opacity hover:opacity-90 ${
                plan.highlighted
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground hover:bg-surface-elevated"
              }`}
            >
              Começar agora
            </a>
            <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-border-subtle pt-6 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-foreground" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="mt-8 text-center text-sm text-muted-foreground">
        Após o cadastro, você poderá escolher e contratar seu plano no ambiente
        da plataforma.
      </Reveal>
    </SectionShell>
  );
}

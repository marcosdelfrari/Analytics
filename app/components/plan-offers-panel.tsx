import {
  subscriptionPlans,
  whatsAppCheckoutUrl,
} from "@/lib/subscription-plans";

export function PlanOffersPanel({ onClose }: { onClose?: () => void }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col text-left">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
        >
          <span aria-hidden className="text-lg leading-none">
            ×
          </span>
        </button>
      )}
      <p className="pr-8 text-[11px] uppercase tracking-wider text-muted">
        Planos
      </p>
      <h2 id="plan-offers-title" className="mt-1 text-base font-medium">
        Escolha o plano para o seu negócio
      </h2>
      <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
        Toque em adquirir para falar com a equipe no WhatsApp e concluir a
        contratação.
      </p>
      <ul className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto lg:grid lg:grid-cols-3 lg:overflow-visible">
        {subscriptionPlans.map((plan) => (
          <li
            key={plan.name}
            className={`flex w-full min-w-0 flex-col rounded-lg border p-4 ${
              plan.highlighted
                ? "border-foreground/40 bg-surface-elevated lg:-translate-y-1"
                : "border-border bg-background/40"
            }`}
          >
            {plan.highlighted && (
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Mais popular
              </p>
            )}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium">{plan.name}</h3>
                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <p className="font-mono text-sm">
                {plan.price}
                <span className="text-[11px] text-muted-foreground">
                  {plan.period}
                </span>
              </p>
            </div>
            <ul className="mt-3 flex-1 space-y-1 text-[11px] text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
            <a
              href={whatsAppCheckoutUrl(plan.name)}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 flex w-full justify-center rounded-md px-4 py-2.5 text-[12px] font-medium transition-opacity hover:opacity-90 ${
                plan.highlighted
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground hover:bg-surface-elevated"
              }`}
            >
              Adquirir plano
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

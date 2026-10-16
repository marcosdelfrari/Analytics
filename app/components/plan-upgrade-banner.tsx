import Link from "next/link";

export function PlanUpgradeBanner() {
  return (
    <section className="border border-positive/30 bg-positive/10 px-5 py-5 sm:px-6">
      <p className="text-[11px] uppercase tracking-wider text-positive">Plano gratuito</p>
      <h2 className="mt-2 text-lg font-medium tracking-tight">
        Contrate um plano para liberar seus dados reais
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Sua conta já está criada. Enquanto isso, você navega pelo portal com
        exemplos bloqueados. Assim que o plano estiver ativo, Google Ads e Meta
        Ads publicados pela equipe aparecem aqui automaticamente.
      </p>
      <Link
        href="/#pricing"
        className="mt-4 inline-flex rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
      >
        Ver planos
      </Link>
    </section>
  );
}

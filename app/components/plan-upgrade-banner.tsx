import Link from "next/link";

export function PlanUpgradeBanner() {
  return (
    <section className="border border-border bg-surface px-5 py-5 sm:px-6">
      <p className="text-[11px] uppercase tracking-wider text-muted">
        Nenhum plano ativo
      </p>
      <h2 className="mt-2 text-lg font-medium tracking-tight">
        Sua conta está criada. Escolha um plano para começar.
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Você já pode conhecer a estrutura da plataforma pelos exemplos de telas
        disponíveis. Para utilizar os recursos, escolha e contrate um dos nossos
        planos.
      </p>
      <Link
        href="/#pricing"
        className="mt-4 inline-flex rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
      >
        Ver planos
      </Link>
      <p className="mt-3 text-[12px] text-muted">
        Os recursos serão liberados conforme o plano contratado.
      </p>
    </section>
  );
}

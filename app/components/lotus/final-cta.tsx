import { Reveal } from "@/app/components/lotus/motion";

export function LotusFinalCta() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="rounded-2xl border border-border bg-gradient-to-br from-surface-elevated via-surface to-background px-6 py-14 text-center sm:px-12 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tenha clareza sobre o marketing que você paga.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            Crie sua conta gratuitamente, conheça como o painel funciona e
            escolha o plano ideal para acompanhar seu negócio.
          </p>
          <a
            href="/api/auth/google"
            className="mt-8 inline-flex rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Começar agora
          </a>
          <p className="mt-4 text-[13px] text-muted">
            Cadastro gratuito. Uso dos recursos mediante assinatura.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

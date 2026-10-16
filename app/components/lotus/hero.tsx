import { HeroPreview } from "@/app/components/lotus/hero-preview";

export function LotusHero() {
  return (
    <section className="px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-5">
        <div className="order-1 lg:col-start-1">
          <p className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground">
            Para quem investe em marketing e mídia paga
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Acompanhe o resultado do marketing que você contratou.
          </h1>
        </div>

        <div className="relative order-2 lg:col-start-2 lg:row-span-4 lg:row-start-1">
          <div
            className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-surface-elevated via-transparent to-border/40 blur-2xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40">
            <div className="hidden items-center gap-2 border-b border-border px-4 py-3 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="ml-2 text-[11px] text-muted">lótus — dashboard</span>
            </div>
            <HeroPreview />
          </div>
          <p className="mt-3 text-center text-[12px] text-muted">
            Prévia da plataforma com dados ilustrativos.
          </p>
        </div>

        <p className="order-3 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:col-start-1">
          Veja Google Ads e Meta Ads em um painel organizado e entenda o que
          seus anúncios estão gerando. Menos dependência de planilhas soltas e
          mais clareza para avaliar o trabalho que você paga.
        </p>

        <div className="order-4 flex flex-wrap items-center gap-3 lg:col-start-1">
          <a
            href="/api/auth/google"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Começar agora
          </a>
          <a
            href="#how-it-works"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Como funciona
          </a>
        </div>
        <p className="order-5 max-w-xl text-[13px] leading-6 text-muted lg:col-start-1">
          Cadastro gratuito para conhecer o ambiente. Recursos liberados
          mediante assinatura de um plano.
        </p>
      </div>
    </section>
  );
}

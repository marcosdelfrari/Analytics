import { Reveal, RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

const steps = [
  {
    step: "01",
    title: "Crie sua conta grátis",
    text: "Faça seu cadastro e acesse o ambiente inicial da plataforma, sem precisar contratar um plano nessa etapa.",
  },
  {
    step: "02",
    title: "Veja exemplos das telas",
    text: "Conheça a estrutura da aplicação por meio de exemplos. As funcionalidades permanecem bloqueadas até a contratação de um plano.",
  },
  {
    step: "03",
    title: "Escolha seu plano",
    text: "Compare as opções disponíveis e assine o plano que atende ao seu negócio para liberar os recursos incluídos.",
  },
];

export function LotusHowItWorks() {
  return (
    <SectionShell
      id="how-it-works"
      title="Conheça o ambiente antes de escolher seu plano."
      subtitle="Crie sua conta gratuitamente, veja como a plataforma está organizada e contrate um plano para começar a utilizar os recursos."
    >
      <RevealGroup className="grid gap-4 md:grid-cols-3">
        {steps.map((item) => (
          <RevealItem
            key={item.step}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <span className="font-mono text-xs text-muted">{item.step}</span>
            <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.text}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="mt-8 text-center">
        <a
          href="/api/auth/google"
          className="inline-flex rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Começar agora
        </a>
      </Reveal>
    </SectionShell>
  );
}

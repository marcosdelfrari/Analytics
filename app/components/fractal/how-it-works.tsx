import { Reveal, RevealGroup, RevealItem } from "@/app/components/fractal/motion";
import { SectionShell } from "@/app/components/fractal/section-shell";

const steps = [
  {
    step: "01",
    title: "Conecte e identifique cada campanha",
    text: "Crie sua conta e monte os links das campanhas no painel para saber de onde vem cada centavo investido nos anúncios.",
  },
  {
    step: "02",
    title: "Rastreie em tempo real",
    text: "Instale nosso script leve em seu site e veja as visitas e eventos serem vinculados automaticamente às suas campanhas.",
  },
  {
    step: "03",
    title: "Analise e otimize",
    text: "Acesse dashboards profissionais que cruzam gastos de mídia com resultados reais, permitindo decisões baseadas em dados.",
  },
];

export function FractalHowItWorks() {
  return (
    <SectionShell
      id="how-it-works"
      title="O caminho para uma análise profissional."
      subtitle="Do primeiro clique à conversão final, tenha o controle total da sua jornada de marketing em três etapas simples."
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
          Criar meu Dashboard Grátis
        </a>
      </Reveal>
    </SectionShell>
  );
}

import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/app/components/fractal/motion";
import { SectionShell } from "@/app/components/fractal/section-shell";

const steps = [
  {
    step: "01",
    title: "Padronize links e campanhas",
    text: "Use o montador de parâmetros UTM e o encurtador integrado para identificar a origem de cada clique no Google, Meta, WhatsApp ou bio.",
  },
  {
    step: "02",
    title: "Instale o script e os formulários",
    text: "Cole o snippet no site, valide a tag no testador ao vivo e ative formulários de captura (botão WhatsApp, popup, intenção de saída ou corpo em seção).",
  },
  {
    step: "03",
    title: "Analise, compartilhe e exporte",
    text: "Cruze o investimento publicado com visitas, eventos e leads capturados. Liberar acesso para analistas ou exportar tudo em CSV leva segundos.",
  },
];

export function FractalHowItWorks() {
  return (
    <SectionShell
      id="how-it-works"
      title="O caminho para uma análise profissional."
      subtitle="Do primeiro clique ao lead atribuído, tenha o controle total da sua jornada de marketing em três etapas simples."
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
        <Link
          href="/cadastro"
          className="inline-flex rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Criar meu Dashboard Grátis
        </Link>
      </Reveal>
    </SectionShell>
  );
}

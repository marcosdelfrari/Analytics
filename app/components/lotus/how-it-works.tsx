import { SectionShell } from "@/app/components/lotus/section-shell";

const steps = [
  {
    step: "01",
    title: "Conecte sua conta",
    text: "Entre com Google e receba acesso ao portal do cliente Lótus.",
  },
  {
    step: "02",
    title: "Receba os períodos",
    text: "A equipe publica métricas de campanhas; você acompanha em tempo real.",
  },
  {
    step: "03",
    title: "Decida com clareza",
    text: "Compare plataformas, baixe relatórios e alinhe próximos passos.",
  },
];

export function LotusHowItWorks() {
  return (
    <SectionShell
      id="how-it-works"
      title="Como funciona?"
      subtitle="Três passos para sair do caos de planilhas e ter um painel confiável."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <span className="font-mono text-xs text-muted">{item.step}</span>
            <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

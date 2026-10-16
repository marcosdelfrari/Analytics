import { SectionShell } from "@/app/components/lotus/section-shell";

const benefits = [
  {
    title: "Resultados em um só lugar",
    description:
      "Reúna os principais números das suas campanhas em um painel fácil de abrir e consultar quando quiser.",
  },
  {
    title: "Indicadores mais claros",
    description:
      "Entenda gasto, retorno e evolução sem precisar decifrar relatórios espalhados em vários formatos.",
  },
  {
    title: "Visão organizada do investimento",
    description:
      "Acompanhe o que está sendo feito com o orçamento de mídia e se o resultado condiz com o que foi combinado.",
  },
  {
    title: "Conversas mais objetivas",
    description:
      "Alinhe expectativas com agência ou prestador usando os mesmos números, com menos ruído e mais foco.",
  },
  {
    title: "Decisão com mais segurança",
    description:
      "Identifique o que merece continuar, ajustar ou pausar antes de renovar ou aumentar o investimento.",
  },
];

export function LotusBenefits() {
  return (
    <SectionShell
      id="benefits"
      title="Clareza para o seu negócio. Confiança no que você investe."
      subtitle="Organize os números das campanhas e acompanhe o desempenho do marketing contratado com mais objetividade."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((item) => (
          <article
            key={item.title}
            className="flex min-h-[160px] flex-col justify-end rounded-xl border border-border bg-surface p-5 transition-colors hover:border-muted"
          >
            <h3 className="text-base font-medium">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

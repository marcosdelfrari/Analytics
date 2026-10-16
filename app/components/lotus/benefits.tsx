import { SectionShell } from "@/app/components/lotus/section-shell";

const benefits = [
  {
    title: "Resultados em um só lugar",
    description:
      "Reúna os principais indicadores das campanhas em uma apresentação organizada e fácil de consultar.",
  },
  {
    title: "Indicadores mais claros",
    description:
      "Dê contexto aos números e facilite a compreensão do desempenho das campanhas.",
  },
  {
    title: "Apresentação profissional",
    description:
      "Valorize o trabalho da sua equipe com uma forma mais organizada de apresentar resultados.",
  },
  {
    title: "Comunicação mais simples",
    description:
      "Use os indicadores para tornar as conversas com seus clientes mais objetivas e bem fundamentadas.",
  },
  {
    title: "Foco na análise",
    description:
      "Tenha uma visão organizada das informações para identificar pontos de atenção e orientar os próximos passos.",
  },
];

export function LotusBenefits() {
  return (
    <SectionShell
      id="benefits"
      title="Mais organização para sua equipe. Mais clareza para seus clientes."
      subtitle="Apresente as informações das campanhas de forma organizada e facilite a leitura dos resultados por quem precisa acompanhá-los."
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

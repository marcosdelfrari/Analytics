import { SectionShell } from "@/app/components/lotus/section-shell";

const benefits = [
  {
    title: "Visão unificada",
    description:
      "Google e Meta no mesmo painel, com totais e histórico por período publicado.",
    className: "md:col-span-2 md:row-span-2 min-h-[220px]",
  },
  {
    title: "Publicação sob controle",
    description:
      "Sua agência envia os números; o cliente só vê o que foi liberado.",
    className: "md:col-span-2 min-h-[160px]",
  },
  {
    title: "Métricas que importam",
    description: "Investimento, conversões, CTR e custo por conversão em destaque.",
    className: "min-h-[140px]",
  },
  {
    title: "Relatórios arquivados",
    description: "Baixe PDFs e anexos direto do histórico do período.",
    className: "min-h-[140px]",
  },
  {
    title: "Acesso seguro",
    description: "Login com Google e perfis separados para cliente e admin.",
    className: "min-h-[140px]",
  },
];

export function LotusBenefits() {
  return (
    <SectionShell id="services" title="Benefícios">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2">
        {benefits.map((item) => (
          <article
            key={item.title}
            className={`flex flex-col justify-end rounded-xl border border-border bg-surface p-5 transition-colors hover:border-muted ${item.className}`}
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

import Image from "next/image";
import { BenefitsLeadsChart } from "@/app/components/lotus/benefits-leads-chart";
import { RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

const series = [
  {
    id: "google",
    name: "Google Ads",
    value: "186",
    logo: "/google-ads-icon.webp",
    logoWidth: 16,
    logoHeight: 16,
    tone: "text-google-yellow",
    stroke: "#fbbc04",
    fill: "rgba(251, 188, 4, 0.1)",
    shell:
      "border-google-yellow/25 bg-background/60 bg-gradient-to-br from-google-yellow/20 via-google-yellow/10 to-transparent shadow-[inset_0_1px_0_rgba(251,188,4,0.28)]",
    points: [22, 26, 24, 34, 30, 41, 38],
  },
  {
    id: "meta",
    name: "Meta Ads",
    value: "214",
    logo: "/META.webp",
    logoWidth: 24,
    logoHeight: 16,
    tone: "text-meta",
    stroke: "#0668e1",
    fill: "rgba(6, 104, 225, 0.1)",
    shell:
      "border-meta/25 bg-background/60 bg-gradient-to-br from-meta/20 via-meta/10 to-transparent shadow-[inset_0_1px_0_rgba(6,104,225,0.28)]",
    points: [18, 24, 29, 27, 36, 33, 42],
  },
  {
    id: "custom",
    name: "Personalizado",
    value: "96",
    logo: null,
    logoWidth: 0,
    logoHeight: 0,
    tone: "text-positive",
    stroke: "#4ade80",
    fill: "rgba(74, 222, 128, 0.08)",
    shell:
      "border-positive/25 bg-background/60 bg-gradient-to-br from-positive/20 via-positive/10 to-transparent shadow-[inset_0_1px_0_rgba(74,222,128,0.28)]",
    points: [8, 11, 9, 14, 12, 16, 15],
  },
];

const benefits = [
  {
    index: "02",
    title: "Script de rastreamento",
    description:
      "Um script leve no site liga cada visita à campanha que trouxe a pessoa, e mantém essa origem enquanto ela navega.",
    points: ["Visitas", "Origem da campanha", "Tempo real"],
  },
  {
    index: "03",
    title: "Monitoramento de eventos",
    description:
      "Registre as ações que importam — clique no WhatsApp, envio de formulário, o que fizer sentido — e veja quantas vezes cada uma aconteceu, com a campanha de origem.",
    points: ["Eventos nomeados", "Contagem", "Por campanha"],
  },
  {
    index: "04",
    title: "Gasto e tráfego lado a lado",
    description:
      "No mesmo período, compare quanto foi investido em Google e Meta com o que o site registrou de movimento.",
    points: ["Mesmo período", "Google e Meta", "Leitura rápida"],
  },
  {
    index: "05",
    title: "Modo agência",
    description:
      "Um ambiente por cliente, dashboard publicado para cada um e controle de quem entra em cada conta.",
    points: ["Por cliente", "Relatórios", "Acessos"],
  },
];

export function LotusBenefits() {
  return (
    <SectionShell
      id="benefits"
      title="Controle real sobre a mídia que você paga."
      subtitle="Google Ads, Meta Ads e o tráfego do site no mesmo painel: compare o que foi investido com o que de fato aconteceu, do clique ao resultado."
    >
      <RevealGroup className="grid gap-3 sm:grid-cols-2">
        <RevealItem className="flex flex-col rounded-xl border border-border bg-surface p-5 sm:col-span-2 sm:p-6 lg:col-span-1 lg:row-span-2">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
            01 · Painel
          </p>
          <h3 className="mt-3 text-xl font-medium tracking-tight">
            Um painel para comparar tudo
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            O que você publicou de investimento, o desempenho dos anúncios e o
            que acontece no site — reunidos para você decidir com número na mão.
          </p>
          <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3">
            <BenefitsLeadsChart
              series={series.map(({ id, stroke, fill, points }) => ({
                id,
                stroke,
                fill,
                points,
              }))}
            />
            <ul className="grid grid-cols-3 gap-2">
              {series.map((item) => (
                <li
                  key={item.id}
                  className={`min-w-0 rounded-lg border px-2.5 py-3 sm:px-3 ${item.shell}`}
                >
                  <div className="flex items-center gap-1.5">
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt=""
                        width={item.logoWidth}
                        height={item.logoHeight}
                        className="h-3.5 w-auto shrink-0 mix-blend-lighten"
                      />
                    ) : (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-positive" aria-hidden />
                    )}
                    <p className={`truncate text-[11px] font-medium ${item.tone}`}>{item.name}</p>
                  </div>
                  <p className="mt-2 font-mono text-base tabular-nums sm:text-lg">{item.value}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted">Leads</p>
                </li>
              ))}
            </ul>
          </div>
        </RevealItem>

        {benefits.map((item) => (
          <RevealItem
            key={item.index}
            className="flex flex-col rounded-xl border border-border bg-surface p-5"
          >
            <p className="font-mono text-[11px] text-muted">{item.index}</p>
            <h3 className="mt-3 text-base font-medium">{item.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {item.points.map((point) => (
                <li
                  key={point}
                  className="rounded-full border border-border-subtle bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  {point}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
}

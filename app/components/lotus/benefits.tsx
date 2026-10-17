import Image from "next/image";
import { RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

const channels = [
  {
    name: "Google Ads",
    detail: "Investimento e resultado",
    logo: "/google-ads-icon.webp",
    logoWidth: 16,
    logoHeight: 16,
  },
  {
    name: "Meta Ads",
    detail: "Investimento e resultado",
    logo: "/META.webp",
    logoWidth: 24,
    logoHeight: 16,
  },
  {
    name: "Eventos",
    detail: "Tráfego por parâmetro",
  },
];

const benefits = [
  {
    index: "02",
    title: "Links inteligentes e curtos",
    description:
      "Crie URLs amigáveis para suas campanhas e saiba exatamente quantos cliques elas receberam, sem ferramentas externas.",
    points: ["Encurtador", "Cliques", "Branding"],
  },
  {
    index: "03",
    title: "Script de rastreamento",
    description:
      "Um único script leve que conecta as visitas e eventos aos parâmetros da URL, tudo sincronizado no seu painel.",
    points: ["Visitas", "Eventos", "Tempo Real"],
  },
  {
    index: "04",
    title: "Gestão Multi-Cliente",
    description:
      "Ideal para agências: gerencie múltiplos dashboards e publique relatórios profissionais para cada cliente em segundos.",
    points: ["Agências", "Relatórios", "Acessos"],
  },
  {
    index: "05",
    title: "Gasto vs. Resultado",
    description:
      "Compare o investimento real de Google e Meta com o comportamento do tráfego. Saiba o que realmente converte.",
    points: ["ROI", "Conformidade", "Decisão"],
  },
];

export function LotusBenefits() {
  return (
    <SectionShell
      id="benefits"
      title="Clareza para o seu negócio. Confiança no que você investe."
      subtitle="Toda a inteligência do seu tráfego e investimento, do primeiro clique até a conversão, organizada automaticamente."
    >
      <RevealGroup className="grid gap-3 sm:grid-cols-2">
        <RevealItem className="flex flex-col rounded-xl border border-border bg-surface p-5 sm:col-span-2 sm:p-6 lg:col-span-1 lg:row-span-2">
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
            01 · Painel
          </p>
          <h3 className="mt-3 text-xl font-medium tracking-tight">
            Resultados em um só lugar
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Veja o investimento publicado e os eventos do site em um painel
            só, sem juntar planilha e relatório à parte.
          </p>
          <ul className="mt-6 flex flex-1 flex-col justify-end gap-2">
            {channels.map((channel) => (
              <li
                key={channel.name}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3 py-3"
              >
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  {channel.logo ? (
                    <Image
                      src={channel.logo}
                      alt=""
                      width={channel.logoWidth}
                      height={channel.logoHeight}
                      className="h-4 w-auto shrink-0 mix-blend-lighten"
                    />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-positive" aria-hidden />
                  )}
                  {channel.name}
                </span>
                <span className="text-right text-[12px] text-muted-foreground">
                  {channel.detail}
                </span>
              </li>
            ))}
          </ul>
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

import Image from "next/image";
import { RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

const channels = [
  {
    name: "Google Ads",
    detail: "Gasto e retorno publicados",
    logo: "/google-ads-icon.webp",
    logoWidth: 16,
    logoHeight: 16,
  },
  {
    name: "Meta Ads",
    detail: "Gasto e retorno publicados",
    logo: "/META.webp",
    logoWidth: 24,
    logoHeight: 16,
  },
  {
    name: "Personalizado",
    detail: "Outras origens e campanhas",
  },
];

const benefits = [
  {
    index: "02",
    title: "Registro de eventos",
    description:
      "Um script leve no site registra visitas e os eventos que você nomear — clique no WhatsApp, envio de formulário, o que fizer sentido — e mostra de qual campanha cada pessoa veio.",
    points: ["Visitas", "Eventos nomeados", "Tempo real"],
  },
  {
    index: "03",
    title: "Links de campanha no padrão certo",
    description:
      "Monte o exemplo de URL com origem, mídia e campanha para usar no Google Ads e no Meta — é assim que os relatórios sabem separar cada fonte. Para WhatsApp, SMS ou e-mail, onde não dá para configurar URL no anúncio, o encurtador registra o clique no mesmo painel.",
    points: ["Google e Meta", "Formato para copiar", "WPP · SMS · E-mail"],
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

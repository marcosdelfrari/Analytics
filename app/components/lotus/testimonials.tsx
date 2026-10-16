import { SectionShell } from "@/app/components/lotus/section-shell";

const testimonials = [
  {
    name: "Ana Ribeiro",
    role: "Dona de e-commerce",
    quote:
      "Pela primeira vez consigo ver se o investimento em anúncio está fazendo sentido sem depender só do relatório da agência.",
  },
  {
    name: "Felipe Costa",
    role: "Sócio de clínica",
    quote:
      "Abro o painel e já entendo o período. Ficou muito mais fácil cobrar resultado com base em número.",
  },
  {
    name: "Juliana Moraes",
    role: "Empresária",
    quote:
      "Google e Meta no mesmo lugar me ajudou a decidir onde colocar mais verba sem adivinhar.",
  },
  {
    name: "Ricardo Alves",
    role: "Dono de franquia",
    quote:
      "Visual limpo e direto. É o tipo de ferramenta que eu uso antes de renovar contrato com quem cuida das campanhas.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-[13px] text-foreground" aria-label="5 estrelas">
      {"★★★★★"}
    </div>
  );
}

export function LotusTestimonials() {
  return (
    <SectionShell id="testimonials" title="Quem investe em marketing e quer clareza">
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
        {testimonials.map((item) => (
          <article
            key={item.name}
            className="min-w-[260px] shrink-0 snap-start rounded-xl border border-border bg-surface p-5 md:min-w-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 shrink-0 rounded-full border border-border bg-surface-elevated"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-[12px] text-muted-foreground">{item.role}</p>
              </div>
            </div>
            <div className="mt-4">
              <Stars />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              &ldquo;{item.quote}&rdquo;
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

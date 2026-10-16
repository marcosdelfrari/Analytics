import Link from "next/link";

type LockedScreenPreviewProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function LockedScreenPreview({
  title,
  description,
  children,
}: LockedScreenPreviewProps) {
  return (
    <section className="border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
      </div>
      <div className="relative min-h-48 p-4">
        <div className="pointer-events-none max-h-40 select-none overflow-hidden blur-[2px] opacity-70">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/55 px-4">
          <div className="max-w-sm rounded-lg border border-border bg-surface px-4 py-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-muted">
              Prévia da plataforma
            </p>
            <p className="mt-1 text-sm font-medium">
              Conheça a tela. Assine para utilizar.
            </p>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
              Este é um exemplo de como as informações são apresentadas. Dados
              ilustrativos, não representam resultados da sua conta.
            </p>
            <Link
              href="/#pricing"
              className="mt-3 inline-flex rounded-md bg-foreground px-3 py-1.5 text-[12px] font-medium text-background"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

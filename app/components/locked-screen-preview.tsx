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
    <section className="relative overflow-hidden border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
      </div>
      <div className="relative p-4">
        <div className="pointer-events-none select-none blur-[2px] opacity-70">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/55 px-4 backdrop-blur-[1px]">
          <div className="max-w-xs rounded-lg border border-border bg-surface px-4 py-3 text-center">
            <p className="text-[11px] uppercase tracking-wider text-muted">Bloqueado</p>
            <p className="mt-1 text-sm font-medium">Disponível com plano ativo</p>
          </div>
        </div>
      </div>
    </section>
  );
}

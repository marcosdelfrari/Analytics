export function LotusPartners() {
  const slots = Array.from({ length: 9 }, (_, i) => i);

  return (
    <section className="border-y border-border-subtle bg-surface/40 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm text-muted-foreground">
          Empresas que acompanham seus resultados em
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {slots.map((i) => (
            <div
              key={i}
              className="h-12 w-12 rounded-full border border-border bg-surface-elevated sm:h-14 sm:w-14"
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}

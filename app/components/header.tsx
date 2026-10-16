interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-6">
      <div>
        <h1 className="text-sm font-medium tracking-tight">{title}</h1>
        <p className="text-[12px] text-muted">{subtitle}</p>
      </div>
    </header>
  );
}

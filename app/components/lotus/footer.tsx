import Image from "next/image";
import Link from "next/link";

const menuLinks = [
  { href: "#benefits", label: "Benefícios" },
  { href: "#how-it-works", label: "Como funciona" },
  { href: "#pricing", label: "Planos" },
  { href: "#faq", label: "Perguntas frequentes" },
];

export function LotusFooter() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/lotuslogo.webp"
              alt="Lótus"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-base font-thin tracking-wide">Lótus</span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Mais clareza para acompanhar os resultados do marketing e da mídia
            paga do seu negócio.
            Uma tecnologia{" "}
            <a
              href="https://marcosdelfrari.com"
              className="text-foreground underline-offset-2 hover:underline"
            >
              marcosdelfrari.com
            </a>
            .
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Navegação
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {menuLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Acesso
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="/api/auth/google"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Começar agora
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Receba as novidades do Lótus.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Fique por dentro das atualizações da plataforma e dos novos
            recursos.
          </p>
          <form className="mt-4 flex gap-2" action="#" method="post">
            <input
              type="email"
              placeholder="Seu e-mail"
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-foreground/20 placeholder:text-muted focus:ring-2"
              aria-label="Seu e-mail"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-foreground px-3 py-2 text-[13px] font-medium text-background"
            >
              Quero receber
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-[12px] text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Lótus. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="https://marcosdelfrari.com" className="hover:text-foreground">
              Termos de uso
            </a>
            <a href="https://marcosdelfrari.com" className="hover:text-foreground">
              Política de privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

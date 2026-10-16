import Image from "next/image";
import Link from "next/link";

const menuLinks = [
  { href: "#services", label: "Serviços" },
  { href: "#how-it-works", label: "Como funciona" },
  { href: "#pricing", label: "Preços" },
  { href: "#faq", label: "FAQ" },
];

const legalLinks = [
  { href: "https://marcosdelfrari.com", label: "marcosdelfrari.com" },
  { href: "/login", label: "Login" },
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
            Portal de analytics para mídia paga. Uma tecnologia{" "}
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
            Menu
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
            Legal
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Newsletter
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Novidades sobre produto e analytics.
          </p>
          <form className="mt-4 flex gap-2" action="#" method="post">
            <input
              type="email"
              placeholder="seu@email.com"
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-foreground/20 placeholder:text-muted focus:ring-2"
              aria-label="E-mail para newsletter"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-foreground px-3 py-2 text-[13px] font-medium text-background"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-[12px] text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Lótus · marcosdelfrari.com</p>
          <div className="flex items-center gap-4">
            <a href="https://marcosdelfrari.com" className="hover:text-foreground">
              Privacidade
            </a>
            <span className="flex gap-3" aria-label="Redes sociais">
              <span className="h-8 w-8 rounded-full border border-border bg-surface" />
              <span className="h-8 w-8 rounded-full border border-border bg-surface" />
              <span className="h-8 w-8 rounded-full border border-border bg-surface" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

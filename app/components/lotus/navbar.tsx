import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "#benefits", label: "Benefícios" },
  { href: "#how-it-works", label: "Como funciona" },
  { href: "#pricing", label: "Planos" },
  { href: "#faq", label: "Perguntas frequentes" },
];

export function LotusNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Lótus">
            <Image
              src="/lotuslogo.webp"
              alt="Lótus"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center">
            <a
              href="/api/auth/google"
              className="rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
            >
              Começar agora
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

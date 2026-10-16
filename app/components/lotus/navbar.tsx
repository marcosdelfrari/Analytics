import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "#services", label: "Serviços" },
  { href: "#how-it-works", label: "Como funciona" },
  { href: "#testimonials", label: "Depoimentos" },
  { href: "#pricing", label: "Preços" },
  { href: "#faq", label: "FAQ" },
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

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
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

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

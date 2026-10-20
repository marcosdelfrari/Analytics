import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/app/components/fractal/motion";

const menuLinks = [
  { href: "#benefits", label: "Benefícios" },
  { href: "#how-it-works", label: "Como funciona" },
  { href: "#pricing", label: "Planos" },
  { href: "#faq", label: "Perguntas frequentes" },
];

export function FractalFooter() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <Reveal className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/fractalbranco.webp"
              alt="Fractal"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-base font-thin tracking-wide">Fractal</span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Trackeamento e atribuição de eventos para mídia paga. Parte do{" "}
            <a
              href="https://marcosdelfrari.com/ecossistema"
              className="text-foreground underline-offset-2 hover:underline"
            >
              ecossistema marcosdelfrari.com
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
      </Reveal>

      <div className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-[12px] text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Fractal. Todos os direitos reservados.</p>
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

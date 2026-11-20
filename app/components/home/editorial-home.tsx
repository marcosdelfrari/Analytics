"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Instrument_Serif, Inter } from "next/font/google";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { type CSSProperties, useState } from "react";
import { ArtworkWithNoise } from "@/app/components/home/artwork-with-noise";
import { HeroWhiteNoise } from "@/app/components/home/hero-white-noise";
import { fractalLandingFaqs } from "@/lib/fractal-faq";
import { subscriptionPlans } from "@/lib/subscription-plans";
import skyArt from "@/public/ceu.webp";
import heroDesktop from "@/public/hero.webp";
import heroMobile from "@/public/heromobile.webp";
import sectionArt from "@/public/section.webp";
import sectionMobile from "@/public/sectionmobile.webp";

const editorialSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const uiSans = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

type FeatureTabId = "atribuicao" | "formularios" | "rastreamento" | "governanca";

type SubFeature = {
  icon: "insights" | "engagement" | "performance" | "satisfaction";
  title: string;
  description: string;
};

type FeatureTab = {
  id: FeatureTabId;
  label: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  subFeatures: [SubFeature, SubFeature, SubFeature, SubFeature];
};

const featureTabs: FeatureTab[] = [
  {
    id: "atribuicao",
    label: "Atribuição",
    headingLine1: "Eleve a precisão da",
    headingLine2: "sua mídia paga",
    description:
      "O Fractal cruza seus custos em Google e Meta Ads com acessos reais, ações e leads capturados no site, entregando um painel de ROI preciso.",
    subFeatures: [
      {
        icon: "insights",
        title: "Visão unificada",
        description: "Google Ads, Meta Ads e site lado a lado",
      },
      {
        icon: "engagement",
        title: "Origem real",
        description: "Cada conversão ligada à campanha certa",
      },
      {
        icon: "performance",
        title: "Custo vs. retorno",
        description: "Compare verba investida e volume gerado",
      },
      {
        icon: "satisfaction",
        title: "Decisão rápida",
        description: "Sem amostragem confusa nem planilhas soltas",
      },
    ],
  },
  {
    id: "formularios",
    label: "Formulários",
    headingLine1: "Capture cada lead já",
    headingLine2: "com a campanha certa",
    description:
      "Monte formulários nativos em formato de botão flutuante de WhatsApp, popup, intenção de saída ou seção no corpo da página com UTM automática.",
    subFeatures: [
      {
        icon: "engagement",
        title: "Botão WhatsApp",
        description: "Captura antes de abrir a conversa",
      },
      {
        icon: "insights",
        title: "Popup e saída",
        description: "Ative no momento exato da jornada",
      },
      {
        icon: "performance",
        title: "UTM automática",
        description: "Fonte, mídia, campanha e página salvos",
      },
      {
        icon: "satisfaction",
        title: "Base exportável",
        description: "Baixe todos os leads atribuídos em CSV",
      },
    ],
  },
  {
    id: "rastreamento",
    label: "Rastreamento",
    headingLine1: "Padronize links, UTMs",
    headingLine2: "e eventos ao vivo",
    description:
      "Gere URLs parametrizadas para seus anúncios, crie links curtos para WhatsApp e bio e valide o script no navegador em tempo real.",
    subFeatures: [
      {
        icon: "insights",
        title: "Montador UTM",
        description: "Padrão limpo para Google e Meta Ads",
      },
      {
        icon: "performance",
        title: "Encurtador próprio",
        description: "Links curtos com contagem de cliques",
      },
      {
        icon: "engagement",
        title: "Teste ao vivo",
        description: "Confirme a tag instalada antes de escalar",
      },
      {
        icon: "satisfaction",
        title: "Domínios seguros",
        description: "Bloqueie disparos fora dos seus sites",
      },
    ],
  },
  {
    id: "governanca",
    label: "Governança",
    headingLine1: "Organize múltiplas",
    headingLine2: "empresas e equipes",
    description:
      "Separe operações por empresa na mesma conta, distribua acessos entre Proprietários e Analistas e exporte relatórios prontos para decisão.",
    subFeatures: [
      {
        icon: "engagement",
        title: "Multi-empresa",
        description: "Troque de operação em um único clique",
      },
      {
        icon: "satisfaction",
        title: "Papéis sob medida",
        description: "Fluxo claro entre Proprietário e Analista",
      },
      {
        icon: "insights",
        title: "CSV e Planilhas",
        description: "Exporte mídia, tráfego, eventos e leads",
      },
      {
        icon: "performance",
        title: "Modo agência",
        description: "Dashboards dedicados para cada cliente",
      },
    ],
  },
];

const weeklyChartBars = [
  { day: "Seg", heightPct: 48, value: "128 leads" },
  { day: "Ter", heightPct: 58, value: "154 leads" },
  { day: "Qua", heightPct: 76, value: "214 leads", highlighted: true },
  { day: "Qui", heightPct: 92, value: "248 leads" },
  { day: "Sex", heightPct: 72, value: "191 leads" },
  { day: "Sáb", heightPct: 54, value: "142 leads" },
  { day: "Dom", heightPct: 54, value: "139 leads" },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "Padronize links e UTMs",
    description:
      "Monte URLs consistentes para Google Ads e Meta Ads ou gere links curtos rastreáveis para bio, QR code, SMS e WhatsApp.",
  },
  {
    number: "02",
    title: "Ative o script e a captura",
    description:
      "Cole uma única tag leve no cabeçalho do site, valide a instalação ao vivo e publique formulários que já registram a origem de cada lead.",
  },
  {
    number: "03",
    title: "Compare verba e resultado",
    description:
      "Cruze o valor investido com visitas, eventos e leads reais. Compartilhe com analistas ou exporte relatórios completos em segundos.",
  },
];

const navAnchors = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "Perguntas frequentes" },
];

function SubFeatureIcon({ type }: { type: SubFeature["icon"] }) {
  switch (type) {
    case "insights":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#1D8CFF]"
        >
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 6.5V10L12.5 11.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "engagement":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#1D8CFF]"
        >
          <circle cx="10" cy="6.75" r="2.75" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M4.75 16.25C5.6 13.75 7.6 12.5 10 12.5C12.4 12.5 14.4 13.75 15.25 16.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "performance":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#1D8CFF]"
        >
          <path
            d="M16.5 10A6.5 6.5 0 1 1 14.4 5.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10 10L14.5 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "satisfaction":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-[#1D8CFF]"
        >
          <path
            d="M4.5 10.5L8.2 14.2L15.8 6.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function EditorialHome() {
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FeatureTabId>("atribuicao");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number>(3);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const currentTab =
    featureTabs.find((tab) => tab.id === activeTab) ?? featureTabs[0];

  const commonHeroProps = {
    alt: "Céu azul com nuvens e recorte renascentista simbolizando clareza e visão estratégica no Fractal",
    sizes: "100vw",
  };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...commonHeroProps,
    src: heroDesktop,
  });

  const {
    props: { srcSet: mobileSrcSet, ...heroImgRest },
  } = getImageProps({
    ...commonHeroProps,
    src: heroMobile,
  });

  const commonSectionArtProps = {
    alt: "Pintura clássica emergindo das nuvens, representando clareza e revelação nos dados",
    sizes: "(min-width: 1024px) 560px, (min-width: 640px) 90vw, 100vw",
  };

  const {
    props: { srcSet: sectionDesktopSrcSet },
  } = getImageProps({
    ...commonSectionArtProps,
    src: sectionArt,
  });

  const {
    props: { srcSet: sectionMobileSrcSet, ...sectionImgRest },
  } = getImageProps({
    ...commonSectionArtProps,
    src: sectionMobile,
  });

  return (
    <div
      style={
        {
          "--border": "#EAEAEA",
          "--border-subtle": "#F3F4F6",
        } as CSSProperties
      }
      className={`${uiSans.className} min-h-screen bg-white text-[#111111] selection:bg-[#1D8CFF] selection:text-white`}
    >
      {/* 1. HERO ARTWORK + NAVBAR SOBREPOSTA + NOISE BRANCO */}
      <section className="relative w-full overflow-hidden bg-[#247FE0]">
        {/* Header flutuante fiel à referência */}
        <header className="absolute inset-x-0 top-0 z-30 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-7 sm:pt-6">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
            {/* Símbolo branco solto sobre a hero */}
            <Link
              href="/"
              className="inline-flex items-center justify-center drop-shadow-[0_2px_8px_rgba(8,36,78,0.25)] transition-opacity hover:opacity-85"
              aria-label="Fractal — Início"
            >
              <Image
                src="/fractalbranco.webp"
                alt="Fractal"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
            </Link>

            {/* Ações à direita */}
            <div className="relative flex items-center gap-3 sm:gap-5">
              <Link
                href="/cadastro"
                className="hidden text-[13px] font-medium text-white drop-shadow-[0_1px_2px_rgba(8,36,78,0.28)] transition-opacity hover:opacity-80 sm:block"
              >
                Nova conta
              </Link>
              <Link
                href="/login"
                className="rounded-[3px] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#111111] shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-colors hover:bg-gray-100 sm:px-5"
              >
                Acessar painel
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
                className="flex h-9 w-9 items-center justify-center rounded-[3px] bg-[#1D8CFF] text-white shadow-[0_6px_16px_rgba(14,86,175,0.28)] transition-colors hover:bg-[#0B7AE8]"
              >
                <span className="flex flex-col gap-[4px]" aria-hidden="true">
                  <span
                    className={`block h-[1.5px] w-3.5 bg-white transition-transform duration-200 ${
                      menuOpen ? "translate-y-[2.75px] rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`block h-[1.5px] w-3.5 bg-white transition-transform duration-200 ${
                      menuOpen ? "-translate-y-[2.75px] -rotate-45" : ""
                    }`}
                  />
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.nav
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    aria-label="Navegação principal"
                    className="absolute right-0 top-full mt-2 w-60 rounded-[4px] border border-[#EAEAEA] bg-white p-2 shadow-[0_20px_48px_rgba(9,36,75,0.18)]"
                  >
                    {navAnchors.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between rounded-[3px] px-3 py-2 text-[13px] font-medium text-[#374151] transition-colors hover:bg-[#F3F8FF] hover:text-[#1D8CFF]"
                      >
                        {item.label}
                        <span aria-hidden="true" className="text-[#9CA3AF]">
                          ↗
                        </span>
                      </a>
                    ))}
                    <div className="my-1.5 h-px bg-[#EAEAEA]" />
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-[3px] px-3 py-2 text-[13px] font-medium text-[#374151] transition-colors hover:bg-[#F3F8FF] hover:text-[#1D8CFF]"
                    >
                      Entrar na plataforma
                    </Link>
                    <Link
                      href="/cadastro"
                      onClick={() => setMenuOpen(false)}
                      className="mt-1 block rounded-[3px] bg-[#1D8CFF] px-3 py-2 text-center text-[13px] font-medium text-white transition-colors hover:bg-[#0B7AE8]"
                    >
                      Criar conta grátis
                    </Link>
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* heromobile.webp fullscreen no mobile; hero.webp no desktop */}
        <ArtworkWithNoise
          className="w-full h-[100dvh] min-h-[100dvh] max-md:max-h-[100dvh] md:aspect-[1816/866] md:h-auto md:min-h-0 md:max-h-none"
          noiseSlot={
            <>
              <HeroWhiteNoise intensity="subtle" className="z-20 md:hidden" />
              <HeroWhiteNoise intensity="default" className="z-20 hidden md:block" />
            </>
          }
        >
          <picture className="block h-full min-h-[inherit] w-full">
            <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
            <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
            <img
              {...heroImgRest}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full min-h-[inherit] w-full object-cover object-[center_38%] select-none md:object-top"
            />
          </picture>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#0C4A9A]/30 to-transparent md:h-24 md:from-[#0C4A9A]/20"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-44 bg-[radial-gradient(120%_90%_at_0%_100%,rgba(6,38,84,0.62)_0%,rgba(12,74,154,0.2)_52%,transparent_80%)] md:hidden"
          />

          <div className="pointer-events-none absolute bottom-0 left-0 z-30 flex flex-col items-start px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] md:hidden">
            <div className="overflow-hidden pb-1 pr-2">
              <motion.p
                aria-hidden="true"
                className={`${editorialSerif.className} text-[44px] leading-[0.98] tracking-[-0.02em] text-white italic [text-shadow:0_2px_4px_rgba(5,32,72,0.6),0_10px_30px_rgba(5,32,72,0.5)]`}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.45, duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
              >
                Observe tudo.
              </motion.p>
            </div>
          </div>
        </ArtworkWithNoise>
      </section>

      <main>
        {/* 2. BLOCO CENTRAL EDITORIAL: PROVA SOCIAL + HEADLINE SERIFADA */}
        <section className="bg-white px-5 pb-10 pt-11 sm:px-6 sm:pb-16 sm:pt-16 lg:pb-20 lg:pt-20">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow com linhas laterais finas */}
            <div className="inline-flex items-center justify-center gap-3 sm:gap-4">
              <span aria-hidden="true" className="h-px w-10 bg-[#E5E7EB] sm:w-14" />
              <div className="inline-flex items-center gap-2.5">
                <div className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1D8CFF] text-[9px] font-semibold text-white ring-2 ring-white">
                    G
                  </span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#111827] text-[9px] font-semibold text-white ring-2 ring-white">
                    M
                  </span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#DBEAFE] text-[9px] font-semibold text-[#1D4ED8] ring-2 ring-white">
                    U
                  </span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FEF3C7] text-[9px] font-semibold text-[#92400E] ring-2 ring-white">
                    +
                  </span>
                </div>
                <span aria-hidden="true" className="hidden h-3 w-px shrink-0 bg-[#D1D5DB] sm:block" />
                <p className="text-[11.5px] font-medium tracking-[-0.01em] text-[#6B7280] sm:text-[12.5px]">
                  <span className="sm:hidden">Gestores de tráfego &amp; agências</span>
                  <span className="hidden sm:inline">
                    Escolhido por gestores de tráfego e agências
                  </span>
                </p>
              </div>
              <span aria-hidden="true" className="h-px w-10 bg-[#E5E7EB] sm:w-14" />
            </div>

            <h1
              className={`${editorialSerif.className} mx-auto mt-6 max-w-2xl text-[42px] leading-[1.03] tracking-[-0.025em] text-[#111111] sm:mt-7 sm:text-[60px] lg:text-[68px]`}
            >
              Atribuição e Controle
              <br />
              <span className="italic text-[#1D8CFF] sm:not-italic sm:text-[#111111]">
                para Gestores
              </span>{" "}
              de Tráfego
            </h1>

            <p className="mx-auto mt-4 max-w-[34ch] text-[14px] leading-[1.6] text-[#6B7280] sm:hidden">
              Custos de Google e Meta cruzados com cliques, eventos e leads reais no seu site.
            </p>
          </motion.div>
        </section>

        {/* 3. ECOSSISTEMA: MARQUEE FLUÍDO NO MOBILE / GRADE FINA NO DESKTOP */}
        <section
          aria-label="Canais e integrações suportados"
          className="border-y border-[#EAEAEA] bg-[#FAFAFA] lg:bg-white"
        >
          {/* Mobile & tablet: fita editorial contínua com fade lateral */}
          <div
            className={`relative lg:hidden ${
              prefersReducedMotion ? "overflow-x-auto" : "overflow-hidden"
            }`}
          >
            {!prefersReducedMotion && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#FAFAFA] to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#FAFAFA] to-transparent"
                />
              </>
            )}

            <motion.div
              className="flex w-max items-center"
              animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            >
              {(prefersReducedMotion ? [0] : [0, 1]).map((dup) => (
                <div
                  key={dup}
                  aria-hidden={dup === 1 || undefined}
                  className="flex items-center"
                >
                  <div className="flex h-16 w-40 items-center justify-center gap-2.5 px-4 text-[#6B7280]">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="10" cy="10" r="2.5" fill="currentColor" />
                    </svg>
                    <span className="text-[13.5px] font-medium tracking-[-0.01em]">
                      Google Ads
                    </span>
                  </div>
                  <div className="flex h-16 w-40 items-center justify-center gap-2.5 px-4 text-[#6B7280]">
                    <svg viewBox="0 0 22 16" fill="none" aria-hidden="true" className="h-4 w-5">
                      <path
                        d="M5.5 13C3 13 1.5 11.1 1.5 8.5C1.5 5.4 3.6 3 6.2 3C8.5 3 10.1 4.9 11 6.7C11.9 4.9 13.5 3 15.8 3C18.4 3 20.5 5.4 20.5 8.5C20.5 11.1 19 13 16.5 13C14.4 13 12.9 11.4 11 8.6C9.1 11.4 7.6 13 5.5 13Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[13.5px] font-semibold tracking-[-0.02em]">
                      Meta Ads
                    </span>
                  </div>
                  <div className="flex h-16 w-40 items-center justify-center gap-2.5 px-4 text-[#6B7280]">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                      <path
                        d="M10 3.25A6.75 6.75 0 0 0 4.18 13.43L3.25 16.75L6.7 15.85A6.75 6.75 0 1 0 10 3.25Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[13.5px] font-medium tracking-[-0.01em]">
                      WhatsApp
                    </span>
                  </div>
                  <div className="flex h-16 w-40 items-center justify-center gap-2 px-4 text-[#6B7280]">
                    <span className="text-[14px] font-bold tracking-[-0.03em]">
                      Tag Manager
                    </span>
                  </div>
                  <div className="flex h-16 w-40 items-center justify-center gap-2 px-4 text-[#6B7280]">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.12em]">
                      UTM · LINKS
                    </span>
                  </div>
                  <div className="flex h-16 w-40 items-center justify-center gap-2 px-4 text-[#6B7280]">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                      <rect x="3.5" y="3.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 8V12.5M10 6.5V12.5M13 9.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em]">
                      CSV &amp; PDF
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Desktop: grade arquitetônica original de 6 colunas */}
          <div className="mx-auto hidden max-w-[1400px] divide-x divide-[#EAEAEA] lg:grid lg:grid-cols-6">
            {/* Google Ads */}
            <div className="flex h-16 items-center justify-center gap-2.5 px-4 text-[#6B7280] transition-colors hover:text-[#111111] sm:h-[72px]">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="10" cy="10" r="2.5" fill="currentColor" />
              </svg>
              <span className="text-[13.5px] font-medium tracking-[-0.01em]">
                Google Ads
              </span>
            </div>

            {/* Meta Ads */}
            <div className="flex h-16 items-center justify-center gap-2.5 px-4 text-[#6B7280] transition-colors hover:text-[#111111] sm:h-[72px]">
              <svg viewBox="0 0 22 16" fill="none" aria-hidden="true" className="h-4 w-5">
                <path
                  d="M5.5 13C3 13 1.5 11.1 1.5 8.5C1.5 5.4 3.6 3 6.2 3C8.5 3 10.1 4.9 11 6.7C11.9 4.9 13.5 3 15.8 3C18.4 3 20.5 5.4 20.5 8.5C20.5 11.1 19 13 16.5 13C14.4 13 12.9 11.4 11 8.6C9.1 11.4 7.6 13 5.5 13Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[13.5px] font-semibold tracking-[-0.02em]">
                Meta Ads
              </span>
            </div>

            {/* WhatsApp Leads */}
            <div className="flex h-16 items-center justify-center gap-2.5 px-4 text-[#6B7280] transition-colors hover:text-[#111111] sm:h-[72px]">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M10 3.25A6.75 6.75 0 0 0 4.18 13.43L3.25 16.75L6.7 15.85A6.75 6.75 0 1 0 10 3.25Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[13.5px] font-medium tracking-[-0.01em]">
                WhatsApp
              </span>
            </div>

            {/* Tag Manager */}
            <div className="flex h-16 items-center justify-center gap-2 px-4 text-[#6B7280] transition-colors hover:text-[#111111] sm:h-[72px]">
              <span className="text-[14px] font-bold tracking-[-0.03em]">
                Tag Manager
              </span>
            </div>

            {/* UTM Builder */}
            <div className="flex h-16 items-center justify-center gap-2 px-4 text-[#6B7280] transition-colors hover:text-[#111111] sm:h-[72px]">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em]">
                UTM · LINKS
              </span>
            </div>

            {/* CSV & PDF */}
            <div className="flex h-16 items-center justify-center gap-2 px-4 text-[#6B7280] transition-colors hover:text-[#111111] sm:h-[72px]">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                <rect
                  x="3.5"
                  y="3.5"
                  width="13"
                  height="13"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 8V12.5M10 6.5V12.5M13 9.5V12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em]">
                CSV &amp; PDF
              </span>
            </div>
          </div>
        </section>

        {/* 4. SHOWCASE INTERATIVO: BARRA AZUL DE ABAS + COLAGEM DE CÉU COM NOISE */}
        <section
          id="recursos"
          className="scroll-mt-8 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 max-md:gap-6 lg:grid-cols-12 lg:gap-12 xl:gap-14">
            {/* Abas — primeiro no mobile */}
            <div className="order-1 lg:col-span-6 lg:row-start-1 lg:pt-2">
              <div
                role="tablist"
                aria-label="Recursos da plataforma Fractal"
                className="grid grid-cols-2 gap-1 rounded-[4px] bg-[#1D8CFF] p-1 sm:inline-grid sm:grid-cols-4"
              >
                {featureTabs.map((tab) => {
                  const selected = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-[2px] px-4 py-2 text-[12.5px] font-medium transition-all ${
                        selected
                          ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                          : "text-white/90 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Arte + mockups — segundo no mobile; coluna direita no desktop */}
            <div className="order-2 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1">
              <ArtworkWithNoise
                intensity="default"
                noiseClassName="z-10"
                className="mx-auto w-full bg-[#247FE0] max-md:aspect-[1024/1536] max-md:rounded-[12px] md:aspect-square md:rounded-[8px]"
              >
                <picture className="absolute inset-0 block h-full w-full">
                  <source media="(min-width: 768px)" srcSet={sectionDesktopSrcSet} />
                  <source media="(max-width: 767px)" srcSet={sectionMobileSrcSet} />
                  <img
                    {...sectionImgRest}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-[center_32%] select-none md:object-center"
                  />
                </picture>

                <div className="pointer-events-none absolute inset-x-[5%] top-[4%] z-20 max-md:px-0 sm:inset-x-[13%] sm:top-[12%] lg:inset-x-[14%] lg:top-[12%]">
                  <AnimatePresence mode="wait">
                    {activeTab === "atribuicao" && (
                      <motion.div
                        key="card-atribuicao"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="feature-showcase-card pointer-events-auto mx-auto w-full max-w-[min(100%,318px)] rounded-[18px] border border-white bg-white p-3 shadow-[0_20px_48px_rgba(12,48,96,0.26)] max-md:max-w-none sm:p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[12px] font-medium text-[#6B7280]">
                            Leads atribuídos · Semana
                          </span>
                          <span className="shrink-0 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#1D8CFF]">
                            Google + Meta
                          </span>
                        </div>

                        <div className="relative mt-3.5 grid h-[108px] grid-cols-7 items-end gap-1.5 pt-5 sm:h-[116px] sm:gap-2">
                          {weeklyChartBars.map((bar, index) => {
                            const isSelected = hoveredBarIndex === index;
                            return (
                              <button
                                key={bar.day}
                                type="button"
                                onMouseEnter={() => setHoveredBarIndex(index)}
                                onFocus={() => setHoveredBarIndex(index)}
                                onClick={() => setHoveredBarIndex(index)}
                                className="group relative flex h-full flex-col items-center justify-end focus:outline-none"
                                aria-label={`${bar.day}: ${bar.value}`}
                              >
                                {isSelected && (
                                  <span className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1D8CFF] px-2.5 py-1 text-[10px] font-semibold text-white shadow-[0_6px_16px_rgba(29,140,255,0.4)]">
                                    {bar.value}
                                  </span>
                                )}
                                <div
                                  style={{ height: `${bar.heightPct}%` }}
                                  className={`relative flex w-full flex-col items-center justify-between rounded-[7px] py-1.5 transition-colors duration-200 ${
                                    isSelected
                                      ? "bg-[#1D8CFF] shadow-[0_8px_20px_rgba(29,140,255,0.35)]"
                                      : "bg-[#E5E7EB] group-hover:bg-[#D1D5DB]"
                                  }`}
                                >
                                  <span
                                    className={`h-1 w-1 rounded-full ${
                                      isSelected ? "bg-white/90" : "bg-[#9CA3AF]/50"
                                    }`}
                                  />
                                  <span
                                    className={`h-1 w-1 rounded-full ${
                                      isSelected ? "bg-white/90" : "bg-transparent"
                                    }`}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-2.5 grid grid-cols-7 gap-2 text-center text-[10.5px] font-medium text-[#6B7280]">
                          {weeklyChartBars.map((bar, idx) => (
                            <span
                              key={bar.day}
                              className={
                                hoveredBarIndex === idx
                                  ? "font-semibold text-[#111111]"
                                  : ""
                              }
                            >
                              {bar.day}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "formularios" && (
                      <motion.div
                        key="card-formularios"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="feature-showcase-card pointer-events-auto mx-auto w-full max-w-[min(100%,318px)] rounded-[18px] border border-white bg-white p-3 shadow-[0_20px_48px_rgba(12,48,96,0.26)] max-md:max-w-none sm:p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-medium text-[#6B7280]">
                            Captura nativa com UTM
                          </span>
                          <span className="rounded-full bg-[#1D8CFF] px-2.5 py-0.5 text-[10.5px] font-semibold text-white">
                            Ao vivo
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {["Botão WhatsApp", "Popup", "Intenção de saída", "Corpo"].map(
                            (fmt, i) => (
                              <span
                                key={fmt}
                                className={`rounded-[4px] px-2.5 py-1 text-[11px] font-medium ${
                                  i === 0
                                    ? "bg-[#1D8CFF] text-white"
                                    : "bg-[#F3F4F6] text-[#4B5563]"
                                }`}
                              >
                                {fmt}
                              </span>
                            ),
                          )}
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="rounded-[8px] border border-[#EAEAEA] bg-white p-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-[12px] font-semibold text-[#111111]">
                                Mariana Souza · (11) 99812-••••
                              </p>
                              <span className="shrink-0 text-[10px] font-medium text-[#1D8CFF]">
                                há 2 min
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                              <span className="rounded bg-[#EFF6FF] px-2 py-0.5 font-medium text-[#1D8CFF]">
                                utm_source=meta
                              </span>
                              <span className="rounded bg-[#F3F4F6] px-2 py-0.5 text-[#4B5563]">
                                campanha_escala
                              </span>
                            </div>
                          </div>

                          <div className="rounded-[8px] border border-[#EAEAEA] bg-white p-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-[12px] font-semibold text-[#111111]">
                                Rafael Costa · (31) 99140-••••
                              </p>
                              <span className="shrink-0 text-[10px] font-medium text-[#6B7280]">
                                há 9 min
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                              <span className="rounded bg-[#EFF6FF] px-2 py-0.5 font-medium text-[#1D8CFF]">
                                utm_source=google
                              </span>
                              <span className="rounded bg-[#F3F4F6] px-2 py-0.5 text-[#4B5563]">
                                busca_institucional
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "rastreamento" && (
                      <motion.div
                        key="card-rastreamento"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="feature-showcase-card pointer-events-auto mx-auto w-full max-w-[min(100%,318px)] rounded-[18px] border border-white bg-white p-3 shadow-[0_20px_48px_rgba(12,48,96,0.26)] max-md:max-w-none sm:p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-medium text-[#6B7280]">
                            Diagnóstico de Tag &amp; Links
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#1D8CFF]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1D8CFF]" />
                            Script ativo
                          </span>
                        </div>

                        <div className="mt-4 space-y-2.5">
                          <div className="rounded-[8px] border border-[#DBEAFE] bg-[#F8FBFF] p-3">
                            <p className="text-[10.5px] font-medium uppercase tracking-wider text-[#6B7280]">
                              Verificador de instalação
                            </p>
                            <p className="mt-1 text-[12.5px] font-semibold text-[#111111]">
                              Snippet detectado em &lt;head&gt; · Domínio autorizado
                            </p>
                          </div>

                          <div className="flex items-center justify-between rounded-[8px] border border-[#EAEAEA] bg-white p-3">
                            <div>
                              <p className="text-[10.5px] text-[#6B7280]">
                                Link curto · Bio &amp; WhatsApp
                              </p>
                              <p className="mt-0.5 font-mono text-[12px] font-semibold text-[#111111]">
                                /r/oferta-novembro
                              </p>
                            </div>
                            <span className="rounded-[6px] bg-[#1D8CFF] px-2.5 py-1 text-[11px] font-semibold text-white">
                              412 cliques
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "governanca" && (
                      <motion.div
                        key="card-governanca"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="feature-showcase-card pointer-events-auto mx-auto w-full max-w-[min(100%,318px)] rounded-[18px] border border-white bg-white p-3 shadow-[0_20px_48px_rgba(12,48,96,0.26)] max-md:max-w-none sm:p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-medium text-[#6B7280]">
                            Organização &amp; Acessos
                          </span>
                          <span className="rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#111111]">
                            Multi-empresa
                          </span>
                        </div>

                        <div className="mt-4 space-y-2.5">
                          <div className="flex items-center justify-between rounded-[8px] border border-[#EAEAEA] bg-white p-3">
                            <div>
                              <p className="text-[10.5px] text-[#6B7280]">
                                Empresa selecionada
                              </p>
                              <p className="mt-0.5 text-[12.5px] font-semibold text-[#111111]">
                                Clínica Horizonte · Matriz
                              </p>
                            </div>
                            <span className="rounded border border-[#EAEAEA] px-2 py-1 text-[11px] font-medium text-[#1D8CFF]">
                              Alternar ▾
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="rounded-[8px] border border-[#EAEAEA] bg-[#FAFAFA] p-3">
                              <p className="text-[10.5px] text-[#6B7280]">Papéis</p>
                              <p className="mt-1 text-[12px] font-semibold text-[#111111]">
                                Proprietário &amp; Analista
                              </p>
                            </div>
                            <div className="rounded-[8px] border border-[#EAEAEA] bg-[#FAFAFA] p-3">
                              <p className="text-[10.5px] text-[#6B7280]">Exportação</p>
                              <p className="mt-1 text-[12px] font-semibold text-[#1D8CFF]">
                                CSV + PDF prontos
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ArtworkWithNoise>
            </div>

            {/* Texto + benefícios — terceiro no mobile; continuação da coluna esquerda no desktop */}
            <div className="order-3 lg:col-span-6 lg:row-start-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2
                    className={`${editorialSerif.className} mt-0 text-[38px] leading-[1.06] tracking-[-0.02em] text-[#111111] sm:mt-0 sm:text-[48px]`}
                  >
                    {currentTab.headingLine1}
                    <br />
                    {currentTab.headingLine2}
                  </h2>

                  <p className="mt-4 max-w-md text-[14.5px] leading-[1.65] text-[#6B7280]">
                    {currentTab.description}
                  </p>

                  <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-7 sm:mt-12 sm:grid-cols-2">
                    {currentTab.subFeatures.map((item) => (
                      <div key={item.title} className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          <SubFeatureIcon type={item.icon} />
                        </div>
                        <div>
                          <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-[#111111]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-[12.5px] leading-5 text-[#737373]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 5. CTA — céu puro (ceu.webp) */}
        <section className="px-5 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[18px] bg-[#247FE0] sm:rounded-[8px]">
              {/* O ArtworkWithNoise estava sendo "esmagado" por ser absolute inset-0 sem altura definida no pai */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
                <ArtworkWithNoise
                  className="h-full w-full"
                  intensity="default"
                  noiseClassName="z-[1]"
                >
                  <Image
                    src={skyArt}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 1152px, 100vw"
                    className="object-cover object-center select-none max-md:object-[50%_18%]"
                  />
                </ArtworkWithNoise>
              </div>

              {/* Scrim leve — céu continua visível */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-[2] bg-gradient-to-r from-[#0B4F9C]/55 via-[#1A6FCE]/28 to-[#247FE0]/15 max-md:bg-[linear-gradient(165deg,rgba(11,79,156,0.58)_0%,rgba(26,111,206,0.3)_35%,transparent_100%)]"
              />

              <div className="relative z-10 grid items-center gap-10 px-6 py-14 max-md:pb-14 max-md:pt-16 sm:px-12 sm:py-16 lg:grid-cols-12 lg:py-20">
                <div className="lg:col-span-7">
                  <h2
                    className={`${editorialSerif.className} text-[40px] leading-[1.04] tracking-[-0.02em] text-white [text-shadow:0_2px_18px_rgba(5,32,72,0.8)] sm:text-[50px]`}
                  >
                    Transforme Dados em
                    <br />
                    Clareza Estratégica
                  </h2>
                  <p className="mt-4 max-w-md text-[14.5px] leading-[1.65] text-white/95 [text-shadow:0_1px_4px_rgba(5,32,72,0.6)]">
                    Chega de adivinhar qual campanha gera vendas reais. Conecte mídia
                    paga, acessos e leads atribuídos no seu painel em poucos minutos.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Link
                      href="/login"
                      className="rounded-[4px] bg-white px-5 py-3.5 text-center text-[13px] font-semibold text-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-colors hover:bg-gray-100 sm:py-3 sm:text-left"
                    >
                      Acessar minha conta
                    </Link>
                    <Link
                      href="/cadastro"
                      className="rounded-[4px] border border-white/50 bg-white/20 px-5 py-3.5 text-center text-[13px] font-semibold text-white shadow-[0_6px_22px_rgba(8,36,78,0.15)] backdrop-blur-md transition-colors hover:bg-white/30 [text-shadow:0_1px_2px_rgba(5,32,72,0.5)] sm:py-3 sm:text-left"
                    >
                      Nova conta grátis
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4">
                    <div className="rounded-[10px] border border-white/30 bg-[#06386F]/65 p-4 shadow-[0_12px_32px_rgba(8,36,78,0.2)] backdrop-blur-[6px] sm:bg-white/18">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-white/90 [text-shadow:0_1px_2px_rgba(5,32,72,0.5)]">
                        Google Ads
                      </p>
                      <p
                        className={`${editorialSerif.className} mt-1 text-3xl text-white [text-shadow:0_2px_8px_rgba(5,32,72,0.6)]`}
                      >
                        186 leads
                      </p>
                      <p className="mt-1 text-[11.5px] text-white/90 [text-shadow:0_1px_2px_rgba(5,32,72,0.4)]">
                        Atribuídos por UTM
                      </p>
                    </div>
                    <div className="rounded-[10px] border border-white/30 bg-[#06386F]/65 p-4 shadow-[0_12px_32px_rgba(8,36,78,0.2)] backdrop-blur-[6px] sm:bg-white/18">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-white/90 [text-shadow:0_1px_2px_rgba(5,32,72,0.5)]">
                        Meta Ads
                      </p>
                      <p
                        className={`${editorialSerif.className} mt-1 text-3xl text-white [text-shadow:0_2px_8px_rgba(5,32,72,0.6)]`}
                      >
                        214 leads
                      </p>
                      <p className="mt-1 text-[11.5px] text-white/90 [text-shadow:0_1px_2px_rgba(5,32,72,0.4)]">
                        Cruzados com visitas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. COMO FUNCIONA — GRADE ARQUITETÔNICA DE 3 ETAPAS */}
        <section
          id="como-funciona"
          className="scroll-mt-8 border-t border-[#EAEAEA] bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1D8CFF]">
                Como funciona
              </p>
              <h2
                className={`${editorialSerif.className} mt-3 text-[36px] leading-[1.08] tracking-[-0.02em] text-[#111111] sm:text-[46px]`}
              >
                Do clique ao lead atribuído
                <br />
                em três etapas simples
              </h2>
            </div>

            <div className="mt-14 grid border border-[#EAEAEA] md:grid-cols-3 md:divide-x md:divide-[#EAEAEA]">
              {howItWorksSteps.map((step) => (
                <div
                  key={step.number}
                  className="border-b border-[#EAEAEA] p-7 last:border-b-0 sm:p-9 md:border-b-0"
                >
                  <span className="inline-flex rounded-[3px] bg-[#EFF6FF] px-2.5 py-1 font-mono text-[11.5px] font-semibold text-[#1D8CFF]">
                    Etapa {step.number}
                  </span>
                  <h3
                    className={`${editorialSerif.className} mt-5 text-[28px] leading-[1.12] text-[#111111]`}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.65] text-[#6B7280]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. PLANOS — ESTÉTICA CLARA EDITORIAL */}
        <section
          id="planos"
          className="scroll-mt-8 border-t border-[#EAEAEA] bg-[#FAFAFA] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1D8CFF]">
                Planos e assinatura
              </p>
              <h2
                className={`${editorialSerif.className} mt-3 text-[36px] leading-[1.08] tracking-[-0.02em] text-[#111111] sm:text-[46px]`}
              >
                Escolha a estrutura ideal
                <br />
                para a sua operação
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-[#6B7280]">
                O cadastro é gratuito para conhecer o ambiente. Recursos liberados
                mediante assinatura na plataforma.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-[4px] bg-white p-7 sm:p-9 ${
                    plan.highlighted
                      ? "border-2 border-[#1D8CFF] shadow-[0_20px_50px_rgba(29,140,255,0.1)]"
                      : "border border-[#EAEAEA]"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-7 rounded-[2px] bg-[#1D8CFF] px-3 py-0.5 text-[11px] font-semibold text-white">
                      Mais popular
                    </span>
                  )}

                  <div className="flex items-baseline justify-between gap-4">
                    <h3
                      className={`${editorialSerif.className} text-[32px] leading-none text-[#111111]`}
                    >
                      {plan.name}
                    </h3>
                    <div className="text-right">
                      <span
                        className={`${editorialSerif.className} text-[36px] leading-none text-[#111111]`}
                      >
                        {plan.price}
                      </span>
                      <span className="ml-1 text-[13px] text-[#6B7280]">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] leading-6 text-[#6B7280]">
                    {plan.description}
                  </p>

                  <Link
                    href="/login"
                    className={`mt-7 block rounded-[3px] px-5 py-3 text-center text-[13.5px] font-medium transition-colors ${
                      plan.highlighted
                        ? "bg-[#1D8CFF] text-white hover:bg-[#0B7AE8]"
                        : "border border-[#D1D5DB] bg-white text-[#111111] hover:border-[#111111]"
                    }`}
                  >
                    Acessar e assinar
                  </Link>

                  <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-[#EAEAEA] pt-6 text-[13.5px] text-[#374151]">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 font-semibold text-[#1D8CFF]"
                        >
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. PERGUNTAS FREQUENTES */}
        <section
          id="faq"
          className="scroll-mt-8 border-t border-[#EAEAEA] bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1D8CFF]">
                Dúvidas comuns
              </p>
              <h2
                className={`${editorialSerif.className} mt-3 text-[36px] leading-[1.08] tracking-[-0.02em] text-[#111111] sm:text-[46px]`}
              >
                Perguntas frequentes
              </h2>
            </div>

            <div className="mt-12 divide-y divide-[#EAEAEA] border-y border-[#EAEAEA]">
              {fractalLandingFaqs.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={item.question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-[#111111] transition-colors hover:text-[#1D8CFF]"
                    >
                      <span>{item.question}</span>
                      <span
                        aria-hidden="true"
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] text-[15px] transition-colors ${
                          isOpen
                            ? "bg-[#1D8CFF] text-white"
                            : "bg-[#F3F4F6] text-[#4B5563]"
                        }`}
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 pr-8 text-[14px] leading-[1.7] text-[#6B7280]">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 9. RODAPÉ EDITORIAL MINIMALISTA */}
      <footer className="border-t border-[#EAEAEA] bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/fractalbranco.webp"
                alt="Fractal"
                width={24}
                height={24}
                className="h-6 w-6 invert"
              />
              <span
                className={`${editorialSerif.className} text-2xl tracking-[-0.01em] text-[#111111]`}
              >
                Fractal
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-[13.5px] leading-6 text-[#6B7280]">
              Trackeamento e atribuição de eventos para mídia paga. Parte do{" "}
              <a
                href="https://marcosdelfrari.com/ecossistema"
                className="font-medium text-[#111111] underline decoration-[#D1D5DB] underline-offset-4 hover:decoration-[#1D8CFF]"
              >
                ecossistema marcosdelfrari.com
              </a>
              .
            </p>
          </div>

          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Navegação
            </p>
            <ul className="mt-4 space-y-2.5 text-[13.5px] text-[#4B5563]">
              {navAnchors.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-[#1D8CFF]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Plataforma
            </p>
            <ul className="mt-4 space-y-2.5 text-[13.5px] text-[#4B5563]">
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-[#1D8CFF]"
                >
                  Entrar na conta
                </Link>
              </li>
              <li>
                <Link
                  href="/cadastro"
                  className="transition-colors hover:text-[#1D8CFF]"
                >
                  Criar conta grátis
                </Link>
              </li>
              <li>
                <Link
                  href="/produto"
                  className="transition-colors hover:text-[#1D8CFF]"
                >
                  Visão técnica do produto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#EAEAEA]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-[12px] text-[#6B7280] sm:flex-row sm:px-6 lg:px-8">
            <p>© 2026 Fractal. Todos os direitos reservados.</p>
            <div className="flex items-center gap-5">
              <a
                href="https://marcosdelfrari.com"
                className="transition-colors hover:text-[#111111]"
              >
                Termos de uso
              </a>
              <a
                href="https://marcosdelfrari.com"
                className="transition-colors hover:text-[#111111]"
              >
                Política de privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

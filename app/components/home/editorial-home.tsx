"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Instrument_Serif, Inter } from "next/font/google";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { type CSSProperties, useState } from "react";
import { ArtworkWithNoise } from "@/app/components/home/artwork-with-noise";
import { HeroWhiteNoise } from "@/app/components/home/hero-white-noise";
import { fractalLandingFaqs } from "@/lib/fractal-faq";
import { subscriptionPlans, whatsAppCheckoutUrl } from "@/lib/subscription-plans";
import skyArt from "@/public/ceu.webp";
import heroDesktop from "@/public/hero.webp";
import heroMobile from "@/public/heromobile.webp";
import sectionArtCompact from "@/public/section.webp";
import sectionArtSpacious from "@/public/section2.webp";
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
    label: "Análise",
    headingLine1: "Da primeira visita ao lead,",
    headingLine2: "tudo cruzado com a mídia",
    description:
      "Enxergue por onde o visitante entrou, quais páginas percorreu e quais campanhas de Google e Meta realmente geram leads e retorno.",
    subFeatures: [
      {
        icon: "insights",
        title: "Caminho por página",
        description: "Veja a URL de entrada e cada passo até a conversão",
      },
      {
        icon: "engagement",
        title: "Origem presa na sessão",
        description: "A UTM do clique acompanha toda a navegação no site",
      },
      {
        icon: "performance",
        title: "Site + Ads na mesma tela",
        description: "Visitas, eventos e leads ao lado de CPA, CTR e gasto",
      },
      {
        icon: "satisfaction",
        title: "Contagem sem névoa",
        description: "Dados diretos do seu domínio, sem amostragem do GA4",
      },
    ],
  },
  {
    id: "formularios",
    label: "Leads",
    headingLine1: "Nenhum contato escapa",
    headingLine2: "sem dizer de onde veio",
    description:
      "Substitua cliques cegos no WhatsApp por captura nativa em 4 formatos. Cada lead já entra salvo com página, campanha e anúncio.",
    subFeatures: [
      {
        icon: "engagement",
        title: "Botão de WhatsApp",
        description: "Registra nome e telefone antes de abrir a conversa",
      },
      {
        icon: "performance",
        title: "Popup, saída e seção",
        description: "Aborde o visitante no instante certo da página",
      },
      {
        icon: "insights",
        title: "UTM gravada sozinha",
        description: "Fonte, mídia, campanha e URL salvas automaticamente",
      },
      {
        icon: "satisfaction",
        title: "Base limpa em CSV",
        description: "Filtre por formulário ou unidade e exporte em 1 clique",
      },
    ],
  },
  {
    id: "rastreamento",
    label: "Rastreamento",
    headingLine1: "Cada clique e rota sob",
    headingLine2: "o olhar do seu domínio",
    description:
      "Instale uma única tag no <head>, confirme o disparo ao vivo e encurte links de bio e WhatsApp para nada passar sem rastro.",
    subFeatures: [
      {
        icon: "satisfaction",
        title: "Validador em tempo real",
        description: "Checa o HTML e confirma a primeira visita na hora",
      },
      {
        icon: "performance",
        title: "Botões e rotas SPA",
        description: "Mapeie ações com fractal.track() sem perder trocas de tela",
      },
      {
        icon: "insights",
        title: "Encurtador com UTM",
        description: "Links curtos para bio, QR code e WhatsApp contados",
      },
      {
        icon: "engagement",
        title: "Domínios autorizados",
        description: "Bloqueia disparos fora dos seus sites e subdomínios",
      },
    ],
  },
  {
    id: "governanca",
    label: "Equipe",
    headingLine1: "Sua operação organizada,",
    headingLine2: "sem risco para o rastreio",
    description:
      "Separe marcas ou unidades na mesma conta e libere para cada analista somente o que ele precisa consultar, capturar e exportar.",
    subFeatures: [
      {
        icon: "performance",
        title: "Unidades em 1 clique",
        description: "Alterne de marca ou domínio direto no topo do menu",
      },
      {
        icon: "engagement",
        title: "Vínculo arrasta e solta",
        description: "Conecte visualmente cada empresa aos seus analistas",
      },
      {
        icon: "satisfaction",
        title: "Tag sempre protegida",
        description: "A equipe cria forms e vê leads sem mexer no script",
      },
      {
        icon: "insights",
        title: "Histórico por unidade",
        description: "Relatórios, eventos e leads isolados por operação",
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

const ctaInsightSteps = [
  "Leads de WhatsApp atribuídos",
  "Jornada completa por página",
  "Custo por conversão claro",
  "Acessos sob medida para a equipe",
];

const ctaOverviewBars = [
  { month: "Abr", heightPct: 42, pct: "38,5%" },
  { month: "Mai", heightPct: 58, pct: "52,1%" },
  { month: "Jun", heightPct: 74, pct: "71,4%" },
  { month: "Jul", heightPct: 92, pct: "92,6%", highlighted: true },
];

const howItWorksSteps: Array<{
  icon: "link" | "tag" | "chart";
  title: string;
  description: string;
}> = [
  {
    icon: "link",
    title: "Conecte e ative a coleta",
    description:
      "Autorize seu domínio, cole o snippet no <head>, valide ao vivo e publique formulários. Visitas, eventos e leads já entram no painel.",
  },
  {
    icon: "tag",
    title: "Padronize origens e links",
    description:
      "Monte UTMs limpas para Google e Meta ou crie links curtos para bio, QR code e WhatsApp preservando a origem em toda a sessão.",
  },
  {
    icon: "chart",
    title: "Cruze tráfego, leads e custo",
    description:
      "Leia no mesmo período o que foi coletado no site ao lado do investimento consolidado de mídia e exporte tudo pronto para decisão.",
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
  const [ctaFocusStep, setCtaFocusStep] = useState(0);

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
    sizes: "(min-width: 1024px) 780px, (min-width: 640px) 90vw, 100vw",
  };

  const {
    props: { srcSet: sectionSpaciousSrcSet },
  } = getImageProps({
    ...commonSectionArtProps,
    src: sectionArtSpacious,
  });

  const {
    props: { srcSet: sectionCompactSrcSet },
  } = getImageProps({
    ...commonSectionArtProps,
    src: sectionArtCompact,
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
      {/* 1. HERO — fullscreen inicial (100dvh): somente arte + título; faixa de canais entra ao rolar */}
      <section className="relative flex w-full flex-col overflow-hidden bg-white md:h-[100dvh] md:min-h-[600px]">
        {/* Header flutuante — sobre a faixa da arte */}
        <header className="absolute inset-x-0 top-0 z-30 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-7 sm:pt-6 lg:pointer-events-none lg:[&_a]:pointer-events-auto lg:[&_button]:pointer-events-auto">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 lg:max-w-none">
            {/* Símbolo branco solto sobre a hero */}
            <Link
              href="/"
              className="inline-flex items-center justify-center drop-shadow-[0_2px_8px_rgba(8,36,78,0.25)] transition-opacity hover:opacity-85"
              aria-label="Fractal, início"
            >
              <Image
                src="/lotuslogo.webp"
                alt="Fractal"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
            </Link>

            {/* Ações à direita — "Nova conta" só no menu hamburger */}
            <div className="relative flex items-center gap-3 sm:gap-5">
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
                      Nova conta
                    </Link>
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* heromobile.webp fullscreen no mobile; hero.webp + título dividindo 100dvh a partir de md */}
        <ArtworkWithNoise
          className="h-[100dvh] min-h-[100dvh] w-full max-md:max-h-[100dvh] bg-[#247FE0] md:min-h-0 md:flex-[16] md:basis-0 md:aspect-auto md:h-auto md:max-h-none"
          noiseSlot={
            <>
              <HeroWhiteNoise intensity="subtle" className="z-20 lg:hidden" />
              <HeroWhiteNoise intensity="default" className="z-20 hidden lg:block" />
            </>
          }
        >
          <picture className="block h-full min-h-[inherit] w-full md:absolute md:inset-0">
            <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
            <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
            <img
              {...heroImgRest}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full min-h-[inherit] w-full object-cover object-[center_38%] select-none md:object-[center_46%]"
            />
          </picture>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-[#0C4A9A]/30 to-transparent lg:hidden"
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
                Colete tudo.
              </motion.p>
            </div>
          </div>
        </ArtworkWithNoise>

        <motion.div
          className="flex w-full flex-col items-center justify-center bg-white px-5 pb-12 pt-12 text-center sm:px-6 md:min-h-0 md:flex-[9] md:basis-0 md:px-10 md:py-4 xl:px-14"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        >
          <h1
            className={`${editorialSerif.className} mx-auto w-full max-w-[20ch] text-[40px] leading-[1.06] tracking-[-0.028em] text-[#111111] sm:max-w-[24ch] sm:text-[52px] lg:max-w-[26ch] lg:text-[clamp(3rem,6.8vh,5rem)] lg:leading-[1.04] xl:text-[clamp(3.25rem,7.2vh,5.25rem)]`}
          >
            Nada passa despercebido.
            <br />
            Nem seus{" "}
            <span className="italic text-[#1D8CFF]">leads</span>.
          </h1>
        </motion.div>
      </section>

      <main>
        {/* 2. ECOSSISTEMA: MARQUEE FLUÍDO NO MOBILE / GRADE FINA NO DESKTOP */}
        <section
          aria-label="Canais e integrações suportados"
          className="border-t border-[#EAEAEA] bg-white lg:border-y"
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
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent"
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
                  <div className="flex h-16 w-44 items-center justify-center gap-2 px-4 text-[#6B7280]">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                      <rect x="3.5" y="3.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 8.5h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em]">
                      Eventos &amp; SPA
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

            {/* Eventos & SPA */}
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
                  d="M7 8.5h6M7 12h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em]">
                Eventos &amp; SPA
              </span>
            </div>
          </div>
        </section>

        {/* 4. SHOWCASE INTERATIVO: BARRA AZUL DE ABAS + COLAGEM DE CÉU COM NOISE */}
        <section
          id="recursos"
          className="scroll-mt-8 bg-white px-5 py-20 sm:px-6 lg:px-8 lg:py-28"
        >
          <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-8 max-md:gap-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:items-stretch lg:gap-x-12 lg:gap-y-0 xl:gap-x-16">
            {/* Abas — primeiro no mobile e alinhadas ao topo da imagem no desktop */}
            <div className="order-1 lg:col-span-5 lg:row-start-1">
              <div
                role="tablist"
                aria-label="Recursos da plataforma Fractal"
                className="grid w-full grid-cols-2 gap-1 rounded-[5px] bg-[#1D8CFF] p-1 sm:flex sm:items-center"
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
                      className={`whitespace-nowrap rounded-[3px] px-3 py-2.5 text-center text-[12.5px] font-medium transition-all sm:flex-1 ${
                        selected
                          ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                          : "text-white/95 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Arte + mockups — terceiro no mobile; 7 colunas amplas no desktop na proporção nativa 1080/920 */}
            <div className="order-3 lg:order-2 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
              <ArtworkWithNoise
                intensity="default"
                noiseClassName="z-10"
                className="mx-auto w-full bg-[#247FE0] max-md:aspect-[1024/1536] max-md:rounded-[12px] md:aspect-square md:rounded-[8px] lg:aspect-[1080/920] lg:rounded-[4px]"
              >
                <picture className="absolute inset-0 block h-full w-full">
                  <source media="(min-width: 1024px)" srcSet={sectionSpaciousSrcSet} />
                  <source media="(min-width: 768px)" srcSet={sectionCompactSrcSet} />
                  <source media="(max-width: 767px)" srcSet={sectionMobileSrcSet} />
                  <img
                    {...sectionImgRest}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-[center_32%] select-none md:object-[center_42%] lg:object-center"
                  />
                </picture>

                <div className="pointer-events-none absolute inset-x-[5%] top-[4%] z-20 max-md:px-0 sm:inset-x-[13%] sm:top-[10%] lg:inset-x-auto lg:right-[4.5%] lg:top-[6.5%] lg:w-[55%] lg:max-w-[384px]">
                  <div className="mx-auto w-full max-w-[min(100%,332px)] rounded-[16px] border border-white/55 bg-white/25 p-1.5 shadow-[0_24px_54px_rgba(9,42,88,0.22)] backdrop-blur-md max-md:max-w-none lg:max-w-none">
                    <AnimatePresence mode="wait">
                      {activeTab === "atribuicao" && (
                        <motion.div
                          key="card-atribuicao"
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          transition={{ duration: 0.25 }}
                          className="feature-showcase-card pointer-events-auto w-full rounded-[12px] bg-white p-3.5 sm:p-4"
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
                        className="feature-showcase-card pointer-events-auto w-full rounded-[12px] bg-white p-3.5 sm:p-4"
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
                        className="feature-showcase-card pointer-events-auto w-full rounded-[12px] bg-white p-3.5 sm:p-4"
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
                        className="feature-showcase-card pointer-events-auto w-full rounded-[12px] bg-white p-3.5 sm:p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11.5px] font-medium text-[#6B7280]">
                            Unidades &amp; Acessos
                          </span>
                          <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-[10.5px] font-semibold text-[#1D8CFF]">
                            Equipe
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
                </div>
              </ArtworkWithNoise>
            </div>

            {/* Texto + benefícios — esticado de ponta a ponta para casar topo e base com a arte */}
            <div className="order-2 flex flex-col lg:order-3 lg:col-span-5 lg:row-start-2 lg:h-full lg:pt-9 xl:pt-11">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-1 flex-col justify-between"
                >
                  <div>
                    <h2
                      className={`${editorialSerif.className} mt-0 text-[38px] leading-[1.05] tracking-[-0.02em] text-[#111111] sm:text-[48px] xl:text-[54px]`}
                    >
                      {currentTab.headingLine1}
                      <br />
                      {currentTab.headingLine2}
                    </h2>

                    <p className="mt-4 max-w-md text-[14.5px] leading-[1.65] text-[#6B7280] xl:text-[15.5px]">
                      {currentTab.description}
                    </p>
                  </div>

                  <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-7 sm:mt-12 sm:grid-cols-2 lg:mt-auto lg:pt-10">
                    {currentTab.subFeatures.map((item) => (
                      <div key={item.title} className="flex flex-col items-start">
                        <SubFeatureIcon type={item.icon} />
                        <h3 className="mt-2.5 text-[14px] font-semibold tracking-[-0.01em] text-[#111111]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-[12.5px] leading-5 text-[#737373]">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 5. CTA — céu + mockup em camadas + trilha lateral */}
        <section className="px-5 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="mx-auto max-w-[1320px]">
            <div className="relative min-h-[520px] overflow-hidden rounded-[18px] bg-[#1a5fad] sm:min-h-[560px] sm:rounded-[12px] lg:min-h-[520px]">
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
                    sizes="(min-width: 1024px) 1320px, 100vw"
                    className="object-cover object-[62%_38%] select-none max-lg:object-[55%_30%]"
                  />
                </ArtworkWithNoise>
              </div>

              <div
                aria-hidden="true"
                className="absolute inset-0 z-[2] bg-gradient-to-r from-[#062d5c]/78 via-[#0d4f96]/42 to-[#030914]/55"
              />
              <div
                aria-hidden="true"
                className="absolute inset-y-0 right-0 z-[2] w-[38%] bg-[radial-gradient(90%_120%_at_100%_50%,rgba(3,8,20,0.85)_0%,transparent_72%)]"
              />

              <div className="relative z-10 flex flex-col gap-10 px-6 py-12 sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:gap-8 lg:px-12 lg:py-16 xl:gap-12 xl:px-14">
                <div className="min-w-0 lg:w-[30%] lg:shrink-0 xl:w-[28%]">
                  <h2
                    className={`${editorialSerif.className} text-[34px] leading-[1.08] tracking-[-0.02em] text-white [text-shadow:0_2px_18px_rgba(5,32,72,0.55)] sm:text-[42px] xl:text-[46px]`}
                  >
                    Pare de adivinhar qual campanha trouxe o lead
                  </h2>
                  <p className="mt-4 max-w-sm text-[14px] leading-[1.65] text-white/92 sm:text-[15px]">
                    Instale o script em dois minutos, ative o botão de WhatsApp
                    rastreado e enxergue o retorno real de cada anúncio.
                  </p>
                  <Link
                    href="/cadastro"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#1D8CFF] px-6 py-3.5 text-[13.5px] font-semibold text-white shadow-[0_12px_32px_rgba(29,140,255,0.38)] transition-colors hover:bg-[#0B7AE8]"
                  >
                    Criar conta grátis
                    <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href="/login"
                    className="mt-3 block text-[13px] font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    Já tenho conta
                  </Link>
                </div>

                <div className="flex min-w-0 flex-1 justify-center lg:justify-center">
                  <div className="w-full max-w-[420px] rounded-[16px] border border-white/25 bg-white/12 p-3 shadow-[0_28px_60px_rgba(5,24,52,0.35)] backdrop-blur-xl sm:max-w-[460px]">
                    <div className="rounded-[12px] border border-white/60 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2" aria-hidden="true">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1D8CFF] text-[10px] font-semibold text-white ring-2 ring-white">
                            A
                          </span>
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] text-[10px] font-semibold text-white ring-2 ring-white">
                            B
                          </span>
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#DBEAFE] text-[10px] font-semibold text-[#1D4ED8] ring-2 ring-white">
                            C
                          </span>
                        </div>
                        <p className="text-[12px] font-medium text-[#374151]">
                          Novos leads:{" "}
                          <span className="font-semibold text-[#059669]">
                            +248 esta semana
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 rounded-[12px] border border-white/60 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.1)]">
                      <div className="flex gap-1 rounded-[6px] bg-[#F3F4F6] p-1">
                        {["Visão geral", "Leads", "Mídia"].map((tab, index) => (
                          <span
                            key={tab}
                            className={`flex-1 rounded-[4px] px-2 py-1.5 text-center text-[10.5px] font-medium ${
                              index === 0
                                ? "bg-white text-[#111111] shadow-sm"
                                : "text-[#6B7280]"
                            }`}
                          >
                            {tab}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-end gap-3">
                        <p
                          className={`${editorialSerif.className} text-[40px] leading-none tracking-[-0.02em] text-[#111111]`}
                        >
                          1.248
                        </p>
                        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10.5px] font-semibold text-[#15803D]">
                          124 ↗
                        </span>
                      </div>
                      <p className="mt-1 text-[11.5px] text-[#6B7280]">
                        Leads atribuídos subiram ~58% neste mês
                      </p>

                      <div className="mt-4 grid h-[92px] grid-cols-4 items-end gap-2">
                        {ctaOverviewBars.map((bar) => (
                          <div key={bar.month} className="flex h-full flex-col items-center justify-end">
                            <span
                              className={`mb-1 text-[9px] font-semibold ${
                                bar.highlighted ? "text-[#1D8CFF]" : "text-[#9CA3AF]"
                              }`}
                            >
                              {bar.pct}
                            </span>
                            <div
                              style={{ height: `${bar.heightPct}%` }}
                              className={`w-full rounded-t-[6px] ${
                                bar.highlighted
                                  ? "bg-[#1D8CFF]"
                                  : "bg-[#DBEAFE]"
                              }`}
                            />
                            <span className="mt-1.5 text-[9.5px] font-medium text-[#6B7280]">
                              {bar.month}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-3 rounded-[12px] border border-white/60 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                      <div>
                        <p className="text-[10.5px] font-medium text-[#6B7280]">
                          Investimento rastreado
                        </p>
                        <p className="mt-0.5 text-[15px] font-semibold text-[#111111]">
                          R$ 10.850,10
                        </p>
                      </div>
                      <span className="shrink-0 rounded-[6px] bg-[#1D8CFF] px-3 py-2 text-[11px] font-semibold text-white">
                        Exportar CSV →
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lg:w-[24%] lg:shrink-0 xl:w-[22%]">
                  <ul
                    className="relative flex flex-col gap-3 pl-1"
                    aria-label="Benefícios destacados"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute bottom-2 left-[7px] top-2 w-px bg-white/35"
                    />
                    {ctaInsightSteps.map((label, index) => {
                      const active = ctaFocusStep === index;
                      return (
                        <li key={label} className="relative flex items-center gap-3 pl-0">
                          <span
                            aria-hidden="true"
                            className={`relative z-[1] h-[15px] w-[15px] shrink-0 rounded-full border-2 ${
                              active
                                ? "border-white bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.25)]"
                                : "border-white/70 bg-[#0a2d58]/40"
                            }`}
                          />
                          <button
                            type="button"
                            onMouseEnter={() => setCtaFocusStep(index)}
                            onFocus={() => setCtaFocusStep(index)}
                            onClick={() => setCtaFocusStep(index)}
                            className={`w-full rounded-[6px] px-3.5 py-2.5 text-left text-[12.5px] font-medium transition-all ${
                              active
                                ? "bg-white text-[#111111] shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                                : "border border-white/20 bg-white/10 text-white/95 backdrop-blur-sm hover:bg-white/15"
                            }`}
                          >
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. COMO FUNCIONA — BLOCO ESCURO COM ÍCONES GLOW + MANIFESTO EDITORIAL */}
        <section
          id="como-funciona"
          className="scroll-mt-8 bg-white px-5 pb-20 pt-2 sm:px-6 lg:px-8 lg:pb-28"
        >
          <div className="mx-auto max-w-[1320px]">
            <div className="rounded-[12px] bg-[#050505] px-6 py-14 text-white sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start lg:gap-12">
                <div>
                  <div className="inline-flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1D8CFF]/25 ring-1 ring-[#1D8CFF]/50"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#1D8CFF]" />
                    </span>
                    <span className="text-[12.5px] font-medium tracking-[-0.01em] text-white/90">
                      Como funciona
                    </span>
                  </div>

                  <h2
                    className={`${editorialSerif.className} mt-4 text-[36px] leading-[1.06] tracking-[-0.02em] text-white sm:text-[46px] lg:text-[50px]`}
                  >
                    Nosso processo de
                    <br />
                    coleta e análise
                  </h2>
                </div>

                <p className="max-w-xs text-[13.5px] leading-[1.65] text-white/75 lg:pt-7">
                  Do primeiro clique no anúncio ao lead salvo na base: três passos
                  simples para organizar sua operação sem configurações pesadas.
                </p>
              </div>

              <div className="mt-16 grid gap-10 sm:mt-20 md:grid-cols-3 md:gap-10 lg:mt-24 lg:gap-14">
                {howItWorksSteps.map((step) => (
                  <div key={step.title} className="flex flex-col items-start">
                    <div
                      aria-hidden="true"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2547] ring-1 ring-[#1D8CFF]/35 shadow-[0_0_32px_rgba(29,140,255,0.42)]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D8CFF] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]">
                        {step.icon === "link" && (
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-4 w-4"
                          >
                            <path
                              d="M8.5 11.5L11.5 8.5M7 13L5.6 14.4a2.5 2.5 0 0 1-3.54-3.54L3.5 9.4M13 7l1.4-1.4a2.5 2.5 0 0 1 3.54 3.54L16.5 10.6"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                        {step.icon === "tag" && (
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-4 w-4"
                          >
                            <rect
                              x="3.5"
                              y="4.5"
                              width="13"
                              height="11"
                              rx="2.2"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <path
                              d="M7 8.5h6M7 11.5h3.5"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                        {step.icon === "chart" && (
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-4 w-4"
                          >
                            <circle
                              cx="8.5"
                              cy="7"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <path
                              d="M4 15.2c.8-2.1 2.4-3.2 4.5-3.2s3.7 1.1 4.5 3.2M14 6.5v4M12 8.5h4"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </span>
                    </div>

                    <h3 className="mt-6 text-[16px] font-semibold tracking-[-0.015em] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 max-w-[30ch] text-[13.5px] leading-[1.6] text-white/65">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-16 sm:pt-20 lg:pt-24">
              <p
                className={`${editorialSerif.className} max-w-4xl text-[32px] leading-[1.14] tracking-[-0.02em] text-[#111111] sm:text-[42px] lg:text-[48px]`}
              >
                Feito para empresas e times de marketing que cansaram de cruzar
                gerenciador de anúncios, GA4 confuso e conversas soltas no WhatsApp
                para descobrir o que realmente traz retorno.
              </p>
            </div>
          </div>
        </section>

        {/* 7. PLANO — ESTÉTICA CLARA EDITORIAL (OFERTA ÚNICA) */}
        <section
          id="planos"
          className="scroll-mt-8 border-t border-[#EAEAEA] bg-[#FAFAFA] px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1D8CFF]">
                Assinatura
              </p>
              <h2
                className={`${editorialSerif.className} mt-3 text-[36px] leading-[1.08] tracking-[-0.02em] text-[#111111] sm:text-[46px]`}
              >
                Um plano completo para coletar
                <br />e analisar com clareza
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-[#6B7280]">
                Cadastro gratuito para conhecer o painel. A assinatura libera toda a
                coleta, formulários e análise da sua operação.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-2xl">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.name}
                  className="relative flex flex-col rounded-[6px] border-2 border-[#1D8CFF] bg-white p-7 shadow-[0_20px_50px_rgba(29,140,255,0.1)] sm:p-10"
                >
                  <span className="absolute -top-3 left-7 rounded-[2px] bg-[#1D8CFF] px-3 py-0.5 text-[11px] font-semibold text-white sm:left-10">
                    Acesso completo
                  </span>

                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <div>
                      <h3
                        className={`${editorialSerif.className} text-[34px] leading-none text-[#111111] sm:text-[38px]`}
                      >
                        Fractal {plan.name}
                      </h3>
                      <p className="mt-3 max-w-md text-[14px] leading-6 text-[#6B7280]">
                        {plan.description}
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <span
                        className={`${editorialSerif.className} text-[42px] leading-none text-[#111111] sm:text-[46px]`}
                      >
                        {plan.price}
                      </span>
                      <span className="ml-1 text-[13.5px] text-[#6B7280]">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <ul className="mt-8 grid gap-x-6 gap-y-3 border-t border-[#EAEAEA] pt-7 text-[13.5px] text-[#374151] sm:grid-cols-2">
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

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      href="/cadastro"
                      className="flex-1 rounded-[4px] bg-[#1D8CFF] px-6 py-3.5 text-center text-[13.5px] font-semibold text-white transition-colors hover:bg-[#0B7AE8]"
                    >
                      Criar conta e testar grátis
                    </Link>
                    <a
                      href={whatsAppCheckoutUrl(plan.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-[4px] border border-[#D1D5DB] bg-white px-5 py-3.5 text-center text-[13px] font-medium text-[#111111] transition-colors hover:border-[#111111]"
                    >
                      Falar no WhatsApp →
                    </a>
                  </div>
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

      {/* 9. RODAPÉ MINIMAL */}
      <footer className="border-t border-[#EAEAEA] bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-5 px-5 py-8 text-[12.5px] text-[#6B7280] sm:px-6 md:flex-row lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link href="/" className="inline-flex items-center gap-2 text-[#111111]">
              <Image
                src="/lotuslogo.webp"
                alt="Fractal"
                width={20}
                height={20}
                className="h-5 w-5 invert"
              />
              <span className={`${editorialSerif.className} text-xl leading-none`}>
                Fractal
              </span>
            </Link>
            <span aria-hidden="true" className="text-[#D1D5DB]">
              ·
            </span>
            <span>
              © 2026{" "}
              <a
                href="https://marcosdelfrari.com/ecossistema"
                className="transition-colors hover:text-[#111111]"
              >
                marcosdelfrari.com
              </a>
            </span>
          </div>

          <nav
            aria-label="Rodapé"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {navAnchors.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[#111111]"
              >
                {link.label}
              </a>
            ))}
            <Link href="/login" className="transition-colors hover:text-[#111111]">
              Entrar
            </Link>
            <a
              href="https://marcosdelfrari.com"
              className="transition-colors hover:text-[#111111]"
            >
              Privacidade
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

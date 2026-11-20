import type { Metadata } from "next";

export const FRACTAL_BRAND = "Fractal";

export const FRACTAL_SITE_TITLE = `${FRACTAL_BRAND} — Coleta, análise e custo`;

export const FRACTAL_SITE_DESCRIPTION =
  "Coleta de dados no site: visitas, ações e conversões. Análise para melhorar, cruzada com custo em Google Ads e Meta Ads em um painel claro. Parte do ecossistema marcosdelfrari.com.";

const DEFAULT_OG_IMAGE = "/fractalbranco.webp";

function metadataBaseUrl() {
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    return new URL(configured.endsWith("/") ? configured : `${configured}/`);
  }
  return new URL("http://localhost:3001/");
}

export function buildRootMetadata(): Metadata {
  const base = metadataBaseUrl();
  return {
    metadataBase: base,
    title: FRACTAL_SITE_TITLE,
    description: FRACTAL_SITE_DESCRIPTION,
    icons: { icon: DEFAULT_OG_IMAGE },
    alternates: {
      canonical: "/produto",
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/produto",
      siteName: FRACTAL_BRAND,
      title: FRACTAL_SITE_TITLE,
      description: FRACTAL_SITE_DESCRIPTION,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          alt: `${FRACTAL_BRAND} — logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: FRACTAL_SITE_TITLE,
      description: FRACTAL_SITE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export const NOINDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type FaqItem = { question: string; answer: string };

export function buildFaqPageJsonLd(faqs: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

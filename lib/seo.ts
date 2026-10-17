import type { Metadata } from "next";

export const LOTUS_BRAND = "Lótus";

export const LOTUS_SITE_TITLE = `${LOTUS_BRAND} — Analytics de mídia paga`;

export const LOTUS_SITE_DESCRIPTION =
  "Una Google Ads e Meta Ads em um painel claro: investimento publicado, visitas e eventos do site. Cadastro gratuito; recursos mediante plano. Tecnologia marcosdelfrari.com.";

const DEFAULT_OG_IMAGE = "/lotuslogo.webp";

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
    title: LOTUS_SITE_TITLE,
    description: LOTUS_SITE_DESCRIPTION,
    icons: { icon: DEFAULT_OG_IMAGE },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/",
      siteName: LOTUS_BRAND,
      title: LOTUS_SITE_TITLE,
      description: LOTUS_SITE_DESCRIPTION,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          alt: `${LOTUS_BRAND} — logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: LOTUS_SITE_TITLE,
      description: LOTUS_SITE_DESCRIPTION,
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

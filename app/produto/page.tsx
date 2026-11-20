import type { Metadata } from "next";
import { FractalFaqJsonLd } from "@/app/components/fractal/faq-json-ld";
import { FractalLandingPage } from "@/app/components/fractal/landing-page";
import {
  FRACTAL_BRAND,
  FRACTAL_SITE_DESCRIPTION,
  FRACTAL_SITE_TITLE,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: FRACTAL_SITE_TITLE,
  description: FRACTAL_SITE_DESCRIPTION,
  alternates: {
    canonical: "/produto",
  },
  openGraph: {
    url: "/produto",
    title: FRACTAL_SITE_TITLE,
    description: FRACTAL_SITE_DESCRIPTION,
    siteName: FRACTAL_BRAND,
  },
};

export default function ProdutoPage() {
  return (
    <>
      <FractalFaqJsonLd />
      <FractalLandingPage />
    </>
  );
}

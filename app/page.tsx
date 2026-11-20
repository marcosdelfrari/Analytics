import type { Metadata } from "next";
import { FractalFaqJsonLd } from "@/app/components/fractal/faq-json-ld";
import { EditorialHome } from "@/app/components/home/editorial-home";
import {
  FRACTAL_BRAND,
  FRACTAL_SITE_DESCRIPTION,
  FRACTAL_SITE_TITLE,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: FRACTAL_SITE_TITLE,
  description: FRACTAL_SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: FRACTAL_SITE_TITLE,
    description: FRACTAL_SITE_DESCRIPTION,
    siteName: FRACTAL_BRAND,
    images: [
      {
        url: "/hero.webp",
        alt: FRACTAL_SITE_TITLE,
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <FractalFaqJsonLd />
      <EditorialHome />
    </>
  );
}

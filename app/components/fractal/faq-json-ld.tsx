import { buildFaqPageJsonLd } from "@/lib/seo";
import { fractalLandingFaqs } from "@/lib/fractal-faq";

export function FractalFaqJsonLd() {
  const jsonLd = buildFaqPageJsonLd(fractalLandingFaqs);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

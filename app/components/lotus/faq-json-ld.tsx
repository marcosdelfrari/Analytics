import { buildFaqPageJsonLd } from "@/lib/seo";
import { lotusLandingFaqs } from "@/lib/lotus-faq";

export function LotusFaqJsonLd() {
  const jsonLd = buildFaqPageJsonLd(lotusLandingFaqs);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

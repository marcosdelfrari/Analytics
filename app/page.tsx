import { LotusFaqJsonLd } from "@/app/components/lotus/faq-json-ld";
import { LotusLandingPage } from "@/app/components/lotus/landing-page";

export default function Home() {
  return (
    <>
      <LotusFaqJsonLd />
      <LotusLandingPage />
    </>
  );
}

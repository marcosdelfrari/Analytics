import { LotusBenefits } from "@/app/components/lotus/benefits";
import { LotusFaq } from "@/app/components/lotus/faq";
import { LotusFinalCta } from "@/app/components/lotus/final-cta";
import { LotusFooter } from "@/app/components/lotus/footer";
import { LotusHero } from "@/app/components/lotus/hero";
import { LotusHowItWorks } from "@/app/components/lotus/how-it-works";
import { LotusNavbar } from "@/app/components/lotus/navbar";
import { LotusPricing } from "@/app/components/lotus/pricing";

export function LotusLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LotusNavbar />
      <main>
        <LotusHero />
        <LotusBenefits />
        <LotusHowItWorks />
        <LotusPricing />
        <LotusFaq />
        <LotusFinalCta />
      </main>
      <LotusFooter />
    </div>
  );
}

import { LotusBenefits } from "@/app/components/lotus/benefits";
import { LotusFaq } from "@/app/components/lotus/faq";
import { LotusFinalCta } from "@/app/components/lotus/final-cta";
import { LotusFooter } from "@/app/components/lotus/footer";
import { LotusHero } from "@/app/components/lotus/hero";
import { LotusHowItWorks } from "@/app/components/lotus/how-it-works";
import { LotusNavbar } from "@/app/components/lotus/navbar";
import { LotusPartners } from "@/app/components/lotus/partners";
import { LotusPricing } from "@/app/components/lotus/pricing";
import { LotusTestimonials } from "@/app/components/lotus/testimonials";

export function LotusLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LotusNavbar />
      <main>
        <LotusHero />
        <LotusPartners />
        <LotusBenefits />
        <LotusHowItWorks />
        <LotusPricing />
        <LotusTestimonials />
        <LotusFaq />
        <LotusFinalCta />
      </main>
      <LotusFooter />
    </div>
  );
}

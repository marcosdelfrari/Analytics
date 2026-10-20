import { FractalBenefits } from "@/app/components/fractal/benefits";
import { FractalFaq } from "@/app/components/fractal/faq";
import { FractalFinalCta } from "@/app/components/fractal/final-cta";
import { FractalFooter } from "@/app/components/fractal/footer";
import { FractalHero } from "@/app/components/fractal/hero";
import { FractalHowItWorks } from "@/app/components/fractal/how-it-works";
import { FractalMotionRoot } from "@/app/components/fractal/motion";
import { FractalNavbar } from "@/app/components/fractal/navbar";
import { FractalPricing } from "@/app/components/fractal/pricing";

export function FractalLandingPage() {
  return (
    <FractalMotionRoot>
    <div className="min-h-screen bg-background text-foreground">
      <FractalNavbar />
      <main>
        <FractalHero />
        <FractalBenefits />
        <FractalHowItWorks />
        <FractalPricing />
        <FractalFaq />
        <FractalFinalCta />
      </main>
      <FractalFooter />
    </div>
    </FractalMotionRoot>
  );
}

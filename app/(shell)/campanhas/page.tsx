import { Suspense } from "react";
import { AppShellMain } from "@/app/components/app-shell";
import { CampaignsLoadingFallback } from "@/app/components/loading-fallbacks";
import { CampaignsHierarchy } from "@/app/components/campaigns-hierarchy";
import { PlatformTabs } from "@/app/components/platform-tabs";
import { campaignsForPlatform, loadClientAnalytics } from "@/lib/analytics";
import { clientSubtitle, getClientPageContext } from "@/lib/client-page";

async function CampaignsPageContent() {
  const { planActive, clientId, title } = await getClientPageContext();
  const analytics = await loadClientAnalytics(clientId, planActive);

  return (
    <AppShellMain
      title={title}
      subtitle={clientSubtitle(planActive, analytics.dashboard.period)}
      planActive={planActive}
    >
      <div className="space-y-4">
        <header>
          <p className="text-[11px] uppercase tracking-wider text-muted">
            Campanhas
          </p>
          <h2 className="mt-1 text-lg font-medium tracking-tight">
            Estrutura por plataforma
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Performance e hierarquia publicadas (campanha → grupo → anúncio). O
            plano de marketing e o funil de aquisição são definidos na Lótus.
          </p>
        </header>
        <PlatformTabs
          google={
            <CampaignsHierarchy
              campaigns={campaignsForPlatform(analytics.campaigns, "google")}
            />
          }
          meta={
            <CampaignsHierarchy
              campaigns={campaignsForPlatform(analytics.campaigns, "meta")}
            />
          }
        />
      </div>
    </AppShellMain>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsLoadingFallback />}>
      <CampaignsPageContent />
    </Suspense>
  );
}

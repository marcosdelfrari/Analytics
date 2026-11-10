import { Suspense } from "react";
import { AppShellMain } from "@/app/components/app-shell";
import { DashboardHome } from "@/app/components/dashboard-home";
import { DashboardLoadingFallback } from "@/app/components/loading-fallbacks";
import { loadClientAnalytics } from "@/lib/analytics";
import { clientSubtitle, getClientPageContext } from "@/lib/client-page";
import { canRegisterResources } from "@/lib/organization-access";

async function DashboardPageContent() {
  const { planActive, clientId, title, session } = await getClientPageContext();
  const analytics = await loadClientAnalytics(
    clientId,
    planActive,
    undefined,
    "overview",
  );
  const showSetupLink = !session || canRegisterResources(session);

  return (
    <AppShellMain
      title={title}
      subtitle={`Visão executiva · ${clientSubtitle(planActive, analytics.dashboard.period)}`}
      planActive={planActive}
    >
      <DashboardHome
        dashboard={analytics.dashboard}
        evolution={analytics.evolution}
        siteTracking={analytics.siteTracking}
        showSetupLink={showSetupLink}
      />
    </AppShellMain>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardPageContent />
    </Suspense>
  );
}

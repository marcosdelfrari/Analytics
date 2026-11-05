import { Suspense } from "react";
import { isSystemAdminAccount } from "@/lib/access-roles";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShellMain } from "@/app/components/app-shell";
import { DocumentacaoLoadingFallback } from "@/app/components/loading-fallbacks";
import { GuideContent } from "@/app/(shell)/documentacao/guide-content";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";

async function DocumentacaoPageContent() {
  await connection();
  let planActive = true;

  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (!isSystemAdminAccount(session.role) && session.role !== "client") {
      redirect("/login");
    }
    planActive = isSystemAdminAccount(session.role) || session.planActive;
  }

  return (
    <AppShellMain
      title="Guia"
      subtitle="Papéis, menu e fluxos do painel Fractal"
      planActive={planActive}
    >
      <GuideContent />
    </AppShellMain>
  );
}

export default function DocumentacaoPage() {
  return (
    <Suspense fallback={<DocumentacaoLoadingFallback />}>
      <DocumentacaoPageContent />
    </Suspense>
  );
}

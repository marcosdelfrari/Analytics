import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AppShellMain } from "@/app/components/app-shell";
import { DocumentacaoLoadingFallback } from "@/app/components/loading-fallbacks";
import { GuideContent } from "@/app/(shell)/documentacao/guide-content";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";
import { shellModeFromRole, type ShellMode } from "@/lib/shell-mode";

async function DocumentacaoPageContent() {
  await connection();
  let mode: ShellMode = "agency";
  let planActive = true;

  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "admin" && session.role !== "client") {
      redirect("/login");
    }
    mode = shellModeFromRole(session.role);
    planActive = session.role === "admin" || session.planActive;
  }

  return (
    <AppShellMain
      title="Guia"
      subtitle="Passo a passo e dicas de uso"
      planActive={planActive}
    >
      <GuideContent mode={mode} />
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

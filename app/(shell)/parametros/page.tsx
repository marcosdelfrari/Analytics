import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { UrlBuilder } from "@/app/(shell)/parametros/url-builder";
import { AppShellMain } from "@/app/components/app-shell";
import { ParametrosLoadingFallback } from "@/app/components/loading-fallbacks";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";

async function ParametersPageContent() {
  await connection();
  let planActive = true;

  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "admin" && session.role !== "client") {
      redirect("/login");
    }
    planActive = session.role === "admin" || session.planActive;
  }

  return (
    <AppShellMain
      title="Parâmetros"
      subtitle="Referência da URL — configure no anúncio, não aqui"
      planActive={planActive}
    >
      <UrlBuilder />
    </AppShellMain>
  );
}

export default function ParametersPage() {
  return (
    <Suspense fallback={<ParametrosLoadingFallback />}>
      <ParametersPageContent />
    </Suspense>
  );
}

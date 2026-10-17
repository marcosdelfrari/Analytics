import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { UrlBuilder } from "@/app/parametros/url-builder";
import { AppShell } from "@/app/components/app-shell";
import { ParametrosLoadingFallback } from "@/app/components/loading-fallbacks";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";

async function Builder() {
  await connection();
  let mode: "client" | "admin" = "admin";
  let planActive = true;

  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "admin" && session.role !== "client") {
      redirect("/login");
    }
    mode = session.role === "admin" ? "admin" : "client";
    planActive = session.role === "admin" || session.planActive;
  }

  return (
    <AppShell
      mode={mode}
      title="URL"
      subtitle="Monte o destino da campanha"
      planActive={planActive}
    >
      <UrlBuilder />
    </AppShell>
  );
}

export default function ParametersPage() {
  return (
    <Suspense fallback={<ParametrosLoadingFallback />}>
      <Builder />
    </Suspense>
  );
}

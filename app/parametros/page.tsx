import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { UrlBuilder } from "@/app/parametros/url-builder";
import { AppShell } from "@/app/components/app-shell";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";

function Loading() {
  return (
    <AppShell
      mode="admin"
      eyebrow="Parâmetros"
      title="URL"
      subtitle="Carregando montador"
    >
      <div className="border border-border bg-surface px-6 py-10 text-sm text-muted">
        Carregando montador
      </div>
    </AppShell>
  );
}

async function Builder() {
  await connection();
  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "admin") redirect("/");
  }

  return (
    <AppShell
      mode="admin"
      eyebrow="Parâmetros"
      title="URL"
      subtitle="Monte o destino da campanha"
    >
      <UrlBuilder />
    </AppShell>
  );
}

export default function ParametersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Builder />
    </Suspense>
  );
}

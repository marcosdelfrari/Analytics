import type { ReactNode } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppShellChrome } from "@/app/components/app-shell-chrome";
import { AppShellMain } from "@/app/components/app-shell";
import { SkeletonScreenReader } from "@/app/components/skeleton";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { shellModeFromRole } from "@/lib/shell-mode";

function ShellLayoutFallback() {
  return (
    <AppShellChrome>
      <AppShellMain title="" subtitle="" headerSkeleton>
        <SkeletonScreenReader label="Carregando aplicativo" />
      </AppShellMain>
    </AppShellChrome>
  );
}

async function ShellLayoutWithSession({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (authEnabled && !session) {
    redirect("/login");
  }

  if (
    authEnabled &&
    session &&
    session.role !== "admin" &&
    session.role !== "client"
  ) {
    redirect("/login");
  }

  const sessionMode =
    authEnabled && session ? shellModeFromRole(session.role) : undefined;

  return (
    <AppShellChrome sessionMode={sessionMode}>{children}</AppShellChrome>
  );
}

export default function ShellRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<ShellLayoutFallback />}>
      <ShellLayoutWithSession>{children}</ShellLayoutWithSession>
    </Suspense>
  );
}

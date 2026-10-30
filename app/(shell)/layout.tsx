import type { ReactNode } from "react";
import { NOINDEX_METADATA } from "@/lib/seo";

export const metadata = NOINDEX_METADATA;
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppShellChrome } from "@/app/components/app-shell-chrome";
import { AppShellMain } from "@/app/components/app-shell";
import { SkeletonScreenReader } from "@/app/components/skeleton";
import { CompanySwitcher } from "@/app/components/company-switcher";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { resolveClientCompanyContext } from "@/lib/company-context";
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
  const navContext =
    authEnabled && session
      ? {
          platformAdmin: session.role === "admin",
          organizationOwner:
            session.role !== "admin" && session.isOrganizationOwner,
        }
      : undefined;

  let switcherNode: ReactNode = null;
  if (authEnabled && session && session.role === "client") {
    const context = await resolveClientCompanyContext(session);
    if (context.accessibleCompanies.length > 0) {
      switcherNode = (
        <CompanySwitcher
          companies={context.accessibleCompanies}
          activeCompanyId={context.activeCompanyId}
        />
      );
    }
  }

  const user =
    authEnabled && session
      ? {
          name: session.name,
          email: session.email,
          roleLabel:
            session.role === "admin"
              ? "Administrador"
              : session.isOrganizationOwner
                ? "Proprietário"
                : "Analista",
        }
      : undefined;

  return (
    <AppShellChrome
      sessionMode={sessionMode}
      navContext={navContext}
      companySwitcher={switcherNode}
      user={user}
    >
      {children}
    </AppShellChrome>
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

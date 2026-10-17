import type { ReactNode } from "react";
import { AppShellLayout, AppShellMain } from "@/app/components/app-shell-layout";
import type { ShellMode } from "@/lib/shell-mode";

interface AppShellProps {
  mode: ShellMode;
  title: string;
  subtitle: string;
  planActive?: boolean;
  headerSkeleton?: boolean;
  children: ReactNode;
}

export function AppShell(props: AppShellProps) {
  return <AppShellLayout {...props} />;
}

export { AppShellMain };

import type { ReactNode } from "react";
import { AppShellLayout } from "@/app/components/app-shell-layout";

interface AppShellProps {
  mode: "client" | "admin";
  title: string;
  subtitle: string;
  planActive?: boolean;
  headerSkeleton?: boolean;
  children: ReactNode;
}

export function AppShell(props: AppShellProps) {
  return <AppShellLayout {...props} />;
}

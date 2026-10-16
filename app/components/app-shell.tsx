import type { ReactNode } from "react";
import { Header } from "@/app/components/header";
import { Sidebar } from "@/app/components/sidebar";

interface AppShellProps {
  mode: "client" | "admin";
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AppShell({ mode, title, subtitle, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar mode={mode} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

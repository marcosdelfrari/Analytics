import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center border border-border bg-surface-elevated">
            <span className="font-mono text-xs">A</span>
          </div>
          <div>
            <p className="text-sm font-medium tracking-tight">Analytics</p>
            <p className="text-[11px] text-muted">Portal do cliente</p>
          </div>
        </div>
        <LoginForm />
        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          Acesso inicial do administrador: admin@analytics.local / admin
        </p>
      </div>
    </main>
  );
}

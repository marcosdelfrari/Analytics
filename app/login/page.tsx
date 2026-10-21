import { Suspense } from "react";
import { BrandMark } from "@/app/components/brand-mark";
import { CodeLoginForm } from "@/app/login/code-login-form";

const errors: Record<string, string> = {
  "sem-acesso": "Não foi possível criar sua conta. Tente de novo.",
  cancelado: "Login cancelado.",
  invalido: "Não foi possível entrar com o Google. Tente de novo.",
  config: "Login com Google ainda não está configurado.",
  servidor:
    "Não foi possível concluir o login. Verifique DATABASE_URL e se as migrações do Prisma foram aplicadas.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>
        <div className="border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h1 className="text-sm font-medium">Entrar</h1>
            <p className="mt-1 text-[12px] leading-5 text-muted">
              Se ainda não houver conta, o acesso cria um cadastro de
              interessado, sem plano. Os recursos são liberados depois da
              assinatura.
            </p>
          </div>
          <Suspense>
            <LoginError searchParams={searchParams} />
          </Suspense>
          <div className="border-t border-border px-4 py-3">
            <a
              href="/api/auth/google"
              className="block w-full border border-foreground bg-foreground px-3 py-1.5 text-center text-[12px] text-background"
            >
              Entrar com Google
            </a>
            <CodeLoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}

async function LoginError({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const message = erro ? errors[erro] : null;
  if (!message) return null;
  return <p className="px-4 pt-4 text-[12px] text-negative">{message}</p>;
}

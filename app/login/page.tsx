import { Suspense } from "react";
import { BrandMark } from "@/app/components/brand-mark";

const errors: Record<string, string> = {
  "sem-acesso": "Essa conta Google não está cadastrada. Use Cadastrar com Google.",
  cancelado: "Login cancelado.",
  invalido: "Não foi possível entrar com o Google. Tente de novo.",
  config: "Login com Google ainda não está configurado.",
  servidor:
    "O servidor não conseguiu gravar o acesso. A pasta data precisa existir e permitir escrita.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>
        <div className="border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h1 className="text-sm font-medium">Entrar</h1>
            <p className="text-[12px] text-muted">Entre ou crie a conta com o Google</p>
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
            <a
              href="/api/auth/google?intent=signup"
              className="mt-2 block w-full border border-border px-3 py-1.5 text-center text-[12px] text-foreground"
            >
              Cadastrar com Google
            </a>
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

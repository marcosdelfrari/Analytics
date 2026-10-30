import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SetPasswordForm } from "@/app/definir-senha/set-password-form";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const instant = false;

async function DefinirSenhaContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await connection();
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/definir-senha");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const { next } = await searchParams;
  const returnTo =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (user?.passwordHash) {
    redirect(returnTo);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-xl font-semibold tracking-tight">Definir senha</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Você entrou como <span className="text-foreground">{session.email}</span>.
        Crie uma senha se quiser entrar também com e-mail e senha.
      </p>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <SetPasswordForm next={returnTo} />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href={returnTo} className="underline underline-offset-4">
          Agora não
        </Link>
      </p>
    </main>
  );
}

export default function DefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
          <div className="h-8 w-48 animate-pulse rounded bg-muted/30" />
        </main>
      }
    >
      <DefinirSenhaContent searchParams={searchParams} />
    </Suspense>
  );
}

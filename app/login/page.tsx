import { LoginPanel } from "@/app/components/auth-panel";

const errors: Record<string, string> = {
  "sem-acesso": "Não foi possível criar sua conta. Tente de novo.",
  cancelado: "Login cancelado.",
  invalido: "Não foi possível entrar com o Google. Tente de novo.",
  config: "Login com Google ainda não está configurado.",
  servidor:
    "Não foi possível concluir o login. Verifique DATABASE_URL e se as migrações do Prisma foram aplicadas.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; next?: string }>;
}) {
  const { erro, next } = await searchParams;
  const message = erro ? errors[erro] : null;
  const returnTo =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";

  return <LoginPanel next={returnTo} message={message} />;
}

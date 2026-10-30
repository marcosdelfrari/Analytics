import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";

/** Garante sessão de administrador da plataforma. */
export async function requireAdmin() {
  if (!authEnabled) return null;

  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/dashboard");
  return session;
}

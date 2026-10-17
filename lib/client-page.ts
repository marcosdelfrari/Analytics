import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { listClients } from "@/lib/users-store";

export async function getClientPageContext() {
  await connection();
  const session = await getSession();
  if (authEnabled) {
    if (!session) redirect("/login");
    if (session.role === "admin") redirect("/admin");
  }

  const planActive = session?.role !== "client" || session.planActive;
  const clientId =
    session?.role === "client"
      ? session.userId
      : (await listClients())[0]?.id;
  const title = session?.role === "client" ? session.name : "Conta";

  return { session, planActive, clientId, title };
}

export function clientSubtitle(planActive: boolean, period: string) {
  return planActive ? period : `${period} · demonstração`;
}

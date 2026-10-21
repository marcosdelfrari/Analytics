import type { Account } from "@/lib/types";
import {
  ensureAdminFromEnv,
  ensureUserForEmail,
  findAccountByEmail,
} from "@/lib/users-store";

export type LoginResult =
  | { ok: true; account: Account }
  | { ok: false; error: "sem-acesso" | "servidor" };

export async function resolveAccountForLogin(
  email: string,
  displayName?: string,
): Promise<LoginResult> {
  try {
    await ensureAdminFromEnv();
    const normalized = email.trim().toLowerCase();

    let account = await findAccountByEmail(normalized);
    if (!account) {
      account = await ensureUserForEmail({
        name: displayName?.trim() || normalized,
        email: normalized,
      });
    }
    if (!account) return { ok: false, error: "sem-acesso" };
    return { ok: true, account };
  } catch (error) {
    console.error("Falha ao resolver conta de login", error);
    return { ok: false, error: "servidor" };
  }
}

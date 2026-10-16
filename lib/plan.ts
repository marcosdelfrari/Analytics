import type { Account } from "@/lib/types";

export function hasActivePlan(account: Pick<Account, "role" | "planActive">) {
  return account.role === "admin" || account.planActive;
}

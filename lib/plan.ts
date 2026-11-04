import type { Account } from "@/lib/types";
import { isSystemAdminAccount } from "@/lib/access-roles";

export function hasActivePlan(account: Pick<Account, "role" | "planActive">) {
  return isSystemAdminAccount(account.role) || account.planActive;
}

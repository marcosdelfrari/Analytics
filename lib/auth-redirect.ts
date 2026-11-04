import type { Account } from "@/lib/types";
import { isSystemAdminAccount } from "@/lib/access-roles";

export function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

export async function destinationAfterLogin(
  account: Account,
  returnTo: string,
) {
  if (
    returnTo.startsWith("/oauth/authorize") ||
    returnTo.startsWith("/agent/")
  ) {
    return returnTo;
  }

  if (!isSystemAdminAccount(account.role) && returnTo.startsWith("/admin")) {
    return "/dashboard";
  }

  return returnTo;
}

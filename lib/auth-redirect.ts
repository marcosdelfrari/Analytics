import type { Account } from "@/lib/types";

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

  if (account.role === "admin") {
    return returnTo.startsWith("/admin") ? returnTo : "/admin";
  }

  return returnTo;
}

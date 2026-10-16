"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, sessionCookie } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { findAccountByEmail } from "@/lib/users-store";

export type LoginState = { error: string } | null;

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const account = await findAccountByEmail(email);

  if (!account || !verifyPassword(password, account.passwordHash)) {
    return { error: "E-mail ou senha incorretos." };
  }

  const token = await signSession({
    userId: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
  });
  const jar = await cookies();
  jar.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(account.role === "admin" ? "/admin" : "/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(sessionCookie);
  redirect("/login");
}

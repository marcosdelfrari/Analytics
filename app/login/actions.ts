"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveAccountForLogin } from "@/lib/complete-login";
import {
  generateLoginCode,
  saveLoginOtp,
  verifyLoginOtp,
} from "@/lib/login-otp";
import { resendConfigured, sendLoginCodeEmail } from "@/lib/resend";
import { sessionCookie, sessionCookieOptions, signSession } from "@/lib/session";

export type LoginCodeFormState = {
  error?: string;
  sent?: boolean;
  email?: string;
} | null;

function normalizeEmail(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase();
}

async function requestOrigin() {
  const { siteOrigin } = await import("@/lib/site");
  return siteOrigin();
}

export async function requestLoginCode(
  _prev: LoginCodeFormState,
  formData: FormData,
): Promise<LoginCodeFormState> {
  const email = normalizeEmail(formData.get("email"));
  if (!email.includes("@")) {
    return { error: "Informe um e-mail válido." };
  }
  if (!resendConfigured()) {
    return { error: "Envio de e-mail ainda não está configurado." };
  }

  const code = generateLoginCode();
  try {
    await saveLoginOtp(email, code);
  } catch (error) {
    console.error("Falha ao salvar codigo OTP", error);
    return { error: "Não foi possível gerar o código. Tente de novo." };
  }

  const sent = await sendLoginCodeEmail(email, code);
  if (sent.error) return { error: sent.error };

  return { sent: true, email };
}

export async function verifyLoginCode(
  _prev: LoginCodeFormState,
  formData: FormData,
): Promise<LoginCodeFormState> {
  const email = normalizeEmail(formData.get("email"));
  const code = String(formData.get("code") ?? "");

  if (!email.includes("@")) {
    return { error: "E-mail inválido.", email };
  }
  if (!code.trim()) {
    return { error: "Informe o código de 6 dígitos.", sent: true, email };
  }

  const valid = await verifyLoginOtp(email, code);
  if (!valid) {
    return {
      error: "Código inválido ou expirado.",
      sent: true,
      email,
    };
  }

  const resolved = await resolveAccountForLogin(email);
  if (!resolved.ok) {
    const message =
      resolved.error === "sem-acesso"
        ? "Este e-mail não tem mais acesso."
        : "Não foi possível concluir o login.";
    return { error: message, sent: true, email };
  }

  const account = resolved.account;
  const token = await signSession({
    userId: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
  });

  const jar = await cookies();
  jar.set(sessionCookie, token, sessionCookieOptions(await requestOrigin()));
  redirect(account.role === "admin" ? "/admin" : "/dashboard");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(sessionCookie);
  redirect("/login");
}

const RESEND_API = "https://api.resend.com/emails";

function apiKey() {
  return process.env.RESEND_API_KEY?.trim() ?? "";
}

function fromAddress() {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (configured) return configured;
  return "onboarding@resend.dev";
}

export function resendConfigured() {
  return Boolean(apiKey());
}

function resendErrorMessage(status: number, body: string) {
  let apiMessage = "";
  try {
    const parsed = JSON.parse(body) as { message?: string };
    apiMessage = parsed.message?.trim() ?? "";
  } catch {
    /* ignore */
  }

  if (
    status === 403 &&
    apiMessage.toLowerCase().includes("testing emails")
  ) {
    return "No modo de teste do Resend, o código só pode ir para o e-mail da sua conta Resend. Verifique um domínio em resend.com/domains ou teste com esse e-mail.";
  }

  if (status === 401) {
    return "Chave da API Resend inválida. Confira RESEND_API_KEY no ambiente.";
  }

  if (apiMessage) return apiMessage;

  return "Não foi possível enviar o e-mail. Tente de novo.";
}

export async function sendLoginCodeEmail(to: string, code: string) {
  const key = apiKey();
  if (!key) {
    return { error: "Envio de e-mail não configurado." } as const;
  }

  const response = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [to],
      subject: "Seu código de acesso - Fractal Analytics",
      text: [
        "Use o código abaixo para entrar na Fractal Analytics:",
        "",
        code,
        "",
        "O código expira em 15 minutos. Se você não pediu este e-mail, ignore.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Resend falhou", response.status, body);
    return { error: resendErrorMessage(response.status, body) } as const;
  }

  return { ok: true } as const;
}

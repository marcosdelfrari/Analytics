"use client";

import { useActionState, useState } from "react";
import {
  requestLoginCode,
  verifyLoginCode,
  type LoginCodeFormState,
} from "@/app/login/actions";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-[12px] text-foreground outline-none focus:border-muted-foreground";

export function CodeLoginForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [requestState, requestAction, requestPending] = useActionState<
    LoginCodeFormState,
    FormData
  >(requestLoginCode, null);
  const [verifyState, verifyAction, verifyPending] = useActionState<
    LoginCodeFormState,
    FormData
  >(verifyLoginCode, null);

  const sent =
    requestState?.sent === true ||
    (verifyState?.sent === true && Boolean(verifyState.email));
  const activeEmail = requestState?.email ?? verifyState?.email ?? email;

  if (!open) {
    return (
      <p className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[12px] text-muted underline decoration-border underline-offset-2 hover:text-foreground"
        >
          Entrar com código por e-mail
        </button>
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-3 text-center text-[12px] text-muted">
        Receba um código de 6 dígitos no seu e-mail
      </p>

      {!sent ? (
        <form
          action={requestAction}
          className="space-y-3"
          onSubmit={(event) => {
            const form = event.currentTarget;
            const value = new FormData(form).get("email");
            if (typeof value === "string") setEmail(value);
          }}
        >
          <label className="block text-[12px] text-muted-foreground">
            E-mail
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {requestState?.error && (
            <p className="text-[12px] text-negative">{requestState.error}</p>
          )}
          <button
            type="submit"
            disabled={requestPending}
            className="w-full border border-border bg-background px-3 py-1.5 text-[12px] text-foreground disabled:opacity-60"
          >
            {requestPending ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-3">
          <input type="hidden" name="email" value={activeEmail} />
          <p className="text-[12px] text-muted-foreground">
            Código enviado para{" "}
            <span className="text-foreground">{activeEmail}</span>
          </p>
          <label className="block text-[12px] text-muted-foreground">
            Código
            <input
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              className={fieldClass}
              placeholder="000000"
            />
          </label>
          {verifyState?.error && (
            <p className="text-[12px] text-negative">{verifyState.error}</p>
          )}
          <button
            type="submit"
            disabled={verifyPending}
            className="w-full border border-foreground bg-foreground px-3 py-1.5 text-[12px] text-background disabled:opacity-60"
          >
            {verifyPending ? "Entrando…" : "Confirmar código"}
          </button>
          <button
            type="button"
            className="w-full text-[12px] text-muted underline decoration-border underline-offset-2"
            onClick={() => window.location.reload()}
          >
            Usar outro e-mail
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-3 w-full text-[12px] text-muted"
      >
        Voltar
      </button>
    </div>
  );
}

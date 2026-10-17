"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import {
  verifyScriptInstallation,
  type InstallVerifyState,
} from "@/app/rastreamento/actions";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted-foreground";

const POLL_MS = 2_500;
const LISTEN_MS = 120_000;

type LiveHit = {
  path: string;
  url: string;
  at: string;
};

export function InstallationTestPanel({
  hasDomains,
}: {
  hasDomains: boolean;
}) {
  const [htmlState, htmlAction, htmlPending] = useActionState<
    InstallVerifyState,
    FormData
  >(verifyScriptInstallation, null);

  const [listening, setListening] = useState(false);
  const [liveHit, setLiveHit] = useState<LiveHit | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const sinceRef = useRef<string | null>(null);
  const listenUntilRef = useRef(0);

  const pollLive = useCallback(async () => {
    const since = sinceRef.current;
    if (!since) return;

    try {
      const response = await fetch(
        `/api/tracking/live?since=${encodeURIComponent(since)}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setLiveError(body.error ?? "Não foi possível verificar a visita.");
        setListening(false);
        return;
      }
      const body = (await response.json()) as {
        received: boolean;
        hit?: LiveHit;
      };
      if (body.received && body.hit) {
        setLiveHit(body.hit);
        setListening(false);
      }
    } catch {
      setLiveError("Falha de rede ao aguardar a visita.");
      setListening(false);
    }
  }, []);

  useEffect(() => {
    if (!listening) return;

    void pollLive();
    const interval = setInterval(() => {
      if (Date.now() > listenUntilRef.current) {
        setListening(false);
        return;
      }
      void pollLive();
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [listening, pollLive]);

  function startLiveTest() {
    if (!hasDomains) {
      setLiveError("Cadastre um domínio autorizado antes de testar.");
      return;
    }
    setLiveError(null);
    setLiveHit(null);
    sinceRef.current = new Date().toISOString();
    listenUntilRef.current = Date.now() + LISTEN_MS;
    setListening(true);
  }

  const htmlOk = htmlState && "ok" in htmlState ? htmlState : null;
  const htmlErr = htmlState && "error" in htmlState ? htmlState.error : null;

  return (
    <section className="border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Testar instalação</h2>
        <p className="text-[12px] text-muted">
          Duas etapas: conferir se a tag aparece no HTML e confirmar se a visita
          chegou na coleta desta conta.
        </p>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Etapa 1 — Tag na página
          </p>
          <form action={htmlAction} className="grid gap-3">
            <label className="block text-[12px] text-muted-foreground">
              URL de uma página do site
              <input
                name="pageUrl"
                type="url"
                required
                disabled={!hasDomains || htmlPending}
                placeholder="https://cliente.com.br/"
                className={fieldClass}
              />
            </label>
            {!hasDomains && (
              <p className="text-[12px] text-amber-700 dark:text-amber-400">
                Cadastre um domínio acima para liberar o teste.
              </p>
            )}
            {htmlErr && (
              <p className="text-[12px] text-red-600 dark:text-red-400">
                {htmlErr}
              </p>
            )}
            {htmlOk && (
              <div
                className={`text-[12px] ${
                  htmlOk.foundTrackerScript && htmlOk.foundPublicKey
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                <p>{htmlOk.message}</p>
                <p className="mt-1 font-mono text-[11px] opacity-80">
                  {htmlOk.pageUrl}
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={!hasDomains || htmlPending}
              className="w-fit border border-border px-4 py-2 text-[12px] font-medium disabled:opacity-50"
            >
              {htmlPending ? "Verificando…" : "Verificar tag no HTML"}
            </button>
          </form>
        </div>

        <div className="grid gap-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Etapa 2 — Visita na coleta
          </p>
          <ol className="list-decimal space-y-1 pl-4 text-[12px] text-muted">
            <li>Clique em aguardar visita.</li>
            <li>Abra o site em outra aba (mesma página ou home).</li>
            <li>Voltamos aqui quando a visita chegar (até 2 min).</li>
          </ol>
          {liveError && (
            <p className="text-[12px] text-red-600 dark:text-red-400">
              {liveError}
            </p>
          )}
          {liveHit && (
            <div className="text-[12px] text-emerald-700 dark:text-emerald-400">
              <p>Visita recebida com sucesso.</p>
              <p className="mt-1 font-mono text-[11px]">{liveHit.path}</p>
              <p className="mt-1 text-[11px] opacity-80">
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "medium",
                }).format(new Date(liveHit.at))}
              </p>
            </div>
          )}
          {listening && !liveHit && (
            <p className="text-[12px] text-muted">Aguardando visita…</p>
          )}
          <button
            type="button"
            onClick={startLiveTest}
            disabled={!hasDomains || listening}
            className="w-fit border border-border px-4 py-2 text-[12px] font-medium disabled:opacity-50"
          >
            {listening ? "Escutando…" : "Aguardar visita"}
          </button>
        </div>
      </div>
    </section>
  );
}

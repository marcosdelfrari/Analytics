"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  checkLoginEmailAction,
  loginWithPasswordAction,
  registerWithPasswordAction,
  type AuthFormState,
  type CheckLoginEmailState,
} from "@/app/login/actions";
import { BrandMark } from "@/app/components/brand-mark";
import { HeroPreview } from "@/app/components/fractal/hero-preview";
import { motionEase } from "@/app/components/fractal/motion";

const fieldClass =
  "mt-1 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[12.5px] text-white placeholder:text-white/30 outline-none transition focus:border-white/30 focus:bg-white/[0.05]";

const secondaryButtonClass =
  "w-full cursor-pointer rounded-lg border border-white/12 bg-transparent px-3.5 py-2 text-[12.5px] font-medium text-white/85 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-white";

const primaryButtonClass =
  "w-full cursor-pointer rounded-lg bg-[#ededed] px-3.5 py-2 text-[12.5px] font-medium text-[#0c0c0c] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.12 7.12 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

function GoogleButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false);

  return (
    <a
      href={`/api/auth/google?next=${encodeURIComponent(next)}`}
      onClick={() => setPending(true)}
      aria-busy={pending}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-[12.5px] font-medium text-white transition hover:bg-white/[0.08] ${
        pending ? "pointer-events-none cursor-wait opacity-65" : ""
      }`}
    >
      <GoogleIcon />
      <span>{pending ? "Abrindo Google…" : "Continuar com Google"}</span>
    </a>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-[11px] uppercase tracking-[0.16em] text-white/35">
        ou
      </span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function AuthHeroShowcase() {
  return (
    <div className="relative flex w-full max-w-[min(100%,32rem)] flex-col justify-center">
      <div
        className="pointer-events-none absolute -inset-6 rounded-2xl bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.04] blur-2xl"
        aria-hidden
      />
      <motion.div
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#151513] shadow-2xl shadow-black/50"
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-2 text-[11px] text-white/45">Dashboard</span>
        </div>
        <HeroPreview />
      </motion.div>
      <p className="relative mt-4 text-center text-[12px] text-white/45">
        Prévia da plataforma com dados ilustrativos.
      </p>
    </div>
  );
}

function AuthShell({
  title,
  description,
  children,
  footer,
  compact = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
}) {
  return (
    <main className="grid h-dvh max-h-dvh overflow-hidden bg-[#0e0e0d] text-white lg:grid-cols-2">
      <div className="hidden min-h-0 items-center justify-center border-r border-white/[0.06] px-6 py-8 sm:px-10 lg:flex xl:px-14 2xl:px-20">
        <AuthHeroShowcase />
      </div>

      <div className="flex min-h-0 flex-col px-5 py-5 sm:px-10 sm:py-6 lg:px-10 xl:px-14 2xl:px-16">
        <header className="flex shrink-0 justify-center pb-2 pt-1">
          <BrandMark priority href="/" />
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto py-3 [scrollbar-width:thin] sm:py-4">
          <div className={`mx-auto w-full ${compact ? "max-w-[340px]" : "max-w-[360px]"}`}>
            <div className="text-center">
              <h1
                className={`font-semibold leading-tight tracking-tight text-white ${
                  compact
                    ? "text-[1.35rem] sm:text-[1.5rem]"
                    : "text-[1.55rem] sm:text-[1.75rem]"
                }`}
              >
                {title}
              </h1>
              <p
                className={`mx-auto mt-1.5 max-w-[32ch] text-white/60 ${
                  compact
                    ? "text-[12px] leading-5"
                    : "text-[12.5px] leading-5"
                }`}
              >
                {description}
              </p>
            </div>

            <div
              className={`rounded-2xl border border-white/10 bg-[#151513] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)] ${
                compact ? "mt-4 p-4" : "mt-5 p-4 sm:p-5"
              }`}
            >
              {children}
            </div>

            {footer ? (
              <div className={`text-center ${compact ? "mt-3.5" : "mt-4"}`}>
                {footer}
              </div>
            ) : null}
          </div>
        </div>

        <footer className="shrink-0 pt-2 text-center text-[10.5px] text-white/30">
          Fractal — Analytics para mídia paga
        </footer>
      </div>
    </main>
  );
}

export function LoginPanel({
  next,
  message,
}: {
  next: string;
  message?: string | null;
}) {
  const [checkState, checkAction, checkPending] = useActionState<
    CheckLoginEmailState,
    FormData
  >(checkLoginEmailAction, null);
  const [loginState, loginAction, loginPending] = useActionState<
    AuthFormState,
    FormData
  >(loginWithPasswordAction, null);
  const [showEmailForm, setShowEmailForm] = useState(
    Boolean(loginState?.error || checkState?.error),
  );
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(
    checkState?.verifiedEmail ?? null,
  );
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(
    Boolean(checkState?.needsPasswordSetup),
  );

  useEffect(() => {
    if (loginState?.error || checkState?.error) {
      setShowEmailForm(true);
    }
  }, [loginState?.error, checkState?.error]);

  useEffect(() => {
    if (checkState?.verifiedEmail) {
      setVerifiedEmail(checkState.verifiedEmail);
      setNeedsPasswordSetup(Boolean(checkState.needsPasswordSetup));
    }
  }, [checkState?.verifiedEmail, checkState?.needsPasswordSetup]);

  const passwordStepError = loginState?.error;
  const passwordStepPending = loginPending;

  return (
    <AuthShell
      title="Bem-vindo à Fractal"
      description="O próximo passo para escalar os resultados do seu negócio começa aqui."
      footer={
        <p className="text-[12px] text-white/55">
          Primeiro acesso sem Google?{" "}
          <Link
            href={`/cadastro?next=${encodeURIComponent(next)}`}
            className="cursor-pointer font-medium text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
          >
            Criar conta com e-mail
          </Link>
        </p>
      }
    >
      {message ? (
        <p className="mb-2.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11.5px] text-red-300">
          {message}
        </p>
      ) : null}

      <div className="space-y-2.5">
        <GoogleButton next={next} />
        <Divider />

        <AnimatePresence initial={false} mode="wait">
          {!showEmailForm ? (
            <motion.button
              key="trigger"
              type="button"
              onClick={() => setShowEmailForm(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: motionEase }}
              className={secondaryButtonClass}
            >
              Continuar com e-mail e senha
            </motion.button>
          ) : !verifiedEmail ? (
            <motion.form
              key="email-step"
              action={checkAction}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: motionEase }}
              className="space-y-2.5 pt-0.5"
            >
              <label className="block text-[11.5px] text-white/70">
                E-mail
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="voce@empresa.com.br"
                  autoComplete="email"
                  className={fieldClass}
                />
              </label>
              {checkState?.error ? (
                <p className="text-[11.5px] text-red-300">{checkState.error}</p>
              ) : null}
              <button
                type="submit"
                disabled={checkPending}
                className={primaryButtonClass}
              >
                {checkPending ? "Verificando…" : "Continuar"}
              </button>
            </motion.form>
          ) : needsPasswordSetup ? (
            <motion.div
              key="google-only"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: motionEase }}
              className="space-y-2.5 pt-0.5"
            >
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[12px] text-white/85">
                {verifiedEmail}
              </div>
              <p className="text-[11.5px] leading-5 text-white/55">
                Esta conta entra com Google. Use o botão{" "}
                <span className="text-white/80">Continuar com Google</span> acima.
              </p>
              <p className="text-[11.5px] leading-5 text-white/55">
                Depois de entrar, você pode{" "}
                <Link
                  href={`/definir-senha?next=${encodeURIComponent(next)}`}
                  className="text-white underline decoration-white/30 underline-offset-2"
                >
                  definir uma senha
                </Link>{" "}
                para login com e-mail (opcional).
              </p>
              <button
                type="button"
                onClick={() => {
                  setVerifiedEmail(null);
                  setNeedsPasswordSetup(false);
                }}
                className={secondaryButtonClass}
              >
                Usar outro e-mail
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="password-step"
              action={loginAction}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: motionEase }}
              className="space-y-2.5 pt-0.5"
            >
              <input type="hidden" name="next" value={next} />
              <input type="hidden" name="email" value={verifiedEmail} />
              <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                <span className="truncate text-[12px] text-white/85">
                  {verifiedEmail}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVerifiedEmail(null);
                    setNeedsPasswordSetup(false);
                  }}
                  className="shrink-0 cursor-pointer text-[11px] text-white/55 underline decoration-white/25 underline-offset-2 transition hover:text-white"
                >
                  Alterar
                </button>
              </div>
              <label className="block text-[11.5px] text-white/70">
                Senha
                <input
                  name="password"
                  type="password"
                  required
                  autoFocus
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  className={fieldClass}
                />
              </label>
              {passwordStepError ? (
                <p className="text-[11.5px] text-red-300">{passwordStepError}</p>
              ) : null}
              <button
                type="submit"
                disabled={passwordStepPending}
                className={primaryButtonClass}
              >
                {passwordStepPending ? "Entrando…" : "Entrar com e-mail"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </AuthShell>
  );
}

export function RegisterPanel({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    registerWithPasswordAction,
    null,
  );
  const [showEmailForm, setShowEmailForm] = useState(true);

  return (
    <AuthShell
      compact
      title="Crie sua conta"
      description="Use Google ou cadastre com e-mail corporativo."
      footer={
        <p className="text-[12px] text-white/55">
          Já possui acesso?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="cursor-pointer font-medium text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
          >
            Entrar na conta
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <GoogleButton next={next} />
        <Divider />

        {!showEmailForm ? (
          <button
            type="button"
            onClick={() => setShowEmailForm(true)}
            className={secondaryButtonClass}
          >
            Cadastrar com e-mail e senha
          </button>
        ) : (
          <form action={action} className="space-y-2 pt-0.5">
            <input type="hidden" name="next" value={next} />
            <label className="block text-[11.5px] text-white/70">
              Nome
              <input
                name="name"
                type="text"
                required
                placeholder="Seu nome"
                autoComplete="name"
                className={fieldClass}
              />
            </label>
            <label className="block text-[11.5px] text-white/70">
              E-mail
              <input
                name="email"
                type="email"
                required
                placeholder="voce@empresa.com.br"
                autoComplete="email"
                className={fieldClass}
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-[11.5px] text-white/70">
                Senha
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mín. 8 caracteres"
                  autoComplete="new-password"
                  className={fieldClass}
                />
              </label>
              <label className="block text-[11.5px] text-white/70">
                Confirmar
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  className={fieldClass}
                />
              </label>
            </div>
            {state?.error ? (
              <p className="text-[11.5px] text-red-300">{state.error}</p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className={primaryButtonClass}
            >
              {pending ? "Criando conta…" : "Criar conta"}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

export function AuthRouteLoading({ title }: { title: string }) {
  return (
    <main className="grid h-dvh max-h-dvh overflow-hidden bg-[#0e0e0d] text-white lg:grid-cols-2">
      <div className="hidden min-h-0 items-center justify-center border-r border-white/[0.06] px-6 py-8 sm:px-10 lg:flex xl:px-14 2xl:px-20">
        <div className="h-[min(72vh,28rem)] w-full max-w-[min(100%,32rem)] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
      </div>

      <div className="flex min-h-0 flex-col px-5 py-5 sm:px-10 sm:py-6 lg:px-10 xl:px-14 2xl:px-16">
        <header className="flex shrink-0 justify-center pb-2 pt-1">
          <BrandMark priority href="/" />
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center py-4">
          <div className="mx-auto w-full max-w-[360px]">
            <div className="text-center">
              <h1 className="text-[1.55rem] font-semibold leading-tight tracking-tight text-white sm:text-[1.75rem]">
                {title}
              </h1>
              <div className="mx-auto mt-2 h-3.5 w-52 animate-pulse rounded bg-white/10" />
            </div>

            <div className="mt-5 space-y-2.5 rounded-2xl border border-white/10 bg-[#151513] p-4 sm:p-5">
              <div className="h-10 w-full animate-pulse rounded-lg bg-white/10" />
              <div className="mx-auto h-2.5 w-16 animate-pulse rounded bg-white/5" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-white/5" />
            </div>
          </div>
        </div>

        <footer className="shrink-0 pt-2 text-center text-[10.5px] text-white/30">
          Fractal — Analytics para mídia paga
        </footer>
      </div>
    </main>
  );
}

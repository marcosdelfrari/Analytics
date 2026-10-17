"use client";

import { PlanOffersPanel } from "@/app/components/plan-offers-panel";
import { useCallback, useEffect, useState } from "react";

type PlanUpgradeGateProps = {
  children: React.ReactNode;
};

type ModalStep = "closed" | "prompt" | "plans";

export function PlanUpgradeGate({ children }: PlanUpgradeGateProps) {
  const [step, setStep] = useState<ModalStep>("closed");

  const close = useCallback(() => setStep("closed"), []);

  useEffect(() => {
    if (step === "closed") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStep((current) => (current === "plans" ? "prompt" : "closed"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step]);

  const open = step !== "closed";

  return (
    <div className="relative min-h-0 md:min-h-[min(24rem,50vh)]">
      <div
        className={`transition-[filter,opacity] duration-200 ${
          open ? "pointer-events-none select-none blur-sm opacity-80" : ""
        }`}
        onClickCapture={(event) => {
          if (open) return;
          const target = event.target as HTMLElement;
          if (target.closest("a, button, input, textarea, select, label")) {
            event.preventDefault();
            event.stopPropagation();
          }
          setStep("prompt");
        }}
      >
        {children}
      </div>

      {step === "prompt" && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/65 p-4 backdrop-blur-md sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-upgrade-title"
          onClick={close}
        >
          <div
            className="max-h-[min(90dvh,520px)] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-surface px-5 py-5 text-center shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-[11px] uppercase tracking-wider text-muted">
              Plano necessário
            </p>
            <p id="plan-upgrade-title" className="mt-1 text-sm font-medium">
              Contrate um plano para utilizar os recursos
            </p>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
              Você está vendo o ambiente completo da plataforma. Para usar
              relatórios, campanhas e demais funcionalidades, escolha um plano.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setStep("plans")}
                className="inline-flex justify-center rounded-md bg-foreground px-4 py-2 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
              >
                Ver planos
              </button>
              <button
                type="button"
                onClick={close}
                className="inline-flex justify-center rounded-md border border-border px-4 py-2 text-[12px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              >
                Continuar explorando
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "plans" && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-background/65 p-4 backdrop-blur-md sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-offers-title"
          onClick={close}
        >
          <div
            className="flex max-h-[min(92dvh,760px)] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-surface px-4 py-4 shadow-lg sm:px-5 sm:py-5"
            onClick={(event) => event.stopPropagation()}
          >
            <PlanOffersPanel onClose={close} />
          </div>
        </div>
      )}
    </div>
  );
}

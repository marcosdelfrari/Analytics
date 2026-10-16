"use client";

import { useState } from "react";
import { SectionShell } from "@/app/components/lotus/section-shell";

const items = [
  {
    question: "O Lótus substitui o Google Ads ou Meta Ads?",
    answer:
      "Não. Ele consolida e apresenta os dados que sua equipe publica, para o cliente acompanhar performance sem acessar cada plataforma.",
  },
  {
    question: "Como faço login?",
    answer:
      "Use Entrar com Google na página de login. Contas novas podem se cadastrar; o acesso ao dashboard depende da configuração da sua organização.",
  },
  {
    question: "Posso baixar relatórios antigos?",
    answer:
      "Sim. Quando um período inclui arquivo anexado, o download aparece no histórico do dashboard.",
  },
  {
    question: "Quem publica os números no portal?",
    answer:
      "Usuários admin da sua operação publicam períodos e métricas; clientes visualizam apenas o que foi liberado para eles.",
  },
];

export function LotusFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionShell id="faq" title="Perguntas frequentes">
      <div className="mx-auto max-w-2xl divide-y divide-border rounded-xl border border-border bg-surface">
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-surface-elevated"
                aria-expanded={open}
              >
                {item.question}
                <span className="text-muted-foreground" aria-hidden>
                  {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

"use client";

import { useState } from "react";
import { SectionShell } from "@/app/components/lotus/section-shell";

const items = [
  {
    question: "Criar uma conta é gratuito?",
    answer:
      "Sim. Você pode criar sua conta gratuitamente e acessar o ambiente inicial da plataforma. A contratação de um plano é necessária para utilizar os recursos.",
  },
  {
    question: "O que posso ver depois de me cadastrar?",
    answer:
      "Você encontrará exemplos de telas que apresentam a estrutura da plataforma. Eles servem para conhecer o ambiente, mas não permitem utilizar as funcionalidades antes da assinatura.",
  },
  {
    question: "O cadastro gratuito inclui um período de teste?",
    answer:
      "Não. O cadastro gratuito dá acesso ao ambiente de apresentação, com exemplos de telas e recursos bloqueados. O uso das funcionalidades é liberado após a contratação de um plano.",
  },
  {
    question: "Como faço para contratar um plano?",
    answer:
      "Depois de entrar na sua conta, clique em “Ver planos” na tela inicial. Compare as opções disponíveis e escolha o plano que atende à sua necessidade.",
  },
  {
    question: "Ao contratar, todos os recursos são liberados?",
    answer:
      "O acesso depende do plano escolhido. Antes de contratar, consulte os recursos e limites incluídos em cada opção.",
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

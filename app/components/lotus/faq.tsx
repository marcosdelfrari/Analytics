"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SectionShell } from "@/app/components/lotus/section-shell";

const items = [
  {
    question: "Como o Lótus Analytics se diferencia do GA4?",
    answer:
      "Diferente do GA4, que pode ser complexo e ter dados amostrados, o Lótus foca na clareza financeira. Nós cruzamos o que você realmente gastou no Google/Meta com o tráfego que chegou ao site, sem complicações.",
  },
  {
    question: "Preciso de um desenvolvedor para instalar?",
    answer:
      "Não. Você só precisa copiar um único script e colar no cabeçalho (head) do seu site ou via Google Tag Manager. É tão simples quanto instalar um pixel do Facebook.",
  },
  {
    question: "Posso gerenciar vários clientes na mesma conta?",
    answer:
      "Sim! No plano Business, você entra no modo agência e pode criar dashboards individuais para cada cliente, publicando relatórios específicos para eles.",
  },
  {
    question: "Os dados de investimento são atualizados como?",
    answer:
      "Você publica os dados de investimento (gasto e conversões) através do painel, garantindo que o dashboard reflita exatamente o que foi acordado e investido no período.",
  },
  {
    question: "O encurtador de links substitui o Bitly?",
    answer:
      "Sim, e com a vantagem de que os cliques já são integrados ao seu ecossistema de rastreamento UTM, mantendo tudo sob o mesmo teto e com a sua marca.",
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
                <motion.span
                  className="text-muted-foreground"
                  aria-hidden
                  animate={{ rotate: open ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-6 text-muted-foreground">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

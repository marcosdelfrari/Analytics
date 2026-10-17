"use client";

import { motion } from "framer-motion";
import { HeroPreview } from "@/app/components/lotus/hero-preview";
import { fadeUp } from "@/app/components/lotus/motion";

export function LotusHero() {
  return (
    <section className="px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
      <motion.div
        className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-5"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
        }}
      >
        <motion.div className="order-1 lg:col-start-1" variants={fadeUp}>
          <p className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-[12px] text-muted-foreground">
            Para quem investe em marketing e mídia paga
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Transforme o caos dos anúncios em clareza estratégica.
          </h1>
        </motion.div>

        <motion.div
          className="relative order-2 lg:col-start-2 lg:row-span-4 lg:row-start-1"
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.98 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <div
            className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-surface-elevated via-transparent to-border/40 blur-2xl"
            aria-hidden
          />
          <motion.div
            className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="hidden items-center gap-2 border-b border-border px-4 py-3 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="ml-2 text-[11px] text-muted">lótus — dashboard</span>
            </div>
            <HeroPreview />
          </motion.div>
          <p className="mt-3 text-center text-[12px] text-muted">
            Prévia da plataforma com dados ilustrativos.
          </p>
        </motion.div>

        <motion.p
          className="order-3 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:col-start-1"
          variants={fadeUp}
        >
          Chega de planilhas confusas. Una Google Ads e Meta Ads em um só lugar
          e tenha transparência total sobre o que cada clique está gerando no
          seu site. A ponte definitiva entre o investimento e o resultado.
        </motion.p>

        <motion.div
          className="order-4 flex flex-wrap items-center gap-3 lg:col-start-1"
          variants={fadeUp}
        >
          <a
            href="/api/auth/google"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Criar meu Dashboard Grátis
          </a>
          <a
            href="#how-it-works"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Como funciona
          </a>
        </motion.div>
        <motion.p
          className="order-5 max-w-xl text-[13px] leading-6 text-muted lg:col-start-1"
          variants={fadeUp}
        >
          Cadastro gratuito para conhecer o ambiente. Recursos liberados
          mediante assinatura de um plano.
        </motion.p>
      </motion.div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const TICK_MS = 2200;

type Snapshot = {
  spend: number;
  conversions: number;
  ctr: number;
  google: number;
  meta: number;
  googleChange: number;
  metaChange: number;
};

const start: Snapshot = {
  spend: 48320,
  conversions: 1284,
  ctr: 3.42,
  google: 27840,
  meta: 20480,
  googleChange: 12.4,
  metaChange: 8.1,
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function currencyDetailed(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function percent(value: number) {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function changeLabel(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function nextSnapshot(current: Snapshot): Snapshot {
  const addedSpend = Math.max(8, Math.round(current.spend / current.conversions / 4));
  const googleShare = Math.round(addedSpend * 0.58);
  return {
    spend: current.spend + addedSpend,
    conversions: current.conversions + 1,
    ctr: Math.round((current.ctr + 0.01) * 100) / 100,
    google: current.google + googleShare,
    meta: current.meta + (addedSpend - googleShare),
    googleChange: Math.round((current.googleChange + 0.1) * 10) / 10,
    metaChange: Math.round((current.metaChange + 0.1) * 10) / 10,
  };
}

export function HeroPreview() {
  const [data, setData] = useState(start);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let latest = start;

    const countTo = (from: Snapshot, to: Snapshot) =>
      new Promise<void>((resolve) => {
        const began = performance.now();
        const duration = 900;
        const step = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }
          const progress = Math.min(1, (now - began) / duration);
          const eased = 1 - (1 - progress) ** 3;
          setData({
            spend: from.spend + (to.spend - from.spend) * eased,
            conversions: from.conversions + (to.conversions - from.conversions) * eased,
            ctr: from.ctr + (to.ctr - from.ctr) * eased,
            google: from.google + (to.google - from.google) * eased,
            meta: from.meta + (to.meta - from.meta) * eased,
            googleChange: from.googleChange + (to.googleChange - from.googleChange) * eased,
            metaChange: from.metaChange + (to.metaChange - from.metaChange) * eased,
          });
          if (progress < 1) {
            frame = requestAnimationFrame(step);
          } else {
            setData(to);
            resolve();
          }
        };
        frame = requestAnimationFrame(step);
      });

    const tick = async () => {
      const from = latest;
      const to = nextSnapshot(from);
      latest = to;
      setPulsing(true);
      await countTo(from, to);
      if (!cancelled) setPulsing(false);
    };

    const interval = window.setInterval(() => {
      void tick();
    }, TICK_MS);
    const first = window.setTimeout(() => {
      void tick();
    }, 600);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearTimeout(first);
      cancelAnimationFrame(frame);
    };
  }, []);

  const metrics = [
    { id: "spend", label: "Investimento", value: currency(data.spend) },
    {
      id: "conversions",
      label: "Conversões",
      value: Math.round(data.conversions).toLocaleString("pt-BR"),
    },
    { id: "ctr", label: "CTR", value: percent(data.ctr), desktopOnly: true },
    {
      id: "cpa",
      label: "CPA",
      value: currencyDetailed(data.spend / data.conversions),
      desktopOnly: true,
    },
  ];

  const platforms = [
    {
      name: "Google Ads",
      logo: "/google-ads-icon.webp",
      logoWidth: 16,
      logoHeight: 16,
      spend: currency(data.google),
      change: changeLabel(data.googleChange),
      tone: "text-google-yellow",
      shell:
        "border-google-yellow/25 bg-background/60 bg-gradient-to-br from-google-yellow/20 via-google-yellow/10 to-transparent shadow-[inset_0_1px_0_rgba(251,188,4,0.28)]",
      desktopShell:
        "border-google-yellow/25 bg-background bg-gradient-to-br from-google-yellow/20 via-google-yellow/10 to-transparent shadow-[inset_0_1px_0_rgba(251,188,4,0.28)]",
      bar: "bg-google-yellow/75",
      bars: [42, 55, 48, 70, 64, 82, 76],
    },
    {
      name: "Meta Ads",
      logo: "/META.webp",
      logoWidth: 24,
      logoHeight: 16,
      spend: currency(data.meta),
      change: changeLabel(data.metaChange),
      tone: "text-meta",
      shell:
        "border-meta/25 bg-background/60 bg-gradient-to-br from-meta/20 via-meta/10 to-transparent shadow-[inset_0_1px_0_rgba(6,104,225,0.28)]",
      desktopShell:
        "border-meta/25 bg-background bg-gradient-to-br from-meta/20 via-meta/10 to-transparent shadow-[inset_0_1px_0_rgba(6,104,225,0.28)]",
      bar: "bg-meta/75",
      bars: [36, 44, 52, 48, 61, 58, 73],
    },
  ];

  return (
    <div className="grid gap-2 p-3 sm:gap-3 sm:p-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`rounded-lg border px-2.5 py-2 sm:px-3 sm:py-3 ${
              metric.desktopOnly ? "hidden sm:block" : ""
            } ${
              metric.id === "conversions"
                ? "border-positive/25 bg-background/60 bg-gradient-to-br from-positive/20 via-positive/10 to-transparent shadow-[inset_0_1px_0_rgba(74,222,128,0.28)]"
                : "border-border-subtle bg-background/60"
            } ${pulsing && metric.id !== "conversions" ? "sm:border-foreground/30" : ""}`}
          >
            <p
              className={`text-[10px] uppercase tracking-wide text-muted ${
                metric.id === "conversions" ? "text-positive/75" : ""
              }`}
            >
              {metric.label}
            </p>
            <p
              className={`mt-1 font-mono text-[13px] tabular-nums sm:text-sm ${
                metric.id === "conversions" ? "text-positive" : ""
              }`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className={`rounded-lg border px-2.5 py-2 ${platform.shell}`}
          >
            <div className="flex items-center gap-1.5">
              <Image
                src={platform.logo}
                alt=""
                width={platform.logoWidth}
                height={platform.logoHeight}
                className="h-4 w-auto shrink-0 mix-blend-lighten"
              />
              <p className={`text-[10px] font-medium ${platform.tone}`}>{platform.name}</p>
            </div>
            <p className="mt-1 font-mono text-[13px] tabular-nums">{platform.spend}</p>
          </div>
        ))}
      </div>

      <div className="hidden gap-3 sm:grid sm:grid-cols-2">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className={`rounded-lg border p-4 ${platform.desktopShell}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Image
                    src={platform.logo}
                    alt=""
                    width={Math.round(platform.logoWidth * 1.125)}
                    height={Math.round(platform.logoHeight * 1.125)}
                    className="h-[18px] w-auto shrink-0 mix-blend-lighten"
                  />
                  <p className={`text-[11px] font-medium ${platform.tone}`}>{platform.name}</p>
                </div>
                <p className="mt-1 font-mono text-sm tabular-nums">{platform.spend}</p>
              </div>
              <span className="font-mono text-[11px] tabular-nums text-positive">
                {platform.change}
              </span>
            </div>
            <div className="mt-4 flex h-14 items-end gap-1.5" aria-hidden>
              {platform.bars.map((height, index) => (
                <motion.div
                  key={`${platform.name}-${index}`}
                  className={`flex-1 rounded-sm ${platform.bar}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{
                    duration: 0.6,
                    delay: 0.35 + index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

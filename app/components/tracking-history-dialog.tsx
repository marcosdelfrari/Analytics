"use client";

import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { formatNumber } from "@/lib/format";
import { formatRangeLabel, type TrackingWindow } from "@/lib/report-period";
import { isSiteConversionEvent } from "@/lib/tracking-events";
import {
  trackingMediaOriginLabel,
  type TrackingMediaOrigin,
} from "@/lib/utm-platform";

export type HistoryTarget =
  | { type: "page"; path: string }
  | { type: "event"; name: string; origin?: TrackingMediaOrigin };

type HistoryHit = {
  id: string;
  at: string;
  kind: string;
  name: string;
  path: string;
  url: string;
  referrer: string;
  visitorId: string | null;
  params: Array<[string, string]>;
  properties: Array<[string, string]>;
};

type HistoryPayload = {
  total: number;
  limit: number;
  hits: HistoryHit[];
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

function shortVisitor(id: string | null) {
  if (!id) return null;
  return id.slice(0, 8);
}

function referrerLabel(referrer: string) {
  const value = referrer.trim();
  if (!value) return "Entrada direta";
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return value;
  }
}

const CLICK_IDS = new Set([
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "dclid",
  "ttclid",
]);

function shortValue(value: string) {
  return value.length > 42 ? `${value.slice(0, 42)}…` : value;
}

function joinPairs(pairs: Array<[string, string]>) {
  const utms = pairs.filter(([key]) => key.startsWith("utm_"));
  const visible = (utms.length > 0 ? utms : pairs.filter(([key]) => !CLICK_IDS.has(key)))
    .map(([key, value]) => `${key}=${shortValue(value)}`);
  return visible.join(" · ");
}

export function TrackingHistoryDialog({
  target,
  range,
  onClose,
}: {
  target: HistoryTarget;
  range: TrackingWindow;
  onClose: () => void;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<HistoryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPage = target.type === "page";
  const value = isPage ? target.path : target.name;
  const periodLabel = formatRangeLabel(range.from, range.to);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    const params = new URLSearchParams({
      type: target.type,
      from: range.from,
      to: range.to,
    });
    if (target.type === "page") params.set("path", target.path);
    else {
      params.set("name", target.name);
      if (target.origin) params.set("origin", target.origin);
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    void fetch(`/api/tracking/history?${params.toString()}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const body = (await response.json()) as HistoryPayload & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(body.error ?? "Não foi possível carregar o histórico.");
        }
        return body;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o histórico.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [target, range.from, range.to]);

  const mediaOriginLabel =
    target.type === "event" && target.origin
      ? trackingMediaOriginLabel(target.origin)
      : null;

  const dialog = (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[min(90dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#121212] shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
              {isPage ? "Histórico da página" : "Histórico do evento"}
            </p>
            <h2
              id={titleId}
              className="mt-1 truncate font-mono text-[15px] font-semibold tracking-tight text-foreground"
            >
              {value}
            </h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {periodLabel}
              {mediaOriginLabel ? ` · ${mediaOriginLabel}` : null}
              {data
                ? ` · ${formatNumber(data.total)} ${
                    isPage
                      ? data.total === 1
                        ? "registro"
                        : "registros"
                      : data.total === 1
                        ? "ocorrência"
                        : "ocorrências"
                  }`
                : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition hover:border-white/25 hover:text-foreground"
            aria-label="Fechar histórico"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-5 py-8 text-[12px] text-muted-foreground">
              Carregando histórico…
            </p>
          ) : error ? (
            <p className="px-5 py-8 text-[12px] text-negative">{error}</p>
          ) : !data || data.hits.length === 0 ? (
            <p className="px-5 py-8 text-[12px] text-muted-foreground">
              {isPage
                ? "Nenhum acesso nesta página no período."
                : "Nenhuma ocorrência deste evento no período."}
            </p>
          ) : (
            <ul>
              {data.hits.map((hit) => {
                const isPageview = hit.kind === "pageview";
                const isConversion =
                  !isPageview && isSiteConversionEvent(hit.name);
                const title = isPageview ? "Visita" : hit.name;
                const visitor = shortVisitor(hit.visitorId);
                return (
                  <li
                    key={hit.id}
                    className="border-b border-border-subtle px-5 py-3.5 last:border-b-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="text-[13px] font-medium">{title}</p>
                        {isConversion ? (
                          <span className="rounded-full border border-positive/40 bg-positive/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-positive">
                            Conversão do site
                          </span>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-mono text-[11px] text-muted">
                        {formatWhen(hit.at)}
                      </p>
                    </div>
                    {isPage ? (
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {referrerLabel(hit.referrer)}
                      </p>
                    ) : (
                      <p className="mt-1 truncate font-mono text-[12px] text-muted-foreground">
                        {hit.path}
                      </p>
                    )}
                    {hit.properties.length > 0 ? (
                      <p className="mt-1.5 break-all text-[12px] text-foreground">
                        {joinPairs(hit.properties)}
                      </p>
                    ) : null}
                    {hit.params.length > 0 ? (
                      <p className="mt-1 break-all text-[12px] text-muted-foreground">
                        {joinPairs(hit.params)}
                      </p>
                    ) : null}
                    {visitor ? (
                      <p className="mt-1.5 font-mono text-[10px] text-muted">
                        visitante {visitor}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {data && data.total > data.hits.length ? (
          <p className="border-t border-border px-5 py-2.5 text-[11px] text-muted">
            Mostrando os {formatNumber(data.hits.length)} mais recentes de{" "}
            {formatNumber(data.total)}.
          </p>
        ) : null}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(dialog, document.body);
}

export function TrackingHistoryTrigger({
  range,
  target,
  className,
  children,
  label,
}: {
  range: TrackingWindow;
  target: HistoryTarget;
  className?: string;
  children: ReactNode;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
        aria-label={label}
      >
        {children}
      </button>
      {open ? (
        <TrackingHistoryDialog
          target={target}
          range={range}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

export function TrackingHistoryTableRow({
  range,
  target,
  label,
  children,
}: {
  range: TrackingWindow;
  target: HistoryTarget;
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  function onKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <>
      <tr
        className="cursor-pointer border-b border-border-subtle last:border-b-0 hover:bg-surface-elevated/60"
        tabIndex={0}
        role="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
      >
        {children}
      </tr>
      {open ? (
        <TrackingHistoryDialog
          target={target}
          range={range}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

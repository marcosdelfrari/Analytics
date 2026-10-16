"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CopyButton } from "@/app/encurtador/copy-button";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted-foreground";

const utmFields = [
  { key: "utm_source", label: "Origem", placeholder: "google" },
  { key: "utm_medium", label: "Mídia", placeholder: "cpc" },
  { key: "utm_campaign", label: "Campanha", placeholder: "marca-marco" },
  { key: "utm_content", label: "Conteúdo", placeholder: "criativo-a" },
  { key: "utm_term", label: "Termo", placeholder: "nome do anúncio" },
] as const;

const presets = [
  { label: "Google Ads", source: "google", medium: "cpc" },
  { label: "Meta Ads", source: "meta", medium: "paid" },
];

interface ExtraParam {
  id: number;
  key: string;
  value: string;
}

function buildUrl(base: string, params: Array<[string, string]>) {
  const trimmed = base.trim();
  if (!trimmed) return { url: "", error: "" };
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { url: "", error: "Use um endereço que comece com http ou https." };
    }
    for (const [key, value] of params) {
      const name = key.trim();
      const content = value.trim();
      if (!name || !content) continue;
      parsed.searchParams.set(name, content);
    }
    return { url: parsed.toString(), error: "" };
  } catch {
    return { url: "", error: "Esse endereço ainda não é uma URL válida." };
  }
}

export function UrlBuilder() {
  const [base, setBase] = useState("");
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<ExtraParam[]>([]);
  const [nextId, setNextId] = useState(1);

  const params = useMemo(() => {
    const entries: Array<[string, string]> = utmFields.map((field) => [
      field.key,
      utm[field.key] ?? "",
    ]);
    for (const extra of extras) entries.push([extra.key, extra.value]);
    return entries;
  }, [utm, extras]);

  const result = buildUrl(base, params);
  const filled = params.filter(([, value]) => value.trim());

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        className="border border-border bg-surface"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Montar URL</h2>
          <p className="text-[12px] text-muted">
            Os parâmetros entram na query string do endereço de destino
          </p>
        </div>
        <div className="grid gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  setUtm((current) => ({
                    ...current,
                    utm_source: preset.source,
                    utm_medium: preset.medium,
                  }))
                }
                className="border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <label className="block text-[12px] text-muted-foreground">
            Endereço base
            <input
              value={base}
              onChange={(event) => setBase(event.target.value)}
              placeholder="https://cliente.com/oferta"
              className={fieldClass}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            {utmFields.map((field) => (
              <label
                key={field.key}
                className="block text-[12px] text-muted-foreground"
              >
                {field.label}
                <span className="ml-2 font-mono text-[10px] text-muted">
                  {field.key}
                </span>
                <input
                  value={utm[field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setUtm((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  className={fieldClass}
                />
              </label>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] text-muted-foreground">
                Parâmetros extras
              </p>
              <button
                type="button"
                onClick={() => {
                  setExtras((current) => [
                    ...current,
                    { id: nextId, key: "", value: "" },
                  ]);
                  setNextId((current) => current + 1);
                }}
                className="border border-border px-2.5 py-1.5 text-[12px] text-foreground hover:bg-surface-elevated"
              >
                Adicionar
              </button>
            </div>
            {extras.length > 0 && (
              <ul className="mt-3 space-y-2">
                {extras.map((extra) => (
                  <li key={extra.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      value={extra.key}
                      placeholder="nome"
                      aria-label="Nome do parâmetro"
                      onChange={(event) =>
                        setExtras((current) =>
                          current.map((item) =>
                            item.id === extra.id
                              ? { ...item, key: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-muted-foreground"
                    />
                    <input
                      value={extra.value}
                      placeholder="valor"
                      aria-label="Valor do parâmetro"
                      onChange={(event) =>
                        setExtras((current) =>
                          current.map((item) =>
                            item.id === extra.id
                              ? { ...item, value: event.target.value }
                              : item,
                          ),
                        )
                      }
                      className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setExtras((current) =>
                          current.filter((item) => item.id !== extra.id),
                        )
                      }
                      className="border border-border px-2.5 text-[12px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </form>

      <section className="border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-medium">URL pronta</h2>
            <p className="text-[12px] text-muted">
              {filled.length === 1
                ? "1 parâmetro"
                : `${filled.length} parâmetros`}
            </p>
          </div>
          {result.url && <CopyButton value={result.url} />}
        </div>
        <div className="p-4">
          {result.error ? (
            <p className="text-[12px] text-negative">{result.error}</p>
          ) : result.url ? (
            <>
              <p className="break-all font-mono text-[12px] leading-5 text-foreground">
                {result.url}
              </p>
              {result.url && (
                <Link
                  href={`/encurtador?url=${encodeURIComponent(result.url)}`}
                  className="mt-4 inline-block border border-border px-2.5 py-1.5 text-[12px] text-foreground hover:bg-surface-elevated"
                >
                  Encurtar esta URL
                </Link>
              )}
            </>
          ) : (
            <p className="text-[12px] text-muted">
              Informe o endereço base para ver a URL com os parâmetros.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

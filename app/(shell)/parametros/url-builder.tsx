"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CopyButton } from "@/app/(shell)/encurtador/copy-button";
import { PlatformLogo } from "@/app/components/platform-logo";
import type { Platform } from "@/lib/types";
import {
  platformChoiceButtonClass,
  utmSourcePlatform,
} from "@/lib/platform-ui";

const fieldClass =
  "mt-1.5 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-muted-foreground";

const utmFields = [
  { key: "utm_source", label: "Origem", placeholder: "google" },
  { key: "utm_medium", label: "Mídia", placeholder: "cpc" },
  { key: "utm_campaign", label: "Campanha", placeholder: "marca-marco" },
  { key: "utm_content", label: "Conteúdo", placeholder: "criativo-a" },
  { key: "utm_term", label: "Termo", placeholder: "nome do anúncio" },
] as const;

const googleAdsFields = [
  { key: "gclid", label: "Clique Google", placeholder: "(auto no anúncio)" },
  { key: "gbraid", label: "gbraid", placeholder: "(auto no anúncio)" },
  { key: "gad_source", label: "gad_source", placeholder: "1" },
  { key: "gad_campaignid", label: "gad_campaignid", placeholder: "24150989666" },
] as const;

const metaAdsFields = [
  { key: "fbclid", label: "Clique Meta", placeholder: "(auto no anúncio)" },
] as const;

const metaSourcePresets = [
  { label: "Facebook", source: "facebook" },
  { label: "Instagram", source: "instagram" },
  { label: "Meta", source: "meta" },
] as const;

const presets: Array<{
  label: string;
  platform: Platform;
  source: string;
  medium: string;
}> = [
  { label: "Google Ads", platform: "google", source: "google", medium: "cpc" },
  { label: "Meta Ads", platform: "meta", source: "meta", medium: "paid" },
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
    for (const field of googleAdsFields) {
      entries.push([field.key, utm[field.key] ?? ""]);
    }
    for (const field of metaAdsFields) {
      entries.push([field.key, utm[field.key] ?? ""]);
    }
    for (const extra of extras) entries.push([extra.key, extra.value]);
    return entries;
  }, [utm, extras]);

  const result = buildUrl(base, params);
  const filled = params.filter(([, value]) => value.trim());
  const activePlatform = utmSourcePlatform(utm.utm_source ?? "");
  const metaSourceActive = (source: string) =>
    (utm.utm_source ?? "").trim().toLowerCase() === source;

  return (
    <div className="grid gap-6">
      <section className="border border-border bg-surface px-4 py-3">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          UTMs e URL de destino são configurados no{" "}
          <strong className="font-medium text-foreground">Google Ads</strong> ou{" "}
          <strong className="font-medium text-foreground">Meta Ads</strong>{" "}
          (sufixo de URL final, parâmetros do anúncio, modelos de acompanhamento).
          Esta página{" "}
          <strong className="font-medium text-foreground">não altera</strong> sua
          campanha: serve só como{" "}
          <strong className="font-medium text-foreground">
            exemplo e referência
          </strong>{" "}
          de como a URL deve chegar no site. O script Lótus lê a query string na
          visita; identificadores como{" "}
          <span className="font-mono text-[11px]">gclid</span> e{" "}
          <span className="font-mono text-[11px]">fbclid</span> vêm do clique no
          anúncio, sem precisar digitar aqui.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        className="border border-border bg-surface"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Modelo de URL</h2>
          <p className="text-[12px] text-muted">
            Simule UTMs e parâmetros de clique para ver o formato final
          </p>
        </div>
        <div className="grid gap-4 p-4">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Plataforma de mídia"
          >
            {presets.map((preset) => {
              const active = activePlatform === preset.platform;
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setUtm((current) => ({
                      ...current,
                      utm_source: preset.source,
                      utm_medium: preset.medium,
                    }))
                  }
                  className={platformChoiceButtonClass(preset.platform, active)}
                >
                  <PlatformLogo platform={preset.platform} size={20} />
                  <span>{preset.label}</span>
                  {active && (
                    <span className="sr-only"> (selecionado)</span>
                  )}
                </button>
              );
            })}
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
          <div
            className={`border-t pt-4 ${
              activePlatform === "google"
                ? "border-google/35"
                : "border-border"
            }`}
          >
            <p className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
              <PlatformLogo platform="google" size={16} />
              <span>
                Google Ads (auto-tagging) — o script Lótus coleta estes junto
                com os UTMs quando vêm na URL.
              </span>
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {googleAdsFields.map((field) => (
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
          </div>
          <div
            className={`border-t pt-4 ${
              activePlatform === "meta" ? "border-meta/35" : "border-border"
            }`}
          >
            <p className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
              <PlatformLogo platform="meta" size={16} />
              <span>
                Meta Ads — o Meta adiciona{" "}
                <span className="font-mono text-[11px]">fbclid</span> no clique;
                o script Lótus coleta junto com os UTMs. Use{" "}
                <span className="font-mono text-[11px]">utm_source</span>{" "}
                facebook, instagram ou meta.
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {metaSourcePresets.map((preset) => {
                const active = metaSourceActive(preset.source);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setUtm((current) => ({
                        ...current,
                        utm_source: preset.source,
                        utm_medium: current.utm_medium?.trim()
                          ? current.utm_medium
                          : "paid",
                      }))
                    }
                    className={
                      active
                        ? "inline-flex items-center gap-1.5 rounded-sm border border-meta/50 bg-meta/15 px-2.5 py-1.5 text-[12px] font-medium text-foreground ring-2 ring-meta/35"
                        : "inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                    }
                  >
                    <PlatformLogo platform="meta" size={14} />
                    utm_source={preset.source}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {metaAdsFields.map((field) => (
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
            <h2 className="text-sm font-medium">Exemplo de URL final</h2>
            <p className="text-[12px] text-muted">
              {filled.length === 1
                ? "1 parâmetro no exemplo"
                : `${filled.length} parâmetros no exemplo`}
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
              Informe o endereço base para montar o exemplo com os parâmetros.
            </p>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

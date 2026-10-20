"use client";

import { useEffect } from "react";

type ToolInput = Record<string, unknown>;

type ModelContextLike = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
      execute: (input: ToolInput, options: { signal: AbortSignal }) => Promise<unknown>;
      annotations?: { readOnlyHint?: boolean };
    },
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
};

const sections = ["benefits", "how-it-works", "pricing", "faq"] as const;

function modelContext(): ModelContextLike | null {
  const onDocument = (document as Document & { modelContext?: ModelContextLike }).modelContext;
  if (typeof onDocument?.registerTool === "function") return onDocument;

  const onNavigator = (navigator as Navigator & { modelContext?: ModelContextLike }).modelContext;
  if (typeof onNavigator?.registerTool === "function") return onNavigator;

  return null;
}

export function WebMcpTools() {
  useEffect(() => {
    const controller = new AbortController();
    let registered = false;

    const register = () => {
      if (registered) return true;
      const context = modelContext();
      if (!context) return false;
      registered = true;

      void context.registerTool(
        {
          name: "get-api-status",
          description: "Consulta o status público da API da Fractal.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          async execute() {
            const response = await fetch("/api/health");
            if (!response.ok) return { status: "unavailable" };
            return response.json();
          },
        },
        { signal: controller.signal },
      );

      void context.registerTool(
        {
          name: "open-section",
          description:
            "Abre uma seção da página da Fractal: benefícios, como funciona, planos ou perguntas frequentes.",
          inputSchema: {
            type: "object",
            properties: {
              section: {
                type: "string",
                enum: [...sections],
                description: "Identificador da seção.",
              },
            },
            required: ["section"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true },
          async execute(input) {
            const section = String(input.section ?? "");
            if (!sections.includes(section as (typeof sections)[number])) {
              return { ok: false, error: "Seção desconhecida." };
            }
            const target = document.getElementById(section);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              return { ok: true, section };
            }
            window.location.assign(`/#${section}`);
            return { ok: true, section };
          },
        },
        { signal: controller.signal },
      );

      return true;
    };

    if (!register()) {
      const interval = window.setInterval(() => {
        if (register()) window.clearInterval(interval);
      }, 200);
      const timeout = window.setTimeout(() => window.clearInterval(interval), 5000);
      return () => {
        window.clearInterval(interval);
        window.clearTimeout(timeout);
        controller.abort();
      };
    }

    return () => controller.abort();
  }, []);

  return null;
}


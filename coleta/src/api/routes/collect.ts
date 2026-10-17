import type { FastifyPluginAsync } from "fastify";
import {
  MAX_BATCH_BYTES,
  MAX_BATCH_EVENTS,
  MAX_SINGLE_BYTES,
} from "../../shared/constants.js";
import { insertHits } from "../../shared/insert-hits.js";
import { normalizeIncomingEvent } from "../../shared/normalize-event.js";
import { allowEvents } from "../../shared/rate-limit.js";
import { urlHostAllowed } from "../../shared/domain-match.js";
import { resolveSite } from "../../shared/site-cache.js";
import type { IncomingEvent } from "../../shared/types.js";

type CollectBody = {
  key?: unknown;
  events?: unknown;
  kind?: unknown;
  name?: unknown;
  url?: unknown;
  referrer?: unknown;
  params?: unknown;
  properties?: unknown;
  id?: unknown;
};

function readEvents(body: CollectBody): IncomingEvent[] {
  if (Array.isArray(body.events)) {
    return body.events.filter(
      (entry): entry is IncomingEvent =>
        !!entry && typeof entry === "object" && !Array.isArray(entry),
    );
  }

  if (typeof body.kind === "string") {
    return [
      {
        id: typeof body.id === "string" ? body.id : undefined,
        kind: body.kind,
        name: typeof body.name === "string" ? body.name : "",
        url: typeof body.url === "string" ? body.url : "",
        referrer:
          typeof body.referrer === "string" ? body.referrer : undefined,
        params: body.params,
        properties: body.properties,
      },
    ];
  }

  return [];
}

export const collectRoutes: FastifyPluginAsync = async (app) => {
  app.post("/v1/collect", async (request, reply) => {
    const raw = request.body;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return reply.code(400).send({ error: "JSON inválido." });
    }

    const body = raw as CollectBody;
    const key = typeof body.key === "string" ? body.key.trim() : "";
    if (!key) {
      return reply.code(400).send({ error: "Informe a chave de coleta." });
    }

    const serialized = JSON.stringify(body);
    const byteLimit = Array.isArray(body.events)
      ? MAX_BATCH_BYTES
      : MAX_SINGLE_BYTES;
    if (serialized.length > byteLimit) {
      return reply.code(413).send({ error: "Lote grande demais." });
    }

    const incoming = readEvents(body);
    if (incoming.length === 0) {
      return reply
        .code(400)
        .send({ error: "Informe ao menos um evento válido." });
    }
    if (incoming.length > MAX_BATCH_EVENTS) {
      return reply.code(400).send({
        error: `Envie no máximo ${MAX_BATCH_EVENTS} eventos por lote.`,
      });
    }

    const requireClientId = Array.isArray(body.events);
    const hits = [];
    for (const event of incoming) {
      const normalized = normalizeIncomingEvent(event, { requireClientId });
      if ("error" in normalized) {
        return reply.code(400).send({ error: normalized.error });
      }
      hits.push(normalized.hit);
    }

    if (!allowEvents(key, hits.length)) {
      return reply
        .code(429)
        .send({ error: "Muitas coletas em pouco tempo." });
    }

    const site = await resolveSite(key);
    if (!site) {
      return reply.code(404).send({ error: "Chave de coleta não encontrada." });
    }

    if (site.allowedHosts.length === 0) {
      return reply.code(403).send({
        error: "Cadastre ao menos um domínio autorizado antes de coletar.",
      });
    }

    for (const hit of hits) {
      if (!urlHostAllowed(hit.url, site.allowedHosts)) {
        return reply.code(403).send({
          error: "A URL do evento não pertence a um domínio autorizado.",
        });
      }
    }

    const result = await insertHits(site.siteId, hits);
    return reply.code(200).send({
      ok: true,
      accepted: result.accepted,
      duplicates: result.duplicates,
    });
  });
};

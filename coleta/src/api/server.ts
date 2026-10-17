import cors from "@fastify/cors";
import Fastify from "fastify";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkDatabase } from "../shared/db.js";
import { collectRoutes } from "./routes/collect.js";

const port = Number(process.env.COLETA_PORT ?? 4000);
const trackerPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "tracker.js",
);

const trackerSource = await readFile(trackerPath, "utf8");

const app = Fastify({
  logger: process.env.NODE_ENV === "production",
  bodyLimit: 65_536,
});

app.addContentTypeParser(
  ["application/json", "text/plain"],
  { parseAs: "string" },
  (_request, body, done) => {
    try {
      done(null, JSON.parse(body as string));
    } catch (error) {
      done(error as Error, undefined);
    }
  },
);

await app.register(cors, {
  origin: true,
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
});

await app.register(collectRoutes);

app.get("/health", async (_request, reply) => {
  try {
    await checkDatabase();
    return reply.send({ status: "ok" });
  } catch (error) {
    app.log.error(error);
    return reply.code(503).send({ status: "degraded" });
  }
});

app.get("/tracker.js", async (_request, reply) => {
  return reply
    .header("Content-Type", "application/javascript; charset=utf-8")
    .header("Cache-Control", "public, max-age=300")
    .send(trackerSource);
});

try {
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Coleta ouvindo em http://localhost:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

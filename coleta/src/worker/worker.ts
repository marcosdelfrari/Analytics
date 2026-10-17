import { WORKER_POLL_MS } from "../shared/constants.js";
import { checkDatabase } from "../shared/db.js";
import { processBatch } from "./process-batch.js";

let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    const processed = await processBatch();
    if (processed > 0) {
      console.log(`Worker processou ${processed} evento(s).`);
    }
  } catch (error) {
    console.error("Falha no worker:", error);
  } finally {
    running = false;
  }
}

try {
  await checkDatabase();
} catch (error) {
  console.error("DATABASE_URL inválida ou banco indisponível.", error);
  process.exit(1);
}

console.log("Worker de métricas iniciado.");
void tick();
setInterval(tick, WORKER_POLL_MS);

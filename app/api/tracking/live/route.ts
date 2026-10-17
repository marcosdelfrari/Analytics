import { NextResponse } from "next/server";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";
import { ensureTrackingSite } from "@/lib/tracking";
import { findPageviewSince } from "@/lib/tracking-verify";

export async function GET(request: Request) {
  if (!authEnabled) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (session.role !== "admin" && session.role !== "client") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const sinceRaw = new URL(request.url).searchParams.get("since");
  if (!sinceRaw) {
    return NextResponse.json(
      { error: "Informe o parâmetro since." },
      { status: 400 },
    );
  }

  const since = new Date(sinceRaw);
  if (Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: "since inválido." }, { status: 400 });
  }

  const maxAgeMs = 15 * 60_000;
  if (Date.now() - since.getTime() > maxAgeMs) {
    return NextResponse.json({ error: "since expirado." }, { status: 400 });
  }

  const site = await ensureTrackingSite(session.userId);
  const hit = await findPageviewSince(site.id, since);

  if (!hit) {
    return NextResponse.json({ received: false });
  }

  return NextResponse.json({
    received: true,
    hit: {
      path: hit.path,
      url: hit.url,
      at: hit.createdAt.toISOString(),
    },
  });
}

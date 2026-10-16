import { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CopyButton } from "@/app/encurtador/copy-button";
import { removeShortLink } from "@/app/encurtador/actions";
import { ShortenForm } from "@/app/encurtador/shorten-form";
import { AppShell } from "@/app/components/app-shell";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";
import { formatNumber } from "@/lib/format";
import { listLinks } from "@/lib/links-store";

function Loading() {
  return (
    <AppShell
      mode="admin"
      title="Links"
      subtitle="Carregando atalhos"
    >
      <div className="border border-border bg-surface px-6 py-10 text-sm text-muted">
        Carregando links
      </div>
    </AppShell>
  );
}

async function Shortener({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  await connection();
  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "admin") redirect("/dashboard");
  }

  const { url } = await searchParams;

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;
  const links = await listLinks();

  return (
    <AppShell
      mode="admin"
      title="Links"
      subtitle="Atalhos para campanhas"
    >
      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ShortenForm origin={origin} initialUrl={url ?? ""} />
        <section className="border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Atalhos</h2>
            <p className="text-[12px] text-muted">
              {links.length === 1 ? "1 link" : `${links.length} links`}
            </p>
          </div>
          {links.length === 0 ? (
            <p className="px-4 py-6 text-[12px] text-muted">
              Nenhum link encurtado ainda.
            </p>
          ) : (
            <ul>
              {links.map((link) => {
                const shortUrl = `${origin}/s/${link.code}`;
                return (
                  <li
                    key={link.code}
                    className="border-b border-border-subtle px-4 py-4 last:border-b-0"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {link.label || link.code}
                        </p>
                        <p className="mt-1 truncate font-mono text-[12px] text-foreground">
                          {shortUrl}
                        </p>
                        <p className="mt-1 truncate text-[12px] text-muted">
                          {link.url}
                        </p>
                        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                          {formatNumber(link.clicks)}{" "}
                          {link.clicks === 1 ? "clique" : "cliques"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <CopyButton value={shortUrl} />
                        <form action={removeShortLink}>
                          <input type="hidden" name="code" value={link.code} />
                          <button
                            type="submit"
                            className="border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                          >
                            Remover
                          </button>
                        </form>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default function ShortenerPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <Shortener searchParams={searchParams} />
    </Suspense>
  );
}

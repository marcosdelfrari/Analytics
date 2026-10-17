import { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CopyButton } from "@/app/(shell)/encurtador/copy-button";
import { removeShortLink } from "@/app/(shell)/encurtador/actions";
import { ShortenForm } from "@/app/(shell)/encurtador/shorten-form";
import { AppShellMain } from "@/app/components/app-shell";
import { EncurtadorLoadingFallback } from "@/app/components/loading-fallbacks";
import { authEnabled } from "@/lib/auth-config";
import { getSession } from "@/lib/auth";
import { formatNumber } from "@/lib/format";
import { listLinks } from "@/lib/links-store";

async function ShortenerPageContent({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  await connection();
  let planActive = true;

  if (authEnabled) {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.role !== "admin" && session.role !== "client") {
      redirect("/login");
    }
    planActive = session.role === "admin" || session.planActive;
  }

  const { url } = await searchParams;

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;
  const links = await listLinks();

  return (
    <AppShellMain
      title="Links"
      subtitle="Atalhos para campanhas"
      planActive={planActive}
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
    </AppShellMain>
  );
}

export default function ShortenerPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  return (
    <Suspense fallback={<EncurtadorLoadingFallback />}>
      <ShortenerPageContent searchParams={searchParams} />
    </Suspense>
  );
}

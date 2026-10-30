import type { Platform } from "@/lib/types";

interface BreakdownItem {
  type: string;
  count: number;
  platform: Platform;
}

const maxInList = (items: BreakdownItem[]) =>
  Math.max(...items.map((i) => i.count), 1);

export function CampaignTypeList({ items }: { items: BreakdownItem[] }) {
  const max = maxInList(items);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-medium">Tipos de campanha</h2>
      <p className="mt-0.5 text-[12px] text-muted">Quantidade por categoria</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.type}>
            <div className="flex items-center justify-between gap-2 text-[12px]">
              <span className="text-muted-foreground">{item.type}</span>
              <span className="font-mono text-foreground">{item.count}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
              <div
                className={`h-full rounded-full ${item.platform === "google" ? "bg-google" : "bg-meta"}`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { SiteTrafficPoint } from "@/lib/tracking-analytics";
import { formatNumber } from "@/lib/format";

const WIDTH = 1000;
const HEIGHT = 170;
const PAD_X = 36;
const PAD_TOP = 18;
const LABEL_AREA = 24;

function plotHeight() {
  return HEIGHT - PAD_TOP - LABEL_AREA;
}

function xAt(index: number, count: number) {
  if (count <= 1) return WIDTH / 2;
  return PAD_X + (index / (count - 1)) * (WIDTH - PAD_X * 2);
}

function buildPath(values: number[]) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const h = plotHeight();

  return values
    .map((value, index) => {
      const x = xAt(index, values.length);
      const norm = (value - min) / range;
      const y = PAD_TOP + (1 - norm) * h;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function SiteTrafficChart({
  points,
  title = "Tráfego do site",
}: {
  points: SiteTrafficPoint[];
  title?: string;
}) {
  if (points.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
        Sem visitas agregadas no período.
      </section>
    );
  }

  const visitorPath = buildPath(points.map((point) => point.visitors));
  const pageviewPath = buildPath(points.map((point) => point.pageviews));
  const eventPath = buildPath(points.map((point) => point.events));
  const last = points[points.length - 1];
  const gridY = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => PAD_TOP + ratio * plotHeight(),
  );

  return (
    <section className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-medium">{title}</h2>
          <span className="font-mono text-[10px] text-muted">
            Último ({last.label}): {formatNumber(last.visitors)} vis ·{" "}
            {formatNumber(last.pageviews)} pv · {formatNumber(last.events)} ev
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-foreground" />
            Visitantes
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-accent" />
            Pageviews
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-positive" />
            Eventos
          </span>
        </div>
      </div>
      <div className="mt-2.5 w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full text-muted"
          role="img"
          aria-label="Gráfico de visitantes, pageviews e eventos do site"
          preserveAspectRatio="xMidYMid meet"
        >
          {gridY.map((y, index) => (
            <line
              key={index}
              x1={PAD_X}
              x2={WIDTH - PAD_X}
              y1={y}
              y2={y}
              className="stroke-border-subtle"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={visitorPath}
            fill="none"
            className="stroke-foreground"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={pageviewPath}
            fill="none"
            className="stroke-accent"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={eventPath}
            fill="none"
            className="stroke-positive"
            strokeWidth={2}
            strokeDasharray="6 4"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((point, index) => (
            <text
              key={`${point.label}-${index}`}
              x={xAt(index, points.length)}
              y={HEIGHT - 6}
              textAnchor="middle"
              fill="currentColor"
              fontSize={10}
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}

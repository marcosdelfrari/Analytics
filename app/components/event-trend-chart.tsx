import {
  shortChartAxisLabel,
  shouldShowChartAxisLabel,
} from "@/lib/chart-axis";
import { formatNumber } from "@/lib/format";
import type { EventTrendData } from "@/lib/tracking-analytics-shared";

const WIDTH = 1000;
const HEIGHT = 170;
const PAD_X = 36;
const PAD_TOP = 18;
const LABEL_AREA = 24;

const SERIES_STROKE = [
  "stroke-positive",
  "stroke-google",
  "stroke-google-yellow",
  "stroke-meta",
  "stroke-accent-muted",
];

const SERIES_SWATCH = [
  "bg-positive",
  "bg-google",
  "bg-google-yellow",
  "bg-meta",
  "bg-accent-muted",
];

function plotHeight() {
  return HEIGHT - PAD_TOP - LABEL_AREA;
}

function xAt(index: number, count: number) {
  if (count <= 1) return WIDTH / 2;
  return PAD_X + (index / (count - 1)) * (WIDTH - PAD_X * 2);
}

function buildPath(values: number[], max: number) {
  const h = plotHeight();
  const range = max || 1;

  return values
    .map((value, index) => {
      const x = xAt(index, values.length);
      const y = PAD_TOP + (1 - value / range) * h;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function EventTrendChart({
  trend,
}: {
  trend: EventTrendData;
}) {
  const hasValues = trend.points.some((point) =>
    point.values.some((value) => value > 0),
  );

  if (trend.names.length === 0 || trend.points.length === 0 || !hasValues) {
    return (
      <section className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
        Sem série diária de eventos no período.
      </section>
    );
  }

  const max = Math.max(
    1,
    ...trend.points.flatMap((point) => point.values),
  );
  const gridY = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => PAD_TOP + ratio * plotHeight(),
  );
  const last = trend.points[trend.points.length - 1];

  return (
    <section className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-medium">Tendência por evento</h2>
          {last && (
            <span className="font-mono text-[10px] text-muted">
              Último ({last.label}):{" "}
              {trend.names
                .map(
                  (name, index) =>
                    `${name} ${formatNumber(last.values[index] ?? 0)}`,
                )
                .join(" · ")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
          {trend.names.map((name, index) => (
            <span key={name} className="flex items-center gap-1">
              <span
                className={`inline-block h-0.5 w-3 ${SERIES_SWATCH[index] ?? "bg-muted"}`}
              />
              <span className="font-mono">{name}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2.5 w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full text-muted"
          role="img"
          aria-label="Gráfico de tendência dos eventos customizados"
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
          {trend.names.map((name, seriesIndex) => (
            <path
              key={name}
              d={buildPath(
                trend.points.map((point) => point.values[seriesIndex] ?? 0),
                max,
              )}
              fill="none"
              className={SERIES_STROKE[seriesIndex] ?? "stroke-muted"}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {trend.points.map((point, index) => {
            if (!shouldShowChartAxisLabel(index, trend.points.length)) {
              return null;
            }
            return (
              <text
                key={`${point.label}-${index}`}
                x={xAt(index, trend.points.length)}
                y={HEIGHT - 5}
                textAnchor="middle"
                fill="currentColor"
                fontSize={7.5}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >
                {shortChartAxisLabel(point.label)}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

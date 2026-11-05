import {
  shortChartAxisLabel,
  shouldShowChartAxisLabel,
} from "@/lib/chart-axis";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { EvolutionPoint } from "@/lib/types";

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

export function EvolutionChart({
  points,
  title = "Evolução do período",
}: {
  points: EvolutionPoint[];
  title?: string;
}) {
  if (points.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-surface px-3.5 py-4 text-[12px] text-muted-foreground">
        Sem histórico para gráfico de evolução.
      </section>
    );
  }

  const spendPath = buildPath(points.map((point) => point.spend));
  const conversionPath = buildPath(points.map((point) => point.conversions));
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
            Último ({last.label}): {formatCurrency(last.spend)} ·{" "}
            {formatNumber(last.conversions)} conv.
          </span>
        </div>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-accent" />
            Investimento
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-3 bg-positive" />
            Conversões
          </span>
        </div>
      </div>
      <div className="mt-2.5 w-full">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full text-muted"
          role="img"
          aria-label="Gráfico de evolução de investimento e conversões"
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
            d={spendPath}
            fill="none"
            className="stroke-accent"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={conversionPath}
            fill="none"
            className="stroke-positive"
            strokeWidth={2}
            strokeDasharray="6 4"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((point, index) => {
            if (!shouldShowChartAxisLabel(index, points.length)) return null;
            return (
              <text
                key={point.label}
                x={xAt(index, points.length)}
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

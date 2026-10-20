"use client";

import { useMemo } from "react";

const CHART_W = 400;
const CHART_H = 112;
const PAD_X = 2;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;

/** Rótulos fixos — gráfico decorativo na landing (dados ilustrativos). */
const ILLUSTRATIVE_WEEK_LABELS = [
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
  "Dom",
] as const;

export type BenefitsLeadSeries = {
  id: string;
  stroke: string;
  fill: string;
  points: number[];
};

function plotCoords(
  points: number[],
  min: number,
  max: number,
): { x: number; y: number }[] {
  const range = max - min || 1;
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;
  return points.map((point, index) => ({
    x: PAD_X + (index / (points.length - 1)) * (CHART_W - PAD_X * 2),
    y: PAD_TOP + (1 - (point - min) / range) * plotH,
  }));
}

function linePath(coords: { x: number; y: number }[]) {
  return coords
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

function areaPath(coords: { x: number; y: number }[]) {
  if (coords.length === 0) return "";
  const base = CHART_H - PAD_BOTTOM;
  const line = linePath(coords);
  const last = coords[coords.length - 1];
  const first = coords[0];
  return `${line} L${last.x.toFixed(2)},${base} L${first.x.toFixed(2)},${base} Z`;
}

export function BenefitsLeadsChart({ series }: { series: BenefitsLeadSeries[] }) {
  const dayLabels = ILLUSTRATIVE_WEEK_LABELS;

  const { yMin, yMax, gridY } = useMemo(() => {
    const allValues = series.flatMap((entry) => entry.points);
    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const padding = Math.max(2, (rawMax - rawMin) * 0.12);
    const min = rawMin - padding;
    const max = rawMax + padding;
    const grid = [0, 0.33, 0.66, 1].map(
      (ratio) => PAD_TOP + ratio * (CHART_H - PAD_TOP - PAD_BOTTOM),
    );
    return { yMin: min, yMax: max, gridY: grid };
  }, [series]);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="block w-full overflow-visible text-muted"
      style={{ aspectRatio: `${CHART_W} / ${CHART_H}` }}
      role="img"
      aria-label="Gráfico de linhas comparando leads dos últimos sete dias"
      preserveAspectRatio="xMidYMid meet"
    >
      {gridY.map((y, index) => (
        <line
          key={index}
          x1={PAD_X}
          x2={CHART_W - PAD_X}
          y1={y}
          y2={y}
          className="stroke-border-subtle"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {[...series].reverse().map((item) => {
        const coords = plotCoords(item.points, yMin, yMax);
        return (
          <path
            key={`${item.id}-area`}
            d={areaPath(coords)}
            fill={item.fill}
            stroke="none"
          />
        );
      })}
      {[...series].reverse().map((item) => {
        const coords = plotCoords(item.points, yMin, yMax);
        const last = coords[coords.length - 1];
        return (
          <g key={item.id}>
            <path
              d={linePath(coords)}
              fill="none"
              stroke={item.stroke}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={last.x}
              cy={last.y}
              r={3.5}
              fill="var(--background)"
              stroke={item.stroke}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
      {dayLabels.map((label, index) => {
        const isToday = index === dayLabels.length - 1;
        const isFirst = index === 0;
        const isLast = index === dayLabels.length - 1;
        return (
          <text
            key={`${label}-${index}`}
            x={PAD_X + (index / (dayLabels.length - 1)) * (CHART_W - PAD_X * 2)}
            y={CHART_H - 6}
            textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
            fill="currentColor"
            fontSize={10}
            className={isToday ? "fill-foreground font-medium" : "fill-muted"}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

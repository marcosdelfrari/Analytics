"use client";

import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useReportsNavigation } from "@/app/components/reports-navigation-context";
import {
  addDaysToKey,
  daysInRange,
  formatRangeLabel,
  localDateKey,
  MAX_REPORT_RANGE_DAYS,
  reportPeriodHref,
  type DateKey,
} from "@/lib/report-period";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function monthTitle(year: number, month: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function orderedRange(a: DateKey, b: DateKey): { from: DateKey; to: DateKey } {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}

function clampSecondClick(start: DateKey, next: DateKey) {
  const range = orderedRange(start, next);
  if (daysInRange(range.from, range.to) <= MAX_REPORT_RANGE_DAYS) return range;
  if (next >= start) {
    return { from: start, to: addDaysToKey(start, MAX_REPORT_RANGE_DAYS - 1) };
  }
  return { from: addDaysToKey(start, -(MAX_REPORT_RANGE_DAYS - 1)), to: start };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function mondayOffset(year: number, month: number) {
  return (new Date(year, month - 1, 1).getDay() + 6) % 7;
}

function toDateKey(year: number, month: number, day: number): DateKey {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function ReportPeriodCalendar({
  label,
  from,
  to,
}: {
  label: string;
  from: DateKey;
  to: DateKey;
}) {
  const router = useRouter();
  const { beginNavigation } = useReportsNavigation();
  const [, startNavigate] = useTransition();
  const titleId = useId();
  const today = localDateKey();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(() => {
    const [year, month] = (to || today).split("-").map(Number);
    return { year: year || new Date().getFullYear(), month: month || 1 };
  });
  const [draftStart, setDraftStart] = useState<DateKey | null>(null);
  const [hover, setHover] = useState<DateKey | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDraftStart(null);
      setHover(null);
      return;
    }
    const [year, month] = to.split("-").map(Number);
    if (year && month) setVisible({ year, month });
  }, [open, to]);

  const cells = useMemo(() => {
    const blanks = mondayOffset(visible.year, visible.month);
    const count = daysInMonth(visible.year, visible.month);
    const preview = draftStart && hover ? clampSecondClick(draftStart, hover) : null;
    const selectedFrom = preview?.from ?? (draftStart ?? from);
    const selectedTo = preview?.to ?? (draftStart ?? to);

    return [
      ...Array.from({ length: blanks }, (_, index) => ({
        key: `blank-${index}`,
        dateKey: null as DateKey | null,
        day: 0,
      })),
      ...Array.from({ length: count }, (_, index) => {
        const day = index + 1;
        const dateKey = toDateKey(visible.year, visible.month, day);
        return { key: dateKey, dateKey, day };
      }),
    ].map((cell) => {
      if (!cell.dateKey) return { ...cell, disabled: true, inRange: false, isStart: false, isEnd: false, isToday: false };
      const dateKey = cell.dateKey;
      const disabled = dateKey > today;
      const inRange = dateKey >= selectedFrom && dateKey <= selectedTo;
      return {
        ...cell,
        disabled,
        inRange,
        isStart: dateKey === selectedFrom,
        isEnd: dateKey === selectedTo,
        isToday: dateKey === today,
      };
    });
  }, [draftStart, from, hover, to, today, visible.month, visible.year]);

  function applyRange(nextFrom: DateKey, nextTo: DateKey) {
    setOpen(false);
    if (nextFrom === from && nextTo === to) return;
    beginNavigation();
    startNavigate(() => {
      router.push(reportPeriodHref({ kind: "range", from: nextFrom, to: nextTo }));
    });
  }

  function onDayClick(dateKey: DateKey) {
    if (dateKey > today) return;
    if (!draftStart) {
      setDraftStart(dateKey);
      setHover(dateKey);
      return;
    }
    const range = clampSecondClick(draftStart, dateKey);
    setDraftStart(null);
    applyRange(range.from, range.to);
  }

  const todayDate = new Date();
  const nextMonthDisabled =
    visible.year > todayDate.getFullYear() ||
    (visible.year === todayDate.getFullYear() &&
      visible.month >= todayDate.getMonth() + 1);
  const hint = draftStart
    ? "Clique no dia final (pode ser o mesmo)"
    : "Clique no início e no fim do período";

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Alterar período: ${label}`}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] transition hover:bg-background hover:ring-1 hover:ring-border"
      >
        <span className="font-medium text-foreground">{label}</span>
        <Chevron direction="down" />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Fechar calendário"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-[#121212] p-3 shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Mês anterior"
                onClick={() => setVisible((current) => shiftMonth(current.year, current.month, -1))}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
              >
                <Chevron direction="left" />
              </button>
              <p
                id={titleId}
                className="whitespace-nowrap text-[12.5px] font-medium capitalize text-foreground"
              >
                {monthTitle(visible.year, visible.month)}
              </p>
              <button
                type="button"
                aria-label="Próximo mês"
                disabled={nextMonthDisabled}
                onClick={() => setVisible((current) => shiftMonth(current.year, current.month, 1))}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground disabled:opacity-30"
              >
                <Chevron direction="right" />
              </button>
            </div>
            <p className="mb-2 text-[10.5px] text-muted-foreground">{hint}</p>
            <div
              className="grid gap-y-1 text-center"
              style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
            >
              {WEEKDAYS.map((weekday) => (
                <span
                  key={weekday}
                  className="pb-1 text-[10px] font-medium uppercase tracking-wide text-muted"
                >
                  {weekday}
                </span>
              ))}
              {cells.map((cell) => {
                if (!cell.dateKey) {
                  return <span key={cell.key} />;
                }
                const rounded =
                  cell.isStart && cell.isEnd
                    ? "rounded-lg"
                    : cell.isStart
                      ? "rounded-l-lg"
                      : cell.isEnd
                        ? "rounded-r-lg"
                        : "";
                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={cell.disabled}
                    onMouseEnter={() => {
                      if (draftStart && !cell.disabled) setHover(cell.dateKey);
                    }}
                    onFocus={() => {
                      if (draftStart && !cell.disabled) setHover(cell.dateKey);
                    }}
                    onClick={() => onDayClick(cell.dateKey!)}
                    className={`h-8 text-[12px] transition disabled:cursor-not-allowed disabled:opacity-30 ${
                      cell.inRange ? `bg-foreground/12 ${rounded}` : "rounded-lg"
                    } ${
                      cell.isStart || cell.isEnd
                        ? "bg-foreground font-medium text-background"
                        : "text-foreground hover:bg-surface-elevated"
                    } ${cell.isToday && !cell.isStart && !cell.isEnd ? "ring-1 ring-border" : ""}`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10.5px] text-muted">
              {formatRangeLabel(from, to)}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" | "down" }) {
  const path =
    direction === "left"
      ? "M10 3.5L5.5 8L10 12.5"
      : direction === "right"
        ? "M6 3.5L10.5 8L6 12.5"
        : "M3.5 6L8 10.5L12.5 6";
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={direction === "down" ? "h-3 w-3 text-muted" : "h-3.5 w-3.5"}
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

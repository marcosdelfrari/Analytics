"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  defaultSortDirection,
  sortByAccessor,
  type SortDirection,
} from "@/lib/sort-table";

export function useColumnSort<K extends string>(
  initialKey: K,
  initialDirection?: SortDirection,
) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [direction, setDirection] = useState<SortDirection>(
    initialDirection ?? defaultSortDirection(initialKey),
  );

  function toggleSort(key: K) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection(defaultSortDirection(key));
  }

  return { sortKey, direction, toggleSort };
}

export function SortableTh<K extends string>({
  label,
  columnKey,
  sortKey,
  direction,
  onSort,
  align = "left",
  hint,
}: {
  label: string;
  columnKey: K;
  sortKey: K;
  direction: SortDirection;
  onSort: (key: K) => void;
  align?: "left" | "right";
  /** Balão ao passar o mouse no título da coluna. */
  hint?: string;
}) {
  const active = sortKey === columnKey;
  const indicator = active ? (direction === "asc" ? "↑" : "↓") : "↕";
  const hintId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [hintPos, setHintPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  function updateHintPosition() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxWidth = 256;
    const padding = 8;
    let left =
      align === "right"
        ? rect.right - maxWidth
        : rect.left;
    left = Math.max(padding, Math.min(left, window.innerWidth - maxWidth - padding));
    setHintPos({ top: rect.bottom + 6, left });
  }

  function showHint() {
    if (!hint) return;
    updateHintPosition();
    setHintOpen(true);
  }

  function hideHint() {
    setHintOpen(false);
  }

  const hintBubble =
    hint && hintOpen && mounted ? (
      <div
        id={hintId}
        role="tooltip"
        className="pointer-events-none fixed z-[100] w-max max-w-[16rem] rounded-lg border border-border bg-[#1a1a1a] px-2.5 py-2 text-left text-[11px] font-normal normal-case leading-snug tracking-normal text-foreground shadow-lg"
        style={{ top: hintPos.top, left: hintPos.left }}
      >
        {hint}
      </div>
    ) : null;

  return (
    <th
      className={`px-3.5 py-2 font-medium ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <span
        className={`inline-flex max-w-full ${align === "right" ? "ml-auto" : ""}`}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => onSort(columnKey)}
          onMouseEnter={showHint}
          onMouseLeave={hideHint}
          onFocus={showHint}
          onBlur={hideHint}
          aria-sort={
            active
              ? direction === "asc"
                ? "ascending"
                : "descending"
              : "none"
          }
          aria-describedby={hint && hintOpen ? hintId : undefined}
          className={`inline-flex max-w-full items-center gap-1 text-[10px] uppercase tracking-wider transition hover:text-foreground ${
            active ? "text-foreground" : "text-muted"
          } ${hint ? "cursor-help" : ""}`}
        >
          <span className="truncate">{label}</span>
          <span className="shrink-0 font-mono text-[9px] not-italic" aria-hidden>
            {indicator}
          </span>
        </button>
      </span>
      {hintBubble && mounted ? createPortal(hintBubble, document.body) : null}
    </th>
  );
}

/** Cabeçalho sortável com padding do layout de campanhas. */
export function SortableThCampaign<K extends string>({
  label,
  columnKey,
  sortKey,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  columnKey: K;
  sortKey: K;
  direction: SortDirection;
  onSort: (key: K) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === columnKey;
  const indicator = active ? (direction === "asc" ? "↑" : "↓") : "↕";

  return (
    <th
      className={`px-4 py-2.5 font-medium ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        aria-sort={
          active
            ? direction === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
        className={`inline-flex max-w-full items-center gap-1 text-[11px] uppercase tracking-wider transition hover:text-foreground ${
          active ? "text-foreground" : "text-muted"
        } ${align === "right" ? "ml-auto" : ""}`}
      >
        <span className="truncate">{label}</span>
        <span className="shrink-0 font-mono text-[9px] not-italic" aria-hidden>
          {indicator}
        </span>
      </button>
    </th>
  );
}

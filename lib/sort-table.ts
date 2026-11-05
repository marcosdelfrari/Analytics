export type SortDirection = "asc" | "desc";

export function compareSortValues(
  a: string | number,
  b: string | number,
  direction: SortDirection,
): number {
  const mult = direction === "asc" ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") {
    if (a === b) return 0;
    return (a < b ? -1 : 1) * mult;
  }
  return (
    String(a).localeCompare(String(b), "pt-BR", {
      numeric: true,
      sensitivity: "base",
    }) * mult
  );
}

export function sortByAccessor<T>(
  rows: readonly T[],
  getValue: (row: T) => string | number,
  direction: SortDirection,
): T[] {
  return [...rows].sort((left, right) =>
    compareSortValues(getValue(left), getValue(right), direction),
  );
}

export function defaultSortDirection(columnKey: string): SortDirection {
  const textKeys = new Set([
    "path",
    "source",
    "medium",
    "campaign",
    "term",
    "content",
    "fromPath",
    "toPath",
    "name",
    "platform",
    "type",
    "status",
  ]);
  return textKeys.has(columnKey) ? "asc" : "desc";
}

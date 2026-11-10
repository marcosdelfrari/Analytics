export const REPORT_PERIOD_OPTIONS = [
  { days: 0, label: "Hoje" },
  { days: 1, label: "24h" },
  { days: 7, label: "7 dias" },
  { days: 14, label: "14 dias" },
  { days: 30, label: "30 dias" },
] as const;

export const DEFAULT_REPORT_PERIOD_DAYS = 0;
export const MAX_REPORT_RANGE_DAYS = 366;

const ALLOWED_DAYS: readonly number[] = REPORT_PERIOD_OPTIONS.map(
  (option) => option.days,
);

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

export type DateKey = string;

export type TrackingWindow = {
  from: DateKey;
  to: DateKey;
};

export type ReportPeriod =
  | { kind: "days"; days: number }
  | { kind: "range"; from: DateKey; to: DateKey };

export function isDateKey(value: string): value is DateKey {
  const match = DATE_KEY.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

export function dateKeyToUtc(key: DateKey) {
  return new Date(`${key}T00:00:00.000Z`);
}

export function localDateKey(date = new Date()): DateKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToKey(key: DateKey, days: number): DateKey {
  const date = dateKeyToUtc(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysInRange(from: DateKey, to: DateKey) {
  const start = dateKeyToUtc(from).getTime();
  const end = dateKeyToUtc(to).getTime();
  return Math.round(Math.abs(end - start) / 86_400_000) + 1;
}

export function eachDateKey(from: DateKey, to: DateKey): DateKey[] {
  const start = from <= to ? from : to;
  const end = from <= to ? to : from;
  const keys: DateKey[] = [];
  let current = start;
  while (current <= end) {
    keys.push(current);
    current = addDaysToKey(current, 1);
  }
  return keys;
}

export function windowFromDays(
  days: number,
  today = localDateKey(),
): TrackingWindow {
  if (days <= 0) {
    return { from: today, to: today };
  }
  return {
    from: addDaysToKey(today, -days),
    to: today,
  };
}

export function trackingWindowFor(period: ReportPeriod): TrackingWindow {
  if (period.kind === "range") return { from: period.from, to: period.to };
  return windowFromDays(period.days);
}

export function formatDateKeyLabel(key: DateKey) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(dateKeyToUtc(key));
}

export function formatRangeLabel(from: DateKey, to: DateKey) {
  if (from === to) return formatDateKeyLabel(from);
  return `${formatDateKeyLabel(from)} – ${formatDateKeyLabel(to)}`;
}

export function parseReportPeriodDays(value: string | undefined) {
  const days = Number(value);
  if (!Number.isInteger(days) || !ALLOWED_DAYS.includes(days)) {
    return DEFAULT_REPORT_PERIOD_DAYS;
  }
  return days;
}

function clampRange(from: DateKey, to: DateKey, today: DateKey): TrackingWindow {
  let start = from <= to ? from : to;
  let end = from <= to ? to : from;
  if (start > today) start = today;
  if (end > today) end = today;
  if (daysInRange(start, end) > MAX_REPORT_RANGE_DAYS) {
    start = addDaysToKey(end, -(MAX_REPORT_RANGE_DAYS - 1));
  }
  return { from: start, to: end };
}

export function parseReportPeriod(
  params: {
    dias?: string;
    de?: string;
    ate?: string;
  },
  today: DateKey,
): ReportPeriod {
  const from = params.de;
  const to = params.ate;
  if (from && to && isDateKey(from) && isDateKey(to)) {
    const range = clampRange(from, to, today);
    return { kind: "range", from: range.from, to: range.to };
  }
  return { kind: "days", days: parseReportPeriodDays(params.dias) };
}

function asPeriod(period: ReportPeriod | number): ReportPeriod {
  return typeof period === "number" ? { kind: "days", days: period } : period;
}

function reportPeriodQuery(period: ReportPeriod) {
  if (period.kind === "days") {
    if (period.days === DEFAULT_REPORT_PERIOD_DAYS) return "";
    return `?dias=${period.days}`;
  }
  return `?de=${period.from}&ate=${period.to}`;
}

export function reportPeriodHref(period: ReportPeriod | number) {
  return `/relatorios${reportPeriodQuery(asPeriod(period))}`;
}

export function reportExportHref(period: ReportPeriod | number) {
  return `/relatorios/exportar${reportPeriodQuery(asPeriod(period))}`;
}

export const REPORT_PERIOD_OPTIONS = [
  { days: 1, label: "Último dia" },
  { days: 7, label: "7 dias" },
  { days: 14, label: "14 dias" },
  { days: 30, label: "30 dias" },
] as const;

export const DEFAULT_REPORT_PERIOD_DAYS = 1;

const ALLOWED_DAYS: readonly number[] = REPORT_PERIOD_OPTIONS.map(
  (option) => option.days,
);

export function parseReportPeriodDays(value: string | undefined) {
  const days = Number(value);
  if (!Number.isInteger(days) || !ALLOWED_DAYS.includes(days)) {
    return DEFAULT_REPORT_PERIOD_DAYS;
  }
  return days;
}

export function reportPeriodHref(days: number) {
  if (days === DEFAULT_REPORT_PERIOD_DAYS) return "/relatorios";
  return `/relatorios?dias=${days}`;
}

export function reportExportHref(days: number) {
  if (days === DEFAULT_REPORT_PERIOD_DAYS) return "/relatorios/exportar";
  return `/relatorios/exportar?dias=${days}`;
}

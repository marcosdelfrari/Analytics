/** Encurta rótulos do eixo (ex.: "05 de nov." → "05/11"). */
export function shortChartAxisLabel(label: string) {
  const match = /^(\d{1,2})\s+de\s+([a-zç]{3})\.?$/i.exec(label.trim());
  if (!match) return label;
  const months: Record<string, string> = {
    jan: "01",
    fev: "02",
    mar: "03",
    abr: "04",
    mai: "05",
    jun: "06",
    jul: "07",
    ago: "08",
    set: "09",
    out: "10",
    nov: "11",
    dez: "12",
  };
  const month = months[match[2].toLowerCase()];
  if (!month) return label;
  return `${match[1].padStart(2, "0")}/${month}`;
}

export function chartAxisLabelStep(count: number) {
  if (count <= 8) return 1;
  if (count <= 14) return 2;
  if (count <= 31) return 3;
  return Math.ceil(count / 10);
}

export function shouldShowChartAxisLabel(index: number, count: number) {
  const step = chartAxisLabelStep(count);
  return index === 0 || index === count - 1 || index % step === 0;
}

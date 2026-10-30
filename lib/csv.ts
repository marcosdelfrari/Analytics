function cell(value: string | number | null | undefined) {
  const text =
    typeof value === "number"
      ? value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })
      : String(value ?? "");
  const escaped = text.replaceAll('"', '""');
  return /[";\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

/** CSV com separador `;` e BOM, para abrir no Excel em pt-BR. */
export function toCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const lines = [headers, ...rows].map((row) => row.map(cell).join(";"));
  return `\uFEFF${lines.join("\r\n")}`;
}

export function csvAttachment(filename: string, body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

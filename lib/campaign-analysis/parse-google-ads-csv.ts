import type {
  GoogleAdsReportType,
  ParsedGoogleAdsImport,
  ParsedGoogleAdsRow,
} from "@/lib/campaign-analysis/types";

type ColumnMap = Partial<Record<
  | "campaign"
  | "keyword"
  | "matchType"
  | "status"
  | "adTitle"
  | "finalUrl"
  | "searchTerm"
  | "spend"
  | "clicks"
  | "impressions"
  | "conversions"
  | "day",
  number
>>;

const CAMPAIGN_HEADERS = [
  "campanha",
  "campaign",
  "nome da campanha",
  "campaign name",
];

const KEYWORD_HEADERS = [
  "palavra-chave",
  "palavra-chave na rede de pesquisa do google",
  "keyword",
  "palavra chave",
];

const MATCH_HEADERS = [
  "tipo de correspondência",
  "tipo de correspondencia",
  "correspondência",
  "match type",
];

const AD_TITLE_HEADERS = [
  "título do anúncio",
  "titulo do anuncio",
  "anúncio",
  "ad",
  "headline",
];

const SEARCH_TERM_HEADERS = [
  "termo de pesquisa",
  "search term",
  "consulta de pesquisa",
];

const SPEND_HEADERS = ["custo", "cost", "gasto", "spend"];
const CLICK_HEADERS = ["cliques", "clicks"];
const IMPRESSION_HEADERS = ["impressões", "impressoes", "impressions"];
const CONVERSION_HEADERS = [
  "conversões",
  "conversoes",
  "conversions",
  "todas as conversões",
];
const DAY_HEADERS = ["dia", "day", "data"];

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function detectDelimiter(line: string) {
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semicolons >= commas ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === delimiter && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function parseCsv(text: string) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (nonEmpty.length === 0) return { headers: [] as string[], rows: [] as string[][] };
  const delimiter = detectDelimiter(nonEmpty[0] ?? "");
  const headers = parseCsvLine(nonEmpty[0] ?? "", delimiter);
  const rows = nonEmpty.slice(1).map((line) => parseCsvLine(line, delimiter));
  return { headers, rows };
}

function indexFor(headers: string[], candidates: string[]) {
  const normalized = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const index = normalized.findIndex(
      (header) => header === candidate || header.includes(candidate),
    );
    if (index >= 0) return index;
  }
  return -1;
}

function buildColumnMap(headers: string[]): ColumnMap {
  return {
    campaign: indexFor(headers, CAMPAIGN_HEADERS),
    keyword: indexFor(headers, KEYWORD_HEADERS),
    matchType: indexFor(headers, MATCH_HEADERS),
    status: indexFor(headers, ["status da palavra-chave", "status", "estado"]),
    adTitle: indexFor(headers, AD_TITLE_HEADERS),
    finalUrl: indexFor(headers, ["url final", "final url", "página de destino"]),
    searchTerm: indexFor(headers, SEARCH_TERM_HEADERS),
    spend: indexFor(headers, SPEND_HEADERS),
    clicks: indexFor(headers, CLICK_HEADERS),
    impressions: indexFor(headers, IMPRESSION_HEADERS),
    conversions: indexFor(headers, CONVERSION_HEADERS),
    day: indexFor(headers, DAY_HEADERS),
  };
}

function detectReportType(map: ColumnMap): GoogleAdsReportType {
  if (map.searchTerm !== undefined && (map.searchTerm ?? -1) >= 0) {
    return "search_term";
  }
  if (map.keyword !== undefined && (map.keyword ?? -1) >= 0) {
    return "keyword";
  }
  if (map.adTitle !== undefined && (map.adTitle ?? -1) >= 0) {
    return "ad";
  }
  if (map.campaign !== undefined && (map.campaign ?? -1) >= 0) {
    return "campaign";
  }
  return "unknown";
}

function cellAt(row: string[], index: number | undefined) {
  if (index === undefined || index < 0) return "";
  return row[index] ?? "";
}

function parseMoneyBr(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return 0;
  const normalized = trimmed
    .replace(/[R$\s]/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseIntBr(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return 0;
  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function parseDateKeyBr(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) return trimmed;
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const brShort = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(trimmed);
  if (brShort) return `20${brShort[3]}-${brShort[2]}-${brShort[1]}`;
  return null;
}

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseGoogleAdsCsv(
  fileName: string,
  raw: string,
): ParsedGoogleAdsImport {
  const { headers, rows } = parseCsv(raw);
  const map = buildColumnMap(headers);
  const reportType = detectReportType(map);

  const parsedRows: ParsedGoogleAdsRow[] = [];
  const campaignNames = new Set<string>();
  const dayKeys: string[] = [];

  for (const row of rows) {
    const spend = parseMoneyBr(cellAt(row, map.spend));
    const clicks = parseIntBr(cellAt(row, map.clicks));
    const impressions = parseIntBr(cellAt(row, map.impressions));
    const conversions = parseIntBr(cellAt(row, map.conversions));
    const campaign = cellAt(row, map.campaign);
    const keyword = cellAt(row, map.keyword);
    const searchTerm = cellAt(row, map.searchTerm);

    if (!campaign && !keyword && !searchTerm && spend === 0 && clicks === 0) {
      continue;
    }

    if (campaign) campaignNames.add(campaign.trim());

    const dayRaw = cellAt(row, map.day);
    const dayKey = parseDateKeyBr(dayRaw);
    if (dayKey) dayKeys.push(dayKey);

    parsedRows.push({
      campaign: campaign || undefined,
      keyword: keyword || undefined,
      matchType: cellAt(row, map.matchType) || undefined,
      status: cellAt(row, map.status) || undefined,
      adTitle: cellAt(row, map.adTitle) || undefined,
      finalUrl: cellAt(row, map.finalUrl) || undefined,
      searchTerm: searchTerm || undefined,
      spend,
      clicks,
      impressions,
      conversions,
    });
  }

  const totals = parsedRows.reduce(
    (acc, row) => ({
      spend: acc.spend + row.spend,
      clicks: acc.clicks + row.clicks,
      impressions: acc.impressions + row.impressions,
      conversions: acc.conversions + row.conversions,
    }),
    { spend: 0, clicks: 0, impressions: 0, conversions: 0 },
  );

  const sortedDays = [...new Set(dayKeys)].sort();
  const periodFrom = sortedDays[0] ?? null;
  const periodTo = sortedDays[sortedDays.length - 1] ?? null;

  return {
    reportType,
    fileName,
    currency: "BRL",
    periodFrom,
    periodTo,
    campaignNames: [...campaignNames],
    rows: parsedRows,
    totals,
  };
}

export function keywordsFromImport(rows: ParsedGoogleAdsRow[]) {
  const byKeyword = new Map<string, ParsedGoogleAdsRow>();
  for (const row of rows) {
    const key = normalizeKeyword(row.keyword ?? row.searchTerm ?? "");
    if (!key) continue;
    const current = byKeyword.get(key);
    if (!current) {
      byKeyword.set(key, { ...row, keyword: row.keyword ?? row.searchTerm });
      continue;
    }
    byKeyword.set(key, {
      ...current,
      spend: current.spend + row.spend,
      clicks: current.clicks + row.clicks,
      impressions: current.impressions + row.impressions,
      conversions: current.conversions + row.conversions,
    });
  }
  return [...byKeyword.values()];
}

export { normalizeKeyword };
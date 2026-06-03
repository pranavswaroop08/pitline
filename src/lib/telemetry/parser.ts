import type { RawTelemetryRow } from "@/types/telemetry";

/**
 * Parse a single CSV line into fields, respecting quoted values.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

function coerceValue(value: string): string | number {
  const trimmed = value.trim();
  if (trimmed === "") return "";

  const num = Number(trimmed);
  if (!Number.isNaN(num) && trimmed !== "") {
    return num;
  }

  return trimmed;
}

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, "");
}

/**
 * Parse telemetry CSV text into an array of row objects.
 * First row is treated as column headers.
 */
export function parseTelemetryCsv(csvText: string): RawTelemetryRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const rows: RawTelemetryRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.every((v) => v === "")) continue;

    const row: RawTelemetryRow = {};
    headers.forEach((header, index) => {
      const raw = values[index] ?? "";
      row[header] = coerceValue(raw);
    });
    rows.push(row);
  }

  return rows;
}

export interface ParseResult {
  rows: RawTelemetryRow[];
  headers: string[];
  rowCount: number;
}

export function parseTelemetryFile(csvText: string): ParseResult {
  const rows = parseTelemetryCsv(csvText);
  const headers =
    rows.length > 0 ? Object.keys(rows[0]) : parseCsvLine(csvText.split(/\r?\n/)[0] ?? "").map(normalizeHeader);

  return {
    rows,
    headers,
    rowCount: rows.length,
  };
}

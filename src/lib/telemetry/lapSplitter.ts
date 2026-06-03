import type { Lap, RawTelemetryRow, TelemetryPoint } from "@/types/telemetry";

const LAP_COLUMN_ALIASES = ["lap", "lapnumber", "lapno", "lapnum", "lapcount"];

/** Minimum drop in time (seconds) to treat as a new lap when no Lap column exists */
const TIME_RESET_THRESHOLD = 0.05;

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

export function findLapColumn(rows: RawTelemetryRow[]): string | undefined {
  if (rows.length === 0) return undefined;

  for (const header of Object.keys(rows[0])) {
    const key = normalizeKey(header);
    if (LAP_COLUMN_ALIASES.some((alias) => normalizeKey(alias) === key)) {
      return header;
    }
  }
  return undefined;
}

function parseLapNumber(value: string | number | undefined): number {
  if (value === undefined || value === "") return 1;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

/**
 * Group raw CSV rows by Lap column value.
 */
export function groupRowsByLapColumn(
  rows: RawTelemetryRow[],
  lapColumn: string
): Map<number, RawTelemetryRow[]> {
  const groups = new Map<number, RawTelemetryRow[]>();

  for (const row of rows) {
    const lapNumber = parseLapNumber(row[lapColumn]);
    const chunk = groups.get(lapNumber);
    if (chunk) {
      chunk.push(row);
    } else {
      groups.set(lapNumber, [row]);
    }
  }

  return groups;
}

/**
 * Split normalized points when session time resets (new lap without Lap column).
 */
export function splitPointsByTimeReset(points: TelemetryPoint[]): TelemetryPoint[][] {
  if (points.length === 0) return [];

  const chunks: TelemetryPoint[][] = [[points[0]]];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].time;
    const curr = points[i].time;

    if (curr < prev - TIME_RESET_THRESHOLD) {
      chunks.push([points[i]]);
    } else {
      chunks[chunks.length - 1].push(points[i]);
    }
  }

  return chunks;
}

export type LapSplitMethod = "lap-column" | "time-reset" | "single";

export interface BuildLapsOptions {
  createId: (prefix: string) => string;
}

export function buildLapsFromRowGroups(
  groups: Map<number, RawTelemetryRow[]>,
  normalizeChunk: (rows: RawTelemetryRow[]) => TelemetryPoint[],
  options: BuildLapsOptions
): Lap[] {
  const lapNumbers = [...groups.keys()].sort((a, b) => a - b);

  return lapNumbers
    .map((lapNumber) => {
      const rows = groups.get(lapNumber) ?? [];
      const telemetry = normalizeChunk(rows);
      if (telemetry.length === 0) return null;

      return {
        id: options.createId("lap"),
        lapNumber,
        telemetry,
      };
    })
    .filter((lap): lap is Lap => lap !== null);
}

export function buildLapsFromPointChunks(
  chunks: TelemetryPoint[][],
  options: BuildLapsOptions
): Lap[] {
  return chunks
    .filter((chunk) => chunk.length > 0)
    .map((telemetry, index) => ({
      id: options.createId("lap"),
      lapNumber: index + 1,
      telemetry,
    }));
}

export function detectSplitMethod(
  rows: RawTelemetryRow[],
  laps: Lap[]
): LapSplitMethod {
  if (laps.length <= 1) return "single";
  if (findLapColumn(rows)) return "lap-column";
  return "time-reset";
}

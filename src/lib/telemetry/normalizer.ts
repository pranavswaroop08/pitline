import type { RawTelemetryRow, TelemetryPoint } from "@/types/telemetry";

const COLUMN_ALIASES: Record<keyof TelemetryPoint, string[]> = {
  time: ["time", "elapsedtime", "elapsed", "sessiontime", "t", "laptime"],
  x: ["x", "posx", "worldx", "positionx"],
  y: ["y", "posy", "worldy", "positiony"],
  speed: ["speed", "groundspeed", "ground speed", "velocity", "kmh", "km/h"],
  throttle: ["throttle", "throttlepos", "accel", "accelerator", "gas"],
  brake: ["brake", "brakepos", "brakepedal"],
  gear: ["gear", "gearpos"],
  rpm: ["rpm", "enginerpm", "engine rpm"],
};

const SESSION_ALIASES = {
  track: ["track", "trackname", "circuit"],
  car: ["car", "vehicle", "carmodel", "car name"],
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function buildColumnMap(headers: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const header of headers) {
    map.set(normalizeKey(header), header);
  }
  return map;
}

function resolveColumn(
  columnMap: Map<string, string>,
  aliases: string[]
): string | undefined {
  for (const alias of aliases) {
    const original = columnMap.get(normalizeKey(alias));
    if (original !== undefined) return original;
  }
  return undefined;
}

function toNumber(value: string | number | undefined): number {
  if (value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pickValue(
  row: RawTelemetryRow,
  columnMap: Map<string, string>,
  aliases: string[]
): string | number | undefined {
  const column = resolveColumn(columnMap, aliases);
  if (!column) return undefined;
  return row[column];
}

export interface NormalizeResult {
  points: TelemetryPoint[];
  skipped: number;
  columnMap: Partial<Record<keyof TelemetryPoint, string>>;
}

export function normalizeTelemetryRows(rows: RawTelemetryRow[]): NormalizeResult {
  if (rows.length === 0) {
    return { points: [], skipped: 0, columnMap: {} };
  }

  const headers = Object.keys(rows[0]);
  const columnMap = buildColumnMap(headers);

  const resolved: Partial<Record<keyof TelemetryPoint, string>> = {};
  for (const field of Object.keys(COLUMN_ALIASES) as (keyof TelemetryPoint)[]) {
    const col = resolveColumn(columnMap, COLUMN_ALIASES[field]);
    if (col) resolved[field] = col;
  }

  const points: TelemetryPoint[] = [];
  let skipped = 0;

  for (const row of rows) {
    const time = toNumber(pickValue(row, columnMap, COLUMN_ALIASES.time));
    const speed = toNumber(pickValue(row, columnMap, COLUMN_ALIASES.speed));

    if (resolved.time === undefined && time === 0 && resolved.speed === undefined && speed === 0) {
      skipped++;
      continue;
    }

    const point: TelemetryPoint = {
      time,
      x: toNumber(pickValue(row, columnMap, COLUMN_ALIASES.x)),
      y: toNumber(pickValue(row, columnMap, COLUMN_ALIASES.y)),
      speed,
      throttle: toNumber(pickValue(row, columnMap, COLUMN_ALIASES.throttle)),
      brake: toNumber(pickValue(row, columnMap, COLUMN_ALIASES.brake)),
    };

    const gearVal = pickValue(row, columnMap, COLUMN_ALIASES.gear);
    if (gearVal !== undefined && gearVal !== "") {
      point.gear = toNumber(gearVal);
    }

    const rpmVal = pickValue(row, columnMap, COLUMN_ALIASES.rpm);
    if (rpmVal !== undefined && rpmVal !== "") {
      point.rpm = toNumber(rpmVal);
    }

    points.push(point);
  }

  return { points, skipped, columnMap: resolved };
}

export function extractSessionMeta(rows: RawTelemetryRow[]): {
  track: string;
  car: string;
} {
  if (rows.length === 0) {
    return { track: "Unknown track", car: "Unknown car" };
  }

  const headers = Object.keys(rows[0]);
  const columnMap = buildColumnMap(headers);
  const first = rows[0];

  const trackCol = resolveColumn(columnMap, SESSION_ALIASES.track);
  const carCol = resolveColumn(columnMap, SESSION_ALIASES.car);

  const track =
    trackCol && first[trackCol] !== "" && first[trackCol] !== undefined
      ? String(first[trackCol])
      : "Unknown track";

  const car =
    carCol && first[carCol] !== "" && first[carCol] !== undefined
      ? String(first[carCol])
      : "Unknown car";

  return { track, car };
}

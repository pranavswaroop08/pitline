import {
  buildLapsFromPointChunks,
  buildLapsFromRowGroups,
  detectSplitMethod,
  findLapColumn,
  groupRowsByLapColumn,
  splitPointsByTimeReset,
  type LapSplitMethod,
} from "@/lib/telemetry/lapSplitter";
import { extractSessionMeta, normalizeTelemetryRows } from "@/lib/telemetry/normalizer";
import type { Lap, RawTelemetryRow, Session, TelemetryPoint } from "@/types/telemetry";

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface BuildSessionOptions {
  fileName?: string;
  track?: string;
  car?: string;
}

export interface BuildSessionResult {
  session: Session;
  pointCount: number;
  skipped: number;
  columnMap: ReturnType<typeof normalizeTelemetryRows>["columnMap"];
  splitMethod: LapSplitMethod;
}

function normalizeChunk(rows: RawTelemetryRow[]): TelemetryPoint[] {
  return normalizeTelemetryRows(rows).points;
}

function buildLaps(rows: RawTelemetryRow[]): Lap[] {
  const lapColumn = findLapColumn(rows);
  const idOptions = { createId };

  if (lapColumn) {
    const groups = groupRowsByLapColumn(rows, lapColumn);
    const laps = buildLapsFromRowGroups(groups, normalizeChunk, idOptions);
    if (laps.length > 0) return laps;
  }

  const { points } = normalizeTelemetryRows(rows);
  const chunks = splitPointsByTimeReset(points);

  if (chunks.length > 1) {
    return buildLapsFromPointChunks(chunks, idOptions);
  }

  if (points.length === 0) return [];

  return [
    {
      id: createId("lap"),
      lapNumber: 1,
      telemetry: points,
    },
  ];
}

export function buildSessionFromRows(
  rows: RawTelemetryRow[],
  options: BuildSessionOptions = {}
): BuildSessionResult {
  const { skipped, columnMap } = normalizeTelemetryRows(rows);
  const meta = extractSessionMeta(rows);
  const laps = buildLaps(rows);

  const track = options.track ?? meta.track;
  const car = options.car ?? meta.car;
  const pointCount = laps.reduce((n, lap) => n + lap.telemetry.length, 0);
  const splitMethod = detectSplitMethod(rows, laps);

  const session: Session = {
    id: createId("session"),
    track,
    car,
    laps,
  };

  return {
    session,
    pointCount,
    skipped,
    columnMap,
    splitMethod,
  };
}

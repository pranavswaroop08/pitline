import type { Lap } from "@/types/telemetry";

export interface LapDeltaPoint {
  index: number;
  time: number;
  speedA: number;
  speedB: number;
  /** Lap B speed minus Lap A speed at the same index */
  delta: number;
}

export interface LapDeltaResult {
  points: LapDeltaPoint[];
  comparedLength: number;
  lapALength: number;
  lapBLength: number;
}

/**
 * Compare two laps by aligned sample index.
 * Delta = speedB - speedA (positive means Lap B is faster at that index).
 */
export function computeLapSpeedDelta(lapA: Lap, lapB: Lap): LapDeltaResult {
  const lapALength = lapA.telemetry.length;
  const lapBLength = lapB.telemetry.length;
  const comparedLength = Math.min(lapALength, lapBLength);

  const points: LapDeltaPoint[] = [];

  for (let i = 0; i < comparedLength; i++) {
    const a = lapA.telemetry[i];
    const b = lapB.telemetry[i];
    points.push({
      index: i,
      time: a.time,
      speedA: a.speed,
      speedB: b.speed,
      delta: b.speed - a.speed,
    });
  }

  return {
    points,
    comparedLength,
    lapALength,
    lapBLength,
  };
}

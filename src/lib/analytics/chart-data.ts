import type { TelemetryPoint } from "@/types/telemetry";

export interface SpeedTimePoint {
  time: number;
  speed: number;
}

export function toSpeedTimeSeries(telemetry: TelemetryPoint[]): SpeedTimePoint[] {
  return telemetry.map((point) => ({
    time: point.time,
    speed: point.speed,
  }));
}

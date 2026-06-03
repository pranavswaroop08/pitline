export interface TelemetryPoint {
  time: number;
  x: number;
  y: number;
  speed: number;
  throttle: number;
  brake: number;
  gear?: number;
  rpm?: number;
}

export interface Lap {
  id: string;
  lapNumber: number;
  telemetry: TelemetryPoint[];
}

export interface Session {
  id: string;
  track: string;
  car: string;
  laps: Lap[];
}

/** One row from a telemetry CSV before normalization */
export type RawTelemetryRow = Record<string, string | number>;

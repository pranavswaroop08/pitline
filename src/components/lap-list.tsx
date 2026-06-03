"use client";

import type { Lap } from "@/types/telemetry";
import type { LapSplitMethod } from "@/lib/telemetry/lapSplitter";

const SPLIT_LABELS: Record<LapSplitMethod, string> = {
  "lap-column": "Lap column",
  "time-reset": "Time reset",
  single: "Single lap",
};

interface LapListProps {
  laps: Lap[];
  splitMethod: LapSplitMethod;
  selectedLapId: string | null;
  onSelectLap: (lapId: string) => void;
}

export function LapList({
  laps,
  splitMethod,
  selectedLapId,
  onSelectLap,
}: LapListProps) {
  if (laps.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">Laps</h3>
        <span className="text-xs text-zinc-500">{SPLIT_LABELS[splitMethod]}</span>
      </div>
      <ul className="space-y-1.5">
        {laps.map((lap) => {
          const isSelected = lap.id === selectedLapId;
          const duration =
            lap.telemetry.length > 0
              ? lap.telemetry[lap.telemetry.length - 1].time - lap.telemetry[0].time
              : 0;
          const peak = Math.max(...lap.telemetry.map((p) => p.speed), 0);

          return (
            <li key={lap.id}>
              <button
                type="button"
                onClick={() => onSelectLap(lap.id)}
                className={`flex w-full flex-col rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  isSelected
                    ? "border-emerald-600/70 bg-emerald-950/50 ring-1 ring-emerald-600/30"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800/80"
                }`}
              >
                <span
                  className={`text-sm font-medium ${isSelected ? "text-white" : "text-zinc-300"}`}
                >
                  Lap {lap.lapNumber}
                </span>
                <span className="mt-0.5 text-xs text-zinc-500">
                  {lap.telemetry.length} pts · {duration.toFixed(2)}s · peak {peak.toFixed(0)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-zinc-600">Click a lap to view its speed trace.</p>
    </div>
  );
}

"use client";

import { useMemo } from "react";

import { DeltaChart } from "@/components/delta-chart";
import { LapList } from "@/components/lap-list";
import { useSession } from "@/components/session-provider";
import { SpeedChart } from "@/components/speed-chart";
import { TelemetryUpload } from "@/components/telemetry-upload";
import { Button } from "@/components/ui/button";
import { useLapComparison } from "@/lib/analytics/use-lap-comparison";
import { toSpeedTimeSeries } from "@/lib/analytics/chart-data";
import type { ParsedTelemetry } from "@/components/telemetry-upload";

interface SessionDashboardProps {
  onReplaceFile: (result: ParsedTelemetry) => void;
}

export function SessionDashboard({ onReplaceFile }: SessionDashboardProps) {
  const { session, meta, selectedLap, selectedLapId, selectLap, clearSession } = useSession();

  const comparison = useLapComparison(session?.laps ?? []);

  const speedChartData = useMemo(
    () => (selectedLap ? toSpeedTimeSeries(selectedLap.telemetry) : []),
    [selectedLap]
  );

  if (!session || !meta) return null;

  const totalPoints = session.laps.reduce((n, l) => n + l.telemetry.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{meta.fileName}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {session.track} · {session.car} · {totalPoints} points · {session.laps.length} lap
            {session.laps.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TelemetryUpload compact onParsed={onReplaceFile} />
          <Button variant="outline" size="sm" onClick={clearSession}>
            Clear session
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
        <aside className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 lg:sticky lg:top-6 lg:self-start">
          <LapList
            laps={session.laps}
            splitMethod={meta.splitMethod}
            selectedLapId={selectedLapId}
            onSelectLap={selectLap}
          />

          <div className="border-t border-zinc-800 pt-5">
            <h3 className="mb-3 text-sm font-semibold text-zinc-200">Compare</h3>
            {!comparison.canCompare ? (
              <p className="text-xs leading-relaxed text-zinc-500">
                Need 2+ laps. Add a <span className="text-zinc-400">Lap</span> column to your CSV.
              </p>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs">
                  <span className="mb-1 block text-zinc-500">Baseline (A)</span>
                  <select
                    value={comparison.lapAId}
                    onChange={(e) => comparison.setLapAId(e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {session.laps.map((lap) => (
                      <option key={lap.id} value={lap.id}>
                        Lap {lap.lapNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block text-zinc-500">Compare (B)</span>
                  <select
                    value={comparison.lapBId}
                    onChange={(e) => comparison.setLapBId(e.target.value)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {session.laps.map((lap) => (
                      <option key={lap.id} value={lap.id}>
                        Lap {lap.lapNumber}
                      </option>
                    ))}
                  </select>
                </label>
                {comparison.sameLap && (
                  <p className="text-xs text-amber-400">Pick two different laps.</p>
                )}
                {comparison.lengthMismatch && comparison.deltaResult && (
                  <p className="text-xs text-zinc-500">
                    Using first {comparison.deltaResult.comparedLength} samples (lengths differ).
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="space-y-6 min-w-0">
          {selectedLap && speedChartData.length > 0 ? (
            <SpeedChart lapNumber={selectedLap.lapNumber} data={speedChartData} />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-500">
              Select a lap to view speed vs time
            </div>
          )}

          {comparison.canCompare &&
            comparison.deltaResult &&
            comparison.lapA &&
            comparison.lapB &&
            !comparison.sameLap &&
            comparison.deltaResult.points.length > 0 && (
              <DeltaChart
                lapANumber={comparison.lapA.lapNumber}
                lapBNumber={comparison.lapB.lapNumber}
                data={comparison.deltaResult.points}
              />
            )}
        </main>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

import { computeLapSpeedDelta } from "@/lib/analytics/delta";
import type { Lap } from "@/types/telemetry";

export function useLapComparison(laps: Lap[]) {
  const [lapAId, setLapAId] = useState("");
  const [lapBId, setLapBId] = useState("");

  useEffect(() => {
    setLapAId(laps[0]?.id ?? "");
    setLapBId(laps[1]?.id ?? laps[0]?.id ?? "");
  }, [laps]);

  const lapA = laps.find((lap) => lap.id === lapAId);
  const lapB = laps.find((lap) => lap.id === lapBId);

  const deltaResult = useMemo(() => {
    if (!lapA || !lapB || lapA.id === lapB.id) return null;
    return computeLapSpeedDelta(lapA, lapB);
  }, [lapA, lapB]);

  const canCompare = laps.length >= 2;
  const sameLap = Boolean(lapA && lapB && lapA.id === lapB.id);
  const lengthMismatch = Boolean(
    deltaResult && deltaResult.lapALength !== deltaResult.lapBLength
  );

  return {
    lapA,
    lapB,
    lapAId,
    lapBId,
    setLapAId,
    setLapBId,
    deltaResult,
    canCompare,
    sameLap,
    lengthMismatch,
  };
}

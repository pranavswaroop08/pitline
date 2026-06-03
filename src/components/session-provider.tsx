"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { buildSessionFromRows } from "@/lib/session/build-session";
import { setStoredSession } from "@/lib/session/memory-store";
import type { LapSplitMethod } from "@/lib/telemetry/lapSplitter";
import type { Lap, RawTelemetryRow, Session } from "@/types/telemetry";

export interface SessionLoadMeta {
  fileName: string;
  pointCount: number;
  skipped: number;
  columnMap: Record<string, string>;
  splitMethod: LapSplitMethod;
}

interface SessionContextValue {
  session: Session | null;
  meta: SessionLoadMeta | null;
  selectedLap: Lap | null;
  selectedLapId: string | null;
  selectLap: (lapId: string) => void;
  loadFromRows: (rows: RawTelemetryRow[], fileName: string) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [meta, setMeta] = useState<SessionLoadMeta | null>(null);
  const [selectedLapId, setSelectedLapId] = useState<string | null>(null);

  const loadFromRows = useCallback((rows: RawTelemetryRow[], fileName: string) => {
    const { session: built, pointCount, skipped, columnMap, splitMethod } =
      buildSessionFromRows(rows);

    setSession(built);
    setStoredSession(built);
    setSelectedLapId(built.laps[0]?.id ?? null);
    setMeta({
      fileName,
      pointCount,
      skipped,
      columnMap: columnMap as Record<string, string>,
      splitMethod,
    });
  }, []);

  const selectLap = useCallback((lapId: string) => {
    setSelectedLapId(lapId);
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    setMeta(null);
    setSelectedLapId(null);
    setStoredSession(null);
  }, []);

  const selectedLap =
    session?.laps.find((lap) => lap.id === selectedLapId) ?? session?.laps[0] ?? null;

  const value = useMemo(
    () => ({
      session,
      meta,
      selectedLap,
      selectedLapId,
      selectLap,
      loadFromRows,
      clearSession,
    }),
    [session, meta, selectedLap, selectedLapId, selectLap, loadFromRows, clearSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}

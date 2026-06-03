"use client";

import { SessionDashboard } from "@/components/session-dashboard";
import { SessionProvider, useSession } from "@/components/session-provider";
import { TelemetryUpload, type ParsedTelemetry } from "@/components/telemetry-upload";

function DashboardContent() {
  const { loadFromRows, session } = useSession();

  const handleParsed = (result: ParsedTelemetry) => {
    loadFromRows(result.rows, result.fileName);
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center py-8">
        <TelemetryUpload onParsed={handleParsed} />
        <p className="mt-8 max-w-md text-center text-sm text-zinc-500">
          Upload a CSV with columns like{" "}
          <span className="text-zinc-400">time, speed, throttle, brake</span>. Optional{" "}
          <span className="text-zinc-400">Lap</span> column splits multiple laps.
        </p>
      </div>
    );
  }

  return <SessionDashboard onReplaceFile={handleParsed} />;
}

export function Dashboard() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}

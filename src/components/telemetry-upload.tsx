"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

import { parseTelemetryFile } from "@/lib/telemetry/parser";
import type { RawTelemetryRow } from "@/types/telemetry";

export interface ParsedTelemetry {
  fileName: string;
  headers: string[];
  rows: RawTelemetryRow[];
  rowCount: number;
}

interface TelemetryUploadProps {
  onParsed?: (result: ParsedTelemetry) => void;
  /** Compact bar for dashboard header when a session is already loaded */
  compact?: boolean;
}

export function TelemetryUpload({ onParsed, compact = false }: TelemetryUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a CSV file.");
        return;
      }

      try {
        const text = await file.text();
        const { rows, headers, rowCount } = parseTelemetryFile(text);

        if (rowCount === 0) {
          setError("No data rows found. CSV needs a header row and at least one data row.");
          return;
        }

        onParsed?.({ fileName: file.name, headers, rows, rowCount });
      } catch {
        setError("Failed to read or parse the file.");
      }
    },
    [onParsed]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const inputId = compact ? "telemetry-csv-compact" : "telemetry-csv";

  if (compact) {
    return (
      <div>
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            isDragging
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
              : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Replace CSV
          <input
            id={inputId}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 transition-colors ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-800/40"
        }`}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
          <Upload className="h-7 w-7 text-zinc-400" />
        </div>
        <span className="text-base font-medium text-zinc-200">Upload telemetry CSV</span>
        <span className="mt-2 text-sm text-zinc-500">Drag and drop or click to browse</span>
        <input
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>

      {error && (
        <p className="mt-4 text-center text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

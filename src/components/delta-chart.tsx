"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LapDeltaPoint } from "@/lib/analytics/delta";

interface DeltaChartProps {
  lapANumber: number;
  lapBNumber: number;
  data: LapDeltaPoint[];
}

export function DeltaChart({ lapANumber, lapBNumber, data }: DeltaChartProps) {
  if (data.length === 0) return null;

  const deltas = data.map((d) => d.delta);
  const maxDelta = Math.max(...deltas);
  const minDelta = Math.min(...deltas);

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-lg text-white">Speed delta</CardTitle>
        <CardDescription className="text-zinc-400">
          Lap {lapBNumber} − Lap {lapANumber} per index · {data.length} samples · range{" "}
          {minDelta.toFixed(1)} to {maxDelta.toFixed(1)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
              <XAxis
                dataKey="time"
                type="number"
                domain={["dataMin", "dataMax"]}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickFormatter={(v: number) => v.toFixed(1)}
                stroke="#52525b"
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                stroke="#52525b"
                width={48}
              />
              <ReferenceLine y={0} stroke="#71717a" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
                labelFormatter={(_, items) => {
                  const point = items?.[0]?.payload as LapDeltaPoint | undefined;
                  if (!point) return "";
                  return `Index ${point.index} · ${point.time.toFixed(2)} s`;
                }}
                formatter={(value, _name, item) => {
                  const point = item.payload as LapDeltaPoint;
                  return [
                    `${Number(value).toFixed(2)} (A: ${point.speedA.toFixed(1)}, B: ${point.speedB.toFixed(1)})`,
                    "Δ speed",
                  ];
                }}
              />
              <Line
                type="monotone"
                dataKey="delta"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#fbbf24" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Time (s) from Lap {lapANumber} · positive = Lap {lapBNumber} faster
        </p>
      </CardContent>
    </Card>
  );
}

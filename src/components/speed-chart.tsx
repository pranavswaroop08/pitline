"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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
import type { SpeedTimePoint } from "@/lib/analytics/chart-data";

interface SpeedChartProps {
  lapNumber: number;
  data: SpeedTimePoint[];
}

export function SpeedChart({ lapNumber, data }: SpeedChartProps) {
  if (data.length === 0) {
    return null;
  }

  const maxSpeed = Math.max(...data.map((d) => d.speed));

  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader>
        <CardTitle className="text-lg text-white">Speed vs time</CardTitle>
        <CardDescription className="text-zinc-400">
          Lap {lapNumber} · {data.length} samples · peak {maxSpeed.toFixed(0)}
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
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
                itemStyle={{ color: "#34d399" }}
                labelFormatter={(value) => `Time: ${Number(value).toFixed(2)} s`}
                formatter={(value) => [Number(value).toFixed(1), "Speed"]}
              />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#34d399"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#34d399" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">Time (s)</p>
      </CardContent>
    </Card>
  );
}

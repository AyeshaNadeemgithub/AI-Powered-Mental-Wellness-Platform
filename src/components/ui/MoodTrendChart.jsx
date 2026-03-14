import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const MOCK_DATA = [
  { day: "Mon", value: 35 },
  { day: "Tue", value: 42 },
  { day: "Wed", value: 28 },
  { day: "Thu", value: 55 },
  { day: "Fri", value: 48 },
  { day: "Sat", value: 62 },
  { day: "Sun", value: 38 },
];

/**
 * Small red line chart for Urgent Cases mood trend.
 */
export default function MoodTrendChart() {
  return (
    <div style={{ width: "100%", height: 80, background: "#FFF0F6", borderRadius: 8, padding: "8px 0" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={MOCK_DATA} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#9896B8" }}
            axisLine={false}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #E5E1F8",
              borderRadius: 6,
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: "#EF4444", r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

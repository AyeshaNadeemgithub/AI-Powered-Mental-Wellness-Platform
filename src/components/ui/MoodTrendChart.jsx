import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/**
 * Line chart for mood trend over time.
 * Accepts a `data` prop: [{ day: "Mon", value: 5 }]
 * `value` is the mood score (1-7) or percentage (0-100).
 * Falls back to empty state when no data is provided.
 */
export default function MoodTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        width: "100%", height: 80, background: "#FFF0F6", borderRadius: 8, padding: "8px 0",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#9896B8", fontSize: 12, fontStyle: "italic",
      }}>
        No trend data yet
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 80, background: "#FFF0F6", borderRadius: 8, padding: "8px 0" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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

import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

/**
 * Horizontal bar chart for mood distribution.
 * Accepts a `data` prop: [{ name, value, fill }]
 * `value` should be a percentage (0-100) or count.
 * Falls back to empty state when no data is provided.
 */
export default function MoodBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        width: "100%", height: 120, marginTop: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#9896B8", fontSize: 12, fontStyle: "italic",
      }}>
        No mood data yet
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 120, marginTop: 12 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 60, bottom: 0 }}
        >
          <XAxis type="number" hide domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#4C4682" }}
            width={55}
            axisLine={false}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || "#7C3AED"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const MOCK_DATA = [
  { name: "Happy", value: 85, fill: "#7C3AED" },
  { name: "Anxious", value: 45, fill: "#A78BFA" },
  { name: "Neutral", value: 35, fill: "#F59E0B" },
  { name: "Not Good", value: 15, fill: "#D1D5DB" },
];

/**
 * Horizontal bar chart for Patient Overview mood distribution.
 */
export default function MoodBarChart() {
  return (
    <div style={{ width: "100%", height: 120, marginTop: 12 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={MOCK_DATA}
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
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MOCK_DATA = [
  { time: "00:00", cbtBot: 42, database: 35 },
  { time: "04:00", cbtBot: 38, database: 40 },
  { time: "08:00", cbtBot: 65, database: 55 },
  { time: "12:00", cbtBot: 78, database: 62 },
  { time: "16:00", cbtBot: 85, database: 70 },
  { time: "20:00", cbtBot: 72, database: 58 },
  { time: "24:00", cbtBot: 50, database: 45 },
];

export default function SystemHealthChart() {
  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={MOCK_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1F8" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#9896B8" }}
            axisLine={{ stroke: "#E5E1F8" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9896B8" }}
            axisLine={{ stroke: "#E5E1F8" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #E5E1F8",
              borderRadius: 8,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: "#4C4682", fontSize: 12, fontWeight: 600 }}>
                {value}
              </span>
            )}
            iconType="square"
            iconSize={10}
          />
          <Line
            type="monotone"
            dataKey="cbtBot"
            name="CBT Bot Load"
            stroke="#7C3AED"
            strokeWidth={2}
            dot={{ fill: "#7C3AED", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="database"
            name="Database"
            stroke="#9896B8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#9896B8", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

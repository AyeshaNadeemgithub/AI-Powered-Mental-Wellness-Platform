import React from "react";
import CardBox from "./CardBox";

const SUBTEXT_ICONS = {
  arrow: "↑",
  check: "✓",
  warning: "⚠",
};

/**
 * Stat card for dashboard overview/schedule views.
 * Props: label, value, subtext, accentColor, subtextColor, subtextIcon (arrow|check|warning)
 */
export default function StatCard({
  label,
  value,
  subtext,
  accentColor = "#7C3AED",
  subtextColor,
  subtextIcon,
}) {
  const resolvedSubtextColor =
    subtextColor ||
    (subtext?.startsWith("+") ? "#10B981" : subtext === "Stable" ? "#F59E0B" : subtextIcon === "warning" ? "#EF4444" : "#10B981");
  const icon = subtextIcon ? SUBTEXT_ICONS[subtextIcon] : null;
  return (
    <CardBox style={{ flex: 1 }}>
      <div
        style={{
          fontSize: 13,
          color: "#9896B8",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 800,
          fontSize: 32,
          color: accentColor,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: resolvedSubtextColor,
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {icon && <span>{icon}</span>}
        {subtext}
      </div>
    </CardBox>
  );
}

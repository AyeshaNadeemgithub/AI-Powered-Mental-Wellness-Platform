import React from "react";

export default function SidebarIcon({ icon, active, inverted }) {
  const color =
    active && inverted
      ? "#fff"
      : active
        ? "#7C3AED"
        : inverted
          ? "rgba(255,255,255,0.7)"
          : "#4C4682";
  return (
    <span
      style={{
        fontSize: 18,
        marginRight: inverted ? 0 : 12,
        color,
        transition: "color 0.2s",
        display: "inline-block",
        width: 28,
        textAlign: "center",
      }}
    >
      {icon}
    </span>
  );
}

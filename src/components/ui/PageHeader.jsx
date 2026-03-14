import React from "react";

/**
 * Unified page header for Admin and Psychologist dashboards.
 * Props: title, profileLabel (e.g. "Admin Profile" / "Psychologist Profile"), onLogout
 */
export default function PageHeader({ title, profileLabel, onLogout }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 28,
          color: "#1E1B4B",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 600, color: "#4C4682" }}>{profileLabel}</span>
        <button
          style={{
            background: "#EF4444",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
          }}
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

import React, { useState } from "react";

/**
 * Top header bar for Admin dashboard.
 * Left: Logo, Center: Search, Right: Admin Profile + Logout
 */
export default function AdminTopBar({ onLogout }) {
  const [search, setSearch] = useState("");

  return (
    <header
      style={{
        height: 64,
        background: "#fff",
        borderBottom: "1px solid #E5E1F8",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 24,
        flexShrink: 0,
        boxShadow: "0 2px 12px rgba(124,58,237,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 200,
        }}
      >
        <img
          src="/calmmind-logo.png"
          alt="CalmMind"
          style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#1E1B4B",
          }}
        >
          CalmMind Wellness Platform
        </span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#F0EEFB",
            borderRadius: 8,
            border: "1px solid #E5E1F8",
            padding: "8px 14px",
            maxWidth: 320,
            width: "100%",
          }}
        >
          <span style={{ fontSize: 14, color: "#9896B8" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search platform..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 14,
              color: "#1E1B4B",
              flex: 1,
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: "#4C4682",
            fontSize: 14,
          }}
        >
          Admin Profile
        </span>
        <button
          onClick={onLogout}
          style={{
            background: "#EF4444",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

import React, { useState } from "react";
import { Logo } from "../ui/Brand";

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
        <Logo size="md" />
      </div>
      <div style={{ flex: 1 }} />
    </header>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarIcon from "../ui/SidebarIcon";

/**
 * Shared layout for Admin and Psychologist dashboards.
 * Props: menuItems, activeKey, onMenuClick, children, onLogout
 */
export default function StaffDashboardLayout({
  menuItems,
  activeKey,
  onMenuClick,
  children,
  onLogout,
}) {
  const navigate = useNavigate();
  const handleLogout = onLogout || (() => navigate("/login"));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0EEFB" }}>
      <aside
        style={{
          width: 260,
          background: "#fff",
          borderRight: "1px solid #E5E1F8",
          padding: "32px 24px 24px 24px",
          position: "relative",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <img
            src="/calmmind-logo.png"
            alt="CalmMind Logo"
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              objectFit: "cover",
            }}
          />
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "#7C3AED",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              CalmMind
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#7C3AED",
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Support For Today,
              <br />
              Strength For Tomorrow
            </div>
          </div>
        </div>
        {menuItems.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              marginBottom: 8,
              borderRadius: 8,
              background: activeKey === item.key ? "#EDE9FE" : "transparent",
              color: activeKey === item.key ? "#7C3AED" : "#4C4682",
              cursor: "pointer",
              fontWeight: activeKey === item.key ? 700 : 500,
              transition: "background 0.2s, color 0.2s",
            }}
            onClick={() => onMenuClick(item.key)}
          >
            <SidebarIcon icon={item.icon} active={activeKey === item.key} />
            {item.label}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            width: "calc(100% - 48px)",
          }}
        >
          <button
            style={{
              background: "#EF4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 0",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 16,
              width: "100%",
            }}
            onClick={handleLogout}
          >
            <span style={{ fontSize: 18, marginRight: 8 }}>🚪</span> Logout
          </button>
        </div>
      </aside>
      <main
        style={{
          flex: 1,
          padding: "40px 48px",
          minHeight: "100vh",
          background: "#F0EEFB",
        }}
      >
        {children}
      </main>
    </div>
  );
}

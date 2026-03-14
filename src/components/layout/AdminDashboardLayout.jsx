import React from "react";
import { useNavigate } from "react-router-dom";
import AdminTopBar from "./AdminTopBar";
import SidebarIcon from "../ui/SidebarIcon";

/**
 * Admin-specific layout: top bar + deep purple sidebar (220px) + content.
 */
export default function AdminDashboardLayout({
  menuItems,
  activeKey,
  onMenuClick,
  children,
  onLogout,
}) {
  const navigate = useNavigate();
  const handleLogout = onLogout || (() => navigate("/login"));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#F0EEFB",
      }}
    >
      <AdminTopBar onLogout={handleLogout} />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            background: "#5B21B6",
            padding: "24px 14px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <img
              src="/calmmind-logo.png"
              alt="CalmMind"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                objectFit: "cover",
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              CalmMind Wellness Platform
            </span>
          </div>
          <nav style={{ flex: 1 }}>
            {menuItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => onMenuClick(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 14px",
                    marginBottom: 4,
                    borderRadius: 8,
                    background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                    cursor: "pointer",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                  }}
                >
                  <SidebarIcon
                    icon={item.icon}
                    active={isActive}
                    inverted
                  />
                  {item.label}
                </div>
              );
            })}
          </nav>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              onClick={() => onMenuClick("settings")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 14px",
                borderRadius: 8,
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 18 }}>⚙️</span>
              Admin Settings
            </div>
            <div
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 14px",
                borderRadius: 8,
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              <span style={{ fontSize: 18 }}>🚪</span>
              Logout
            </div>
          </div>
        </aside>
        <main
          style={{
            flex: 1,
            padding: "32px 40px",
            overflowY: "auto",
            background: "#F0EEFB",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

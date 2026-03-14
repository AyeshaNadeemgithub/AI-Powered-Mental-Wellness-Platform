import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarIcon from "../ui/SidebarIcon";

/**
 * Psychologist layout: white sidebar (220px) + main content + optional right panel.
 * When hasRightPanel=true, renders three-column layout for Schedule view.
 */
export default function PsychologistDashboardLayout({
  menuItems,
  activeKey,
  onMenuClick,
  children,
  rightPanel,
  onLogout,
}) {
  const navigate = useNavigate();
  const handleLogout = onLogout || (() => navigate("/login"));
  const showRightPanel = !!rightPanel;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F0EEFB",
      }}
    >
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: "#fff",
          borderRight: "1px solid #E5E1F8",
          padding: "24px 14px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 20px rgba(124,58,237,0.06)",
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
              fontSize: 14,
              fontWeight: 800,
              color: "#7C3AED",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Calm Mind
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
                  background: isActive
                    ? "linear-gradient(135deg, #7C3AED, #8B5CF6)"
                    : "transparent",
                  color: isActive ? "#fff" : "#4C4682",
                  cursor: "pointer",
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 14,
                }}
              >
                <SidebarIcon
                  icon={item.icon}
                  active={isActive}
                  inverted={isActive}
                />
                {item.label}
              </div>
            );
          })}
        </nav>
        <div
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "11px 14px",
            borderRadius: 8,
            color: "#6B7280",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          Logout
        </div>
      </aside>
      <div
        style={{
          flex: 1,
          display: "flex",
          minWidth: 0,
        }}
      >
        <main
          style={{
            flex: showRightPanel ? 1 : 1,
            padding: showRightPanel ? "24px 28px" : "32px 40px",
            overflowY: "auto",
            background: "#F0EEFB",
          }}
        >
          {children}
        </main>
        {showRightPanel && (
          <div
            style={{
              width: 320,
              flexShrink: 0,
              padding: "24px 20px",
              overflowY: "auto",
              background: "#F0EEFB",
              borderLeft: "1px solid #E5E1F8",
            }}
          >
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  );
}

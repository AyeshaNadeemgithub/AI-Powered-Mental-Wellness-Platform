import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarIcon from "../ui/SidebarIcon";
import { Logo } from "../ui/Brand";
import { getStoredUser } from "../../api";
import { colors, fonts, radius } from "../../styles/theme";

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

  const user = getStoredUser();
  const rawFirst = user?.firstName || "Therapist";
  const rawLast = user?.lastName === "-" ? "" : user?.lastName || "";
  const fullName = `${rawFirst} ${rawLast}`.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  const role       = "Psychologist";
  const avatarChar = fullName.charAt(0).toUpperCase();

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
            paddingLeft: 4,
          }}
        >
          <Logo size="xl" />
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
        {/* User profile card */}
        <div style={{
          marginTop: 24, padding: "14px 12px", borderRadius: radius.lg,
          background: colors.purpleSoft, border: `1px solid ${colors.border}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, color: "#fff", fontWeight: 700, fontFamily: fonts.body,
            flexShrink: 0,
          }}>{avatarChar}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, fontFamily: fonts.body }}>{fullName}</div>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.body }}>{role}</div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 10,
            width: "100%", padding: "11px 16px",
            borderRadius: radius.md,
            border: "1.5px solid #FCA5A5",
            background: "#FEF2F2",
            color: "#DC2626",
            fontFamily: fonts.body, fontSize: 13, fontWeight: 700,
            cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 10,
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#DC2626";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#DC2626";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#FEF2F2";
            e.currentTarget.style.color = "#DC2626";
            e.currentTarget.style.borderColor = "#FCA5A5";
          }}
        >
          <span style={{ fontSize: 16 }}>🚪</span>
          Log Out
        </button>
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

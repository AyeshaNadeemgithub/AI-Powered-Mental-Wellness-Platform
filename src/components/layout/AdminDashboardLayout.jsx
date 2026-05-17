import React from "react";
import { useNavigate } from "react-router-dom";
import SidebarIcon from "../ui/SidebarIcon";
import { Logo } from "../ui/Brand";
import { getStoredUser } from "../../api";
import { colors, fonts, radius } from "../../styles/theme";

/**
 * Admin-specific layout: white sidebar (220px) + content.
 * Structured beautifully to match other dashboards.
 */
export default function AdminDashboardLayout({
  menuItems,
  activeKey,
  onMenuClick,
  children,
  onLogout,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const handleLogout = onLogout || (() => navigate("/login"));

  const user = getStoredUser();
  const rawFirst = user?.firstName || "Admin";
  const rawLast = user?.lastName === "-" ? "" : user?.lastName || "";
  const fullName = `${rawFirst} ${rawLast}`.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") || "System Admin";
  const role = "Administrator";
  const avatarChar = fullName.charAt(0).toUpperCase() || "A";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F0EEFB",
        position: "relative"
      }}
    >
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="desktop-only"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 998 }} 
        />
      )}
      <aside
        className={`mobile-sidebar ${isMobileMenuOpen ? "open" : ""}`}
        style={{
          width: 220,
          flexShrink: 0,
          background: "#fff",
          borderRight: "1px solid #E5E1F8",
          padding: "24px 14px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 20px rgba(124,58,237,0.06)",
          zIndex: 999,
        }}
      >
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 4,
          }}
        >
          <Logo size="md" />
          <button 
            className="mobile-flex"
            style={{ display: "none", background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9896B8" }}
            onClick={() => setIsMobileMenuOpen(false)}
          >✕</button>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {menuItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => {
                    onMenuClick(item.key);
                    setIsMobileMenuOpen(false);
                  }}
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
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = `${colors.purple}0D`;
                      e.currentTarget.style.color = colors.purple;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#4C4682";
                    }
                  }}
                >
                  <SidebarIcon
                    icon={item.icon}
                    active={isActive}
                    inverted={isActive}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </div>
              );
            })}
          </div>

          {/* Admin Settings Button */}
          <div
            onClick={() => {
              onMenuClick("settings");
              setIsMobileMenuOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              marginBottom: 4,
              borderRadius: 8,
              background: activeKey === "settings"
                ? "linear-gradient(135deg, #7C3AED, #8B5CF6)"
                : "transparent",
              color: activeKey === "settings" ? "#fff" : "#4C4682",
              cursor: "pointer",
              fontWeight: activeKey === "settings" ? 700 : 600,
              fontSize: 14,
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              if (activeKey !== "settings") {
                e.currentTarget.style.background = `${colors.purple}0D`;
                e.currentTarget.style.color = colors.purple;
              }
            }}
            onMouseLeave={(e) => {
              if (activeKey !== "settings") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#4C4682";
              }
            }}
          >
            <SidebarIcon
              icon="⚙️"
              active={activeKey === "settings"}
              inverted={activeKey === "settings"}
            />
            <span style={{ flex: 1 }}>Admin Settings</span>
          </div>
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
            outline: "none",
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
      <main
        style={{
          flex: 1,
          padding: "32px 40px",
          overflowY: "auto",
          background: "#F0EEFB",
          minWidth: 0,
        }}
        className="mobile-padding-sm"
      >
        <div className="mobile-flex" style={{ display: "none", alignItems: "center", marginBottom: 20, gap: 16 }}>
          <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: "none", border: "none", fontSize: 24, color: "#1E1B4B", padding: 0 }}>☰</button>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: fonts.display }}>Menu</div>
        </div>
        {children}
      </main>
    </div>
  );
}

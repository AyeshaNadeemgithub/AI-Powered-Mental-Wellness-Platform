import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "../ui/Brand";
import { colors, fonts, radius } from "../../styles/theme";
import { NAV_ITEMS } from "../../data";
import { getStoredUser, clearSession } from "../../api";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const rawFirst = user?.firstName || "Guest";
  const rawLast = user?.lastName === "-" ? "" : user?.lastName || "";
  const fullName = `${rawFirst} ${rawLast}`.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  const role       = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : "Patient";
  const avatarChar = fullName.charAt(0).toUpperCase();

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: colors.sidebar,
      borderRight: `1.5px solid ${colors.border}`,
      display: "flex", flexDirection: "column",
      padding: "24px 14px",
      height: "100vh", overflowY: "auto",
      boxShadow: "2px 0 20px rgba(124,58,237,0.06)",
    }}>
      {/* Logo — no longer clickable */}
      <div style={{ marginBottom: 32, paddingLeft: 4 }}>
        <Logo size="xl" />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 16px", borderRadius: radius.md,
              marginBottom: 2, textDecoration: "none",
              background: isActive
                ? `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`
                : "transparent",
              color:      isActive ? "#fff" : colors.textMid,
              fontFamily: fonts.body,
              fontWeight: isActive ? 700 : 600,
              fontSize: 14,
              boxShadow: isActive ? `0 4px 16px ${colors.purple}35` : "none",
              transition: "all 0.2s",
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains("active"))
                e.currentTarget.style.background = colors.purpleSoft;
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.getAttribute("aria-current"))
                e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{
                background: colors.purple, color: "#fff",
                fontSize: 10, fontWeight: 700,
                padding: "2px 7px", borderRadius: radius.full,
              }}>{item.badge}</span>
            )}
          </NavLink>
        ))}
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
  );
};

export default Sidebar;

import { useState, useEffect, useRef } from "react";
import { colors, fonts, radius, shadows } from "../../styles/theme";
import * as api from "../../api";

const TopBar = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      try {
        await api.markNotificationsAsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    }
  };

  const handleClearAll = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Clear all notifications?")) return;
    try {
      await api.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  return (
    <header style={{
      height: 64, background: colors.sidebar,
      borderBottom: `1.5px solid ${colors.border}`,
      display: "flex", alignItems: "center",
      padding: "0 28px", gap: 16, flexShrink: 0,
      boxShadow: shadows.navbar,
      zIndex: 100,
    }}>
      <div style={{ flex: 1 }} />

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <div
          onClick={toggleDropdown}
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: colors.purpleSoft, border: `1.5px solid ${colors.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 17, transition: "all 0.2s",
            boxShadow: isOpen ? shadows.md : "none",
            position: "relative",
          }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              width: 8, height: 8, borderRadius: "50%",
              background: colors.red, border: "2px solid white",
            }} />
          )}
        </div>

        {isOpen && (
          <div style={{
            position: "absolute", top: 48, right: 0,
            width: 320, maxHeight: 400,
            background: "#fff", borderRadius: radius.lg,
            border: `1.5px solid ${colors.border}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "slideIn 0.2s ease-out",
          }}>
            <div style={{
              padding: "16px 20px", borderBottom: `1px solid ${colors.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: colors.bg,
            }}>
              <span style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.text }}>Notifications</span>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: colors.red, fontSize: 11, fontWeight: 700, fontFamily: fonts.body
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: "12px 20px", borderBottom: `1px solid ${colors.bg}`,
                    display: "flex", gap: 12, alignItems: "flex-start",
                    background: n.isRead ? "transparent" : `${colors.purpleSoft}40`,
                  }}>
                    <div style={{ fontSize: 18, marginTop: 2 }}>
                      {n.type === "BADGE_EARNED" ? "🏆" : n.type === "STREAK_MILESTONE" ? "🔥" : "🔔"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, fontFamily: fonts.display }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: colors.textMid, marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: colors.textMuted }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🌿</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>No notifications yet</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default TopBar;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MeditationSVG } from "../components/ui/Brand";
import MoodChart from "../components/ui/MoodChart";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { colors, fonts, radius, shadows } from "../styles/theme";
import * as api from "../api";
import { getSocket } from "../socket";
import Toast from "../components/ui/Toast";

// ─── Sub-components ───────────────────────────────────────────────────────────

const HeroBanner = ({ firstName }) => {
  const navigate = useNavigate();
  return (
    <div style={{
      borderRadius: radius.xl,
      background: "linear-gradient(135deg, #EDE9FE 0%, #F5EFE8 55%, #FEF3C7 100%)",
      marginBottom: 22, padding: "28px 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 4px 20px rgba(124,58,237,0.1)",
      border: `1px solid ${colors.border}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", right: -30, bottom: -30, opacity: 0.06, pointerEvents: "none" }}>
        <svg width="200" height="200"><circle cx="100" cy="100" r="100" fill={colors.purple} /></svg>
      </div>
      <div>
        <div style={{ fontSize: 10, fontFamily: fonts.body, color: colors.purple, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          ✦ Daily Overview
        </div>
        <h2 style={{ fontFamily: fonts.display, fontSize: 32, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 8 }}>
          Welcome Back,<br />{firstName ? `${firstName.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")}!` : "Your Day Awaits."}
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMid, marginBottom: 20, fontWeight: 600 }}>
          Support For Today. Strength For Tomorrow.
        </p>
        <Button onClick={() => navigate("/chat")} size="md">Get Started →</Button>
      </div>

    </div>
  );
};

const StreakCard = ({ streak, totalPoints, badges = [] }) => (
  <Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <div>
          <div style={{ fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Daily Streak</div>
          <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.text }}>Rewards System</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {badges.slice(0, 3).map((ub, i) => (
          <div key={i} title={ub.badge.name} style={{
            width: 32, height: 32, borderRadius: 9,
            background: i === 0 ? "linear-gradient(135deg,#F59E0B,#FBBF24)" : `linear-gradient(135deg,${colors.purple},${colors.purpleLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          }}>{ub.badge.emoji}</div>
        ))}
      </div>
    </div>
    <div style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 700, color: colors.purple, marginBottom: 8 }}>
      {streak} Days 🔥
    </div>
    <div style={{ background: colors.bg, borderRadius: 8, height: 5, overflow: "hidden", marginBottom: 8 }}>
      <div style={{
        width: `${Math.min((streak / 7) * 100, 100)}%`, height: "100%",
        background: `linear-gradient(90deg, ${colors.purple}, ${colors.purpleLight})`,
        borderRadius: 8,
      }} />
    </div>
    <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 600 }}>
      Current Points: <span style={{ color: colors.purple }}>{totalPoints} ⭐</span>
    </div>
  </Card>
);

const NotificationItem = ({ notif }) => (
  <div style={{
    padding: "14px 18px",
    borderRadius: radius.md,
    border: `1.5px solid ${colors.border}`,
    background: notif.isRead ? "#fff" : colors.purpleSoft,
    marginBottom: 10,
    display: "flex", gap: 14, alignItems: "center",
    transition: "all 0.2s",
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: notif.isRead ? colors.bg : "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      border: `1px solid ${colors.border}`,
    }}>
      {notif.type === "BADGE_EARNED" ? "🏆" : notif.type === "STREAK_MILESTONE" ? "🔥" : "🔔"}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.text }}>{notif.title}</div>
      <div style={{ fontSize: 12, color: colors.textMid, fontFamily: fonts.body, fontWeight: 500 }}>{notif.message}</div>
    </div>
    {!notif.isRead && (
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.purple }} />
    )}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on("message_notification", (data) => {
        setToast({ 
          title: data.title || "New Message", 
          message: data.content,
          type: data.title?.includes("Confirmed") ? "success" : "info"
        });
        fetchDashboard(); // Refresh data to show new notification in list
      });
    }
    return () => {
      if (socket) socket.off("message_notification");
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: "80vh", display: "flex", flexDirection: "column", 
        alignItems: "center", justifyContent: "center", gap: 20 
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          border: `3px solid ${colors.purpleSoft}`,
          borderTopColor: colors.purple,
          animation: "spin 1s linear infinite"
        }} />
        <div style={{ 
          fontFamily: fonts.body, color: colors.textMuted, 
          fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" 
        }}>
          Curating your wellness space...
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }
  if (!data) return (
    <div style={{ padding: 40, fontFamily: fonts.body }}>
      <div style={{ color: colors.red, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Error loading dashboard data.</div>
      <div style={{ color: colors.textMuted, fontSize: 13 }}>Please check your internet connection or try again later.</div>
    </div>
  );

  return (
    <div className="page-enter">
      <HeroBanner firstName={data.firstName} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: 20, marginBottom: 20 }}>
        <div className="slide-up stagger-1">
          <StreakCard streak={data.streak} totalPoints={data.totalPoints} badges={data.userBadges} />
        </div>
        <Card className="slide-up stagger-2" style={{ gridColumn: "span 1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Past 7 Days Mood Trend
            </div>
          </div>
          <MoodChart data={data.recentMoods?.map(m => ({
            val: m.moodScore * 5, // scale 1-7 to ~35
            label: new Date(m.loggedAt).toLocaleDateString("en-US", { weekday: "short" })
          })).reverse() || []} />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card className="hover-lift slide-up stagger-1">
          <div style={{ fontSize: 22, marginBottom: 10 }} className="float-subtle">📅</div>
          <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
            Upcoming Sessions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {data.upcomingAppointments?.length > 0 ? (
              data.upcomingAppointments.slice(0, 2).map((appt, i) => (
                <div key={i} style={{ fontSize: 11, fontWeight: 600, color: colors.textMid, padding: "8px 10px", background: colors.bg, borderRadius: 8 }}>
                  <b>{appt.psychologist.user.firstName}</b> — {new Date(appt.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 600 }}>No upcoming sessions. Book a check-in to stay on track.</p>
            )}
            {data.upcomingAppointments?.length > 2 && (
              <div style={{ fontSize: 10, color: colors.purple, fontWeight: 700 }}>+ {data.upcomingAppointments.length - 2} more sessions</div>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/appointments")} fullWidth className="hover-scale-sm">
            {data.upcomingAppointments?.length > 0 ? "Manage Sessions" : "Book Now →"}
          </Button>
        </Card>

        <Card className="hover-lift slide-up stagger-2">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: colors.purpleSoft, border: `1px solid ${colors.lavender}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>🏅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, textTransform: "uppercase" }}>Badges Earned</div>
              <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.text }}>{data.userBadges?.length || 0} Milestones</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {data.userBadges?.length > 0 ? data.userBadges.slice(0, 4).map((ub, i) => (
              <span key={i} title={ub.badge.name} style={{ fontSize: 18 }} className="float-subtle">
                {ub.badge.emoji}
              </span>
            )) : <span style={{ fontSize: 12, color: colors.textMuted }}>No badges yet.</span>}
          </div>
        </Card>

        <Card className="hover-lift slide-up stagger-3">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: colors.purpleSoft, border: `1px solid ${colors.lavender}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>🌿</div>
            <div>
              <div style={{ fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, textTransform: "uppercase" }}>Quick Action</div>
              <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.text }}>Check in</div>
            </div>
          </div>
          <Button variant="primary" size="sm" fullWidth onClick={() => navigate("/mood")} className="hover-scale-sm">Log My Mood</Button>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <Card className="slide-up stagger-4">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.text }}>
              Recent Notifications
            </div>
            {data.unreadCount > 0 && (
              <Badge variant="purple">{data.unreadCount} New</Badge>
            )}
          </div>
          <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
            {data.notifications?.length > 0 ? (
              data.notifications.map((notif) => (
                <NotificationItem key={notif.id} notif={notif} />
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: colors.textMuted, fontSize: 13, fontWeight: 600 }}>
                No recent notifications.
              </div>
            )}
          </div>
        </Card>
      </div>

      {toast && (
        <Toast 
          title={toast.title}
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;

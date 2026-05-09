import { useState, useEffect } from "react";
import { colors, fonts, radius, shadows } from "../styles/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import * as api from "../api";

// ─── Mood emoji map ───────────────────────────────────────────────────────────
const MOOD_MAP = {
  1: { emoji: "😔", label: "Very Low",  color: "#EF4444" },
  2: { emoji: "😟", label: "Low",       color: "#F97316" },
  3: { emoji: "😕", label: "Meh",       color: "#EAB308" },
  4: { emoji: "😐", label: "Neutral",   color: "#A3A3A3" },
  5: { emoji: "🙂", label: "Good",      color: "#22C55E" },
  6: { emoji: "😊", label: "Great",     color: "#10B981" },
  7: { emoji: "😄", label: "Joyful",    color: "#7C3AED" },
};

const TABS = [
  { key: "overview",     icon: "📊", label: "Overview"      },
  { key: "mood",         icon: "😊", label: "Mood History"  },
  { key: "journal",      icon: "📓", label: "Journal Log"   },
  { key: "appointments", icon: "📅", label: "Appointments"  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatBox = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: "#fff", borderRadius: radius.lg,
    border: `1.5px solid ${colors.border}`,
    boxShadow: shadows.card,
    padding: "20px 22px",
    display: "flex", alignItems: "center", gap: 16,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
      background: `${color}15`,
      border: `1.5px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
    }}>{icon}</div>
    <div>
      <div style={{ fontFamily: fonts.display, fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 700, color: colors.text, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{sub}</div>}
    </div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHead = ({ children }) => (
  <div style={{
    fontSize: 10, fontFamily: fonts.body, fontWeight: 800,
    color: colors.purple, letterSpacing: "0.12em",
    textTransform: "uppercase", marginBottom: 14,
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <span style={{ width: 20, height: 2, background: colors.purple, borderRadius: 2, display: "inline-block" }} />
    {children}
  </div>
);

// ─── Mood Row ─────────────────────────────────────────────────────────────────
const MoodRow = ({ log }) => {
  const mood = MOOD_MAP[log.moodScore] || MOOD_MAP[4];
  const date = new Date(log.loggedAt);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 0",
      borderBottom: `1px solid ${colors.bg}`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: `${mood.color}15`,
        border: `1.5px solid ${mood.color}40`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{mood.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: colors.text }}>
          {mood.label}
          {log.moodTags?.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>
              · {log.moodTags.map(t => t.tag?.name || t).join(", ")}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.body, marginTop: 2 }}>
          {date.toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" })}
          {" · "}
          {date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
          {log.energyLevel && ` · Energy: ${log.energyLevel}`}
          {log.sleepQuality && ` · Sleep: ${log.sleepQuality}`}
        </div>
        {log.notes && (
          <div style={{ fontSize: 11, color: colors.textMid, fontFamily: fonts.body, marginTop: 4, fontStyle: "italic" }}>
            "{log.notes}"
          </div>
        )}
      </div>
      <div style={{
        padding: "4px 10px", borderRadius: radius.full,
        background: `${mood.color}15`, border: `1px solid ${mood.color}30`,
        fontFamily: fonts.body, fontSize: 10, fontWeight: 800, color: mood.color,
      }}>{log.moodScore}/7</div>
    </div>
  );
};

// ─── Journal Row ──────────────────────────────────────────────────────────────
const JournalRow = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(entry.createdAt);
  const preview = entry.content?.slice(0, 120) + (entry.content?.length > 120 ? "…" : "");
  return (
    <div style={{
      padding: "16px 18px", borderRadius: radius.md,
      border: `1.5px solid ${colors.border}`,
      background: "#fff", marginBottom: 10,
      cursor: "pointer", transition: "all 0.18s",
      borderLeft: `4px solid ${colors.purple}`,
    }} onClick={() => setExpanded(e => !e)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.text }}>
          {entry.title || "Untitled Entry"}
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 600, flexShrink: 0, marginLeft: 12 }}>
          {date.toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>
      <div style={{ fontSize: 12, color: colors.textMid, fontFamily: fonts.body, lineHeight: 1.6, fontWeight: 500 }}>
        {expanded ? entry.content : preview}
      </div>
      {entry.tags?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {entry.tags.map((tag, i) => (
            <span key={i} style={{
              fontSize: 10, fontFamily: fonts.body, fontWeight: 700,
              padding: "2px 8px", borderRadius: radius.full,
              background: colors.purpleSoft, color: colors.purple,
              border: `1px solid ${colors.lavender}`,
            }}>{tag}</span>
          ))}
        </div>
      )}
      {entry.content?.length > 120 && (
        <div style={{ fontSize: 10, color: colors.purple, fontFamily: fonts.body, fontWeight: 700, marginTop: 6 }}>
          {expanded ? "Show less ↑" : "Read more ↓"}
        </div>
      )}
    </div>
  );
};

// ─── Appointment Row ──────────────────────────────────────────────────────────
const AppointmentRow = ({ appt }) => {
  const date = new Date(appt.scheduledAt);
  const statusColors = {
    CONFIRMED:  { bg: "#D1FAE5", border: "#A7F3D0", text: "#065F46" },
    PENDING:    { bg: "#FEF3C7", border: "#FDE68A", text: "#92400E" },
    COMPLETED:  { bg: "#EDE9FE", border: "#C4B5FD", text: "#4C1D95" },
    CANCELLED:  { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626" },
    NO_SHOW:    { bg: "#F9FAFB", border: "#E5E7EB", text: "#6B7280" },
  };
  const sc = statusColors[appt.status] || statusColors.PENDING;
  const doctorName = appt.psychologist
    ? `${appt.psychologist.user?.firstName || ""} ${appt.psychologist.user?.lastName || ""}`
    : "Therapist";
  const sessionTypeIcon = appt.sessionType === "VIDEO" ? "📹" : appt.sessionType === "AUDIO" ? "📞" : "💬";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 18px", borderRadius: radius.md,
      border: `1.5px solid ${colors.border}`,
      background: "#fff", marginBottom: 8,
      borderLeft: `4px solid ${sc.text}`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: `${sc.text}20`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
      }}>{sessionTypeIcon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
          {doctorName}
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.body }}>
          {date.toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          {" at "}
          {date.toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit", hour12: true })}
          {" · "}
          {appt.durationMins || 50} min
        </div>
      </div>
      <span style={{
        fontSize: 9, fontFamily: fonts.body, fontWeight: 800,
        padding: "3px 10px", borderRadius: radius.full,
        background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text,
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>{appt.status}</span>
    </div>
  );
};

// ─── Overview timeline ────────────────────────────────────────────────────────
const OverviewTimeline = ({ moods, journals, appointments }) => {
  // Merge all events sorted by date desc
  const events = [
    ...moods.slice(0, 5).map(m => ({ type: "mood", date: new Date(m.loggedAt), data: m })),
    ...journals.slice(0, 5).map(j => ({ type: "journal", date: new Date(j.createdAt), data: j })),
    ...appointments.slice(0, 5).map(a => ({ type: "appt", date: new Date(a.scheduledAt), data: a })),
  ].sort((a, b) => b.date - a.date).slice(0, 12);

  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
        <div style={{ fontFamily: fonts.display, fontSize: 16, color: colors.text, fontWeight: 700 }}>No activity yet</div>
        <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
          Start logging your mood or writing in your journal to see your history here.
        </div>
      </div>
    );
  }

  return (
    <div>
      {events.map((ev, i) => {
        const timeStr = ev.date.toLocaleDateString("en-PK", { month: "short", day: "numeric" })
          + " · " + ev.date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

        let icon, title, sub, dotColor;
        if (ev.type === "mood") {
          const m = MOOD_MAP[ev.data.moodScore] || MOOD_MAP[4];
          icon = m.emoji; title = `Logged mood: ${m.label}`; sub = ev.data.notes || "";
          dotColor = m.color;
        } else if (ev.type === "journal") {
          icon = "📓"; title = ev.data.title || "Journal entry"; sub = ev.data.content?.slice(0, 60) + "…";
          dotColor = colors.purple;
        } else {
          const doc = ev.data.psychologist?.user;
          icon = "📅";
          title = `Session with ${doc ? doc.firstName + " " + doc.lastName : "Therapist"}`;
          sub = ev.data.status;
          dotColor = "#10B981";
        }

        return (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: `${dotColor}20`, border: `2px solid ${dotColor}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
              }}>{icon}</div>
              {i < events.length - 1 && (
                <div style={{ width: 2, flex: 1, background: colors.border, marginTop: 4 }} />
              )}
            </div>
            <div style={{ paddingBottom: 8 }}>
              <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: colors.text }}>{title}</div>
              {sub && <div style={{ fontSize: 11, color: colors.textMid, fontFamily: fonts.body, marginTop: 2, fontStyle: "italic" }}>{sub}</div>}
              <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.body, marginTop: 3 }}>{timeStr}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const PatientHistory = () => {
  const [activeTab, setActiveTab]       = useState("overview");
  const [moods, setMoods]               = useState([]);
  const [journals, setJournals]         = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  const loadAll = async () => {
    // Only set loading on initial fetch
    const [moodRes, journalRes, apptRes] = await Promise.allSettled([
      api.getMoodHistory(),
      api.getJournalEntries(),
      api.getAppointments(),
    ]);

    if (moodRes.status === "fulfilled") {
      // Backend returns { logs: [] }
      const data = moodRes.value?.logs || moodRes.value;
      if (Array.isArray(data)) setMoods(data);
    }
    if (journalRes.status === "fulfilled") {
      // Backend returns { entries: [] }
      const data = journalRes.value?.entries || journalRes.value;
      if (Array.isArray(data)) setJournals(data);
    }
    if (apptRes.status === "fulfilled") {
      // Backend returns []
      const data = apptRes.value;
      if (Array.isArray(data)) setAppointments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadAll();
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Computed stats ────────────────────────────────────────────────────────
  const avgMood = moods.length
    ? (moods.reduce((s, m) => s + m.moodScore, 0) / moods.length).toFixed(1)
    : "—";

  const completedAppts = appointments.filter(a => a.status === "COMPLETED").length;
  const cancelledAppts = appointments.filter(a => a.status === "CANCELLED").length;

  const moodLabels = moods.slice(0, 7).reverse().map(m =>
    new Date(m.loggedAt).toLocaleDateString("en-PK", { weekday: "short" })
  );

  return (
    <div className="page-enter">

      {/* ── Hero ── */}
      <div style={{
        borderRadius: radius.xl,
        background: "linear-gradient(135deg, #EDE9FE 0%, #F5EFE8 55%, #FEF3C7 100%)",
        padding: "28px 40px", marginBottom: 24,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 4px 20px rgba(124,58,237,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 800, color: colors.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            ✦ Patient History
          </div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 6 }}>
            Your Wellness Journey
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMid, fontWeight: 600 }}>
            A complete log of your moods, journal entries, and sessions.
          </p>
        </div>
        <div style={{ fontSize: 56 }}>📋</div>
      </div>

      {/* ── Stats ── */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <StatBox icon="😊" label="Mood Logs"       value={moods.length}        sub={`Avg score: ${avgMood}/7`}         color={colors.purple} />
          <StatBox icon="📓" label="Journal Entries"  value={journals.length}     sub="Private entries"                  color="#0EA5E9"       />
          <StatBox icon="📅" label="Sessions Done"    value={completedAppts}      sub={`${cancelledAppts} cancelled`}    color="#10B981"       />
          <StatBox icon="📊" label="Total Activities" value={moods.length + journals.length + appointments.length} sub="All time" color="#F59E0B" />
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 18px", borderRadius: radius.md,
              border: activeTab === tab.key ? `1.5px solid ${colors.purple}` : `1.5px solid ${colors.border}`,
              background: activeTab === tab.key
                ? `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`
                : "#fff",
              color: activeTab === tab.key ? "#fff" : colors.textMid,
              fontFamily: fonts.body, fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "all 0.18s",
              boxShadow: activeTab === tab.key ? `0 4px 14px ${colors.purple}30` : "none",
              display: "flex", alignItems: "center", gap: 7,
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: fonts.body, color: colors.textMuted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Loading your history…</div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: radius.lg, border: `1.5px solid ${colors.border}`, boxShadow: shadows.card, padding: "24px 28px" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <SectionHead>Recent Activity Timeline</SectionHead>
              <OverviewTimeline moods={moods} journals={journals} appointments={appointments} />
            </>
          )}

          {/* MOOD HISTORY */}
          {activeTab === "mood" && (
            <>
              <SectionHead>All Mood Logs ({moods.length})</SectionHead>
              {moods.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted, fontFamily: fonts.body }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>😶</div>
                  <div style={{ fontWeight: 700 }}>No mood logs yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Go to Mood Tracking to log your first entry.</div>
                </div>
              ) : (
                moods.map((m, i) => <MoodRow key={m.id || i} log={m} />)
              )}
            </>
          )}

          {/* JOURNAL LOG */}
          {activeTab === "journal" && (
            <>
              <SectionHead>All Journal Entries ({journals.length})</SectionHead>
              {journals.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted, fontFamily: fonts.body }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontWeight: 700 }}>No journal entries yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Start writing in your Journal.</div>
                </div>
              ) : (
                journals.map((j, i) => <JournalRow key={j.id || i} entry={j} />)
              )}
            </>
          )}

          {/* APPOINTMENTS */}
          {activeTab === "appointments" && (
            <>
              <SectionHead>All Appointments ({appointments.length})</SectionHead>
              {appointments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted, fontFamily: fonts.body }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  <div style={{ fontWeight: 700 }}>No appointments yet</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Book a session from the Appointments page.</div>
                </div>
              ) : (
                appointments.map((a, i) => <AppointmentRow key={a.id || i} appt={a} />)
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default PatientHistory;

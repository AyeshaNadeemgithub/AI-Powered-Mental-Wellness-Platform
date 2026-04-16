import { useState, useMemo, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { colors, fonts, radius, shadows } from "../styles/theme";
import { getMoodHistory, logMood } from "../api";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const MOODS = [
  { emoji: "😄", label: "Joyful",   value: 7, color: "#F59E0B", bg: "#FEF3C7", border: "#FCD34D" },
  { emoji: "☺️", label: "Happy",    value: 6, color: "#10B981", bg: "#D1FAE5", border: "#6EE7B7" },
  { emoji: "😌", label: "Calm",     value: 5, color: "#b99110ff", bg: "#f2d6a4ff", border: "#cc9e49ff" },
  { emoji: "😐", label: "Neutral",  value: 4, color: "#3B82F6", bg: "#DBEAFE", border: "#93C5FD" },
  { emoji: "😔", label: "Sad",      value: 3, color: "#8B5CF6", bg: "#EDE9FE", border: "#C4B5FD" },
  { emoji: "😰", label: "Anxious",  value: 2, color: "#093e30ff", bg: "#91e0d8ff", border: "#9feae4ff" },
  { emoji: "😤", label: "Angry",    value: 1, color: "#EF4444", bg: "#FEE2E2", border: "#FCA5A5" },
];

const KEYWORDS = [
  { label: "Grateful",    emoji: "🙏" },
  { label: "Energetic",   emoji: "⚡" },
  { label: "Peaceful",    emoji: "🌊" },
  { label: "Satisfied",   emoji: "🙌🏻" },
  { label: "Sick",        emoji: "😷" },
  { label: "Crying",      emoji: "😭" },
  { label: "Sleepy",      emoji: "😴" },
  { label: "Sleepless",   emoji: "😧" },
  { label: "Focused",     emoji: "🎯" },
  { label: "Creative",    emoji: "🎨" },
  { label: "Tired",       emoji: "🥱" },
  { label: "Stressed",    emoji: "🌀" },
  { label: "Lonely",      emoji: "🌧️" },
  { label: "Hopeful",     emoji: "🌱" },
  { label: "Overwhelmed", emoji: "🌊" },
  { label: "Loved",       emoji: "💜" },
  { label: "Proud",       emoji: "🌟" },
];

// Max mood value — used for scaling charts/bars/stats
const MAX_MOOD_VALUE = 7;

// Stars display indexed by mood value (0–7)
const STARS = ["", "★", "★★", "★★★", "★★★★", "★★★★★", "★★★★★★", "★★★★★★★"];

// ─── Normalize DB log → local entry shape ────────────────────────────────────
const MOOD_META = Object.fromEntries(MOODS.map(m => [m.label, m]));

const normalizeLog = (log) => ({
  id:       log.id,
  date:     new Date(log.loggedAt),
  mood:     MOOD_META[log.moodLabel] || {
    emoji: log.moodEmoji,
    label: log.moodLabel,
    value: log.moodScore,
    color: "#8B5CF6",
    bg:    "#EDE9FE",
    border:"#C4B5FD",
  },
  keywords: log.moodTags?.map(mt => mt.tag.name) || [],
  note:     log.notes || "",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const fmtFull = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
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

// ─── Mood Selector ────────────────────────────────────────────────────────────
const MoodSelector = ({ selected, onSelect }) => (
  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
    {MOODS.map((m) => {
      const isSelected = selected?.label === m.label;
      const filledDots = Math.round((m.value / MAX_MOOD_VALUE) * 5);
      return (
        <button
          key={m.label}
          onClick={() => onSelect(m)}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "16px 20px", borderRadius: 20,
            border: isSelected ? `2.5px solid ${m.color}` : `1.5px solid ${colors.border}`,
            background: isSelected ? m.bg : "#fff",
            cursor: "pointer", transition: "all 0.2s",
            boxShadow: isSelected ? `0 6px 20px ${m.color}35` : "0 2px 8px rgba(0,0,0,0.04)",
            transform: isSelected ? "translateY(-4px) scale(1.05)" : "none",
            minWidth: 84,
          }}
        >
          <span style={{ fontSize: 34, lineHeight: 1 }}>{m.emoji}</span>
          <span style={{
            fontSize: 11, fontFamily: fonts.body, fontWeight: 800,
            color: isSelected ? m.color : colors.textMuted,
            letterSpacing: "0.04em",
          }}>{m.label}</span>
          <div style={{ display: "flex", gap: 3 }}>
            {[1, 2, 3, 4, 5].map(dot => (
              <div key={dot} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: dot <= filledDots ? m.color : colors.border,
                transition: "background 0.2s",
              }} />
            ))}
          </div>
        </button>
      );
    })}
  </div>
);

// ─── Keyword Pills ────────────────────────────────────────────────────────────
const KeywordPicker = ({ selected, onToggle }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {KEYWORDS.map((k) => {
      const isOn = selected.includes(k.label);
      return (
        <button
          key={k.label}
          onClick={() => onToggle(k.label)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: radius.full,
            border: isOn ? `1.5px solid ${colors.purple}` : `1.5px solid ${colors.border}`,
            background: isOn ? colors.purpleSoft : "#fff",
            cursor: "pointer", transition: "all 0.18s",
            fontSize: 12, fontFamily: fonts.body, fontWeight: 700,
            color: isOn ? colors.purple : colors.textMid,
            boxShadow: isOn ? `0 2px 10px ${colors.purple}25` : "none",
            transform: isOn ? "scale(1.03)" : "none",
          }}
        >
          <span style={{ fontSize: 14 }}>{k.emoji}</span>
          {k.label}
        </button>
      );
    })}
  </div>
);

// ─── Mini Bar Chart (7-day) ───────────────────────────────────────────────────
const WeekBar = ({ entries }) => {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const match = entries.find(e => e.date.toDateString() === d.toDateString());
    days.push({ d, entry: match });
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 110 }}>
      {days.map(({ d, entry }, i) => {
        const val = entry ? entry.mood.value : 0;
        const pct = (val / MAX_MOOD_VALUE) * 100;
        const col = entry ? entry.mood.color : colors.border;
        const isToday = d.toDateString() === now.toDateString();
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: "100%", height: 60, display: "flex", alignItems: "flex-end",
              borderRadius: 6, overflow: "hidden", background: colors.bg,
            }}>
              <div style={{
                width: "100%", height: `${pct}%`,
                background: entry ? `linear-gradient(180deg, ${col}99, ${col})` : colors.border,
                borderRadius: "4px 4px 0 0",
                transition: "height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                minHeight: val > 0 ? 6 : 0,
              }} />
            </div>
            <span style={{
              fontSize: 10, fontFamily: fonts.body, fontWeight: 800,
              color: isToday ? colors.purple : colors.textMuted,
            }}>{DAY_NAMES[d.getDay()]}</span>
            {entry && <span style={{ fontSize: 12 }}>{entry.mood.emoji}</span>}
          </div>
        );
      })}
    </div>
  );
};

// ─── Monthly Heatmap Grid ─────────────────────────────────────────────────────
const MonthGrid = ({ entries }) => {
  const now = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const match = entries.find(e => e.date.toDateString() === d.toDateString());
    days.push({ d, entry: match });
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
        {days.map(({ d, entry }, i) => {
          const isToday = d.toDateString() === now.toDateString();
          const col = entry ? entry.mood.color : null;
          return (
            <div
              key={i}
              title={entry ? `${fmt(d)}: ${entry.mood.label}` : fmt(d)}
              style={{
                aspectRatio: "1", borderRadius: 8,
                background: col ? `${col}30` : colors.bg,
                border: isToday
                  ? `2px solid ${colors.purple}`
                  : col ? `1.5px solid ${col}60` : `1px solid ${colors.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, cursor: "default", position: "relative",
              }}
            >
              {entry ? entry.mood.emoji : (
                <span style={{ fontSize: 8, color: colors.border }}>·</span>
              )}
              {isToday && (
                <div style={{
                  position: "absolute", bottom: 2, left: "50%",
                  transform: "translateX(-50%)",
                  width: 4, height: 4, borderRadius: "50%",
                  background: colors.purple,
                }} />
              )}
            </div>
          );
        })}
      </div>
      {/* Legend — all 7 moods */}
      <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
        {MOODS.map(m => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 12 }}>{m.emoji}</span>
            <span style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 700, color: colors.textMuted }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── History List ─────────────────────────────────────────────────────────────
const HistoryList = ({ entries, limit }) => {
  const sorted = [...entries].sort((a, b) => b.date - a.date).slice(0, limit);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sorted.map((e) => (
        <div key={e.id} style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "12px 16px", borderRadius: radius.md,
          background: "#fff", border: `1px solid ${colors.border}`,
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: `${e.mood.color}18`,
            border: `1.5px solid ${e.mood.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>{e.mood.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: fonts.display, fontSize: 13, fontWeight: 700, color: colors.text }}>
                {e.mood.label}
              </span>
              <span style={{
                fontSize: 10, fontFamily: fonts.body, fontWeight: 700,
                color: e.mood.color, background: `${e.mood.color}15`,
                padding: "2px 8px", borderRadius: radius.full,
              }}>
                {STARS[e.mood.value] || "★"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {e.keywords.map(k => (
                <span key={k} style={{
                  fontSize: 10, fontFamily: fonts.body, fontWeight: 700,
                  color: colors.purple, background: colors.purpleSoft,
                  padding: "2px 8px", borderRadius: radius.full,
                  border: `1px solid ${colors.lavender}`,
                }}>{k}</span>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, textAlign: "right", flexShrink: 0 }}>
            {fmtFull(e.date)}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Stats Row ────────────────────────────────────────────────────────────────
const StatsRow = ({ entries }) => {
  const total = entries.length;
  const avg = total > 0
    ? (entries.reduce((s, e) => s + e.mood.value, 0) / total).toFixed(1)
    : "—";
  const best = entries.reduce((b, e) => e.mood.value > (b?.mood.value || 0) ? e : b, null);
  const streak = (() => {
    let s = 0;
    const now = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      if (entries.find(e => e.date.toDateString() === d.toDateString())) s++;
      else break;
    }
    return s;
  })();

  const stats = [
    { label: "Entries Logged", value: total,                                                icon: "📊", color: colors.purple },
    { label: "Avg Mood Score", value: avg + " / " + MAX_MOOD_VALUE,                         icon: "📈", color: colors.green  },
    { label: "Best Mood",      value: best ? best.mood.emoji + " " + best.mood.label : "—", icon: "🏆", color: "#F59E0B"    },
    { label: "Day Streak",     value: streak + " days 🔥",                                  icon: "⚡", color: "#EF4444"    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: "#fff", borderRadius: radius.lg,
          border: `1.5px solid ${colors.border}`,
          padding: "18px 20px", boxShadow: shadows.card,
        }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 4 }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── MOOD TRACKING PAGE ───────────────────────────────────────────────────────
const MoodTracking = () => {
  const [selectedMood, setSelectedMood]         = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [note, setNote]                         = useState("");
  const [saved, setSaved]                       = useState(false);
  const [saving, setSaving]                     = useState(false);
  const [history, setHistory]                   = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [historyTab, setHistoryTab]             = useState("week");

  // ── Fetch mood history on mount ─────────────────────────────────────────────
  useEffect(() => {
    getMoodHistory()
      .then(res => {
        if (res.logs) {
          setHistory(res.logs.map(normalizeLog));
        } else {
          setError(res.error || "Could not load mood history.");
        }
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, []);

  const toggleKeyword = (k) => {
    setSelectedKeywords(prev =>
      prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
    );
  };

  const handleSave = async () => {
    if (!selectedMood || saving) return;
    setSaving(true);
    try {
      const res = await logMood({
        moodScore:  selectedMood.value,
        moodLabel:  selectedMood.label,
        moodEmoji:  selectedMood.emoji,
        tags:       KEYWORDS.filter(k => selectedKeywords.includes(k.label)),
        notes:      note || null,
      });
      if (res.error) throw new Error(res.error);
      const newEntry = normalizeLog(res.moodLog);
      setHistory(prev => [newEntry, ...prev]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setSelectedMood(null);
      setSelectedKeywords([]);
      setNote("");
    } catch (err) {
      console.error("[handleSave mood]", err);
      setError("Could not save mood. Please try again.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const allEntries  = useMemo(() => [...history], [history]);

  const weekEntries = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return allEntries.filter(e => e.date >= cutoff);
  }, [allEntries]);

  const monthEntries = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    return allEntries.filter(e => e.date >= cutoff);
  }, [allEntries]);

  const displayEntries = historyTab === "week"  ? weekEntries
    : historyTab === "month" ? monthEntries : allEntries;

  const historyLimit = historyTab === "week" ? 7 : historyTab === "month" ? 30 : 999;

  return (
    <div className="page-enter">

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FCA5A5",
          borderRadius: radius.md, padding: "12px 18px", marginBottom: 16,
          fontFamily: fonts.body, fontSize: 13, color: "#EF4444", fontWeight: 700,
        }}>⚠️ {error}</div>
      )}

      {/* ── Page Header ── */}
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
            ✦ Daily Mood Tracker
          </div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 6 }}>
            How Are You Feeling?
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMid, fontWeight: 600 }}>
            Track your emotions daily — spot patterns, celebrate growth.
          </p>
        </div>
        <div style={{ fontSize: 64 }}>🌿</div>
      </div>

      {/* ── Stats ── */}
      {loading ? (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24,
        }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              background: "#fff", borderRadius: radius.lg,
              border: `1.5px solid ${colors.border}`,
              padding: "18px 20px", boxShadow: shadows.card,
              height: 90, animation: "pulse 1.5s ease-in-out infinite",
              background: "linear-gradient(90deg, #f3f3f3 25%, #e8e8e8 50%, #f3f3f3 75%)",
            }} />
          ))}
        </div>
      ) : (
        <StatsRow entries={allEntries} />
      )}

      {/* ── Log Today's Mood ── */}
      <Card style={{ marginBottom: 24 }}>
        <SectionLabel>Log Today's Mood</SectionLabel>
        <MoodSelector selected={selectedMood} onSelect={setSelectedMood} />

        {selectedMood && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 18px", borderRadius: radius.full,
              background: `${selectedMood.color}15`,
              border: `1.5px solid ${selectedMood.color}40`,
              marginBottom: 20, width: "fit-content",
            }}>
              <span style={{ fontSize: 20 }}>{selectedMood.emoji}</span>
              <span style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 800, color: selectedMood.color }}>
                Feeling {selectedMood.label} today
              </span>
            </div>

            <SectionLabel>What best describes it?</SectionLabel>
            <KeywordPicker selected={selectedKeywords} onToggle={toggleKeyword} />

            <div style={{ marginTop: 20 }}>
              <SectionLabel>Add a note (optional)</SectionLabel>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What's on your mind today? Write freely…"
                rows={3}
                style={{
                  width: "100%", borderRadius: radius.md,
                  border: `1.5px solid ${colors.border}`,
                  padding: "12px 16px", fontSize: 13,
                  fontFamily: fonts.body, color: colors.text,
                  background: colors.bg, outline: "none",
                  resize: "vertical", lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <Button onClick={handleSave} size="md" disabled={saving}>
                {saving ? "Saving…" : "Save Today's Mood ✓"}
              </Button>
              {saved && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontFamily: fonts.body, fontWeight: 700, color: colors.green,
                }}>
                  <span style={{ fontSize: 16 }}>✅</span> Mood logged successfully! +10 pts
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedMood && (
          <p style={{ textAlign: "center", marginTop: 20, fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, fontWeight: 600 }}>
            👆 Tap an emoji above to get started
          </p>
        )}
      </Card>

      {/* ── History ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <SectionLabel>7-Day Overview</SectionLabel>
            <WeekBar entries={allEntries} />
          </Card>
          <Card>
            <SectionLabel>30-Day Heatmap</SectionLabel>
            <MonthGrid entries={allEntries} />
          </Card>
        </div>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <SectionLabel>Mood History</SectionLabel>
            <div style={{ display: "flex", gap: 4, background: colors.bg, borderRadius: radius.md, padding: 4 }}>
              {[
                { key: "week",  label: "Week"  },
                { key: "month", label: "Month" },
                { key: "all",   label: "All"   },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setHistoryTab(tab.key)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, border: "none",
                    background: historyTab === tab.key ? colors.purple : "transparent",
                    color: historyTab === tab.key ? "#fff" : colors.textMuted,
                    fontFamily: fonts.body, fontSize: 11, fontWeight: 800,
                    cursor: "pointer", transition: "all 0.18s",
                    boxShadow: historyTab === tab.key ? shadows.purple : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 }}>
              Loading your mood history… 🌿
            </div>
          ) : displayEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: colors.textMuted, fontFamily: fonts.body, fontSize: 13 }}>
              No entries yet for this period.<br />
              <span style={{ fontSize: 28, display: "block", marginTop: 8 }}>📭</span>
            </div>
          ) : (
            <div style={{ maxHeight: 480, overflowY: "auto" }}>
              <HistoryList entries={displayEntries} limit={historyLimit} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MoodTracking;
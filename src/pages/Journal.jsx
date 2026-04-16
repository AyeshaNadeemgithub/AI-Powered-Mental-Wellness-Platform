import { useState, useRef, useEffect } from "react";
import { colors, fonts, radius, shadows } from "../styles/theme";
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../api";

// ─── WARM PALETTE ─────────────────────────────────────────────────────────────
const warm = {
  brownMid:   "#B45309",
  brownSoft:  "#FFFBEB",
  brownBorder:"#F5D9A8",
  cream:      "#FAF7F2",
  sand:       "#E8DDD0",
  sandBorder: "#D5C4B0",
};

// ─── MOOD OPTIONS ─────────────────────────────────────────────────────────────
const MOODS = [
  { emoji: "😄", label: "Joyful",  color: "#F59E0B", bg: "#FEF3C7" },
  { emoji: "☺️", label: "Happy",   color: "#10B981", bg: "#D1FAE5" },
  { emoji: "😌", label: "Calm",    color: "#B45309", bg: "#FEF9EE" },
  { emoji: "😐", label: "Neutral", color: "#6B7280", bg: "#F3F4F6" },
  { emoji: "😔", label: "Sad",     color: "#8B5CF6", bg: "#EDE9FE" },
  { emoji: "😰", label: "Anxious", color: "#0E7490", bg: "#ECFEFF" },
  { emoji: "😤", label: "Angry",   color: "#EF4444", bg: "#FEE2E2" },
];

const TAGS = ["Gratitude 🙏", "Work 💼", "Family 👨‍👩‍👧", "Health 🌿", "Dreams 🌙", "Growth 🌱", "Reflection 🪞", "Goals 🎯", "Love 💜", "Anxiety 🌀", "Joy ✨", "Rest 😴"];

// ─── NORMALIZE DB → LOCAL SHAPE ───────────────────────────────────────────────
const MOOD_META = Object.fromEntries(MOODS.map(m => [m.label, m]));

const normalizeEntry = (e) => ({
  id:        e.id,
  title:     e.title || "Untitled Entry",
  body:      e.content,
  mood:      MOOD_META[e.moodLabel] || MOODS[3],
  tags:      e.tags || [],
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
  wordCount: wordsOf(e.content),
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (iso, mode = "full") => {
  const d = new Date(iso);
  if (mode === "date") return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  if (mode === "time") return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (mode === "short") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (mode === "dayname") return d.toLocaleDateString("en-US", { weekday: "long" });
  if (mode === "compact") return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const isToday = (iso) => {
  const d = new Date(iso);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
};

const isYesterday = (iso) => {
  const d = new Date(iso);
  const t = new Date(); t.setDate(t.getDate() - 1);
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
};

const relativeDay = (iso) => {
  if (isToday(iso)) return "Today";
  if (isYesterday(iso)) return "Yesterday";
  return fmt(iso, "short");
};

const wordsOf = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;

const avgPerMonth = (entries) => {
  if (!entries.length) return 0;
  const months = {};
  entries.forEach(e => {
    const k = new Date(e.createdAt).toISOString().slice(0, 7);
    months[k] = (months[k] || 0) + 1;
  });
  const vals = Object.values(months);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const SectionLabel = ({ children, color }) => (
  <div style={{
    fontSize: 10, fontFamily: fonts.body, fontWeight: 800,
    color: color || colors.purple,
    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14,
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <span style={{ width: 20, height: 2, background: color || colors.purple, borderRadius: 2, display: "inline-block" }} />
    {children}
  </div>
);

// Timestamp row — shows both created and updated
const TimestampRow = ({ entry }) => {
  const sameTime = entry.createdAt === entry.updatedAt;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginTop: 10 }}>
      <span style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: 10, fontFamily: fonts.body, fontWeight: 700, color: colors.textMuted,
      }}>
        <span style={{ fontSize: 11 }}>🕐</span>
        <span style={{ color: "#9896B8" }}>First logged:</span>
        <span style={{ color: colors.textMid }}>{fmt(entry.createdAt, "compact")}</span>
      </span>
      {!sameTime && (
        <span style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 10, fontFamily: fonts.body, fontWeight: 700, color: colors.textMuted,
        }}>
          <span style={{ fontSize: 11 }}>✏️</span>
          <span style={{ color: "#9896B8" }}>Last edited:</span>
          <span style={{ color: warm.brownMid }}>{fmt(entry.updatedAt, "compact")}</span>
        </span>
      )}
      {sameTime && (
        <span style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 10, fontFamily: fonts.body, fontWeight: 700,
        }}>
          <span style={{ fontSize: 11 }}>✨</span>
          <span style={{ color: colors.textMuted }}>No edits — original entry</span>
        </span>
      )}
    </div>
  );
};

// ─── ENTRY CARD ───────────────────────────────────────────────────────────────
const EntryCard = ({ entry, onSelect, selected }) => {
  const [hov, setHov] = useState(false);
  const preview = entry.body.replace(/\n/g, " ").slice(0, 110) + (entry.body.length > 110 ? "…" : "");

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(entry)}
      style={{
        background: selected ? colors.purpleSoft : "#fff",
        borderRadius: radius.lg,
        border: selected
          ? `1.5px solid ${colors.purple}`
          : hov ? `1.5px solid ${colors.lavender}` : `1.5px solid ${colors.border}`,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: selected ? `0 4px 20px ${colors.purple}20` : hov ? `0 4px 16px rgba(0,0,0,0.06)` : shadows.card,
        borderLeft: `3px solid ${entry.mood.color}`,
        marginBottom: 10,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: fonts.display, fontSize: 14, fontWeight: 700,
            color: colors.text, lineHeight: 1.3, marginBottom: 3,
          }}>
            {entry.title}
          </div>
          <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 700, color: colors.textMuted }}>
            {relativeDay(entry.createdAt)} · {fmt(entry.createdAt, "time")}
          </div>
        </div>
        <div style={{
          fontSize: 20, flexShrink: 0,
          background: entry.mood.bg, width: 36, height: 36, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {entry.mood.emoji}
        </div>
      </div>

      {/* Preview text */}
      <p style={{
        fontFamily: fonts.body, fontSize: 12, color: colors.textMid,
        lineHeight: 1.6, fontWeight: 500, marginBottom: 10,
      }}>
        {preview}
      </p>

      {/* Tags + word count */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {entry.tags.slice(0, 2).map(t => (
          <span key={t} style={{
            fontSize: 9, fontFamily: fonts.body, fontWeight: 800,
            color: colors.purple, background: colors.purpleSoft,
            padding: "2px 8px", borderRadius: radius.full,
            border: `1px solid ${colors.lavender}`,
          }}>{t}</span>
        ))}
        {entry.tags.length > 2 && (
          <span style={{ fontSize: 9, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 700 }}>
            +{entry.tags.length - 2} more
          </span>
        )}
        <span style={{
          marginLeft: "auto", fontSize: 9, color: colors.textMuted,
          fontFamily: fonts.body, fontWeight: 700,
        }}>
          {entry.wordCount} words
        </span>
      </div>

      {/* Timestamp strip */}
      <TimestampRow entry={entry} />
    </div>
  );
};

// ─── EDITOR PANEL ─────────────────────────────────────────────────────────────
const EditorPanel = ({ entry, onSave, onDelete, onClose, saving }) => {
  const [title,    setTitle]    = useState(entry ? entry.title : "");
  const [body,     setBody]     = useState(entry ? entry.body  : "");
  const [mood,     setMood]     = useState(entry ? entry.mood  : MOODS[3]);
  const [selTags,  setSelTags]  = useState(entry ? entry.tags  : []);
  const [saved,    setSaved]    = useState(false);
  const textRef = useRef(null);
  const isNew = !entry;

  useEffect(() => {
    if (isNew && textRef.current) setTimeout(() => textRef.current?.focus(), 100);
  }, []);

  const toggleTag = (t) =>
    setSelTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = () => {
    if (!title.trim() && !body.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: entry?.id || `j${Date.now()}`,
      title: title || "Untitled Entry",
      body,
      mood,
      tags: selTags,
      createdAt: entry?.createdAt || now,
      updatedAt: now,
      wordCount: wordsOf(body),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{
      background: "#fff", borderRadius: radius.xl,
      border: `1.5px solid ${colors.border}`,
      boxShadow: "0 8px 40px rgba(124,58,237,0.10)",
      display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
    }}>
      {/* Editor header */}
      <div style={{
        background: "linear-gradient(135deg, #EDE9FE 0%, #F5EFE8 60%, #FEF3C7 100%)",
        padding: "18px 24px",
        borderBottom: `1px solid ${colors.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Entry title…"
            style={{
              width: "100%", border: "none", background: "transparent", outline: "none",
              fontFamily: fonts.display, fontSize: 18, fontWeight: 700,
              color: colors.text,
            }}
          />
          <div style={{ fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, marginTop: 2 }}>
            {isNew
              ? `New entry · ${fmt(new Date().toISOString(), "date")}`
              : `${fmt(entry.createdAt, "dayname")}, ${fmt(entry.createdAt, "date")}`}
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 30, height: 30, borderRadius: 9,
          background: colors.purpleSoft, border: `1px solid ${colors.border}`,
          cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {/* Mood picker */}
      <div style={{ padding: "14px 24px 0", borderBottom: `1px solid ${colors.bg}` }}>
        <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 800, color: colors.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          How are you feeling?
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {MOODS.map(m => (
            <button
              key={m.label}
              onClick={() => setMood(m)}
              title={m.label}
              style={{
                width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
                background: mood.label === m.label ? m.bg : colors.bg,
                fontSize: 18, transition: "all 0.15s",
                outline: mood.label === m.label ? `2px solid ${m.color}` : "none",
                outlineOffset: 1,
                transform: mood.label === m.label ? "scale(1.15)" : "scale(1)",
              }}
            >{m.emoji}</button>
          ))}
        </div>
      </div>

      {/* Scrollable textarea */}
      <textarea
        ref={textRef}
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write freely… this is your safe space. 🌿"
        style={{
          flex: 1, padding: "20px 24px",
          border: "none", outline: "none", resize: "none",
          fontFamily: fonts.body, fontSize: 14, color: colors.text,
          lineHeight: 1.85, background: "#fff",
          fontWeight: 500,
        }}
      />

      {/* Word count */}
      <div style={{
        padding: "0 24px 8px",
        fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700,
        textAlign: "right",
      }}>
        {wordsOf(body)} words
      </div>

      {/* Tags */}
      <div style={{ padding: "10px 24px", borderTop: `1px solid ${colors.bg}` }}>
        <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 800, color: colors.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Tags
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TAGS.map(t => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              style={{
                padding: "4px 10px", borderRadius: radius.full, cursor: "pointer",
                border: selTags.includes(t) ? `1.5px solid ${colors.purple}` : `1px solid ${colors.border}`,
                background: selTags.includes(t) ? colors.purpleSoft : warm.cream,
                fontFamily: fonts.body, fontSize: 10, fontWeight: 800,
                color: selTags.includes(t) ? colors.purple : colors.textMuted,
                transition: "all 0.15s",
              }}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Action row — timestamps if editing */}
      {entry && (
        <div style={{
          padding: "8px 24px",
          borderTop: `1px solid ${colors.bg}`,
          background: warm.cream,
          display: "flex", flexWrap: "wrap", gap: "4px 20px",
        }}>
          <span style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
            <span>🕐</span>
            <span style={{ color: "#9896B8" }}>First logged:</span>
            <span style={{ color: colors.textMid }}>{fmt(entry.createdAt, "compact")}</span>
          </span>
          {entry.createdAt !== entry.updatedAt && (
            <span style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              <span>✏️</span>
              <span style={{ color: "#9896B8" }}>Last edited:</span>
              <span style={{ color: warm.brownMid }}>{fmt(entry.updatedAt, "compact")}</span>
            </span>
          )}
        </div>
      )}

      {/* Save / Delete */}
      <div style={{
        padding: "14px 24px",
        borderTop: `1px solid ${colors.border}`,
        display: "flex", gap: 10, alignItems: "center",
      }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1, padding: "12px 20px", borderRadius: radius.md,
            border: "none", cursor: saving ? "not-allowed" : "pointer",
            background: saved
              ? "linear-gradient(135deg, #10B981, #34D399)"
              : `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
            color: "#fff", fontFamily: fonts.body, fontSize: 13, fontWeight: 800,
            boxShadow: saved ? "0 4px 14px #10B98140" : shadows.purple,
            transition: "all 0.2s",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : saved ? "✓ Saved!" : isNew ? "Save Entry ✦" : "Update Entry ✦"}
        </button>
        {!isNew && (
          <button
            onClick={() => onDelete(entry.id)}
            disabled={saving}
            style={{
              padding: "12px 16px", borderRadius: radius.md, cursor: "pointer",
              border: "1px solid #FCA5A5", background: "#FEF2F2",
              fontFamily: fonts.body, fontSize: 12, fontWeight: 800, color: "#EF4444",
            }}
          >🗑</button>
        )}
      </div>
    </div>
  );
};

// ─── JOURNAL PAGE ─────────────────────────────────────────────────────────────
const Journal = () => {
  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [isNew,       setIsNew]       = useState(false);
  const [searchQ,     setSearchQ]     = useState("");
  const [filterMood,  setFilterMood]  = useState(null);
  const [filterTag,   setFilterTag]   = useState(null);
  const [activeView,  setActiveView]  = useState("all");

  const showEditor = isNew || selected !== null;

  // ── Fetch entries on mount ──────────────────────────────────────────────────
  useEffect(() => {
    getJournalEntries()
      .then(res => {
        if (res.entries) {
          setEntries(res.entries.map(normalizeEntry));
        } else {
          setError(res.error || "Could not load journal entries.");
        }
      })
      .catch(() => setError("Could not connect to server."))
      .finally(() => setLoading(false));
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalWords  = entries.reduce((a, e) => a + e.wordCount, 0);
  const lastEdited  = entries.length
    ? entries.reduce((a, b) => new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b)
    : null;
  const avgEntries  = avgPerMonth(entries);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = entries
    .filter(e => {
      const q = searchQ.toLowerCase();
      const matchQ = !q || e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
      const matchM = !filterMood || e.mood.label === filterMood;
      const matchT = !filterTag  || e.tags.includes(filterTag);
      return matchQ && matchM && matchT;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // ── Month grouping ─────────────────────────────────────────────────────────
  const byMonth = {};
  filtered.forEach(e => {
    const k = new Date(e.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!byMonth[k]) byMonth[k] = [];
    byMonth[k].push(e);
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = async (updated) => {
    setSaving(true);
    try {
      let res;
      if (isNew) {
        res = await createJournalEntry({
          title:     updated.title,
          content:   updated.body,
          moodLabel: updated.mood.label,
          tags:      updated.tags,
        });
      } else {
        res = await updateJournalEntry(selected.id, {
          title:     updated.title,
          content:   updated.body,
          moodLabel: updated.mood.label,
          tags:      updated.tags,
        });
      }
      if (res.error) throw new Error(res.error);
      const savedEntry = normalizeEntry(res.entry);
      setEntries(prev => {
        const exists = prev.find(e => e.id === savedEntry.id);
        if (exists) return prev.map(e => e.id === savedEntry.id ? savedEntry : e);
        return [savedEntry, ...prev];
      });
      setSelected(savedEntry);
      setIsNew(false);
    } catch (err) {
      console.error("[Journal handleSave]", err);
      setError("Could not save entry. Please try again.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      const res = await deleteJournalEntry(id);
      if (res.error) throw new Error(res.error);
      setEntries(prev => prev.filter(e => e.id !== id));
      setSelected(null);
      setIsNew(false);
    } catch (err) {
      console.error("[Journal handleDelete]", err);
      setError("Could not delete entry. Please try again.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const openNew    = () => { setSelected(null); setIsNew(true); };
  const closeEditor = () => { setSelected(null); setIsNew(false); };

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
        boxShadow: "0 4px 20px rgba(124,58,237,0.10)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 800, color: colors.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            ✦ Journal
          </div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 6 }}>
            My Daily Diary
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMid, fontWeight: 600 }}>
            Your private space to reflect, express, and grow. 🌿
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
          <div style={{ fontSize: 46 }}>📔</div>
          <button
            onClick={openNew}
            style={{
              padding: "10px 20px", borderRadius: radius.md, border: "none",
              background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
              color: "#fff", fontFamily: fonts.body, fontSize: 12, fontWeight: 800,
              cursor: "pointer", boxShadow: shadows.purple,
            }}
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          {
            icon: "📝", label: "Total Entries",      value: loading ? "…" : entries.length,
            color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE",
          },
          {
            icon: "📊", label: "Avg Entries / Month", value: loading ? "…" : avgEntries,
            color: "#0c0d0dff", bg: "#F5F7FA", border: "#C7DBFF",
          },
          {
            icon: "✍️", label: "Total Words Written", value: loading ? "…" : totalWords.toLocaleString(),
            color: "#92400E", bg: "#FEF9EE", border: "#F5D9A8",
          },
          {
            icon: "🗓", label: "Last Entry",
            value: loading ? "…" : lastEdited ? relativeDay(lastEdited.updatedAt) : "—",
            sub: !loading && lastEdited ? `${fmt(lastEdited.updatedAt, "dayname")}, ${fmt(lastEdited.updatedAt, "time")}` : "",
            color: "#BE185D", bg: "#FFF0F6", border: "#FBCFE8",
          },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, borderRadius: radius.lg,
            border: `1.5px solid ${s.border}`,
            padding: "16px 20px", boxShadow: shadows.card,
          }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 2 }}>
              {s.value}
            </div>
            {s.sub && (
              <div style={{ fontSize: 10, fontFamily: fonts.body, color: s.color, fontWeight: 700, marginBottom: 2, opacity: 0.8 }}>
                {s.sub}
              </div>
            )}
            <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 700, color: "#9896B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: colors.textMuted, fontFamily: fonts.body }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📔</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Loading your journal…</div>
        </div>
      )}

      {/* ── Main layout ── */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: showEditor ? "340px 1fr" : "1fr", gap: 20, alignItems: "start" }}>

          {/* ── LEFT: list panel ── */}
          <div>
            {/* Search + filters */}
            <div style={{
              background: "#fff", borderRadius: radius.lg,
              border: `1.5px solid ${colors.border}`,
              padding: "14px 16px", marginBottom: 16,
              boxShadow: shadows.card,
            }}>
              {/* Search */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: colors.bg, borderRadius: radius.md,
                border: `1.5px solid ${colors.border}`, padding: "9px 14px",
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 14 }}>🔍</span>
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search entries…"
                  style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: fonts.body, fontSize: 13, color: colors.text }}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: 13 }}>✕</button>
                )}
              </div>

              {/* View toggle */}
              <div style={{ display: "flex", gap: 4, background: colors.bg, borderRadius: radius.md, padding: 3, marginBottom: 10 }}>
                {[["all","📋 All"], ["month","📅 By Month"]].map(([k, l]) => (
                  <button key={k} onClick={() => setActiveView(k)} style={{
                    flex: 1, padding: "7px 10px", borderRadius: 8, border: "none",
                    background: activeView === k ? `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})` : "transparent",
                    color: activeView === k ? "#fff" : colors.textMuted,
                    fontFamily: fonts.body, fontSize: 11, fontWeight: 800, cursor: "pointer",
                    transition: "all 0.18s",
                    boxShadow: activeView === k ? shadows.purple : "none",
                  }}>{l}</button>
                ))}
              </div>

              {/* Mood filter chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => setFilterMood(null)}
                  style={{
                    padding: "4px 10px", borderRadius: radius.full, cursor: "pointer",
                    border: !filterMood ? `1.5px solid ${colors.purple}` : `1px solid ${colors.border}`,
                    background: !filterMood ? colors.purpleSoft : warm.cream,
                    fontFamily: fonts.body, fontSize: 10, fontWeight: 800,
                    color: !filterMood ? colors.purple : colors.textMuted,
                  }}>All</button>
                {MOODS.map(m => (
                  <button key={m.label} onClick={() => setFilterMood(filterMood === m.label ? null : m.label)} style={{
                    padding: "4px 10px", borderRadius: radius.full, cursor: "pointer",
                    border: filterMood === m.label ? `1.5px solid ${m.color}` : `1px solid ${colors.border}`,
                    background: filterMood === m.label ? m.bg : warm.cream,
                    fontFamily: fonts.body, fontSize: 10, fontWeight: 800,
                    color: filterMood === m.label ? m.color : colors.textMuted,
                    transition: "all 0.15s",
                  }}>{m.emoji}</button>
                ))}
              </div>
            </div>

            {/* Entry count */}
            <div style={{ fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: colors.textMuted, marginBottom: 10, paddingLeft: 2 }}>
              {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"} {searchQ || filterMood || filterTag ? "(filtered)" : ""}
            </div>

            {/* Entries list */}
            <div style={{ maxHeight: "calc(100vh - 380px)", overflowY: "auto", paddingRight: 4 }}>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: colors.textMuted, fontFamily: fonts.body }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>No entries found.</div>
                </div>
              )}

              {activeView === "all" && filtered.map(e => (
                <EntryCard key={e.id} entry={e} onSelect={setSelected} selected={selected?.id === e.id} />
              ))}

              {activeView === "month" && Object.entries(byMonth).map(([month, list]) => (
                <div key={month} style={{ marginBottom: 20 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                  }}>
                    <span style={{
                      fontSize: 11, fontFamily: fonts.body, fontWeight: 800,
                      color: colors.purple, letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>{month}</span>
                    <span style={{
                      fontSize: 9, fontFamily: fonts.body, fontWeight: 800,
                      color: colors.textMuted, background: colors.bg,
                      padding: "2px 8px", borderRadius: radius.full,
                      border: `1px solid ${colors.border}`,
                    }}>{list.length} entries</span>
                    <div style={{ flex: 1, height: 1, background: colors.border }} />
                  </div>
                  {list.map(e => (
                    <EntryCard key={e.id} entry={e} onSelect={setSelected} selected={selected?.id === e.id} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: editor panel ── */}
          {showEditor && (
            <div style={{ position: "sticky", top: 20, height: "calc(100vh - 120px)" }}>
              <EditorPanel
                entry={isNew ? null : selected}
                onSave={handleSave}
                onDelete={handleDelete}
                onClose={closeEditor}
                saving={saving}
              />
            </div>
          )}

          {/* ── Empty state when no editor open ── */}
          {!showEditor && entries.length > 0 && (
            <div /> // single column, nothing extra needed
          )}
        </div>
      )}

      {/* ── Empty state (no entries at all) ── */}
      {!loading && entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📓</div>
          <div style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text, marginBottom: 8 }}>Start Your Journal</div>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>
            Write your first entry. Your thoughts are safe here.
          </p>
          <button
            onClick={openNew}
            style={{
              padding: "12px 28px", borderRadius: radius.md, border: "none",
              background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
              color: "#fff", fontFamily: fonts.body, fontSize: 13, fontWeight: 800,
              cursor: "pointer", boxShadow: shadows.purple,
            }}
          >✦ Write First Entry</button>
        </div>
      )}

    </div>
  );
};

export default Journal;
import { useState, useRef, useEffect, useCallback } from "react";
import { MeditationSVG } from "../components/ui/Brand";
import MoodChart from "../components/ui/MoodChart";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { colors, fonts, radius, shadows } from "../styles/theme";
import { CHAT_QUICK_ACTIONS } from "../data";
import * as api from "../api";

// ─── Helper: format timestamp ─────────────────────────────────────────────────
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ─── Disclaimer Banner ────────────────────────────────────────────────────────
const DisclaimerBanner = () => (
  <div style={{
    background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
    border: `1.5px solid #F59E0B`,
    borderRadius: radius.md,
    padding: "10px 14px",
    margin: "10px 14px 0",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  }}>
    <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
    <p style={{
      fontSize: 11,
      fontFamily: fonts.body,
      color: "#92400E",
      fontWeight: 700,
      lineHeight: 1.5,
      margin: 0,
    }}>
      CalmMind AI is a supportive companion — not a replacement for a licensed psychologist or therapist. If you are in crisis, please seek professional help immediately.
    </p>
  </div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isUser = msg.from === "user";
  // Render disclaimer lines differently (the ⚠️ prefixed first message)
  const isDisclaimer = !isUser && msg.text.startsWith("⚠️");

  if (isDisclaimer) {
    const parts = msg.text.split("\n\n");
    const disclaimerLine = parts[0];
    const rest = parts.slice(1).join("\n\n");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
          border: `1.5px solid #F59E0B`,
          borderRadius: radius.md,
          padding: "10px 14px",
          fontSize: 12,
          fontFamily: fonts.body,
          color: "#92400E",
          fontWeight: 700,
          lineHeight: 1.55,
        }}>
          {disclaimerLine}
        </div>
        {rest && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <AiAvatar />
            <div style={{
              maxWidth: "72%",
              background: colors.purpleSoft,
              color: colors.text,
              padding: "10px 14px",
              borderRadius: "16px 16px 16px 4px",
              fontSize: 13,
              fontFamily: fonts.body,
              lineHeight: 1.55,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              border: `1px solid ${colors.border}`,
              whiteSpace: "pre-wrap",
            }}>
              {rest}
            </div>
          </div>
        )}
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.body, paddingLeft: 2 }}>
          {msg.time}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      alignItems: "flex-end",
      gap: 8,
    }}>
      {!isUser && <AiAvatar />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 3 }}>
        <div style={{
          maxWidth: "72%",
          background: isUser
            ? `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`
            : colors.purpleSoft,
          color: isUser ? "#fff" : colors.text,
          padding: "10px 14px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          fontSize: 13,
          fontFamily: fonts.body,
          lineHeight: 1.55,
          fontWeight: 600,
          boxShadow: isUser ? `0 4px 14px ${colors.purple}35` : "0 2px 8px rgba(0,0,0,0.06)",
          border: !isUser ? `1px solid ${colors.border}` : "none",
          whiteSpace: "pre-wrap",
        }}>
          {msg.text}
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.body }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
};

const AiAvatar = () => (
  <div style={{
    width: 28, height: 28, borderRadius: 10, flexShrink: 0,
    background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
  }}>🧘</div>
);

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
    <AiAvatar />
    <div style={{
      background: colors.purpleSoft,
      padding: "10px 16px",
      borderRadius: "16px 16px 16px 4px",
      border: `1px solid ${colors.border}`,
      display: "flex", gap: 5, alignItems: "center",
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: colors.purple, opacity: 0.5,
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.5} 40%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  </div>
);

// ─── Session List Item ────────────────────────────────────────────────────────
const SessionItem = ({ session, isActive, onClick }) => {
  const date = new Date(session.startedAt);
  const label = date.toLocaleDateString([], { month: "short", day: "numeric" });
  const count = session._count?.messages ?? 0;

  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: radius.md,
        cursor: "pointer",
        background: isActive ? colors.purpleSoft : "transparent",
        border: isActive ? `1.5px solid ${colors.lavender}` : "1.5px solid transparent",
        marginBottom: 4,
        transition: "all 0.15s",
        display: "flex", alignItems: "center", gap: 10,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: isActive
          ? `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`
          : colors.purpleSoft,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
      }}>💬</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontFamily: fonts.body, fontWeight: 700,
          color: isActive ? colors.purple : colors.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {session.title || "Conversation"}
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.body }}>
          {label} · {count} msg{count !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

// ─── Chat Panel ───────────────────────────────────────────────────────────────
const ChatPanel = ({ messages, onSend, typing, loading, sessions, activeSessionId, onSelectSession, onNewSession }) => {
  const [input, setInput] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = () => {
    if (!input.trim() || typing) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div style={{
      flex: 1,
      background: colors.card,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: "18px 20px",
        borderBottom: `1.5px solid ${colors.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: `0 4px 12px ${colors.purple}40`,
          }}>🧘</div>
          <div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, color: colors.text }}>
              CalmMind AI
            </div>
            <div style={{ fontSize: 11, fontFamily: fonts.body, color: colors.green, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors.green, display: "inline-block" }} />
              Online • Always here for you
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* New chat button */}
          <button
            onClick={onNewSession}
            title="New conversation"
            style={{
              background: colors.purpleSoft, border: `1px solid ${colors.border}`,
              borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✏️</button>
          {/* Toggle session list */}
          <button
            onClick={() => setShowSessions(s => !s)}
            title="Past conversations"
            style={{
              background: showSessions ? colors.purpleSoft : "transparent",
              border: `1px solid ${showSessions ? colors.lavender : colors.border}`,
              borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>☰</button>
        </div>
      </div>

      {/* ── Session history drawer ── */}
      {showSessions && (
        <div style={{
          borderBottom: `1.5px solid ${colors.border}`,
          padding: "12px 14px",
          maxHeight: 220,
          overflowY: "auto",
          background: colors.bg,
        }}>
          <div style={{
            fontSize: 10, fontFamily: fonts.body, fontWeight: 700,
            color: colors.textMuted, textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: 8,
          }}>
            Past Conversations
          </div>
          {sessions.length === 0 ? (
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body, padding: "4px 0" }}>
              No past sessions yet.
            </div>
          ) : (
            sessions.map(s => (
              <SessionItem
                key={s.id}
                session={s}
                isActive={s.id === activeSessionId}
                onClick={() => { onSelectSession(s.id); setShowSessions(false); }}
              />
            ))
          )}
        </div>
      )}

      {/* ── Date stamp ── */}
      <div style={{
        textAlign: "center", padding: "12px 0 4px",
        fontSize: 11, color: colors.textMuted, fontFamily: fonts.body,
      }}>
        Today, {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "8px 16px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 28 }}>🧘</div>
            <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>Loading conversation…</div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 36 }}>💜</div>
            <div style={{ fontSize: 14, color: colors.textMid, fontFamily: fonts.display, fontWeight: 700, textAlign: "center" }}>
              How are you feeling today?
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body, textAlign: "center", maxWidth: 240 }}>
              Send a message to start talking with CalmMind AI. I'm here to listen.
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Bubble key={i} msg={m} />)
        )}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick actions ── */}
      <div style={{ padding: "10px 14px 0", display: "flex", gap: 8 }}>
        {CHAT_QUICK_ACTIONS.map(({ icon, label }) => (
          <button
            key={label}
            onClick={() => onSend(label)}
            disabled={typing}
            style={{
              flex: 1,
              background: colors.purpleSoft,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: "8px 4px",
              cursor: typing ? "not-allowed" : "pointer",
              fontFamily: fonts.body,
              fontSize: 10,
              fontWeight: 700,
              color: colors.purple,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              opacity: typing ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}>
            <span style={{ fontSize: 16 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* ── Input ── */}
      <div style={{ padding: "12px 14px 16px", display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={typing ? "CalmMind AI is responding…" : "Type a message…"}
          disabled={typing}
          style={{
            flex: 1,
            background: colors.bg,
            border: `1.5px solid ${colors.border}`,
            borderRadius: radius.md,
            padding: "11px 14px",
            fontSize: 13,
            color: colors.text,
            outline: "none",
            fontFamily: fonts.body,
            opacity: typing ? 0.6 : 1,
          }}
        />
        <button
          onClick={handleSend}
          disabled={typing || !input.trim()}
          style={{
            width: 42, height: 42, borderRadius: radius.md,
            background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
            border: "none",
            cursor: typing || !input.trim() ? "not-allowed" : "pointer",
            fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 14px ${colors.purple}40`,
            opacity: typing || !input.trim() ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}>🎤</button>
      </div>
    </div>
  );
};

// ─── Right summary panel ──────────────────────────────────────────────────────
const SummaryPanel = () => (
  <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: colors.bg }}>
    <div style={{
      borderRadius: radius.xl,
      background: "linear-gradient(135deg, #EDE9FE 0%, #F5EFE8 55%, #FEF3C7 100%)",
      marginBottom: 20, padding: "24px 36px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 4px 20px rgba(124,58,237,0.1)", border: `1px solid ${colors.border}`,
    }}>
      <div>
        <h2 style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: colors.text, lineHeight: 1.2, marginBottom: 8 }}>
          How are you<br />feeling today?
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMid, fontWeight: 600 }}>
          Your AI companion is always here.
        </p>
      </div>
      <MeditationSVG size={120} />
    </div>

    <div className="responsive-grid-2" style={{ gap: 20 }}>
      <Card>
        <div style={{ fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Past 7 Days Mood Trend
        </div>
        <MoodChart />
      </Card>

      <Card>
        <div style={{ fontSize: 10, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Your Next Session
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: colors.purpleSoft, border: `1px solid ${colors.lavender}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
          }}>📚</div>
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 13, fontWeight: 700, color: colors.text }}>Mood Trend Review</div>
            <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.body }}>with Anya Sharma</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 600, marginBottom: 14 }}>
          📍 Monday, Nov 20, 2024 at 10:30am
        </div>
        <Button variant="primary" size="sm" fullWidth>Reschedule</Button>
      </Card>
    </div>
  </div>
);

// ─── MAIN CHAT PAGE ───────────────────────────────────────────────────────────
const Chat = () => {
  const [messages, setMessages]             = useState([]);
  const [typing, setTyping]                 = useState(false);
  const [loading, setLoading]               = useState(true);
  const [sessions, setSessions]             = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // ── Convert DB message to display format ──────────────────────────────────
  const toDisplay = (m) => ({
    from: m.senderRole === "user" ? "user" : "ai",
    text: m.content,
    time: fmt(m.createdAt),
  });

  // ── Load all sessions for this user ──────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await api.getChatSessions();
      setSessions(res.sessions || []);
      return res.sessions || [];
    } catch {
      return [];
    }
  }, []);

  // ── Load messages for a specific session ─────────────────────────────────
  const loadMessages = useCallback(async (sessionId) => {
    setLoading(true);
    try {
      const res = await api.getChatMessages(sessionId);
      setMessages((res.messages || []).map(toDisplay));
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create a brand-new session ────────────────────────────────────────────
  const createNewSession = useCallback(async () => {
    setLoading(true);
    setMessages([]);
    try {
      const res = await api.startChatSession();
      const newId = res.session.id;
      setActiveSessionId(newId);
      await loadSessions();
      setLoading(false);
      return newId;
    } catch {
      setLoading(false);
      return null;
    }
  }, [loadSessions]);

  // ── On mount: load sessions, reuse the latest active one ─────────────────
  useEffect(() => {
    const init = async () => {
      const existingSessions = await loadSessions();
      if (existingSessions.length > 0) {
        const latest = existingSessions[0]; // already sorted desc
        setActiveSessionId(latest.id);
        await loadMessages(latest.id);
      } else {
        // No sessions yet — create the first one
        await createNewSession();
      }
    };
    init();
  }, []);

  // ── Switch to a past session ──────────────────────────────────────────────
  const handleSelectSession = useCallback(async (sessionId) => {
    setActiveSessionId(sessionId);
    await loadMessages(sessionId);
  }, [loadMessages]);

  // ── Handle user sending a message ────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!text.trim() || typing) return;

    let sessionId = activeSessionId;

    // Safety: if somehow no session exists, create one first
    if (!sessionId) {
      sessionId = await createNewSession();
      if (!sessionId) return;
    }

    // Optimistically add the user message
    const userMsg = { from: "user", text, time: fmt() };
    setMessages(m => [...m, userMsg]);
    setTyping(true);

    try {
      const res = await api.sendChatMessage(sessionId, text);

      if (res.error) {
        setMessages(m => [...m, {
          from: "ai",
          text: `Sorry, I couldn't respond right now. ${res.error}`,
          time: fmt(),
        }]);
      } else {
        const aiMsg = toDisplay(res.message);
        setMessages(m => [...m, aiMsg]);
      }
    } catch {
      setMessages(m => [...m, {
        from: "ai",
        text: "Sorry, I'm having trouble connecting right now. Please check your connection and try again. 💜",
        time: fmt(),
      }]);
    } finally {
      setTyping(false);
      // Refresh session list so message counts update
      loadSessions().then(s => setSessions(s));
    }
  }, [activeSessionId, typing, createNewSession, loadSessions]);

  return (
    <div className="page-enter" style={{
      display: "flex",
      height: "100%",
      margin: "-24px -28px",
    }}>
      <ChatPanel
        messages={messages}
        onSend={handleSend}
        typing={typing}
        loading={loading}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={createNewSession}
        fullWidth
      />
    </div>
  );
};
  
export default Chat;
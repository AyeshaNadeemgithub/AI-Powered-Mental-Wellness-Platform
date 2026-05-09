import React, { useState, useEffect } from "react";
import { colors, fonts, radius, shadows } from "../styles/theme";
import Card from "../components/ui/Card";
import * as api from "../api";

const TherapistCard = ({ therapist, formatName }) => {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getConversations();
        const conv = res.conversations.find(c => c.psychologistId === therapist.userId || c.psychologistId === therapist.id);
        if (conv) {
          const msgsRes = await api.getMessages(conv.id);
          setHistory(msgsRes.messages || []);
        }
      } catch (err) {
        console.error("Failed to fetch message history:", err);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [therapist]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    try {
      const res = await api.sendMessage(therapist.user.id, msg);
      setHistory(prev => [...prev, { ...res.message, sender: { firstName: "You" } }]);
      setMsg("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error("Failed to send message to therapist:", err);
    }
  };

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, color: "#fff", fontWeight: 700
        }}>
          {therapist.user.firstName.charAt(0)}
        </div>
        <div>
          <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.text }}>
            Dr. {formatName(therapist.user.firstName, therapist.user.lastName)}
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 600 }}>
            {therapist.specialization} • Active Therapist
          </div>
        </div>
      </div>

      <div style={{ background: colors.bg, borderRadius: radius.md, padding: 16, border: `1.5px solid ${colors.border}` }}>
        {/* History Window */}
        <div style={{ 
          height: 150, overflowY: "auto", background: "#fff", 
          borderRadius: 8, padding: 12, marginBottom: 12, 
          border: `1.5px solid ${colors.border}`, display: "flex", flexDirection: "column", gap: 8
        }}>
          {history.length === 0 ? (
            <div style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 60 }}>No messages yet.</div>
          ) : (
            history.map((m, i) => (
              <div key={i} style={{ alignSelf: m.senderId === therapist.user.id ? "flex-start" : "flex-end" }}>
                <div style={{ 
                  padding: "6px 12px", borderRadius: 12, fontSize: 13,
                  background: m.senderId === therapist.user.id ? "#F3F4F6" : colors.purple,
                  color: m.senderId === therapist.user.id ? colors.text : "#fff"
                }}>
                  {m.content}
                </div>
              </div>
            ))
          )}
        </div>

        <input 
          type="text" 
          placeholder={`Send a message to Dr. ${therapist.user.firstName}...`}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ 
            width: "100%", padding: "12px 16px", borderRadius: radius.md, 
            border: `1.5px solid ${colors.border}`, marginBottom: 12, 
            fontSize: 14, fontFamily: fonts.body, outline: "none",
            boxSizing: "border-box"
          }} 
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button 
            onClick={handleSend}
            style={{ 
              background: colors.purple, color: "#fff", border: "none", 
              borderRadius: radius.md, padding: "10px 20px", fontWeight: 700, 
              cursor: "pointer", fontSize: 14, fontFamily: fonts.body,
              boxShadow: shadows.purple
            }}
          >
            Send Message
          </button>
          {sent && <span style={{ color: colors.green, fontSize: 13, fontWeight: 700 }}>✓ Message Delivered</span>}
        </div>
      </div>
    </Card>
  );
};

const TherapistChat = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppts = async () => {
    try {
      const res = await api.getAppointments();
      const uniqueTherapists = [];
      const seenIds = new Set();
      
      res.forEach(appt => {
        if (appt.psychologist && !seenIds.has(appt.psychologist.id)) {
          seenIds.add(appt.psychologist.id);
          uniqueTherapists.push(appt.psychologist);
        }
      });
      
      setAppointments(uniqueTherapists);
    } catch (err) {
      console.error("Failed to fetch therapists for chat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppts();
    const interval = setInterval(fetchAppts, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatName = (fName = "", lName = "") => {
    const cleanLast = lName === "-" ? "" : lName;
    return `${fName} ${cleanLast}`.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") || "Therapist";
  };

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
            ✦ Communication
          </div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 6 }}>
            Chat with Therapists
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMid, fontWeight: 600 }}>
            Message your healthcare providers directly.
          </p>
        </div>
        <div style={{ fontSize: 56 }}>💬</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: colors.textMuted, fontFamily: fonts.body }}>
          Loading your therapists...
        </div>
      ) : appointments.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
          <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.text }}>No active therapists yet</div>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginTop: 8, maxWidth: 400, marginInline: "auto" }}>
            You haven't booked any sessions yet. Once you book a session, you'll be able to chat with your therapist here.
          </p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {appointments.map((therapist) => (
            <TherapistCard 
              key={therapist.id} 
              therapist={therapist} 
              formatName={formatName} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistChat;

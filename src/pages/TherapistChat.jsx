import React, { useState, useEffect, useRef } from "react";
import { colors, fonts, radius, shadows } from "../styles/theme";
import Card from "../components/ui/Card";
import * as api from "../api";
import { getSocket } from "../socket";

const TherapistCard = ({ therapist, formatName, socket }) => {
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await api.getConversations();
        const conv = res.conversations.find(c => c.psychologistId === therapist.userId || c.psychologistId === therapist.id);
        
        if (conv) {
          setConversationId(conv.id);
          const msgsRes = await api.getMessages(conv.id);
          setHistory(msgsRes.messages || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error("Failed to fetch message history:", err);
      }
    };
    initChat();
  }, [therapist]);

  useEffect(() => {
    if (socket && conversationId) {
      socket.emit("join_conversation", conversationId);
      socket.emit("mark_read", { conversationId });

      const handleNewMessage = (newMsg) => {
        if (newMsg.conversationId === conversationId) {
          setHistory(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(scrollToBottom, 100);
          // Mark as read immediately if we're in the chat
          socket.emit("mark_read", { conversationId });
        }
      };

      const handleTyping = (data) => {
        if (data.conversationId === conversationId && data.userId !== api.getStoredUser().id) {
          setIsTyping(data.isTyping);
        }
      };

      socket.on("new_message", handleNewMessage);
      socket.on("typing_status", handleTyping);

      return () => {
        socket.off("new_message", handleNewMessage);
        socket.off("typing_status", handleTyping);
        socket.emit("leave_conversation", conversationId);
      };
    }
  }, [socket, conversationId]);

  let typingTimeout = null;
  const handleTypingInput = (e) => {
    setMsg(e.target.value);
    if (socket && conversationId) {
      socket.emit("typing", { conversationId, isTyping: true });
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("typing", { conversationId, isTyping: false });
      }, 1500);
    }
  };

  const handleSend = async () => {
    if (!msg.trim()) return;
    
    // We can emit directly via socket if conversationId exists, 
    // or fallback to API which will trigger the socket on backend
    try {
      if (socket && conversationId) {
        socket.emit("send_message", {
          conversationId,
          content: msg
        });
      } else {
        // Fallback or first message
        await api.sendMessage(therapist.userId, msg);
        // After sending, refresh to get conversationId
        const res = await api.getConversations();
        const conv = res.conversations.find(c => c.psychologistId === therapist.userId || c.psychologistId === therapist.id);
        if (conv && socket) {
          setConversationId(conv.id);
          socket.emit("join_conversation", conv.id);
          const msgsRes = await api.getMessages(conv.id);
          setHistory(msgsRes.messages || []);
        }
      }
      setMsg("");
      setTimeout(scrollToBottom, 100);
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
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.text }}>
              {formatName(therapist.user.firstName, therapist.user.lastName)}
            </div>
            {conversationId && (
              <button 
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete this entire chat history?")) {
                    await api.deleteConversation(conversationId);
                    window.location.reload();
                  }
                }}
                style={{ background: "none", border: "none", color: "#EF4444", fontSize: 11, fontWeight: 700, cursor: "pointer", opacity: 0.7 }}
              >
                🗑️ Delete Chat
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 600 }}>
            {therapist.specialization} • Active Therapist
          </div>
        </div>
      </div>

      <div style={{ background: colors.bg, borderRadius: radius.md, padding: 16, border: `1.5px solid ${colors.border}` }}>
        {/* History Window */}
        <div style={{ 
          height: 250, overflowY: "auto", background: "#fff", 
          borderRadius: 8, padding: 12, marginBottom: 12, 
          border: `1.5px solid ${colors.border}`, display: "flex", flexDirection: "column", gap: 8
        }}>
          {history.length === 0 ? (
            <div style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 100 }}>No messages yet.</div>
          ) : (
            history.map((m, i) => {
              const isReceived = m.senderId === therapist.userId || m.senderId === therapist.id;
              return (
                <div key={i} style={{ alignSelf: isReceived ? "flex-start" : "flex-end", maxWidth: "80%" }}>
                  <div style={{ 
                    padding: "8px 14px", borderRadius: 16, fontSize: 14,
                    background: isReceived ? "#F3F4F6" : colors.purple,
                    color: isReceived ? colors.text : "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    wordBreak: "break-word"
                  }}>
                    {m.content}
                  </div>
                  <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4, textAlign: isReceived ? "left" : "right" }}>
                    {new Date(m.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          {isTyping && (
            <div style={{ alignSelf: "flex-start", fontSize: 12, color: colors.purple, fontStyle: "italic", padding: "4px 8px" }}>
              Therapist is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input 
            type="text" 
            placeholder={`Send a message to ${therapist.user.firstName}...`}
            value={msg}
            onChange={handleTypingInput}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            style={{ 
              flex: 1, padding: "12px 16px", borderRadius: radius.md, 
              border: `1.5px solid ${colors.border}`, 
              fontSize: 14, fontFamily: fonts.body, outline: "none",
            }} 
          />
          <button 
            onClick={handleSend}
            style={{ 
              background: colors.purple, color: "#fff", border: "none", 
              borderRadius: radius.md, padding: "0 24px", fontWeight: 700, 
              cursor: "pointer", fontSize: 14, fontFamily: fonts.body,
              boxShadow: shadows.purple
            }}
          >
            Send
          </button>
        </div>
      </div>
    </Card>
  );
};

const TherapistChat = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const s = getSocket();
    setSocket(s);

    const fetchAppts = async () => {
      try {
        const res = await api.getAppointments();
        const uniqueTherapists = [];
        const seenIds = new Set();
        
        // Filter out cancelled appointments and map unique therapists
        res.forEach(appt => {
          if (appt.status !== 'CANCELLED' && appt.psychologist && !seenIds.has(appt.psychologist.id)) {
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
    fetchAppts();
  }, []);

  const formatName = (fName = "", lName = "") => {
    const cleanLast = lName === "-" ? "" : lName;
    return `${fName} ${cleanLast}`.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") || "Therapist";
  };

  return (
    <div className="page-enter">
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
            Message your healthcare providers directly in real-time.
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
              socket={socket}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistChat;

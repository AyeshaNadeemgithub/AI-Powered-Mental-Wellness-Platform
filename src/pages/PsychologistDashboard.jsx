import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PsychologistDashboardLayout from "../components/layout/PsychologistDashboardLayout";
import CardBox from "../components/ui/CardBox";
import WeekCalendarGrid from "../components/ui/WeekCalendarGrid";
import ScheduleRightPanel from "../components/ui/ScheduleRightPanel";
import { staffStyles } from "../styles/staffDashboardStyles";
import * as api from "../api";
import { getSocket } from "../socket";
import Toast from "../components/ui/Toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

const SectionTitle = ({ children }) => (
  <div style={{ fontWeight: 800, fontSize: 18, color: "#1E1B4B", marginBottom: 16 }}>{children}</div>
);

// Format names: remove hyphen, capitalize words
const formatName = (fName = "", lName = "") => {
  const cleanLast = lName === "-" ? "" : lName;
  const combined = `${fName} ${cleanLast}`.trim();
  return combined.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") || "User";
};

const menuItems = [
  { label: "My Schedule", key: "schedule", icon: "📅" },
  { label: "Availability", key: "availability", icon: "⏰" },
  { label: "Patients", key: "patients", icon: "👥" },
  { label: "Progress Reports", key: "reports", icon: "📈" },
  { label: "Patient History", key: "history", icon: "📖" },
  { label: "Notes & Feedback", key: "notes", icon: "📝" },
  { label: "Chat with Patients", key: "chat", icon: "💬" },
];

function ScheduleView({ data, loading, weekOffset, setWeekOffset }) {
  if (loading && !data) return <div style={{ padding: 20, color: "#9896B8" }}>Loading schedule...</div>;

  return (
    <div className="mobile-overflow-x">
      <CardBox>
        <WeekCalendarGrid 
          appointments={data?.weekAppointments || []} 
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
        />
      </CardBox>
    </div>
  );
}

function PatientsView({ data, loading, onViewHistory }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading patients...</div>;
  const patients = data?.patients || [];

  return (
    <div>
      <div style={staffStyles.pageTitle}>Patients</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Patient List ({patients.length})</div>
        {patients.length === 0 ? (
          <div style={{ color: "#9896B8", fontSize: 14, fontWeight: 600, padding: "20px 0", textAlign: "center" }}>
            👥 No patients have booked appointments yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {patients.map((p, i) => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: 10,
                background: i % 2 === 0 ? "#F5F3FF" : "#fff",
                border: "1px solid #E5E1F8",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 14,
                }}>{p.firstName?.charAt(0)}{(p.lastName && p.lastName !== "-") ? p.lastName.charAt(0) : ""}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1E1B4B" }}>
                    {formatName(p.firstName, p.lastName)}
                  </div>
                  <div style={{ fontSize: 12, color: "#9896B8", fontWeight: 600 }}>
                    {p.appointmentCount} session{p.appointmentCount !== 1 ? "s" : ""} · Last: {p.lastAppointment ? new Date(p.lastAppointment).toLocaleDateString() : "N/A"}
                  </div>
                </div>
                <button 
                  onClick={() => onViewHistory(p.id)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, background: "#7C3AED", color: "#fff",
                    border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  View History
                </button>
              </div>
            ))}
          </div>
        )}
      </CardBox>
    </div>
  );
}

function ReportsView({ data, loading }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading reports...</div>;
  const stats = data?.stats || {};

  return (
    <div>
      <div style={staffStyles.pageTitle}>Progress Reports</div>
      <div className="responsive-grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Patients", value: stats.totalPatients || 0, icon: "👥", color: "#7C3AED" },
          { label: "Completed Sessions", value: stats.completedSessions || 0, icon: "✅", color: "#10B981" },
          { label: "Pending Sessions", value: stats.pendingSessions || 0, icon: "⏳", color: "#F59E0B" },
          { label: "Confirmed Sessions", value: stats.confirmedSessions || 0, icon: "📅", color: "#0EA5E9" },
          { label: "Cancelled Sessions", value: stats.cancelledSessions || 0, icon: "❌", color: "#EF4444" },
          { label: "Total Sessions", value: stats.totalSessions || 0, icon: "📊", color: "#6D28D9" },
        ].map((s, i) => (
          <CardBox key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 22, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#9896B8", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            </div>
          </CardBox>
        ))}
      </div>
    </div>
  );
}

function HistoryView({ data, loading }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading history...</div>;
  const allAppts = data?.allAppointments || [];
  const completedAppts = allAppts.filter(a => a.status === "COMPLETED");

  return (
    <div>
      <div style={staffStyles.pageTitle}>Patient History</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Completed Sessions ({completedAppts.length})</div>
        {completedAppts.length === 0 ? (
          <div style={{ color: "#9896B8", fontSize: 14, fontWeight: 600, padding: "20px 0", textAlign: "center" }}>
            📖 No completed sessions yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {completedAppts.slice(0, 20).map(a => (
              <div key={a.id} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #E5E1F8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontWeight: 700, color: "#1E1B4B", fontSize: 14 }}>{formatName(a.patient.firstName, a.patient.lastName)}</span>
                  <span style={{ color: "#9896B8", fontSize: 12, marginLeft: 8 }}>{new Date(a.scheduledAt).toLocaleDateString()}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>Completed</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ background: "#FEF3C7", borderRadius: 8, padding: 12, marginTop: 12, color: "#92400E", fontWeight: 600, fontSize: 14 }}>
          History transferred. No need to repeat trauma multiple times.
        </div>
      </CardBox>
    </div>
  );
}

function NotesView({ data, loading }) {
  const [localNotes, setLocalNotes] = useState([]);
  const [selectedApptId, setSelectedApptId] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (data?.appointmentNotes) {
      setLocalNotes(data.appointmentNotes);
    }
  }, [data]);

  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading notes...</div>;

  const completedAppts = data?.allAppointments?.filter(a => a.status === "COMPLETED") || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApptId) {
      setMessage({ type: "error", text: "Please select an appointment first." });
      return;
    }
    if (!noteContent.trim()) {
      setMessage({ type: "error", text: "Note content cannot be empty." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const newNote = await api.addAppointmentNote(selectedApptId, noteContent);
      setLocalNotes(prev => [newNote, ...prev]);
      setNoteContent("");
      setSelectedApptId("");
      setMessage({ type: "success", text: "Session note saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to save note. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={staffStyles.pageTitle}>Notes & Feedback</div>

      {/* Add New Note Card */}
      <CardBox>
        <div style={staffStyles.sectionTitle}>✍️ Record New Session Note</div>
        
        {completedAppts.length === 0 ? (
          <div style={{ background: "#F3F4F6", borderRadius: 12, padding: "20px", textAlign: "center", color: "#6B7280", fontWeight: 600 }}>
            No completed appointments found. You can only record notes for completed sessions.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E1B4B", marginBottom: 6 }}>
                Select Appointment
              </label>
              <select
                value={selectedApptId}
                onChange={e => setSelectedApptId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  outline: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1E1B4B"
                }}
              >
                <option value="">-- Choose a session --</option>
                {completedAppts.map(appt => {
                  const patientName = formatName(appt.patient.firstName, appt.patient.lastName);
                  const apptDate = new Date(appt.scheduledAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  });
                  return (
                    <option key={appt.id} value={appt.id}>
                      {patientName} - {apptDate}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#1E1B4B", marginBottom: 6 }}>
                Clinical Observations & Feedback
              </label>
              <textarea
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                placeholder="Write your clinical notes here... (e.g. assessment, goals discussed, patient mental state, home exercises assigned)"
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid #D1D5DB",
                  outline: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
            </div>

            {message.text && (
              <div style={{
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: message.type === "success" ? "#DEF7EC" : "#FDE8E8",
                color: message.type === "success" ? "#03543F" : "#9B1C1C"
              }}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                alignSelf: "flex-end",
                padding: "12px 24px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)"
              }}
            >
              {isSubmitting ? "Saving Note..." : "Save Session Note"}
            </button>
          </form>
        )}
      </CardBox>

      {/* Note History Card */}
      <CardBox>
        <div style={staffStyles.sectionTitle}>📋 Session Notes History ({localNotes.length})</div>
        {localNotes.length === 0 ? (
          <div style={{ color: "#9896B8", fontSize: 14, fontWeight: 600, padding: "20px 0", textAlign: "center" }}>
            📝 No session notes or feedback recorded yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {localNotes.map(n => {
              const patientName = formatName(n.appointment?.patient?.firstName, n.appointment?.patient?.lastName);
              const noteDate = new Date(n.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
              });
              return (
                <div
                  key={n.id}
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    border: "1px solid #E5E1F8",
                    background: "#F9F8FF",
                    boxShadow: "0 2px 8px rgba(124,58,237,0.02)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>👤</span>
                      <span style={{ fontWeight: 800, color: "#1E1B4B", fontSize: 14 }}>
                        {patientName}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: "#9896B8", fontWeight: 600 }}>{noteDate}</span>
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: "#4C4682",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    background: "#fff",
                    padding: "12px",
                    borderRadius: 8,
                    border: "1px solid #F0EEFB"
                  }}>
                    {n.content}
                  </div>
                  <div style={{ fontSize: 11, color: "#9896B8", marginTop: 8, textAlign: "right", fontWeight: 600 }}>
                    Recorded by {formatName(n.author?.firstName, n.author?.lastName)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBox>
    </div>
  );
}

function AvailabilityView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({ startTime: "09:00", endTime: "10:00", isRecurring: true });
  
  const user = api.getStoredUser();
  // Ensure we have psychologist ID
  const psychologistId = user.psychologist?.id;

  useEffect(() => {
    if (psychologistId) {
      fetchAvailability();
    }
  }, [selectedDate, psychologistId]);

  const fetchAvailability = async () => {
    if (!psychologistId) {
      console.warn("No psychologistId found for availability fetch");
      return;
    }
    setLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const data = await api.getAvailability(psychologistId, dateStr, true);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!psychologistId) return alert("Psychologist ID missing. Please log in again.");
    
    // Logic: Prevent past dates
    const now = new Date();
    if (!newSlot.isRecurring) {
      const slotDate = new Date(selectedDate);
      const [h, m] = newSlot.startTime.split(":");
      slotDate.setHours(parseInt(h), parseInt(m), 0, 0);
      
      if (slotDate < now) {
        return alert("Cannot add availability for a past date or time.");
      }
    }

    try {
      const dayOfWeek = selectedDate.getDay();
      const slotData = {
        ...newSlot,
        dayOfWeek: newSlot.isRecurring ? dayOfWeek : null,
        specificDate: newSlot.isRecurring ? null : selectedDate,
      };
      await api.addAvailability(psychologistId, [slotData]);
      fetchAvailability();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.deleteAvailability(id);
      fetchAvailability();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="responsive-grid-350-1">
      <div>
        <SectionTitle>Availability Calendar</SectionTitle>
        <CardBox style={{ padding: 15 }}>
          <Calendar 
            onChange={setSelectedDate} 
            value={selectedDate}
            minDate={new Date()}
            className="premium-calendar"
          />
          <style>{`
            .premium-calendar { border: none !important; width: 100% !important; font-family: inherit !important; }
            .react-calendar__tile--active { background: #7C3AED !important; border-radius: 8px; color: white !important; }
            .react-calendar__tile:hover { border-radius: 8px; }
            .react-calendar__navigation button:enabled:hover, .react-calendar__navigation button:enabled:focus { background-color: #f3f4f6; border-radius: 8px; }
          `}</style>
        </CardBox>
      </div>

      <div>
        <SectionTitle>Slots for {format(selectedDate, "eeee, MMM do")}</SectionTitle>
        <CardBox style={{ padding: 25 }}>
          <div style={{ display: "flex", gap: 15, marginBottom: 25, background: "#F5F3FF", padding: 20, borderRadius: 15, border: "1px solid #DDD6FE" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6D28D9", display: "block", marginBottom: 5 }}>Start Time</label>
              <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #DDD6FE" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#6D28D9", display: "block", marginBottom: 5 }}>End Time</label>
              <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #DDD6FE" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, alignSelf: "flex-end" }}>
              <input type="checkbox" checked={newSlot.isRecurring} onChange={e => setNewSlot({...newSlot, isRecurring: e.target.checked})} id="isRecurring" />
              <label htmlFor="isRecurring" style={{ fontSize: 12, fontWeight: 700, color: "#4B5563" }}>Weekly Recurring</label>
            </div>
            <button onClick={handleAddSlot} style={{ alignSelf: "flex-end", background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}>Add Slot</button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Loading slots...</div>
          ) : slots.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, background: "#F9FAFB", borderRadius: 15, color: "#6B7280", border: "2px dashed #E5E7EB" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>📅</div>
              <div>No slots defined for this day.</div>
            </div>
          ) : (
            <div className="responsive-grid-2">
              {slots.map(slot => (
                <div key={slot.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", background: slot.isAvailable ? "#fff" : "#F3F4F6", border: slot.isAvailable ? "1.5px solid #E5E1F8" : "1.5px solid #E5E7EB", borderRadius: 12, opacity: slot.isAvailable ? 1 : 0.8 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: slot.isAvailable ? "#1E1B4B" : "#6B7280" }}>{slot.startTime} - {slot.endTime}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: "#7C3AED", fontWeight: 700 }}>{slot.isRecurring ? "RECURRING" : "ONE-TIME"}</span>
                      {!slot.isAvailable && <span style={{ fontSize: 10, color: "#EF4444", fontWeight: 700 }}>● BOOKED</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSlot(slot.id)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 18 }}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </CardBox>
      </div>
    </div>
  );
}

function ChatView({ data, loading }) {
  const [activeConv, setActiveConv] = useState(null);
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = React.useRef(null);

  const patients = data?.patients || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const s = getSocket();
    setSocket(s);
  }, []);

  useEffect(() => {
    if (!activeConv || !socket) return;

    const initConv = async () => {
      try {
        const msgsRes = await api.getMessages(activeConv.id);
        setHistory(msgsRes.messages || []);
        setTimeout(scrollToBottom, 100);
        socket.emit("join_conversation", activeConv.id);
        socket.emit("mark_read", { conversationId: activeConv.id });
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };
    initConv();

    const handleNewMessage = (newMsg) => {
      if (newMsg.conversationId === activeConv.id) {
        setHistory(prev => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 100);
        // Mark as read immediately if we're in the chat
        socket.emit("mark_read", { conversationId: activeConv.id });
      }
    };

    const handleTyping = (data) => {
      if (data.conversationId === activeConv.id && data.userId !== api.getStoredUser().id) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing_status", handleTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing_status", handleTyping);
      socket.emit("leave_conversation", activeConv.id);
    };
  }, [activeConv, socket]);

  const selectPatient = async (patient) => {
    try {
      const res = await api.getConversations();
      const conv = res.conversations.find(c => c.patientId === patient.userId || c.patientId === patient.id);
      if (conv) {
        setActiveConv({ ...conv, patientName: formatName(patient.firstName, patient.lastName) });
      } else {
        // No conversation yet
        setActiveConv({ id: null, patientId: patient.userId || patient.id, patientName: formatName(patient.firstName, patient.lastName) });
        setHistory([]);
      }
    } catch (err) {
      console.error("Error selecting patient:", err);
    }
  };

  let typingTimeout = null;
  const handleTyping = (e) => {
    setMsg(e.target.value);
    if (socket && activeConv?.id) {
      socket.emit("typing", { conversationId: activeConv.id, isTyping: true });
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit("typing", { conversationId: activeConv.id, isTyping: false });
      }, 1500);
    }
  };

  const handleSend = async () => {
    if (!msg.trim() || !activeConv) return;
    try {
      if (socket && activeConv.id) {
        socket.emit("send_message", { conversationId: activeConv.id, content: msg });
      } else {
        const targetId = activeConv.patientId;
        await api.sendMessage(targetId, msg);
        // Refresh
        const res = await api.getConversations();
        const conv = res.conversations.find(c => c.patientId === targetId);
        if (conv) setActiveConv({ ...conv, patientName: activeConv.patientName });
      }
      setMsg("");
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div>
      <div style={staffStyles.pageTitle}>Chat with Patients</div>
      <div className="responsive-grid-280-1">
        {/* Left: Patient List */}
        <CardBox style={{ padding: "16px 0" }}>
          <div style={{ padding: "0 16px 12px", borderBottom: "1px solid #E5E1F8", fontWeight: 700, color: "#1E1B4B", fontSize: 13 }}>
            All Patients
          </div>
          <div className="mobile-chat-list" style={{ maxHeight: 500, overflowY: "auto" }}>
            {patients.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#9896B8", fontSize: 12 }}>No patients yet.</div>
            ) : (
              patients.map(p => {
                const isActive = activeConv?.patientId === (p.userId || p.id);
                return (
                  <div 
                    key={p.id} 
                    onClick={() => selectPatient(p)}
                    style={{
                      padding: "12px 16px", cursor: "pointer", transition: "0.2s",
                      background: isActive ? "#F5F3FF" : "transparent",
                      borderLeft: isActive ? "4px solid #7C3AED" : "4px solid transparent",
                      display: "flex", alignItems: "center", gap: 10
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7C3AED" }}>
                      {p.firstName[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#7C3AED" : "#1E1B4B" }}>{formatName(p.firstName, p.lastName)}</div>
                      <div style={{ fontSize: 10, color: "#9896B8" }}>{p.appointmentCount} sessions</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardBox>

        {/* Right: Chat Window */}
        <CardBox className="mobile-chat-window" style={{ display: "flex", flexDirection: "column", height: 600, padding: 0, overflow: "hidden" }}>
          {!activeConv ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9896B8", gap: 12 }}>
              <span style={{ fontSize: 40 }}>💬</span>
              <div style={{ fontWeight: 600 }}>Select a patient to start chatting</div>
            </div>
          ) : (
            <>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E1F8", background: "#F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#1E1B4B", fontSize: 15 }}>{activeConv.patientName}</div>
                  <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>● Online</div>
                </div>
                {activeConv.id && (
                  <button 
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this conversation?")) {
                        await api.deleteConversation(activeConv.id);
                        window.location.reload();
                      }
                    }}
                    style={{ background: "#FEE2E2", border: "none", color: "#EF4444", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    Delete Chat
                  </button>
                )}
              </div>

              <div style={{ flex: 1, padding: 20, overflowY: "auto", background: "#fff", display: "flex", flexDirection: "column", gap: 12 }}>
                {history.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#9896B8", fontSize: 12, marginTop: 40 }}>Send a message to start the conversation.</div>
                ) : (
                  history.map((m, i) => {
                    const isMe = m.senderId === api.getStoredUser().id;
                    return (
                      <div key={i} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                        <div style={{
                          padding: "10px 14px", borderRadius: 16, fontSize: 13, lineHeight: 1.5,
                          background: isMe ? "#7C3AED" : "#F3F4F6",
                          color: isMe ? "#fff" : "#374151",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}>
                          {m.content}
                        </div>
                        <div style={{ fontSize: 9, color: "#9896B8", marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && (
                  <div style={{ alignSelf: "flex-start", fontSize: 11, color: "#7C3AED", fontStyle: "italic" }}>
                    Patient is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: 20, borderTop: "1px solid #E5E1F8", background: "#F9FAFB" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={msg}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid #E5E1F8", outline: "none", fontSize: 14 }}
                  />
                  <button 
                    onClick={handleSend}
                    style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "0 24px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </CardBox>
      </div>
    </div>
  );
}

export default function PsychologistDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("schedule");
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [toast, setToast] = useState(null);
  
  // History Modal State
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientHistoryData, setPatientHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchDashboard = () => {
    api.getPsychologistDashboard(weekOffset)
      .then(data => {
        if (data && !data.error) setDashData(data);
        else console.error("Dashboard error:", data?.error);
      })
      .catch(err => console.error("Failed to fetch psychologist dashboard:", err))
      .finally(() => setLoading(false));

    api.getUnreadMessagesCount()
      .then(res => setUnreadMessages(res.count || 0))
      .catch(err => console.error("Failed to fetch unread count:", err));
  };

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on("message_notification", (data) => {
        // Only show toast if not currently in chat view
        if (active !== "chat") {
          setToast({ message: data.content });
        }
        fetchDashboard(); // Real-time badge update
      });
    }
    return () => {
      if (socket) socket.off("message_notification");
    };
  }, [active]);

  useEffect(() => {
    fetchDashboard();
    // Poll every 10 seconds for real-time feel
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, [weekOffset]); // Refetch when weekOffset changes

  const handleLogout = () => {
    api.clearSession();
    navigate("/login");
  };

  const user = api.getStoredUser();
  
  const fallbackName = formatName(user?.firstName, user?.lastName);
  
  const displayName = dashData?.psychologist 
    ? formatName(dashData.psychologist.firstName, dashData.psychologist.lastName)
    : fallbackName;
    
  const displaySpec = dashData?.psychologist?.specialization || user?.specialization || "Mental Wellness";

  const handleViewHistory = async (patientId) => {
    setSelectedPatientId(patientId);
    setHistoryLoading(true);
    try {
      const data = await api.getPatientIntakeForTherapist(patientId);
      setPatientHistoryData(data);
    } catch (err) {
      console.error("Failed to fetch patient history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const renderActiveView = () => {
    switch (active) {
      case "schedule": return <ScheduleView data={dashData} loading={loading} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />;
      case "availability": return <AvailabilityView />;
      case "patients": return <PatientsView data={dashData} loading={loading} onViewHistory={handleViewHistory} />;
      case "reports": return <ReportsView data={dashData} loading={loading} />;
      case "history": return <HistoryView data={dashData} loading={loading} />;
      case "notes": return <NotesView data={dashData} loading={loading} />;
      case "chat": return <ChatView data={dashData} loading={loading} />;
      default: return <ScheduleView data={dashData} loading={loading} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />;
    }
  };

  return (
    <PsychologistDashboardLayout
      menuItems={menuItems}
      activeKey={active}
      onMenuClick={setActive}
      onLogout={handleLogout}
      unreadMessages={unreadMessages}
      rightPanel={active === "schedule" ? <ScheduleRightPanel dashboardData={dashData} loading={loading} /> : null}
    >
      <div style={{
        borderRadius: 16,
        background: "linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)",
        padding: "20px 24px", marginBottom: 24,
        border: "1px solid #E5E1F8",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 12px rgba(124,58,237,0.05)"
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#7C3AED", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            ✦ Dashboard Overview
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E1B4B", margin: 0 }}>
            Welcome back, {displayName}
          </h1>
          <div style={{ fontSize: 13, color: "#4C4682", fontWeight: 600, marginTop: 4 }}>
            Specialization: <span style={{ color: "#7C3AED" }}>{displaySpec}</span>
          </div>
        </div>
      </div>
      {renderActiveView()}
      {toast && (
        <Toast 
          message={toast.message} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* ── PATIENT HISTORY MODAL ── */}
      {selectedPatientId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(30, 27, 75, 0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setSelectedPatientId(null)}>
          <div style={{
            width: "100%", maxWidth: 800, maxHeight: "90vh",
            background: "#fff", borderRadius: 24, overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            display: "flex", flexDirection: "column",
            animation: "modalFadeUp 0.3s ease-out"
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 28px", borderBottom: "1px solid #E5E1F8",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, #F5F3FF 0%, #fff 100%)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>📖</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#1E1B4B" }}>Patient Clinical History</div>
                  <div style={{ fontSize: 12, color: "#7C3AED", fontWeight: 700 }}>{patientHistoryData?.user ? `${patientHistoryData.user.firstName} ${patientHistoryData.user.lastName}` : "Loading..."}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatientId(null)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#9896B8" }}
              >×</button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
              {historyLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9896B8" }}>Loading patient history...</div>
              ) : !patientHistoryData || patientHistoryData.error ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#EF4444", fontWeight: 700 }}>
                  {patientHistoryData?.error || "No history records found for this patient yet."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* Personal Info */}
                  <section>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Personal Information</div>
                    <div className="responsive-grid-2">
                      <InfoItem label="Age" value={patientHistoryData.age} />
                      <InfoItem label="Gender" value={patientHistoryData.gender} />
                      <InfoItem label="Education" value={patientHistoryData.education} />
                      <InfoItem label="Occupation" value={patientHistoryData.occupation} />
                      <InfoItem label="Financial Status" value={patientHistoryData.financialCondition} />
                    </div>
                  </section>

                  {/* Family History */}
                  <section>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Family Background</div>
                    <div className="responsive-grid-2">
                      <InfoItem label="Parents" value={patientHistoryData.parentsStatus} />
                      <InfoItem label="Siblings" value={patientHistoryData.siblingsCount} />
                      <InfoItem label="Family Type" value={patientHistoryData.familyType} />
                      <InfoItem label="Marital Status" value={patientHistoryData.maritalStatus} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <InfoItem label="Living Arrangement" value={patientHistoryData.livingArrangement} fullWidth />
                    </div>
                  </section>

                  {/* Clinical History */}
                  <section>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Clinical History</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <InfoItem label="Past Trauma" value={patientHistoryData.pastTrauma} fullWidth />
                      <InfoItem label="Known Diagnoses" value={patientHistoryData.mentalHealthConditions} fullWidth />
                      <InfoItem label="Current Symptoms" value={patientHistoryData.currentSymptoms} fullWidth />
                      <InfoItem label="Medications" value={patientHistoryData.medications} fullWidth />
                      <InfoItem label="Previous Therapy" value={patientHistoryData.previousTherapy ? "Yes" : "No"} />
                      {patientHistoryData.previousTherapy && (
                        <InfoItem label="Prev Therapy Details" value={patientHistoryData.previousTherapyDetails} fullWidth />
                      )}
                    </div>
                  </section>

                  {/* Expectations */}
                  <section>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Therapy Goals & Expectations</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <InfoItem label="Main Concerns" value={patientHistoryData.mainConcerns} fullWidth />
                      <InfoItem label="Goals" value={patientHistoryData.therapyGoals} fullWidth />
                      <InfoItem label="Expectations" value={patientHistoryData.therapistExpectations} fullWidth />
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 28px", borderTop: "1px solid #E5E1F8", textAlign: "right", background: "#F9FAFB" }}>
              <button 
                onClick={() => setSelectedPatientId(null)}
                style={{ padding: "10px 24px", borderRadius: 10, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
              >Close Record</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </PsychologistDashboardLayout>
  );
}

function InfoItem({ label, value, fullWidth = false }) {
  return (
    <div style={{ gridColumn: fullWidth ? "span 2" : "span 1" }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#9896B8", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ 
        fontSize: 14, fontWeight: 600, color: "#1E1B4B", 
        background: "#F5F3FF", padding: "10px 14px", borderRadius: 8,
        border: "1px solid #E5E1F8", minHeight: 40
      }}>{value || "—"}</div>
    </div>
  );
}

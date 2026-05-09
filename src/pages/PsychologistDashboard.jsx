import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PsychologistDashboardLayout from "../components/layout/PsychologistDashboardLayout";
import CardBox from "../components/ui/CardBox";
import WeekCalendarGrid from "../components/ui/WeekCalendarGrid";
import ScheduleRightPanel from "../components/ui/ScheduleRightPanel";
import { staffStyles } from "../styles/staffDashboardStyles";
import * as api from "../api";

// Format names: remove hyphen, capitalize words
const formatName = (fName = "", lName = "") => {
  const cleanLast = lName === "-" ? "" : lName;
  const combined = `${fName} ${cleanLast}`.trim();
  return combined.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") || "User";
};

const menuItems = [
  { label: "My Schedule", key: "schedule", icon: "📅" },
  { label: "Patients", key: "patients", icon: "👥" },
  { label: "Progress Reports", key: "reports", icon: "📈" },
  { label: "Patient History", key: "history", icon: "📖" },
  { label: "Notes & Feedback", key: "notes", icon: "📝" },
  { label: "Chat with Patients", key: "chat", icon: "💬" },
];

function ScheduleView({ data, loading, weekOffset, setWeekOffset }) {
  if (loading && !data) return <div style={{ padding: 20, color: "#9896B8" }}>Loading schedule...</div>;
  const todaysAppts = data?.todaysAppointments || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CardBox>
        <WeekCalendarGrid 
          appointments={data?.weekAppointments || []} 
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
        />
      </CardBox>
      <CardBox>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 16 }}>
          Today&apos;s Appointments
        </div>
        {todaysAppts.length === 0 ? (
          <div style={{ color: "#9896B8", fontSize: 14, fontWeight: 600, padding: "20px 0", textAlign: "center" }}>
            📭 No appointments scheduled for today.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={staffStyles.tableHead}>
                <th style={staffStyles.tableCellLeft}>Patient</th>
                <th style={staffStyles.tableCellLeft}>Time</th>
                <th style={staffStyles.tableCellLeft}>Type</th>
                <th style={staffStyles.tableCellLeft}>Status</th>
              </tr>
            </thead>
            <tbody>
              {todaysAppts.map((appt, i) => {
                const patientName = formatName(appt.patient.firstName, appt.patient.lastName);
                const time = new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                const typeLabel = appt.sessionType === "VIDEO" ? "Video Call" : appt.sessionType === "AUDIO" ? "Phone" : "Chat";
                const isFirst = i === 0;
                return (
                  <tr key={appt.id} style={isFirst ? { background: "linear-gradient(135deg, #7C3AED, #8B5CF6)", color: "#fff" } : {}}>
                    <td style={{ ...staffStyles.tableCell, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{isFirst ? "👤" : <span style={{ color: "#9896B8" }}>👤</span>}</span>
                      {patientName}
                    </td>
                    <td style={staffStyles.tableCell}>{time}</td>
                    <td style={staffStyles.tableCell}>{typeLabel}</td>
                    <td style={staffStyles.tableCell}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: appt.status === "CONFIRMED" ? "#D1FAE5" : "#FEF3C7",
                        color: appt.status === "CONFIRMED" ? "#065F46" : "#92400E",
                      }}>{appt.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardBox>
    </div>
  );
}

function PatientsView({ data, loading }) {
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
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
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading notes...</div>;
  const notes = data?.appointmentNotes || [];

  return (
    <div>
      <div style={staffStyles.pageTitle}>Notes & Feedback</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Session Notes ({notes.length})</div>
        {notes.length === 0 ? (
          <div style={{ color: "#9896B8", fontSize: 14, fontWeight: 600, padding: "20px 0", textAlign: "center" }}>
            📝 No notes or feedback yet. Notes will appear here after sessions.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notes.map(n => (
              <div key={n.id} style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid #E5E1F8", background: "#F5F3FF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "#1E1B4B", fontSize: 13 }}>
                    {formatName(n.appointment?.patient?.firstName, n.appointment?.patient?.lastName)}
                  </span>
                  <span style={{ fontSize: 11, color: "#9896B8" }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 13, color: "#4C4682", fontWeight: 500 }}>{n.content}</div>
                <div style={{ fontSize: 11, color: "#9896B8", marginTop: 4 }}>By: {n.author.firstName} {n.author.lastName}</div>
              </div>
            ))}
          </div>
        )}
      </CardBox>
    </div>
  );
}

function ChatView({ data, loading }) {
  const [msg, setMsg] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [history, setHistory] = React.useState([]);
  const [convLoading, setConvLoading] = React.useState(false);

  const patients = data?.patients || [];
  const recentPatient = patients.length > 0 ? patients[0] : null;

  useEffect(() => {
    if (!recentPatient) return;
    const fetchHistory = async () => {
      try {
        const res = await api.getConversations();
        const conv = res.conversations.find(c => c.patientId === recentPatient.userId || c.patientId === recentPatient.id);
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
  }, [recentPatient]);

  const handleSend = async () => {
    if (!msg.trim() || !recentPatient) return;
    try {
      const targetUserId = recentPatient.userId || recentPatient.id;
      const res = await api.sendMessage(targetUserId, msg);
      setHistory(prev => [...prev, { ...res.message, sender: { firstName: "You", lastName: "" } }]);
      setMsg("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div>
      <div style={staffStyles.pageTitle}>Chat with Patients</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Recent Patients</div>
        {!recentPatient ? (
          <div style={{ color: "#9896B8", fontSize: 14, fontWeight: 600, padding: "20px 0", textAlign: "center" }}>
            💬 No patients to chat with yet. Patients will appear here after booking.
          </div>
        ) : (
          <div style={{ background: "#EDE9FE", borderRadius: 8, padding: 16 }}>
            <div style={{ color: "#7C3AED", fontWeight: 700, marginBottom: 8 }}>
              {formatName(recentPatient.firstName, recentPatient.lastName)}
              <span style={{ color: "#10B981", fontWeight: 700, fontSize: 12, marginLeft: 8 }}>Recent Contact</span>
            </div>
            <div style={{ color: "#4C4682", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
              {recentPatient.appointmentCount} session{recentPatient.appointmentCount !== 1 ? "s" : ""} booked
            </div>

            {/* History Window */}
            <div style={{ 
              height: 200, overflowY: "auto", background: "#fff", 
              borderRadius: 8, padding: 12, marginBottom: 12, 
              border: "1px solid #E5E1F8", display: "flex", flexDirection: "column", gap: 8
            }}>
              {history.length === 0 ? (
                <div style={{ color: "#9896B8", fontSize: 12, textAlign: "center", marginTop: 80 }}>No messages yet.</div>
              ) : (
                history.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.senderId === (recentPatient.userId || recentPatient.id) ? "flex-start" : "flex-end" }}>
                    <div style={{ 
                      padding: "6px 12px", borderRadius: 12, fontSize: 13,
                      background: m.senderId === (recentPatient.userId || recentPatient.id) ? "#F3F4F6" : "#7C3AED",
                      color: m.senderId === (recentPatient.userId || recentPatient.id) ? "#374151" : "#fff"
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <input 
              type="text" 
              placeholder="Type a message..." 
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #E5E1F8", marginBottom: 12, fontSize: 14, boxSizing: "border-box" }} 
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button 
                onClick={handleSend}
                style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
              >
                Send Message
              </button>
              {sent && <span style={{ color: "#10B981", fontSize: 12, fontWeight: 700 }}>✓ Message Sent</span>}
            </div>
          </div>
        )}
        {patients.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9896B8", marginBottom: 8, textTransform: "uppercase" }}>All Patients</div>
            {patients.slice(1).map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #E5E1F8" }}>
                <span style={{ fontSize: 16 }}>👤</span>
                <span style={{ fontWeight: 600, color: "#4C4682", fontSize: 14 }}>{formatName(p.firstName, p.lastName)}</span>
                <span style={{ fontSize: 11, color: "#9896B8" }}>{p.appointmentCount} session{p.appointmentCount !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        )}
      </CardBox>
    </div>
  );
}

export default function PsychologistDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("schedule");
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const fetchDashboard = () => {
    api.getPsychologistDashboard(weekOffset)
      .then(data => {
        if (data && !data.error) setDashData(data);
        else console.error("Dashboard error:", data?.error);
      })
      .catch(err => console.error("Failed to fetch psychologist dashboard:", err))
      .finally(() => setLoading(false));
  };

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

  const views = {
    schedule: () => <ScheduleView data={dashData} loading={loading} weekOffset={weekOffset} setWeekOffset={setWeekOffset} />,
    patients: () => <PatientsView data={dashData} loading={loading} />,
    reports: () => <ReportsView data={dashData} loading={loading} />,
    history: () => <HistoryView data={dashData} loading={loading} />,
    notes: () => <NotesView data={dashData} loading={loading} />,
    chat: () => <ChatView data={dashData} loading={loading} />,
  };

  const user = api.getStoredUser();
  
  const fallbackName = formatName(user?.firstName, user?.lastName);
  
  const displayName = dashData?.psychologist 
    ? formatName(dashData.psychologist.firstName, dashData.psychologist.lastName)
    : fallbackName;
    
  const displaySpec = dashData?.psychologist?.specialization || user?.specialization || "Mental Wellness";

  const ActiveView = views[active] || views.schedule;

  return (
    <PsychologistDashboardLayout
      menuItems={menuItems}
      activeKey={active}
      onMenuClick={setActive}
      onLogout={handleLogout}
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
      <ActiveView />
    </PsychologistDashboardLayout>
  );
}

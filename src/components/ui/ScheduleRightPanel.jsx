import React, { useState } from "react";
import CardBox from "./CardBox";
import MoodTrendChart from "./MoodTrendChart";
import MoodBarChart from "./MoodBarChart";
import { staffStyles } from "../../styles/staffDashboardStyles";

/**
 * Right panel for Psychologist Schedule view.
 * Accepts dashboardData prop with real data from API.
 */
export default function ScheduleRightPanel({ dashboardData, loading }) {
  const [message, setMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  const data = dashboardData || {};
  const patients = data.patients || [];
  const stats = data.stats || {};
  const todaysAppts = data.todaysAppointments || [];
  const recentPatient = patients.length > 0 ? patients[0] : null;

  // Evaluate patients to find urgent cases based on real mood logs
  let urgentPatientObj = null;
  let urgentReason = "";
  let urgentChartData = [];
  const HIGH_RISK_TAGS = ["Stressed", "Lonely", "Sleepless", "Crying", "Overwhelmed", "Anxious", "Sad", "Panic", "Depression", "Tired"];

  for (const patient of patients) {
    if (!patient.moodLogs || patient.moodLogs.length === 0) continue;

    // Sort by most recent
    const logs = [...patient.moodLogs].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
    const recentLog = logs[0];
    
    let isUrgent = false;
    let reason = "";

    // Criteria 1: Score <= 2
    if (recentLog.score <= 2) {
      isUrgent = true;
      reason = `Severe mood score detected (${recentLog.label}).`;
    } 
    // Criteria 2: High risk tags
    else if (recentLog.tags && recentLog.tags.some(tag => HIGH_RISK_TAGS.includes(tag))) {
      isUrgent = true;
      const foundTags = recentLog.tags.filter(t => HIGH_RISK_TAGS.includes(t)).join(", ");
      reason = `High-risk patterns detected: ${foundTags}.`;
    }
    // Criteria 3: Sharp drop in mood (if they have > 1 log)
    else if (logs.length > 1) {
      if (logs[1].score >= 5 && recentLog.score <= 3) {
         isUrgent = true;
         reason = "Sharp decline in mood score over recent days.";
      }
    }

    if (isUrgent) {
      urgentPatientObj = patient;
      urgentReason = reason;
      
      // Prepare chart data for the week (map scores 1-7 to 0-100)
      // Reverse so chronological order (oldest first)
      urgentChartData = logs.slice(0, 7).reverse().map(l => ({
         day: new Date(l.loggedAt).toLocaleDateString("en-US", { weekday: "short" }),
         value: Math.round((l.score / 7) * 100)
      }));
      break; // Found one, we can stop for the "Urgent Case" panel
    }
  }

  const formatName = (fName = "", lName = "") => {
    const cleanLast = lName === "-" ? "" : lName;
    const combined = `${fName} ${cleanLast}`.trim();
    return combined.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") || "User";
  };

  const urgentPatientName = urgentPatientObj
    ? formatName(urgentPatientObj.firstName, urgentPatientObj.lastName)
    : null;
  const urgentStatus = urgentPatientObj 
    ? todaysAppts.find(a => a.patient.id === urgentPatientObj.id)?.status
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Today's Appointments */}
      <CardBox style={{ marginBottom: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 16 }}>
          Today's Appointments
        </div>
        {todaysAppts.length === 0 ? (
          <div style={{ color: "#9896B8", fontSize: 14, fontWeight: 600, padding: "20px 0", textAlign: "center" }}>
            📭 No appointments scheduled for today.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 300 }}>
              <thead>
                <tr style={staffStyles.tableHead}>
                  <th style={staffStyles.tableCellLeft}>Patient</th>
                  <th style={staffStyles.tableCellLeft}>Time</th>
                  <th style={staffStyles.tableCellLeft}>Action</th>
                </tr>
              </thead>
              <tbody>
                {todaysAppts.map((appt, i) => {
                  const patientName = formatName(appt.patient.firstName, appt.patient.lastName);
                  const time = new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                  const isFirst = i === 0;
                  
                  const diffMins = (new Date(appt.scheduledAt) - new Date()) / 60000;
                  const hasLink = !!appt.meetingLink;
                  const isJoinableNow = hasLink && appt.status !== "COMPLETED" && appt.status !== "CANCELLED" && diffMins <= 15 && diffMins >= -(appt.durationMins || 50);

                  return (
                    <tr key={appt.id} style={isFirst ? { background: "linear-gradient(135deg, #7C3AED, #8B5CF6)", color: "#fff" } : {}}>
                      <td style={{ ...staffStyles.tableCell, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <span style={{ fontSize: 14 }}>{isFirst ? "👤" : <span style={{ color: "#9896B8" }}>👤</span>}</span>
                        {patientName}
                      </td>
                      <td style={{ ...staffStyles.tableCell, fontSize: 12 }}>{time}</td>
                      <td style={staffStyles.tableCell}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {isJoinableNow ? (
                            <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", padding: "4px 10px", borderRadius: 6, background: isFirst ? "#fff" : "#7C3AED", color: isFirst ? "#7C3AED" : "#fff", fontSize: 10, fontWeight: 800, animation: "pulse 2s infinite", whiteSpace: "nowrap" }}>Join ▶</a>
                          ) : appt.status === "COMPLETED" ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: isFirst ? "#fff" : "#10B981" }}>Completed</span>
                          ) : appt.status === "CANCELLED" ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: isFirst ? "#FCA5A5" : "#EF4444" }}>Cancelled</span>
                          ) : (hasLink && appt.status === "CONFIRMED" && (
                            <button disabled style={{ padding: "4px 8px", borderRadius: 6, background: isFirst ? "rgba(255,255,255,0.2)" : "#F3F4F6", color: isFirst ? "#fff" : "#9CA3AF", fontSize: 10, fontWeight: 700, border: "none", cursor: "not-allowed", whiteSpace: "nowrap" }} title="Link will activate 15 minutes before the session starts">Wait</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardBox>



      {/* Automated Patient History */}
      <CardBox style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 700, fontSize: 16, color: "#1E1B4B" }}>
          <span style={{ fontSize: 16 }}>✓</span>
          Automated Patient History
        </div>
        
        {(() => {
          const targetPatient = urgentPatientObj || recentPatient;
          if (!targetPatient) {
             return <div style={{ color: "#9896B8", fontSize: 13, fontWeight: 600 }}>No patient history available yet.</div>;
          }
          
          const moodsCount = targetPatient.moodLogs?.length || 0;
          const notesCount = data.appointmentNotes?.filter(n => n.appointment?.patient?.id === targetPatient.id).length || 0;
          const patientName = `${targetPatient.firstName} ${targetPatient.lastName === "-" ? "" : targetPatient.lastName}`.trim();
          
          return (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#7C3AED", marginBottom: 8, textTransform: "uppercase" }}>
                Records for {patientName}
              </div>
              <ul style={{ color: "#4C4682", fontWeight: 600, fontSize: 14, paddingLeft: 16, margin: 0 }}>
                <li>{moodsCount} Past Mood{moodsCount === 1 ? '' : 's'} Logged</li>
                <li>{notesCount} Therapy Note{notesCount === 1 ? '' : 's'}</li>
                <li>0 Diagnoses (Pending Evaluation)</li>
                <li>0 Active Medications</li>
              </ul>
              <div style={{ background: "#FEF3C7", borderRadius: 8, padding: 12, marginTop: 12, display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📄</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#92400E" }}>
                  History automatically transferred from patient app.
                </span>
              </div>
            </>
          );
        })()}
      </CardBox>
    </div>
  );
}

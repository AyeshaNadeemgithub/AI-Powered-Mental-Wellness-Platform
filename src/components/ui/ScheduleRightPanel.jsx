import React, { useState } from "react";
import CardBox from "./CardBox";
import MoodTrendChart from "./MoodTrendChart";
import MoodBarChart from "./MoodBarChart";

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
      {/* Urgent Cases */}
      <CardBox style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontWeight: 700, fontSize: 16, color: "#1E1B4B" }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          Urgent Cases
        </div>
        {urgentPatientName ? (
          <div style={{ background: "#FFF0F6", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "#1E1B4B", fontSize: 14 }}>{urgentPatientName}</span>
              {urgentStatus && (
                <span style={{ background: "#EDE9FE", color: "#7C3AED", borderRadius: 6, padding: "2px 8px", fontWeight: 700, fontSize: 11 }}>
                  {urgentStatus}
                </span>
              )}
            </div>
            <div style={{ color: "#9896B8", fontWeight: 500, fontSize: 13, marginBottom: 12 }}>
              Recent Mood Trend Anomalies
            </div>
            <MoodTrendChart data={urgentChartData} />
            <div style={{ marginTop: 12, padding: 10, background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>⚡</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#EF4444" }}>Critical Alert</span>
              </div>
              <span style={{ fontSize: 12, color: "#4C4682" }}>
                {urgentReason}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ color: "#9896B8", fontSize: 14, fontWeight: 600, padding: "16px 0", textAlign: "center" }}>
            ✅ No urgent cases at this time.
          </div>
        )}
      </CardBox>

      {/* Patient Overview */}
      <CardBox style={{ marginBottom: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#1E1B4B", marginBottom: 12 }}>
          Patient Overview
        </div>
        <ul style={{ color: "#4C4682", fontWeight: 600, fontSize: 14, paddingLeft: 16, margin: 0 }}>
          <li>Total patients: {stats.totalPatients || 0}</li>
          <li>Completed sessions: {stats.completedSessions || 0}</li>
          <li>Pending sessions: {stats.pendingSessions || 0}</li>
          <li>Confirmed sessions: {stats.confirmedSessions || 0}</li>
        </ul>
        <MoodBarChart />
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

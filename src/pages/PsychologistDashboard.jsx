import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PsychologistDashboardLayout from "../components/layout/PsychologistDashboardLayout";
import CardBox from "../components/ui/CardBox";
import WeekCalendarGrid from "../components/ui/WeekCalendarGrid";
import ScheduleRightPanel from "../components/ui/ScheduleRightPanel";
import { staffStyles } from "../styles/staffDashboardStyles";

const menuItems = [
  { label: "My Schedule", key: "schedule", icon: "📅" },
  { label: "Patients", key: "patients", icon: "👥" },
  { label: "Progress Reports", key: "reports", icon: "📈" },
  { label: "Patient History", key: "history", icon: "📖" },
  { label: "Notes & Feedback", key: "notes", icon: "📝" },
  { label: "Chat with Patients", key: "chat", icon: "💬" },
];

function ScheduleView() {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <CardBox>
          <WeekCalendarGrid />
        </CardBox>
        <CardBox>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "#1E1B4B",
              marginBottom: 16,
            }}
          >
            Today&apos;s Appointments
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={staffStyles.tableHead}>
                <th style={staffStyles.tableCellLeft}>Patient</th>
                <th style={staffStyles.tableCellLeft}>Time</th>
                <th style={staffStyles.tableCellLeft}>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
                  color: "#fff",
                }}
              >
                <td
                  style={{
                    ...staffStyles.tableCell,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>👤</span> J. Chen
                </td>
                <td style={staffStyles.tableCell}>10:30 AM</td>
                <td style={staffStyles.tableCell}>Video/Chat</td>
              </tr>
              <tr>
                <td
                  style={{
                    ...staffStyles.tableCell,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#9896B8" }}>👤</span> M. Davies
                </td>
                <td style={staffStyles.tableCell}>10:30 AM</td>
                <td style={staffStyles.tableCell}>Video/Chat</td>
              </tr>
              <tr>
                <td
                  style={{
                    ...staffStyles.tableCell,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#9896B8" }}>👤</span> V. James
                </td>
                <td style={staffStyles.tableCell}>1:00 PM</td>
                <td style={staffStyles.tableCell}>Video/Chat</td>
              </tr>
              <tr>
                <td
                  style={{
                    ...staffStyles.tableCell,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#9896B8" }}>👤</span> Sarah L.
                </td>
                <td style={staffStyles.tableCell}>2:00 PM</td>
                <td style={staffStyles.tableCell}>Video/Chat</td>
              </tr>
            </tbody>
          </table>
        </CardBox>
      </div>
    </>
  );
}

function PatientsView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Patients</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Patient List</div>
        <ul style={staffStyles.listText}>
          <li>J. Chen</li>
          <li>M. Davies</li>
          <li>V. James</li>
          <li>Sarah L.</li>
        </ul>
      </CardBox>
    </div>
  );
}

function ReportsView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Progress Reports</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Reports</div>
        <ul style={staffStyles.listText}>
          <li>J. Chen: Mood improved</li>
          <li>M. Davies: Therapy ongoing</li>
          <li>V. James: New diagnosis</li>
        </ul>
      </CardBox>
    </div>
  );
}

function HistoryView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Patient History</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>History</div>
        <ul style={staffStyles.listText}>
          <li>Past Moods</li>
          <li>Diagnoses</li>
          <li>Therapy Notes</li>
          <li>Medication</li>
        </ul>
        <div
          style={{
            background: "#FEF3C7",
            borderRadius: 8,
            padding: 12,
            marginTop: 12,
            color: "#92400E",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          History transferred. No need to repeat trauma multiple times.
        </div>
      </CardBox>
    </div>
  );
}

function NotesView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Notes & Feedback</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Feedback</div>
        <ul style={staffStyles.listText}>
          <li>Sarah L.: &quot;Very helpful session!&quot;</li>
          <li>J. Chen: &quot;Mood tracking is great.&quot;</li>
        </ul>
      </CardBox>
    </div>
  );
}

function ChatView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Chat with Patients</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Active Chat</div>
        <div
          style={{
            background: "#EDE9FE",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ color: "#7C3AED", fontWeight: 700, marginBottom: 8 }}>
            Sarah L.{" "}
            <span
              style={{
                color: "#10B981",
                fontWeight: 700,
                fontSize: 12,
                marginLeft: 8,
              }}
            >
              Recent Contact
            </span>
          </div>
          <div
            style={{
              color: "#4C4682",
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            How are you feeling today?
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #E5E1F8",
              marginBottom: 12,
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                background: "#7C3AED",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Send Feedback
            </button>
            <button
              style={{
                background: "#7C3AED",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Send Message
            </button>
          </div>
        </div>
      </CardBox>
    </div>
  );
}

const views = {
  schedule: ScheduleView,
  patients: PatientsView,
  reports: ReportsView,
  history: HistoryView,
  notes: NotesView,
  chat: ChatView,
};

export default function PsychologistDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("schedule");
  const ActiveView = views[active];
  const handleLogout = () => navigate("/login");

  return (
    <PsychologistDashboardLayout
      menuItems={menuItems}
      activeKey={active}
      onMenuClick={setActive}
      onLogout={handleLogout}
      rightPanel={active === "schedule" ? <ScheduleRightPanel /> : null}
    >
      <ActiveView />
    </PsychologistDashboardLayout>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../components/layout/AdminDashboardLayout";
import StatCard from "../components/ui/StatCard";
import CardBox from "../components/ui/CardBox";
import SystemHealthChart from "../components/ui/SystemHealthChart";
import { staffStyles } from "../styles/staffDashboardStyles";

const menuItems = [
  { label: "Overview", key: "overview", icon: "🏠" },
  { label: "User Management", key: "users", icon: "👥" },
  { label: "Platform Data", key: "data", icon: "📊" },
  { label: "Content & Features", key: "features", icon: "🧩" },
  { label: "System Logs", key: "logs", icon: "📝" },
  { label: "Support", key: "support", icon: "❓" },
];

function OverviewView() {
  return (
    <div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 28,
          color: "#1E1B4B",
          marginBottom: 24,
        }}
      >
        Platform Overview
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="TOTAL USERS"
          value="71,015"
          subtext="+2.4% this week"
          accentColor="#7C3AED"
          subtextIcon="arrow"
        />
        <StatCard
          label="ACTIVE PATIENTS"
          value="24"
          subtext="Stable"
          accentColor="#7C3AED"
          subtextColor="#F59E0B"
        />
        <StatCard
          label="ASSIGNED THERAPISTS"
          value="33"
          subtext="+1 new"
          accentColor="#7C3AED"
          subtextIcon="arrow"
        />
        <StatCard
          label="MOOD LOGS"
          value="1,526"
          subtext="120 today"
          accentColor="#7C3AED"
          subtextIcon="arrow"
          subtextColor="#10B981"
        />
        <StatCard
          label="REPORTED ISSUES"
          value="2"
          subtext="Needs review"
          accentColor="#7C3AED"
          subtextIcon="warning"
        />
        <StatCard
          label="PLATFORM UPTIME"
          value="99.8%"
          subtext="Healthy"
          accentColor="#7C3AED"
          subtextIcon="check"
          subtextColor="#10B981"
        />
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <CardBox style={{ flex: 2 }}>
          <div style={staffStyles.sectionTitle}>System Health (24h)</div>
          <SystemHealthChart />
        </CardBox>
        <CardBox style={{ flex: 1 }}>
          <div
            style={{
              ...staffStyles.sectionTitle,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>⚠️</span>
            Critical Alerts
          </div>
          <div
            style={{
              background: "#FFF0F6",
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#EF4444",
                flexShrink: 0,
                marginTop: 6,
              }}
            />
            <div>
              <div style={{ color: "#1E1B4B", fontWeight: 700, fontSize: 14 }}>
                History Transfer Error
              </div>
              <div
                style={{ color: "#9896B8", fontWeight: 500, fontSize: 12 }}
              >
                Transfer database error escalating.
              </div>
            </div>
          </div>
          <div
            style={{
              background: "#FFF7ED",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#F59E0B",
                flexShrink: 0,
                marginTop: 6,
              }}
            />
            <div>
              <div style={{ color: "#1E1B4B", fontWeight: 700, fontSize: 14 }}>
                Mood graph service down
              </div>
              <div
                style={{ color: "#9896B8", fontWeight: 500, fontSize: 12 }}
              >
                Mood graph problem is escalated.
              </div>
            </div>
          </div>
        </CardBox>
      </div>
      <CardBox style={{ marginTop: 24 }}>
        <div style={staffStyles.sectionTitle}>Quick Audit Trail</div>
        <ul style={{ ...staffStyles.listText, paddingLeft: 20, listStyle: "disc" }}>
          <li>Admin action actions - 2 hours ago</li>
          <li>Admin action actions - 2 hours ago</li>
          <li>Admin action actions - 3 hours ago</li>
          <li>Admin action actions - 2 hours ago</li>
        </ul>
      </CardBox>
    </div>
  );
}

function UsersView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>User Management</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>User List</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={staffStyles.tableHead}>
              <th style={staffStyles.tableCellLeft}>Name</th>
              <th style={staffStyles.tableCellLeft}>Role</th>
              <th style={staffStyles.tableCellLeft}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={staffStyles.tableCell}>Sarah L.</td>
              <td style={staffStyles.tableCell}>Patient</td>
              <td style={{ ...staffStyles.tableCell, color: "#10B981" }}>
                Active
              </td>
            </tr>
            <tr>
              <td style={staffStyles.tableCell}>J. Chen</td>
              <td style={staffStyles.tableCell}>Patient</td>
              <td style={{ ...staffStyles.tableCell, color: "#F59E0B" }}>
                Pending
              </td>
            </tr>
            <tr>
              <td style={staffStyles.tableCell}>M. Davies</td>
              <td style={staffStyles.tableCell}>Therapist</td>
              <td style={{ ...staffStyles.tableCell, color: "#10B981" }}>
                Active
              </td>
            </tr>
          </tbody>
        </table>
      </CardBox>
    </div>
  );
}

function DataView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Platform Data</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Stats</div>
        <ul style={staffStyles.listText}>
          <li>Mood logs: 1,526 (+120 today)</li>
          <li>Platform uptime: 99.8% (Healthy)</li>
          <li>Active patients: 24</li>
          <li>Assigned therapists: 33</li>
        </ul>
      </CardBox>
    </div>
  );
}

function FeaturesView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Content & Features</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Features List</div>
        <ul style={staffStyles.listText}>
          <li>CBT Bot</li>
          <li>Journal</li>
          <li>Mood Tracking</li>
          <li>Appointments</li>
        </ul>
      </CardBox>
    </div>
  );
}

function LogsView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>System Logs</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Recent Logs</div>
        <ul style={staffStyles.listText}>
          <li>[12:01] User Sarah L. logged in</li>
          <li>[12:03] Mood log updated</li>
          <li>[12:05] Therapist M. Davies assigned</li>
        </ul>
      </CardBox>
    </div>
  );
}

function SupportView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Support</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Contact Support</div>
        <div style={staffStyles.listText}>Email: support@calmmind.com</div>
        <div style={staffStyles.listText}>Phone: +92 214 5415487</div>
      </CardBox>
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <div style={staffStyles.pageTitle}>Admin Settings</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>Configuration</div>
        <ul style={staffStyles.listText}>
          <li>Platform settings</li>
          <li>Security options</li>
          <li>Notification preferences</li>
        </ul>
      </CardBox>
    </div>
  );
}

const views = {
  overview: OverviewView,
  users: UsersView,
  data: DataView,
  features: FeaturesView,
  logs: LogsView,
  support: SupportView,
  settings: SettingsView,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const ActiveView = views[active] || OverviewView;
  const handleLogout = () => navigate("/login");

  return (
    <AdminDashboardLayout
      menuItems={menuItems}
      activeKey={active}
      onMenuClick={setActive}
      onLogout={handleLogout}
    >
      <ActiveView />
    </AdminDashboardLayout>
  );
}

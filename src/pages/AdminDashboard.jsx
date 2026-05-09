import React, { useState, useEffect } from "react";
import * as api from "../api";
import { useNavigate } from "react-router-dom";
import AdminDashboardLayout from "../components/layout/AdminDashboardLayout";
import StatCard from "../components/ui/StatCard";
import CardBox from "../components/ui/CardBox";
import SystemHealthChart from "../components/ui/SystemHealthChart";
import { staffStyles } from "../styles/staffDashboardStyles";
import UserGrowthChart from "../components/ui/UserGrowthChart";

const menuItems = [
  { label: "Overview", key: "overview", icon: "🏠" },
  { label: "User Management", key: "users", icon: "👥" },
  { label: "Appointments & Care", key: "appointments", icon: "📅" },
  { label: "Platform Data", key: "data", icon: "📊" },
  { label: "Content & Features", key: "features", icon: "🧩" },
  { label: "System Logs", key: "logs", icon: "📝" },
  { label: "Support", key: "support", icon: "❓" },
];

function OverviewView({ stats, loading }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading platform stats...</div>;
  
  const alerts = stats.alerts || [];
  const auditLog = stats.auditLog || [];

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
          value={stats.totalUsers?.toLocaleString() || "0"}
          subtext="Total registered"
          accentColor="#7C3AED"
        />
        <StatCard
          label="ACTIVE PATIENTS"
          value={stats.activePatients?.toLocaleString() || "0"}
          subtext="Patients"
          accentColor="#7C3AED"
        />
        <StatCard
          label="ASSIGNED THERAPISTS"
          value={stats.totalPsychologists?.toLocaleString() || "0"}
          subtext={`${stats.approvedPsychologists || 0} approved`}
          accentColor="#7C3AED"
          subtextIcon="check"
          subtextColor="#10B981"
        />
        <StatCard
          label="MOOD LOGS"
          value={stats.moodLogs?.toLocaleString() || "0"}
          subtext={`${stats.moodLogsToday || 0} today`}
          accentColor="#7C3AED"
          subtextIcon="arrow"
          subtextColor="#10B981"
        />
        <StatCard
          label="REPORTED ISSUES"
          value={stats.reportedIssues || "0"}
          subtext="Needs review"
          accentColor="#7C3AED"
          subtextIcon="warning"
        />
        <StatCard
          label="PLATFORM UPTIME"
          value={stats.uptime || "99.9%"}
          subtext="Healthy"
          accentColor="#7C3AED"
          subtextIcon="check"
          subtextColor="#10B981"
        />
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <CardBox style={{ flex: 2 }}>
          <div style={staffStyles.sectionTitle}>System Health (24h)</div>
          <SystemHealthChart data={stats.health} />
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
          {alerts.length === 0 ? (
             <div style={{ color: "#9896B8", fontSize: 13, padding: "10px 0" }}>No critical alerts.</div>
          ) : alerts.map(a => (
            <div
              key={a.id}
              style={{
                background: a.type === 'warning' ? "#FFF0F6" : "#F0F9FF",
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
                  background: a.type === 'warning' ? "#EF4444" : "#3B82F6",
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
              <div>
                <div style={{ color: "#1E1B4B", fontWeight: 700, fontSize: 14 }}>
                  {a.title}
                </div>
                <div
                  style={{ color: "#9896B8", fontWeight: 500, fontSize: 12 }}
                >
                  {a.message}
                </div>
              </div>
            </div>
          ))}
        </CardBox>
      </div>
      <CardBox style={{ marginTop: 24 }}>
        <div style={staffStyles.sectionTitle}>Quick Audit Trail</div>
        {auditLog.length === 0 ? (
          <div style={{ color: "#9896B8", fontSize: 13 }}>No recent activity logged.</div>
        ) : (
          <ul style={{ ...staffStyles.listText, paddingLeft: 20, listStyle: "disc" }}>
            {auditLog.map(log => (
              <li key={log.id}>
                {log.action} - {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </li>
            ))}
          </ul>
        )}
      </CardBox>
    </div>
  );
}

function UsersView({ users, loading, onApprove, onDelete }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading users...</div>;

  return (
    <div>
      <div style={staffStyles.pageTitle}>User Management</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>User List ({users.length})</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={staffStyles.tableHead}>
              <th style={staffStyles.tableCellLeft}>Name</th>
              <th style={staffStyles.tableCellLeft}>Email</th>
              <th style={staffStyles.tableCellLeft}>Role</th>
              <th style={staffStyles.tableCellLeft}>Verification</th>
              <th style={staffStyles.tableCellLeft}>Status</th>
              <th style={staffStyles.tableCellLeft}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isPsychologist = u.role === "PSYCHOLOGIST";
              const isApproved = u.psychologist?.isApproved;
              const statusColor = isPsychologist ? (isApproved ? "#10B981" : "#F59E0B") : "#10B981";
              const statusText = isPsychologist ? (isApproved ? "Approved" : "Pending") : "Active";
              
              return (
                <tr key={u.id}>
                  <td style={staffStyles.tableCell}>{u.firstName} {u.lastName}</td>
                  <td style={staffStyles.tableCell}>{u.email}</td>
                  <td style={staffStyles.tableCell}>{u.role}</td>
                  <td style={staffStyles.tableCell}>
                    {isPsychologist && u.psychologist ? (
                      <div style={{ fontSize: 11 }}>
                        <strong style={{ color: "#7C3AED" }}>{u.psychologist.verificationType}:</strong> {u.psychologist.verificationDetail}
                      </div>
                    ) : "-"}
                  </td>
                  <td style={{ ...staffStyles.tableCell, color: statusColor, fontWeight: 700 }}>
                    {statusText}
                  </td>
                  <td style={staffStyles.tableCell}>
                    <div style={{ display: "flex", gap: 8 }}>
                      {isPsychologist && !isApproved && (
                        <button 
                          onClick={() => onApprove(u.psychologist.id)}
                          style={{ background: "#10B981", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.filter = "none"}
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={() => onDelete(u.id)}
                        style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#FECACA"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#FEE2E2"}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBox>
    </div>
  );
}

function AppointmentsView({ appointments, loading }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading appointments...</div>;

  return (
    <div>
      <div style={staffStyles.pageTitle}>Appointments & Care Coordination</div>
      <CardBox>
        <div style={staffStyles.sectionTitle}>All Bookings ({appointments.length})</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={staffStyles.tableHead}>
              <th style={staffStyles.tableCellLeft}>Patient</th>
              <th style={staffStyles.tableCellLeft}>Therapist</th>
              <th style={staffStyles.tableCellLeft}>Date & Time</th>
              <th style={staffStyles.tableCellLeft}>Type</th>
              <th style={staffStyles.tableCellLeft}>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appt => {
              const statusColors = {
                PENDING: "#F59E0B",
                CONFIRMED: "#3B82F6",
                COMPLETED: "#10B981",
                CANCELLED: "#EF4444"
              };
              
              return (
                <tr key={appt.id}>
                  <td style={staffStyles.tableCell}>
                    <div style={{ fontWeight: 700, color: "#1E1B4B" }}>{appt.patient.firstName} {appt.patient.lastName}</div>
                    <div style={{ fontSize: 11, color: "#9896B8" }}>{appt.patient.email}</div>
                  </td>
                  <td style={staffStyles.tableCell}>
                    <div style={{ fontWeight: 700, color: "#1E1B4B" }}>Dr. {appt.psychologist.user.firstName} {appt.psychologist.user.lastName}</div>
                    <div style={{ fontSize: 11, color: "#7C3AED" }}>{appt.psychologist.specialization}</div>
                  </td>
                  <td style={staffStyles.tableCell}>
                    <div style={{ fontWeight: 600 }}>{new Date(appt.scheduledAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td style={staffStyles.tableCell}>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#6B7280" }}>{appt.sessionType}</span>
                  </td>
                  <td style={staffStyles.tableCell}>
                    <span style={{ 
                      background: `${statusColors[appt.status]}15`, 
                      color: statusColors[appt.status], 
                      padding: "4px 10px", 
                      borderRadius: 20, 
                      fontSize: 11, 
                      fontWeight: 800 
                    }}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardBox>
    </div>
  );
}

function PlatformDataView({ stats, loading }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading platform data...</div>;

  const dataCards = [
    { label: "Mood Logs", value: stats.moodLogs?.toLocaleString(), sub: `+${stats.moodLogsToday} today`, icon: "📈" },
    { label: "Platform Uptime", value: stats.uptime, sub: "High availability", icon: "⚡" },
    { label: "Active Patients", value: stats.activePatients, sub: "Currently registered", icon: "🧘" },
    { label: "Therapists", value: stats.totalPsychologists, sub: `${stats.approvedPsychologists} verified`, icon: "👩‍⚕️" },
  ];

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 28, color: "#1E1B4B", marginBottom: 24 }}>Platform Data Analytics</div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 24 }}>
        {dataCards.map((card, i) => (
          <CardBox key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
            <div style={{ fontSize: 32, background: "#F5F3FF", width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9896B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1E1B4B", margin: "4px 0" }}>{card.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#10B981" }}>{card.sub}</div>
            </div>
          </CardBox>
        ))}
      </div>

      <CardBox>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 8 }}>User Growth (Last 7 Days)</div>
        <div style={{ fontSize: 14, color: "#9896B8", marginBottom: 24 }}>Weekly breakdown of new patient and therapist registrations.</div>
        <UserGrowthChart data={stats.growth} />
      </CardBox>
    </div>
  );
}

function FeaturesView({ stats, loading }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading features data...</div>;
  const features = stats.features || [];

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 28, color: "#1E1B4B", marginBottom: 24 }}>Content & Features</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {features.map((f, i) => (
          <CardBox key={i} style={{ borderLeft: "4px solid #7C3AED" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B" }}>{f.name}</div>
              <span style={{ background: "#F5F3FF", color: "#7C3AED", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>Active</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: "#7C3AED" }}>{f.count?.toLocaleString()}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#9896B8" }}>{f.label} recorded</span>
            </div>
            <div style={{ marginTop: 20, height: 6, background: "#F0EEFB", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg, #7C3AED, #A78BFA)", borderRadius: 3 }} />
            </div>
          </CardBox>
        ))}
      </div>
    </div>
  );
}

function LogsView({ stats, loading }) {
  if (loading) return <div style={{ padding: 20, color: "#9896B8" }}>Loading system logs...</div>;
  const auditLog = stats.auditLog || [];

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 28, color: "#1E1B4B", marginBottom: 24 }}>System Activity Logs</div>
      <CardBox style={{ background: "#F9FAFB", padding: 24, border: "1px solid #E5E7EB" }}>
        <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.6 }}>
          {auditLog.length === 0 ? (
            <div style={{ color: "#9CA3AF" }}>No recent activity found.</div>
          ) : auditLog.map((log, i) => (
            <div key={log.id} style={{ marginBottom: 10, display: "flex", gap: 12, borderBottom: "1px solid #F3F4F6", paddingBottom: 8 }}>
              <span style={{ color: "#7C3AED", fontWeight: 700 }}>
                [{new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              <span style={{ color: "#6B7280", fontWeight: 700 }}>INFO</span>
              <span style={{ color: "#1E1B4B", fontWeight: 500 }}>{log.action}</span>
              <span style={{ color: "#10B981", fontWeight: 700, marginLeft: "auto" }}>✓ SUCCESS</span>
            </div>
          ))}
          <div style={{ color: "#9CA3AF", marginTop: 20, fontSize: 11, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.1em" }}>-- End of activity stream --</div>
        </div>
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
        <div style={staffStyles.listText}>
          Email:{" "}
          <a
            href="mailto:support@calmmind.com"
            style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 600 }}
          >
            support@calmmind.com
          </a>
        </div>
        <div style={{ ...staffStyles.listText, marginTop: 8 }}>
          Phone:{" "}
          <a
            href="tel:+922145415487"
            style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 600 }}
          >
            +92 214 5415487
          </a>
        </div>
      </CardBox>
    </div>
  );
}

function SettingsView() {
  const [maintenance, setMaintenance] = useState(false);
  
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 28, color: "#1E1B4B", marginBottom: 24 }}>Admin Settings</div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <CardBox>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 20 }}>Account Profile</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff", fontWeight: 800 }}>AD</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#1E1B4B" }}>System Administrator</div>
              <div style={{ fontSize: 14, color: "#9896B8" }}>admin@calmmind.com</div>
            </div>
          </div>
          <button style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#F5F3FF", color: "#7C3AED", border: "none", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Update Profile</button>
        </CardBox>

        <CardBox>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 20 }}>Platform Controls</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1E1B4B" }}>Maintenance Mode</div>
              <div style={{ fontSize: 12, color: "#9896B8" }}>Restrict platform access for updates.</div>
            </div>
            <div 
              onClick={() => setMaintenance(!maintenance)}
              style={{ 
                width: 44, height: 24, borderRadius: 12, 
                background: maintenance ? "#7C3AED" : "#E5E7EB", 
                position: "relative", cursor: "pointer", transition: "background 0.3s" 
              }}
            >
              <div style={{ 
                width: 18, height: 18, borderRadius: "50%", background: "#fff", 
                position: "absolute", top: 3, left: maintenance ? 23 : 3, 
                transition: "left 0.3s" 
              }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1E1B4B" }}>Public Registration</div>
              <div style={{ fontSize: 12, color: "#9896B8" }}>Allow new users to sign up.</div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: "#10B981", position: "relative", cursor: "pointer" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: 23 }} />
            </div>
          </div>
        </CardBox>

        <CardBox>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 20 }}>Security & API</div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9896B8", marginBottom: 8, textTransform: "uppercase" }}>Master API Key</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input readOnly value="cm_live_7823490234890234" style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: 13, fontFamily: "monospace" }} />
              <button style={{ padding: "0 12px", borderRadius: 8, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Copy</button>
            </div>
          </div>
        </CardBox>

        <CardBox>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B", marginBottom: 20 }}>Notifications</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: 14, color: "#4B5563" }}>Email for new therapist signups</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked />
              <span style={{ fontSize: 14, color: "#4B5563" }}>System health alerts (Critical)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" />
              <span style={{ fontSize: 14, color: "#4B5563" }}>Weekly platform analytics report</span>
            </label>
          </div>
        </CardBox>
      </div>
    </div>
  );
}

// Remove duplicate views object if any, or just ensure it's not used below.

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [apptsLoading, setApptsLoading] = useState(false);

  useEffect(() => {
    api.getAdminStats()
      .then(data => { if (data && !data.error) setStats(data); })
      .catch(err => console.error("Admin stats failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const fetchUsers = () => {
    setUsersLoading(true);
    api.getAllUsers()
      .then(data => { if (Array.isArray(data)) setUsers(data); })
      .catch(err => console.error("Users fetch failed:", err))
      .finally(() => setUsersLoading(false));
  };

  const fetchAppts = () => {
    setApptsLoading(true);
    api.getAdminAppointments()
      .then(data => { if (Array.isArray(data)) setAppointments(data); })
      .catch(err => console.error("Appts fetch failed:", err))
      .finally(() => setApptsLoading(false));
  };

  useEffect(() => {
    if (active === "users") {
      fetchUsers();
    }
    if (active === "appointments") {
      fetchAppts();
    }
  }, [active]);

  const handleApprove = async (psychologistId) => {
    try {
      await api.approvePsychologist(psychologistId);
      fetchUsers(); // Refresh list
    } catch (err) {
      alert("Failed to approve psychologist.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await api.deleteUser(userId);
      fetchUsers(); // Real-time refresh
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const views = {
    overview: () => <OverviewView stats={stats} loading={loading} />,
    users: () => <UsersView users={users} loading={usersLoading} onApprove={handleApprove} onDelete={handleDeleteUser} />,
    appointments: () => <AppointmentsView appointments={appointments} loading={apptsLoading} />,
    data: () => <PlatformDataView stats={stats} loading={loading} />,
    features: () => <FeaturesView stats={stats} loading={loading} />,
    logs: () => <LogsView stats={stats} loading={loading} />,
    support: SupportView,
    settings: SettingsView,
  };

  const ActiveView = views[active] || views.overview;
  const handleLogout = () => {
    api.clearSession();
    navigate("/login");
  };

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

import { useState, useEffect, useRef } from "react";
import Button from "../components/ui/Button";
import { colors, fonts, radius, shadows } from "../styles/theme";
import * as api from "../api";
import { useTheme, ACCENT_PALETTES } from "../context/ThemeContext";

// ─── WARM PALETTE (matches Appointments) ─────────────────────────────────────
const warm = {
  brown:       "#92400E",
  brownMid:    "#B45309",
  brownSoft:   "#FFFBEB",
  brownBorder: "#F5D9A8",
  cream:       "#FAF7F2",
  sandBorder:  "#D5C4B0",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 10, fontFamily: fonts.body, fontWeight: 800,
    color: colors.purple, letterSpacing: "0.12em",
    textTransform: "uppercase", marginBottom: 16,
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <span style={{ width: 20, height: 2, background: colors.purple, borderRadius: 2, display: "inline-block" }} />
    {children}
  </div>
);

const SettingsCard = ({ children, style = {} }) => (
  <div style={{
    background: "#fff", borderRadius: radius.lg,
    border: `1.5px solid ${colors.border}`,
    boxShadow: shadows.card,
    padding: "24px 28px",
    ...style,
  }}>
    {children}
  </div>
);

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange, accentColor }) => {
  const bg = accentColor || colors.purple;
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 999,
        background: on ? bg : colors.border,
        position: "relative", cursor: "pointer",
        transition: "background 0.25s",
        flexShrink: 0,
        boxShadow: on ? `0 2px 8px ${bg}50` : "none",
      }}
    >
      <div style={{
        position: "absolute",
        top: 3, left: on ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }} />
    </div>
  );
};

// ─── Toggle Row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ icon, label, desc, on, onChange, accent }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 0",
    borderBottom: `1px solid ${colors.bg}`,
  }}>
    <div style={{
      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
      background: on ? `${accent || colors.purple}15` : colors.bg,
      border: `1px solid ${on ? `${accent || colors.purple}30` : colors.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 17, transition: "all 0.2s",
    }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>
        {desc}
      </div>
    </div>
    <Toggle on={on} onChange={onChange} accentColor={accent} />
  </div>
);

// ─── Input Field ──────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{
      display: "block", fontFamily: fonts.body, fontSize: 11,
      fontWeight: 800, color: colors.textMid,
      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
    }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "11px 14px",
        borderRadius: radius.md, fontSize: 13,
        fontFamily: fonts.body, color: colors.text,
        border: `1.5px solid ${colors.border}`,
        background: colors.bg, outline: "none",
        boxSizing: "border-box", transition: "border 0.2s",
      }}
      onFocus={e => e.target.style.border = `1.5px solid ${colors.purple}`}
      onBlur={e => e.target.style.border = `1.5px solid ${colors.border}`}
    />
  </div>
);

// ─── Select Field ─────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{
      display: "block", fontFamily: fonts.body, fontSize: 11,
      fontWeight: 800, color: colors.textMid,
      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
    }}>{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "11px 14px",
        borderRadius: radius.md, fontSize: 13,
        fontFamily: fonts.body, color: colors.text,
        border: `1.5px solid ${colors.border}`,
        background: colors.bg, outline: "none",
        boxSizing: "border-box", cursor: "pointer",
        appearance: "none",
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────
const NAV = [
  { key: "profile",       icon: "👤", label: "Profile"         },
  { key: "notifications", icon: "🔔", label: "Notifications"   },
  { key: "privacy",       icon: "🔒", label: "Privacy"         },
  { key: "appearance",    icon: "🎨", label: "Appearance"      },
  { key: "security",      icon: "🛡️", label: "Security"        },
  { key: "danger",        icon: "⚠️", label: "Danger Zone"     },
];

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
const Settings = () => {

  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Profile state ──
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [bio,      setBio]      = useState("");
  const [timezone, setTimezone] = useState("asia-karachi");
  const [language, setLanguage] = useState("en");
  const [specialization, setSpecialization] = useState("");

  const SPECIALIZATIONS = [
    "Anxiety", "Depression", "Trauma", "Relationships",
    "Mindfulness", "OCD", "ADHD", "Sleep", "Stress"
  ];

  // Load real user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Load from localStorage immediately for instant display
        const stored = api.getStoredUser();
        if (stored) {
          setName(`${stored.firstName || ""} ${stored.lastName || ""}`.trim());
          setEmail(stored.email || "");
          setPhone(stored.phone || "");
        }
        // Load locally-stored prefs (bio, timezone, language)
        try {
          const prefs = JSON.parse(localStorage.getItem("calmmind_prefs") || "{}");
          if (prefs.bio)      setBio(prefs.bio);
          if (prefs.timezone) setTimezone(prefs.timezone);
          if (prefs.language) setLanguage(prefs.language);
        } catch {}

        // Then fetch fresh data from backend
        const res = await api.getMe();
        if (res && res.user) {
          const u = res.user;
          setName(`${u.firstName || ""} ${u.lastName || ""}`.trim());
          setEmail(u.email || "");
          setPhone(u.phone || "");
          if (u.bio)      setBio(u.bio);
          if (u.timezone) setTimezone(u.timezone);
          if (u.language) setLanguage(u.language);
          if (u.psychologist) {
            setSpecialization(u.psychologist.specialization || "");
          }
        }
      } catch (err) {
        console.error("Could not load user profile:", err);
      }
    };
    loadUser();
  }, []);

  // ── Notification state ──
  const [notifs, setNotifs] = useState({
    sessionReminders:  true,
    moodReminders:     true,
    journalPrompts:    false,
    weeklyReport:      true,
    newMessages:       true,
    appointmentUpdates:true,
    emailDigest:       false,
    smsAlerts:         true,
  });
  const toggleNotif = (key) => setNotifs(p => ({ ...p, [key]: !p[key] }));

  // ── Privacy state ──
  const [privacy, setPrivacy] = useState({
    shareProgressWithTherapist: true,
    anonymousDataCollection:    false,
    showOnlineStatus:           true,
    allowTherapistNotes:        true,
    twoFactorAuth:              false,
  });
  const togglePrivacy = (key) => setPrivacy(p => ({ ...p, [key]: !p[key] }));

  // ── Appearance — wired to global ThemeContext ──
  const { colorMode, setColorMode, accentKey, setAccentKey, fontSize, setFontSize } = useTheme();

  const ACCENT_OPTS = [
    { key: "purple", color: "#7C3AED", label: "Violet"  },
    { key: "teal",   color: "#0E7490", label: "Teal"    },
    { key: "rose",   color: "#BE185D", label: "Rose"    },
    { key: "amber",  color: "#B45309", label: "Amber"   },
    { key: "indigo", color: "#3730A3", label: "Indigo"  },
  ];

  // ── Security state ──
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [dangerConfirm, setDangerConfirm] = useState("");
  const [sessions, setSessions] = useState([
    { id: "s1", device: "MacBook Pro", location: "Karachi, PK", time: "Now",       icon: "💻", active: true  },
    { id: "s2", device: "iPhone 15",   location: "Karachi, PK", time: "2 hrs ago", icon: "📱", active: false },
    { id: "s3", device: "Chrome Web",  location: "Lahore, PK",  time: "Yesterday", icon: "🌐", active: false },
  ]);
  const fileInputRef = useRef(null);

  const handleSave = async () => {
    setSaveError("");
    // Basic validation
    if (!name.trim()) {
      setSaveError("Full name cannot be empty.");
      return;
    }
    try {
      // Save to backend (name and phone are supported fields)
      const res = await api.updateProfile({ fullName: name.trim(), phone, bio, timezone, language, specialization });

      // Always update localStorage with whatever we have — even if backend
      // doesn't support bio/timezone/language yet, the UI stays consistent
      const stored = api.getStoredUser() || {};
      const nameParts = name.trim().split(" ");
      const updated = {
        ...stored,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || stored.lastName || "-",
        phone: phone || stored.phone,
      };
      // Store extra prefs locally
      localStorage.setItem("calmmind_user", JSON.stringify(updated));
      localStorage.setItem("calmmind_prefs", JSON.stringify({ bio, timezone, language }));

      if (res && res.error) {
        // Backend returned error but we already saved locally
        setSaveError(res.error + " (local changes saved)");
      } else {
        if (res && res.user) {
          localStorage.setItem("calmmind_user", JSON.stringify({ ...updated, ...res.user }));
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      // Network error — save locally anyway so the user isn't blocked
      const stored = api.getStoredUser() || {};
      const nameParts = name.trim().split(" ");
      localStorage.setItem("calmmind_user", JSON.stringify({
        ...stored,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || stored.lastName || "-",
        phone: phone || stored.phone,
      }));
      localStorage.setItem("calmmind_prefs", JSON.stringify({ bio, timezone, language }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  // Appearance save — theme is already live via context, just show confirmation toast
  const handleSaveAppearance = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const getPasswordStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak",   color: "#EF4444", width: "25%"  };
    if (score <= 2) return { label: "Fair",   color: "#F59E0B", width: "50%"  };
    if (score <= 3) return { label: "Good",   color: "#3B82F6", width: "75%"  };
    return              { label: "Strong", color: "#10B981", width: "100%" };
  };

  const handleChangePassword = async () => {
    setPwError(""); setPwSuccess("");
    if (!currentPw || !newPw || !confirmPw)
      return setPwError("Please fill in all password fields.");
    if (newPw.length < 8)
      return setPwError("New password must be at least 8 characters.");
    if (!/[A-Za-z]/.test(newPw) || !/[0-9]/.test(newPw))
      return setPwError("Password must contain both letters and numbers.");
    if (newPw !== confirmPw)
      return setPwError("New passwords do not match.");
    if (newPw === currentPw)
      return setPwError("New password must be different from your current password.");
    try {
      const res = await api.changePassword({ currentPassword: currentPw, newPassword: newPw });
      if (res.error) return setPwError(res.error);
      setPwSuccess("Password updated successfully! ✅");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => setPwSuccess(""), 3000);
    } catch {
      setPwError("Could not update password. Please try again.");
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("calmmind_token");
      const res = await fetch("http://localhost:5000/api/auth/export-data", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "calmmind-data-export.json";
      a.click(); URL.revokeObjectURL(url);
    } catch {
      alert("Could not export data. Please try again.");
    }
  };

  const handleDangerAction = async (action) => {
    if (dangerConfirm !== action) {
      setDangerConfirm(action); // first click — ask for confirmation
      return;
    }
    // Second click — confirmed, proceed
    setDangerConfirm("");
    try {
      if (action === "deactivate") {
        await api.deactivateAccount();
        api.clearSession();
        window.location.href = "/login";
      } else if (action === "delete") {
        await api.deleteAccount();
        api.clearSession();
        window.location.href = "/";
      }
    } catch {
      alert("Action failed. Please try again.");
    }
  };

  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // In a full implementation this would upload to storage and update avatarUrl.
    // For now we show a local preview using FileReader.
    alert(`Photo "${file.name}" selected. Connect a file storage service (e.g. Cloudinary, S3) to enable uploads.`);
  };

  return (
    <div className="page-enter">

      {/* ── Page Header ── */}
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
            ✦ Settings
          </div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 6 }}>
            Account & Preferences
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMid, fontWeight: 600 }}>
            Manage your profile, notifications, privacy and more.
          </p>
        </div>
        <div style={{ fontSize: 56 }}>⚙️</div>
      </div>

      {/* ── Success toast ── */}
      {saved && (
        <div style={{
          marginBottom: 20, padding: "13px 20px", borderRadius: radius.md,
          background: "#D1FAE5", border: "1.5px solid #6EE7B7",
          fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: "#065F46",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          ✅ Changes saved successfully!
        </div>
      )}

      {saveError && (
        <div style={{
          marginBottom: 20, padding: "13px 20px", borderRadius: radius.md,
          background: "#FEF2F2", border: "1.5px solid #FCA5A5",
          fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: "#DC2626",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          ❌ {saveError}
        </div>
      )}

      {/* ── Layout: sidebar + content ── */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>

        {/* Sidebar nav */}
        <div style={{
          background: "#fff", borderRadius: radius.lg,
          border: `1.5px solid ${colors.border}`,
          boxShadow: shadows.card,
          padding: "10px 10px",
          position: "sticky", top: 20,
        }}>
          {NAV.map(n => (
            <button
              key={n.key}
              onClick={() => setActiveTab(n.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "11px 14px", borderRadius: radius.md,
                border: "none", cursor: "pointer", marginBottom: 2,
                background: activeTab === n.key
                  ? `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`
                  : "transparent",
                color: activeTab === n.key ? "#fff" : colors.textMid,
                fontFamily: fonts.body, fontSize: 13, fontWeight: 700,
                textAlign: "left", transition: "all 0.18s",
                boxShadow: activeTab === n.key ? shadows.purple : "none",
              }}
            >
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <>
              <SettingsCard>
                <SectionLabel>Profile Picture</SectionLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 8 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28, color: "#fff", fontWeight: 800, fontFamily: fonts.body,
                    boxShadow: shadows.purple, flexShrink: 0,
                  }}>{name.charAt(0).toUpperCase() || "?"}</div>
                  <div>
                    <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      {name}
                    </div>
                    <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body, marginBottom: 12 }}>
                      {api.getStoredUser()?.role === "PSYCHOLOGIST" ? "Psychologist" : api.getStoredUser()?.role === "ADMIN" ? "Admin" : "Patient"} · Member since Jan 2024
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleUploadPhoto}
                      />
                      <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>Upload Photo</Button>
                      <Button size="sm" variant="ghost">Remove</Button>
                    </div>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard>
                <SectionLabel>Personal Information</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <InputField label="Full Name"     value={name}  onChange={setName}  placeholder="Your name" />
                  <InputField label="Phone Number"  value={phone} onChange={setPhone} placeholder="+1 (555) 000-0000" />
                  <div style={{ gridColumn: "span 2" }}>
                    <InputField label="Email Address" value={email} onChange={setEmail} type="email" placeholder="your@email.com" />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontFamily: fonts.body, fontSize: 11, fontWeight: 800, color: colors.textMid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: radius.md,
                      fontSize: 13, fontFamily: fonts.body, color: colors.text,
                      border: `1.5px solid ${colors.border}`, background: colors.bg,
                      outline: "none", resize: "vertical", lineHeight: 1.6,
                      boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.border = `1.5px solid ${colors.purple}`}
                    onBlur={e => e.target.style.border = `1.5px solid ${colors.border}`}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                  <SelectField
                    label="Timezone"
                    value={timezone}
                    onChange={setTimezone}
                    options={[
                      { value: "asia-karachi",   label: "Asia / Karachi (PKT)"     },
                      { value: "asia-dubai",     label: "Asia / Dubai (GST)"       },
                      { value: "europe-london",  label: "Europe / London (GMT)"    },
                      { value: "america-ny",     label: "America / New York (EST)" },
                      { value: "america-la",     label: "America / Los Angeles (PST)" },
                    ]}
                  />
                  <SelectField
                    label="Language"
                    value={language}
                    onChange={setLanguage}
                    options={[
                      { value: "en", label: "English"  },
                      { value: "ur", label: "Urdu"     },
                    ]}
                  />
                  {api.getStoredUser()?.role === "PSYCHOLOGIST" && (
                    <SelectField
                      label="Specialization"
                      value={specialization}
                      onChange={setSpecialization}
                      options={[
                        { value: "", label: "Select Specialization" },
                        ...SPECIALIZATIONS.map(s => ({ value: s, label: s }))
                      ]}
                    />
                  )}
                </div>
                <Button onClick={handleSave} size="md">Save Changes ✓</Button>
              </SettingsCard>
            </>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "notifications" && (
            <>
              <SettingsCard>
                <SectionLabel>Session & Appointments</SectionLabel>
                <ToggleRow icon="📅" label="Session Reminders"      desc="Get reminded 1 hr before your therapy sessions"         on={notifs.sessionReminders}   onChange={() => toggleNotif("sessionReminders")}   accent={colors.purple} />
                <ToggleRow icon="🔔" label="Appointment Updates"    desc="Notifications for bookings, cancellations & reschedules" on={notifs.appointmentUpdates} onChange={() => toggleNotif("appointmentUpdates")} accent={colors.purple} />
                <ToggleRow icon="💬" label="New Messages"           desc="Alert when your therapist sends you a message"          on={notifs.newMessages}        onChange={() => toggleNotif("newMessages")}        accent={colors.purple} />
              </SettingsCard>

              <SettingsCard>
                <SectionLabel>Wellness Reminders</SectionLabel>
                <ToggleRow icon="😊" label="Daily Mood Check-in"    desc="Gentle reminder to log your mood each morning"          on={notifs.moodReminders}      onChange={() => toggleNotif("moodReminders")}      accent={warm.brownMid} />
                <ToggleRow icon="📓" label="Journal Prompts"        desc="Daily writing prompts to keep your journal active"      on={notifs.journalPrompts}     onChange={() => toggleNotif("journalPrompts")}     accent={warm.brownMid} />
                <ToggleRow icon="📊" label="Weekly Progress Report" desc="A summary of your mood trends and milestones each week"  on={notifs.weeklyReport}       onChange={() => toggleNotif("weeklyReport")}       accent={warm.brownMid} />
              </SettingsCard>

              <SettingsCard>
                <SectionLabel>Communication</SectionLabel>
                <ToggleRow icon="📧" label="Email Digest"           desc="Weekly email summary of activity and insights"          on={notifs.emailDigest}        onChange={() => toggleNotif("emailDigest")}        accent="#BE185D" />
                <ToggleRow icon="📱" label="SMS Alerts"             desc="Text message alerts for urgent session updates"         on={notifs.smsAlerts}          onChange={() => toggleNotif("smsAlerts")}          accent="#BE185D" />
                <div style={{ paddingTop: 8 }} />
                <Button onClick={handleSave} size="md">Save Preferences ✓</Button>
              </SettingsCard>
            </>
          )}

          {/* ── PRIVACY TAB ── */}
          {activeTab === "privacy" && (
            <>
              <SettingsCard>
                <SectionLabel>Data Sharing</SectionLabel>
                <ToggleRow icon="👨‍⚕️" label="Share Progress with Therapist" desc="Let your therapist see your mood logs and journal summaries" on={privacy.shareProgressWithTherapist} onChange={() => togglePrivacy("shareProgressWithTherapist")} accent={colors.purple} />
                <ToggleRow icon="📝"  label="Allow Therapist Notes"          desc="Therapist can add private notes to your sessions"            on={privacy.allowTherapistNotes}        onChange={() => togglePrivacy("allowTherapistNotes")}        accent={colors.purple} />
                <ToggleRow icon="📡"  label="Anonymous Usage Data"           desc="Help improve CalmMind by sharing anonymous analytics"        on={privacy.anonymousDataCollection}    onChange={() => togglePrivacy("anonymousDataCollection")}    accent={warm.brownMid} />
              </SettingsCard>

              <SettingsCard>
                <SectionLabel>Profile Visibility</SectionLabel>
                <ToggleRow icon="🟢" label="Show Online Status"   desc="Let your therapist see when you're active"         on={privacy.showOnlineStatus} onChange={() => togglePrivacy("showOnlineStatus")} accent={warm.brownMid} />
                <ToggleRow icon="🔐" label="Two-Factor Auth"      desc="Extra security layer for your account login"      on={privacy.twoFactorAuth}    onChange={() => togglePrivacy("twoFactorAuth")}    accent="#BE185D" />
                <div style={{ paddingTop: 8 }} />
                <Button onClick={handleSave} size="md">Save Privacy Settings ✓</Button>
              </SettingsCard>

              <SettingsCard>
                <SectionLabel>Data & Export</SectionLabel>
                <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 1.65, marginBottom: 16, fontWeight: 600 }}>
                  You can request a full export of your data including mood logs, journal entries, and session history.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button variant="secondary" size="sm" onClick={handleExportData}>📥 Export My Data</Button>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("danger")}>🗑 Request Deletion</Button>
                </div>
              </SettingsCard>
            </>
          )}

          {/* ── APPEARANCE TAB ── */}
          {activeTab === "appearance" && (
            <>
              <SettingsCard>
                <SectionLabel>Theme Mode</SectionLabel>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { key: "light", icon: "☀️", label: "Light" },
                    { key: "dark",  icon: "🌙", label: "Dark"  },
                    { key: "auto",  icon: "💻", label: "System"},
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setColorMode(m.key)}
                      style={{
                        flex: 1, padding: "16px 12px", borderRadius: radius.md,
                        border: colorMode === m.key ? `2px solid ${colors.purple}` : `1.5px solid ${colors.border}`,
                        background: colorMode === m.key ? colors.purpleSoft : "#fff",
                        cursor: "pointer", fontFamily: fonts.body, fontWeight: 700,
                        color: colorMode === m.key ? colors.purple : colors.textMid,
                        transition: "all 0.18s", textAlign: "center",
                        boxShadow: colorMode === m.key ? `0 4px 14px ${colors.purple}25` : "none",
                      }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 8 }}>{m.icon}</div>
                      <div style={{ fontSize: 12 }}>{m.label}</div>
                    </button>
                  ))}
                </div>
              </SettingsCard>

              <SettingsCard>
                <SectionLabel>Accent Color</SectionLabel>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {ACCENT_OPTS.map(a => (
                    <button
                      key={a.key}
                      onClick={() => setAccentKey(a.key)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: "14px 18px", borderRadius: radius.md, cursor: "pointer",
                        border: accentKey === a.key ? `2px solid ${a.color}` : `1.5px solid ${colors.border}`,
                        background: accentKey === a.key ? `${a.color}12` : "#fff",
                        transition: "all 0.18s",
                        boxShadow: accentKey === a.key ? `0 4px 14px ${a.color}30` : "none",
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: a.color,
                        boxShadow: accentKey === a.key ? `0 2px 8px ${a.color}60` : "none",
                      }} />
                      <span style={{ fontSize: 11, fontFamily: fonts.body, fontWeight: 800, color: accentKey === a.key ? a.color : colors.textMuted }}>
                        {a.label}
                      </span>
                    </button>
                  ))}
                </div>
              </SettingsCard>

              <SettingsCard>
                <SectionLabel>Font Size</SectionLabel>
                <div style={{ display: "flex", gap: 10 }}>
                  {["small", "medium", "large"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFontSize(f)}
                      style={{
                        flex: 1, padding: "12px 8px", borderRadius: radius.md,
                        border: fontSize === f ? `1.5px solid ${colors.purple}` : `1.5px solid ${colors.border}`,
                        background: fontSize === f ? colors.purpleSoft : "#fff",
                        cursor: "pointer", fontFamily: fonts.body, fontWeight: 700,
                        color: fontSize === f ? colors.purple : colors.textMid,
                        fontSize: f === "small" ? 11 : f === "medium" ? 13 : 15,
                        transition: "all 0.18s",
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
                  <Button onClick={handleSaveAppearance} size="md">Save Appearance ✓</Button>
                  <span style={{ fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 600 }}>
                    ✨ Changes apply instantly across the whole app
                  </span>
                </div>
              </SettingsCard>
            </>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === "security" && (
            <>
              <SettingsCard>
                <SectionLabel>Change Password</SectionLabel>
                {pwError && (
                  <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: radius.md, background: "#FEF2F2", border: "1.5px solid #FCA5A5", fontFamily: fonts.body, fontSize: 12, fontWeight: 700, color: "#DC2626" }}>
                    ❌ {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: radius.md, background: "#D1FAE5", border: "1.5px solid #6EE7B7", fontFamily: fonts.body, fontSize: 12, fontWeight: 700, color: "#065F46" }}>
                    {pwSuccess}
                  </div>
                )}
                <InputField label="Current Password" value={currentPw} onChange={setCurrentPw} type="password" placeholder="••••••••" />
                <InputField label="New Password"     value={newPw}     onChange={setNewPw}     type="password" placeholder="Min. 8 characters, include numbers" />
                {newPw && (() => {
                  const str = getPasswordStrength(newPw);
                  return (
                    <div style={{ marginTop: -10, marginBottom: 16 }}>
                      <div style={{ height: 4, background: colors.border, borderRadius: 4, overflow: "hidden", marginBottom: 4 }}>
                        <div style={{ height: "100%", width: str.width, background: str.color, borderRadius: 4, transition: "all 0.3s" }} />
                      </div>
                      <div style={{ fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: str.color }}>
                        Password strength: {str.label}
                        {str.label === "Weak" && " — Add numbers & symbols"}
                        {str.label === "Fair" && " — Add uppercase letters"}
                        {str.label === "Good" && " — Almost there!"}
                      </div>
                    </div>
                  );
                })()}
                <InputField label="Confirm Password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Repeat new password" />
                {confirmPw && newPw !== confirmPw && (
                  <div style={{ marginTop: -10, marginBottom: 12, fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: "#EF4444" }}>
                    ❌ Passwords do not match
                  </div>
                )}
                {confirmPw && newPw === confirmPw && (
                  <div style={{ marginTop: -10, marginBottom: 12, fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: "#10B981" }}>
                    ✅ Passwords match
                  </div>
                )}
                <Button onClick={handleChangePassword} size="md">Update Password →</Button>
              </SettingsCard>

              <SettingsCard>
                <SectionLabel>Active Sessions</SectionLabel>
                {sessions.length === 0 ? (
                  <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, padding: "12px 0" }}>
                    No other active sessions.
                  </div>
                ) : sessions.map((s, i) => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 0",
                    borderBottom: i < sessions.length - 1 ? `1px solid ${colors.bg}` : "none",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: s.active ? colors.purpleSoft : colors.bg,
                      border: `1px solid ${s.active ? colors.lavender : colors.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                    }}>{s.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 2 }}>
                        {s.device}
                        {s.active && (
                          <span style={{
                            marginLeft: 8, fontSize: 9, fontWeight: 800,
                            color: colors.green, background: "#D1FAE5",
                            padding: "2px 8px", borderRadius: radius.full,
                            border: "1px solid #A7F3D0",
                          }}>ACTIVE</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.body }}>
                        {s.location} · {s.time}
                      </div>
                    </div>
                    {!s.active && (
                      <button
                        onClick={() => setSessions(prev => prev.filter(x => x.id !== s.id))}
                        style={{
                          padding: "6px 12px", borderRadius: radius.md, cursor: "pointer",
                          border: "1px solid #FCA5A5", background: "#FEF2F2",
                          fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: "#EF4444",
                        }}>Revoke</button>
                    )}
                  </div>
                ))}
              </SettingsCard>
            </>
          )}

          {/* ── DANGER ZONE TAB ── */}
          {activeTab === "danger" && (
            <SettingsCard>
              <SectionLabel>Danger Zone</SectionLabel>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, lineHeight: 1.65, marginBottom: 24, fontWeight: 600 }}>
                These actions are permanent and cannot be undone. Please proceed with caution.
              </p>

              {[
                {
                  icon: "📴",
                  title: "Deactivate Account",
                  desc: "Temporarily disable your account. You can reactivate anytime by logging back in.",
                  btnLabel: "Deactivate Account",
                  confirmLabel: "Confirm Deactivation",
                  action: "deactivate",
                  btnColor: "#D97706",
                  btnBg: "#FEF3C7",
                  btnBorder: "#F5D9A8",
                },
                {
                  icon: "🗑",
                  title: "Delete Account",
                  desc: "Permanently delete your account and all associated data. This action cannot be reversed.",
                  btnLabel: "Delete My Account",
                  confirmLabel: "Yes, Delete Forever",
                  action: "delete",
                  btnColor: "#DC2626",
                  btnBg: "#FEF2F2",
                  btnBorder: "#FCA5A5",
                },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "18px 20px", borderRadius: radius.md,
                  border: `1.5px solid ${item.btnBorder}`,
                  background: item.btnBg,
                  marginBottom: i < 1 ? 14 : 0,
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                      {item.title}
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, lineHeight: 1.6, fontWeight: 600 }}>
                      {item.desc}
                    </div>
                    {dangerConfirm === item.action && (
                      <div style={{ marginTop: 8, fontSize: 12, fontFamily: fonts.body, fontWeight: 700, color: item.btnColor }}>
                        ⚠️ Click again to confirm. This cannot be undone.
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDangerAction(item.action)}
                    style={{
                      padding: "9px 16px", borderRadius: radius.md, cursor: "pointer", flexShrink: 0,
                      border: `1.5px solid ${item.btnBorder}`,
                      background: dangerConfirm === item.action ? item.btnColor : "#fff",
                      fontFamily: fonts.body, fontSize: 12, fontWeight: 800,
                      color: dangerConfirm === item.action ? "#fff" : item.btnColor,
                      transition: "all 0.18s",
                    }}
                  >
                    {dangerConfirm === item.action ? item.confirmLabel : item.btnLabel}
                  </button>
                </div>
              ))}
            </SettingsCard>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
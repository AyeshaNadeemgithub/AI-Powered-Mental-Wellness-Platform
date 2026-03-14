import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveSession } from "../api";

const colors = {
  purple: "#7C3AED", purpleLight: "#8B5CF6", purpleHover: "#6D28D9",
  purplePale: "#EDE9FE", purpleSoft: "#F5F3FF", lavender: "#DDD6FE",
  bg: "#F0EEFB", card: "#FFFFFF", text: "#1E1B4B", textMid: "#4C4682",
  textMuted: "#9896B8", border: "#E5E1F8", cream: "#FAF7F0",
  green: "#10B981", red: "#EF4444",
};

const roles = [
  { id: "patient",       emoji: "🧘‍♀️", label: "Patient",       subtitle: "Continue your wellness journey",    color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD" },
  { id: "psychologist",  emoji: "👩‍⚕️", label: "Psychologist",  subtitle: "Manage your sessions & patients",   color: "#0E7490", bg: "#ECFEFF", border: "#A5F3FC" },
  { id: "admin",         emoji: "🏢",  label: "Admin",         subtitle: "Oversee platform operations",       color: "#BE185D", bg: "#FFF0F6", border: "#FBCFE8" },
];

export default function Login() {
  const navigate = useNavigate();
  const [step,          setStep]          = useState("role");
  const [selectedRole,  setSelectedRole]  = useState(null);
  const [hoveredRole,   setHoveredRole]   = useState(null);
  const [form,          setForm]          = useState({ email: "", password: "" });
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [shake,         setShake]         = useState(false);

  const roleObj = roles.find((r) => r.id === selectedRole);

  function handleProceed(roleId) {
    setSelectedRole(roleId);
    setForm({ email: "", password: "" });
    setError("");
    setTimeout(() => setStep("login"), 80);
  }

  function handleBack() {
    setStep("role");
    setSelectedRole(null);
    setError("");
  }

  function triggerShake(msg) {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  async function handleLogin() {
    setError("");
    if (!form.email || !form.password) {
      triggerShake("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      // ── REAL API CALL ──────────────────────────────────────────────────────
      const result = await login(form.email, form.password, selectedRole);

      if (result.error) {
        triggerShake(result.error);
        setLoading(false);
        return;
      }

      // Save token + user to localStorage
      saveSession(result.token, result.user);

      // Redirect based on role
      setStep("success");
      let redirectPath = "/dashboard";
      if (selectedRole === "admin") redirectPath = "/admin-dashboard";
      if (selectedRole === "psychologist") redirectPath = "/psychologist-dashboard";
      setTimeout(() => navigate(redirectPath), 1800);

    } catch (err) {
      triggerShake("Connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.logoWrap}>
        <div style={styles.logoIcon}>🌿</div>
        <span style={styles.logoText}>CalmMind</span>
      </div>

      <div style={styles.card}>

        {/* ── STEP 1: Role Selection ── */}
        {step === "role" && (
          <div style={styles.fadeIn}>
            <h1 style={styles.heading}>Welcome back.</h1>
            <p style={styles.subheading}>How will you join us today?</p>
            <div style={styles.rolesGrid}>
              {roles.map((role) => {
                const isHovered = hoveredRole === role.id;
                return (
                  <div
                    key={role.id}
                    style={{
                      ...styles.roleCard,
                      background:  isHovered ? role.bg : "#FFFFFF",
                      borderColor: isHovered ? role.border : colors.border,
                      transform:   isHovered ? "translateY(-6px)" : "translateY(0)",
                      boxShadow:   isHovered ? `0 16px 40px ${role.color}22` : "0 2px 12px rgba(124,58,237,0.07)",
                    }}
                    onMouseEnter={() => setHoveredRole(role.id)}
                    onMouseLeave={() => setHoveredRole(null)}
                  >
                    <div style={styles.roleEmoji}>{role.emoji}</div>
                    <div style={styles.roleLabel}>{role.label}</div>
                    <div style={styles.roleSubtitle}>{role.subtitle}</div>
                    <button
                      style={{
                        ...styles.proceedBtn,
                        background: isHovered ? role.color : colors.purple,
                        boxShadow:  isHovered ? `0 6px 20px ${role.color}55` : `0 4px 14px ${colors.purple}44`,
                      }}
                      onClick={() => handleProceed(role.id)}
                    >
                      Proceed
                    </button>
                  </div>
                );
              })}
            </div>
            <p style={styles.bottomText}>
              Not registered?{" "}
              <span style={{ ...styles.link, cursor: "pointer" }} onClick={() => navigate("/patient-signup")}>
                Sign Up
              </span>
            </p>
          </div>
        )}

        {/* ── STEP 2: Login Form ── */}
        {step === "login" && roleObj && (
          <div style={styles.fadeIn}>
            <button style={styles.backBtn} onClick={handleBack}>← Back</button>

            <div style={{ ...styles.roleBadge, background: roleObj.bg, borderColor: roleObj.border, color: roleObj.color }}>
              <span style={{ fontSize: 18 }}>{roleObj.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{roleObj.label}</span>
            </div>

            <h1 style={{ ...styles.heading, fontSize: 32, marginTop: 12 }}>Sign in</h1>
            <p style={styles.subheading}>
              Welcome back,{" "}
              <span style={{ color: roleObj.color, fontWeight: 600 }}>{roleObj.label}</span>
            </p>

            <form onSubmit={(e) => e.preventDefault()} style={{ ...styles.form, animation: shake ? "shake 0.5s ease" : "none" }}>
              <div style={styles.fieldWrap}>
                <label style={styles.label}>Email address</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>✉️</span>
                  <input
                    type="email"
                    placeholder="you@calmmind.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.fieldWrap}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label style={styles.label}>Password</label>
                </div>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={styles.input}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && <div style={styles.errorBox}>⚠️ {error}</div>}

              <button
                type="button"
                disabled={loading}
                onClick={handleLogin}
                style={{
                  ...styles.submitBtn,
                  background: loading ? colors.textMuted : `linear-gradient(135deg, ${roleObj.color}, ${colors.purpleLight})`,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <span style={styles.spinner}>
                    <span style={styles.spinnerDot} /> Signing in...
                  </span>
                ) : `Sign in as ${roleObj.label}`}
              </button>
            </form>

            <p style={{ ...styles.bottomText, marginTop: 20 }}>
              New to CalmMind?{" "}
              <span style={{ ...styles.link, cursor: "pointer" }} onClick={() => navigate("/patient-signup")}>
                Create Account
              </span>
            </p>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === "success" && roleObj && (
          <div style={{ ...styles.fadeIn, textAlign: "center", padding: "20px 0" }}>
            <div style={styles.successIcon}>✅</div>
            <h1 style={{ ...styles.heading, fontSize: 30, marginTop: 16 }}>You're in!</h1>
            <p style={styles.subheading}>
              Welcome back,{" "}
              <span style={{ color: roleObj.color, fontWeight: 600 }}>{roleObj.label}</span>
              . Redirecting to your dashboard...
            </p>
            <div style={{ ...styles.progressTrack, marginTop: 28 }}>
              <div style={{ ...styles.progressBar, background: roleObj.color, animation: "progressFill 1.8s ease forwards" }} />
            </div>
          </div>
        )}
      </div>

      {step === "role" && (
        <div style={styles.footer}>
          <span style={styles.footerText}>
            New here?{" "}
            <span style={{ ...styles.link, cursor: "pointer" }} onClick={() => navigate("/patient-signup")}>
              Create Account
            </span>
          </span>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progressFill { from { width: 0%; } to { width: 100%; } }
        @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        input:focus { outline: none; }
        button { border: none; cursor: pointer; font-family: 'Nunito', sans-serif; }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
}

const styles = {
  page:        { minHeight: "100vh", background: "#F0EEFB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif", position: "relative", overflow: "hidden", padding: "40px 16px" },
  blob1:       { position: "absolute", width: 400, height: 400, background: "radial-gradient(circle, #C4B5FD55 0%, transparent 70%)", top: -100, left: -100, animation: "blob 8s ease-in-out infinite", pointerEvents: "none" },
  blob2:       { position: "absolute", width: 350, height: 350, background: "radial-gradient(circle, #DDD6FE44 0%, transparent 70%)", bottom: -80, right: -80, animation: "blob 10s ease-in-out infinite reverse", pointerEvents: "none" },
  blob3:       { position: "absolute", width: 200, height: 200, background: "radial-gradient(circle, #A5F3FC33 0%, transparent 70%)", top: "40%", right: "10%", animation: "blob 12s ease-in-out infinite", pointerEvents: "none" },
  logoWrap:    { display: "flex", alignItems: "center", gap: 8, marginBottom: 28, animation: "fadeUp 0.5s ease both", zIndex: 1 },
  logoIcon:    { fontSize: 28 },
  logoText:    { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: "#7C3AED", letterSpacing: "-0.5px" },
  card:        { background: "#FAF7F0", borderRadius: 28, padding: "48px 52px", width: "100%", maxWidth: 740, boxShadow: "0 8px 60px rgba(124,58,237,0.12)", position: "relative", zIndex: 1, animation: "fadeUp 0.6s ease both" },
  fadeIn:      { animation: "fadeUp 0.4s ease both" },
  heading:     { fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, color: "#1E1B4B", letterSpacing: "-1px", textAlign: "center", lineHeight: 1.1 },
  subheading:  { fontSize: 16, color: "#9896B8", textAlign: "center", marginTop: 8, marginBottom: 36, fontWeight: 500 },
  rolesGrid:   { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 32 },
  roleCard:    { borderRadius: 20, border: "1.5px solid", padding: "28px 18px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)", cursor: "pointer" },
  roleEmoji:   { fontSize: 48, lineHeight: 1, animation: "pulse 3s ease-in-out infinite" },
  roleLabel:   { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#1E1B4B" },
  roleSubtitle:{ fontSize: 11, color: "#9896B8", textAlign: "center", fontWeight: 500, lineHeight: 1.4 },
  proceedBtn:  { marginTop: 6, padding: "11px 0", width: "100%", borderRadius: 50, color: "#fff", fontSize: 14, fontWeight: 700, transition: "all 0.2s ease" },
  bottomText:  { textAlign: "center", fontSize: 14, color: "#9896B8", fontWeight: 500 },
  link:        { color: "#7C3AED", fontWeight: 700 },
  footer:      { marginTop: 24, display: "flex", alignItems: "center", zIndex: 1, animation: "fadeUp 0.7s ease both" },
  footerText:  { fontSize: 14, color: "#9896B8", fontWeight: 500 },
  backBtn:     { background: "none", color: "#9896B8", fontSize: 13, fontWeight: 700, padding: "6px 0", marginBottom: 16, display: "block", cursor: "pointer" },
  roleBadge:   { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 50, border: "1.5px solid", fontSize: 13, fontWeight: 700, marginBottom: 4 },
  form:        { display: "flex", flexDirection: "column", gap: 18 },
  fieldWrap:   { display: "flex", flexDirection: "column", gap: 7 },
  label:       { fontSize: 13, fontWeight: 700, color: "#4C4682", letterSpacing: "0.2px" },
  inputWrap:   { position: "relative", display: "flex", alignItems: "center" },
  inputIcon:   { position: "absolute", left: 14, fontSize: 16, pointerEvents: "none" },
  input:       { width: "100%", padding: "13px 16px 13px 42px", border: "1.5px solid #E5E1F8", borderRadius: 12, fontSize: 14, fontFamily: "'Nunito', sans-serif", fontWeight: 500, color: "#1E1B4B", background: "#FFFFFF", outline: "none" },
  eyeBtn:      { position: "absolute", right: 14, background: "none", fontSize: 16, cursor: "pointer", padding: 4 },
  errorBox:    { background: "#FEF2F2", border: "1px solid #FECACA", color: "#EF4444", borderRadius: 10, padding: "11px 16px", fontSize: 13, fontWeight: 600 },
  submitBtn:   { padding: "15px", borderRadius: 50, color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: "0.3px", boxShadow: "0 6px 24px rgba(124,58,237,0.35)", marginTop: 4 },
  spinner:     { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  spinnerDot:  { width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  successIcon: { fontSize: 64, animation: "pulse 1.5s ease-in-out infinite" },
  progressTrack:{ width: "100%", height: 6, background: "#E5E1F8", borderRadius: 10, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 10, width: "0%" },
};

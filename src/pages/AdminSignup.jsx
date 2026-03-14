import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminSignup, saveSession } from "../api";

const colors = {
  purple: "#7C3AED", purpleLight: "#8B5CF6",
  rose: "#BE185D", roseLight: "#DB2777", roseSoft: "#FFF0F6", roseBorder: "#FBCFE8",
  bg: "#F0EEFB", text: "#1E1B4B", textMid: "#4C4682", textMuted: "#9896B8",
  border: "#E5E1F8", red: "#EF4444",
};

const departments = [
  "Platform Management", "User Support", "Clinical Oversight",
  "Finance & Billing", "Marketing", "IT & Security", "Operations",
];

export default function AdminSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "",
    department: "", adminCode: "", password: "", confirmPassword: "",
  });

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCode,    setShowCode]    = useState(false);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [apiError,    setApiError]    = useState("");

  function setField(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setApiError("");
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim())  e.fullName   = "Full name is required";
    if (!form.email.trim())     e.email      = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())     e.phone      = "Phone number is required";
    if (!form.department)       e.department = "Please select a department";
    if (!form.adminCode.trim()) e.adminCode  = "Admin access code is required";
    if (!form.password)         e.password   = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    setApiError("");
    try {
      const result = await adminSignup(form);
      if (result.error) {
        setApiError(result.error);
        setLoading(false);
        return;
      }
      saveSession(result.token, result.user);
      setSuccess(true);
      setTimeout(() => navigate("/admin-dashboard"), 1800);
    } catch (err) {
      setApiError("Connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const inp = (field) => ({
    width: "100%", padding: "14px 16px",
    border: `1.5px solid ${errors[field] ? colors.red : colors.border}`,
    borderRadius: 14, fontSize: 15, fontFamily: "'Nunito', sans-serif",
    fontWeight: 500, color: colors.text, background: "#FFFFFF", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
  });

  const lbl = {
    fontSize: 11, fontWeight: 800, color: colors.textMuted,
    letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: 6, display: "block", fontFamily: "'Nunito', sans-serif",
  };

  if (success) {
    return (
      <div style={S.page}>
        <div style={S.blobA} /><div style={S.blobB} />
        <div style={S.card}>
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🛡️</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: colors.text, marginBottom: 10 }}>
              Admin Account Created!
            </h2>
            <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.6, marginBottom: 24, fontFamily: "'Nunito', sans-serif" }}>
              Welcome, <strong style={{ color: colors.rose }}>{form.fullName.split(" ")[0]}</strong>!<br />
              Your admin access has been granted.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: colors.roseSoft, border: `1.5px solid ${colors.roseBorder}`, color: colors.rose, borderRadius: 50, padding: "10px 24px", fontSize: 14, fontWeight: 700, marginBottom: 32, fontFamily: "'Nunito', sans-serif" }}>
              🏢 {form.department} — Admin
            </div>
            <br />
            <button type="button" onClick={() => navigate("/dashboard")}
              style={{ ...S.submitBtn, background: `linear-gradient(135deg, ${colors.rose}, ${colors.roseLight})` }}>
              Go to Dashboard →
            </button>
          </div>
        </div>
        <style>{globalStyles}</style>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.blobA} /><div style={S.blobB} />

      <div style={S.logoWrap} onClick={() => navigate("/")}>
        <span style={{ fontSize: 26 }}>🌿</span>
        <span style={S.logoText}>CalmMind</span>
      </div>

      <div style={S.card}>
        <button type="button" onClick={() => navigate("/login")} style={S.backBtn}>← Back to Login</button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 36 }}>🏢</span>
          <h1 style={S.heading}>Admin Sign Up</h1>
        </div>
        <p style={S.subtitle}>Create an administrator account for platform management.</p>

        <div style={{ display: "flex", gap: 8, marginTop: 14, marginBottom: 28 }}>
          <button type="button" onClick={() => navigate("/patient-signup")}
            style={{ ...S.roleTab, background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}` }}>
            🧘‍♀️ Patient
          </button>
          <button type="button" onClick={() => navigate("/therapist-signup")}
            style={{ ...S.roleTab, background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}` }}>
            👩‍⚕️ Psychologist
          </button>
          <button type="button"
            style={{ ...S.roleTab, background: colors.rose, color: "#fff", border: `1.5px solid ${colors.rose}` }}>
            🏢 Admin
          </button>
        </div>

        {apiError && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#EF4444", borderRadius: 12, padding: "12px 16px", fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: "'Nunito', sans-serif" }}>
            ⚠️ {apiError}
          </div>
        )}

        <div style={S.grid}>
          <div>
            <label style={lbl}>Full Name</label>
            <input type="text" placeholder="John Smith" value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)} style={inp("fullName")} />
            {errors.fullName && <span style={S.err}>{errors.fullName}</span>}
          </div>

          <div>
            <label style={lbl}>Email Address</label>
            <input type="email" placeholder="admin@calmmind.com" value={form.email}
              onChange={(e) => setField("email", e.target.value)} style={inp("email")} />
            {errors.email && <span style={S.err}>{errors.email}</span>}
          </div>

          <div>
            <label style={lbl}>Phone Number</label>
            <input type="tel" placeholder="+92 300 0000000" value={form.phone}
              onChange={(e) => setField("phone", e.target.value)} style={inp("phone")} />
            {errors.phone && <span style={S.err}>{errors.phone}</span>}
          </div>

          <div>
            <label style={lbl}>Department</label>
            <select value={form.department} onChange={(e) => setField("department", e.target.value)}
              style={{ ...inp("department"), cursor: "pointer" }}>
              <option value="">Select department...</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.department && <span style={S.err}>{errors.department}</span>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>Admin Access Code</label>
            <div style={{ position: "relative" }}>
              <input type={showCode ? "text" : "password"} placeholder="Enter your admin access code"
                value={form.adminCode} onChange={(e) => setField("adminCode", e.target.value)}
                style={{ ...inp("adminCode"), paddingRight: 44 }} />
              <button type="button" onClick={() => setShowCode(!showCode)} style={S.eyeBtn}>
                {showCode ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.adminCode && <span style={S.err}>{errors.adminCode}</span>}
            <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 6, fontFamily: "'Nunito', sans-serif" }}>
              🔐 The code is set in your backend .env file as ADMIN_ACCESS_CODE
            </p>
          </div>

          <div>
            <label style={lbl}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                style={{ ...inp("password"), paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={S.eyeBtn}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span style={S.err}>{errors.password}</span>}
          </div>

          <div>
            <label style={lbl}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                style={{ ...inp("confirmPassword"), paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={S.eyeBtn}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && <span style={S.err}>{errors.confirmPassword}</span>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={S.noticeBox}>
              <span style={{ fontSize: 18 }}>🔒</span>
              <span style={{ fontSize: 14, color: colors.textMid, fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>
                Admin accounts have full platform access. All activity is <strong>logged and monitored</strong>.
              </span>
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button type="button" onClick={handleSubmit} disabled={loading}
              style={{
                ...S.submitBtn,
                background: loading ? colors.textMuted : `linear-gradient(135deg, ${colors.rose}, ${colors.roseLight})`,
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={S.spinner} /> Creating Admin Account...
                </span>
              ) : "Create Admin Account →"}
            </button>
          </div>

          <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: "'Nunito', sans-serif" }}>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} style={{ color: colors.rose, fontWeight: 700, cursor: "pointer" }}>Sign In</span>
            </p>
          </div>
        </div>
      </div>
      <style>{globalStyles}</style>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  input:focus, select:focus { outline: none; border-color: #BE185D !important; box-shadow: 0 0 0 3px rgba(190,24,93,0.12); }
  button { font-family: 'Nunito', sans-serif; border: none; }
  a { text-decoration: none; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
`;

const S = {
  page:      { minHeight: "100vh", background: "#F0EEFB", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 48px", fontFamily: "'Nunito', sans-serif", position: "relative", overflow: "hidden" },
  blobA:     { position: "fixed", width: 420, height: 420, background: "radial-gradient(circle, #FBCFE844 0%, transparent 70%)", top: -120, left: -120, animation: "blob 9s ease-in-out infinite", pointerEvents: "none", zIndex: 0 },
  blobB:     { position: "fixed", width: 320, height: 320, background: "radial-gradient(circle, #C4B5FD22 0%, transparent 70%)", bottom: -80, right: -80, animation: "blob 11s ease-in-out infinite reverse", pointerEvents: "none", zIndex: 0 },
  logoWrap:  { display: "flex", alignItems: "center", gap: 8, marginBottom: 24, cursor: "pointer", zIndex: 1, animation: "fadeUp 0.4s ease both" },
  logoText:  { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#7C3AED" },
  card:      { background: "#FAF7F0", borderRadius: 28, padding: "40px 48px", width: "100%", maxWidth: 680, boxShadow: "0 8px 60px rgba(190,24,93,0.10)", position: "relative", zIndex: 1, animation: "fadeUp 0.5s ease both" },
  heading:   { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "#1E1B4B", letterSpacing: "-0.5px" },
  subtitle:  { fontSize: 15, color: "#9896B8", fontWeight: 500, fontFamily: "'Nunito', sans-serif" },
  backBtn:   { background: "none", color: "#9896B8", fontSize: 13, fontWeight: 700, padding: "0 0 14px", cursor: "pointer", display: "block" },
  roleTab:   { padding: "7px 16px", borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Nunito', sans-serif" },
  grid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" },
  err:       { display: "block", marginTop: 5, fontSize: 11, color: "#EF4444", fontWeight: 700, fontFamily: "'Nunito', sans-serif" },
  eyeBtn:    { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", fontSize: 16, cursor: "pointer", padding: 4, border: "none" },
  noticeBox: { display: "flex", alignItems: "center", gap: 12, background: "#FFF0F6", border: "1px solid #FBCFE8", borderRadius: 14, padding: "14px 18px" },
  submitBtn: { width: "100%", padding: "16px", borderRadius: 50, color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: "0.3px", boxShadow: "0 6px 24px rgba(190,24,93,0.30)", transition: "all 0.2s ease" },
  spinner:   { width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
};

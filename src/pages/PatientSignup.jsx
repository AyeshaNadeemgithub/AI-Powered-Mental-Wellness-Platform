import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientSignup, saveSession } from "../api";

const colors = {
  purple: "#7C3AED", purpleLight: "#8B5CF6", purpleSoft: "#F5F3FF",
  lavender: "#DDD6FE", bg: "#F0EEFB", cream: "#FAF7F0",
  text: "#1E1B4B", textMid: "#4C4682", textMuted: "#9896B8",
  border: "#E5E1F8", red: "#EF4444",
};

const concerns = [
  "Anxiety", "Depression", "Stress", "Trauma & PTSD",
  "Relationship Issues", "Sleep Problems", "Grief & Loss",
  "Self-esteem", "Other",
];

export default function PatientSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", dob: "", email: "", phone: "",
    password: "", confirmPassword: "",
    primaryConcern: "", agreed: false,
  });

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!form.fullName.trim())    e.fullName    = "Full name is required";
    if (!form.email.trim())       e.email       = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())       e.phone       = "Phone number is required";
    if (!form.password)           e.password    = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!form.primaryConcern)     e.primaryConcern = "Please select a concern";
    if (!form.agreed)             e.agreed      = "You must agree to the terms";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    setApiError("");
    try {
      const result = await patientSignup(form);
      if (result.error) {
        setApiError(result.error);
        setLoading(false);
        return;
      }
      saveSession(result.token, result.user);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch (err) {
      setApiError("Connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const inp = (field) => ({
    width: "100%", padding: "14px 16px",
    border: `1.5px solid ${errors[field] ? colors.red : colors.border}`,
    borderRadius: 14, fontSize: 15,
    fontFamily: "'Nunito', sans-serif", fontWeight: 500,
    color: colors.text, background: "#FFFFFF", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box",
  });

  const lbl = {
    fontSize: 11, fontWeight: 800, color: colors.textMuted,
    letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: 6, display: "block", fontFamily: "'Nunito', sans-serif",
  };

  // ── Success ──────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={S.page}>
        <div style={S.blobA} /><div style={S.blobB} />
        <div style={S.card}>
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: colors.text, marginBottom: 10 }}>
              Account Created!
            </h2>
            <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.6, marginBottom: 24, fontFamily: "'Nunito', sans-serif" }}>
              Welcome to CalmMind,{" "}
              <strong style={{ color: colors.purple }}>{form.fullName.split(" ")[0]}</strong>!
              <br />Your wellness journey starts now. 🌿
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{ ...S.submitBtn, background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})` }}
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
        <style>{globalStyles}</style>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
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
          <span style={{ fontSize: 36 }}>🧘‍♀️</span>
          <h1 style={S.heading}>Patient Sign Up</h1>
        </div>
        <p style={S.subtitle}>Create your account to start your wellness journey.</p>

        <div style={{ display: "flex", gap: 8, marginTop: 14, marginBottom: 28 }}>
          <button type="button" style={{ ...S.roleTab, background: colors.purple, color: "#fff", border: `1.5px solid ${colors.purple}` }}>
            🧘‍♀️ Patient
          </button>
          <button type="button" onClick={() => navigate("/therapist-signup")} style={{ ...S.roleTab, background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}` }}>
            👩‍⚕️ Psychologist
          </button>
          <button type="button" onClick={() => navigate("/admin-signup")} style={{ ...S.roleTab, background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}` }}>
            🏢 Admin
          </button>
        </div>

        {/* Global API error */}
        {apiError && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#EF4444", borderRadius: 12, padding: "12px 16px", fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: "'Nunito', sans-serif" }}>
            ⚠️ {apiError}
          </div>
        )}

        <div style={S.grid}>
          <div>
            <label style={lbl}>Full Name</label>
            <input type="text" placeholder="Anya Sharma" value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)} style={inp("fullName")} />
            {errors.fullName && <span style={S.err}>{errors.fullName}</span>}
          </div>

          <div>
            <label style={lbl}>Date of Birth</label>
            <input type="date" value={form.dob}
              onChange={(e) => setField("dob", e.target.value)} style={inp("dob")} />
          </div>

          <div>
            <label style={lbl}>Email Address</label>
            <input type="email" placeholder="anya@email.com" value={form.email}
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
            <label style={lbl}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} placeholder="••••••••"
                value={form.password} onChange={(e) => setField("password", e.target.value)}
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
              <input type={showConfirm ? "text" : "password"} placeholder="••••••••"
                value={form.confirmPassword} onChange={(e) => setField("confirmPassword", e.target.value)}
                style={{ ...inp("confirmPassword"), paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={S.eyeBtn}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && <span style={S.err}>{errors.confirmPassword}</span>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>Primary Concern</label>
            <select value={form.primaryConcern}
              onChange={(e) => setField("primaryConcern", e.target.value)}
              style={{ ...inp("primaryConcern"), cursor: "pointer" }}>
              <option value="">Select your primary concern...</option>
              {concerns.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.primaryConcern && <span style={S.err}>{errors.primaryConcern}</span>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}
              onClick={() => setField("agreed", !form.agreed)}>
              <div style={{
                width: 20, height: 20, minWidth: 20, borderRadius: 6, marginTop: 2,
                border: `2px solid ${errors.agreed ? colors.red : form.agreed ? colors.purple : colors.border}`,
                background: form.agreed ? colors.purple : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
              }}>
                {form.agreed && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14, color: colors.textMid, fontFamily: "'Nunito', sans-serif", lineHeight: 1.5 }}>
                I agree to the{" "}
                <a href="#" onClick={(e) => e.stopPropagation()} style={{ color: colors.purple, fontWeight: 700 }}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" onClick={(e) => e.stopPropagation()} style={{ color: colors.purple, fontWeight: 700 }}>Privacy Policy</a>.
              </span>
            </div>
            {errors.agreed && <span style={{ ...S.err, marginLeft: 30 }}>{errors.agreed}</span>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button type="button" onClick={handleSubmit} disabled={loading}
              style={{
                ...S.submitBtn,
                background: loading ? colors.textMuted : `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`,
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={S.spinner} /> Creating Account...
                </span>
              ) : "Create My Account →"}
            </button>
          </div>

          <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: "'Nunito', sans-serif" }}>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} style={{ color: colors.purple, fontWeight: 700, cursor: "pointer" }}>Sign In</span>
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
  input:focus, select:focus { outline: none; border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
  button { font-family: 'Nunito', sans-serif; border: none; }
  a { text-decoration: none; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
`;

const S = {
  page:      { minHeight: "100vh", background: "#F0EEFB", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 48px", fontFamily: "'Nunito', sans-serif", position: "relative", overflow: "hidden" },
  blobA:     { position: "fixed", width: 420, height: 420, background: "radial-gradient(circle, #C4B5FD44 0%, transparent 70%)", top: -120, left: -120, animation: "blob 9s ease-in-out infinite", pointerEvents: "none", zIndex: 0 },
  blobB:     { position: "fixed", width: 320, height: 320, background: "radial-gradient(circle, #DDD6FE33 0%, transparent 70%)", bottom: -80, right: -80, animation: "blob 11s ease-in-out infinite reverse", pointerEvents: "none", zIndex: 0 },
  logoWrap:  { display: "flex", alignItems: "center", gap: 8, marginBottom: 24, cursor: "pointer", zIndex: 1, animation: "fadeUp 0.4s ease both" },
  logoText:  { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#7C3AED" },
  card:      { background: "#FAF7F0", borderRadius: 28, padding: "40px 48px", width: "100%", maxWidth: 680, boxShadow: "0 8px 60px rgba(124,58,237,0.12)", position: "relative", zIndex: 1, animation: "fadeUp 0.5s ease both" },
  heading:   { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "#1E1B4B", letterSpacing: "-0.5px" },
  subtitle:  { fontSize: 15, color: "#9896B8", fontWeight: 500, fontFamily: "'Nunito', sans-serif" },
  backBtn:   { background: "none", color: "#9896B8", fontSize: 13, fontWeight: 700, padding: "0 0 14px", cursor: "pointer", display: "block" },
  roleTab:   { padding: "7px 16px", borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Nunito', sans-serif" },
  grid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" },
  err:       { display: "block", marginTop: 5, fontSize: 11, color: "#EF4444", fontWeight: 700, fontFamily: "'Nunito', sans-serif" },
  eyeBtn:    { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", fontSize: 16, cursor: "pointer", padding: 4, border: "none" },
  submitBtn: { width: "100%", padding: "16px", borderRadius: 50, color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: "0.3px", boxShadow: "0 6px 24px rgba(124,58,237,0.35)", transition: "all 0.2s ease" },
  spinner:   { width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
};

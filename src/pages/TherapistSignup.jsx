import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { therapistSignup } from "../api";

const colors = {
  purple: "#7C3AED", purpleLight: "#8B5CF6",
  teal: "#0E7490", tealLight: "#0891B2", tealSoft: "#ECFEFF", tealBorder: "#A5F3FC",
  bg: "#F0EEFB", cream: "#FAF7F0", text: "#1E1B4B",
  textMid: "#4C4682", textMuted: "#9896B8", border: "#E5E1F8", red: "#EF4444",
};

const specializations = [
  "Clinical Psychology", "Cognitive Behavioral Therapy", "Child & Teen Psychology",
  "Mindfulness & Meditation", "Trauma Therapy", "Couples Therapy",
  "Psychiatry", "Behavioral Therapy", "Grief Counseling", "Addiction Counseling",
];

export default function TherapistSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "", licenseNumber: "", email: "", phone: "",
    specialization: "", yearsExp: "", password: "", confirmPassword: "",
  });

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [apiError,    setApiError]    = useState("");

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
    setApiError("");
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim())      e.fullName      = "Full name is required";
    if (!form.licenseNumber.trim()) e.licenseNumber = "License number is required";
    if (!form.email.trim())         e.email         = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())         e.phone         = "Phone number is required";
    if (!form.specialization)       e.specialization= "Please select a specialization";
    if (!form.yearsExp.toString().trim()) e.yearsExp = "Required";
    else if (isNaN(form.yearsExp) || +form.yearsExp < 0) e.yearsExp = "Enter a valid number";
    if (!form.password)             e.password      = "Password is required";
    else if (form.password.length < 6) e.password   = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    setApiError("");

    try {
      const result = await therapistSignup({
        fullName:       form.fullName,
        email:          form.email,
        phone:          form.phone,
        licenseNumber:  form.licenseNumber,
        specialization: form.specialization,
        yearsExp:       form.yearsExp,
        password:       form.password,
      });

      if (result.error) {
        setApiError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setApiError("Connection failed. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (field) => ({
    width: "100%", padding: "14px 16px",
    border: `1.5px solid ${errors[field] ? colors.red : colors.border}`,
    borderRadius: 14, fontSize: 15, fontFamily: "'Nunito', sans-serif",
    fontWeight: 500, color: colors.text, background: "#FFFFFF", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
  });

  const labelStyle = {
    fontSize: 11, fontWeight: 800, color: colors.textMuted,
    letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: 6, display: "block", fontFamily: "'Nunito', sans-serif",
  };

  if (success) {
    setTimeout(() => navigate("/psychologist-dashboard"), 1800);
    return (
      <div style={styles.page}>
        <div style={styles.blobA} /><div style={styles.blobB} />
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>📋</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: colors.text, marginBottom: 10 }}>
              Application Submitted!
            </h2>
            <p style={{ color: colors.textMuted, fontSize: 15, lineHeight: 1.6, marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>
              Thank you, <strong style={{ color: colors.teal }}>{form.fullName}</strong>!<br />
              Your license will be verified within <strong>24–48 hours</strong>.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: colors.tealSoft, border: `1.5px solid ${colors.tealBorder}`, color: colors.teal, borderRadius: 50, padding: "10px 24px", fontSize: 14, fontWeight: 700, marginBottom: 32, fontFamily: "'Nunito', sans-serif" }}>
              👩‍⚕️ Psychologist Account — Pending Review
            </div>
            <br />
            <button type="button" onClick={() => navigate("/login")}
              style={{ ...styles.submitBtn, background: `linear-gradient(135deg, ${colors.teal}, ${colors.tealLight})` }}>
              Go to Login →
            </button>
          </div>
        </div>
        <style>{globalStyles}</style>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.blobA} /><div style={styles.blobB} />

      <div style={styles.logoWrap} onClick={() => navigate("/")}>
        <span style={{ fontSize: 26 }}>🌿</span>
        <span style={styles.logoText}>CalmMind</span>
      </div>

      <div style={styles.card}>
        <button type="button" onClick={() => navigate("/login")} style={styles.backBtn}>← Back to Login</button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 36 }}>👩‍⚕️</span>
          <h1 style={styles.heading}>Psychologist Sign Up</h1>
        </div>
        <p style={styles.subtitle}>Join our network of licensed mental health professionals.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 28, marginTop: 14 }}>
          <button type="button" onClick={() => navigate("/patient-signup")}
            style={{ ...styles.roleTab, background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}` }}>
            🧘‍♀️ Patient
          </button>
          <button type="button"
            style={{ ...styles.roleTab, background: colors.teal, color: "#fff", border: `1.5px solid ${colors.teal}` }}>
            👩‍⚕️ Psychologist
          </button>
          <button type="button" onClick={() => navigate("/admin-signup")}
            style={{ ...styles.roleTab, background: "transparent", color: colors.textMuted, border: `1.5px solid ${colors.border}` }}>
            🏢 Admin
          </button>
        </div>

        {apiError && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#EF4444", borderRadius: 12, padding: "12px 16px", fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: "'Nunito', sans-serif" }}>
            ⚠️ {apiError}
          </div>
        )}

        <div style={styles.grid}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" placeholder="Dr. Anya Sharma" value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)} style={inputStyle("fullName")} />
            {errors.fullName && <span style={styles.errMsg}>{errors.fullName}</span>}
          </div>

          <div>
            <label style={labelStyle}>License Number</label>
            <input type="text" placeholder="PSY-2024-XXXXX" value={form.licenseNumber}
              onChange={(e) => set("licenseNumber", e.target.value)} style={inputStyle("licenseNumber")} />
            {errors.licenseNumber && <span style={styles.errMsg}>{errors.licenseNumber}</span>}
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="dr.anya@clinic.com" value={form.email}
              onChange={(e) => set("email", e.target.value)} style={inputStyle("email")} />
            {errors.email && <span style={styles.errMsg}>{errors.email}</span>}
          </div>

          <div>
            <label style={labelStyle}>Phone</label>
            <input type="tel" placeholder="+92 300 0000000" value={form.phone}
              onChange={(e) => set("phone", e.target.value)} style={inputStyle("phone")} />
            {errors.phone && <span style={styles.errMsg}>{errors.phone}</span>}
          </div>

          <div>
            <label style={labelStyle}>Specialization</label>
            <select value={form.specialization} onChange={(e) => set("specialization", e.target.value)}
              style={{ ...inputStyle("specialization"), cursor: "pointer" }}>
              <option value="">Select specialization...</option>
              {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.specialization && <span style={styles.errMsg}>{errors.specialization}</span>}
          </div>

          <div>
            <label style={labelStyle}>Years of Experience</label>
            <input type="number" placeholder="e.g. 8" min="0" max="60" value={form.yearsExp}
              onChange={(e) => set("yearsExp", e.target.value)} style={inputStyle("yearsExp")} />
            {errors.yearsExp && <span style={styles.errMsg}>{errors.yearsExp}</span>}
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                onChange={(e) => set("password", e.target.value)}
                style={{ ...inputStyle("password"), paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <span style={styles.errMsg}>{errors.password}</span>}
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                style={{ ...inputStyle("confirmPassword"), paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && <span style={styles.errMsg}>{errors.confirmPassword}</span>}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={styles.noticeBox}>
              <span style={{ fontSize: 18 }}>📋</span>
              <span style={{ fontSize: 14, color: colors.textMid, fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>
                Your license will be verified within <strong>24–48 hours</strong> before activation.
              </span>
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <button type="button" onClick={handleSubmit} disabled={loading}
              style={{
                ...styles.submitBtn,
                background: loading ? colors.textMuted : `linear-gradient(135deg, ${colors.teal}, ${colors.tealLight})`,
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={styles.spinnerDot} /> Submitting Application...
                </span>
              ) : "Submit Application →"}
            </button>
          </div>

          <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: "'Nunito', sans-serif" }}>
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} style={{ color: colors.teal, fontWeight: 700, cursor: "pointer" }}>Sign In</span>
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
  input:focus, select:focus { outline: none; border-color: #0E7490 !important; box-shadow: 0 0 0 3px rgba(14,116,144,0.12); }
  button { font-family: 'Nunito', sans-serif; border: none; }
  a { text-decoration: none; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
`;

const styles = {
  page:      { minHeight: "100vh", background: "#F0EEFB", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 48px", fontFamily: "'Nunito', sans-serif", position: "relative", overflow: "hidden" },
  blobA:     { position: "fixed", width: 420, height: 420, background: "radial-gradient(circle, #A5F3FC33 0%, transparent 70%)", top: -120, left: -120, animation: "blob 9s ease-in-out infinite", pointerEvents: "none", zIndex: 0 },
  blobB:     { position: "fixed", width: 320, height: 320, background: "radial-gradient(circle, #C4B5FD22 0%, transparent 70%)", bottom: -80, right: -80, animation: "blob 11s ease-in-out infinite reverse", pointerEvents: "none", zIndex: 0 },
  logoWrap:  { display: "flex", alignItems: "center", gap: 8, marginBottom: 24, cursor: "pointer", zIndex: 1, animation: "fadeUp 0.4s ease both" },
  logoText:  { fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#7C3AED" },
  card:      { background: "#FAF7F0", borderRadius: 28, padding: "40px 48px", width: "100%", maxWidth: 680, boxShadow: "0 8px 60px rgba(14,116,144,0.10)", position: "relative", zIndex: 1, animation: "fadeUp 0.5s ease both" },
  heading:   { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "#1E1B4B", letterSpacing: "-0.5px" },
  subtitle:  { fontSize: 15, color: "#9896B8", fontWeight: 500, fontFamily: "'Nunito', sans-serif" },
  backBtn:   { background: "none", color: "#9896B8", fontSize: 13, fontWeight: 700, padding: "0 0 14px", cursor: "pointer", display: "block" },
  roleTab:   { padding: "7px 16px", borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Nunito', sans-serif" },
  grid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" },
  errMsg:    { display: "block", marginTop: 5, fontSize: 11, color: "#EF4444", fontWeight: 700, fontFamily: "'Nunito', sans-serif" },
  eyeBtn:    { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", fontSize: 16, cursor: "pointer", padding: 4, border: "none" },
  noticeBox: { display: "flex", alignItems: "center", gap: 12, background: "#EDE9FE", border: "1px solid #DDD6FE", borderRadius: 14, padding: "14px 18px" },
  submitBtn: { width: "100%", padding: "16px", borderRadius: 50, color: "#fff", fontSize: 16, fontWeight: 800, letterSpacing: "0.3px", boxShadow: "0 6px 24px rgba(14,116,144,0.30)", transition: "all 0.2s ease" },
  spinnerDot:{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
};

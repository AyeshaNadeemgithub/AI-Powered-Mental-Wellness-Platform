import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { colors, fonts, radius, shadows } from "../styles/theme";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    navigate("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F8F6FF" }}>
      <div style={{ width: 420, background: "#fff", borderRadius: radius.lg, boxShadow: shadows.md, padding: 36 }}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 32, marginBottom: 16, color: colors.text }}>Create account</h1>
        <p style={{ fontFamily: fonts.body, color: colors.textMid, marginBottom: 24 }}>Enter a username and password to continue.</p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontFamily: fonts.body, fontWeight: 700, marginBottom: 8 }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{ width: "100%", padding: "10px 12px", borderRadius: radius.md, border: `1px solid ${colors.border}`, marginBottom: 16, fontFamily: fonts.body }}
          />
          <label style={{ display: "block", fontFamily: fonts.body, fontWeight: 700, marginBottom: 8 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", padding: "10px 12px", borderRadius: radius.md, border: `1px solid ${colors.border}`, marginBottom: 16, fontFamily: fonts.body }}
          />
          {error && <div style={{ color: "#B91C1C", fontWeight: 700, marginBottom: 14 }}>{error}</div>}
          <Button type="submit" size="lg" style={{ width: "100%" }}>Sign Up</Button>
        </form>
        <p style={{ marginTop: 16, fontFamily: fonts.body, color: colors.textMid, fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: colors.purple, fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

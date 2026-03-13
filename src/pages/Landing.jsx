import { useNavigate } from "react-router-dom";
import { Logo } from "../components/ui/Brand";
import Button from "../components/ui/Button";
import { colors, fonts, radius, shadows } from "../styles/theme";
import { FEATURES, STATS, FOOTER_LINKS, SOCIAL_ICONS } from "../data";
import { useState } from "react";

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 60px",
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${colors.border}`,
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: shadows.navbar,
    }}>
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {["Features","Therapists"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{
            fontFamily: fonts.body, fontSize: 14, fontWeight: 700,
            color: colors.textMid, textDecoration: "none",
            borderBottom: l === "Features" ? `2.5px solid ${colors.purple}` : "2.5px solid transparent",
            paddingBottom: 3,
          }}>{l}</a>
        ))}

        {/* ✅ FIXED: was <a href="#"> — now navigates to /login */}
        <a
          onClick={() => navigate("/login")}
          style={{
            fontFamily: fonts.body, fontSize: 14, fontWeight: 700,
            color: colors.textMid, textDecoration: "none", cursor: "pointer",
          }}
        >
          Login
        </a>

        <Button onClick={() => navigate("/patient-signup")} size="sm">Sign Up</Button>
      </div>
    </nav>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  return (
    <section style={{
      position: "relative",
      minHeight: "520px",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
    }}>
      <img
        src="/hero-image.png"
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          zIndex: 0,
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(30, 10, 60, 0.35)",
        zIndex: 1,
      }} />
      <div style={{ position: "relative", zIndex: 2, padding: "64px 80px", maxWidth: 560 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.15)", color: "#fff",
          fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
          textTransform: "uppercase", padding: "6px 16px", borderRadius: "999px",
          marginBottom: 24, border: "1px solid rgba(255,255,255,0.3)",
          fontFamily: fonts.body, backdropFilter: "blur(8px)",
        }}>✦ Mental Wellness Platform</div>
        <h1 style={{
          fontFamily: fonts.display, fontSize: 56, fontWeight: 700,
          color: "#fff", lineHeight: 1.08, marginBottom: 20, letterSpacing: "-0.02em",
        }}>
          Your Journey<br />To{" "}
          <span style={{ color: "#C4B5FD" }}>Inner Peace</span><br />
          Starts Here.
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 700, marginBottom: 36, lineHeight: 1.55, fontFamily: fonts.body }}>
          Support For Today. Strength For Tomorrow.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Button onClick={() => navigate("/patient-signup")} size="lg">Get Started →</Button>
          <Button variant="ghost" size="lg">Watch Demo ▶</Button>
        </div>
      </div>
    </section>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = () => (
  <div style={{
    display: "flex", background: "#fff",
    borderTop: `1px solid ${colors.border}`,
    borderBottom: `1px solid ${colors.border}`,
  }}>
    {STATS.map((s, i) => (
      <div key={i} style={{
        flex: 1, padding: "28px 16px", textAlign: "center",
        borderRight: i < STATS.length - 1 ? `1px solid ${colors.border}` : "none",
      }}>
        <div style={{ fontFamily: fonts.display, fontSize: 32, fontWeight: 700, color: colors.purple }}>{s.value}</div>
        <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
      </div>
    ))}
  </div>
);

// ─── Features ─────────────────────────────────────────────────────────────────
const Features = () => {
  const [hov, setHov] = useState(null);
  return (
    <section id="features" style={{ padding: "80px 80px", background: colors.bg }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: colors.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12, fontFamily: fonts.body }}>
          Everything You Need
        </div>
        <h2 style={{ fontFamily: fonts.display, fontSize: 40, fontWeight: 700, color: colors.text, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          Built For Your Wellbeing
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, maxWidth: 1000, margin: "0 auto" }}>
        {FEATURES.map((f, i) => (
          <div key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{
              background: "#fff", borderRadius: radius.lg, padding: "26px 22px",
              border: hov === i ? `1.5px solid ${colors.purple}` : `1.5px solid ${colors.border}`,
              boxShadow: hov === i ? `0 8px 32px ${colors.purple}20` : "0 2px 12px rgba(0,0,0,0.05)",
              transition: "all 0.2s", transform: hov === i ? "translateY(-3px)" : "none",
            }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: colors.purpleSoft, border: `1px solid ${colors.lavender}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>{f.icon}</div>
              <span style={{
                fontSize: 9, fontFamily: fonts.body, fontWeight: 800,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: colors.purple, background: colors.purpleSoft,
                padding: "3px 10px", borderRadius: radius.full,
                border: `1px solid ${colors.lavender}`,
              }}>{f.tag}</span>
            </div>
            <h3 style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 10, lineHeight: 1.3 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.65, fontWeight: 600, fontFamily: fonts.body }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── CTA ──────────────────────────────────────────────────────────────────────
const CTA = () => {
  const navigate = useNavigate();
  return (
    <section style={{ padding: "80px 80px", background: "#fff" }}>
      <div style={{
        maxWidth: 800, margin: "0 auto",
        background: `linear-gradient(135deg, ${colors.purpleSoft} 0%, #EDE9FE 100%)`,
        borderRadius: 28, padding: "64px",
        textAlign: "center",
        border: `1.5px solid ${colors.lavender}`,
        boxShadow: `0 8px 40px ${colors.purple}15`,
      }}>
        <h2 style={{ fontFamily: fonts.display, fontSize: 42, fontWeight: 700, color: colors.text, marginBottom: 16, lineHeight: 1.15 }}>
          Ready to Find Your Calm?
        </h2>
        <p style={{ fontFamily: fonts.body, fontSize: 16, color: colors.textMid, marginBottom: 40, lineHeight: 1.6 }}>
          Join over 2 million people who've transformed their mental wellness.<br />Free forever to start.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Button onClick={() => navigate("/patient-signup")} size="lg">Create Free Account</Button>
          <Button variant="ghost" size="lg">Talk to a Therapist</Button>
        </div>
        <p style={{ marginTop: 24, fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>
          No credit card required · Cancel anytime · HIPAA compliant
        </p>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ background: "#1E1B4B", color: "#fff", padding: "48px 80px 28px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
      <Logo dark />
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
        {FOOTER_LINKS.map(l => (
          <a key={l} href="#" style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 600 }}>{l}</a>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {SOCIAL_ICONS.map((ic, i) => (
          <div key={i} style={{
            width: 34, height: 34, borderRadius: 8,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, cursor: "pointer", color: "#fff",
          }}>{ic}</div>
        ))}
      </div>
    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 20, textAlign: "center" }}>
      <p style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
        © 2026 CalmMind Technologies. All rights reserved.
      </p>
    </div>
  </footer>
);

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const Landing = () => (
  <div style={{ minHeight: "100vh", background: "#F8F6FF" }}>
    <Navbar />
    <Hero />
    <StatsBar />
    <Features />
    <CTA />
    <Footer />
  </div>
);

export default Landing;
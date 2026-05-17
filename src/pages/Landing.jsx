import { useNavigate } from "react-router-dom";
import { Logo } from "../components/ui/Brand";
import Button from "../components/ui/Button";
import { colors, fonts, radius, shadows } from "../styles/theme";
import { FEATURES, STATS, FOOTER_LINKS, SOCIAL_ICONS } from "../data";
import { useState, useEffect, useRef, useMemo } from "react";
import * as api from "../api";

// ─── TESTIMONIALS DATA ────────────────────────────────────────────────────────
const TESTIMONIALS = [
  "CalmMind transformed how I handle stress. The therapists are truly compassionate.",
  "The AI support is great for late-night anxiety, but Alam really helped me long-term.",
  "I've never felt more understood. This platform is a lifesaver for busy professionals.",
];

// ─── Floating Sparkles Component ──────────────────────────────────────────────
const FloatingSparkles = () => {
  const sparkles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      size: Math.random() * 5 + 1.5,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 20 + 10}s`,
      opacity: Math.random() * 0.5 + 0.1,
      x1: `${(Math.random() - 0.5) * 150}px`,
      y1: `${(Math.random() - 0.5) * 150}px`,
      x2: `${(Math.random() - 0.5) * 150}px`,
      y2: `${(Math.random() - 0.5) * 150}px`,
    }));
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1, pointerEvents: "none" }}>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="hero-sparkle"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            "--duration": s.duration,
            "--opacity": s.opacity,
            "--x1": s.x1,
            "--y1": s.y1,
            "--x2": s.x2,
            "--y2": s.y2,
            boxShadow: `0 0 ${s.size * 2}px white`,
          }}
        />
      ))}
    </div>
  );
};

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
const useScrollReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("features");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const feat = document.getElementById("features");
      const ther = document.getElementById("therapists");
      if (ther && window.scrollY >= ther.offsetTop - 150) setActiveTab("therapists");
      else if (feat && window.scrollY >= feat.offsetTop - 150) setActiveTab("features");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkStyle = (key) => ({
    fontFamily: fonts.body, fontSize: 14, fontWeight: 700,
    color: activeTab === key ? colors.purple : colors.textMid,
    textDecoration: "none",
    borderBottom: activeTab === key ? `2.5px solid ${colors.purple}` : "2.5px solid transparent",
    paddingBottom: 3,
    transition: "all 0.3s ease",
    cursor: "pointer",
  });

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: scrolled ? "12px 60px" : "20px 60px",
      background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)",
      backdropFilter: "blur(20px)",
      borderBottom: `1px solid ${scrolled ? colors.border : "transparent"}`,
      position: "sticky", top: 0, zIndex: 1000,
      boxShadow: scrolled ? "0 10px 40px rgba(124,58,237,0.15)" : "none",
      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      <div className="hover-scale-sm"><Logo /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <a href="#features" className="hover-glow" onClick={() => setActiveTab("features")} style={navLinkStyle("features")}>Features</a>
        <a href="#therapists" className="hover-glow" onClick={() => setActiveTab("therapists")} style={navLinkStyle("therapists")}>Therapists</a>
        <a
          onClick={() => navigate("/login")}
          className="hover-glow"
          style={{
            fontFamily: fonts.body, fontSize: 14, fontWeight: 700,
            color: colors.textMid, textDecoration: "none", cursor: "pointer",
          }}
        >
          Login
        </a>
        <Button onClick={() => navigate("/patient-signup")} size="sm" className="glow-pulse">Sign Up</Button>
      </div>
    </nav>
  );
};

// ─── Video Modal ─────────────────────────────────────────────────────────────
const VideoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(30, 27, 75, 0.85)",
      backdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        width: "100%", maxWidth: 1000, position: "relative",
        background: "#000", borderRadius: 24, overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
      }} onClick={e => e.stopPropagation()}>
        <video 
          src="/demo-video.mp4" 
          controls 
          autoPlay 
          style={{ width: "100%", display: "block" }}
        />
        <button 
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "rgba(255,255,255,0.2)", border: "none",
            color: "#fff", width: 40, height: 40, borderRadius: "50%",
            fontSize: 24, cursor: "pointer", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section style={{
      position: "relative",
      minHeight: "520px",
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
    }}>
      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
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
      <FloatingSparkles />
      <div style={{ position: "relative", zIndex: 2, padding: "64px 80px", maxWidth: 560 }}>
        <div className="zoom-in" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.15)", color: "#fff",
          fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
          textTransform: "uppercase", padding: "6px 16px", borderRadius: "999px",
          marginBottom: 24, border: "1px solid rgba(255,255,255,0.3)",
          fontFamily: fonts.body, backdropFilter: "blur(8px)",
        }}>✦ Mental Wellness Platform</div>
        <h1 className="rotate-in" style={{
          fontFamily: fonts.display, fontSize: 56, fontWeight: 700,
          color: "#fff", lineHeight: 1.08, marginBottom: 20, letterSpacing: "-0.02em",
        }}>
          Your Journey<br />To{" "}
          <span style={{ color: "#C4B5FD" }}>Inner Peace</span><br />
          Starts Here.
        </h1>
        <p className="slide-up stagger-2" style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 700, marginBottom: 36, lineHeight: 1.55, fontFamily: fonts.body }}>
          Support For Today. Strength For Tomorrow.
        </p>
        <div className="slide-up stagger-3" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Button onClick={() => navigate("/patient-signup")} size="lg" className="glow-pulse">Get Started →</Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="hover-glow"
            onClick={() => setShowVideo(true)}
          >
            Watch Demo ▶
          </Button>
        </div>
      </div>
    </section>
  );
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedCounter = ({ valueStr }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animatedOnce = useRef(false);

  const numMatch = valueStr.match(/[\d.]+/);
  const target = numMatch ? parseFloat(numMatch[0]) : 0;
  const suffix = numMatch ? valueStr.replace(numMatch[0], '') : '';
  const isFloat = valueStr.includes('.');

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // On initial load, wait for preloader (3.6s). Subsequent entries are instant.
        const delay = animatedOnce.current ? 0 : 3700;

        setTimeout(() => {
          let startTimestamp = null;
          const duration = 2000;

          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setCount(target * easeProgress);

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(target);
              animatedOnce.current = true;
            }
          };
          window.requestAnimationFrame(step);
        }, delay);
      } else {
        // Reset when scrolled out of view to allow re-animation
        setCount(0);
      }
    }, { threshold: 0.1 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  const displayValue = isFloat ? count.toFixed(1) : Math.floor(count);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = () => (
  <div style={{
    display: "flex", background: "#fff",
    borderTop: `1.5px solid ${colors.border}`,
    borderBottom: `1.5px solid ${colors.border}`,
  }}>
    {STATS.map((s, i) => (
      <div key={i} className="fade-in" style={{
        flex: 1, padding: "32px 16px", textAlign: "center",
        borderRight: i < STATS.length - 1 ? `1.5px solid ${colors.border}` : "none",
        animationDelay: `${i * 0.15}s`
      }}>
        <div style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 700, color: colors.purple }} className="hover-scale-sm">
          <AnimatedCounter valueStr={s.value} />
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
      </div>
    ))}
  </div>
);

// ─── Features ─────────────────────────────────────────────────────────────────
const Features = () => {
  const [hov, setHov] = useState(null);
  const revealRef = useScrollReveal();
  return (
    <section id="features" style={{ padding: "100px 80px", background: colors.bg }}>
      <div ref={revealRef} style={{ textAlign: "center", marginBottom: 64 }} className="reveal-on-scroll">
        <div style={{ fontSize: 11, fontWeight: 800, color: colors.purple, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, fontFamily: fonts.body }}>
          Everything You Need
        </div>
        <h2 style={{ fontFamily: fonts.display, fontSize: 48, fontWeight: 700, color: colors.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Built For Your Wellbeing
        </h2>
      </div>
      <div className="responsive-grid-3" style={{ gap: 24, maxWidth: 1100, margin: "0 auto" }}>
        {FEATURES.map((f, i) => (
          <div key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            className={`slide-up stagger-${(i % 3) + 1}`}
            style={{
              background: "#fff", borderRadius: radius.xl, padding: "32px 28px",
              border: "1.5px solid",
              borderColor: hov === i ? colors.purple : colors.border,
              transform: hov === i ? "translateY(-8px)" : "translateY(0)",
              boxShadow: hov === i ? `0 20px 50px rgba(124,58,237,0.18)` : "0 4px 20px rgba(0,0,0,0.05)",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              cursor: "pointer",
            }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: hov === i ? colors.purple : colors.purpleSoft,
                color: hov === i ? "#fff" : colors.purple,
                border: `1.5px solid ${colors.lavender}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                transition: "all 0.3s ease",
              }} className={hov === i ? "float-subtle" : ""}>{f.icon}</div>
              <span style={{
                fontSize: 10, fontFamily: fonts.body, fontWeight: 800,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: hov === i ? "#fff" : colors.purple,
                background: hov === i ? colors.purple : colors.purpleSoft,
                padding: "4px 12px", borderRadius: radius.full,
                border: `1.5px solid ${colors.lavender}`,
                transition: "all 0.3s ease",
              }}>{f.tag}</span>
            </div>
            <h3 style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 12, lineHeight: 1.3 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.7, fontWeight: 600, fontFamily: fonts.body }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Therapists ───────────────────────────────────────────────────────────────
const Therapists = () => {
  const [therapists] = useState([
    {
      id: "t1",
      name: "Dr. Sumbul",
      title: "Clinical Psychologist",
      about: "Dedicated professional helping patients achieve mental balance and wellness through personalized care.",
    },
    {
      id: "t2",
      name: "Dr. Alam",
      title: "Cognitive Behavioral Therapist",
      about: "Specializing in anxiety, depression, and stress management using modern therapeutic techniques.",
    },
    {
      id: "t3",
      name: "Dr. Muqadisa",
      title: "Family & Relationship Counselor",
      about: "Helping individuals and families navigate life transitions and foster meaningful relationships.",
    },
  ]);
  const [loading] = useState(false);
  const [hov, setHov] = useState(null);
  const revealRef = useScrollReveal();

  return (
    <section id="therapists" style={{ padding: "100px 80px", background: "#fff" }}>
      <div ref={revealRef} style={{ textAlign: "center", marginBottom: 64 }} className="reveal-on-scroll">
        <div style={{ fontSize: 11, fontWeight: 800, color: colors.purple, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, fontFamily: fonts.body }}>
          Expert Care
        </div>
        <h2 style={{ fontFamily: fonts.display, fontSize: 48, fontWeight: 700, color: colors.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Our Professional Therapists
        </h2>
      </div>

      <div className="responsive-grid-3" style={{ gap: 32, maxWidth: 1100, margin: "0 auto" }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{ height: 400, borderRadius: radius.xl, background: colors.bg, animation: "pulse 1.5s infinite" }} />
          ))
        ) : therapists.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: colors.textMuted, fontFamily: fonts.body, padding: "40px", background: colors.bg, borderRadius: radius.xl }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🤝</div>
            <p>Our specialists are currently updating their profiles. Check back soon!</p>
          </div>
        ) : therapists.map((t, i) => (
          <div key={t.id}
            onMouseEnter={() => setHov(t.id)}
            onMouseLeave={() => setHov(null)}
            className={`slide-up stagger-${(i % 3) + 1}`}
            style={{
              background: colors.bg, borderRadius: radius.xl, overflow: "hidden",
              boxShadow: hov === t.id ? `0 24px 60px rgba(124,58,237,0.22)` : "0 10px 30px rgba(0,0,0,0.05)",
              border: "1.5px solid",
              borderColor: hov === t.id ? colors.purple : colors.border,
              transform: hov === t.id ? "translateY(-10px)" : "translateY(0)",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              cursor: "pointer",
            }}>
            <div style={{ height: 260, overflow: "hidden", position: "relative" }}>
              <img
                src={i === 0 ? "/therapist1.jpg" : i === 1 ? "/therapist2.jpg" : "/therapist3.jpg"}
                alt={t.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                className={hov === t.id ? "hover-scale-sm" : ""}
              />
              <div style={{
                position: "absolute", bottom: 12, left: 12,
                background: colors.purple, color: "#fff",
                padding: "6px 14px", borderRadius: radius.full,
                fontSize: 10, fontWeight: 800,
                boxShadow: "0 4px 12px rgba(124,58,237,0.3)"
              }}>
                {t.title || t.specialization}
              </div>
            </div>
            <div style={{ padding: 28 }}>
              <h3 style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
                {t.name}
              </h3>
              <p style={{ fontSize: 14, color: colors.textMid, lineHeight: 1.6, marginBottom: 20, fontFamily: fonts.body, minHeight: 60 }}>
                {t.about || "Dedicated professional helping patients achieve mental balance and wellness through personalized care."}
              </p>
              <div style={{
                background: "#fff", padding: 18, borderRadius: radius.lg,
                borderLeft: `4px solid ${colors.purple}`,
                fontStyle: "italic", fontSize: 13, color: colors.textMid,
                fontFamily: fonts.body,
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
              }}>
                "{TESTIMONIALS[i] || TESTIMONIALS[0]}"
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── CTA ──────────────────────────────────────────────────────────────────────
const CTA = () => {
  const navigate = useNavigate();
  const revealRef = useScrollReveal();
  return (
    <section style={{ padding: "100px 80px", background: "#fff" }}>
      <div ref={revealRef} className="reveal-on-scroll" style={{
        maxWidth: 900, margin: "0 auto",
        background: `linear-gradient(135deg, ${colors.purpleSoft} 0%, #EDE9FE 100%)`,
        borderRadius: 40, padding: "80px",
        textAlign: "center",
        border: `2px solid ${colors.lavender}`,
        boxShadow: `0 15px 50px ${colors.purple}20`,
        position: "relative", overflow: "hidden",
      }}>
        <div className="gradient-animate" style={{ position: "absolute", inset: 0, opacity: 0.1, zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: 52, fontWeight: 700, color: colors.text, marginBottom: 20, lineHeight: 1.1 }}>
            Ready to Find Your Calm?
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: 18, color: colors.textMid, marginBottom: 48, lineHeight: 1.7 }}>
            Join over 2 million people who've transformed their mental wellness.<br />Free forever to start.
          </p>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            <Button onClick={() => navigate("/patient-signup")} size="lg" className="glow-pulse" style={{ padding: "18px 48px" }}>Create Free Account</Button>
            <Button variant="ghost" size="lg" className="hover-glow" onClick={() => navigate("/login")} style={{ padding: "18px 48px" }}>Talk to a Therapist</Button>
          </div>
          <p style={{ marginTop: 32, fontSize: 13, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 600 }}>
            No credit card required · Cancel anytime · HIPAA compliant
          </p>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ background: "#1E1B4B", color: "#fff", padding: "64px 80px 32px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, flexWrap: "wrap", gap: 32 }}>
      <div className="hover-scale-sm"><Logo dark /></div>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        {FOOTER_LINKS.map(l => (
          <a key={l} href="#" className="hover-glow" style={{ fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: 600 }}>{l}</a>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {SOCIAL_ICONS.map((ic, i) => (
          <div key={i} className="hover-scale-sm" style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, cursor: "pointer", color: "#fff",
            transition: "all 0.3s ease",
          }}>{ic}</div>
        ))}
      </div>
    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 24, textAlign: "center" }}>
      <p style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
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
    <Therapists />
    <CTA />
    <Footer />
  </div>
);

export default Landing;
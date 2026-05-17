import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AiChat from "./pages/AiChat";
import TherapistChat from "./pages/TherapistChat";
import MoodTracking from "./pages/MoodTracking";
import Journal from "./pages/Journal";
import Appointments from "./pages/Appointments";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import PatientSignup from "./pages/PatientSignup";
import TherapistSignup from "./pages/TherapistSignup";
import AdminSignup from "./pages/AdminSignup";
import AdminDashboard from "./pages/AdminDashboard";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import PatientHistory from "./pages/PatientHistory";
import { isLoggedIn } from "./api";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// ─── Sparkle Cursor ──────────────────────────────────────────────────────────
const SparkleCursor = () => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle-particle";
      const size = Math.random() * 8 + 4;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;

      const x = (Math.random() - 0.5) * 150;
      const y = (Math.random() - 0.5) * 150;
      sparkle.style.setProperty("--tw-x", `${x}px`);
      sparkle.style.setProperty("--tw-y", `${y}px`);

      const colors = ["#C4B5FD", "#A78BFA", "#7C3AED", "#F5D9A8", "#FFFFFF"];
      sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
      sparkle.style.boxShadow = `0 0 15px ${sparkle.style.background}`;

      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return null;
};

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
};

// ─── Preloader ──────────────────────────────────────────────────────────────
// ─── Preloader ──────────────────────────────────────────────────────────────
const Preloader = () => {
  const [fade, setFade] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "radial-gradient(circle at 20% 30%, #F5F3FF 0%, #EDE9FE 50%, #FAE8FF 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      opacity: fade ? 0 : 1, pointerEvents: fade ? "none" : "all",
      transition: "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      overflow: "hidden"
    }}>
      {/* Background soft glows */}
      <div style={{ position: "absolute", top: "10%", left: "10%", width: 500, height: 500, background: "#DDD6FE", filter: "blur(120px)", opacity: 0.45, borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 500, height: 500, background: "#F5D0FE", filter: "blur(120px)", opacity: 0.45, borderRadius: "50%" }} />

      {/* Global Sparkles */}
      {[...Array(60)].map((_, i) => {
        const size = Math.random() * 5 + 2;
        return (
          <div key={`bg-sparkle-${i}`} style={{
            position: "absolute",
            width: size, height: size, borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 0 10px #fff, 0 0 18px #A78BFA",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.2,
            animation: `floatSparkle ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`
          }} />
        );
      })}

      {/* Main Brand Name Top */}
      

      {/* Center Card */}
      <div style={{
        width: "92%", maxWidth: 680, height: 460,
        background: "rgba(255, 255, 255, 0.45)",
        backdropFilter: "blur(16px)",
        borderRadius: 32,
        border: "1.5px solid rgba(255, 255, 255, 0.7)",
        boxShadow: "0 30px 60px -12px rgba(124, 58, 237, 0.15), inset 0 0 30px rgba(255,255,255,0.6)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 2,
        padding: "40px"
      }}>
        {/* Meditation Image with Just Sparkles */}
        <div style={{ position: "relative", marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img 
            src="/meditation.png" 
            alt="Meditating" 
            style={{ 
              height: 180, width: "auto", objectFit: "contain", 
              filter: "drop-shadow(0 20px 40px rgba(124,58,237,0.3))", 
              position: "relative", zIndex: 10 
            }} 
          />

          {/* Premium 4-Pointed Stars (Sparkles) - Increased Count */}
          {[...Array(12)].map((_, i) => (
            <svg key={i} width="24" height="24" viewBox="0 0 200 200" style={{
              position: "absolute",
              top: `${Math.random() * 140 - 20}%`,
              left: `${Math.random() * 160 - 30}%`,
              zIndex: 11,
              animation: `floatSparkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2,
              filter: "drop-shadow(0 0 8px rgba(196, 181, 253, 0.8))"
            }}>
              <path d="M100 0C100 80 120 100 200 100C120 100 100 120 100 200C100 120 80 100 0 100C80 100 100 80 100 0Z" fill={i % 3 === 0 ? "#fff" : i % 3 === 1 ? "#C4B5FD" : "#A78BFA"} />
            </svg>
          ))}
        </div>

        {/* Text */}
        <h2 style={{ 
          fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, 
          color: "#1E1B4B", marginBottom: 12, textAlign: "center",
          letterSpacing: "-0.01em"
        }}>
          Breathe in...
        </h2>
        <p style={{ 
          fontFamily: "'Playfair Display', serif", fontSize: 22, fontStyle: "italic", fontWeight: 600, 
          color: "rgba(30, 27, 75, 0.75)", marginBottom: 40, textAlign: "center"
        }}>
          Preparing your wellness space.
        </p>

        {/* Progress Bar Container */}
        <div style={{
          width: "100%", maxWidth: 380, height: 10, 
          background: "rgba(124, 58, 237, 0.12)",
          borderRadius: 99, overflow: "hidden", position: "relative",
          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.08), 0 0 10px rgba(255,255,255,0.4)"
        }}>
          <div style={{
            height: "100%", 
            background: "linear-gradient(90deg, #7C3AED 0%, #C4B5FD 50%, #7C3AED 100%)",
            backgroundSize: "200% 100%",
            animation: "loadingBarMain 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards, progressShine 1.5s linear infinite",
            boxShadow: "0 0 20px rgba(124, 58, 237, 0.7)"
          }} />
        </div>
      </div>

      {/* Footer Text */}
      <div style={{ 
        position: "absolute", bottom: "6%", 
        fontFamily: "'Playfair Display', serif",
        fontSize: 16, color: "rgba(30, 27, 75, 0.55)", 
        fontWeight: 600, fontStyle: "italic", letterSpacing: "0.03em" 
      }}>
        Your Journey To Inner Peace Starts Here.
      </div>

      <style>{`
        @keyframes orbitRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes floatSparkle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; }
          50% { transform: translateY(-20px) scale(1.3); opacity: 1; }
        }
        @keyframes loadingBarMain {
          0% { width: 0%; }
          30% { width: 45%; }
          75% { width: 90%; }
          100% { width: 100%; }
        }
        @keyframes progressShine {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      {loading && <Preloader />}
      <div style={{ opacity: loading ? 0 : 1, transition: "opacity 0.6s ease-in" }}>
        <SparkleCursor />
        <Routes>
          {/* Public — no sidebar */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patient-signup" element={<PatientSignup />} />
          <Route path="/therapist-signup" element={<TherapistSignup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />

          {/* Admin & Psychologist Dashboards — custom layout */}
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/psychologist-dashboard" element={<ProtectedRoute><PsychologistDashboard /></ProtectedRoute>} />

          {/* App shell — all children get Sidebar + TopBar */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mood" element={<MoodTracking />} />
            <Route path="/ai-support" element={<AiChat />} />
            <Route path="/chat" element={<TherapistChat />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<PatientHistory />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
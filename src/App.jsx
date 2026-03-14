import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Pages
import Landing         from "./pages/Landing";
import Dashboard       from "./pages/Dashboard";
import Chat            from "./pages/Chat";
import MoodTracking    from "./pages/MoodTracking";
import Journal         from "./pages/Journal";
import Appointments    from "./pages/Appointments";
import Settings        from "./pages/Settings";
import NotFound        from "./pages/NotFound";
import Login           from "./pages/Login";
import PatientSignup   from "./pages/PatientSignup";
import TherapistSignup from "./pages/TherapistSignup";
import AdminSignup     from "./pages/AdminSignup";
import AdminDashboard        from "./pages/AdminDashboard";
import PsychologistDashboard from "./pages/PsychologistDashboard";

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public — no sidebar */}
      <Route path="/"                 element={<Landing />} />
      <Route path="/login"            element={<Login />} />
      <Route path="/patient-signup"   element={<PatientSignup />} />
      <Route path="/therapist-signup" element={<TherapistSignup />} />
      <Route path="/admin-signup"     element={<AdminSignup />} />

      {/* Admin & Psychologist Dashboards — custom layout */}
      <Route path="/admin-dashboard"        element={<AdminDashboard />} />
      <Route path="/psychologist-dashboard" element={<PsychologistDashboard />} />

      {/* App shell — all children get Sidebar + TopBar */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/mood"         element={<MoodTracking />} />
        <Route path="/chat"         element={<Chat />} />
        <Route path="/journal"      element={<Journal />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/settings"     element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
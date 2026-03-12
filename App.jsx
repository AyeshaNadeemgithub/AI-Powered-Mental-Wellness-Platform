import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Pages
import Landing      from "./pages/Landing";
import Signup       from "./pages/Signup";
import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Chat         from "./pages/Chat";
import MoodTracking from "./pages/MoodTracking";
import Journal      from "./pages/Journal";
import Appointments from "./pages/Appointments";
import Settings     from "./pages/Settings";
import NotFound     from "./pages/NotFound";

/**
 * Route map:
 *   /                → Landing page (public)
 *   /dashboard       → Dashboard  (app shell with sidebar)
 *   /mood            → Mood Tracking
 *   /chat            → AI Chat
 *   /journal         → Journal
 *   /appointments    → Appointments
 *   /settings        → Settings
 *   *                → 404
 */
const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

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

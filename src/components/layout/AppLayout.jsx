import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { colors } from "../../styles/theme";
import { useTheme } from "../../context/ThemeContext";
import { useState } from "react";

const AppLayout = () => {
  useTheme(); // subscribes to theme changes — re-renders this tree on every tick
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: colors.bg, position: "relative" }}>
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="desktop-only"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 998 }} 
        />
      )}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }} className="page-enter mobile-padding-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

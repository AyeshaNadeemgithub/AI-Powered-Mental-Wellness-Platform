import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { colors, shadows } from "../styles/theme";

// ─── Accent palettes ──────────────────────────────────────────────────────────
export const ACCENT_PALETTES = {
  purple: {
    purple:      "#7C3AED",
    purpleLight: "#8B5CF6",
    purpleHover: "#6D28D9",
    purplePale:  "#EDE9FE",
    purpleSoft:  "#F5F3FF",
    lavender:    "#DDD6FE",
    border:      "#E5E1F8",
  },
  teal: {
    purple:      "#0E7490",
    purpleLight: "#0891B2",
    purpleHover: "#0C6178",
    purplePale:  "#CFFAFE",
    purpleSoft:  "#ECFEFF",
    lavender:    "#A5F3FC",
    border:      "#BAE6FD",
  },
  rose: {
    purple:      "#BE185D",
    purpleLight: "#DB2777",
    purpleHover: "#9D174D",
    purplePale:  "#FCE7F3",
    purpleSoft:  "#FDF2F8",
    lavender:    "#F9A8D4",
    border:      "#FBCFE8",
  },
  amber: {
    purple:      "#B45309",
    purpleLight: "#D97706",
    purpleHover: "#92400E",
    purplePale:  "#FEF3C7",
    purpleSoft:  "#FFFBEB",
    lavender:    "#FDE68A",
    border:      "#FCD34D",
  },
  indigo: {
    purple:      "#3730A3",
    purpleLight: "#4338CA",
    purpleHover: "#312E81",
    purplePale:  "#E0E7FF",
    purpleSoft:  "#EEF2FF",
    lavender:    "#C7D2FE",
    border:      "#C7D2FE",
  },
};

const LIGHT_BASE = {
  bg: "#F0EEFB", sidebar: "#FFFFFF", card: "#FFFFFF",
  text: "#1E1B4B", textMid: "#4C4682", textMuted: "#9896B8",
};

const DARK_BASE = {
  bg: "#0F0E1A", sidebar: "#16152A", card: "#1E1C35",
  text: "#F0EEFF", textMid: "#B8B4D8", textMuted: "#6B6890",
};

export const FONT_SIZE_MAP = { small: 14, medium: 16, large: 18 };

const STORAGE_KEY = "calmmind_theme";
const ThemeContext = createContext(null);

function applyTheme(accentKey, colorMode, fontSize) {
  const palette = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.purple;
  const isDark  = colorMode === "dark" ||
    (colorMode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const base = isDark ? DARK_BASE : LIGHT_BASE;

  // Mutate the shared exported colors object so every component re-reads new values
  Object.assign(colors, { ...palette, ...base });

  // Update shadow accent colour
  shadows.purple   = `0 4px 16px ${palette.purple}55`;
  shadows.purpleLg = `0 8px 28px ${palette.purple}66`;

  // Apply to document
  document.documentElement.style.fontSize = `${FONT_SIZE_MAP[fontSize] || 16}px`;
  document.body.style.background = base.bg;
  document.body.style.color = base.text;
  document.body.style.transition = "background 0.3s, color 0.3s";
}

export const ThemeProvider = ({ children }) => {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  })();

  const [colorMode, setColorModeRaw] = useState(saved.colorMode || "light");
  const [accentKey, setAccentKeyRaw] = useState(saved.accentKey || "purple");
  const [fontSize,  setFontSizeRaw]  = useState(saved.fontSize  || "medium");
  const [tick, setTick] = useState(0);

  const bump = () => setTick(t => t + 1);

  const setColorMode = useCallback((v) => { setColorModeRaw(v); bump(); localStorage.setItem(STORAGE_KEY, JSON.stringify({ colorMode: v,        accentKey, fontSize })); }, [accentKey, fontSize]);
  const setAccentKey = useCallback((v) => { setAccentKeyRaw(v); bump(); localStorage.setItem(STORAGE_KEY, JSON.stringify({ colorMode, accentKey: v, fontSize })); }, [colorMode, fontSize]);
  const setFontSize  = useCallback((v) => { setFontSizeRaw(v);  bump(); localStorage.setItem(STORAGE_KEY, JSON.stringify({ colorMode, accentKey, fontSize: v  })); }, [colorMode, accentKey]);

  useEffect(() => { applyTheme(accentKey, colorMode, fontSize); }, [accentKey, colorMode, fontSize, tick]);

  return (
    <ThemeContext.Provider value={{ colorMode, setColorMode, accentKey, setAccentKey, fontSize, setFontSize, tick }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};

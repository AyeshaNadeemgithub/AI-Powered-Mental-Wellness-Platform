// Brand.jsx

// ── Real logo image ──────────────────────────────────────────────────────────
// mix-blend-mode: multiply makes the light lavender background invisible
// on any white/light surface without needing a transparent PNG
export const Logo = ({ size = "md", dark = false }) => {
  let height = 64;
  if (size === "sm") height = 36;
  else if (size === "lg") height = 90;
  else if (size === "xl") height = 120;

  return (
    <img
      src="/calmmind-logo.jpeg"
      alt="CalmMind"
      style={{
        height: height,
        width: "auto",
        objectFit: "contain",
        // Use multiply for light backgrounds, but normal for dark backgrounds
        mixBlendMode: dark ? "normal" : "multiply",
        display: "block",
        filter: dark ? "brightness(1.2)" : "none",
      }}
    />
  );
};

export const LogoMark = () => (
  <img
    src="/calmmind-logo.jpeg"
    alt="CalmMind"
    style={{
      height: 40,
      width: "auto",
      objectFit: "contain",
      mixBlendMode: "multiply",
      display: "block",
    }}
  />
);

// ── MeditationSVG — inline SVG so it never breaks regardless of image files ──
// Used in Chat.jsx (empty state) and Dashboard.jsx (welcome hero)
export const MeditationSVG = ({ size = 120 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Glow background circle */}
    <circle cx="100" cy="100" r="90" fill="#EDE9FE" opacity="0.6" />

    {/* Body sitting cross-legged */}
    <ellipse cx="100" cy="148" rx="44" ry="18" fill="#A78BFA" opacity="0.35" />
    <ellipse cx="100" cy="142" rx="38" ry="14" fill="#7C3AED" opacity="0.18" />

    {/* Left leg */}
    <path d="M62 148 Q72 160 100 158 Q128 160 138 148" stroke="#7C3AED" strokeWidth="5" strokeLinecap="round" fill="none" />

    {/* Torso */}
    <rect x="84" y="100" width="32" height="46" rx="16" fill="#7C3AED" opacity="0.85" />

    {/* Head */}
    <circle cx="100" cy="88" r="22" fill="#7C3AED" opacity="0.9" />

    {/* Face — closed eyes (meditating) */}
    <path d="M91 87 Q94 84 97 87" stroke="#EDE9FE" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M103 87 Q106 84 109 87" stroke="#EDE9FE" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Serene smile */}
    <path d="M94 93 Q100 98 106 93" stroke="#EDE9FE" strokeWidth="1.8" strokeLinecap="round" fill="none" />

    {/* Left arm + hand on knee */}
    <path d="M84 118 Q68 130 64 148" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="63" cy="150" r="5" fill="#A78BFA" />

    {/* Right arm + hand on knee */}
    <path d="M116 118 Q132 130 136 148" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="137" cy="150" r="5" fill="#A78BFA" />

    {/* Sparkles / energy dots */}
    <circle cx="60" cy="78" r="4" fill="#C4B5FD" opacity="0.8" />
    <circle cx="140" cy="72" r="3" fill="#C4B5FD" opacity="0.6" />
    <circle cx="52" cy="100" r="2.5" fill="#A78BFA" opacity="0.5" />
    <circle cx="148" cy="96" r="2" fill="#A78BFA" opacity="0.5" />
    <circle cx="100" cy="48" r="3.5" fill="#7C3AED" opacity="0.4" />

    {/* Halo / aura arc above head */}
    <path d="M76 72 Q100 52 124 72" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
  </svg>
);

export default Logo;

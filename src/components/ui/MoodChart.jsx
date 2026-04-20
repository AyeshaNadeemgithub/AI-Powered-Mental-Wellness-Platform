import { colors } from "../../styles/theme";

const MoodChart = ({ data = [], width = 260, height = 90 }) => {
  const max = 35;
  const W = width, H = height;

  if (!data || data.length === 0) {
    return (
      <div style={{ width: W, height: H + 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 11, color: colors.textMuted }}>No mood logs yet</span>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div style={{ width: W, height: H + 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <div style={{ fontSize: 24 }}>{data[0].val > 25 ? "😊" : data[0].val > 15 ? "😐" : "😔"}</div>
        <span style={{ fontSize: 11, color: colors.textMuted }}>One entry logged. Keep going!</span>
      </div>
    );
  }

  const pts = data.map((d, i) => ({
    x: 20 + i * ((W - 40) / (data.length - 1)),
    y: H - 15 - (d.val / max) * (H - 30),
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;

  return (
    <svg width={W} height={H + 22} viewBox={`0 0 ${W} ${H + 22}`}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={colors.purple} stopOpacity="0.22" />
          <stop offset="100%" stopColor={colors.purple} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0,1,2,3].map(i => (
        <line key={i} x1="15" y1={H-15-i*22} x2={W-5} y2={H-15-i*22}
          stroke={colors.border} strokeWidth="1" strokeDasharray="4,4" />
      ))}
      {[0,10,20,30].map((v,i) => (
        <text key={i} x="10" y={H-12-i*22} fontSize="8" fill={colors.textMuted} textAnchor="middle">{v}</text>
      ))}
      <path d={areaPath} fill="url(#cg)" />
      <path d={linePath} fill="none" stroke={colors.purple} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p,i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="white" stroke={colors.purple} strokeWidth="2.5" />
      ))}
      {data.map((d,i) => (
        <text key={i} x={pts[i].x} y={H+18} fontSize="8" fill={colors.textMuted} textAnchor="middle">{d.label}</text>
      ))}
    </svg>
  );
};

export default MoodChart;

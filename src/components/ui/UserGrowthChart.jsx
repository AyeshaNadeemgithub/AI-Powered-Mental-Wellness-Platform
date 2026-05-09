import React from "react";

export default function UserGrowthChart({ data = [] }) {
  if (!data || data.length === 0) return <div style={{ color: "#9896B8", fontSize: 13, padding: 20 }}>No growth data available.</div>;

  const maxVal = Math.max(...data.map(d => Math.max(d.patients, d.therapists, 1)));
  const chartHeight = 150;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: chartHeight, gap: 12 }}>
        {data.map((d, i) => {
          const pHeight = (d.patients / maxVal) * chartHeight;
          const tHeight = (d.therapists / maxVal) * chartHeight;

          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: chartHeight, width: "100%" }}>
                {/* Patient Bar */}
                <div 
                  style={{ 
                    flex: 1, 
                    height: `${pHeight}px`, 
                    background: "#7C3AED", 
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                    minHeight: d.patients > 0 ? 4 : 0
                  }} 
                  title={`${d.patients} Patients`}
                />
                {/* Therapist Bar */}
                <div 
                  style={{ 
                    flex: 1, 
                    height: `${tHeight}px`, 
                    background: "#10B981", 
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                    minHeight: d.therapists > 0 ? 4 : 0
                  }} 
                  title={`${d.therapists} Therapists`}
                />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9896B8", marginTop: 4 }}>{d.day}</div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 16, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#7C3AED" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#4C4682" }}>New Patients</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#10B981" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#4C4682" }}>New Therapists</span>
        </div>
      </div>
    </div>
  );
}

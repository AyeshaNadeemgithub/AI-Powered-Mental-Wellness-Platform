import React, { useState } from "react";

const DAYS = ["Sun 16", "Mon 17", "Tue 18", "Wed 19", "Thu 20", "Fri 21", "Sat 22"];
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00"];

const APPOINTMENTS = [
  { patient: "J. Chen", day: 1, time: 1, color: "#7C3AED", checked: true },
  { patient: "M. Davies", day: 1, time: 2, color: "#F59E0B", checked: true },
  { patient: "M. Davies", day: 2, time: 1, color: "#F59E0B", checked: false },
  { patient: "M. Davies", day: 2, time: 2, color: "#F59E0B", checked: false },
  { patient: "M. Davies", day: 3, time: 2, color: "#F59E0B", checked: true },
  { patient: "J. Chen", day: 4, time: 1, color: "#7C3AED", checked: true },
  { patient: "M. Savias", day: 5, time: 2, color: "#10B981", checked: true },
];

export default function WeekCalendarGrid() {
  const [weekOffset, setWeekOffset] = useState(0); // Used by nav buttons for future week switching

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B" }}>
          My Calendar
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            style={{
              background: "transparent",
              border: "1px solid #E5E1F8",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 16,
              color: "#4C4682",
            }}
          >
            ‹
          </button>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#4C4682",
              minWidth: 80,
              textAlign: "center",
            }}
          >
            Week View
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            style={{
              background: "transparent",
              border: "1px solid #E5E1F8",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 16,
              color: "#4C4682",
            }}
          >
            ›
          </button>
        </div>
      </div>
      <div
        key={weekOffset}
        style={{
          display: "grid",
          gridTemplateColumns: "60px repeat(7, 1fr)",
          gridTemplateRows: `40px repeat(${TIME_SLOTS.length}, 48px)`,
          border: "1px solid #E5E1F8",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div />
        {DAYS.map((day, i) => (
          <div
            key={day}
            style={{
              background: "#F5F3FF",
              padding: "10px 8px",
              fontSize: 12,
              fontWeight: 600,
              color: "#4C4682",
              textAlign: "center",
              borderBottom: "1px solid #E5E1F8",
            }}
          >
            {day}
          </div>
        ))}
        {TIME_SLOTS.map((time, rowIdx) => (
          <React.Fragment key={time}>
            <div
              style={{
                padding: "8px",
                fontSize: 12,
                fontWeight: 600,
                color: "#9896B8",
                borderRight: "1px solid #E5E1F8",
                borderBottom: "1px solid #E5E1F8",
              }}
            >
              {time}
            </div>
            {DAYS.map((_, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                style={{
                  borderRight: "1px solid #E5E1F8",
                  borderBottom: "1px solid #E5E1F8",
                  position: "relative",
                  minHeight: 48,
                }}
              >
                {APPOINTMENTS.filter(
                  (a) => a.day === colIdx && a.time === rowIdx
                ).map((apt) => (
                  <div
                    key={`${apt.patient}-${apt.day}-${apt.time}`}
                    style={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      right: 4,
                      bottom: 4,
                      background: apt.color,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 8px",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    <span>{apt.patient}</span>
                    <span style={{ fontSize: 12 }}>
                      {apt.checked ? "✓" : "○"}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

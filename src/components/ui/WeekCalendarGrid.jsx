import React, { useState, useMemo } from "react";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

// Generate real day labels for the current week
function getWeekDays(offset = 0) {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + offset * 7);
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    days.push({
      label: `${dayNames[i]} ${d.getDate()}`,
      date: d,
    });
  }
  return days;
}

// Map a real appointment to a grid position
function mapAppointmentsToGrid(appointments, weekDays) {
  const mapped = [];
  const colors = ["#7C3AED", "#F59E0B", "#10B981", "#0EA5E9", "#EF4444", "#EC4899", "#6D28D9"];

  appointments.forEach((appt, idx) => {
    const schedDate = new Date(appt.scheduledAt);
    const dayIdx = weekDays.findIndex(wd => {
      return wd.date.toDateString() === schedDate.toDateString();
    });
    if (dayIdx === -1) return;

    const hour = schedDate.getHours();
    const hourStr = hour.toString().padStart(2, "0") + ":00";
    const timeIdx = TIME_SLOTS.indexOf(hourStr);
    if (timeIdx === -1) return;

    const formatName = (fName, lName) => {
      const f = fName ? fName.charAt(0).toUpperCase() + fName.slice(1) : "";
      const l = (lName && lName !== "-") ? lName.charAt(0).toUpperCase() + lName.slice(1) : "";
      return `${f} ${l}`.trim() || "Patient";
    };

    const patientName = appt.patient ? formatName(appt.patient.firstName, appt.patient.lastName) : "Patient";

    mapped.push({
      id: appt.id,
      patient: patientName,
      day: dayIdx,
      time: timeIdx,
      color: colors[idx % colors.length],
      status: appt.status,
      type: appt.sessionType,
    });
  });
  return mapped;
}

export default function WeekCalendarGrid({ appointments = [], weekOffset, setWeekOffset }) {
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const mappedAppts = useMemo(() => mapAppointmentsToGrid(appointments, weekDays), [appointments, weekDays]);

  // Current time marker logic
  const now = new Date();
  const currentDayIdx = now.getDay();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const showNowMarker = weekOffset === 0 && currentHour >= 9 && currentHour < 18;
  const markerTop = ((currentHour - 9) * 48) + (currentMin / 60 * 48) + 40; // 40 is header height

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#1E1B4B" }}>My Calendar</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setWeekOffset(o => o - 1)} style={{ background: "transparent", border: "1px solid #E5E1F8", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, color: "#4C4682" }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#4C4682", minWidth: 80, textAlign: "center" }}>
            {weekOffset === 0 ? "This Week" : weekOffset > 0 ? `+${weekOffset} Weeks` : `${weekOffset} Weeks`}
          </span>
          <button onClick={() => setWeekOffset(o => o + 1)} style={{ background: "transparent", border: "1px solid #E5E1F8", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, color: "#4C4682" }}>›</button>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        {showNowMarker && (
          <div style={{
            position: "absolute", left: 60, right: 0, top: markerTop,
            height: 2, background: "#EF4444", zIndex: 10,
            pointerEvents: "none"
          }}>
            <div style={{ position: "absolute", left: -6, top: -4, width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
          </div>
        )}
        <div key={weekOffset} style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gridTemplateRows: `40px repeat(${TIME_SLOTS.length}, 48px)`, border: "1px solid #E5E1F8", borderRadius: 12, overflow: "hidden" }}>
          <div />
          {weekDays.map((day, i) => (
            <div key={day.label} style={{ background: (weekOffset === 0 && i === currentDayIdx) ? "#EDE9FE" : "#F5F3FF", padding: "10px 8px", fontSize: 12, fontWeight: 700, color: (weekOffset === 0 && i === currentDayIdx) ? "#7C3AED" : "#4C4682", textAlign: "center", borderBottom: "1px solid #E5E1F8" }}>
              {day.label}
            </div>
          ))}
          {TIME_SLOTS.map((time, rowIdx) => (
            <React.Fragment key={time}>
              <div style={{ padding: "8px", fontSize: 12, fontWeight: 600, color: "#9896B8", borderRight: "1px solid #E5E1F8", borderBottom: "1px solid #E5E1F8" }}>
                {time}
              </div>
              {weekDays.map((_, colIdx) => (
                <div key={`${rowIdx}-${colIdx}`} style={{ borderRight: "1px solid #E5E1F8", borderBottom: "1px solid #E5E1F8", position: "relative", minHeight: 48, background: (weekOffset === 0 && colIdx === currentDayIdx) ? "#FDFDFF" : "transparent" }}>
                  {mappedAppts.filter(a => a.day === colIdx && a.time === rowIdx).map((apt) => (
                    <div 
                      key={apt.id} 
                      style={{ 
                        position: "absolute", top: 4, left: 4, right: 4, bottom: 4, 
                        background: apt.color, borderRadius: 8, 
                        display: "flex", flexDirection: "column", justifyContent: "center", 
                        padding: "2px 8px", color: "#fff", fontSize: 10, fontWeight: 700,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        zIndex: 2,
                        cursor: "pointer"
                      }}
                      title={`${apt.patient} - ${apt.type} session`}
                    >
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{apt.patient}</div>
                      <div style={{ fontSize: 8, opacity: 0.9 }}>{apt.type}</div>
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      {mappedAppts.length === 0 && (
        <div style={{ textAlign: "center", padding: "16px 0", color: "#9896B8", fontSize: 13, fontWeight: 600 }}>
          No appointments scheduled for this week.
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { colors, fonts, radius, shadows } from "../styles/theme";
import * as api from "../api";

// ─── BROWN / WARM PALETTE ──────────────────────────────────────────────────
const warm = {
  brown: "#92400E", brownMid: "#B45309", brownLight: "#D97706",
  brownPale: "#FEF3C7", brownSoft: "#FFFBEB", brownBorder: "#FDE68A",
  cream: "#FAF7F2", sand: "#E8DDD0", sandBorder: "#D5C4B0",
  mocha: "#6B4C35", latte: "#C8A882",
};

const TIME_SLOTS = [
  "9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","5:30 PM",
];
const SPECIALTIES_FILTER = [
  "All","Anxiety","Depression","Trauma","Relationships","Mindfulness","OCD","ADHD","Sleep","Stress",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SectionLabel = ({ children, color }) => (
  <div style={{ fontSize:10,fontFamily:fonts.body,fontWeight:800,color:color||warm.brownMid,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:8 }}>
    <span style={{ width:20,height:2,background:color||warm.brownMid,borderRadius:2,display:"inline-block" }}/>
    {children}
  </div>
);

// ─── Booking Modal ─────────────────────────────────────────────────────────────
const BookingModal = ({ therapist, onClose, onConfirm, loading }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [sessionType, setSessionType] = useState("Video Call");
  const dates = ["Today","Tomorrow","Mon Mar 10","Tue Mar 11","Wed Mar 12"];
  const ac = therapist.accentColor;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(30,20,10,0.5)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24 }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{ background:"#fff",borderRadius:24,width:"100%",maxWidth:500,boxShadow:`0 24px 80px ${ac}30`,border:`1.5px solid ${warm.sand}`,overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(135deg, #EDE9FE 0%, #F5EFE8 100%)",padding:"24px 28px",borderBottom:`1px solid ${colors.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:48,height:48,borderRadius:14,background:therapist.avatarGradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff",fontWeight:800,fontFamily:fonts.body,boxShadow:`0 4px 14px ${ac}40` }}>{therapist.avatar}</div>
            <div>
              <div style={{ fontFamily:fonts.display,fontSize:16,fontWeight:700,color:colors.text }}>Book with {therapist.name}</div>
              <div style={{ fontSize:12,color:colors.textMuted,fontFamily:fonts.body,fontWeight:600 }}>{therapist.title}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:10,background:colors.purpleSoft,border:`1px solid ${colors.border}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ padding:"24px 28px",display:"flex",flexDirection:"column",gap:20 }}>
          <div>
            <SectionLabel color={ac}>Session Type</SectionLabel>
            <div style={{ display:"flex",gap:10 }}>
              {["Video Call","In-Person","Phone Call"].map(t=>(
                <button key={t} onClick={()=>setSessionType(t)} style={{ flex:1,padding:"10px 8px",borderRadius:radius.md,border:sessionType===t?`1.5px solid ${ac}`:`1.5px solid ${warm.sandBorder}`,background:sessionType===t?`${ac}12`:warm.cream,cursor:"pointer",fontFamily:fonts.body,fontSize:12,fontWeight:700,color:sessionType===t?ac:colors.textMid,transition:"all 0.18s" }}>
                  {t==="Video Call"?"📹":t==="In-Person"?"🏥":"📞"} {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color={ac}>Select Date</SectionLabel>
            <div style={{ display:"flex",gap:8 }}>
              {dates.map(d=>(
                <button key={d} onClick={()=>setSelectedDate(d)} style={{ flex:1,padding:"8px 4px",borderRadius:radius.md,border:selectedDate===d?`1.5px solid ${ac}`:`1.5px solid ${warm.sandBorder}`,background:selectedDate===d?`${ac}12`:warm.cream,cursor:"pointer",fontFamily:fonts.body,fontSize:10,fontWeight:800,color:selectedDate===d?ac:colors.textMid,transition:"all 0.18s" }}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel color={ac}>Available Time Slots</SectionLabel>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:8 }}>
              {TIME_SLOTS.map(slot=>(
                <button key={slot} onClick={()=>setSelectedSlot(slot)} style={{ padding:"10px 8px",borderRadius:radius.md,border:selectedSlot===slot?`1.5px solid ${ac}`:`1.5px solid ${warm.sandBorder}`,background:selectedSlot===slot?ac:warm.cream,cursor:"pointer",fontFamily:fonts.body,fontSize:12,fontWeight:800,color:selectedSlot===slot?"#fff":colors.textMid,transition:"all 0.18s",boxShadow:selectedSlot===slot?`0 4px 14px ${ac}40`:"none" }}>{slot}</button>
              ))}
            </div>
          </div>
          <button disabled={!selectedSlot||loading} onClick={()=>selectedSlot&&onConfirm(therapist,selectedSlot,selectedDate,sessionType)} style={{ width:"100%",padding:"13px 24px",borderRadius:radius.md,border:"none",cursor:selectedSlot?"pointer":"default",fontFamily:fonts.body,fontSize:13,fontWeight:800,color:"#fff",background:selectedSlot?`linear-gradient(135deg, ${ac}, ${ac}CC)`:`${ac}70`,boxShadow:selectedSlot?`0 4px 18px ${ac}50`:"none",transition:"all 0.2s",opacity:loading?0.6:1 }}>
            {loading ? "Booking..." : selectedSlot ? `Confirm — ${selectedDate} at ${selectedSlot}` : "Select a time slot to continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Therapist Card ───────────────────────────────────────────────────────────
const TherapistCard = ({ t, onBook }) => {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ background:"#fff",borderRadius:radius.lg,border:hov?`1.5px solid ${t.accentColor}`:`1.5px solid ${warm.sandBorder}`,boxShadow:hov?`0 8px 32px ${t.accentColor}20`:`0 2px 12px rgba(0,0,0,0.05)`,padding:"22px 24px",transition:"all 0.2s",transform:hov?"translateY(-3px)":"none",borderTop:`3px solid ${t.accentColor}` }}>
      <div style={{ display:"flex",alignItems:"flex-start",gap:14,marginBottom:14 }}>
        <div style={{ width:50,height:50,borderRadius:14,flexShrink:0,background:t.avatarGradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff",fontWeight:800,fontFamily:fonts.body,boxShadow:`0 4px 14px ${t.accentColor}35` }}>{t.avatar}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:2 }}>
            <span style={{ fontFamily:fonts.display,fontSize:15,fontWeight:700,color:colors.text }}>{t.name}</span>
            <Badge variant={t.badgeVariant}>{t.badge}</Badge>
          </div>
          <div style={{ fontSize:12,fontFamily:fonts.body,fontWeight:600,color:colors.textMuted,marginBottom:6 }}>{t.title}</div>
          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
            <div style={{ display:"flex",gap:2 }}>
              {[1,2,3,4,5].map(s=>(
                <span key={s} style={{ fontSize:11,color:s<=Math.round(t.rating)?"#F59E0B":warm.sandBorder }}>★</span>
              ))}
            </div>
            <span style={{ fontFamily:fonts.body,fontSize:11,fontWeight:800,color:colors.text }}>{t.rating}</span>
            <span style={{ fontSize:11,color:colors.textMuted,fontFamily:fonts.body }}>({t.reviews})</span>
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:fonts.display,fontSize:14,fontWeight:700,color:warm.brownMid }}>{t.price.replace("$", "PKR ").replace(/PKR (\d+)/, (m, n) => `PKR ${n}`)}</div>
          <div style={{ marginTop:4,fontSize:10,fontFamily:fonts.body,fontWeight:800,color:t.available?colors.green:colors.textMuted,display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:t.available?colors.green:colors.textMuted,display:"inline-block" }}/>
            {t.available?"Available Now":"Busy"}
          </div>
        </div>
      </div>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14 }}>
        {t.specialties.map(s=>(
          <span key={s} style={{ fontSize:10,fontFamily:fonts.body,fontWeight:700,color:t.accentColor,background:t.accentBg,padding:"3px 10px",borderRadius:radius.full,border:`1px solid ${t.accentColor}30` }}>{s}</span>
        ))}
      </div>
      {expanded && (
        <p style={{ fontSize:12,fontFamily:fonts.body,color:colors.textMid,lineHeight:1.65,fontWeight:600,marginBottom:14,padding:"10px 14px",background:warm.cream,borderRadius:radius.md,borderLeft:`3px solid ${t.accentColor}` }}>{t.about}</p>
      )}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
        <div style={{ fontSize:11,color:colors.textMuted,fontFamily:fonts.body,fontWeight:700 }}>🗓 {t.nextSlot}</div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>setExpanded(e=>!e)} style={{ padding:"8px 14px",borderRadius:radius.md,border:`1px solid ${warm.sandBorder}`,background:warm.cream,fontFamily:fonts.body,fontSize:11,fontWeight:700,color:colors.textMid,cursor:"pointer",transition:"all 0.15s" }}>{expanded?"Less ▲":"About ▼"}</button>
          <Button size="sm" onClick={()=>onBook(t)}>Book Now →</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Upcoming Session Card ────────────────────────────────────────────────────
const UpcomingCard = ({ session, onCancel }) => {
  const ac = session.accentColor || "#7C3AED";
  const statusLabel = session.status?.toLowerCase() || "confirmed";
  const sessionTypeLabel = session.sessionType === "VIDEO" ? "Video Call" : session.sessionType === "AUDIO" ? "Phone Call" : "Chat";
  const schedDate = new Date(session.scheduledAt);
  const dateStr = schedDate.toLocaleDateString("en-US", { weekday:"long",month:"short",day:"numeric",year:"numeric" });
  const timeStr = schedDate.toLocaleTimeString("en-US", { hour:"numeric",minute:"2-digit",hour12:true });
  const user = api.getStoredUser();
  const isPsychologist = user?.role === "PSYCHOLOGIST";

  const displayName = isPsychologist
    ? `${session.patient?.firstName} ${session.patient?.lastName}`
    : session.psychologist
      ? `${session.psychologist.user.firstName} ${session.psychologist.user.lastName}`
      : "Therapist";

  const avatarLetter = isPsychologist
    ? session.patient?.firstName?.charAt(0) || "P"
    : session.psychologist?.user?.firstName?.charAt(0) || "T";

  return (
    <div style={{ background:"#fff",borderRadius:radius.lg,border:`1.5px solid ${warm.sandBorder}`,borderLeft:`4px solid ${ac}`,boxShadow:"0 2px 12px rgba(0,0,0,0.05)",padding:"18px 22px",display:"flex",alignItems:"center",gap:16 }}>
      <div style={{ width:44,height:44,borderRadius:13,flexShrink:0,background:`linear-gradient(135deg, ${ac}, ${ac}AA)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff",fontWeight:800,fontFamily:fonts.body,boxShadow:`0 4px 12px ${ac}35` }}>{avatarLetter}</div>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
          <span style={{ fontFamily:fonts.display,fontSize:14,fontWeight:700,color:colors.text }}>{displayName}</span>
          <span style={{ fontSize:9,fontFamily:fonts.body,fontWeight:800,padding:"2px 8px",borderRadius:radius.full,background:statusLabel==="confirmed"?"#D1FAE5":warm.brownPale,color:statusLabel==="confirmed"?"#065F46":warm.brownMid,border:statusLabel==="confirmed"?"1px solid #A7F3D0":`1px solid ${warm.brownBorder}`,textTransform:"uppercase",letterSpacing:"0.06em" }}>{statusLabel}</span>
        </div>
        <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
          <span style={{ fontSize:11,fontFamily:fonts.body,fontWeight:700,color:colors.textMid }}>🗓 {dateStr}</span>
          <span style={{ fontSize:11,fontFamily:fonts.body,fontWeight:700,color:colors.textMid }}>🕐 {timeStr} · {session.durationMins || 50} min</span>
          <span style={{ fontSize:11,fontFamily:fonts.body,fontWeight:700,color:ac }}>{sessionTypeLabel==="Video Call"?"📹":"📞"} {sessionTypeLabel}</span>
        </div>
      </div>
      <button onClick={()=>onCancel(session.id)} style={{ padding:"8px 14px",borderRadius:radius.md,border:"1px solid #FCA5A5",background:"#FEF2F2",fontFamily:fonts.body,fontSize:11,fontWeight:700,color:"#EF4444",cursor:"pointer" }}>Cancel</button>
    </div>
  );
};

// ─── APPOINTMENTS PAGE ────────────────────────────────────────────────────────
const Appointments = () => {
  const [therapists, setTherapists] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("find");
  const [loadingTherapists, setLoadingTherapists] = useState(true);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch real psychologists from DB
  useEffect(() => {
    api.getPsychologists()
      .then(data => { if (Array.isArray(data)) setTherapists(data); })
      .catch(err => console.error("Failed to fetch psychologists:", err))
      .finally(() => setLoadingTherapists(false));
  }, []);

  // Fetch real appointments from DB
  useEffect(() => {
    api.getAppointments()
      .then(data => {
        if (Array.isArray(data)) {
          const active = data.filter(a => a.status === "PENDING" || a.status === "CONFIRMED");
          setUpcoming(active);
        }
      })
      .catch(err => console.error("Failed to fetch appointments:", err))
      .finally(() => setLoadingAppts(false));
  }, []);

  const handleBook = (t) => setBookingTarget(t);

  const handleCancel = async (id) => {
    try {
      await api.cancelAppointment(id);
      setUpcoming(prev => prev.filter(s => s.id !== id));
      setSuccessMsg("✅ Appointment cancelled successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  const handleConfirm = async (therapist, slot, date, type) => {
    setBookingLoading(true);
    try {
      const res = await api.bookAppointment({
        psychologistId: therapist.psychologistId,
        date,
        time: slot,
        sessionType: type,
      });
      if (res.appointment) {
        setUpcoming(prev => [res.appointment, ...prev]);
      }
      setBookingTarget(null);
      setSuccessMsg(`✅ Session booked with ${therapist.name.trim()}!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setActiveTab("upcoming");
    } catch (err) {
      console.error("Booking failed:", err);
      setSuccessMsg("❌ Booking failed. Please try again.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredTherapists = therapists.filter(t => {
    const matchSpec = activeFilter === "All" || t.specialties.some(s => s.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
      || t.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSpec && matchSearch;
  });

  return (
    <div className="page-enter">
      {/* ── Page Header ── */}
      <div style={{ borderRadius:radius.xl,background:"linear-gradient(135deg, #EDE9FE 0%, #F5EFE8 55%, #FEF3C7 100%)",padding:"28px 40px",marginBottom:24,border:`1px solid ${colors.border}`,boxShadow:"0 4px 20px rgba(124,58,237,0.1)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:10,fontFamily:fonts.body,fontWeight:800,color:colors.purple,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8 }}>✦ Appointments</div>
          <h1 style={{ fontFamily:fonts.display,fontSize:30,fontWeight:700,color:colors.text,lineHeight:1.15,marginBottom:6 }}>Find Your Therapist</h1>
          <p style={{ fontFamily:fonts.body,fontSize:13,color:colors.textMid,fontWeight:600 }}>Book sessions with licensed professionals — zero friction, full support.</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:52,marginBottom:4 }}>📅</div>
          <div style={{ fontFamily:fonts.body,fontSize:11,fontWeight:700,color:colors.purple }}>{upcoming.length} upcoming session{upcoming.length!==1?"s":""}</div>
        </div>
      </div>

      {/* ── Success toast ── */}
      {successMsg && (
        <div style={{ marginBottom:20,padding:"14px 20px",borderRadius:radius.md,background:successMsg.includes("❌")?"#FEF2F2":"#D1FAE5",border:successMsg.includes("❌")?"1.5px solid #FCA5A5":"1.5px solid #6EE7B7",fontFamily:fonts.body,fontSize:13,fontWeight:700,color:successMsg.includes("❌")?"#EF4444":"#065F46" }}>{successMsg}</div>
      )}

      {/* ── Stats bar ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:14,marginBottom:24 }}>
        {[
          { icon:"👨‍⚕️",label:"Licensed Therapists",value:therapists.length||"0",color:"#6D28D9",bg:"#F5F3FF",border:"#DDD6FE" },
          { icon:"🗓",label:"Your Sessions",value:upcoming.length,color:"#2b042aff",bg:"#F5F7FA",border:"#E4E7EC" },
          { icon:"📊",label:"Total Available",value:therapists.filter(t=>t.available).length,color:"#1b1a19ff",bg:"#F0F2FF",border:"#D6DBFF" },
          { icon:"💬",label:"Avg Response Time",value:"< 2 hrs",color:"#1e1c1cff",bg:"#EAF3FF",border:"#C7DBFF" },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg,borderRadius:radius.lg,border:`1.5px solid ${s.border}`,padding:"16px 20px",boxShadow:shadows.card }}>
            <div style={{ fontSize:20,marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontFamily:fonts.display,fontSize:18,fontWeight:700,color:s.color,marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:10,fontFamily:fonts.body,fontWeight:700,color:colors.textMuted,textTransform:"uppercase",letterSpacing:"0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab switcher ── */}
      <div style={{ display:"flex",gap:4,background:warm.cream,border:`1px solid ${warm.sandBorder}`,borderRadius:radius.md,padding:4,width:"fit-content",marginBottom:24 }}>
        {[{key:"find",label:"🔍  Find Therapist"},{key:"upcoming",label:`📅  Upcoming (${upcoming.length})`}].map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)} style={{ padding:"10px 22px",borderRadius:10,border:"none",background:activeTab===tab.key?`linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})`:"transparent",color:activeTab===tab.key?"#fff":colors.textMuted,fontFamily:fonts.body,fontSize:13,fontWeight:800,cursor:"pointer",transition:"all 0.18s",boxShadow:activeTab===tab.key?shadows.purple:"none" }}>{tab.label}</button>
        ))}
      </div>

      {/* ── FIND THERAPIST TAB ── */}
      {activeTab === "find" && (
        <div>
          <div style={{ background:"#fff",borderRadius:radius.lg,border:`1.5px solid ${warm.sandBorder}`,padding:"18px 20px",marginBottom:20,boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex",gap:14,alignItems:"center",marginBottom:16 }}>
              <div style={{ flex:1,display:"flex",alignItems:"center",gap:10,background:warm.cream,borderRadius:radius.md,border:`1.5px solid ${warm.sandBorder}`,padding:"10px 16px" }}>
                <span style={{ fontSize:16 }}>🔍</span>
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search by name, specialty, or title…" style={{ flex:1,border:"none",background:"transparent",outline:"none",fontFamily:fonts.body,fontSize:13,color:colors.text }}/>
                {searchQuery && <button onClick={()=>setSearchQuery("")} style={{ background:"none",border:"none",cursor:"pointer",color:colors.textMuted,fontSize:14 }}>✕</button>}
              </div>
              <div style={{ fontSize:12,fontFamily:fonts.body,color:colors.textMuted,fontWeight:700,flexShrink:0 }}>{filteredTherapists.length} found</div>
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {SPECIALTIES_FILTER.map(f=>(
                <button key={f} onClick={()=>setActiveFilter(f)} style={{ padding:"6px 14px",borderRadius:radius.full,border:activeFilter===f?`1.5px solid ${colors.purple}`:`1px solid ${warm.sandBorder}`,background:activeFilter===f?colors.purpleSoft:warm.cream,fontFamily:fonts.body,fontSize:11,fontWeight:800,color:activeFilter===f?colors.purple:colors.textMid,cursor:"pointer",transition:"all 0.15s" }}>{f}</button>
              ))}
            </div>
          </div>
          {loadingTherapists ? (
            <div style={{ textAlign:"center",padding:"60px 0",color:colors.textMuted,fontFamily:fonts.body }}><div style={{ fontSize:14,fontWeight:700 }}>Loading therapists...</div></div>
          ) : filteredTherapists.length === 0 ? (
            <div style={{ textAlign:"center",padding:"60px 0",color:colors.textMuted,fontFamily:fonts.body }}>
              <div style={{ fontSize:40,marginBottom:12 }}>🔍</div>
              <div style={{ fontSize:14,fontWeight:700 }}>No therapists found.</div>
              <div style={{ fontSize:12,marginTop:4 }}>{therapists.length===0?"No psychologists have signed up yet. Check back later!":"Try a different specialty or clear the filter."}</div>
            </div>
          ) : (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
              {filteredTherapists.map(t => <TherapistCard key={t.id} t={t} onBook={handleBook}/>)}
            </div>
          )}
        </div>
      )}

      {/* ── UPCOMING TAB ── */}
      {activeTab === "upcoming" && (
        <div>
          {loadingAppts ? (
            <div style={{ textAlign:"center",padding:"60px 0",fontFamily:fonts.body,color:colors.textMuted }}><div style={{ fontSize:14,fontWeight:700 }}>Loading appointments...</div></div>
          ) : upcoming.length === 0 ? (
            <div style={{ textAlign:"center",padding:"60px 0" }}>
              <div style={{ fontSize:48,marginBottom:16 }}>📭</div>
              <div style={{ fontFamily:fonts.display,fontSize:20,color:colors.text,marginBottom:8 }}>No Upcoming Sessions</div>
              <p style={{ fontFamily:fonts.body,fontSize:13,color:colors.textMuted,marginBottom:24 }}>Book your first session with one of our licensed therapists.</p>
              <Button size="md" onClick={()=>setActiveTab("find")}>Find a Therapist →</Button>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <SectionLabel>Your Scheduled Sessions ({upcoming.length})</SectionLabel>
              {upcoming.map(s => <UpcomingCard key={s.id} session={s} onCancel={handleCancel}/>)}
            </div>
          )}
        </div>
      )}

      {bookingTarget && <BookingModal therapist={bookingTarget} onClose={()=>setBookingTarget(null)} onConfirm={handleConfirm} loading={bookingLoading}/>}
    </div>
  );
};

export default Appointments;
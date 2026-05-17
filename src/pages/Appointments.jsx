import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { colors, fonts, radius, shadows } from "../styles/theme";
import * as api from "../api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format, isSameDay } from "date-fns";

// ─── BROWN / WARM PALETTE ──────────────────────────────────────────────────
const warm = {
  brown: "#92400E", brownMid: "#B45309", brownLight: "#D97706",
  brownPale: "#FEF3C7", brownSoft: "#FFFBEB", brownBorder: "#FDE68A",
  cream: "#FAF7F2", sand: "#E8DDD0", sandBorder: "#D5C4B0",
  mocha: "#6B4C35", latte: "#C8A882",
};

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "5:30 PM",
];
const SPECIALTIES_FILTER = [
  "All", "Anxiety", "Depression", "Trauma", "Relationships", "Mindfulness", "OCD", "ADHD", "Sleep", "Stress",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SectionLabel = ({ children, color }) => (
  <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 800, color: color || warm.brownMid, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 20, height: 2, background: color || warm.brownMid, borderRadius: 2, display: "inline-block" }} />
    {children}
  </div>
);

const BookingModal = ({ therapist, onClose, onConfirm, loading }) => {
  const [step, setStep] = useState(1); // 1: Selection, 2: Method, 3: Payment
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState("Video Call");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({ cardNum: "", cardExpiry: "", cardCvc: "", jazzNum: "", easyNum: "" });
  const [paymentError, setPaymentError] = useState("");
  const [otp, setOtp] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const ac = therapist.accentColor;

  useEffect(() => {
    if (therapist && selectedDate) {
      fetchSlots();
    }
  }, [selectedDate, therapist]);

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const data = await api.getAvailability(therapist.psychologistId, dateStr);
      setAvailableSlots(data);
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleNextStep = () => {
    setPaymentError("");
    if (step === 1) {
      if (!selectedSlot) return;
      setStep(2);
    } else if (step === 2) {
      if (!paymentMethod) return;
      setStep(3);
    } else if (step === 3) {
      if (paymentMethod === "card") {
        const numClean = paymentDetails.cardNum.replace(/\s/g, '');
        if (!/^\d{16}$/.test(numClean)) return setPaymentError("Card number must be 16 digits.");
        if (!/^\d{2}\/\d{2}$/.test(paymentDetails.cardExpiry)) return setPaymentError("Expiry must be MM/YY.");
        if (!/^\d{3}$/.test(paymentDetails.cardCvc)) return setPaymentError("CVC must be 3 digits.");
        processPayment();
      } else {
        const num = paymentMethod === "jazzcash" ? paymentDetails.jazzNum : paymentDetails.easyNum;
        let numClean = num.replace(/\s/g, '');
        if (numClean.startsWith('0')) numClean = numClean.substring(1); // Auto-strip leading 0 if typed
        if (!/^3\d{9}$/.test(numClean)) return setPaymentError("Enter a valid 10-digit number starting with 3.");
        setStep(4);
      }
    } else if (step === 4) {
      if (!/^\d{4}$/.test(otp)) return setPaymentError("OTP must be 4 digits.");
      processPayment();
    }
  };

  const processPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setTransactionId(`TXN-${Math.random().toString().substring(2, 10).toUpperCase()}`);
      setStep(5);
    }, 2000);
  };

  const handleFinalConfirm = () => {
    onConfirm(therapist, selectedSlot.startTime, format(selectedDate, "yyyy-MM-dd"), sessionType, selectedSlot.id, transactionId);
  };

  const renderPaymentFields = () => {
    if (paymentMethod === 'card') {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="0000 0000 0000 0000" value={paymentDetails.cardNum} onChange={e => setPaymentDetails({ ...paymentDetails, cardNum: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #D1D5DB" }} />
          <div style={{ display: "flex", gap: 10 }}>
            <input placeholder="MM/YY" value={paymentDetails.cardExpiry} onChange={e => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #D1D5DB" }} />
            <input placeholder="CVC" value={paymentDetails.cardCvc} onChange={e => setPaymentDetails({ ...paymentDetails, cardCvc: e.target.value })} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #D1D5DB" }} type="password" />
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted }}>Enter your mobile wallet number</div>
        <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #D1D5DB", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "0 12px", background: "#F3F4F6", fontWeight: 700, borderRight: "1px solid #D1D5DB" }}>+92</div>
          <input
            placeholder="3XXXXXXXXX"
            value={paymentMethod === 'jazzcash' ? paymentDetails.jazzNum : paymentDetails.easyNum}
            onChange={e => setPaymentDetails({ ...paymentDetails, [paymentMethod === 'jazzcash' ? 'jazzNum' : 'easyNum']: e.target.value })}
            style={{ flex: 1, padding: "12px", border: "none", outline: "none" }}
          />
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, fontStyle: "italic" }}>You will receive a USSD push notification.</div>
      </div>
    );
  };

  return (
    <div className="mobile-padding-sm" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(30,20,10,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: 28, width: "100%", maxWidth: step === 1 ? 800 : 450, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: `0 24px 80px ${ac}30`, border: `1px solid ${warm.sand}`, overflow: "hidden", transition: "max-width 0.3s ease" }}>

        <div style={{ background: "linear-gradient(135deg, #EDE9FE 0%, #F5EFE8 100%)", padding: "20px 24px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: therapist.avatarGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 800 }}>{therapist.avatar}</div>
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.text }}>Book with {therapist.name}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 600 }}>Step {step > 3 ? 3 : step} of 3</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: colors.purpleSoft, border: `1px solid ${colors.border}`, cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>

        <div className="mobile-padding-sm" style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {step === 1 && (
            <div className="responsive-grid-2" style={{ gap: 24 }}>
              <div>
                <SectionLabel color={ac}>1. Choose Date</SectionLabel>
                <div className="mobile-overflow-x" style={{ border: "1px solid #E5E7EB", borderRadius: 16, padding: 8 }}>
                  <div style={{ minWidth: 280 }}>
                    <Calendar onChange={setSelectedDate} value={selectedDate} minDate={new Date()} className="booking-calendar" />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <SectionLabel color={ac}>2. Session Type</SectionLabel>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Video Call", "In-Person", "Chat"].map(t => (
                      <button key={t} onClick={() => setSessionType(t)} style={{ flex: 1, padding: "8px 2px", borderRadius: 10, border: sessionType === t ? `2px solid ${ac}` : `1.5px solid ${warm.sandBorder}`, background: sessionType === t ? `${ac}10` : warm.cream, cursor: "pointer", fontSize: 10, fontWeight: 700, color: sessionType === t ? ac : colors.textMid }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <SectionLabel color={ac}>3. Available Times</SectionLabel>
                  {slotsLoading ? <div style={{ textAlign: "center", padding: 10, color: colors.textMuted }}>Loading...</div> : availableSlots.length === 0 ? <div style={{ padding: 15, background: warm.cream, borderRadius: 10, textAlign: "center", color: colors.textMuted, fontSize: 11, fontWeight: 600 }}>No slots.</div> : (
                    <div className="responsive-grid-2" style={{ gap: 6, maxHeight: 150, overflowY: "auto" }}>
                      {availableSlots.map(slot => (
                        <button key={slot.id} onClick={() => setSelectedSlot(slot)} style={{ padding: "8px", borderRadius: 8, border: selectedSlot?.id === slot.id ? `2px solid ${ac}` : `1.5px solid ${warm.sandBorder}`, background: selectedSlot?.id === slot.id ? ac : warm.cream, cursor: "pointer", fontSize: 11, fontWeight: 700, color: selectedSlot?.id === slot.id ? "#fff" : colors.textMid }}>{slot.startTime}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button disabled={!selectedSlot} onClick={handleNextStep} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: selectedSlot ? ac : `${ac}50`, color: "#fff", fontWeight: 800, cursor: "pointer" }}>Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <SectionLabel color={ac}>Payment Method</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[{ id: 'card', name: 'Credit/Debit Card', icon: '💳' }, { id: 'jazzcash', name: 'JazzCash', icon: '📱' }, { id: 'easypaisa', name: 'Easypaisa', icon: '💰' }].map(m => (
                  <div key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ padding: "16px", borderRadius: 14, border: paymentMethod === m.id ? `2px solid ${ac}` : "1.5px solid #E5E7EB", background: paymentMethod === m.id ? `${ac}08` : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 20 }}>{m.icon}</div>
                    <div style={{ fontWeight: 700, color: colors.text, flex: 1 }}>{m.name}</div>
                  </div>
                ))}
              </div>
              <button disabled={!paymentMethod} onClick={handleNextStep} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: paymentMethod ? ac : `${ac}50`, color: "#fff", fontWeight: 800, cursor: "pointer" }}>Next</button>
              <button onClick={() => setStep(1)} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: colors.textMuted, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>← Back to Selection</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.textMuted }}>PAYING PKR</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: ac }}>{therapist.price.replace("PKR ", "")}</div>
              </div>
              <div style={{ background: "#F9FAFB", padding: 20, borderRadius: 18, border: "1px solid #E5E7EB", marginBottom: 20 }}>{renderPaymentFields()}</div>
              {paymentError && <div style={{ color: "#EF4444", fontSize: 12, fontWeight: 700, marginBottom: 14, textAlign: "center" }}>{paymentError}</div>}
              <button onClick={handleNextStep} disabled={isProcessingPayment} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: ac, color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}>
                {isProcessingPayment ? <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : "Authorize Payment"}
              </button>
              <button onClick={() => setStep(2)} disabled={isProcessingPayment} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: colors.textMuted, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>← Change Method</button>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📱</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: colors.text }}>Check your phone</div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>Enter the 4-digit OTP sent to your {paymentMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} number.</div>
              </div>
              <div style={{ background: "#F9FAFB", padding: 20, borderRadius: 18, border: "1px solid #E5E7EB", marginBottom: 20, textAlign: "center" }}>
                <input placeholder="----" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} style={{ width: "120px", padding: "12px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 24, letterSpacing: 8, textAlign: "center", fontWeight: 800, outline: "none" }} />
              </div>
              {paymentError && <div style={{ color: "#EF4444", fontSize: 12, fontWeight: 700, marginBottom: 14, textAlign: "center" }}>{paymentError}</div>}
              <button onClick={handleNextStep} disabled={isProcessingPayment} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: ac, color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}>
                {isProcessingPayment ? <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : "Verify & Pay"}
              </button>
              <button onClick={() => setStep(3)} disabled={isProcessingPayment} style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: colors.textMuted, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>← Back</button>
            </div>
          )}

          {step === 5 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10B981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(16,185,129,0.3)", animation: "pulse 2s infinite" }}>✓</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, marginBottom: 6 }}>Payment Successful!</div>
              <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Your appointment has been secured.</div>
              
              <div style={{ background: "#F9FAFB", padding: 20, borderRadius: 16, border: "1px dashed #D1D5DB", textAlign: "left", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>Amount Paid</span>
                  <span style={{ fontSize: 12, color: colors.text, fontWeight: 800 }}>{therapist.price}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>Transaction ID</span>
                  <span style={{ fontSize: 12, color: colors.text, fontWeight: 800 }}>{transactionId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>Payment Method</span>
                  <span style={{ fontSize: 12, color: colors.text, fontWeight: 800, textTransform: "capitalize" }}>{paymentMethod}</span>
                </div>
              </div>

              <button onClick={handleFinalConfirm} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: ac, color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}>
                {loading ? <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : "View Appointment"}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .booking-calendar { width: 100% !important; border: none !important; font-family: inherit !important; }
        .react-calendar__tile--active { background: ${ac} !important; border-radius: 8px; color: white !important; }
        .react-calendar__tile:hover { border-radius: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } } 
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
};

// ─── Therapist Card ───────────────────────────────────────────────────────────
const TherapistCard = ({ t, onBook }) => {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: "#fff", borderRadius: radius.lg, border: hov ? `1.5px solid ${t.accentColor}` : `1.5px solid ${warm.sandBorder}`, boxShadow: hov ? `0 8px 32px ${t.accentColor}20` : `0 2px 12px rgba(0,0,0,0.05)`, padding: "22px 24px", transition: "all 0.2s", transform: hov ? "translateY(-3px)" : "none", borderTop: `3px solid ${t.accentColor}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0, background: t.avatarGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: 800, fontFamily: fonts.body, boxShadow: `0 4px 14px ${t.accentColor}35` }}>{t.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700, color: colors.text }}>{t.name}</span>
            <Badge variant={t.badgeVariant}>{t.badge}</Badge>
          </div>
          <div style={{ fontSize: 12, fontFamily: fonts.body, fontWeight: 600, color: colors.textMuted, marginBottom: 6 }}>{t.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ fontSize: 11, color: s <= Math.round(t.rating) ? "#F59E0B" : warm.sandBorder }}>★</span>
              ))}
            </div>
            <span style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 800, color: colors.text }}>{t.rating}</span>
            <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.body }}>({t.reviews})</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: warm.brownMid }}>{t.price.replace("$", "PKR ").replace(/PKR (\d+)/, (m, n) => `PKR ${n}`)}</div>
          <div style={{ marginTop: 4, fontSize: 10, fontFamily: fonts.body, fontWeight: 800, color: t.available ? colors.green : colors.textMuted, display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.available ? colors.green : colors.textMuted, display: "inline-block" }} />
            {t.available ? "Available Now" : "Busy"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {t.specialties.map(s => (
          <span key={s} style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 700, color: t.accentColor, background: t.accentBg, padding: "3px 10px", borderRadius: radius.full, border: `1px solid ${t.accentColor}30` }}>{s}</span>
        ))}
      </div>
      {expanded && (
        <p style={{ fontSize: 12, fontFamily: fonts.body, color: colors.textMid, lineHeight: 1.65, fontWeight: 600, marginBottom: 14, padding: "10px 14px", background: warm.cream, borderRadius: radius.md, borderLeft: `3px solid ${t.accentColor}` }}>{t.about}</p>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.body, fontWeight: 700 }}>🗓 {t.nextSlot}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ padding: "8px 14px", borderRadius: radius.md, border: `1px solid ${warm.sandBorder}`, background: warm.cream, fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: colors.textMid, cursor: "pointer", transition: "all 0.15s" }}>{expanded ? "Less ▲" : "About ▼"}</button>
          <Button size="sm" onClick={() => onBook(t)}>Book Now →</Button>
        </div>
      </div>
    </div>
  );
};

// ─── Upcoming Session Card ────────────────────────────────────────────────────
const UpcomingCard = ({ session, onCancel, isPast }) => {
  const [showNotes, setShowNotes] = useState(false);
  
  const ac = session.accentColor || "#7C3AED";
  const statusLabel = session.status?.toLowerCase() || "confirmed";
  const sessionTypeLabel = session.sessionType === "VIDEO" ? "Video Call" : session.sessionType === "AUDIO" ? "Phone Call" : "Chat";
  const schedDate = new Date(session.scheduledAt);
  const diffMins = (schedDate - new Date()) / 60000;
  
  // Link generation: For testing, let's always show the button if there is a meetingLink, but maybe styled differently.
  const hasLink = !!session.meetingLink;
  const isJoinableNow = !isPast && hasLink && diffMins <= 15 && diffMins >= -(session.durationMins || 50);
  
  const dateStr = schedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  const timeStr = schedDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ background: "#fff", borderRadius: radius.lg, border: `1.5px solid ${warm.sandBorder}`, borderLeft: `4px solid ${ac}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: `linear-gradient(135deg, ${ac}, ${ac}AA)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 800, fontFamily: fonts.body, boxShadow: `0 4px 12px ${ac}35` }}>{avatarLetter}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: fonts.display, fontSize: 14, fontWeight: 700, color: colors.text }}>{displayName}</span>
            <span style={{ fontSize: 9, fontFamily: fonts.body, fontWeight: 800, padding: "2px 8px", borderRadius: radius.full, background: statusLabel === "confirmed" ? "#D1FAE5" : statusLabel === "completed" ? "#D1FAE5" : warm.brownPale, color: statusLabel === "confirmed" ? "#065F46" : statusLabel === "completed" ? "#065F46" : warm.brownMid, border: statusLabel === "confirmed" ? "1px solid #A7F3D0" : statusLabel === "completed" ? "1px solid #A7F3D0" : `1px solid ${warm.brownBorder}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{statusLabel}</span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: colors.textMid }}>🗓 {dateStr}</span>
            <span style={{ fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: colors.textMid }}>🕐 {timeStr} · {session.durationMins || 50} min</span>
            <span style={{ fontSize: 11, fontFamily: fonts.body, fontWeight: 700, color: ac }}>{sessionTypeLabel === "Video Call" ? "📹" : "📞"} {sessionTypeLabel}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isJoinableNow ? (
            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", padding: "8px 14px", borderRadius: radius.md, background: ac, color: "#fff", fontFamily: fonts.body, fontSize: 11, fontWeight: 700, boxShadow: `0 2px 10px ${ac}40`, display: "inline-block", animation: "pulse 2s infinite" }}>Join Session ▶</a>
          ) : (!isPast && hasLink && statusLabel === "confirmed" && (
            <button disabled style={{ padding: "8px 14px", borderRadius: radius.md, background: "#F3F4F6", color: "#9CA3AF", fontFamily: fonts.body, fontSize: 10, fontWeight: 700, border: "none", cursor: "not-allowed" }} title="Link will activate 15 minutes before the session starts">Link available 15m before</button>
          ))}
          {!isPast && statusLabel !== "cancelled" && statusLabel !== "completed" && (
            <button onClick={() => onCancel(session.id)} style={{ padding: "8px 14px", borderRadius: radius.md, border: "1px solid #FCA5A5", background: "#FEF2F2", fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: "#EF4444", cursor: "pointer" }}>Cancel</button>
          )}
          {isPast && session.notes && session.notes.length > 0 && (
            <button onClick={() => setShowNotes(!showNotes)} style={{ padding: "8px 14px", borderRadius: radius.md, border: `1.5px solid ${ac}`, background: showNotes ? ac : `${ac}0D`, fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: showNotes ? "#fff" : ac, cursor: "pointer", transition: "all 0.15s" }}>
              {showNotes ? "Hide Feedback ▲" : "View Feedback 📝"}
            </button>
          )}
        </div>
      </div>
      
      {showNotes && session.notes && session.notes.length > 0 && (
        <div style={{ 
          background: "linear-gradient(135deg, #F9F7FC 0%, #FAF7F2 100%)",
          borderRadius: radius.md, 
          padding: "16px 20px", 
          border: `1.5px solid ${warm.sandBorder}`,
          borderLeft: `4px solid ${ac}`,
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.03)",
          animation: "fadeUp 0.3s ease both"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>📝</span>
            <span style={{ fontWeight: 800, color: colors.text, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: fonts.body }}>Clinical Observations & Feedback</span>
          </div>
          {session.notes.map((n, idx) => (
            <div key={n.id} style={{ 
              marginTop: idx > 0 ? 12 : 0, 
              borderTop: idx > 0 ? "1px dashed #E5E7EB" : "none",
              paddingTop: idx > 0 ? 12 : 0
            }}>
              <div style={{ 
                fontSize: 13, 
                color: colors.textMid, 
                lineHeight: "1.65", 
                whiteSpace: "pre-wrap", 
                fontStyle: "italic",
                fontFamily: fonts.body,
                fontWeight: 600
              }}>
                "{n.content}"
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 8, fontWeight: 700, textAlign: "right", fontFamily: fonts.body }}>
                Recorded by therapist on {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── APPOINTMENTS PAGE ────────────────────────────────────────────────────────
const Appointments = () => {
  const [therapists, setTherapists] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
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
          const history = data.filter(a => a.status === "COMPLETED" || a.status === "CANCELLED" || a.status === "NO_SHOW");
          setUpcoming(active);
          setPast(history);
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

  const handleConfirm = async (therapist, slot, date, type, slotId, transactionId) => {
    setBookingLoading(true);
    try {
      const res = await api.bookAppointment({
        psychologistId: therapist.psychologistId,
        slotId,
        date,
        time: slot,
        sessionType: type,
        transactionId
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
      <div style={{ borderRadius: radius.xl, background: "linear-gradient(135deg, #EDE9FE 0%, #F5EFE8 55%, #FEF3C7 100%)", padding: "28px 40px", marginBottom: 24, border: `1px solid ${colors.border}`, boxShadow: "0 4px 20px rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 800, color: colors.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>✦ Appointments</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 6 }}>Find Your Therapist</h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMid, fontWeight: 600 }}>Book sessions with licensed professionals — zero friction, full support.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 52, marginBottom: 4 }}>📅</div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: colors.purple }}>{upcoming.length} upcoming session{upcoming.length !== 1 ? "s" : ""}</div>
        </div>
      </div>

      {/* ── Success toast ── */}
      {successMsg && (
        <div style={{ marginBottom: 20, padding: "14px 20px", borderRadius: radius.md, background: successMsg.includes("❌") ? "#FEF2F2" : "#D1FAE5", border: successMsg.includes("❌") ? "1.5px solid #FCA5A5" : "1.5px solid #6EE7B7", fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: successMsg.includes("❌") ? "#EF4444" : "#065F46" }}>{successMsg}</div>
      )}

      {/* ── Stats bar ── */}
      <div className="responsive-grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: "👨‍⚕️", label: "Licensed Therapists", value: therapists.length || "0", color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE" },
          { icon: "🗓", label: "Your Sessions", value: upcoming.length, color: "#2b042aff", bg: "#F5F7FA", border: "#E4E7EC" },
          { icon: "📊", label: "Total Available", value: therapists.filter(t => t.available).length, color: "#1b1a19ff", bg: "#F0F2FF", border: "#D6DBFF" },
          { icon: "💬", label: "Avg Response Time", value: "< 2 hrs", color: "#1e1c1cff", bg: "#EAF3FF", border: "#C7DBFF" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: radius.lg, border: `1.5px solid ${s.border}`, padding: "16px 20px", boxShadow: shadows.card }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tab switcher ── */}
      <div style={{ display: "flex", gap: 4, background: warm.cream, border: `1px solid ${warm.sandBorder}`, borderRadius: radius.md, padding: 4, width: "fit-content", marginBottom: 24 }}>
        {[{ key: "find", label: "🔍  Find Therapist" }, { key: "upcoming", label: `📅  Upcoming (${upcoming.length})` }, { key: "past", label: `🕒  Past (${past.length})` }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: activeTab === tab.key ? `linear-gradient(135deg, ${colors.purple}, ${colors.purpleLight})` : "transparent", color: activeTab === tab.key ? "#fff" : colors.textMuted, fontFamily: fonts.body, fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.18s", boxShadow: activeTab === tab.key ? shadows.purple : "none" }}>{tab.label}</button>
        ))}
      </div>

      {/* ── FIND THERAPIST TAB ── */}
      {activeTab === "find" && (
        <div>
          <div style={{ background: "#fff", borderRadius: radius.lg, border: `1.5px solid ${warm.sandBorder}`, padding: "18px 20px", marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: warm.cream, borderRadius: radius.md, border: `1.5px solid ${warm.sandBorder}`, padding: "10px 16px" }}>
                <span style={{ fontSize: 16 }}>🔍</span>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, specialty, or title…" style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: fonts.body, fontSize: 13, color: colors.text }} />
                {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, fontSize: 14 }}>✕</button>}
              </div>
              <div style={{ fontSize: 12, fontFamily: fonts.body, color: colors.textMuted, fontWeight: 700, flexShrink: 0 }}>{filteredTherapists.length} found</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SPECIALTIES_FILTER.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "6px 14px", borderRadius: radius.full, border: activeFilter === f ? `1.5px solid ${colors.purple}` : `1px solid ${warm.sandBorder}`, background: activeFilter === f ? colors.purpleSoft : warm.cream, fontFamily: fonts.body, fontSize: 11, fontWeight: 800, color: activeFilter === f ? colors.purple : colors.textMid, cursor: "pointer", transition: "all 0.15s" }}>{f}</button>
              ))}
            </div>
          </div>
          {loadingTherapists ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: colors.textMuted, fontFamily: fonts.body }}><div style={{ fontSize: 14, fontWeight: 700 }}>Loading therapists...</div></div>
          ) : filteredTherapists.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: colors.textMuted, fontFamily: fonts.body }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>No therapists found.</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>{therapists.length === 0 ? "No psychologists have signed up yet. Check back later!" : "Try a different specialty or clear the filter."}</div>
            </div>
          ) : (
            <div className="responsive-grid-2" style={{ gap: 18 }}>
              {filteredTherapists.map(t => <TherapistCard key={t.id} t={t} onBook={handleBook} />)}
            </div>
          )}
        </div>
      )}

      {/* ── UPCOMING TAB ── */}
      {activeTab === "upcoming" && (
        <div>
          {loadingAppts ? (
            <div style={{ textAlign: "center", padding: "60px 0", fontFamily: fonts.body, color: colors.textMuted }}><div style={{ fontSize: 14, fontWeight: 700 }}>Loading appointments...</div></div>
          ) : upcoming.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <div style={{ fontFamily: fonts.display, fontSize: 20, color: colors.text, marginBottom: 8 }}>No Upcoming Sessions</div>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Book your first session with one of our licensed therapists.</p>
              <Button size="md" onClick={() => setActiveTab("find")}>Find a Therapist →</Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionLabel>Your Scheduled Sessions ({upcoming.length})</SectionLabel>
              {upcoming.map(s => <UpcomingCard key={s.id} session={s} onCancel={handleCancel} />)}
            </div>
          )}
        </div>
      )}

      {/* ── PAST TAB ── */}
      {activeTab === "past" && (
        <div>
          {loadingAppts ? (
            <div style={{ textAlign: "center", padding: "60px 0", fontFamily: fonts.body, color: colors.textMuted }}><div style={{ fontSize: 14, fontWeight: 700 }}>Loading history...</div></div>
          ) : past.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <div style={{ fontFamily: fonts.display, fontSize: 20, color: colors.text, marginBottom: 8 }}>No Past Sessions</div>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: 24 }}>Your completed and past sessions will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionLabel>Your Past Sessions ({past.length})</SectionLabel>
              {past.map(s => <UpcomingCard key={s.id} session={s} onCancel={handleCancel} isPast={true} />)}
            </div>
          )}
        </div>
      )}

      {bookingTarget && <BookingModal therapist={bookingTarget} onClose={() => setBookingTarget(null)} onConfirm={handleConfirm} loading={bookingLoading} />}
    </div>
  );
};

export default Appointments;
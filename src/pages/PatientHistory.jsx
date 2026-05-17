import { useState, useEffect } from "react";
import { colors, fonts, radius, shadows } from "../styles/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import * as api from "../api";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const formStyles = {
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 20,
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  label: {
    display: "block",
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 700,
    color: colors.textMid,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: radius.md,
    border: `1.5px solid ${colors.border}`,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    outline: "none",
    transition: "all 0.2s",
    background: "#F9FAFB",
    marginBottom: 20
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: radius.md,
    border: `1.5px solid ${colors.border}`,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    outline: "none",
    transition: "all 0.2s",
    background: "#F9FAFB",
    minHeight: 100,
    resize: "vertical",
    marginBottom: 20
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "0 24px"
  }
};

const PatientHistory = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    // Personal Info
    age: "", gender: "", education: "", occupation: "", financialCondition: "",
    // Family Info
    parentsStatus: "", siblingsCount: "", familyType: "Nuclear", livingArrangement: "", maritalStatus: "",
    // Mental Health Info
    pastTrauma: "", previousTherapy: false, previousTherapyDetails: "", medicalHistory: "",
    mentalHealthConditions: "", currentSymptoms: "", medications: "",
    // Therapy Expectations
    therapyGoals: "", therapistExpectations: "", mainConcerns: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchIntake = async () => {
      try {
        const data = await api.getIntakeForm();
        if (data && !data.error) {
          setFormData({
            ...data,
            age: data.age || "",
            siblingsCount: data.siblingsCount || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch intake form:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIntake();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.saveIntakeForm(formData);
      setMessage({ type: "success", text: "✅ Your wellness history has been saved permanently." });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error("Failed to save intake form:", err);
      setMessage({ type: "error", text: "❌ Failed to save history. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: "👤" },
    { id: "family", label: "Family Info", icon: "👨‍👩‍👧‍👦" },
    { id: "clinical", label: "Mental Health", icon: "🧠" },
    { id: "goals", label: "Therapy Goals", icon: "🎯" }
  ];

  if (loading) return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <div className="loading-spinner" style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
      <div style={{ fontFamily: fonts.body, color: colors.textMuted }}>Loading your history...</div>
    </div>
  );

  return (
    <div className="page-enter">
      {/* ── Header ── */}
      <div style={{
        borderRadius: radius.xl,
        background: "linear-gradient(135deg, #FDFCFB 0%, #F5F3FF 100%)",
        padding: "32px 40px", marginBottom: 24,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.card,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 10, fontFamily: fonts.body, fontWeight: 800, color: colors.purple, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            ✦ Clinical Records
          </div>
          <h1 style={{ fontFamily: fonts.display, fontSize: 32, fontWeight: 700, color: colors.text, lineHeight: 1.15, marginBottom: 8 }}>
            Your Patient History
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textMid, fontWeight: 600, maxWidth: 500 }}>
            This information is strictly confidential and helps your therapist provide the best care possible. Please keep it updated.
          </p>
        </div>
        <div style={{ fontSize: 64 }}>🏥</div>
      </div>

      {message && (
        <div style={{ 
          padding: "14px 20px", borderRadius: radius.md, marginBottom: 24,
          background: message.type === "success" ? "#D1FAE5" : "#FEE2E2",
          color: message.type === "success" ? "#065F46" : "#991B1B",
          border: `1px solid ${message.type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
          fontFamily: fonts.body, fontSize: 14, fontWeight: 700,
          animation: "slideDown 0.3s ease-out"
        }}>
          {message.text}
        </div>
      )}

      <div className="responsive-flex-row mobile-gap-sm" style={{ gap: 24, alignItems: "flex-start" }}>
        {/* ── Left Navigation ── */}
        <div className="mobile-full-width" style={{ width: 240, flexShrink: 0, position: "sticky", top: 20 }}>
          <div style={{ background: "#fff", borderRadius: radius.lg, border: `1.5px solid ${colors.border}`, overflow: "hidden", boxShadow: shadows.card }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
                  background: activeTab === tab.id ? `${colors.purple}10` : "transparent",
                  border: "none", borderLeft: `4px solid ${activeTab === tab.id ? colors.purple : "transparent"}`,
                  color: activeTab === tab.id ? colors.purple : colors.textMid,
                  fontFamily: fonts.body, fontSize: 14, fontWeight: 700, cursor: "pointer",
                  textAlign: "left", transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <Button 
            onClick={handleSave} 
            loading={saving}
            style={{ width: "100%", marginTop: 20, height: 50, fontSize: 15 }}
          >
            {saving ? "Saving..." : "Save History"}
          </Button>
        </div>

        {/* ── Main Form Content ── */}
        <div style={{ flex: 1 }}>
          <Card style={{ padding: "32px 40px" }}>
            <form onSubmit={handleSave}>
              {/* PERSONAL INFORMATION */}
              {activeTab === "personal" && (
                <div className="fade-in">
                  <div style={formStyles.sectionTitle}><span>👤</span> Personal Information</div>
                  <div style={formStyles.grid}>
                    <div>
                      <label style={formStyles.label}>Age</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} style={formStyles.input} placeholder="e.g. 25" />
                    </div>
                    <div>
                      <label style={formStyles.label}>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} style={formStyles.input}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div style={formStyles.grid}>
                    <div>
                      <label style={formStyles.label}>Education</label>
                      <input type="text" name="education" value={formData.education} onChange={handleChange} style={formStyles.input} placeholder="Highest degree earned" />
                    </div>
                    <div>
                      <label style={formStyles.label}>Occupation</label>
                      <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} style={formStyles.input} placeholder="Your current role" />
                    </div>
                  </div>
                  <label style={formStyles.label}>Financial Condition</label>
                  <select name="financialCondition" value={formData.financialCondition} onChange={handleChange} style={formStyles.input}>
                    <option value="">Select Condition</option>
                    <option value="Stable">Stable</option>
                    <option value="Managing">Managing</option>
                    <option value="Struggling">Struggling</option>
                    <option value="Crisis">Financial Crisis</option>
                  </select>
                </div>
              )}

              {/* FAMILY INFORMATION */}
              {activeTab === "family" && (
                <div className="fade-in">
                  <div style={formStyles.sectionTitle}><span>👨‍👩‍👧‍👦</span> Family Background</div>
                  <div style={formStyles.grid}>
                    <div>
                      <label style={formStyles.label}>Parents Status</label>
                      <select name="parentsStatus" value={formData.parentsStatus} onChange={handleChange} style={formStyles.input}>
                        <option value="">Select Status</option>
                        <option value="Living Together">Living Together</option>
                        <option value="Separated/Divorced">Separated / Divorced</option>
                        <option value="One Deceased">One Parent Deceased</option>
                        <option value="Both Deceased">Both Deceased</option>
                      </select>
                    </div>
                    <div>
                      <label style={formStyles.label}>Number of Siblings</label>
                      <input type="number" name="siblingsCount" value={formData.siblingsCount} onChange={handleChange} style={formStyles.input} placeholder="0" />
                    </div>
                  </div>
                  <div style={formStyles.grid}>
                    <div>
                      <label style={formStyles.label}>Family Type</label>
                      <select name="familyType" value={formData.familyType} onChange={handleChange} style={formStyles.input}>
                        <option value="Nuclear">Nuclear Family</option>
                        <option value="Joint">Joint Family</option>
                      </select>
                    </div>
                    <div>
                      <label style={formStyles.label}>Marital Status</label>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} style={formStyles.input}>
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                  <label style={formStyles.label}>Living Arrangement</label>
                  <textarea name="livingArrangement" value={formData.livingArrangement} onChange={handleChange} style={formStyles.textarea} placeholder="Who do you currently live with?" />
                </div>
              )}

              {/* MENTAL HEALTH INFO */}
              {activeTab === "clinical" && (
                <div className="fade-in">
                  <div style={formStyles.sectionTitle}><span>🧠</span> Clinical History</div>
                  
                  <label style={formStyles.label}>Past Trauma / Life Events</label>
                  <textarea name="pastTrauma" value={formData.pastTrauma} onChange={handleChange} style={formStyles.textarea} placeholder="Any significant events or trauma you would like to share?" />

                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
                    <input type="checkbox" name="previousTherapy" checked={formData.previousTherapy} onChange={handleChange} id="prevTherapy" />
                    <label htmlFor="prevTherapy" style={{ ...formStyles.label, marginBottom: 0 }}>Have you attended therapy before?</label>
                  </div>

                  {formData.previousTherapy && (
                    <>
                      <label style={formStyles.label}>Previous Therapy Details</label>
                      <textarea name="previousTherapyDetails" value={formData.previousTherapyDetails} onChange={handleChange} style={formStyles.textarea} placeholder="Dates, duration, and if it was helpful..." />
                    </>
                  )}

                  <label style={formStyles.label}>Medical History & Conditions</label>
                  <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} style={formStyles.textarea} placeholder="Chronic illnesses, surgeries, or general health status..." />

                  <label style={formStyles.label}>Known Mental Health Diagnoses</label>
                  <input type="text" name="mentalHealthConditions" value={formData.mentalHealthConditions} onChange={handleChange} style={formStyles.input} placeholder="e.g. Anxiety, Depression, ADHD" />

                  <label style={formStyles.label}>Current Symptoms</label>
                  <textarea name="currentSymptoms" value={formData.currentSymptoms} onChange={handleChange} style={formStyles.textarea} placeholder="What are you feeling lately? (e.g. insomnia, panic, low mood)" />

                  <label style={formStyles.label}>Current Medications</label>
                  <input type="text" name="medications" value={formData.medications} onChange={handleChange} style={formStyles.input} placeholder="List any medications you are taking" />
                </div>
              )}

              {/* THERAPY GOALS */}
              {activeTab === "goals" && (
                <div className="fade-in">
                  <div style={formStyles.sectionTitle}><span>🎯</span> Therapy Expectations</div>
                  
                  <label style={formStyles.label}>What are your main concerns today?</label>
                  <textarea name="mainConcerns" value={formData.mainConcerns} onChange={handleChange} style={formStyles.textarea} placeholder="Describe the primary problems bringing you to therapy..." />

                  <label style={formStyles.label}>Your Goals for Therapy</label>
                  <textarea name="therapyGoals" value={formData.therapyGoals} onChange={handleChange} style={formStyles.textarea} placeholder="What do you hope to achieve through our sessions?" />

                  <label style={formStyles.label}>What do you expect from your therapist?</label>
                  <textarea name="therapistExpectations" value={formData.therapistExpectations} onChange={handleChange} style={formStyles.textarea} placeholder="e.g. Active listening, direct advice, specific techniques..." />
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <Button onClick={handleSave} loading={saving} style={{ padding: "14px 48px", height: "auto", fontSize: 15 }}>
                  Save All Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .loading-spinner { animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PatientHistory;

import React, { useState } from "react";
import CardBox from "./CardBox";
import MoodTrendChart from "./MoodTrendChart";
import MoodBarChart from "./MoodBarChart";

/**
 * Right panel for Psychologist Schedule view: Urgent Cases, Patient Overview, Chat & Feedback, Automated Patient History.
 */
export default function ScheduleRightPanel() {
  const [message, setMessage] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <CardBox style={{ marginBottom: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontWeight: 700,
            fontSize: 16,
            color: "#1E1B4B",
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          Urgent Cases
        </div>
        <div
          style={{
            background: "#FFF0F6",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 700, color: "#1E1B4B", fontSize: 14 }}>
              J. Chen
            </span>
            <span
              style={{
                background: "#EDE9FE",
                color: "#7C3AED",
                borderRadius: 6,
                padding: "2px 8px",
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              Confirmed
            </span>
          </div>
          <div
            style={{
              color: "#9896B8",
              fontWeight: 500,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            Recent Mood Trend Anomalies
          </div>
          <MoodTrendChart />
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: "rgba(239,68,68,0.08)",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 12 }}>⚡</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#EF4444",
                }}
              >
                Critical Alert
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                color: "#4C4682",
              }}
            >
              Severe stress/depression pattern detected in latest mood data.
            </span>
          </div>
        </div>
      </CardBox>

      <CardBox style={{ marginBottom: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: "#1E1B4B",
            marginBottom: 12,
          }}
        >
          Patient Overview
        </div>
        <ul
          style={{
            color: "#4C4682",
            fontWeight: 600,
            fontSize: 14,
            paddingLeft: 16,
            margin: 0,
          }}
        >
          <li>Total patients: 44</li>
          <li>Recent Completion: 29</li>
          <li>Anxious Completion: 10</li>
          <li>Therapy Completion: 10</li>
        </ul>
        <MoodBarChart />
      </CardBox>

      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 16,
            color: "#1E1B4B",
            marginBottom: 12,
          }}
        >
          Chat & Feedback
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #E5E1F8",
            padding: "8px 12px",
            marginBottom: 12,
          }}
        >
          <span style={{ color: "#9896B8", fontSize: 14 }}>🔍</span>
          <input
            type="text"
            placeholder="Search"
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: 14,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#9896B8",
            marginBottom: 8,
            letterSpacing: "0.5px",
          }}
        >
          RECENT CONTACTS
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 16 }}>👤</span>
          <span style={{ fontWeight: 600, color: "#4C4682", fontSize: 14 }}>
            Sarah L.
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#10B981",
              fontWeight: 600,
            }}
          >
            Recent Contact
          </span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10B981",
              marginLeft: 4,
            }}
          />
        </div>
        {chatOpen && (
          <div
            style={{
              background: "#7C3AED",
              borderRadius: 12,
              padding: 16,
              position: "relative",
            }}
          >
            <button
              onClick={() => setChatOpen(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: 4,
                width: 24,
                height: 24,
                cursor: "pointer",
                color: "#fff",
                fontSize: 14,
              }}
            >
              ✕
            </button>
            <div
              style={{
                color: "rgba(255,255,255,0.9)",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              Active Chat
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14 }}>👤</span>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>
                Sarah L.
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Patient
              </span>
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              How are you feeling today?
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                marginBottom: 12,
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.25)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Send Feedback
              </button>
              <button
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.9)",
                  color: "#7C3AED",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>

      <CardBox style={{ marginBottom: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontWeight: 700,
            fontSize: 16,
            color: "#1E1B4B",
          }}
        >
          <span style={{ fontSize: 16 }}>✓</span>
          Automated Patient History
        </div>
        <ul
          style={{
            color: "#4C4682",
            fontWeight: 600,
            fontSize: 14,
            paddingLeft: 16,
            margin: 0,
          }}
        >
          <li>Past Moods</li>
          <li>Diagnoses</li>
          <li>Therapy Notes</li>
          <li>Medication</li>
        </ul>
        <div
          style={{
            background: "#FEF3C7",
            borderRadius: 8,
            padding: 12,
            marginTop: 12,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>📄</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#92400E",
            }}
          >
            History transferred. No need to repeat trauma multiple times.
          </span>
        </div>
      </CardBox>
    </div>
  );
}

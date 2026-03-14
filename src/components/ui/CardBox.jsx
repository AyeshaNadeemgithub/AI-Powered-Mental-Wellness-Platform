import React from "react";

export default function CardBox({ children, style }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 2px 12px rgba(124,58,237,0.07)",
      padding: 24,
      marginBottom: 18,
      ...style
    }}>
      {children}
    </div>
  );
}

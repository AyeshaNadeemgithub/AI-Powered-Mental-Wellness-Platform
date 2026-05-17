import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#7C3AED';

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      transform: visible ? 'translateY(0)' : 'translateY(100px)',
      opacity: visible ? 1 : 0,
      transition: '0.3s ease-in-out',
      background: bgColor,
      color: '#fff',
      padding: '12px 20px',
      borderRadius: 12,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      maxWidth: 350
    }}>
      <div style={{ fontSize: 20 }}>{type === 'success' ? '✅' : '💬'}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>New Message</div>
        <div style={{ fontSize: 12, opacity: 0.9 }}>{message}</div>
      </div>
      <button 
        onClick={() => setVisible(false)}
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 4 }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;

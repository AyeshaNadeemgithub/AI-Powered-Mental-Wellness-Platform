// ─── NAV ITEMS (sidebar) ──────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { icon: "⊞",  label: "Dashboard",    path: "/dashboard" },
  { icon: "😊", label: "Mood Tracking", path: "/mood" },
  { icon: "🧘", label: "AI Support",    path: "/ai-support" },
  { icon: "💬", label: "Therapist Chat",path: "/chat" },
  { icon: "📓", label: "Journal",       path: "/journal" },
  { icon: "📅", label: "Appointments",  path: "/appointments" },
  { icon: "📋", label: "My History",    path: "/history" },
  { icon: "⚙️", label: "Settings",      path: "/settings" },
];

// ─── LANDING FEATURES ─────────────────────────────────────────────────────────
export const FEATURES = [
  {
    icon: "⚡",
    title: "Daily Streaks + Reward System",
    desc: "Build habits, earn badges, stay motivated with daily mood tracking and rewards.",
    tag: "Habits",
  },
  {
    icon: "📊",
    title: "Real-Time Mood Tracking",
    desc: "Understand your emotions and share detailed reports with your therapist seamlessly.",
    tag: "Analytics",
  },
  {
    icon: "📓",
    title: "Private Notes / Personal Journal",
    desc: "A safe, encrypted space for thought, reflection, and growth. Your words, only yours.",
    tag: "Privacy",
  },
  {
    icon: "💜",
    title: "Proper Appointment System",
    desc: "Book sessions with licensed psychologists. Calendar sync and reminders included.",
    tag: "Booking",
  },
  {
    icon: "🤖",
    title: "AI Mental Health Chatbot",
    desc: "24/7 emotional support and coping exercises — always available, always compassionate.",
    tag: "AI",
  },
  {
    icon: "👤",
    title: "Patient History Management",
    desc: "Visualize your success rate milestones and track long-term recovery progress.",
    tag: "Insights",
  },
];

// ─── LANDING STATS ────────────────────────────────────────────────────────────
export const STATS = [
  { value: "94%",  label: "Reduced Anxiety" },
  { value: "2.3M", label: "Sessions Completed" },
  { value: "4.9★", label: "App Rating" },
  { value: "180+", label: "Licensed Therapists" },
];

// ─── INITIAL CHAT MESSAGES ────────────────────────────────────────────────────
export const INITIAL_MESSAGES = [
  { from: "ai",   text: "Welcome back! How are you feeling today? 💜",                                        time: "10:30 AM" },
  { from: "ai",   text: "Remember to take a deep breath. Would you like a guided exercise?",                  time: "10:30 AM" },
  { from: "user", text: "I'm feeling anxious.",                                                                time: "10:31 AM" },
  { from: "ai",   text: "I understand. Let's try a guided exercise together. You're doing great! 🌿",          time: "10:31 AM" },
  { from: "user", text: "Yes please! Keep up the good work.",                                                  time: "10:32 AM" },
  { from: "ai",   text: "Wonderful! Inhale for 4 counts, hold for 4, exhale for 6. Ready? 🧘",                time: "10:32 AM" },
  { from: "user", text: "Thank you!",                                                                          time: "10:33 AM" },
];

// ─── AI REPLIES POOL ──────────────────────────────────────────────────────────
export const AI_REPLIES = [
  "That's completely valid. You're doing really well by reaching out. 💜",
  "I hear you. Let's take this one step at a time together. 🌿",
  "Would you like to try a breathing exercise right now?",
  "Remember — every small step forward counts. You've got this. ✨",
  "It's okay to feel that way. I'm here with you. 💙",
  "You're stronger than you think. Let's work through this together. 🌸",
];

// ─── QUICK CHAT ACTIONS ───────────────────────────────────────────────────────
export const CHAT_QUICK_ACTIONS = [
  { icon: "⚡", label: "Daily Check-in" },
  { icon: "💜", label: "Coping Exercise" },
  { icon: "💬", label: "Self-Help Tips" },
];

// ─── FOOTER LINKS ─────────────────────────────────────────────────────────────
export const FOOTER_LINKS = ["About Us", "Contact", "Privacy Policy", "Terms of Service"];
export const SOCIAL_ICONS  = ["f", "𝕏", "▶", "📷"];

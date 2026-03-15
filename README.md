# 🧘 CalmMind — AI-Powered Mental Wellness Platform

CalmMind is a web-based mental wellness platform that connects patients with licensed psychologists while providing instant AI-driven emotional support. Users can track their mood, write in a private journal, book appointments, and engage with a 24/7 AI chatbot — all in one secure space.

---

## Team

- Ayesha Nadeem
- Kainat
- Yousuf Hussain Khan

---

## Features

- **AI Chatbot** — 24/7 emotional support powered by OpenAI API
- **Mood Tracking** — Log and visualize daily mood trends with charts
- **Private Journal** — Encrypted personal journaling
- **Appointment Booking** — Schedule sessions with verified psychologists
- **Psychologist Profiles** — Browse and connect with licensed professionals
- **Reward & Streak System** — Gamified engagement to build consistent habits
- **Role-Based Access** — Separate dashboards for patients and psychologists

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| AI | OpenAI API |
| Real-time | Socket.io |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
AI-Powered-Mental-Wellness-Platform/
│
├── backend/
├── build/
├── public/
│
├── src/
│   ├── api/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminTopBar.jsx
│   │   │   ├── AppLayout.jsx
│   │   │   ├── PsychologistDash.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StaffDashboardLayout.jsx
│   │   │   └── TopBar.jsx
│   │   │
│   │   └── ui/
│   │       ├── Badge.jsx
│   │       ├── Brand.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── CardBox.jsx
│   │       ├── MoodBarChart.jsx
│   │       ├── MoodChart.jsx
│   │       ├── MoodTrendChart.jsx
│   │       ├── PageHeader.jsx
│   │       ├── ScheduleRightPanel.jsx
│   │       ├── SidebarIcon.jsx
│   │       ├── StatCard.jsx
│   │       ├── SystemHealthChart.jsx
│   │       └── WeekCalendarGrid.jsx
│   │
│   ├── data/
│   │   └── index.js
│   │
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminSignup.jsx
│   │   ├── Appointments.jsx
│   │   ├── Chat.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Journal.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── MoodTracking.jsx
│   │   ├── NotFound.jsx
│   │   ├── PatientSignup.jsx
│   │   ├── PsychologistDashboard.jsx
│   │   ├── Settings.jsx
│   │   └── TherapistSignup.jsx
│   │
│   ├── styles/
│   ├── App.jsx
│   └── index.jsx
│
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- PostgreSQL running locally (or a cloud connection string)

### Installation

```bash
# Clone the repository
git clone https://github.com/AyeshaNadeemgithub/AI-Powered-Mental-Wellness-Platform.git

# Navigate into the project
cd AI-Powered-Mental-Wellness-Platform

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/calmmind
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

### Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to inspect your DB
npx prisma studio
```

### Run the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

This project is for academic and educational purposes.

---

> CalmMind — because mental health care should be accessible to everyone.

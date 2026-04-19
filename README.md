# 🧘 CalmMind — AI-Powered Mental Wellness Platform

CalmMind is a full-stack mental wellness web application that provides patients with 24/7 AI emotional support, mood tracking, private journaling, and appointment booking with licensed psychologists — all in one secure platform.

---

## Team

- Ayesha Nadeem
- Kainat
- Yousuf Hussain Khan

---

## Features

- **AI Chatbot** — 24/7 emotional support powered by Groq (Llama 3.3 70B). Saves full chat history per patient. States it is not a replacement for a psychologist at the start of every session
- **Mood Tracking** — Log daily mood with emoji scale, energy level, sleep quality, and keyword tags. Visualized as charts
- **Private Journal** — Personal journal entries with full CRUD — create, edit, delete. Private to each patient
- **Appointment Booking** — UI for booking sessions with psychologists (backend routes in progress)
- **Reward & Streak System** — Earn points for logging mood, writing journal entries, and using chat. Unlock badges automatically
- **Notifications** — In-app notifications for badge milestones and point achievements
- **Role-Based Access** — Separate dashboards and flows for Patients, Psychologists, and Admins

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6 |
| Styling | Custom design system (theme.js) |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase, Prisma ORM |
| AI | Groq API (Llama 3.3 70B) |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
AI-Powered-Mental-Wellness-Platform/
│
├── backend/                        # Express.js API server
│   ├── prisma/
│   │   ├── schema.prisma           # Full database schema
│   │   └── seed.js                 # Seeds badges and mood tags
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.js           # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT protect + requireRole
│   │   ├── routes/
│   │   │   ├── auth.js             # Signup + login for all roles
│   │   │   ├── chat.js             # AI chat with Groq + session history
│   │   │   ├── dashboard.js        # Stats, notifications, badges
│   │   │   ├── journal.js          # Full CRUD journal entries
│   │   │   └── mood.js             # Mood logging + history
│   │   └── utils/
│   │       └── gamification.js     # Points, streaks, badge engine
│   ├── .env.example                # Template for environment variables
│   ├── package.json
│   └── server.js                   # Express app entry point
│
├── src/                            # React frontend
│   ├── api/
│   │   └── index.js                # All API calls in one place
│   ├── components/
│   │   ├── layout/                 # Sidebars, topbars, page layouts
│   │   └── ui/                     # Reusable UI components
│   ├── data/
│   │   └── index.js                # Static data, nav items, quick actions
│   ├── pages/                      # One file per page/route
│   ├── styles/
│   │   └── theme.js                # Colors, fonts, spacing — edit here
│   ├── App.jsx                     # Routes
│   └── index.jsx                   # Entry point
│
├── public/                         # Static assets
├── package.json                    # Frontend dependencies
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- A [Supabase](https://supabase.com) account (free) — for the PostgreSQL database
- A [Groq](https://console.groq.com) account (free) — for the AI chatbot

---

### 1. Clone the repository

```bash
git clone https://github.com/AyeshaNadeemgithub/AI-Powered-Mental-Wellness-Platform.git
cd AI-Powered-Mental-Wellness-Platform
```

---

### 2. Set up Supabase (database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project and set a database password
3. Go to **Project Settings → Database → Connection string → Prisma**
4. Copy the two connection strings shown — you will need them in the next step

---

### 3. Get a Groq API key (AI chatbot)

1. Go to [console.groq.com](https://console.groq.com) and create a free account
2. Go to **API Keys → Create API Key**
3. Copy the key — you will need it in the next step

---

### 4. Configure environment variables

Create a `.env` file inside the `backend/` folder. Use `backend/.env.example` as a template:

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your values:

```env
# From Supabase → Project Settings → Database → Connection string → Prisma
DATABASE_URL="postgresql://postgres.YOURPROJECT:YOURPASSWORD@aws-X.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOURPROJECT:YOURPASSWORD@aws-X.pooler.supabase.com:5432/postgres"

# Any long random string — used to sign JWT tokens
JWT_SECRET="replace_with_a_long_random_string"

# Secret code required when signing up as an Admin
ADMIN_ACCESS_CODE="YOUR_ADMIN_CODE"

# From console.groq.com → API Keys
GROQ_API_KEY="gsk_your_groq_key_here"

PORT=5000
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

---

### 5. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend** (from the root folder):
```bash
npm install
```

---

### 6. Set up the database

Run this from inside the `backend/` folder:

```bash
# Create all tables in your Supabase database
npx prisma db push

# Seed the database with starter badges and mood tags
node prisma/seed.js
```

> Use `prisma db push` — do NOT use `prisma migrate dev` with Supabase as it can cause issues with cloud databases.

---

### 7. Run the app

You need **two terminals** running at the same time:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
You should see: `🌿 CalmMind backend running on http://localhost:5000`

**Terminal 2 — Frontend** (from root folder):
```bash
npm start
```
The app will open automatically at [http://localhost:3000](http://localhost:3000)

---

### 8. Create your first account

1. Go to `http://localhost:3000`
2. Click **Get Started** and sign up as a **Patient**
3. Log in and explore the dashboard, mood tracking, journal, and chat

To create an **Admin** account, you will need the `ADMIN_ACCESS_CODE` you set in `.env`.

---

## API Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/patient-signup` | Register as patient | No |
| POST | `/api/auth/therapist-signup` | Register as psychologist | No |
| POST | `/api/auth/admin-signup` | Register as admin | No |
| POST | `/api/auth/login` | Login (all roles) | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/mood` | Log a mood entry | Yes |
| GET | `/api/mood` | Get mood history | Yes |
| POST | `/api/journal` | Create journal entry | Yes |
| GET | `/api/journal` | Get all journal entries | Yes |
| PUT | `/api/journal/:id` | Update journal entry | Yes |
| DELETE | `/api/journal/:id` | Delete journal entry | Yes |
| POST | `/api/chat/session` | Start a new chat session | Yes |
| POST | `/api/chat/message` | Send message, get AI reply | Yes |
| GET | `/api/chat/sessions` | Get all past sessions | Yes |
| GET | `/api/chat/session/:id/messages` | Get messages for a session | Yes |
| GET | `/api/dashboard` | Get dashboard data | Yes |
| GET | `/api/dashboard/notifications` | Get notifications | Yes |
| PUT | `/api/dashboard/notifications/mark-read` | Mark all as read | Yes |
| DELETE | `/api/dashboard/notifications/clear-all` | Clear all notifications | Yes |

---

## What's Still In Progress

- Appointments backend routes (UI is complete, API routes not yet built)
- Admin dashboard backend (UI is complete, API routes not yet built)
- Psychologist dashboard backend (UI is complete, no live data yet)
- Socket.io real-time chat between patients and psychologists
- Email verification on signup

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

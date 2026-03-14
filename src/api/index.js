// src/api/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Central API helper for CalmMind.
// All pages import from here — never write fetch() calls inside components.
// Token is stored in localStorage under 'calmmind_token'.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'http://localhost:5000/api'

// ─── Internal helpers ─────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('calmmind_token')

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

const post = (path, body, withAuth = false) =>
  fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: withAuth ? authHeaders() : { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  }).then(r => r.json())

const get = (path) =>
  fetch(`${BASE}${path}`, { headers: authHeaders() }).then(r => r.json())

const put = (path, body) =>
  fetch(`${BASE}${path}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(body)
  }).then(r => r.json())

const del = (path) =>
  fetch(`${BASE}${path}`, {
    method:  'DELETE',
    headers: authHeaders()
  }).then(r => r.json())

// ─── Session helpers (localStorage) ──────────────────────────────────────────
export const saveSession = (token, user) => {
  localStorage.setItem('calmmind_token', token)
  localStorage.setItem('calmmind_user',  JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem('calmmind_token')
  localStorage.removeItem('calmmind_user')
}

export const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('calmmind_user')) }
  catch { return null }
}

export const isLoggedIn = () => !!getToken()

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const patientSignup   = (data)                 => post('/auth/patient-signup',  data)
export const therapistSignup = (data)                 => post('/auth/therapist-signup', data)
export const adminSignup     = (data)                 => post('/auth/admin-signup',     data)
export const login           = (email, password, role) => post('/auth/login', { email, password, role })
export const getMe           = ()                     => get('/auth/me')

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const getDashboard = () => get('/dashboard')

// ─── MOOD ─────────────────────────────────────────────────────────────────────
export const logMood       = (data) => post('/mood', data, true)
export const getMoodHistory = ()    => get('/mood')

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
export const createJournalEntry = (data)    => post('/journal', data, true)
export const getJournalEntries  = ()        => get('/journal')
export const updateJournalEntry = (id, data) => put(`/journal/${id}`, data)
export const deleteJournalEntry = (id)      => del(`/journal/${id}`)

// ─── CHAT ─────────────────────────────────────────────────────────────────────
export const startChatSession = ()                      => post('/chat/session',  {}, true)
export const sendChatMessage  = (sessionId, content)    => post('/chat/message',  { sessionId, content }, true)
export const getChatSessions  = ()                      => get('/chat/sessions')
export const getChatMessages  = (sessionId)             => get(`/chat/session/${sessionId}/messages`)

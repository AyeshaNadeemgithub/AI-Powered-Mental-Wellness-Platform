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

const handleResponse = async (response) => {
  if (response.status === 401) {
    clearSession()
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
  return response.json()
}

const post = (path, body, withAuth = false) =>
  fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: withAuth ? authHeaders() : { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  }).then(handleResponse)

const get = (path) =>
  fetch(`${BASE}${path}`, { headers: authHeaders() }).then(handleResponse)

const put = (path, body) =>
  fetch(`${BASE}${path}`, {
    method:  'PUT',
    headers: authHeaders(),
    body:    JSON.stringify(body)
  }).then(handleResponse)

const del = (path) =>
  fetch(`${BASE}${path}`, {
    method:  'DELETE',
    headers: authHeaders()
  }).then(handleResponse)

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
export const updateProfile   = (data)                 => put('/auth/profile', data)
export const changePassword  = (data)                 => put('/auth/change-password', data)
export const exportMyData    = ()                     => get('/auth/export-data')
export const deactivateAccount = ()                   => put('/auth/deactivate', {})
export const deleteAccount   = ()                     => del('/auth/delete-account')

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const getDashboard            = () => get('/dashboard')
export const getNotifications         = () => get('/dashboard/notifications')
export const markNotificationsAsRead = () => put('/dashboard/notifications/mark-read', {})
export const clearAllNotifications   = () => del('/dashboard/notifications/clear-all')

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

// ─── APPOINTMENTS & PSYCHOLOGISTS ─────────────────────────────────────────────
export const getPsychologists          = ()     => get('/appointments/psychologists')
export const bookAppointment           = (data) => post('/appointments', data, true)
export const getAppointments           = ()     => get('/appointments')
export const cancelAppointment         = (id)   => put(`/appointments/${id}/cancel`, {})

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
export const getAdminStats  = () => get('/admin/stats')
export const getAllUsers    = () => get('/admin/users')
export const getAdminAppointments = () => get('/admin/appointments')
export const approvePsychologist = (id) => put(`/admin/approve-psychologist/${id}`, {})
export const deleteUser = (id) => del(`/admin/users/${id}`)
export const getPsychologistDashboard  = (weekOffset = 0) => get(`/psychologist-dashboard?weekOffset=${weekOffset}`)

// ─── DIRECT MESSAGING ──────────────────────────────────────────────────────────
export const sendMessage      = (receiverId, content) => post('/messages', { receiverId, content }, true)
export const getConversations = ()                   => get('/messages/conversations')
export const getMessages      = (conversationId)      => get(`/messages/${conversationId}`)

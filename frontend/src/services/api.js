// ==========================================
// API Configuration
// ==========================================
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ==========================================
// Gas Endpoints
// ==========================================
export async function getLatestReading() {
  const response = await fetch(`${API_BASE}/gas/latest`)
  if (!response.ok) throw new Error('Failed to fetch gas reading')
  const result = await response.json()
  return result.data
}

// ==========================================
// Control Endpoints
// ==========================================
export async function sendControl(command) {
  const response = await fetch(`${API_BASE}/control`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command })
  })
  if (!response.ok) throw new Error('Failed to send control command')
  return await response.json()
}

// ==========================================
// Subscribe Endpoints
// ==========================================
export async function subscribe(email) {
  const response = await fetch(`${API_BASE}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  })
  if (!response.ok) throw new Error('Failed to subscribe')
  return await response.json()
}

export async function getSubscribers() {
  const response = await fetch(`${API_BASE}/subscribe/list`)
  if (!response.ok) throw new Error('Failed to fetch subscribers')
  return await response.json()
}

export async function unsubscribe(email) {
  const response = await fetch(`${API_BASE}/subscribe/${email}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to unsubscribe')
  return await response.json()
}

export async function removeSubscriber(email) {
  return unsubscribe(email)
}

export default {
  getLatestReading,
  sendControl,
  subscribe,
  getSubscribers,
  unsubscribe,
  removeSubscriber
}

const API_BASE = '/bags-api/api/v1'
const API_KEY = import.meta.env.VITE_BAGS_API_KEY

export async function fetchBags(endpoint) {
  const res = await fetch(API_BASE + endpoint, {
    headers: { 'x-api-key': API_KEY }
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'API error')
  return data.response
}
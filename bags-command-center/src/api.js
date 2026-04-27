const API_BASE = '/bags-api/api/v1'

export async function fetchBags(endpoint) {
  const res = await fetch(API_BASE + endpoint)
  if (!res.ok) throw new Error('API error ' + res.status)
  const data = await res.json()
  if (data && data.success === false) throw new Error(data.error || 'API error')
  return data.response !== undefined ? data.response : data
}

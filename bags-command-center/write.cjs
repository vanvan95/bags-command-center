const fs = require('fs')

fs.writeFileSync('src/api.js', `const API_BASE = '/api/bags/api/v1'

export async function fetchBags(endpoint) {
  const res = await fetch(API_BASE + endpoint)
  if (!res.ok) throw new Error('API error ' + res.status)
  const data = await res.json()
  if (data && data.success === false) throw new Error(data.response || data.error || 'API error')
  return data.response !== undefined ? data.response : data
}
`)

console.log('api.js fixed!')
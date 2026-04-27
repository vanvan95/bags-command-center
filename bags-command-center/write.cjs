const fs = require('fs')

fs.writeFileSync('src/api.js', `const API_BASE = 'https://public-api-v2.bags.fm/api/v1'
const API_KEY = import.meta.env.VITE_BAGS_API_KEY || 'bags_prod_PcgAKrA3hsM2fjZCOwKa331Nh714v88YX4EkPhjwACU'

export async function fetchBags(endpoint) {
  const res = await fetch(API_BASE + endpoint, {
    headers: { 'x-api-key': API_KEY }
  })
  if (!res.ok) throw new Error('API error ' + res.status)
  const data = await res.json()
  if (data && data.success === false) throw new Error(data.response || data.error || 'API error')
  return data.response !== undefined ? data.response : data
}
`)

console.log('api.js done!')
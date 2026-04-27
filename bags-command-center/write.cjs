const fs = require('fs')

fs.mkdirSync('api', { recursive: true })

fs.writeFileSync('api/bags.js', `export default async function handler(req, res) {
  const path = req.url.replace('/api/bags', '')
  const url = 'https://public-api-v2.bags.fm' + path
  
  const response = await fetch(url, {
    headers: {
      'x-api-key': process.env.VITE_BAGS_API_KEY,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await response.json()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(response.status).json(data)
}`)

fs.writeFileSync('src/api.js', `const API_BASE = '/api/bags/api/v1'

export async function fetchBags(endpoint) {
  const res = await fetch(API_BASE + endpoint)
  if (!res.ok) throw new Error('API error ' + res.status)
  const data = await res.json()
  if (data && data.success === false) throw new Error(data.error || 'API error')
  return data.response !== undefined ? data.response : data
}
`)

fs.writeFileSync('vercel.json', `{
  "rewrites": [
    { "source": "/api/bags/(.*)", "destination": "/api/bags" }
  ]
}`)

console.log('Serverless function done!')
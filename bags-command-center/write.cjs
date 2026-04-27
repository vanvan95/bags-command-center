const fs = require('fs')

fs.writeFileSync('api/bags.js', `export default async function handler(req, res) {
  const path = req.url.replace('/api/bags', '')
  const url = 'https://public-api-v2.bags.fm' + path
  
  const response = await fetch(url, {
    headers: { 'x-api-key': process.env.BAGS_API_KEY }
  })
  
  const text = await response.text()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')
  res.status(response.status).send(text)
}`)

fs.writeFileSync('src/api.js', `const API_BASE = '/api/bags/api/v1'

export async function fetchBags(endpoint) {
  const res = await fetch(API_BASE + endpoint)
  if (!res.ok) throw new Error('API error ' + res.status)
  const data = await res.json()
  if (data && data.success === false) throw new Error(data.response || data.error || 'API error')
  return data.response !== undefined ? data.response : data
}
`)

console.log('done!')
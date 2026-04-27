const fs = require('fs')

fs.writeFileSync('api/bags.js', `export default async function handler(req, res) {
  const path = req.url.replace('/api/bags/api/v1', '')
  const url = 'https://public-api-v2.bags.fm/api/v1' + path
  
  const response = await fetch(url, {
    headers: {
      'x-api-key': process.env.BAGS_API_KEY,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await response.json()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(response.status).json(data)
}`)

console.log('done!')
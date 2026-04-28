const fs = require('fs')

fs.writeFileSync('api/claude.js', `export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const body = req.body || {}
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: body.messages || [{ role: 'user', content: 'Hello' }]
      })
    })
    const data = await r.json()
    const text = data.content?.[0]?.text
    if (!text) return res.status(500).json({ error: JSON.stringify(data).slice(0,200) })
    res.status(200).json({ content: [{ text }] })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}`)

console.log('done!')
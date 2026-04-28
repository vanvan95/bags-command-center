const fs = require('fs')

fs.writeFileSync('api/claude.js', `export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const body = req.body || {}
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: body.messages || [{ role: 'user', content: 'Hello' }],
        max_tokens: 1000
      })
    })
    const groqData = await groqRes.json()
    console.log('Groq raw:', JSON.stringify(groqData).slice(0, 300))
    const text = groqData?.choices?.[0]?.message?.content
    if (!text) {
      return res.status(500).json({ error: 'Groq returned: ' + JSON.stringify(groqData).slice(0,200) })
    }
    res.status(200).json({ content: [{ text }] })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}`)

console.log('done!')
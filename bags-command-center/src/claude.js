module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    let body = req.body
    if (typeof body === 'string') body = JSON.parse(body)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: body.messages || [{ role: 'user', content: 'Hello' }],
        max_tokens: 1000
      })
    })

    const text = await response.text()
    let data
    try { data = JSON.parse(text) } catch(e) {
      return res.status(500).json({ error: 'Groq error: ' + text.slice(0, 200) })
    }

    const result = data.choices?.[0]?.message?.content || 'No response'
    res.status(200).json({ content: [{ text: result }] })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
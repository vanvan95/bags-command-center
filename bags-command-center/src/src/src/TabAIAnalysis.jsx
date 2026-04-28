import { useState } from 'react'
import { fetchBags } from './api'

export default function TabAIAnalysis() {
  const [mode, setMode] = useState('market') // 'market' | 'token'
  const [tokenInput, setTokenInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function analyzeMarket() {
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const tokens = await fetchBags('/token-launch/feed')
      const list = Array.isArray(tokens) ? tokens : (tokens?.launches || tokens?.tokens || [])

      const prompt = `You are a crypto market analyst for Bags.fm (a Solana token launchpad).
      
Here is the current market data (top tokens):
${JSON.stringify(list.slice(0, 15), null, 2)}

Analyze this market and provide:
1. **Overall Market Sentiment** (Bullish/Bearish/Neutral) with reasoning
2. **Top 3 Trending Tokens** and why they stand out
3. **Risk Assessment** for the overall market
4. **Key Opportunities** traders should watch
5. **Red Flags** if any

Be concise, data-driven, and use emojis for readability. Format with clear sections.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || 'No analysis available'
      setResult(text)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeToken() {
    if (!tokenInput.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const tokens = await fetchBags('/token-launch/feed')
      const list = Array.isArray(tokens) ? tokens : (tokens?.launches || tokens?.tokens || [])
      const token = list.find(t =>
        t.name?.toLowerCase().includes(tokenInput.toLowerCase()) ||
        t.symbol?.toLowerCase().includes(tokenInput.toLowerCase())
      )

      const prompt = `You are a crypto analyst specializing in Solana meme tokens on Bags.fm.

${token ? `Token data found:\n${JSON.stringify(token, null, 2)}` : `Token "${tokenInput}" not found in current feed. Analyze based on name/symbol only.`}

Provide a detailed analysis:
1. **Sentiment Score** (0-100) with explanation
2. **Risk Level** (Low/Medium/High/Extreme) with reasons
3. **Growth Potential** assessment
4. **On-chain Health Indicators**
5. **Recommendation** (Buy/Hold/Avoid) with clear reasoning
6. **Price Targets** if applicable

Be honest about risks. Use emojis. Format clearly.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || 'No analysis available'
      setResult(text)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function formatResult(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} style={{ fontWeight: 700, fontSize: 16, color: '#f97316', margin: '16px 0 6px' }}>{line.replace(/\*\*/g, '')}</div>
      }
      if (line.startsWith('**')) {
        return <div key={i} style={{ fontWeight: 700, color: '#fff', margin: '12px 0 4px' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      }
      if (line.trim() === '') return <br key={i} />
      return <div key={i} style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontSize: 14 }}>{line}</div>
    })
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>🤖 AI Analysis</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>
          Powered by Claude AI — market int
import { useState } from 'react'
import { fetchBags } from './api'

export default function TabAIAnalysis() {
  const [mode, setMode] = useState('token')
  const [tokenQuery, setTokenQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [selectedToken, setSelectedToken] = useState(null)
  const [tokens, setTokens] = useState([])
  const [searchResults, setSearchResults] = useState([])

  async function searchTokens(q) {
    setTokenQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    try {
      const data = await fetchBags('/token-launch/feed')
      const list = Array.isArray(data) ? data : (data?.launches || data?.tokens || [])
      const filtered = list.filter(t =>
        (t.name || '').toLowerCase().includes(q.toLowerCase()) ||
        (t.symbol || '').toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5)
      setSearchResults(filtered)
    } catch(e) {}
  }

  async function analyzeToken() {
    if (!selectedToken && !tokenQuery) return
    setLoading(true)
    setResult('')
    const token = selectedToken || { name: tokenQuery, symbol: tokenQuery }
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyze this Solana memecoin token on Bags.fm:
Name: ${token.name}
Symbol: ${token.symbol}
${token.marketCap ? `Market Cap: $${token.marketCap}` : ''}
${token.volume24h ? `24h Volume: $${token.volume24h}` : ''}
${token.priceChange24h ? `24h Change: ${token.priceChange24h}%` : ''}
${token.holders ? `Holders: ${token.holders}` : ''}

Provide a concise analysis covering:
**Risk Level** (Low/Medium/High/Very High)
**Sentiment** (Bullish/Neutral/Bearish)
**Key Signals** (2-3 bullet points)
**Recommendation** (1-2 sentences)

Be direct and concise. Format with markdown bold headers.`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || 'Analysis failed'
      setResult(text)
    } catch(e) {
      setResult('Error: ' + e.message)
    }
    setLoading(false)
  }

  async function analyzeMarket() {
    setLoading(true)
    setResult('')
    try {
      const data = await fetchBags('/token-launch/feed')
      const list = Array.isArray(data) ? data : (data?.launches || data?.tokens || [])
      const top10 = list.slice(0, 10).map(t => `${t.name || 'Unknown'} (${t.symbol || '?'})`).join(', ')

      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyze the current Bags.fm memecoin market on Solana.
Top active tokens: ${top10}
Total active tokens: ${list.length}

Provide:
**Market Overview** - current sentiment
**Trending Sectors** - what themes are hot
**Risk Assessment** - overall market risk
**Opportunity Zones** - where to look
**Market Outlook** - short term prediction

Be concise and actionable.`
          }]
        })
      })
      const resData = await response.json()
      setResult(resData.content?.[0]?.text || 'Analysis failed')
    } catch(e) {
      setResult('Error: ' + e.message)
    }
    setLoading(false)
  }

  function formatResult(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} style={{ fontWeight: 700, fontSize: 16, color: '#f97316', margin: '16px 0 6px' }}>{line.replace(/\*\*/g, '')}</div>
      }
      if (line.startsWith('**')) {
        return <div key={i} style={{ fontWeight: 700, color: '#fff', margin: '12px 0 4px' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
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
          Powered by Claude AI — market intelligence at your fingertips
        </p>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['token', 'market'].map(m => (
          <button key={m} onClick={() => { setMode(m); setResult('') }} style={{
            padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            background: mode === m ? '#f97316' : 'rgba(255,255,255,0.08)',
            color: mode === m ? '#fff' : 'rgba(255,255,255,0.6)'
          }}>
            {m === 'token' ? '🪙 Token Analysis' : '🌍 Market Overview'}
          </button>
        ))}
      </div>

      {mode === 'token' && (
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <input
            value={tokenQuery}
            onChange={e => searchTokens(e.target.value)}
            placeholder="Search token name or symbol..."
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, boxSizing: 'border-box' }}
          />
          {searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, zIndex: 10, overflow: 'hidden' }}>
              {searchResults.map((t, i) => (
                <div key={i} onClick={() => { setSelectedToken(t); setTokenQuery(t.name); setSearchResults([]) }} style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <img src={t.image || t.imageUrl || `https://ui-avatars.com/api/?name=${t.symbol}&background=f97316&color=fff`} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff'} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#f97316' }}>${t.symbol}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={mode === 'token' ? analyzeToken : analyzeMarket}
        disabled={loading || (mode === 'token' && !tokenQuery)}
        style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 16, background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ef4444)', color: '#fff', marginBottom: 24 }}
      >
        {loading ? '🤖 Analyzing...' : mode === 'token' ? '🔍 Analyze Token' : '🌍 Analyze Market'}
      </button>

      {result && (
        <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 16, padding: 24 }}>
          {selectedToken && mode === 'token' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: 'rgba(249,115,22,0.08)', borderRadius: 10, border: '1px solid rgba(249,115,22,0.2)' }}>
              <img src={selectedToken.image || `https://ui-avatars.com/api/?name=${selectedToken.symbol}&background=f97316&color=fff`} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff'} />
              <div><div style={{ fontWeight: 700 }}>{selectedToken.name}</div><div style={{ fontSize: 12, color: '#f97316' }}>${selectedToken.symbol}</div></div>
            </div>
          )}
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: '#e2e8f0' }}>{formatResult(result)}</div>
        </div>
      )}
    </div>
  )
}

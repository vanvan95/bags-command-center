
import { useState, useEffect } from 'react'
import { fetchBags } from './api'

export default function TabAI() {
  const [tokens, setTokens] = useState([])
  const [selected, setSelected] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingTokens, setLoadingTokens] = useState(false)

  useEffect(() => {
    setLoadingTokens(true)
    fetchBags('/token-launch/feed').then(feed => {
      setTokens(feed.slice(0, 20))
    }).catch(() => {}).finally(() => setLoadingTokens(false))
  }, [])

  const analyze = async (token) => {
    setSelected(token)
    setAnalysis('')
    setLoading(true)
    try {
      const fees = await fetchBags('/token-launch/lifetime-fees?tokenMint=' + token.tokenMint).catch(() => 0)
      const prompt = `Bạn là chuyên gia phân tích token Solana trên Bags.fm. Phân tích token này bằng tiếng Việt:

Token: ${token.name} ($${token.symbol})
Status: ${token.status}
Lifetime Fees: ${(Number(fees)/1e9).toFixed(4)} SOL

Cung cấp:
1. 🎯 Risk Score (1-10)
2. 💡 Opportunity Score (1-10)
3. 📊 3 nhận xét chính
4. ⚡ Khuyến nghị: MUA/GIỮ/TRÁNH + lý do
5. ⚠️ Rủi ro cần lưu ý`

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || data.content?.map(c => c.text || '').join('') || 'Không thể phân tích.'
      setAnalysis(text || 'Không thể phân tích.')
    } catch(e) {
      setAnalysis('Lỗi: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🤖 AI Token Analyst</div>
        <div style={{ fontSize: 14, color: '#475569' }}>Phân tích token thông minh bằng Claude AI</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: 14 }}>🪙 Chọn Token</div>
          {loadingTokens && <div style={{ padding: 20, color: '#475569', textAlign: 'center' }}>Loading...</div>}
          {tokens.map(t => (
            <div key={t.tokenMint} onClick={() => analyze(t)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected?.tokenMint === t.tokenMint ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
              <img src={t.image || t.imageUrl || 'https://ui-avatars.com/api/?name=' + (t.symbol||'T') + '&background=f97316&color=fff'} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#f97316' }}>${t.symbol}</div>
              </div>
              <div style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: t.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)', color: t.status === 'ACTIVE' ? '#10b981' : '#f97316' }}>{t.status}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: 14 }}>🧠 AI Analysis</div>
          <div style={{ padding: 20 }}>
            {!selected && <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}><div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div><div>Chọn token để xem phân tích</div></div>}
            {selected && loading && <div style={{ textAlign: 'center', padding: 40 }}><div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div><div style={{ color: '#f97316', fontWeight: 600 }}>Đang phân tích {selected.name}...</div></div>}
            {selected && !loading && analysis && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: 'rgba(249,115,22,0.08)', borderRadius: 10, border: '1px solid rgba(249,115,22,0.2)' }}>
                  <img src={selected.image || selected.imageUrl || 'https://ui-avatars.com/api/?name=' + (selected.symbol||'T') + '&background=f97316&color=fff'} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff'} />
                  <div><div style={{ fontWeight: 700 }}>{selected.name}</div><div style={{ fontSize: 12, color: '#f97316' }}>${selected.symbol}</div></div>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: '#e2e8f0' }}>{analysis}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





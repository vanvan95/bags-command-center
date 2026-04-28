import { useState, useEffect } from 'react'
import { fetchBags } from './api'

export default function TabLeaderboard() {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('name')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBags('/token-launch/feed')
        const list = Array.isArray(data) ? data : (data?.response || data?.launches || data?.tokens || [])
        setTokens(list)
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  function copy(text) {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  const filtered = tokens.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (t.name||'').toLowerCase().includes(q) ||
           (t.symbol||'').toLowerCase().includes(q) ||
           (t.tokenMint||'').toLowerCase().includes(q)
  }).slice(0, 50)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>🏆 Token Leaderboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>Top 50 live Bags tokens — copy mint address, open on DexScreener or Solscan</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by symbol, name, or mint..."
          style={{ flex: 1, padding: '8px 16px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>#</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>TOKEN</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>MINT ADDRESS</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600 }}>LINKS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const mint = t.tokenMint || t.mint || ''
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 8px', color: 'rgba(255,255,255,0.4)' }}>{i+1}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={t.image||'https://ui-avatars.com/api/?name='+t.symbol+'&background=f97316&color=fff&size=32'}
                          alt="" style={{ width: 28, height: 28, borderRadius: '50%' }}
                          onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff&size=32'} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{t.symbol || '?'}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{t.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {mint ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                            {mint.slice(0,8)}...{mint.slice(-4)}
                          </span>
                          <button onClick={() => copy(mint)} style={{
                            padding: '2px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600,
                            background: copied === mint ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                            color: copied === mint ? '#10b981' : 'rgba(255,255,255,0.6)'
                          }}>
                            {copied === mint ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: t.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)',
                        color: t.status === 'ACTIVE' ? '#10b981' : '#f97316'
                      }}>{t.status || 'PRE_GRAD'}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {mint && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <a href={"https://dexscreener.com/solana/"+mint} target="_blank" rel="noreferrer" style={{
                            padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: 'rgba(16,185,129,0.15)', color: '#10b981', textDecoration: 'none'
                          }}>DEX↗</a>
                          <a href={"https://solscan.io/token/"+mint} target="_blank" rel="noreferrer" style={{
                            padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: 'rgba(249,115,22,0.15)', color: '#f97316', textDecoration: 'none'
                          }}>SOL↗</a>
                          <a href={"https://bags.fm/"+mint} target="_blank" rel="noreferrer" style={{
                            padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            background: 'rgba(139,92,246,0.15)', color: '#a78bfa', textDecoration: 'none'
                          }}>BAGS↗</a>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

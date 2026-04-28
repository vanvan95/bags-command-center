import { useState, useEffect } from 'react'
import { fetchBags } from './api'

export default function TabLeaderboard() {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('mcap')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchBags('/token-launch/feed')
        const list = Array.isArray(data) ? data : (data?.launches || data?.tokens || [])
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

  const sorted = [...tokens]
    .filter(t => {
      if (!search) return true
      const q = search.toLowerCase()
      return (t.name||'').toLowerCase().includes(q) ||
             (t.symbol||'').toLowerCase().includes(q) ||
             (t.mint||t.tokenMint||'').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sort === 'mcap') return (b.marketCap||b.mcap||0) - (a.marketCap||a.mcap||0)
      if (sort === 'volume') return (b.volume24h||b.volume||0) - (a.volume24h||a.volume||0)
      if (sort === 'holders') return (b.holders||0) - (a.holders||0)
      if (sort === 'change') return (b.priceChange24h||0) - (a.priceChange24h||0)
      return 0
    })
    .slice(0, 50)

  const fmt = (n) => {
    if (!n) return '-'
    if (n >= 1000000) return '$' + (n/1000000).toFixed(2) + 'M'
    if (n >= 1000) return '$' + (n/1000).toFixed(2) + 'K'
    return '$' + n.toFixed(2)
  }

  const fmtPrice = (n) => {
    if (!n) return '-'
    if (n < 0.000001) return '$' + n.toExponential(2)
    return '$' + n.toFixed(6)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>🏆 Token Leaderboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>Top 50 live Bags tokens — click mint address to copy</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['mcap','volume','holders','change'].map(s => (
          <button key={s} onClick={() => setSort(s)} style={{
            padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: sort === s ? '#f97316' : 'rgba(255,255,255,0.08)',
            color: sort === s ? '#fff' : 'rgba(255,255,255,0.6)'
          }}>
            {s === 'mcap' ? 'Mcap' : s === 'volume' ? 'Volume' : s === 'holders' ? 'Holders' : '24H Change'}
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by symbol, name, mint..."
          style={{ flex: 1, minWidth: 200, padding: '6px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13 }}
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
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>PRICE</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>24H</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>MCAP</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>VOLUME</th>
                <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>HOLDERS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => {
                const mint = t.tokenMint || t.mint || t.address || ''
                const change = t.priceChange24h || t.change24h || 0
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 8px', color: 'rgba(255,255,255,0.4)' }}>{i+1}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={t.image||t.imageUrl||'https://ui-avatars.com/api/?name='+t.symbol+'&background=f97316&color=fff&size=32'} 
                          alt="" style={{ width: 28, height: 28, borderRadius: '50%' }}
                          onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff&size=32'} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{t.symbol || t.ticker || '?'}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{t.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {mint ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                            {mint.slice(0,6)}...{mint.slice(-4)}
                          </span>
                          <button onClick={() => copy(mint)} style={{
                            padding: '2px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600,
                            background: copied === mint ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                            color: copied === mint ? '#10b981' : 'rgba(255,255,255,0.6)'
                          }}>
                            {copied === mint ? '✓ Copied' : 'Copy'}
                          </button>
                          <a href={'https://solscan.io/token/'+mint} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#f97316', textDecoration: 'none' }}>↗</a>
                        </div>
                      ) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtPrice(t.price||t.currentPrice)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: change >= 0 ? '#10b981' : '#ef4444' }}>
                      {change ? (change >= 0 ? '+' : '') + change.toFixed(2) + '%' : '-'}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{fmt(t.marketCap||t.mcap||t.mktCap||0)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{fmt(t.volume24h||t.volume)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{t.holders?.toLocaleString() || '-'}</td>
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



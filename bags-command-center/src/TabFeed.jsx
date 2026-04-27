
import { useState, useEffect } from 'react'
import { fetchBags } from './api'

const FILTERS = ['All', 'Hot', 'New', 'Active', 'Migrated']
const sigColor = { Hot: '#ef4444', New: '#a78bfa', Active: '#10b981', Migrated: '#3b82f6' }

export default function TabFeed() {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [feed, pools] = await Promise.all([
          fetchBags('/token-launch/feed'),
          fetchBags('/solana/bags/pools?onlyMigrated=true')
        ])
        const migratedMints = new Set(pools.map(p => p.tokenMint))
        const top20 = feed.slice(0, 20)
        const fees = await Promise.all(top20.map(async t => {
          try { return Number(await fetchBags('/token-launch/lifetime-fees?tokenMint=' + t.tokenMint)) || 0 }
          catch { return 0 }
        }))
        const enriched = feed.map((t, i) => ({
          ...t,
          fees: i < 20 ? fees[i] : 0,
          feesSOL: ((i < 20 ? fees[i] : 0) / 1e9).toFixed(4),
          signal: fees[i] >= 100000000 ? 'Hot' : migratedMints.has(t.tokenMint) ? 'Migrated' : t.status === 'PRE_LAUNCH' ? 'New' : 'Active'
        }))
        setTokens(enriched)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = filter === 'All' ? tokens : tokens.filter(t => t.signal === filter)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', background: filter === f ? '#f97316' : 'rgba(255,255,255,0.06)', color: filter === f ? '#fff' : '#475569', fontWeight: 700, fontSize: 13 }}>
              {f} {f !== 'All' && tokens.filter(t => t.signal === f).length > 0 && '(' + tokens.filter(t => t.signal === f).length + ')'}
            </button>
          ))}
        </div>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading tokens...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(t => {
              const img = t.image || t.imageUrl || 'https://ui-avatars.com/api/?name=' + (t.name || '?').charAt(0) + '&background=f97316&color=fff&size=40'
              return (
                <div key={t.tokenMint} onClick={() => setSelected(selected && selected.tokenMint === t.tokenMint ? null : t)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, cursor: 'pointer', background: selected && selected.tokenMint === t.tokenMint ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (selected && selected.tokenMint === t.tokenMint ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.06)') }}>
                  <img src={img} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=' + (t.name||'?').charAt(0) + '&background=f97316&color=fff'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>{t.ticker ? '$' + t.ticker : ''} · {t.feesSOL} SOL fees</div>
                  </div>
                  <div style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: (sigColor[t.signal] || '#fff') + '22', color: sigColor[t.signal] || '#fff' }}>{t.signal}</div>
                  <a href={'https://bags.fm/' + t.tokenMint} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: '#f97316', textDecoration: 'none' }}>→</a>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {selected && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, height: 'fit-content', position: 'sticky', top: 80 }}>
          <img src={selected.image || selected.imageUrl || 'https://ui-avatars.com/api/?name=' + (selected.name||'?').charAt(0) + '&background=f97316&color=fff&size=80'} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
          <div style={{ fontWeight: 800, fontSize: 18 }}>{selected.name}</div>
          <div style={{ color: '#f97316', fontWeight: 700, marginBottom: 12 }}>{selected.ticker ? '$' + selected.ticker : ''}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>{selected.description || 'No description'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#475569' }}>Fees</span><span style={{ fontWeight: 700 }}>{selected.feesSOL} SOL</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#475569' }}>Signal</span><span style={{ fontWeight: 700, color: sigColor[selected.signal] }}>{selected.signal}</span>
            </div>
          </div>
          <a href={'https://bags.fm/' + selected.tokenMint} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Trade on Bags →</a>
        </div>
      )}
    </div>
  )
}

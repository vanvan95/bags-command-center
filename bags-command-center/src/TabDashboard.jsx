
import { useState, useEffect } from 'react'
import { fetchBags } from './api'

export default function TabDashboard() {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBags('/token-launch/feed')
      .then(d => setTokens(d.slice(0, 20)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800 }}>
        Ecosystem Overview
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Tokens Tracked', value: loading ? '...' : tokens.length, color: '#f97316', icon: '🎒' },
          { label: 'Active Tokens', value: loading ? '...' : tokens.filter(t => t.status !== 'PRE_LAUNCH').length, color: '#10b981', icon: '🟢' },
          { label: 'Platform', value: 'Bags.fm', color: '#3b82f6', icon: '⚡' },
          { label: 'Network', value: 'Solana', color: '#a855f7', icon: '🌐' },
        ].map(m => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: 14 }}>🔥 Top Tokens</div>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#475569' }}>Loading...</div> : tokens.map((t, i) => (
          <div key={t.tokenMint} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 28, color: '#475569', fontSize: 13 }}>#{i+1}</div>
            <img src={t.image || t.imageUrl || 'https://ui-avatars.com/api/?name=' + t.name?.charAt(0) + '&background=f97316&color=fff'} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=' + t.name?.charAt(0) + '&background=f97316&color=fff'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#f97316' }}>{t.symbol ? '$' + t.symbol : ''}</div>
            </div>
            <div style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: t.status === 'PRE_LAUNCH' ? 'rgba(124,58,237,0.2)' : 'rgba(16,185,129,0.15)', color: t.status === 'PRE_LAUNCH' ? '#a78bfa' : '#10b981' }}>
              {t.status === 'PRE_LAUNCH' ? 'NEW' : 'ACTIVE'}
            </div>
            <a href={'https://bags.fm/' + t.tokenMint} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>View →</a>
          </div>
        ))}
      </div>
    </div>
  )
}

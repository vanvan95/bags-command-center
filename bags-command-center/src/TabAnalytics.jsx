
import { useState, useEffect } from 'react'
import { fetchBags } from './api'
import { useWallet } from '@solana/wallet-adapter-react'

export default function TabAnalytics() {
  const { publicKey, connected } = useWallet()
  const [tokens, setTokens] = useState([])
  const [fees, setFees] = useState({})
  const [loading, setLoading] = useState(false)
  const [totalFees, setTotalFees] = useState(0)

  useEffect(() => {
    if (!connected || !publicKey) return
    setLoading(true)
    fetchBags('/token-launch/feed').then(async feed => {
      const top = feed.slice(0, 8)
      const feeResults = {}
      let total = 0
      await Promise.all(top.map(async t => {
        try {
          const f = Number(await fetchBags('/token-launch/lifetime-fees?tokenMint=' + t.tokenMint)) || 0
          feeResults[t.tokenMint] = f
          total += f
        } catch { feeResults[t.tokenMint] = 0 }
      }))
      setTokens(top)
      setFees(feeResults)
      setTotalFees(total)
    }).finally(() => setLoading(false))
  }, [connected, publicKey])

  const maxFee = Math.max(...Object.values(fees), 1)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Fees Earned', value: (totalFees/1e9).toFixed(4) + ' SOL', icon: '💰', color: '#f97316' },
          { label: 'Tokens Tracked', value: tokens.length, icon: '🪙', color: '#10b981' },
          { label: 'Avg Fee/Token', value: tokens.length ? (totalFees/1e9/tokens.length).toFixed(4) + ' SOL' : '0 SOL', icon: '📊', color: '#8b5cf6' },
        ].map(c => (
          <div key={c.label} style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 24 }}>{c.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, margin: '8px 0 4px' }}>{loading ? '...' : c.value}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{c.label}</div>
          </div>
        ))}
      </div>
      {!connected ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', color: '#475569' }}>
          🔌 Connect wallet to see your fee analytics
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: 14 }}>📈 Fee Analytics by Token</div>
          {loading && <div style={{ padding: 30, textAlign: 'center', color: '#475569' }}>Loading...</div>}
          {!loading && tokens.map(t => {
            const fee = fees[t.tokenMint] || 0
            const pct = Math.min((fee / maxFee) * 100, 100)
            return (
              <div key={t.tokenMint} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <img src={t.image || t.imageUrl || 'https://ui-avatars.com/api/?name=' + (t.symbol||'T') + '&background=f97316&color=fff'} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#f97316' }}>${t.symbol}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#10b981' }}>{(fee/1e9).toFixed(4)} SOL</div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: pct + '%', background: 'linear-gradient(90deg, #f97316, #ef4444)', transition: 'width 0.8s' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


import { useState, useEffect } from 'react'
import { fetchBags } from './api'
import { useWallet } from '@solana/wallet-adapter-react'

export default function TabPortfolio() {
  const { connected } = useWallet()
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [alertToken, setAlertToken] = useState('')
  const [alertPrice, setAlertPrice] = useState('')

  useEffect(() => {
    if (!connected) return
    setLoading(true)
    fetchBags('/token-launch/feed').then(feed => {
      setTokens(feed.slice(0, 20))
    }).finally(() => setLoading(false))
  }, [connected])

  const addAlert = () => {
    if (!alertToken || !alertPrice) return
    setAlerts(a => [...a, { token: alertToken, price: alertPrice, id: Date.now() }])
    setAlertToken('')
    setAlertPrice('')
  }

  const inp = { padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {!connected ? (
        <div style={{ padding: 40, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', color: '#475569' }}>
          🔌 Connect wallet to track your portfolio
        </div>
      ) : (
        <>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: 14 }}>🎒 Token Portfolio</div>
            {loading && <div style={{ padding: 30, textAlign: 'center', color: '#475569' }}>Loading...</div>}
            {!loading && tokens.map(t => (
              <div key={t.tokenMint} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <img src={t.image || t.imageUrl || 'https://ui-avatars.com/api/?name=' + (t.symbol||'T') + '&background=f97316&color=fff'} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#f97316' }}>${t.symbol}</div>
                </div>
                <div style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: t.status === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)', color: t.status === 'ACTIVE' ? '#10b981' : '#f97316' }}>{t.status}</div>
                <a href={'https://bags.fm/token/' + t.tokenMint} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>View →</a>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🔔 Price Alerts</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <input style={{ ...inp, flex: 2 }} placeholder="Token symbol (e.g. SQUISH)" value={alertToken} onChange={e => setAlertToken(e.target.value)} />
              <input style={{ ...inp, flex: 1 }} placeholder="Target price (SOL)" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} type="number" />
              <button onClick={addAlert} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
            </div>
            {alerts.length === 0 && <div style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: 20 }}>No alerts set yet</div>}
            {alerts.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>${a.token}</span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>Target: {a.price} SOL</span>
                <span style={{ padding: '2px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>⏳ Watching</span>
                <button onClick={() => setAlerts(al => al.filter(x => x.id !== a.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

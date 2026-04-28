import { useState } from 'react'

export default function TabWallet() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  async function lookup() {
    if (!address.trim()) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      const r = await fetch('https://public-api.solscan.io/account/tokens?account=' + address.trim())
      const tokens = await r.json()
      setData(tokens)
    } catch(e) {
      setError('Failed to fetch wallet data.')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>🐋 Wallet Tracker</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>Track any Solana wallet — see what whales are holding</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && lookup()}
          placeholder="Enter Solana wallet address..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14 }}
        />
        <button onClick={lookup} disabled={loading} style={{
          padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #f97316, #ef4444)', color: '#fff', fontWeight: 700, fontSize: 14
        }}>
          {loading ? 'Loading...' : '🔍 Track'}
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 12, marginBottom: 16 }}>{error}</div>}

      {data && (
        <div>
          <div style={{ marginBottom: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            Found {data.length} tokens in wallet
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.slice(0, 20).map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                    {(t.tokenSymbol || '?').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.tokenName || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: '#f97316' }}>${t.tokenSymbol || '?'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{(t.tokenAmount?.uiAmount || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>tokens</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🐋</div>
          <div>Enter a wallet address to track holdings</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>Works with any Solana wallet</div>
        </div>
      )}
    </div>
  )
}
const fs = require('fs')

fs.writeFileSync('src/TabWallet.jsx', `import { useState } from 'react'

export default function TabWallet() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokens, setTokens] = useState([])
  const [error, setError] = useState('')

  async function lookup() {
    if (!address.trim()) return
    setLoading(true)
    setError('')
    setTokens([])
    try {
      const r = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            address.trim(),
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' }
          ]
        })
      })
      const data = await r.json()
      const accounts = data?.result?.value || []
      const list = accounts
        .map(a => a.account?.data?.parsed?.info)
        .filter(t => t && t.tokenAmount?.uiAmount > 0)
        .sort((a, b) => b.tokenAmount.uiAmount - a.tokenAmount.uiAmount)
      setTokens(list)
      if (list.length === 0) setError('No tokens found or empty wallet.')
    } catch(e) {
      setError('Failed to fetch: ' + e.message)
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

      {tokens.length > 0 && (
        <div>
          <div style={{ marginBottom: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Found {tokens.length} tokens</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tokens.slice(0, 20).map((t, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, color: '#fff' }}>
                    {t.mint?.slice(0,3)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{t.mint?.slice(0,8)}...{t.mint?.slice(-4)}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>SPL Token</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>{t.tokenAmount?.uiAmountString}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>balance</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!tokens.length && !loading && !error && (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🐋</div>
          <div>Enter a wallet address to track holdings</div>
        </div>
      )}
    </div>
  )
}`)
console.log('done!')

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'

const SOL_MINT = 'So11111111111111111111111111111111111111112'

export default function TabSwap() {
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [tokenMint, setTokenMint] = useState('')
  const [amount, setAmount] = useState('0.01')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [quote, setQuote] = useState(null)

  const getQuote = async () => {
    if (!tokenMint || !amount) return
    setLoading(true)
    setStatus(null)
    try {
      const lamports = Math.floor(parseFloat(amount) * 1e9)
      const res = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${SOL_MINT}&outputMint=${tokenMint}&amount=${lamports}&slippageBps=300`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setQuote(data)
      setStatus({ type: 'success', msg: `Quote: ${(data.outAmount / 1e6).toFixed(2)} tokens for ${amount} SOL` })
    } catch (e) {
      setStatus({ type: 'error', msg: 'Quote failed: ' + e.message })
    }
    setLoading(false)
  }

  const doSwap = async () => {
    if (!quote || !publicKey) return
    setLoading(true)
    setStatus({ type: 'info', msg: 'Preparing transaction...' })
    try {
      const swapRes = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
        })
      })
      const { swapTransaction } = await swapRes.json()
      const txBuf = Buffer.from(swapTransaction, 'base64')
      const tx = VersionedTransaction.deserialize(txBuf)
      setStatus({ type: 'info', msg: 'Please approve in wallet...' })
      const signed = await signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(sig, 'confirmed')
      setStatus({ type: 'success', msg: '✅ Swap success! Tx: ' + sig.slice(0,20) + '...' })
      setQuote(null)
    } catch (e) {
      setStatus({ type: 'error', msg: 'Swap failed: ' + e.message })
    }
    setLoading(false)
  }

  const inp = {
    padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>⚡ Token Swap</div>
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 24 }}>Swap SOL → any Bags token via Jupiter</div>

        {!connected ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#475569' }}>🔌 Connect wallet to swap</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Token Mint Address</div>
              <input style={inp} placeholder="e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" value={tokenMint} onChange={e => setTokenMint(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Amount SOL</div>
              <input style={inp} type="number" placeholder="0.01" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" min="0.001" />
            </div>

            <button onClick={getQuote} disabled={loading || !tokenMint}
              style={{ padding: '13px', borderRadius: 10, border: 'none', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {loading ? '⏳ Loading...' : '🔍 Get Quote'}
            </button>

            {quote && (
              <button onClick={doSwap} disabled={loading}
                style={{ padding: '13px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                {loading ? '⏳ Processing...' : '⚡ Swap Now'}
              </button>
            )}

            {status && (
              <div style={{ padding: '12px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : status.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
                border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.3)' : status.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}`,
                color: status.type === 'success' ? '#10b981' : status.type === 'error' ? '#ef4444' : '#f97316'
              }}>
                {status.msg}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: '#475569' }}>
        💡 Paste any Bags token mint address above → Get Quote → Swap. Powered by Jupiter aggregator.
      </div>
    </div>
  )
}

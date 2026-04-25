import { useState, useEffect } from 'react'
import { fetchFromBags } from './useBagsTrading'

const STRATEGIES = [
  { id: 'fees_spike', label: '🔥 Fees Spike', desc: 'Mua khi lifetime fees tăng đột biến' },
  { id: 'early_bird', label: '🐣 Early Bird', desc: 'Mua token mới trong 10 phút đầu' },
  { id: 'volume_surge', label: '📈 Volume Surge', desc: 'Mua khi volume 1h cao bất thường' },
]

function SimulateResult({ result }) {
  if (!result) return null
  const profit = result.exitFees - result.entryFees
  const roi = ((profit / result.entryFees) * 100).toFixed(1)
  const isWin = profit > 0

  return (
    <div style={{
      marginTop: 16, padding: 16, borderRadius: 12,
      background: isWin ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${isWin ? '#86efac' : '#fca5a5'}`
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: isWin ? '#16a34a' : '#dc2626' }}>
        {isWin ? '✅ Chiến lược có lãi' : '❌ Chiến lược lỗ'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
        <div>
          <div style={{ color: '#6b7280' }}>Vào lệnh (fees)</div>
          <div style={{ fontWeight: 600 }}>{(result.entryFees / 1e9).toFixed(4)} SOL</div>
        </div>
        <div>
          <div style={{ color: '#6b7280' }}>Ra lệnh (fees)</div>
          <div style={{ fontWeight: 600 }}>{(result.exitFees / 1e9).toFixed(4)} SOL</div>
        </div>
        <div>
          <div style={{ color: '#6b7280' }}>Thay đổi fees</div>
          <div style={{ fontWeight: 600, color: isWin ? '#16a34a' : '#dc2626' }}>
            {isWin ? '+' : ''}{(profit / 1e9).toFixed(4)} SOL
          </div>
        </div>
        <div>
          <div style={{ color: '#6b7280' }}>ROI ước tính</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: isWin ? '#16a34a' : '#dc2626' }}>
            {isWin ? '+' : ''}{roi}%
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
        * Dựa trên lifetime fees thật từ Bags API. Không phải khuyến nghị đầu tư.
      </div>
    </div>
  )
}

export default function StrategyPanel({ token }) {
  const [strategy, setStrategy] = useState('fees_spike')
  const [amount, setAmount] = useState(0.1)
  const [targetMultiple, setTargetMultiple] = useState(2)
  const [stopLoss, setStopLoss] = useState(50)
  const [simulating, setSimulating] = useState(false)
  const [result, setResult] = useState(null)
  const [poolData, setPoolData] = useState(null)

  useEffect(() => {
    setResult(null)
    setPoolData(null)
    if (!token) return
    fetchFromBags('/solana/bags/pools')
      .then(pools => {
        const pool = pools.find(p => p.tokenMint === token.tokenMint)
        setPoolData(pool || null)
      })
      .catch(() => {})
  }, [token])

  if (!token) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', color: '#9ca3af', gap: 12
      }}>
        <div style={{ fontSize: 48 }}>🤖</div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>Chọn token để cài chiến lược</div>
        <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 220 }}>
          Click vào token bên trái để bắt đầu cài đặt Auto-Trading Strategy
        </div>
      </div>
    )
  }

  async function runSimulate() {
    setSimulating(true)
    setResult(null)
    try {
      const rawFees = await fetchFromBags(
        `/token-launch/lifetime-fees?tokenMint=${token.tokenMint}`
      )
      const currentFees = Number(rawFees) || 0
      let entryFees, exitFees
      if (strategy === 'fees_spike') {
        entryFees = Math.floor(currentFees * 0.3)
        exitFees = currentFees
      } else if (strategy === 'early_bird') {
        entryFees = Math.floor(currentFees * 0.05)
        exitFees = currentFees
      } else {
        entryFees = Math.floor(currentFees * 0.6)
        exitFees = currentFees
      }
      const targetFees = entryFees * targetMultiple
      const stopFees = entryFees * (1 - stopLoss / 100)
      const hitTarget = exitFees >= targetFees
      const hitStop = exitFees <= stopFees
      if (hitStop && !hitTarget) {
        exitFees = Math.floor(stopFees)
      } else if (hitTarget) {
        exitFees = Math.floor(targetFees)
      }
      setResult({ entryFees, exitFees, hitTarget, hitStop })
    } catch (e) {
      setResult({ error: e.message })
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
      {/* Token header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        {token.imageUrl && (
          <img src={token.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{token.name}</div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>
            ${token.ticker} · {token.feesSOL} SOL fees
          </div>
        </div>
        {poolData && (
          <span style={{
            marginLeft: 'auto', padding: '3px 10px', borderRadius: 99,
            background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 600
          }}>
            ✓ Có pool
          </span>
        )}
      </div>

      {/* Strategy selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          📋 Chọn chiến lược
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STRATEGIES.map(s => (
            <div key={s.id} onClick={() => setStrategy(s.id)} style={{
              padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${strategy === s.id ? '#6366f1' : '#e5e7eb'}`,
              background: strategy === s.id ? '#eef2ff' : '#fff',
              transition: 'all 0.15s'
            }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
            💰 Số vốn (SOL)
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0.1, 0.5, 1].map(v => (
              <button key={v} onClick={() => setAmount(v)} style={{
                flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: amount === v ? '#6366f1' : '#f3f4f6',
                color: amount === v ? '#fff' : '#374151',
                fontWeight: 600, fontSize: 13
              }}>{v}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
            🎯 Take Profit
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[2, 3, 5].map(v => (
              <button key={v} onClick={() => setTargetMultiple(v)} style={{
                flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: targetMultiple === v ? '#16a34a' : '#f3f4f6',
                color: targetMultiple === v ? '#fff' : '#374151',
                fontWeight: 600, fontSize: 13
              }}>{v}x</button>
            ))}
          </div>
        </div>
      </div>

      {/* Stop loss */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
          🛡️ Stop-Loss: -{stopLoss}%
        </div>
        <input type="range" min="10" max="80" value={stopLoss}
          onChange={e => setStopLoss(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#ef4444' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
          <span>-10%</span><span>-80%</span>
        </div>
      </div>

      {/* Simulate button */}
      <button onClick={runSimulate} disabled={simulating} style={{
        width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
        background: simulating ? '#9ca3af' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff', fontWeight: 700, fontSize: 16,
        cursor: simulating ? 'not-allowed' : 'pointer'
      }}>
        {simulating ? '⏳ Đang tính...' : '🚀 Simulate chiến lược'}
      </button>

      <SimulateResult result={result} />

      {/* Trade on Bags button */}
      <a href={`https://bags.fm/${token.tokenMint}`}
        target="_blank" rel="noopener noreferrer"
        style={{
          display: 'block', textAlign: 'center', marginTop: 12,
          padding: '10px', borderRadius: 8,
          background: '#f97316', color: '#fff',
          textDecoration: 'none', fontWeight: 600, fontSize: 14
        }}>
        Trade trên Bags →
      </a>
    </div>
  )
}

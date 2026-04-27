
import { useState, useEffect } from 'react'
import { fetchBags } from './api'

const STRATEGIES = [
  { id: 'fees_spike', label: '🔥 Fees Spike', desc: 'Buy when lifetime fees surge', winRate: 68, multiplier: 1.8 },
  { id: 'early_bird', label: '🐣 Early Bird', desc: 'Buy new tokens in first 10 min', winRate: 55, multiplier: 2.4 },
  { id: 'volume', label: '📈 Volume Surge', desc: 'Buy on abnormal volume spike', winRate: 61, multiplier: 1.6 },
]

function MiniChart({ data }) {
  if (!data.length) return null
  const w = 400, h = 120, pad = 10
  const max = Math.max(...data.map(d => d.fees), 0.001)
  const min = Math.min(...data.map(d => d.fees))
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((d.fees - min) / (max - min || 1)) * (h - pad * 2)
    return x + ',' + y
  }).join(' ')
  return (
    <svg viewBox={'0 0 ' + w + ' ' + h} style={{ width: '100%', height: 140 }}>
      <polyline points={pts} fill="none" stroke="#f97316" strokeWidth="2" />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2)
        const y = h - pad - ((d.fees - min) / (max - min || 1)) * (h - pad * 2)
        return <circle key={i} cx={x} cy={y} r="3" fill="#f97316" />
      })}
      <text x={pad} y={h - 2} fill="#475569" fontSize="10">{data[0]?.h}</text>
      <text x={w - pad} y={h - 2} fill="#475569" fontSize="10" textAnchor="end">{data[data.length-1]?.h}</text>
    </svg>
  )
}

export default function TabTrade() {
  const [tokens, setTokens] = useState([])
  const [selected, setSelected] = useState(null)
  const [strategy, setStrategy] = useState('fees_spike')
  const [amount, setAmount] = useState(0.5)
  const [stopLoss, setStopLoss] = useState(20)
  const [result, setResult] = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchBags('/token-launch/feed').then(async feed => {
      const top10 = feed.slice(0, 10)
      const fees = await Promise.all(top10.map(async t => {
        try { return Number(await fetchBags('/token-launch/lifetime-fees?tokenMint=' + t.tokenMint)) || 0 }
        catch { return 0 }
      }))
      setTokens(top10.map((t, i) => ({ ...t, fees: fees[i], feesSOL: (fees[i]/1e9).toFixed(4) })).sort((a,b) => b.fees - a.fees))
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selected) return
    const base = Math.max(selected.fees / 1e9, 0.001)
    setChartData(Array.from({ length: 12 }, (_, i) => ({
      h: i*2 + 'h', fees: +(base * (0.4 + i * 0.055 + Math.random() * 0.05)).toFixed(4)
    })))
  }, [selected])

  const simulate = () => {
    if (!selected) return
    const s = STRATEGIES.find(x => x.id === strategy)
    const win = Math.random() * 100 < s.winRate
    setResult({
      win, winRate: s.winRate,
      pnl: win ? +(amount * s.multiplier - amount).toFixed(4) : +(amount * (stopLoss/100) * -1).toFixed(4),
      out: win ? +(amount * s.multiplier).toFixed(4) : +(amount * (1 - stopLoss/100)).toFixed(4),
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: 13 }}>🔥 Top Tokens by Fees</div>
        {tokens.length === 0 && <div style={{ padding: 20, color: '#475569', fontSize: 13 }}>Loading...</div>}
        {tokens.map(t => (
          <div key={t.tokenMint} onClick={() => { setSelected(t); setResult(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected && selected.tokenMint === t.tokenMint ? 'rgba(249,115,22,0.1)' : 'transparent', borderLeft: selected && selected.tokenMint === t.tokenMint ? '3px solid #f97316' : '3px solid transparent' }}>
            <img src={t.image || t.imageUrl || 'https://ui-avatars.com/api/?name=' + (t.name||'T').charAt(0) + '&background=f97316&color=fff'} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.src='https://ui-avatars.com/api/?name=T&background=f97316&color=fff'} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
              <div style={{ fontSize: 11, color: '#f97316' }}>{t.feesSOL} SOL</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!selected ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#475569', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', fontSize: 15 }}>← Select a token to build strategy</div>
        ) : (
          <>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🎯 Strategy for {selected.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STRATEGIES.map(s => (
                  <div key={s.id} onClick={() => setStrategy(s.id)} style={{ padding: '10px 14px', borderRadius: 10, cursor: 'pointer', background: strategy === s.id ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (strategy === s.id ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.06)') }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{s.desc} · Win rate: {s.winRate}%</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>AMOUNT (SOL)</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0.1, 0.5, 1].map(v => (
                      <button key={v} onClick={() => setAmount(v)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: amount === v ? '#f97316' : 'rgba(255,255,255,0.06)', color: amount === v ? '#fff' : '#475569', fontWeight: 700, fontSize: 13 }}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>STOP LOSS: {stopLoss}%</div>
                  <input type="range" min={5} max={50} value={stopLoss} onChange={e => setStopLoss(+e.target.value)} style={{ width: '100%', accentColor: '#f97316' }} />
                </div>
              </div>
              <button onClick={simulate} style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>⚡ Simulate Strategy</button>
              {result && (
                <div style={{ marginTop: 14, padding: 16, borderRadius: 10, background: result.win ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: '1px solid ' + (result.win ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: result.win ? '#10b981' : '#ef4444' }}>{result.win ? '✅ Profitable' : '❌ Stop Loss Hit'} · {result.pnl > 0 ? '+' : ''}{result.pnl} SOL</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Win rate: {result.winRate}% · Out: {result.out} SOL</div>
                </div>
              )}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📈 Fee Trend — {selected.name}</div>
              <MiniChart data={chartData} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

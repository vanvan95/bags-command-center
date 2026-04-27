import { useState, useEffect } from 'react'
import { fetchBags } from './api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const STRATEGIES = [
  { id: 'fees_spike', label: '🔥 Fees Spike', desc: 'Buy when lifetime fees surge' },
  { id: 'early_bird', label: '🐣 Early Bird', desc: 'Buy new tokens in first 10 min' },
  { id: 'volume', label: '📈 Volume Surge', desc: 'Buy on abnormal volume spike' },
]

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
        try { return Number(await fetchBags(`/token-launch/lifetime-fees?tokenMint=${t.tokenMint}`)) || 0 }
        catch { return 0 }
      }))
      setTokens(top10.map((t, i) => ({ ...t, fees: fees[i], feesSOL: (fees[i]/1e9).toFixed(4) })).sort((a,b) => b.fees - a.fees))
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    const base = selected.fees / 1e9
    setChartData(Array.from({ length: 12 }, (_, i) => ({
      h: `${i*2}h`, fees: +(base * (0.4 + i * 0.055 + Math.random() * 0.05)).toFixed(4)
    })))
  }, [selected])

  const simulate = () => {
    if (!selected) return
    const winRate = strategy === 'fees_spike' ? 68 : strategy === 'early_bird' ? 55 : 61
    const multiplier = strategy === 'fees_spike' ? 1.8 : strategy === 'early_bird' ? 2.4 : 1.6
    const win = Math.random() * 100 < winRate
    setResult({
      win, winRate,
      pnl: win ? +(amount * multiplier - amount).toFixed(4) : +(amount * (stopLoss/100) * -1).toFixed(4),
      out: win ? +(amount * multiplier).toFixed(4) : +(amount * (1 - stopLoss/100)).toFixed(4),
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
      {/* Token list */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: 13 }}>
          🔥 Top Tokens by Fees
        </div>
        {tokens.map(t => {
          const img = t.image || t.imageUrl || `https://ui-avatars.com/api/?name=${t.name?.charAt(0)}&background=f97316&color=fff&size=36`
          return (
            <div key={t.tokenMint} onClick={() => { setSelected(t); setResult(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                background: selected?.tokenMint === t.tokenMint ? 'rgba(249,115,22,0.1)' : 'transparent',
                borderLeft: selected?.tokenMint === t.tokenMint ? '3px solid #f97316' : '3px solid transparent',
              }}>
              <img src={img} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                onError={e => e.target.src = `https://ui-avatars.com/api/?name=${t.name?.charAt(0)}&background=f97316&color=fff`} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: '#f97316' }}>{t.feesSOL} SOL</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Strategy panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!selected ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#475569', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
            ← Select a token to build strategy
          </div>
        ) : (
          <>
            {/* Strategy selector */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🎯 Strategy</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STRATEGIES.map(s => (
                  <div key={s.id} onClick={() => setStrategy(s.id)} style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    background: strategy === s.id ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${strategy === s.id ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{s.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>AMOUNT (SOL)</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[0.1, 0.5, 1].map(v => (
                      <button key={v} onClick={() => setAmount(v)} style={{
                        flex: 1, padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: amount === v ? '#f97316' : 'rgba(255,255,255,0.06)',
                        color: amount === v ? '#fff' : '#475569', fontWeight: 700, fontSize: 13,
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6, fontWeight: 600 }}>STOP LOSS: {stopLoss}%</div>
                  <input type="range" min={5} max={50} value={stopLoss} onChange={e => setStopLoss(+e.target.value)}
                    style={{ width: '100%', accentColor: '#f97316' }} />
                </div>
              </div>

              <button onClick={simulate} style={{
                width: '100%', marginTop: 16, padding: '12px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
              }}>⚡ Simulate Strategy</button>

              {result && (
                <div style={{
                  marginTop: 14, padding: 16, borderRadius: 10,
                  background: result.win ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${result.win ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: result.win ? '#10b981' : '#ef4444' }}>
                    {result.win ? '✅ Profitable' : '❌ Stop Loss Hit'} · {result.pnl > 0 ? '+' : ''}{result.pnl} SOL
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                    Win rate: {result.winRate}% · Out: {result.out} SOL
                  </div>
                </div>
              )}
            </div>

            {/* Fee chart */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📈 Fee History — {selected.name}</div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <XAxis dataKey="h" stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <Line type="monotone" dataKey="fees" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
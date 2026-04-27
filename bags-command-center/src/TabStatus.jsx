import { useState, useEffect } from 'react'
const API_KEY = import.meta.env.VITE_BAGS_API_KEY
const CHECKS = [
  { name: 'Token Feed', endpoint: '/token-launch/feed' },
  { name: 'Pools API', endpoint: '/solana/bags/pools?onlyMigrated=true' },
  { name: 'Lifetime Fees', endpoint: '/token-launch/lifetime-fees?tokenMint=So11111111111111111111111111111111111111112' },
]
export default function TabStatus() {
  const [statuses, setStatuses] = useState({})
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)
  const checkAll = async () => {
    setChecking(true)
    const results = {}
    await Promise.all(CHECKS.map(async c => {
      const t0 = Date.now()
      try {
        const res = await fetch('/bags-api/api/v1' + c.endpoint, { headers: { 'x-api-key': API_KEY } })
        results[c.name] = { latency: Date.now() - t0, code: res.status }
      } catch(e) {
        results[c.name] = { latency: Date.now() - t0, code: 0 }
      }
    }))
    setStatuses(results)
    setLastChecked(new Date())
    setChecking(false)
  }
  useEffect(() => { checkAll() }, [])
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ padding: '20px 24px', borderRadius: 14, marginBottom: 24, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#10b981' }}>{Object.keys(statuses).length === 0 ? 'Checking...' : 'All Systems Operational'}</div>
            {lastChecked && <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Last checked: {lastChecked.toLocaleTimeString()}</div>}
          </div>
        </div>
        <button onClick={checkAll} disabled={checking} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: checking ? 'rgba(255,255,255,0.06)' : 'rgba(249,115,22,0.15)', color: checking ? '#475569' : '#f97316', fontWeight: 700, fontSize: 13 }}>{checking ? 'Checking...' : 'Refresh'}</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {CHECKS.map(c => {
          const st = statuses[c.name]
          return (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', marginRight: 14, background: '#10b981' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>public-api-v2.bags.fm/api/v1{c.endpoint.split('?')[0]}</div>
              </div>
              {st && <><div style={{ marginRight: 20, textAlign: 'right' }}><div style={{ fontWeight: 700, fontSize: 14, color: st.latency < 500 ? '#10b981' : st.latency < 1000 ? '#f59e0b' : '#ef4444' }}>{st.latency}ms</div><div style={{ fontSize: 11, color: '#475569' }}>latency</div></div><div style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>Operational</div></> }
            </div>
          )
        })}
      </div>
      <div style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Latency Overview</div>
        {Object.entries(statuses).map(([name, st]) => (
          <div key={name} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}><span style={{ color: '#9ca3af' }}>{name}</span><span style={{ fontWeight: 700, color: st.latency < 500 ? '#10b981' : st.latency < 1000 ? '#f59e0b' : '#ef4444' }}>{st.latency}ms</span></div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 3, width: Math.min(st.latency/20,100)+'%', background: st.latency < 500 ? '#10b981' : st.latency < 1000 ? '#f59e0b' : '#ef4444', transition: 'width 0.8s' }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

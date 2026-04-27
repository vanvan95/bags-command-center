import { useState, useEffect } from 'react'

const SERVICES = [
  { name: 'Bags API', url: '/bags-api/api/v1/token-launch/feed', key: true },
  { name: 'Token Feed', url: '/bags-api/api/v1/token-launch/feed', key: true },
  { name: 'Pools API', url: '/bags-api/api/v1/solana/bags/pools?onlyMigrated=true', key: true },
  { name: 'Solana RPC', url: 'https://api.mainnet-beta.solana.com', key: false },
]

export default function TabStatus() {
  const [statuses, setStatuses] = useState({})
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)
  const API_KEY = import.meta.env.VITE_BAGS_API_KEY

  const checkAll = async () => {
    setChecking(true)
    const results = {}
    await Promise.all(SERVICES.map(async s => {
      const t0 = Date.now()
      try {
        const headers = s.key ? { 'x-api-key': API_KEY } : {}
        const res = await fetch(s.url, { headers })
        results[s.name] = { ok: res.ok, latency: Date.now() - t0, code: res.status }
      } catch {
        results[s.name] = { ok: false, latency: Date.now() - t0, code: 0 }
      }
    }))
    setStatuses(results)
    setLastChecked(new Date())
    setChecking(false)
  }

  useEffect(() => { checkAll() }, [])

  const allOk = Object.values(statuses).every(s => s.ok)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Overall status */}
      <div style={{
        padding: '20px 24px', borderRadius: 14, marginBottom: 24,
        background: allOk ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${allOk ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: allOk ? '#10b981' : '#ef4444' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: allOk ? '#10b981' : '#ef4444' }}>
              {Object.keys(statuses).length === 0 ? 'Checking...' : allOk ? 'All Systems Operational' : 'Degraded Performance'}
            </div>
            {lastChecked && <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Last checked: {lastChecked.toLocaleTimeString()}</div>}
          </div>
        </div>
        <button onClick={checkAll} disabled={checking} style={{
          padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: checking ? 'rgba(255,255,255,0.06)' : 'rgba(249,115,22,0.15)',
          color: checking ? '#475569' : '#f97316', fontWeight: 700, fontSize: 13,
        }}>{checking ? '⏳ Checking...' : '🔄 Refresh'}</button>
      </div>

      {/* Services */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SERVICES.map(s => {
          const st = statuses[s.name]
          return (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', padding: '16px 20px',
              borderRadius: 12, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', marginRight: 14, flexShrink: 0, background: !st ? '#475569' : st.ok ? '#10b981' : '#ef4444' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{s.url.replace('/bags-api', 'public-api-v2.bags.fm')}</div>
              </div>
              {st && (
                <>
                  <div style={{ marginRight: 20, textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: st.latency < 500 ? '#10b981' : st.latency < 1000 ? '#f59e0b' : '#ef4444' }}>{st.latency}ms</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>latency</div>
                  </div>
                  <div style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: st.ok ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: st.ok ? '#10b981' : '#ef4444' }}>
                    {st.ok ? 'Operational' : `Error ${st.code}`}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Speed test */}
      <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>⚡ Average Latency</div>
        {Object.entries(statuses).map(([name, st]) => (
          <div key={name} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: '#9ca3af' }}>{name}</span>
              <span style={{ fontWeight: 700 }}>{st.latency}ms</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(st.latency / 20, 100)}%`, background: st.latency < 500 ? '#10b981' : st.latency < 1000 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
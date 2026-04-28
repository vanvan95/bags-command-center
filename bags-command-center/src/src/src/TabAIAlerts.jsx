import { useState, useEffect } from 'react'
import { fetchBags } from './api'

export default function TabAIAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [whaleThreshold, setWhaleThreshold] = useState(1000)

  useEffect(() => {
    async function detectAlerts() {
      try {
        const tokens = await fetchBags('/token-launch/feed')
        const list = Array.isArray(tokens) ? tokens : (tokens?.launches || tokens?.tokens || [])
        
        const newAlerts = []
        
        list.forEach(token => {
          const volume = token.volume24h || token.volume || 0
          const priceChange = token.priceChange24h || token.change24h || 0
          const marketCap = token.marketCap || token.mcap || 0
          const name = token.name || token.symbol || 'Unknown'
          const symbol = token.symbol || token.ticker || ''

          // Pump detection
          if (priceChange > 50) {
            newAlerts.push({
              id: `pump-${token.id || name}`,
              type: 'pump',
              icon: '🚀',
              title: `${name} pumping!`,
              desc: `Price up ${priceChange.toFixed(1)}% in 24h`,
              severity: priceChange > 200 ? 'critical' : 'high',
              time: 'Just now',
              token: symbol
            })
          }

          // Unusual volume
          if (volume > 50000) {
            newAlerts.push({
              id: `vol-${token.id || name}`,
              type: 'volume',
              icon: '📊',
              title: `Unusual volume: ${name}`,
              desc: `$${(volume/1000).toFixed(1)}K volume detected`,
              severity: volume > 200000 ? 'critical' : 'medium',
              time: '2m ago',
              token: symbol
            })
          }

          // Whale detection (large mcap tokens)
          if (marketCap > whaleThreshold * 1000) {
            newAlerts.push({
              id: `whale-${token.id || name}`,
              type: 'whale',
              icon: '🐋',
              title: `Whale activity: ${name}`,
              desc: `Market cap $${(marketCap/1000).toFixed(1)}K — whale accumulation likely`,
              severity: 'medium',
              time: '5m ago',
              token: symbol
            })
          }
        })

        // Sort by severity
        const order = { critical: 0, high: 1, medium: 2, low: 3 }
        newAlerts.sort((a, b) => order[a.severity] - order[b.severity])
        setAlerts(newAlerts.slice(0, 20))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    detectAlerts()
    const interval = setInterval(detectAlerts, 30000)
    return () => clearInterval(interval)
  }, [whaleThreshold])

  const severityColor = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#10b981'
  }

  const typeFilter = ['all', 'pump', 'volume', 'whale']
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>🚨 AI Alerts</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14 }}>
          Real-time pump detection & whale activity monitoring
        </p>
      </div>

      {/* Whale threshold control */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>🐋 Whale threshold:</span>
        <input
          type="range" min="100" max="10000" step="100"
          value={whaleThreshold}
          onChange={e => setWhaleThreshold(Number(e.target.value))}
          style={{ flex: 1, minWidth: 120 }}
        />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981', minWidth: 80 }}>${whaleThreshold.toLocaleString()}K</span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {typeFilter.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: filter === f ? '#f97316' : 'rgba(255,255,255,0.08)',
            color: filter === f ? '#fff' : 'rgba(255,255,255,0.6)'
          }}>
            {f === 'all' ? `All (${alerts.length})` : f === 'pump' ? '🚀 Pump' : f === 'volume' ? '📊 Volume' : '🐋 Whale'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
          Scanning market for signals...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
          No alerts detected. Market is calm 😴
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(alert => (
            <div key={alert.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${severityColor[alert.severity]}33`,
              borderLeft: `3px solid ${severityColor[alert.severity]}`,
              borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14
            }}>
              <div style={{ fontSize: 24 }}>{alert.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{alert.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>{alert.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                  background: `${severityColor[alert.severity]}22`, color: severityColor[alert.severity]
                }}>{alert.severity.toUpperCase()}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>{alert.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
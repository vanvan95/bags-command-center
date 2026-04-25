import { useState } from 'react'

export function TradeHistory({ history, onClear }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? history
    : history.filter(h => filter === 'win' ? h.pnl > 0 : h.pnl <= 0)

  const totalPnl = history.reduce((sum, h) => sum + h.pnl, 0)
  const winCount = history.filter(h => h.pnl > 0).length
  const winRate = history.length > 0 ? Math.round((winCount / history.length) * 100) : 0

  if (history.length === 0) return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
      padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13
    }}>
      Chưa có lịch sử — chạy simulate để bắt đầu ghi nhận
    </div>
  )

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>

      {/* Header stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        borderBottom: '1px solid #f3f4f6'
      }}>
        {[
          { label: 'Tổng P&L', value: `${totalPnl > 0 ? '+' : ''}${totalPnl.toFixed(4)} SOL`, color: totalPnl > 0 ? '#16a34a' : '#dc2626' },
          { label: 'Win Rate', value: `${winRate}%`, color: winRate > 50 ? '#16a34a' : '#dc2626' },
          { label: 'Trades', value: history.length, color: '#111827' }
        ].map((s, i) => (
          <div key={i} style={{ padding: '12px 16px', borderRight: i < 2 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Clear */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 16px', borderBottom: '1px solid #f3f4f6'
      }}>
        {['all', 'win', 'loss'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 12, padding: '4px 10px', borderRadius: 99, cursor: 'pointer',
            border: `1px solid ${filter === f ? '#111827' : '#e5e7eb'}`,
            background: filter === f ? '#111827' : 'transparent',
            color: filter === f ? '#fff' : '#6b7280'
          }}>
            {f === 'all' ? 'Tất cả' : f === 'win' ? '✅ Lãi' : '❌ Lỗ'}
          </button>
        ))}
        <button onClick={onClear} style={{
          marginLeft: 'auto', fontSize: 12, padding: '4px 10px',
          borderRadius: 99, border: '1px solid #fecaca',
          background: 'transparent', color: '#dc2626', cursor: 'pointer'
        }}>Xóa lịch sử</button>
      </div>

      {/* Danh sách */}
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {filtered.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px',
            borderBottom: i < filtered.length - 1 ? '1px solid #f9fafb' : 'none',
            background: item.pnl > 0 ? '#f0fdf4' : '#fff5f5'
          }}>
            <img
              src={item.tokenImage || 'https://placehold.co/32x32/e5e7eb/9ca3af?text=?'}
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              onError={e => { e.target.src = 'https://placehold.co/32x32/e5e7eb/9ca3af?text=?' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {item.tokenName}
                <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>{item.strategy}</span>
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                {item.amount} SOL · {item.time}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: item.pnl > 0 ? '#16a34a' : '#dc2626' }}>
                {item.pnl > 0 ? '+' : ''}{item.pnl.toFixed(4)} SOL
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                Win rate: {item.winRate}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

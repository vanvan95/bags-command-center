import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { fetchFromBags } from './useBagsTrading'

function generateFeeHistory(currentFees) {
  // Tạo lịch sử fees giả lập từ fees hiện tại (vì API không có historical data)
  const points = []
  const now = Date.now()
  const baseValue = currentFees * 0.3
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now - i * 3600000)
    const hour = time.getHours()
    // Mô phỏng fee tăng dần theo thời gian thực
    const growth = (23 - i) / 23
    const noise = (Math.random() - 0.3) * currentFees * 0.08
    const value = baseValue + (currentFees - baseValue) * growth + noise
    points.push({
      time: `${hour}:00`,
      fees: Math.max(0, value / 1_000_000_000),
      feesRaw: Math.max(0, value)
    })
  }
  // Đảm bảo điểm cuối là fees thật
  points[points.length - 1].fees = currentFees / 1_000_000_000
  return points
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 8, padding: '8px 12px', fontSize: 12
      }}>
        <div style={{ color: '#6b7280', marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 600, color: '#f97316' }}>
          {Number(payload[0].value).toFixed(4)} SOL fees
        </div>
      </div>
    )
  }
  return null
}

export function FeeChart({ token }) {
  const [data, setData] = useState([])
  const [claimEvents, setClaimEvents] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token])

  const loadData = async () => {
    setLoading(true)
    try {
      // Lấy claim events thật từ API
      const events = await fetchFromBags(
        `/token-launch/claim-events?tokenMint=${token.tokenMint}&limit=10`
      ).catch(() => [])
      setClaimEvents(Array.isArray(events) ? events : [])
    } catch {}

    // Generate fee history từ current fees
    const history = generateFeeHistory(token.fees)
    setData(history)
    setLoading(false)
  }

  if (!token) return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
      padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13
    }}>
      Chọn token để xem biểu đồ fees
    </div>
  )

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Fee History — {token.name}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Mô phỏng 24h · Dựa trên lifetime fees thật</div>
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
          background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa'
        }}>
          {token.feesSOL} SOL total
        </div>
      </div>

      {loading ? (
        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
          Đang tải...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={v => v.toFixed(2)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="fees"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#f97316' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Claim events nếu có */}
      {claimEvents.length > 0 && (
        <div style={{ marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
            Claim events gần nhất
          </div>
          {claimEvents.slice(0, 3).map((e, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 12, color: '#374151', padding: '3px 0'
            }}>
              <span>{new Date(e.timestamp).toLocaleDateString('vi-VN')}</span>
              <span style={{ color: '#f97316', fontWeight: 500 }}>
                {(Number(e.amount) / 1_000_000_000).toFixed(4)} SOL
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

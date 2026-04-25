import { useState } from 'react'
import { useTradingTokens } from './useBagsTrading'
import TokenSelector from './TokenSelector'
import StrategyPanel from './StrategyPanel'
import { TradeHistory } from './TradeHistory'
import { FeeChart } from './FeeChart'

export default function App() {
  const { tokens, loading, error } = useTradingTokens()
  const [selectedToken, setSelectedToken] = useState(null)
  const [history, setHistory] = useState([])

  const addToHistory = (result) => {
    if (!selectedToken) return
    setHistory(prev => [{
      tokenName: selectedToken.name,
      tokenImage: selectedToken.image,
      strategy: result.stratName,
      amount: result.amount,
      pnl: result.pnl,
      winRate: result.winRate,
      time: new Date().toLocaleTimeString('vi-VN')
    }, ...prev])
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ fontSize: 28 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1f2937' }}>
            Bags Auto-Trading Bot UI
          </div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            Strategy builder · Real-time signals · Simulation engine
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', padding: '4px 12px', borderRadius: 99,
          background: '#f0fdf4', color: '#16a34a', fontSize: 12,
          fontWeight: 600, border: '1px solid #bbf7d0'
        }}>
          ● Live — Bags API
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        height: 'calc(100vh - 65px)',
        overflow: 'hidden'
      }}>
        {/* Left: Token list */}
        <div style={{
          borderRight: '1px solid #e5e7eb',
          background: '#fff', overflowY: 'auto'
        }}>
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
            fontWeight: 700, fontSize: 13, color: '#374151', background: '#fafafa'
          }}>
            🔥 Top Tokens by Fees · {tokens.length} token
          </div>
          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
              ⏳ Đang tải...
            </div>
          )}
          {error && (
            <div style={{ padding: 20, color: '#ef4444', fontSize: 13 }}>
              ❌ {error}
            </div>
          )}
          {!loading && !error && (
            <TokenSelector
              tokens={tokens}
              selected={selectedToken}
              onSelect={setSelectedToken}
            />
          )}
        </div>

        {/* Right: Strategy + Chart + History */}
        <div style={{ overflowY: 'auto', background: '#f9fafb' }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
            fontWeight: 700, fontSize: 13, color: '#374151', background: '#fff'
          }}>
            🎯 Strategy Builder & Simulator
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <StrategyPanel token={selectedToken} onSimulate={addToHistory} />
            <FeeChart token={selectedToken} />
            <TradeHistory history={history} onClear={() => setHistory([])} />
          </div>
        </div>
      </div>
    </div>
  )
}
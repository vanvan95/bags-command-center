import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import SolanaWalletProvider from './WalletProvider'
import TabDashboard from './TabDashboard'
import TabFeed from './TabFeed'
import TabTrade from './TabTrade'
import TabLaunch from './TabLaunch'
import TabStatus from './TabStatus'
import TabAnalytics from './TabAnalytics'
import TabPortfolio from './TabPortfolio'
import TabSwap from './TabSwap'
import TabAI from './TabAI'
import TabAIAnalysis from './TabAIAnalysis'
import TabWallet from './TabWallet'
import TabLeaderboard from './TabLeaderboard'
import '@solana/wallet-adapter-react-ui/styles.css'

const MAIN_TABS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'feed', icon: '🔥', label: 'Feed' },
  { id: 'swap', icon: '⚡', label: 'Swap' },
  { id: 'trade', icon: '🤖', label: 'Trade' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
  { id: 'launch', icon: '🚀', label: 'Launch' },
  { id: 'alerts', icon: '🚨', label: 'Alerts' },
  { id: 'ai', icon: '🧠', label: 'AI' },
  { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
]

const MORE_TABS = [
  { id: 'portfolio', icon: '🎒', label: 'Portfolio' },
  { id: 'wallet', icon: '🐋', label: 'Wallet' },
  { id: 'status', icon: '🟢', label: 'Status' },
]

function AppInner() {
  const [tab, setTab] = useState('dashboard')
  const [showMore, setShowMore] = useState(false)
  const { connected, publicKey } = useWallet()
  const moreRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const shortAddr = publicKey
    ? publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4)
    : null

  const allTabs = [...MAIN_TABS, ...MORE_TABS]
  const activeInMore = MORE_TABS.some(t => t.id === tab)

  return (
    <div style={{ minHeight: '100vh', background: '#080c12', fontFamily: '"DM Sans", system-ui, sans-serif', color: '#fff' }}>
      <div style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, height: 56, position: 'sticky', top: 0, zIndex: 1000 }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎒</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1 }}>Bags</div>
            <div style={{ fontSize: 9, color: '#f97316', fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>COMMAND CENTER</div>
          </div>
        </div>

        {/* Main Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {MAIN_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: tab === t.id ? 700 : 500, background: tab === t.id ? 'rgba(249,115,22,0.15)' : 'transparent', color: tab === t.id ? '#f97316' : '#475569', borderBottom: tab === t.id ? '2px solid #f97316' : '2px solid transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ fontSize: 12 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}

          {/* More dropdown */}
          <div ref={moreRef} style={{ position: 'relative', flexShrink: 0, zIndex: 2000 }}>
            <button onClick={() => setShowMore(!showMore)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: activeInMore ? 700 : 500, background: activeInMore ? 'rgba(249,115,22,0.15)' : 'transparent', color: activeInMore ? '#f97316' : '#475569', borderBottom: activeInMore ? '2px solid #f97316' : '2px solid transparent', whiteSpace: 'nowrap' }}>
              More ▾
            </button>
            {showMore && (
              <div style={{ position: 'absolute', top: '110%', left: 0, background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, zIndex: 200, minWidth: 160, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                {MORE_TABS.map(t => (
                  <button key={t.id} onClick={() => { setTab(t.id); setShowMore(false) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, background: tab === t.id ? 'rgba(249,115,22,0.1)' : 'transparent', color: tab === t.id ? '#f97316' : 'rgba(255,255,255,0.7)', textAlign: 'left' }}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Live</span>
          </div>
          {connected && shortAddr && (
            <div style={{ fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap' }}>
              ✅ {shortAddr}
            </div>
          )}
          <WalletMultiButton style={{ whiteSpace: 'nowrap', borderRadius: 10, fontSize: 13, fontWeight: 700, height: 36, padding: '0 16px' }} />
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {tab === 'dashboard' && <TabDashboard />}
        {tab === 'feed' && <TabFeed />}
        {tab === 'swap' && <TabSwap />}
        {tab === 'trade' && <TabTrade />}
        {tab === 'analytics' && <TabAnalytics />}
        {tab === 'portfolio' && <TabPortfolio />}
        {tab === 'launch' && <TabLaunch />}
        {tab === 'status' && <TabStatus />}
        {tab === 'alerts' && <TabAI />}
        {tab === 'ai' && <TabAIAnalysis />}
        {tab === 'wallet' && <TabWallet />}
        {tab === 'leaderboard' && <TabLeaderboard />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <SolanaWalletProvider>
      <AppInner />
    </SolanaWalletProvider>
  )
}


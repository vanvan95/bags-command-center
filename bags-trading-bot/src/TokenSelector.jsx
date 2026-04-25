export default function TokenSelector({ tokens, selected, onSelect }) {
  return (
    <div>
      {tokens.map(token => {
        const isSelected = selected?.tokenMint === token.tokenMint
        const isHot = token.fees >= 100_000_000

        return (
          <div
            key={token.tokenMint}
            onClick={() => onSelect(token)}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer',
              background: isSelected ? '#eef2ff' : isHot ? '#fff7ed' : '#fff',
              borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {token.imageUrl && (
                <img
                  src={token.imageUrl}
                  alt=""
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>
                    {token.name}
                  </span>
                  {isHot && (
                    <span style={{
                      padding: '1px 7px', borderRadius: 99,
                      background: '#fef3c7', color: '#d97706',
                      fontSize: 11, fontWeight: 700
                    }}>🔥 HOT</span>
                  )}
                  {isSelected && (
                    <span style={{ color: '#6366f1', fontSize: 13 }}>✓</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  ${token.ticker} · {token.feesSOL} SOL fees
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
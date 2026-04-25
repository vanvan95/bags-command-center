import { useState, useEffect } from 'react'

const API_BASE = '/bags-api/api/v1'
const API_KEY = import.meta.env.VITE_BAGS_API_KEY

export async function fetchFromBags(endpoint) {
  const res = await fetch(API_BASE + endpoint, { headers: { 'x-api-key': API_KEY } })
  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'API error')
  return data.response
}

export async function getTradeQuote(tokenMint, amountSOL, side) {
  try {
    const pools = await fetchFromBags('/solana/bags/pools')
    const pool = pools.find(p => p.tokenMint === tokenMint)
    if (!pool) return null
    const reserve0 = Number(pool.reserve0 || pool.baseReserve || 1000000)
    const reserve1 = Number(pool.reserve1 || pool.quoteReserve || 1000000)
    const lamports = amountSOL * 1_000_000_000
    let outAmount, priceImpact
    if (side === 'buy') {
      outAmount = Math.floor((reserve0 * lamports) / (reserve1 + lamports))
      priceImpact = (lamports / (reserve1 + lamports)) * 100
    } else {
      outAmount = Math.floor((reserve1 * lamports) / (reserve0 + lamports))
      priceImpact = (lamports / (reserve0 + lamports)) * 100
    }
    return {
      outAmount,
      priceImpact: priceImpact.toFixed(2),
      minOutAmount: Math.floor(outAmount * 0.99),
      poolFound: true
    }
  } catch(e) {
    console.log('quote error:', e.message)
    return null
  }
}

export function useTradingTokens() {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    async function load() {
      try {
        const feed = await fetchFromBags('/token-launch/feed')
        const top10 = feed.slice(0, 10)
        const fees = await Promise.all(top10.map(async t => {
          try {
            const f = await fetchFromBags('/token-launch/lifetime-fees?tokenMint=' + t.tokenMint)
            return Number(f) || 0
          } catch { return 0 }
        }))
        const enriched = top10.map((t, i) => ({ ...t, fees: fees[i], feesSOL: (fees[i] / 1_000_000_000).toFixed(4) })).sort((a, b) => b.fees - a.fees)
        setTokens(enriched)
      } catch(e) { setError(e.message) } finally { setLoading(false) }
    }
    load()
  }, [])
  return { tokens, loading, error }
}

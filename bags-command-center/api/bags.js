export default async function handler(req, res) {
  const path = req.url.replace('/api/bags', '')
  const url = 'https://public-api-v2.bags.fm' + path
  
  const response = await fetch(url, {
    headers: {
      'x-api-key': process.env.VITE_BAGS_API_KEY,
      'Content-Type': 'application/json'
    }
  })
  
  const data = await response.json()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(response.status).json(data)
}
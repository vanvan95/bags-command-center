export default async function handler(req, res) {
  const path = req.url.replace('/api/bags', '')
  const url = 'https://public-api-v2.bags.fm' + path
  
  const response = await fetch(url, {
    headers: { 'x-api-key': process.env.BAGS_API_KEY }
  })
  
  const text = await response.text()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')
  res.status(response.status).send(text)
}
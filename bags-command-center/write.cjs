const fs = require('fs')

fs.writeFileSync('api/bags.js', `export default async function handler(req, res) {
  const reqUrl = req.url || ''
  const path = reqUrl.replace(/^\\/api\\/bags/, '')
  const url = 'https://public-api-v2.bags.fm' + path
  
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')
  
  try {
    const response = await fetch(url, {
      headers: { 'x-api-key': process.env.BAGS_API_KEY || 'bags_prod_PcgAKrA3hsM2fjZCOwKa331Nh714v88YX4EkPhjwACU' }
    })
    const text = await response.text()
    res.status(response.status).send(text)
  } catch(e) {
    res.status(500).json({ error: e.message, url, reqUrl })
  }
}`)

console.log('done!')
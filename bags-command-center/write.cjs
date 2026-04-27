const fs = require('fs')

fs.writeFileSync('vercel.json', `{
  "rewrites": [
    { "source": "/api/bags/:path*", "destination": "/api/bags" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`)

console.log('vercel.json done!')
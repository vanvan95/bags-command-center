const fs = require('fs')

fs.writeFileSync('vercel.json', JSON.stringify({
  "rewrites": [
    { "source": "/api/bags/:path*", "destination": "/api/bags" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}, null, 2))

console.log('done!')
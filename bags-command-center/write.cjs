const fs = require('fs')

fs.writeFileSync('vercel.json', `{
  "rewrites": [
    {
      "source": "/bags-api/:path*",
      "destination": "https://public-api-v2.bags.fm/:path*"
    }
  ],
  "headers": [
    {
      "source": "/bags-api/(.*)",
      "headers": [
        { "key": "x-api-key", "value": "apibags_prod_RVtDOsGTte-0tgneYXJN7Sigw7dtSSxgkwaVeCHMYzs" }
      ]
    }
  ]
}`)

console.log('vercel.json done!')
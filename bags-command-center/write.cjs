const fs = require('fs')

let content = fs.readFileSync('index.html', 'utf8')
content = content.replace('href="/dashboard" class="btn-primary"', 'href="/" class="btn-primary"')
content = content.replace('href="/dashboard" class="btn-primary"', 'href="/" class="btn-primary"')
fs.writeFileSync('index.html', content)
console.log('done!')
const fs = require('fs')

fs.writeFileSync('index.html', `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bags Command Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #080c12; color: #fff; font-family: 'DM Sans', sans-serif; }
    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; background: radial-gradient(ellipse at top, rgba(249,115,22,0.15) 0%, transparent 60%); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 99px; background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.3); color: #f97316; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
    h1 { font-size: clamp(36px, 6vw, 72px); font-weight: 800; line-height: 1.1; margin-bottom: 20px; }
    h1 span { background: linear-gradient(135deg, #f97316, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { font-size: clamp(16px, 2vw, 20px); color: #94a3b8; max-width: 600px; line-height: 1.6; margin-bottom: 40px; }
    .cta { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-bottom: 60px; }
    .btn-primary { padding: 14px 32px; border-radius: 12px; background: linear-gradient(135deg, #f97316, #ef4444); color: #fff; font-weight: 700; font-size: 16px; text-decoration: none; border: none; cursor: pointer; }
    .btn-secondary { padding: 14px 32px; border-radius: 12px; background: rgba(255,255,255,0.06); color: #fff; font-weight: 700; font-size: 16px; text-decoration: none; border: 1px solid rgba(255,255,255,0.12); }
    .stats { display: flex; gap: 40px; flex-wrap: wrap; justify-content: center; margin-bottom: 80px; }
    .stat { text-align: center; }
    .stat-num { font-size: 32px; font-weight: 800; color: #f97316; }
    .stat-label { font-size: 13px; color: #475569; margin-top: 4px; }
    .features { max-width: 1100px; margin: 0 auto; padding: 80px 20px; }
    .features h2 { text-align: center; font-size: 36px; font-weight: 800; margin-bottom: 12px; }
    .features p { text-align: center; color: #475569; margin-bottom: 48px; font-size: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .card { padding: 28px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }
    .card-icon { font-size: 32px; margin-bottom: 16px; }
    .card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .card p { color: #475569; font-size: 14px; line-height: 1.6; }
    .highlight { color: #f97316; }
    .footer { text-align: center; padding: 40px 20px; border-top: 1px solid rgba(255,255,255,0.06); color: #475569; font-size: 14px; }
    .nav { position: fixed; top: 0; left: 0; right: 0; padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; background: rgba(8,12,18,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); z-index: 100; }
    .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff; }
    .logo-icon { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #f97316, #ef4444); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .logo-text { font-weight: 800; font-size: 16px; }
    .logo-sub { font-size: 9px; color: #f97316; font-weight: 700; letter-spacing: 2px; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="logo">
      <div class="logo-icon">🎒</div>
      <div>
        <div class="logo-text">Bags</div>
        <div class="logo-sub">COMMAND CENTER</div>
      </div>
    </a>
    <a href="/dashboard" class="btn-primary" style="padding: 10px 24px; font-size: 14px; border-radius: 10px;">Launch App →</a>
  </nav>

  <div class="hero" style="padding-top: 100px;">
    <div class="badge">⚡ Powered by Bags.fm · Solana · Claude AI</div>
    <h1>The Ultimate<br/><span>Bags Command Center</span></h1>
    <p class="subtitle">Bảng điều khiển all-in-one cho Bags.fm — Real-time data, AI analysis, token swap, và portfolio tracking trên Solana.</p>
    <div class="cta">
      <a href="/dashboard" class="btn-primary">🚀 Launch App</a>
      <a href="https://github.com/vanvan95/bags-command-center" target="_blank" class="btn-secondary">⭐ GitHub</a>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-num">9</div><div class="stat-label">Features</div></div>
      <div class="stat"><div class="stat-num">Live</div><div class="stat-label">Real-time Data</div></div>
      <div class="stat"><div class="stat-num">AI</div><div class="stat-label">Token Analysis</div></div>
      <div class="stat"><div class="stat-num">Free</div><div class="stat-label">Open Source</div></div>
    </div>
  </div>

  <section class="features">
    <h2>Everything you need for <span class="highlight">Bags.fm</span></h2>
    <p>Tích hợp đầy đủ Bags API, Jupiter Swap, và Claude AI trong một giao diện duy nhất</p>
    <div class="grid">
      <div class="card">
        <div class="card-icon">🤖</div>
        <h3>AI Token Analyst</h3>
        <p>Phân tích token thông minh bằng Claude AI — risk score, opportunity score và recommendation chi tiết bằng tiếng Việt.</p>
      </div>
      <div class="card">
        <div class="card-icon">⚡</div>
        <h3>Token Swap</h3>
        <p>Swap SOL sang bất kỳ token Bags nào trực tiếp trong app via Jupiter aggregator với giá tốt nhất.</p>
      </div>
      <div class="card">
        <div class="card-icon">📊</div>
        <h3>Live Dashboard</h3>
        <p>Real-time feed của tất cả token trên Bags.fm — track top tokens, active pools và ecosystem overview.</p>
      </div>
      <div class="card">
        <div class="card-icon">📈</div>
        <h3>Fee Analytics</h3>
        <p>Phân tích lifetime fees của từng token với visual charts — biết token nào đang generate nhiều revenue nhất.</p>
      </div>
      <div class="card">
        <div class="card-icon">🎒</div>
        <h3>Portfolio Tracker</h3>
        <p>Track portfolio của bạn và set price alerts — nhận thông báo khi token đạt mức giá mục tiêu.</p>
      </div>
      <div class="card">
        <div class="card-icon">🚀</div>
        <h3>Token Launch</h3>
        <p>Wizard hướng dẫn launch token mới trên Bags.fm với đầy đủ thông tin và best practices.</p>
      </div>
    </div>
  </section>

  <div class="footer">
    <p>Built for The Bags Hackathon · <a href="https://bags.fm" style="color: #f97316;">bags.fm</a> · <a href="https://github.com/vanvan95/bags-command-center" style="color: #f97316;">GitHub</a></p>
  </div>
</body>
</html>
`)

console.log('Landing page done!')
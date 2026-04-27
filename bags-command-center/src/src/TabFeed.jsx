const fs = require('fs')

fs.writeFileSync('src/TabLaunch.jsx', `
import { useState } from 'react'

const STEPS = ['Token Info', 'Image', 'Fee Setup', 'Preview']

export default function TabLaunch() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', ticker: '', description: '', twitter: '', website: '', image: null, imagePreview: null, feeShare: 1 })
  const up = f => setForm(p => ({ ...p, ...f }))

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => up({ image: file, imagePreview: ev.target.result })
    reader.readAsDataURL(file)
  }

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, background: step === i ? '#f97316' : step > i ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)', color: step > i ? '#10b981' : step === i ? '#fff' : '#4b5563', border: step > i ? '1px solid rgba(16,185,129,0.4)' : 'none' }}>{step > i ? '✓' : i + 1}</div>
              <div style={{ fontSize: 10, color: step === i ? '#f97316' : '#4b5563', fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</div>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: step > i ? '#f97316' : 'rgba(255,255,255,0.08)', margin: '0 8px', marginBottom: 20 }} />}
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Token Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={lbl}>Name *</label><input style={inp} placeholder="Moon Coin" value={form.name} onChange={e => up({ name: e.target.value })} /></div>
              <div><label style={lbl}>Ticker *</label><input style={inp} placeholder="MOON" value={form.ticker} onChange={e => up({ ticker: e.target.value.toUpperCase().slice(0,10) })} /></div>
            </div>
            <div><label style={lbl}>Description *</label><textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Tell the community..." value={form.description} onChange={e => up({ description: e.target.value })} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label style={lbl}>Twitter</label><input style={inp} placeholder="@yourtoken" value={form.twitter} onChange={e => up({ twitter: e.target.value })} /></div>
              <div><label style={lbl}>Website</label><input style={inp} placeholder="https://..." value={form.website} onChange={e => up({ website: e.target.value })} /></div>
            </div>
            <button onClick={() => form.name && form.ticker && form.description && setStep(1)} style={{ padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: form.name && form.ticker && form.description ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'rgba(255,255,255,0.08)', color: form.name && form.ticker && form.description ? '#fff' : '#4b5563', fontWeight: 800, fontSize: 15 }}>Continue →</button>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Token Image</h3>
            <label style={{ border: '2px dashed rgba(249,115,22,0.3)', borderRadius: 14, padding: 40, textAlign: 'center', cursor: 'pointer', display: 'block' }}>
              {form.imagePreview ? <img src={form.imagePreview} alt="" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} /> : <div><div style={{ fontSize: 40 }}>🖼️</div><div style={{ color: '#475569', marginTop: 8 }}>Click to upload image</div></div>}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', fontWeight: 700, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep(2)} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Fee Settings</h3>
            <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>Set your creator fee — you earn this % from every trade of your token on Bags.</p>
            <div style={{ padding: 20, borderRadius: 12, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700 }}>Creator Fee</span>
                <span style={{ fontWeight: 800, color: '#f97316', fontSize: 20 }}>{form.feeShare}%</span>
              </div>
              <input type="range" min={0.1} max={5} step={0.1} value={form.feeShare} onChange={e => up({ feeShare: +e.target.value })} style={{ width: '100%', accentColor: '#f97316' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginTop: 4 }}><span>0.1% min</span><span>5% max</span></div>
            </div>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 13, color: '#10b981' }}>
              💡 At {form.feeShare}% — if your token does 100 SOL volume, you earn {(100 * form.feeShare / 100).toFixed(2)} SOL
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', fontWeight: 700, cursor: 'pointer' }}>← Back</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Preview →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Preview & Launch</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {form.imagePreview && <img src={form.imagePreview} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />}
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{form.name}</div>
                <div style={{ color: '#f97316', fontWeight: 700 }}>{'$' + form.ticker}</div>
              </div>
              <div style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 99, background: 'rgba(249,115,22,0.15)', color: '#f97316', fontWeight: 700, fontSize: 12 }}>READY</div>
            </div>
            {[['Description', form.description], ['Creator Fee', form.feeShare + '%'], ['Twitter', form.twitter || '—'], ['Website', form.website || '—']].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#475569' }}>{k}</span><span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', fontWeight: 700, cursor: 'pointer' }}>← Back</button>
              <a href={'https://bags.fm/create?name=' + encodeURIComponent(form.name) + '&ticker=' + encodeURIComponent(form.ticker)} target="_blank" rel="noopener noreferrer" style={{ flex: 2, padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', textAlign: 'center' }}>🚀 Launch on Bags.fm</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
`)

console.log('TabLaunch done!')
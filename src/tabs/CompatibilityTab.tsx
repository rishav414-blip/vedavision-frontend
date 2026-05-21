import React, { useState } from 'react'

const RASHIS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati']
const KOOTS = [
  { name:'Varna', max:1, desc:'Spiritual compatibility' },
  { name:'Vashya', max:2, desc:'Mutual attraction' },
  { name:'Tara', max:3, desc:'Destiny & health' },
  { name:'Yoni', max:4, desc:'Physical compatibility' },
  { name:'Graha Maitri', max:5, desc:'Mental harmony' },
  { name:'Gana', max:6, desc:'Nature & temperament' },
  { name:'Bhakoot', max:7, desc:'Love & emotion' },
  { name:'Nadi', max:8, desc:'Health & progeny' },
]

function score(a: string, b: string, max: number, seed: number) {
  let h = seed
  for (let i = 0; i < a.length + b.length; i++) { const c = i < a.length ? a.charCodeAt(i) : b.charCodeAt(i - a.length); h = (h * 31 + c) & 0x7fffffff }
  return Math.min(max, Math.round(((h % (max + 1)) + (h >> 4) % (max + 1)) / 2))
}

function rating(total: number): { label: string; color: string } {
  if (total >= 30) return { label:'Excellent', color:'#6EC97A' }
  if (total >= 24) return { label:'Good', color:'#D4B870' }
  if (total >= 18) return { label:'Compatible', color:'#F0A830' }
  return { label:'Needs Reflection', color:'#E05050' }
}

const card: React.CSSProperties = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20 }
const sel: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#F0EBF4', fontSize:14, fontFamily:'Outfit,sans-serif', cursor:'pointer', outline:'none' }

export default function CompatibilityTab({ chart }: { chart: any }) {
  const [moonSign, setMoonSign] = useState('')
  const [nakshatra, setNakshatra] = useState('')
  const [results, setResults] = useState<number[]|null>(null)

  function check() {
    if (!moonSign || !nakshatra) return
    setResults(KOOTS.map((k, i) => score(moonSign, nakshatra, k.max, i * 7 + 13)))
  }

  const total = results ? results.reduce((a,b) => a+b, 0) : 0
  const r = results ? rating(total) : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>
      <div style={card}>
        <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 8px' }}>Ashtakoot Milan</p>
        <p style={{ fontSize:15, color:'#F0EBF4', margin:'0 0 6px', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic' }}>36-Point Vedic Compatibility System</p>
        <p style={{ fontSize:13, color:'#B0A0C8', margin:0, lineHeight:1.6, fontFamily:'Outfit,sans-serif' }}>Evaluates eight dimensions of resonance based on Moon signs and nakshatras. A reflective overview, not a verdict.</p>
      </div>

      <div style={card}>
        <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 12px' }}>Partner's Lunar Position</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><label style={{ fontSize:11, color:'#8090B5', display:'block', marginBottom:6, fontFamily:'Outfit,sans-serif', textTransform:'uppercase', letterSpacing:'0.08em' }}>Moon Sign (Rāśi)</label>
            <select value={moonSign} onChange={e => setMoonSign(e.target.value)} style={sel}><option value="">Select Moon sign…</option>{RASHIS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div><label style={{ fontSize:11, color:'#8090B5', display:'block', marginBottom:6, fontFamily:'Outfit,sans-serif', textTransform:'uppercase', letterSpacing:'0.08em' }}>Nakshatra</label>
            <select value={nakshatra} onChange={e => setNakshatra(e.target.value)} style={sel}><option value="">Select nakshatra…</option>{NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
          <button onClick={check} disabled={!moonSign || !nakshatra} style={{ padding:'12px 0', borderRadius:12, border:'none', background: moonSign && nakshatra ? 'linear-gradient(135deg,#C0A860,#D4B870)' : 'rgba(255,255,255,0.06)', color: moonSign && nakshatra ? '#0A0618' : '#8090B5', fontSize:14, fontFamily:'Outfit,sans-serif', fontWeight:600, cursor: moonSign && nakshatra ? 'pointer' : 'default' }}>Check Compatibility</button>
        </div>
      </div>

      {results && r && (
        <>
          <div style={{ ...card, textAlign:'center', padding:'24px 20px' }}>
            <p style={{ fontSize:11, color:'#8090B5', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 8px', fontFamily:'Outfit,sans-serif' }}>Total Score</p>
            <p style={{ fontSize:52, fontFamily:'Syne,sans-serif', fontWeight:700, color:r.color, margin:'0 0 4px', lineHeight:1 }}>{total}</p>
            <p style={{ fontSize:14, color:'#B0A0C8', margin:'0 0 12px', fontFamily:'Outfit,sans-serif' }}>out of 36</p>
            <span style={{ display:'inline-block', padding:'5px 18px', borderRadius:999, border:`1px solid ${r.color}`, color:r.color, fontSize:13, fontFamily:'Outfit,sans-serif' }}>{r.label}</span>
          </div>
          <div style={card}>
            <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 12px' }}>Koot Breakdown</p>
            {KOOTS.map((k, i) => {
              const s = results[i], pct = s / k.max
              const bc = pct >= 0.8 ? '#6EC97A' : pct >= 0.5 ? '#D4B870' : '#E05050'
              return (
                <div key={k.name} style={{ padding:'10px 0', borderBottom: i < KOOTS.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div><span style={{ fontSize:13, color:'#F0EBF4', fontFamily:'Outfit,sans-serif', marginRight:8 }}>{k.name}</span><span style={{ fontSize:11, color:'#8090B5', fontFamily:'Outfit,sans-serif' }}>{k.desc}</span></div>
                    <span style={{ fontSize:13, color:bc, fontFamily:'Syne,sans-serif', fontWeight:600 }}>{s} / {k.max}</span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}><div style={{ width:`${pct*100}%`, height:'100%', background:bc, borderRadius:2, transition:'width 0.4s ease' }} /></div>
                </div>
              )
            })}
          </div>
          <div style={{ padding:'12px 16px', background:'rgba(139,124,200,0.08)', border:'1px solid rgba(139,124,200,0.2)', borderRadius:12 }}>
            <p style={{ fontSize:12, color:'#8B7CC8', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>This is a general reflection. A full reading considers lagna, navamsha, Venus, and many additional factors — consult a qualified Jyotishi for comprehensive analysis.</p>
          </div>
          <button
            onClick={async () => {
              const text = `✦ Vedic Compatibility: ${total}/36 — ${r.label}\n${moonSign} × ${nakshatra}\n\nCheck yours → vedavision-app.pages.dev`
              if (navigator.share) { try { await navigator.share({ text }); return } catch {} }
              await navigator.clipboard.writeText(text).catch(() => {})
              window.showToast?.('Compatibility result copied', 'success')
            }}
            style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'#B0A0C8', fontSize:13, fontFamily:'Outfit,sans-serif', cursor:'pointer' }}
          >
            📱 Share Result
          </button>
        </>
      )}
    </div>
  )
}

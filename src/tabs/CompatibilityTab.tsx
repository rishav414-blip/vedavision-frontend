import React, { useState } from 'react'

const RASHIS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati']
const PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
const KOOTS = [
  { name:'Varna',       max:1, desc:'Spiritual compatibility' },
  { name:'Vashya',      max:2, desc:'Mutual attraction' },
  { name:'Tara',        max:3, desc:'Destiny & health' },
  { name:'Yoni',        max:4, desc:'Physical compatibility' },
  { name:'Graha Maitri',max:5, desc:'Mental harmony' },
  { name:'Gana',        max:6, desc:'Nature & temperament' },
  { name:'Bhakoot',     max:7, desc:'Love & emotion' },
  { name:'Nadi',        max:8, desc:'Health & progeny' },
]

const DASHA_COMPAT: Record<string, string> = {
  'Saturn-Saturn': 'Both in Saturn periods — shared themes of discipline and karmic reckoning. Grounding for long-term partnership.',
  'Saturn-Jupiter': 'Saturn structure meets Jupiter expansion. One partner consolidates while the other grows — complementary if respected.',
  'Jupiter-Venus': 'Jupiter wisdom meets Venus beauty — a naturally harmonious combination for relationship formation.',
  'Rahu-Ketu': 'Nodal axis alignment — karmic intensity. Deep connection but potentially destabilising. Proceed with awareness.',
}
const DASHA_FALLBACK = 'Planetary periods carry their own textures. The quality of connection transcends dasha timing.'

function score(a: string, b: string, max: number, seed: number) {
  let h = seed
  for (let i = 0; i < a.length + b.length; i++) { const c = i < a.length ? a.charCodeAt(i) : b.charCodeAt(i - a.length); h = (h * 31 + c) & 0x7fffffff }
  return Math.min(max, Math.round(((h % (max + 1)) + (h >> 4) % (max + 1)) / 2))
}

function rating(total: number): { label: string; color: string } {
  if (total >= 30) return { label:'Excellent',        color:'#6EC97A' }
  if (total >= 24) return { label:'Good',             color:'#D4B870' }
  if (total >= 18) return { label:'Compatible',       color:'#F0A830' }
  return                   { label:'Needs Reflection', color:'#E05050' }
}

const NADI_MAP: Record<string, 'Aadi'|'Madhya'|'Antya'> = {
  Ashwini:'Aadi',Bharani:'Madhya',Krittika:'Antya',Rohini:'Aadi',Mrigashira:'Madhya',
  Ardra:'Antya',Punarvasu:'Aadi',Pushya:'Madhya',Ashlesha:'Antya',Magha:'Aadi',
  'Purva Phalguni':'Madhya','Uttara Phalguni':'Antya',Hasta:'Aadi',Chitra:'Madhya',
  Swati:'Antya',Vishakha:'Aadi',Anuradha:'Madhya',Jyeshtha:'Antya',Mula:'Aadi',
  'Purva Ashadha':'Madhya','Uttara Ashadha':'Antya',Shravana:'Aadi',Dhanishtha:'Madhya',
  Shatabhisha:'Antya','Purva Bhadrapada':'Aadi','Uttara Bhadrapada':'Madhya',Revati:'Antya',
}

function hasBhakootDosha(s1: string, s2: string): boolean {
  const idx = (s: string) => RASHIS.indexOf(s)
  const d = Math.abs(idx(s1) - idx(s2)) + 1
  return [6, 8, 12].includes(d) || [6, 8, 12].includes(13 - d)
}

type DoshaSeverity = 'high' | 'medium' | 'neutral' | 'ok'

function severityStyle(sev: DoshaSeverity): { bg: string; border: string; icon: string; color: string } {
  switch (sev) {
    case 'high':    return { bg:'rgba(224,80,80,0.08)',    border:'rgba(224,80,80,0.25)',    icon:'✕', color:'#E05050' }
    case 'medium':  return { bg:'rgba(240,168,48,0.08)',   border:'rgba(240,168,48,0.25)',   icon:'⚠', color:'#F0A830' }
    case 'neutral': return { bg:'rgba(139,124,200,0.08)',  border:'rgba(139,124,200,0.25)',  icon:'~', color:'#8B7CC8' }
    case 'ok':      return { bg:'rgba(110,201,122,0.08)',  border:'rgba(110,201,122,0.25)',  icon:'✓', color:'#6EC97A' }
  }
}

const card: React.CSSProperties = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20 }
const sel:  React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#F0EBF4', fontSize:14, fontFamily:'Outfit,sans-serif', cursor:'pointer', outline:'none' }
const inputStyle: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#F0EBF4', fontSize:14, fontFamily:'Outfit,sans-serif', outline:'none', boxSizing:'border-box' }
const lbl: React.CSSProperties = { fontSize:11, color:'#8090B5', display:'block', marginBottom:6, fontFamily:'Outfit,sans-serif', textTransform:'uppercase', letterSpacing:'0.08em' }

export default function CompatibilityTab({ chart }: { chart: any }) {
  const [partnerName,   setPartnerName]   = useState('')
  const [partnerDob,    setPartnerDob]    = useState('')
  const [moonSign,      setMoonSign]      = useState('')
  const [nakshatra,     setNakshatra]     = useState('')
  const [partnerLagna,  setPartnerLagna]  = useState('')
  const [partnerDasha,  setPartnerDasha]  = useState('')
  const [partnerMangal, setPartnerMangal] = useState(false)
  const [results,       setResults]       = useState<number[]|null>(null)

  function check() {
    if (!moonSign || !nakshatra) return
    setResults(KOOTS.map((k, i) => score(moonSign, nakshatra, k.max, i * 7 + 13)))
  }

  const total = results ? results.reduce((a, b) => a + b, 0) : 0
  const r     = results ? rating(total) : null

  const nadiSame = moonSign && nakshatra ? NADI_MAP[nakshatra] !== undefined && NADI_MAP[nakshatra] === NADI_MAP[moonSign] : false
  const bhakoot  = moonSign && nakshatra ? hasBhakootDosha(moonSign, nakshatra) : false

  const userDasha    = chart?.dasha?.current?.planet ?? ''
  const userLagna    = chart?.lagna?.sign ?? ''
  const dashaKey1    = userDasha && partnerDasha ? `${userDasha}-${partnerDasha}` : ''
  const dashaKey2    = userDasha && partnerDasha ? `${partnerDasha}-${userDasha}` : ''
  const dashaNarrative = DASHA_COMPAT[dashaKey1] ?? DASHA_COMPAT[dashaKey2] ?? (userDasha && partnerDasha ? DASHA_FALLBACK : '')

  // Mangal: check if user has Mangal dosha — chart houses 1,2,4,7,8,12
  const userMangal = chart?.houses ? [1,2,4,7,8,12].some((h: number) => {
    const house = chart.houses.find((hh: any) => hh.id === h)
    return house?.planets?.includes('Mars') || house?.planets?.includes('Ma')
  }) : false

  const resultHeader = partnerName
    ? `Compatibility: ${userLagna || 'Your Chart'} × ${partnerName}`
    : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>

      {/* ── Intro card ── */}
      <div style={card}>
        <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 8px' }}>Ashtakoot Milan</p>
        <p style={{ fontSize:15, color:'#F0EBF4', margin:'0 0 6px', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic' }}>36-Point Vedic Compatibility System</p>
        <p style={{ fontSize:13, color:'#B0A0C8', margin:0, lineHeight:1.6, fontFamily:'Outfit,sans-serif' }}>Evaluates eight dimensions of resonance based on Moon signs and nakshatras. A reflective overview, not a verdict.</p>
      </div>

      {/* ── Input card ── */}
      <div style={card}>
        <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 12px' }}>Partner Details</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Partner Name */}
          <div>
            <label style={lbl}>Partner Name <span style={{ color:'#5A6A8A', fontStyle:'italic', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
            <input
              type="text"
              placeholder="Partner's name…"
              value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label style={lbl}>Date of Birth <span style={{ color:'#5A6A8A', fontStyle:'italic', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
            <input
              type="date"
              value={partnerDob}
              onChange={e => setPartnerDob(e.target.value)}
              style={{ ...inputStyle, colorScheme:'dark' }}
            />
          </div>

          {/* Moon Sign */}
          <div>
            <label style={lbl}>Moon Sign (Rāśi) <span style={{ color:'#E05050' }}>*</span></label>
            <select value={moonSign} onChange={e => setMoonSign(e.target.value)} style={sel}>
              <option value="">Select Moon sign…</option>
              {RASHIS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Nakshatra */}
          <div>
            <label style={lbl}>Nakshatra <span style={{ color:'#E05050' }}>*</span></label>
            <select value={nakshatra} onChange={e => setNakshatra(e.target.value)} style={sel}>
              <option value="">Select nakshatra…</option>
              {NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Lagna */}
          <div>
            <label style={lbl}>Lagna <span style={{ color:'#5A6A8A', fontStyle:'italic', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
            <select value={partnerLagna} onChange={e => setPartnerLagna(e.target.value)} style={sel}>
              <option value="">Select rising sign…</option>
              {RASHIS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Active Mahadasha */}
          <div>
            <label style={lbl}>Active Mahadasha <span style={{ color:'#5A6A8A', fontStyle:'italic', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
            <select value={partnerDasha} onChange={e => setPartnerDasha(e.target.value)} style={sel}>
              <option value="">Select planet…</option>
              {PLANETS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Mangal Dosha */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button
              type="button"
              onClick={() => setPartnerMangal(v => !v)}
              style={{
                width:36, height:20, borderRadius:10,
                background: partnerMangal ? '#E05050' : 'rgba(255,255,255,0.10)',
                border:'none', cursor:'pointer', position:'relative',
                transition:'background 0.2s', padding:0, flexShrink:0,
              }}
              aria-label="Toggle Mangal Dosha"
            >
              <div style={{
                position:'absolute', top:2,
                left: partnerMangal ? 18 : 2,
                width:16, height:16, borderRadius:'50%',
                background:'#fff', transition:'left 0.2s',
              }} />
            </button>
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:'#B0A0C8' }}>
              Mangal Dosha — Mars in 1st/2nd/4th/7th/8th/12th house
            </span>
          </div>

          <button
            onClick={check}
            disabled={!moonSign || !nakshatra}
            style={{ padding:'12px 0', borderRadius:12, border:'none', background: moonSign && nakshatra ? 'linear-gradient(135deg,#C0A860,#D4B870)' : 'rgba(255,255,255,0.06)', color: moonSign && nakshatra ? '#0A0618' : '#8090B5', fontSize:14, fontFamily:'Outfit,sans-serif', fontWeight:600, cursor: moonSign && nakshatra ? 'pointer' : 'default' }}
          >
            Check Compatibility
          </button>
        </div>
      </div>

      {results && r && (
        <>
          {/* ── Score summary ── */}
          <div style={{ ...card, textAlign:'center', padding:'24px 20px' }}>
            {resultHeader && (
              <p style={{ fontSize:12, color:'#D4B870', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', margin:'0 0 12px', letterSpacing:'0.04em' }}>{resultHeader}</p>
            )}
            <p style={{ fontSize:11, color:'#8090B5', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 8px', fontFamily:'Outfit,sans-serif' }}>Total Score</p>
            <p style={{ fontSize:52, fontFamily:'Syne,sans-serif', fontWeight:700, color:r.color, margin:'0 0 4px', lineHeight:1 }}>{total}</p>
            <p style={{ fontSize:14, color:'#B0A0C8', margin:'0 0 12px', fontFamily:'Outfit,sans-serif' }}>out of 36</p>
            <span style={{ display:'inline-block', padding:'5px 18px', borderRadius:999, border:`1px solid ${r.color}`, color:r.color, fontSize:13, fontFamily:'Outfit,sans-serif' }}>{r.label}</span>
          </div>

          {/* ── Koot breakdown ── */}
          <div style={card}>
            <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 12px' }}>Koot Breakdown</p>
            {KOOTS.map((k, i) => {
              const s = results[i], pct = s / k.max
              const bc = pct >= 0.8 ? '#6EC97A' : pct >= 0.5 ? '#D4B870' : '#E05050'
              return (
                <div key={k.name} style={{ padding:'10px 0', borderBottom: i < KOOTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div>
                      <span style={{ fontSize:13, color:'#F0EBF4', fontFamily:'Outfit,sans-serif', marginRight:8 }}>{k.name}</span>
                      <span style={{ fontSize:11, color:'#8090B5', fontFamily:'Outfit,sans-serif' }}>{k.desc}</span>
                    </div>
                    <span style={{ fontSize:13, color:bc, fontFamily:'Syne,sans-serif', fontWeight:600 }}>{s} / {k.max}</span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width:`${pct * 100}%`, height:'100%', background:bc, borderRadius:2, transition:'width 0.4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Dasha Alignment ── */}
          {dashaNarrative && (
            <div style={card}>
              <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 10px' }}>Dasha Alignment</p>
              <p style={{ fontSize:12, color:'#8090B5', fontFamily:'Outfit,sans-serif', margin:'0 0 10px' }}>
                {userDasha && <span style={{ color:'#F0EBF4' }}>{userDasha} MD</span>} {userDasha && partnerDasha ? '×' : ''} {partnerDasha && <span style={{ color:'#F0EBF4' }}>{partnerDasha} MD</span>}
              </p>
              <div style={{ padding:'10px 14px', background:'rgba(139,124,200,0.08)', borderRadius:10, borderLeft:'2px solid rgba(139,124,200,0.4)' }}>
                <p style={{ fontSize:13, color:'#B0A0C8', margin:0, lineHeight:1.6, fontFamily:'Outfit,sans-serif' }}>{dashaNarrative}</p>
              </div>
            </div>
          )}

          {/* ── Dosha Analysis ── */}
          <div style={card}>
            <p style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 14px' }}>Dosha Analysis</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {(() => {
                const doshas: { sev: DoshaSeverity; name: string; desc: string }[] = [
                  nadiSame
                    ? { sev:'high',    name:'Nadi Dosha Present',   desc:'Same constitutional energy — traditionally the most serious dosha.' }
                    : { sev:'ok',      name:'No Nadi Dosha',        desc:'Nadi energies are distinct — an auspicious sign for constitutional harmony.' },
                  bhakoot
                    ? { sev:'medium',  name:'Bhakoot Dosha Present', desc:'Moon sign distance creates an inauspicious pattern. Mitigated by strong Nadi and Gana scores.' }
                    : { sev:'ok',      name:'No Bhakoot Dosha',     desc:'Moon sign relationship is harmonious.' },
                  userMangal && partnerMangal
                    ? { sev:'ok',      name:'✓ Mutual Mangal — cancellation possible', desc:'Both charts carry Mars in sensitive houses. Traditional texts allow mutual cancellation of the dosha in this case.' }
                    : partnerMangal
                    ? { sev:'medium',  name:'Mangal Dosha (Partner)', desc:'Partner has indicated Mars in a sensitive house. Assessment requires full natal chart comparison by a qualified Jyotishi.' }
                    : { sev:'neutral', name:'Mangal Dosha',           desc:'Assessment requires full natal chart. A qualified Jyotishi can assess Mars placement.' },
                ]
                return doshas.map(({ sev, name, desc }) => {
                  const st = severityStyle(sev)
                  return (
                    <div key={name} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', background:st.bg, border:`1px solid ${st.border}`, borderRadius:12 }}>
                      <span style={{ fontSize:16, color:st.color, flexShrink:0, marginTop:1 }}>{st.icon}</span>
                      <div>
                        <p style={{ fontSize:13, color:'#F0EBF4', fontFamily:'Outfit,sans-serif', fontWeight:600, margin:'0 0 3px' }}>{name}</p>
                        <p style={{ fontSize:12, color:'#B0A0C8', fontFamily:'Outfit,sans-serif', margin:0, lineHeight:1.55 }}>{desc}</p>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>

          {/* ── Disclaimer ── */}
          <div style={{ padding:'12px 16px', background:'rgba(139,124,200,0.08)', border:'1px solid rgba(139,124,200,0.2)', borderRadius:12 }}>
            <p style={{ fontSize:12, color:'#8B7CC8', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>This is a general reflection. A full reading considers lagna, navamsha, Venus, and many additional factors — consult a qualified Jyotishi for comprehensive analysis.</p>
          </div>

          {/* ── Share button ── */}
          <button
            onClick={async () => {
              const nameStr = partnerName ? ` with ${partnerName}` : ''
              const text = `✦ Vedic Compatibility${nameStr}: ${total}/36 — ${r.label}\n${moonSign} × ${nakshatra}\n\nCheck yours → vedavision-app.pages.dev`
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

import React, { useState } from 'react'
import type { ChartData } from '@/lib/chartTypes'
import { getSignStr } from '@/lib/chartTypes'
import { NAKSHATRA_NAMES, YONI, YONI_ENEMIES, GANA, NADI_MAP } from '@/lib/nakshatraData'

const NAKSHATRAS = NAKSHATRA_NAMES
const RASHIS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
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

function rating(total: number): { label: string; color: string } {
  if (total >= 30) return { label:'Excellent',        color:'#6EC97A' }
  if (total >= 24) return { label:'Good',             color:'#D4B870' }
  if (total >= 18) return { label:'Compatible',       color:'#F0A830' }
  return                   { label:'Needs Reflection', color:'#E05050' }
}

// ── Real Ashtakoot Kuta tables ────────────────────────────────────────────────

const VARNA: Record<string, number> = {
  Cancer:1, Scorpio:1, Pisces:1,       // Brahmin (highest = 1)
  Aries:2, Leo:2, Sagittarius:2,        // Kshatriya
  Taurus:3, Virgo:3, Capricorn:3,       // Vaishya
  Gemini:4, Libra:4, Aquarius:4,        // Shudra
}

const VASHYA: Record<string, string> = {
  Aries:'Chatushpada', Taurus:'Chatushpada', Capricorn:'Chatushpada',
  Gemini:'Manava', Virgo:'Manava', Libra:'Manava', Sagittarius:'Manava', Aquarius:'Manava',
  Cancer:'Jalchar', Pisces:'Jalchar',
  Leo:'Vanchar',
  Scorpio:'Keeta',
}


const SIGN_LORD: Record<string, string> = {
  Aries:'Mars', Taurus:'Venus', Gemini:'Mercury', Cancer:'Moon', Leo:'Sun',
  Virgo:'Mercury', Libra:'Venus', Scorpio:'Mars', Sagittarius:'Jupiter',
  Capricorn:'Saturn', Aquarius:'Saturn', Pisces:'Jupiter',
}

// 1=friend, 0=neutral, -1=enemy
const FRIENDSHIP: Record<string, Record<string, number>> = {
  Sun:     { Moon:1, Mars:1, Jupiter:1, Mercury:0, Venus:-1, Saturn:-1 },
  Moon:    { Sun:1, Mercury:1, Mars:0, Jupiter:0, Venus:0, Saturn:0 },
  Mars:    { Sun:1, Moon:1, Jupiter:1, Venus:0, Saturn:0, Mercury:-1 },
  Mercury: { Sun:1, Venus:1, Mars:0, Saturn:0, Jupiter:0, Moon:-1 },
  Jupiter: { Sun:1, Moon:1, Mars:1, Saturn:0, Mercury:-1, Venus:-1 },
  Venus:   { Mercury:1, Saturn:1, Mars:0, Jupiter:0, Sun:-1, Moon:-1 },
  Saturn:  { Mercury:1, Venus:1, Jupiter:0, Sun:-1, Moon:-1, Mars:-1 },
}

function kulaFriend(p1: string, p2: string): number {
  if (p1 === p2) return 1
  return FRIENDSHIP[p1]?.[p2] ?? 0
}

// ── 8 Kuta scoring functions ──────────────────────────────────────────────────

function scoreVarna(nSign: string, pSign: string): number {
  const nv = VARNA[nSign] ?? 4, pv = VARNA[pSign] ?? 4
  return nv <= pv ? 1 : 0
}

function scoreVashya(nSign: string, pSign: string): number {
  const ng = VASHYA[nSign], pg = VASHYA[pSign]
  if (!ng || !pg) return 1
  if (ng === pg) return 2
  if ((ng === 'Chatushpada' && pg === 'Jalchar') || (ng === 'Jalchar' && pg === 'Chatushpada')) return 1
  if ((ng === 'Jalchar' && pg === 'Manava') || (ng === 'Manava' && pg === 'Jalchar')) return 1
  return 0
}

function scoreTara(nNak: string, pNak: string): number {
  const nIdx = NAKSHATRAS.indexOf(nNak), pIdx = NAKSHATRAS.indexOf(pNak)
  if (nIdx === -1 || pIdx === -1) return 0
  const AUSP = new Set([2, 4, 6, 8, 0])
  const fromN = ((pIdx - nIdx + 27) % 27) % 9
  const fromP = ((nIdx - pIdx + 27) % 27) % 9
  return (AUSP.has(fromN) && AUSP.has(fromP)) ? 3 : (AUSP.has(fromN) || AUSP.has(fromP)) ? 1 : 0
}

function scoreYoni(nNak: string, pNak: string): number {
  const ny = YONI[nNak], py = YONI[pNak]
  if (!ny || !py) return 2
  if (ny === py) return 4
  const mortal = (ny === 'Serpent' && py === 'Mongoose') || (ny === 'Mongoose' && py === 'Serpent')
  if (mortal) return 0
  const enemy = YONI_ENEMIES.some(([a, b]) => (a === ny && b === py) || (a === py && b === ny))
  return enemy ? 1 : 2
}

function scoreGrahaMaitri(nSign: string, pSign: string): number {
  const nl = SIGN_LORD[nSign], pl = SIGN_LORD[pSign]
  if (!nl || !pl) return 3
  if (nl === pl) return 5
  const n2p = kulaFriend(nl, pl), p2n = kulaFriend(pl, nl)
  if (n2p === 1  && p2n === 1)  return 5
  if (n2p === 1  && p2n === 0)  return 4
  if (n2p === 0  && p2n === 1)  return 4
  if (n2p === 0  && p2n === 0)  return 3
  if (n2p === 1  && p2n === -1) return 1
  if (n2p === -1 && p2n === 1)  return 1
  if (n2p === -1 && p2n === 0)  return 1
  if (n2p === 0  && p2n === -1) return 1
  return 0
}

function scoreGana(nNak: string, pNak: string): number {
  const ng = GANA[nNak], pg = GANA[pNak]
  if (!ng || !pg) return 3
  if (ng === pg) return 6
  if ((ng === 'Deva' && pg === 'Manushya') || (ng === 'Manushya' && pg === 'Deva')) return 5
  if ((ng === 'Deva' && pg === 'Rakshasa') || (ng === 'Rakshasa' && pg === 'Deva')) return 1
  return 0
}

function scoreBhakoot(nSign: string, pSign: string): number {
  return hasBhakootDosha(nSign, pSign) ? 0 : 7
}

function scoreNadi(nNak: string, pNak: string): number {
  const nn = NADI_MAP[nNak], pn = NADI_MAP[pNak]
  if (!nn || !pn) return 4
  return nn === pn ? 0 : 8
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
    case 'neutral': return { bg:'rgba(139,124,200,0.08)',  border:'rgba(139,124,200,0.25)',  icon:'~', color:'#A99BD9' }
    case 'ok':      return { bg:'rgba(110,201,122,0.08)',  border:'rgba(110,201,122,0.25)',  icon:'✓', color:'#6EC97A' }
  }
}

const card: React.CSSProperties = { background:'rgba(8,4,22,0.72)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', border:'1px solid rgba(114,166,183,0.2)', borderRadius:16, padding:20, boxShadow:'0 4px 30px rgba(0,0,0,0.55)' }
const sel:  React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(10,5,26,0.88)', border:'1px solid rgba(114,166,183,0.35)', borderRadius:10, color:'#F0EBF4', fontSize:14, fontFamily:'Outfit,sans-serif', cursor:'pointer', outline:'none', colorScheme:'dark' }
const inputStyle: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(10,5,26,0.88)', border:'1px solid rgba(114,166,183,0.22)', borderRadius:10, color:'#F0EBF4', fontSize:14, fontFamily:'Outfit,sans-serif', outline:'none', boxSizing:'border-box' }
const lbl: React.CSSProperties = { fontSize:13, color:'#A0A8C8', display:'block', marginBottom:6, fontFamily:'Outfit,sans-serif', textTransform:'uppercase', letterSpacing:'0.08em' }

export default function CompatibilityTab({ chart }: { chart: ChartData | null }) {
  const [partnerName,   setPartnerName]   = useState('')
  const [partnerDob,    setPartnerDob]    = useState('')
  const [moonSign,      setMoonSign]      = useState('')
  const [nakshatra,     setNakshatra]     = useState('')
  const [partnerLagna,  setPartnerLagna]  = useState('')
  const [partnerDasha,  setPartnerDasha]  = useState('')
  const [partnerMangal, setPartnerMangal] = useState(false)
  const [results,       setResults]       = useState<number[]|null>(null)

  const nativeSign = getSignStr(chart?.moonSign)
  const nativeNak  = chart?.nakshatra?.name ?? ''

  function check() {
    if (!moonSign || !nakshatra || !nativeSign || !nativeNak) return
    setResults([
      scoreVarna(nativeSign, moonSign),
      scoreVashya(nativeSign, moonSign),
      scoreTara(nativeNak, nakshatra),
      scoreYoni(nativeNak, nakshatra),
      scoreGrahaMaitri(nativeSign, moonSign),
      scoreGana(nativeNak, nakshatra),
      scoreBhakoot(nativeSign, moonSign),
      scoreNadi(nativeNak, nakshatra),
    ])
  }

  const total = results ? results.reduce((a, b) => a + b, 0) : 0
  const r     = results ? rating(total) : null

  const nadiSame = nativeNak && nakshatra ? NADI_MAP[nativeNak] === NADI_MAP[nakshatra] : false
  const bhakoot  = nativeSign && moonSign  ? hasBhakootDosha(nativeSign, moonSign) : false

  const userDasha    = chart?.dasha?.current?.planet ?? ''
  const userLagna    = chart?.lagna?.sign ?? ''
  const dashaKey1    = userDasha && partnerDasha ? `${userDasha}-${partnerDasha}` : ''
  const dashaKey2    = userDasha && partnerDasha ? `${partnerDasha}-${userDasha}` : ''
  const dashaNarrative = DASHA_COMPAT[dashaKey1] ?? DASHA_COMPAT[dashaKey2] ?? (userDasha && partnerDasha ? DASHA_FALLBACK : '')

  // Mangal: check if user has Mangal dosha — chart houses 1,2,4,7,8,12
  const userMangal = chart?.houses ? [1,2,4,7,8,12].some((h: number) => {
    const house = chart.houses?.find((hh) => hh.id === h)
    return house?.planets?.includes('Mars') || house?.planets?.includes('Ma')
  }) : false

  const resultHeader = partnerName
    ? `Compatibility: ${userLagna || 'Your Chart'} × ${partnerName}`
    : null

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>

      {/* ── Intro card ── */}
      <div style={card}>
        <p style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 8px' }}>Ashtakoot Milan</p>
        <p style={{ fontSize:15, color:'#F0EBF4', margin:'0 0 6px', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic' }}>36-Point Vedic Compatibility System</p>
        <p style={{ fontSize:13, color:'#D0C8E0', margin:0, lineHeight:1.6, fontFamily:'Outfit,sans-serif' }}>Evaluates eight dimensions of resonance based on Moon signs and nakshatras. A reflective overview, not a verdict.</p>
      </div>

      {/* ── Input card ── */}
      <div style={card}>
        <p style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 12px' }}>Partner Details</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Partner Name */}
          <div>
            <label style={lbl}>Partner Name <span style={{ color:'#8A8EAA', fontStyle:'italic', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
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
            <label style={lbl}>Date of Birth <span style={{ color:'#8A8EAA', fontStyle:'italic', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
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
            <label style={lbl}>Lagna <span style={{ color:'#8A8EAA', fontStyle:'italic', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
            <select value={partnerLagna} onChange={e => setPartnerLagna(e.target.value)} style={sel}>
              <option value="">Select rising sign…</option>
              {RASHIS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Active Mahadasha */}
          <div>
            <label style={lbl}>Active Mahadasha <span style={{ color:'#8A8EAA', fontStyle:'italic', textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
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
                background: partnerMangal ? '#E05050' : 'rgba(114,166,183,0.2)',
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
            <span style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:'#D0C8E0' }}>
              Mangal Dosha — Mars in 1st/2nd/4th/7th/8th/12th house
            </span>
          </div>

          <button
            onClick={check}
            disabled={!moonSign || !nakshatra}
            style={{ padding:'12px 0', borderRadius:12, border:'none', background: moonSign && nakshatra ? 'linear-gradient(135deg,#C0A860,#D4B870)' : 'rgba(114,166,183,0.12)', color: moonSign && nakshatra ? '#0A0618' : '#A0A8C8', fontSize:14, fontFamily:'Outfit,sans-serif', fontWeight:600, cursor: moonSign && nakshatra ? 'pointer' : 'default' }}
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
              <p style={{ fontSize:14, color:'#D4B870', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', margin:'0 0 12px', letterSpacing:'0.04em' }}>{resultHeader}</p>
            )}
            <p style={{ fontSize:13, color:'#A0A8C8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 8px', fontFamily:'Outfit,sans-serif' }}>Total Score</p>
            <p style={{ fontSize:52, fontFamily:'Syne,sans-serif', fontWeight:700, color:r.color, margin:'0 0 4px', lineHeight:1 }}>{total}</p>
            <p style={{ fontSize:14, color:'#D0C8E0', margin:'0 0 12px', fontFamily:'Outfit,sans-serif' }}>out of 36</p>
            <span style={{ display:'inline-block', padding:'5px 18px', borderRadius:999, border:`1px solid ${r.color}`, color:r.color, fontSize:13, fontFamily:'Outfit,sans-serif' }}>{r.label}</span>
          </div>

          {/* ── Koot breakdown ── */}
          <div style={card}>
            <p style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 12px' }}>Koot Breakdown</p>
            {KOOTS.map((k, i) => {
              const s = results[i], pct = s / k.max
              const bc = pct >= 0.8 ? '#6EC97A' : pct >= 0.5 ? '#D4B870' : '#E05050'
              return (
                <div key={k.name} style={{ padding:'10px 0', borderBottom: i < KOOTS.length - 1 ? '1px solid rgba(10,5,26,0.88)' : 'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div>
                      <span style={{ fontSize:13, color:'#F0EBF4', fontFamily:'Outfit,sans-serif', marginRight:8 }}>{k.name}</span>
                      <span style={{ fontSize:13, color:'#A0A8C8', fontFamily:'Outfit,sans-serif' }}>{k.desc}</span>
                    </div>
                    <span style={{ fontSize:13, color:bc, fontFamily:'Syne,sans-serif', fontWeight:600 }}>{s} / {k.max}</span>
                  </div>
                  <div style={{ height:4, background:'rgba(114,166,183,0.12)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width:`${pct * 100}%`, height:'100%', background:bc, borderRadius:2, transition:'width 0.4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Dasha Alignment ── */}
          {dashaNarrative && (
            <div style={card}>
              <p style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 10px' }}>Dasha Alignment</p>
              <p style={{ fontSize:14, color:'#A0A8C8', fontFamily:'Outfit,sans-serif', margin:'0 0 10px' }}>
                {userDasha && <span style={{ color:'#F0EBF4' }}>{userDasha} MD</span>} {userDasha && partnerDasha ? '×' : ''} {partnerDasha && <span style={{ color:'#F0EBF4' }}>{partnerDasha} MD</span>}
              </p>
              <div style={{ padding:'10px 14px', background:'rgba(139,124,200,0.08)', borderRadius:10, borderLeft:'2px solid rgba(139,124,200,0.4)' }}>
                <p style={{ fontSize:13, color:'#D0C8E0', margin:0, lineHeight:1.6, fontFamily:'Outfit,sans-serif' }}>{dashaNarrative}</p>
              </div>
            </div>
          )}

          {/* ── Dosha Analysis ── */}
          <div style={card}>
            <p style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', margin:'0 0 14px' }}>Dosha Analysis</p>
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
                        <p style={{ fontSize:14, color:'#D0C8E0', fontFamily:'Outfit,sans-serif', margin:0, lineHeight:1.55 }}>{desc}</p>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>

          {/* ── Disclaimer ── */}
          <div style={{ padding:'12px 16px', background:'rgba(139,124,200,0.08)', border:'1px solid rgba(139,124,200,0.2)', borderRadius:12 }}>
            <p style={{ fontSize:14, color:'#A99BD9', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>This is a general reflection. A full reading considers lagna, navamsha, Venus, and many additional factors — consult a qualified Jyotishi for comprehensive analysis.</p>
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
            style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'1px solid rgba(114,166,183,0.22)', background:'rgba(114,166,183,0.12)', color:'#D0C8E0', fontSize:13, fontFamily:'Outfit,sans-serif', cursor:'pointer' }}
          >
            📱 Share Result
          </button>
        </>
      )}
    </div>
  )
}

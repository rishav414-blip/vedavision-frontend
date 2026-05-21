import React from 'react'
import { motion } from 'framer-motion'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  gold: '#D4B870', goldDim: '#A08050', violet: '#8B7CC8', violet2: '#A99BD9',
  txt: '#F0EBF4', txt2: '#B0A0C8', txt3: '#8090B5',
  cardBg: 'rgba(255,255,255,0.04)', cardBdr: 'rgba(255,255,255,0.08)',
}

const PLANET_COLORS: Record<string, string> = {
  Sun:'#F5C842', Moon:'#D0D8F0', Mars:'#E05050', Mercury:'#7EC8A0',
  Jupiter:'#F0A830', Venus:'#E48DB0', Saturn:'#A08050', Rahu:'#8855CC', Ketu:'#CC8855',
}
const PLANET_GLYPHS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
}

const glass: React.CSSProperties = { background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: 16, padding: 20 }
const lbl: React.CSSProperties  = { fontFamily:'Syne,sans-serif', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:T.gold, marginBottom:10, display:'block' }

const container = { hidden:{}, show:{ transition:{ staggerChildren:0.08 } } }
const item = { hidden:{ opacity:0, y:10 }, show:{ opacity:1, y:0, transition:{ duration:0.35, ease:'easeOut' } } }

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(start?:string, end?:string) {
  if(!start||!end) return 0
  const s=new Date(start).getTime(), e=new Date(end).getTime(), n=Date.now()
  return Math.max(0,Math.min(100,((n-s)/(e-s))*100))
}
function yr(iso?:string){ if(!iso) return '—'; return new Date(iso).getFullYear().toString() }

function dailyScore(chart: ChartData|null): { score:number; label:string; color:string; border:string } {
  // Deterministic score from today + dasha planet
  const planet = chart?.dasha?.current?.planet ?? 'Saturn'
  const seed = [...planet].reduce((a,c)=>a+c.charCodeAt(0),0)
  const today = new Date(); const d = today.getDate()+today.getMonth()*31
  const raw = ((seed*7+d*13)%100+100)%100
  if(raw>=70) return { score:raw, label:'Green Day', color:'#6EC97A', border:'rgba(110,201,122,0.3)' }
  if(raw>=40) return { score:raw, label:'Neutral Day', color:'#F0A830', border:'rgba(240,168,48,0.3)' }
  return { score:raw, label:'Caution Day', color:'#E05050', border:'rgba(224,80,80,0.3)' }
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChartData {
  native?:   { name?:string; dob?:string; tob?:string; pob?:string }
  lagna?:    { sign?:string; signEn?:string; lord?:string; degree?:string }
  moonSign?: { sign?:string; signEn?:string }
  sunSign?:  { sign?:string; signEn?:string }
  nakshatra?:{ name?:string; pada?:number; lord?:string; theme?:string }
  dasha?:    { current?:{planet?:string;start?:string;end?:string}; antardasha?:{planet?:string;end?:string}; sequence?:{planet:string;years:number;start:string;end:string}[] }
  yoga?:     string[]
  planetTable?: { planet:string; sign:string; house:number; dignity:string }[]
  karakas?:  { atmakaraka?:{planet_name?:string}; amatyakaraka?:{planet_name?:string} }
  ak?:       string
  amk?:      string
  wealthScore?: { total?:number }
  chartStrength?: number
}

// ── KPI Planet Card ───────────────────────────────────────────────────────────
function PlanetKPI({ planet, label, start, end, pctVal }: { planet?:string; label:string; start?:string; end?:string; pctVal?:number }) {
  const color = PLANET_COLORS[planet??''] ?? T.gold
  const glyph = PLANET_GLYPHS[planet??''] ?? '✦'
  return (
    <div style={{ flex:1, minWidth:0, background:`rgba(0,0,0,0.18)`, border:`1px solid ${color}30`, borderRadius:14, padding:'18px 16px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:`radial-gradient(circle at 80% 0%,${color}18,transparent 70%)`, pointerEvents:'none' }} />
      <span style={{ fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:color, fontFamily:'Outfit,sans-serif', fontWeight:600, opacity:0.85 }}>{label}</span>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8, marginBottom:6 }}>
        <span style={{ fontSize:36, color, lineHeight:1, fontFamily:'serif' }}>{glyph}</span>
        <span style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color, letterSpacing:'-0.02em' }}>{planet ?? '—'}</span>
      </div>
      {start && end && (
        <>
          <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden', marginBottom:4 }}>
            <div style={{ width:`${pctVal??0}%`, height:'100%', background:color, borderRadius:99, transition:'width 0.6s ease' }} />
          </div>
          <span style={{ fontSize:10, color:T.txt3, fontFamily:'Outfit,sans-serif' }}>{yr(start)} – {yr(end)} · {(pctVal??0).toFixed(0)}% elapsed</span>
        </>
      )}
    </div>
  )
}

// ── Daily Signal Card ─────────────────────────────────────────────────────────
function DailySignalCard({ chart }: { chart:ChartData|null }) {
  const sig = dailyScore(chart)
  const today = new Date().toLocaleDateString('en-IN',{ weekday:'long', day:'numeric', month:'long' })
  return (
    <motion.div variants={item} style={{ ...glass, borderLeft:`3px solid ${sig.border.replace('0.3)','0.8)')}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <span style={lbl}>Today · {today}</span>
          <p style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:sig.color, margin:'0 0 4px' }}>{sig.label}</p>
          <p style={{ fontSize:12, color:T.txt3, margin:0, fontFamily:'Outfit,sans-serif' }}>Score based on active daśā period and lunar cycle</p>
        </div>
        <div style={{ textAlign:'center', flexShrink:0, marginLeft:20 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:`${sig.color}18`, border:`2px solid ${sig.color}`, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:800, color:sig.color, lineHeight:1 }}>{sig.score}</span>
            <span style={{ fontSize:8, color:sig.color, letterSpacing:'0.08em' }}>/ 100</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Planet Coins Grid ─────────────────────────────────────────────────────────
function PlanetCoinsGrid({ chart }: { chart:ChartData|null }) {
  const PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
  const table = chart?.planetTable ?? []
  return (
    <motion.div variants={item} style={glass}>
      <span style={lbl}>Nine Grahas</span>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(9,1fr)', gap:8 }}>
        {PLANETS.map(p => {
          const row = table.find(r=>r.planet===p)
          const color = PLANET_COLORS[p] ?? T.gold
          const glyph = PLANET_GLYPHS[p] ?? '✦'
          const isExalted = row?.dignity==='Exalted'
          const isOwn = row?.dignity==='Own Sign'
          const isDeb = row?.dignity==='Debilitated'
          return (
            <div key={p} title={`${p} · ${row?.sign ?? '?'} · H${row?.house ?? '?'} · ${row?.dignity ?? ''}`}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'default' }}>
              <div style={{
                width:40, height:40, borderRadius:'50%',
                background:`${color}14`,
                border:`1.5px solid ${isExalted||isOwn ? color : color+'40'}`,
                boxShadow: isExalted ? `0 0 12px ${color}40` : 'none',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color,
                position:'relative',
              }}>
                {glyph}
                {isDeb && <span style={{ position:'absolute', bottom:-2, right:-2, fontSize:8, background:'#E05050', borderRadius:'50%', width:12, height:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>↓</span>}
                {isExalted && <span style={{ position:'absolute', bottom:-2, right:-2, fontSize:8, background:'#6EC97A', borderRadius:'50%', width:12, height:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>↑</span>}
              </div>
              <span style={{ fontSize:9, color:T.txt3, fontFamily:'Outfit,sans-serif', textAlign:'center' }}>{row?.sign?.slice(0,3) ?? '—'}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Identity Strip ────────────────────────────────────────────────────────────
function IdentityStrip({ chart }: { chart:ChartData|null }) {
  const name    = chart?.native?.name ?? 'Your Chart'
  const lagna   = chart?.lagna?.signEn ?? chart?.lagna?.sign ?? '—'
  const moon    = chart?.moonSign?.signEn ?? chart?.moonSign?.sign ?? '—'
  const nakName = chart?.nakshatra?.name ?? '—'
  const nakPada = chart?.nakshatra?.pada
  const ak      = chart?.karakas?.atmakaraka?.planet_name ?? (chart as any)?.ak
  const amk     = chart?.karakas?.amatyakaraka?.planet_name ?? (chart as any)?.amk
  const strength = chart?.chartStrength
  const wealth   = chart?.wealthScore?.total

  return (
    <motion.div variants={item} style={{ ...glass, borderTop:`2px solid rgba(212,184,112,0.3)` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, color:T.txt, margin:'0 0 6px', letterSpacing:'-0.02em' }}>{name}</h2>
          <p style={{ color:T.txt2, fontSize:13, margin:'0 0 8px', fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>
            Lagna: <strong style={{color:T.txt}}>{lagna}</strong> · {nakName}{nakPada ? ` pada ${nakPada}` : ''} · Moon: <strong style={{color:T.txt}}>{moon}</strong>
          </p>
          {(ak||amk) && (
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {ak  && <span style={{ fontSize:12, color:T.txt3, fontFamily:'Outfit,sans-serif' }}><span style={{color:T.gold,fontWeight:600}}>AK</span> {ak}</span>}
              {amk && <span style={{ fontSize:12, color:T.txt3, fontFamily:'Outfit,sans-serif' }}><span style={{color:T.violet2,fontWeight:600}}>AmK</span> {amk}</span>}
            </div>
          )}
        </div>
        {(strength!=null||wealth!=null) && (
          <div style={{ display:'flex', gap:12 }}>
            {strength!=null && (
              <div style={{ textAlign:'center', padding:'10px 16px', background:'rgba(139,124,200,0.08)', border:'1px solid rgba(139,124,200,0.2)', borderRadius:10 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:T.violet }}>{strength}</div>
                <div style={{ fontSize:10, color:T.txt3, fontFamily:'Outfit,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase' as const }}>Strength</div>
              </div>
            )}
            {wealth!=null && (
              <div style={{ textAlign:'center', padding:'10px 16px', background:'rgba(212,184,112,0.08)', border:'1px solid rgba(212,184,112,0.2)', borderRadius:10 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:T.gold }}>{wealth}</div>
                <div style={{ fontSize:10, color:T.txt3, fontFamily:'Outfit,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase' as const }}>Wealth</div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Dasha Timeline Rail ───────────────────────────────────────────────────────
function DashaTimeline({ chart }: { chart:ChartData|null }) {
  const seq = chart?.dasha?.sequence ?? []
  const current = chart?.dasha?.current?.planet
  const now = Date.now()
  if (!seq.length) return null

  return (
    <motion.div variants={item} style={glass}>
      <span style={lbl}>Vimśottarī Timeline</span>
      <div style={{ overflowX:'auto', paddingBottom:8, scrollbarWidth:'none' as const }}>
        <div style={{ display:'flex', gap:0, minWidth:'max-content', borderRadius:8, overflow:'hidden', height:36, border:`1px solid ${T.cardBdr}` }}>
          {seq.map((p,i) => {
            const color = PLANET_COLORS[p.planet] ?? T.gold
            const isCurrent = p.planet === current
            const start = new Date(p.start).getTime()
            const end   = new Date(p.end).getTime()
            const isPast = end < now
            const isFuture = start > now
            return (
              <div key={i} title={`${p.planet} ${yr(p.start)}–${yr(p.end)}`}
                style={{
                  flex: p.years,
                  minWidth: 32,
                  background: isCurrent ? `${color}22` : isPast ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderRight: i < seq.length-1 ? `1px solid ${T.cardBdr}` : 'none',
                  borderTop: isCurrent ? `2px solid ${color}` : '2px solid transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, color: isCurrent ? color : isPast ? T.txt3+'80' : T.txt3,
                  fontFamily:'Outfit,sans-serif', whiteSpace:'nowrap' as const,
                  transition:'background 0.2s',
                  cursor:'default',
                  fontWeight: isCurrent ? 700 : 400,
                }}>
                {PLANET_GLYPHS[p.planet]??''} {p.planet.slice(0,2)} {!isFuture && !isPast ? '' : yr(p.start)}
              </div>
            )
          })}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
          <span style={{ fontSize:10, color:T.txt3, fontFamily:'Outfit,sans-serif' }}>{yr(seq[0]?.start)}</span>
          <span style={{ fontSize:10, color:T.gold, fontFamily:'Outfit,sans-serif' }}>Current: {current} MD</span>
          <span style={{ fontSize:10, color:T.txt3, fontFamily:'Outfit,sans-serif' }}>{yr(seq[seq.length-1]?.end)}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Yogas ─────────────────────────────────────────────────────────────────────
function YogasCard({ chart }: { chart:ChartData|null }) {
  const yogas = chart?.yoga ?? []
  if (!yogas.length) return null
  return (
    <motion.div variants={item} style={glass}>
      <span style={lbl}>Active Yogas — {yogas.length} detected</span>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        {yogas.map(y => (
          <span key={y} style={{ background:'rgba(139,124,200,0.12)', border:`1px solid rgba(139,124,200,0.35)`, borderRadius:20, padding:'5px 14px', fontSize:12, color:T.txt2, fontFamily:'Outfit,sans-serif' }}>{y}</span>
        ))}
      </div>
    </motion.div>
  )
}

// ── Nakshatra ─────────────────────────────────────────────────────────────────
function NakshatraCard({ chart }: { chart:ChartData|null }) {
  const nak = chart?.nakshatra
  if (!nak?.name) return null
  const pada = nak.pada ?? 1
  return (
    <motion.div variants={item} style={{ ...glass, background:'rgba(212,184,112,0.04)', borderColor:'rgba(212,184,112,0.15)' }}>
      <span style={lbl}>Birth Nakṣatra</span>
      <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
        <div>
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', fontSize:32, color:T.txt, margin:'0 0 6px', lineHeight:1.1 }}>{nak.name}</p>
          <div style={{ display:'flex', gap:5, alignItems:'center', marginBottom:6 }}>
            {[1,2,3,4].map(d=>(
              <span key={d} style={{ width:10, height:10, borderRadius:'50%', background:d===pada?T.gold:'rgba(255,255,255,0.10)', border:`1px solid ${d===pada?T.gold:'rgba(255,255,255,0.15)'}`, display:'inline-block' }}/>
            ))}
            <span style={{ color:T.txt3, fontSize:11, marginLeft:2, fontFamily:'Outfit,sans-serif' }}>pada {pada}</span>
          </div>
          {nak.lord && <p style={{ color:T.txt2, fontSize:13, margin:'0 0 4px', fontFamily:'Outfit,sans-serif' }}>Lord: <strong style={{color:T.gold}}>{nak.lord}</strong></p>}
          {nak.theme && <p style={{ color:T.txt3, fontSize:12, fontStyle:'italic', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.6, maxWidth:420 }}>{nak.theme}</p>}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OverviewTab({ chart }: { chart:ChartData|null }) {
  const current    = chart?.dasha?.current
  const antardasha = chart?.dasha?.antardasha
  const mdPct      = pct(current?.start, current?.end)

  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

      {/* ── Identity strip ── */}
      <IdentityStrip chart={chart} />

      {/* ── KPI row: MD + AD ── */}
      <motion.div variants={item} style={{ display:'flex', gap:12 }}>
        <PlanetKPI planet={current?.planet} label="Mahādaśā" start={current?.start} end={current?.end} pctVal={mdPct} />
        <PlanetKPI planet={antardasha?.planet} label="Antardaśā" end={antardasha?.end} />
      </motion.div>

      {/* ── Daily signal ── */}
      <DailySignalCard chart={chart} />

      {/* ── Planet coins ── */}
      <PlanetCoinsGrid chart={chart} />

      {/* ── Dasha timeline rail ── */}
      <DashaTimeline chart={chart} />

      {/* ── Yogas ── */}
      <YogasCard chart={chart} />

      {/* ── Nakshatra ── */}
      <NakshatraCard chart={chart} />

      {/* ── Share ── */}
      <motion.button variants={item}
        onClick={async () => {
          const name = chart?.native?.name ?? 'My Chart'
          const lagna = chart?.lagna?.signEn ?? chart?.lagna?.sign ?? '—'
          const nak = chart?.nakshatra?.name ?? '—'
          const md = current?.planet ?? '—'
          const ak = chart?.karakas?.atmakaraka?.planet_name ?? (chart as any)?.ak ?? '—'
          const text = `✦ ${name}'s Vedic Chart\nLagna: ${lagna} · Nakshatra: ${nak}\nMahādaśā: ${md} · Ātmakāraka: ${ak}\n\nExplore yours → vedavision-app.pages.dev`
          if (navigator.share) { try { await navigator.share({ text }); return } catch {} }
          await navigator.clipboard.writeText(text).catch(()=>{})
          window.showToast?.('Chart summary copied to clipboard', 'success')
        }}
        style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'11px 0', width:'100%', color:T.txt3, fontSize:13, fontFamily:'Outfit,sans-serif', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
      >
        📤 Share Summary Card
      </motion.button>
    </motion.div>
  )
}

import React, { useState, useEffect, useRef } from 'react'

interface ChartData { native?: { name?: string }; lagna?: { sign?: string; lord?: string }; dasha?: { current?: { planet?: string } }; nakshatra?: { name?: string; lord?: string } }
interface AltarTabProps { chart: ChartData | null }

const PLANET_DATA: Record<string, { symbol: string; devanagari: string; romanised: string; day: string; dana: string; color: string; glowColor: string }> = {
  Sun:     { symbol:'☉', devanagari:'ॐ सूर्याय नमः',   romanised:'Om Suryaya Namah',      day:'Sunday',    dana:'Wheat or jaggery to the underprivileged', color:'#F5C842', glowColor:'rgba(245,200,66,0.25)' },
  Moon:    { symbol:'☽', devanagari:'ॐ सोमाय नमः',     romanised:'Om Somaya Namah',        day:'Monday',    dana:'Rice or milk to a family in need',        color:'#D0D8F0', glowColor:'rgba(208,216,240,0.2)' },
  Mars:    { symbol:'♂', devanagari:'ॐ अङ्गारकाय नमः', romanised:'Om Angarakaya Namah',    day:'Tuesday',   dana:'Red lentils (masoor dal)',                color:'#E05050', glowColor:'rgba(224,80,80,0.25)' },
  Mercury: { symbol:'☿', devanagari:'ॐ बुधाय नमः',     romanised:'Om Budhaya Namah',       day:'Wednesday', dana:'Green cloth or mung beans',              color:'#7EC8A0', glowColor:'rgba(126,200,160,0.2)' },
  Jupiter: { symbol:'♃', devanagari:'ॐ बृहस्पतये नमः', romanised:'Om Brihaspataye Namah',  day:'Thursday',  dana:'Yellow sweets or turmeric',              color:'#F0A830', glowColor:'rgba(240,168,48,0.25)' },
  Venus:   { symbol:'♀', devanagari:'ॐ शुक्राय नमः',   romanised:'Om Shukraya Namah',      day:'Friday',    dana:'White sweets or white cloth',            color:'#E48DB0', glowColor:'rgba(228,141,176,0.2)' },
  Saturn:  { symbol:'♄', devanagari:'ॐ शनये नमः',      romanised:'Om Shanaye Namah',       day:'Saturday',  dana:'Sesame seeds or iron to the poor',       color:'#A08050', glowColor:'rgba(160,128,80,0.2)' },
  Rahu:    { symbol:'☊', devanagari:'ॐ राहवे नमः',     romanised:'Om Rahave Namah',        day:'Saturday',  dana:'Black items — cloth, sesame',            color:'#8855CC', glowColor:'rgba(136,85,204,0.25)' },
  Ketu:    { symbol:'☋', devanagari:'ॐ केतवे नमः',     romanised:'Om Ketave Namah',        day:'Tuesday',   dana:'Blankets or grey cloth',                 color:'#CC8855', glowColor:'rgba(204,136,85,0.2)' },
}

const card: React.CSSProperties = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20 }
const label: React.CSSProperties = { fontSize:10, textTransform:'uppercase' as const, letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', marginBottom:12, display:'block' }

export default function AltarTab({ chart }: AltarTabProps) {
  const planet = chart?.dasha?.current?.planet ?? 'Sun'
  const data = PLANET_DATA[planet] ?? PLANET_DATA['Sun']
  const [count, setCount] = useState(0)
  const [celebrated, setCelebrated] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => { setCount(0); setCelebrated(false) }, [planet])

  function increment() {
    if (count >= 108) return
    const next = count + 1; setCount(next)
    if (next === 108) { setCelebrated(true); timer.current = setTimeout(() => setCelebrated(false), 4000) }
  }
  function reset() { setCount(0); setCelebrated(false); if (timer.current) clearTimeout(timer.current) }

  const pct = Math.min(count / 108, 1)
  const r = 54, circ = 2 * Math.PI * r

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>
      <div style={{ ...card, textAlign:'center', padding:'32px 24px' }}>
        <span style={label}>Digital Altar</span>
        <div style={{ width:96, height:96, borderRadius:'50%', border:`2px solid ${data.color}`, boxShadow:`0 0 32px ${data.glowColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, color:data.color, margin:'0 auto 16px', background:`radial-gradient(circle, ${data.glowColor} 0%, transparent 70%)` }}>{data.symbol}</div>
        <p style={{ fontSize:18, color:'#F0EBF4', fontFamily:'Outfit,sans-serif', fontWeight:500, margin:'0 0 2px' }}>{planet}</p>
        <p style={{ fontSize:11, color:'#B0A0C8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 20px', fontFamily:'Outfit,sans-serif' }}>Mahādaśā</p>
        <p style={{ fontSize:28, color:'#D4B870', fontFamily:'"Cormorant Garamond",serif', lineHeight:1.5, margin:'0 0 8px' }}>{data.devanagari}</p>
        <p style={{ fontSize:13, color:'#B0A0C8', fontFamily:'Outfit,sans-serif', margin:0 }}>{data.romanised}</p>
      </div>

      <div style={{ ...card, textAlign:'center' }}>
        <span style={label}>Japa Counter — 108 Repetitions</span>
        <div style={{ position:'relative', width:140, height:140, margin:'0 auto 16px' }}>
          <svg width={140} height={140} style={{ transform:'rotate(-90deg)' }}>
            <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
            <circle cx={70} cy={70} r={r} fill="none" stroke={celebrated ? '#6EC97A' : '#D4B870'} strokeWidth={6} strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round" style={{ transition:'stroke-dasharray 0.25s ease, stroke 0.4s' }} />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:36, fontFamily:'Syne,sans-serif', fontWeight:700, color:celebrated?'#6EC97A':'#D4B870', lineHeight:1 }}>{count}</span>
            <span style={{ fontSize:12, color:'#B0A0C8', fontFamily:'Outfit,sans-serif' }}>/ 108</span>
          </div>
        </div>
        {celebrated && <p style={{ color:'#6EC97A', fontFamily:'Outfit,sans-serif', fontSize:14, marginBottom:12 }}>✓ 108 complete — well done</p>}
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={increment} disabled={count>=108} style={{ padding:'12px 32px', borderRadius:999, border:`1.5px solid ${count>=108?'rgba(212,184,112,0.3)':'#D4B870'}`, background:'transparent', color:count>=108?'rgba(212,184,112,0.4)':'#D4B870', fontSize:18, fontFamily:'Outfit,sans-serif', cursor:count>=108?'default':'pointer' }}>+ 1</button>
          <button onClick={reset} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(128,144,181,0.3)', background:'transparent', color:'#8090B5', fontSize:12, fontFamily:'Outfit,sans-serif', cursor:'pointer' }}>Reset</button>
        </div>
      </div>

      <div style={card}>
        <span style={label}>Practice Guidance</span>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', gap:12 }}><span style={{ fontSize:18 }}>📅</span><div><p style={{ fontSize:11, color:'#8090B5', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 2px', fontFamily:'Outfit,sans-serif' }}>Auspicious Day</p><p style={{ fontSize:14, color:'#F0EBF4', margin:0, fontFamily:'Outfit,sans-serif' }}>{data.day}</p></div></div>
          <div style={{ display:'flex', gap:12 }}><span style={{ fontSize:18 }}>🤲</span><div><p style={{ fontSize:11, color:'#8090B5', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 2px', fontFamily:'Outfit,sans-serif' }}>Dāna</p><p style={{ fontSize:14, color:'#F0EBF4', margin:0, fontFamily:'Outfit,sans-serif' }}>{data.dana}</p></div></div>
        </div>
        <p style={{ fontSize:11, color:'#8090B5', fontStyle:'italic', marginTop:16, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)', fontFamily:'Outfit,sans-serif' }}>Traditional suggestions — adapt to your constitution.</p>
      </div>
    </div>
  )
}

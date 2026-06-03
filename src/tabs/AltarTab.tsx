import React, { useState, useEffect, useRef } from 'react'
import type { ChartData } from '@/lib/chartTypes'

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

// ─── Hora / Day logic ─────────────────────────────────────────────────────────
const HORA_ORDER = ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars']
const DAY_RULERS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
const PLANET_COLORS_ALTAR: Record<string,string> = {
  Sun:'#F5C842', Moon:'#D0D8F0', Mars:'#E05050', Mercury:'#7EC8A0',
  Jupiter:'#F0A830', Venus:'#E48DB0', Saturn:'#A08050', Rahu:'#8855CC', Ketu:'#CC8855'
}
const FASTING: Record<string,string> = {
  Sun:"Sun's day — fast or eat light. Offer water to the sun at dawn.",
  Moon:"Moon's day — avoid salty food. White foods and milk are traditional.",
  Mars:"Mars's day — avoid meat. Red lentils are appropriate.",
  Mercury:"Mercury's day — light vegetarian meal. Green foods favoured.",
  Jupiter:"Jupiter's day — fast or eat once. Banana and turmeric are traditional.",
  Venus:"Venus's day — avoid excess. Sweet foods in moderation.",
  Saturn:"Saturn's day — fast or eat once at dusk. Sesame and black lentils are traditional.",
}

function getCurrentHora(): { planet: string; horaNum: number } {
  const now = new Date()
  const dayRuler = DAY_RULERS[now.getDay()]
  const sunrise = new Date(now); sunrise.setHours(6,0,0,0)
  const horaNum = Math.max(0, Math.floor((now.getTime() - sunrise.getTime()) / 3600000)) % 24
  const planet = HORA_ORDER[(HORA_ORDER.indexOf(dayRuler) + horaNum) % 7]
  return { planet, horaNum }
}

// ─── Planet frequencies ───────────────────────────────────────────────────────
const PLANET_FREQ: Record<string,number> = {
  Sun:126.22, Moon:210.42, Mars:144.72, Mercury:141.27,
  Jupiter:183.58, Venus:221.23, Saturn:147.85, Rahu:168.05, Ketu:168.05
}

const card: React.CSSProperties = { background:'rgba(8,4,22,0.72)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', border:'1px solid rgba(114,166,183,0.2)', borderRadius:16, padding:20, boxShadow:'0 4px 30px rgba(0,0,0,0.55)' }
const lbl: React.CSSProperties = { fontSize:12, textTransform:'uppercase' as const, letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', marginBottom:12, display:'block' }

export default function AltarTab({ chart }: AltarTabProps) {
  const activePlanet = chart?.dasha?.current?.planet ?? 'Sun'
  const data = PLANET_DATA[activePlanet] ?? PLANET_DATA['Sun']

  // Japa counter
  const [beadCount, setBeadCount] = useState(0)
  const [celebrated, setCelebrated] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null)

  // Hora state
  const [hora, setHora] = useState(getCurrentHora)
  const todayRuler = DAY_RULERS[new Date().getDay()]

  // Audio state
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioCtxRef = useRef<AudioContext|null>(null)
  const sourceRef   = useRef<OscillatorNode|null>(null)
  const gainRef     = useRef<GainNode|null>(null)

  // Reset counter when planet changes
  useEffect(() => { setBeadCount(0); setCelebrated(false) }, [activePlanet])

  // Hora auto-update every 60s
  useEffect(() => {
    const id = setInterval(() => setHora(getCurrentHora()), 60000)
    return () => clearInterval(id)
  }, [])

  // Stop audio on unmount
  useEffect(() => {
    return () => { stopAudio() }
  }, [])

  function startAudio(planet: string) {
    stopAudio()
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = PLANET_FREQ[planet] ?? 136.1
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    audioCtxRef.current = ctx
    sourceRef.current   = osc
    gainRef.current     = gain
    setAudioPlaying(true)
  }

  function stopAudio() {
    if (gainRef.current && audioCtxRef.current) {
      const gain = gainRef.current
      const ctx  = audioCtxRef.current
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      setTimeout(() => {
        try { sourceRef.current?.stop(); ctx.close() } catch {}
        audioCtxRef.current = null; sourceRef.current = null; gainRef.current = null
      }, 550)
    }
    setAudioPlaying(false)
  }

  function toggleAudio() {
    if (audioPlaying) { stopAudio() } else { startAudio(activePlanet) }
  }

  function increment() {
    if (beadCount >= 108) return
    const next = beadCount + 1
    setBeadCount(next)
    if (next === 108) {
      setCelebrated(true)
      timer.current = setTimeout(() => setCelebrated(false), 4000)
    }
    // Auto-start audio on first bead
    if (!audioPlaying && next === 1) startAudio(activePlanet)
  }

  function reset() {
    setBeadCount(0); setCelebrated(false)
    if (timer.current) clearTimeout(timer.current)
  }

  const horaColor = PLANET_COLORS_ALTAR[hora.planet] ?? '#D4B870'
  const freq = PLANET_FREQ[activePlanet] ?? 136.1

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>

      {/* ── Hora Card ── */}
      <div style={{ ...card, borderLeft:`3px solid ${horaColor}` }}>
        <span style={lbl}>Current Hora</span>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div>
            <p style={{ fontSize:28, fontFamily:'Syne,sans-serif', fontWeight:700, color:horaColor, margin:'0 0 2px', lineHeight:1 }}>{hora.planet}</p>
            <p style={{ fontSize:13, color:'#A0A8C8', margin:0, fontFamily:'Outfit,sans-serif' }}>Hour {hora.horaNum + 1} of the day</p>
          </div>
          <div style={{ flex:1, padding:'10px 14px', background:'rgba(8,4,22,0.88)', border:'1px solid rgba(114,166,183,0.15)', borderRadius:10 }}>
            <p style={{ fontSize:12, color:'#A0A8C8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px', fontFamily:'Outfit,sans-serif' }}>Today — {todayRuler}'s day</p>
            <p style={{ fontSize:14, color:'#D0C8E0', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.5 }}>{FASTING[todayRuler]}</p>
          </div>
        </div>
      </div>

      {/* ── Mantra / Altar card ── */}
      <div style={{ ...card, textAlign:'center', padding:'32px 24px' }}>
        <span style={lbl}>Digital Altar</span>
        <div style={{ width:96, height:96, borderRadius:'50%', border:`2px solid ${data.color}`, boxShadow:`0 0 32px ${data.glowColor}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, color:data.color, margin:'0 auto 16px', background:`radial-gradient(circle, ${data.glowColor} 0%, transparent 70%)` }}>{data.symbol}</div>
        <p style={{ fontSize:18, color:'#F0EBF4', fontFamily:'Outfit,sans-serif', fontWeight:500, margin:'0 0 2px' }}>{activePlanet}</p>
        <p style={{ fontSize:13, color:'#D0C8E0', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 20px', fontFamily:'Outfit,sans-serif' }}>Mahādaśā</p>
        <p style={{ fontSize:28, color:'#D4B870', fontFamily:'"Cormorant Garamond",serif', lineHeight:1.5, margin:'0 0 8px' }}>{data.devanagari}</p>
        <p style={{ fontSize:13, color:'#D0C8E0', fontFamily:'Outfit,sans-serif', margin:'0 0 16px' }}>{data.romanised}</p>

        {/* Audio toggle */}
        <button
          onClick={toggleAudio}
          style={{ padding:'8px 22px', borderRadius:999, border:`1px solid ${audioPlaying ? data.color+'88' : 'rgba(114,166,183,0.5)'}`, background: audioPlaying ? `${data.color}18` : 'rgba(10,5,26,0.6)', color: audioPlaying ? data.color : '#D0C8E0', fontSize:14, fontFamily:'Outfit,sans-serif', cursor:'pointer', transition:'all 0.2s' }}
        >
          {audioPlaying ? `⏸ Stop ${freq}Hz` : `🔊 Play ${freq}Hz`}
        </button>
      </div>

      {/* ── Japa Counter ── */}
      <div style={{ ...card, textAlign:'center' }}>
        <span style={lbl}>Japa Counter — 108 Repetitions</span>

        {/* Bead ring SVG */}
        <div style={{ margin:'0 auto 16px', width:80, height:80 }}>
          <svg width="80" height="80" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(114,166,183,0.2)" strokeWidth="4"/>
            <circle cx="28" cy="28" r="22" fill="none"
              stroke={celebrated ? '#6EC97A' : '#D4B870'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="138"
              strokeDashoffset={138 - (138 * beadCount / 108)}
              transform="rotate(-90 28 28)"
              style={{ transition:'stroke-dashoffset 0.3s ease, stroke 0.4s' }}
            />
            <text x="28" y="33" textAnchor="middle" fill={celebrated ? '#6EC97A' : '#D4B870'} fontSize="13" fontFamily="Syne,sans-serif" fontWeight="700">{beadCount}</text>
          </svg>
        </div>

        {beadCount === 108 && (
          <p style={{ color:'#6EC97A', fontFamily:'Outfit,sans-serif', fontSize:14, marginBottom:12 }}>🙏 108 complete</p>
        )}
        {celebrated && beadCount < 108 && (
          <p style={{ color:'#6EC97A', fontFamily:'Outfit,sans-serif', fontSize:14, marginBottom:12 }}>✓ 108 complete — well done</p>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={increment} disabled={beadCount>=108} style={{ padding:'12px 32px', borderRadius:999, border:`1.5px solid ${beadCount>=108?'rgba(212,184,112,0.3)':'#D4B870'}`, background:'transparent', color:beadCount>=108?'rgba(212,184,112,0.4)':'#D4B870', fontSize:18, fontFamily:'Outfit,sans-serif', cursor:beadCount>=108?'default':'pointer' }}>+ 1</button>
          <button onClick={reset} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(128,144,181,0.3)', background:'transparent', color:'#A0A8C8', fontSize:14, fontFamily:'Outfit,sans-serif', cursor:'pointer' }}>Reset</button>
        </div>
      </div>

      {/* ── Practice Guidance ── */}
      <div style={card}>
        <span style={lbl}>Practice Guidance</span>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', gap:12 }}><span style={{ fontSize:18 }}>📅</span><div><p style={{ fontSize:13, color:'#A0A8C8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 2px', fontFamily:'Outfit,sans-serif' }}>Auspicious Day</p><p style={{ fontSize:14, color:'#F0EBF4', margin:0, fontFamily:'Outfit,sans-serif' }}>{data.day}</p></div></div>
          <div style={{ display:'flex', gap:12 }}><span style={{ fontSize:18 }}>🤲</span><div><p style={{ fontSize:13, color:'#A0A8C8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 2px', fontFamily:'Outfit,sans-serif' }}>Dāna</p><p style={{ fontSize:14, color:'#F0EBF4', margin:0, fontFamily:'Outfit,sans-serif' }}>{data.dana}</p></div></div>
        </div>
        <p style={{ fontSize:13, color:'#A0A8C8', fontStyle:'italic', marginTop:16, paddingTop:12, borderTop:'1px solid rgba(114,166,183,0.12)', fontFamily:'Outfit,sans-serif' }}>Traditional suggestions — adapt to your constitution.</p>
      </div>

    </div>
  )
}

import React from 'react'

interface ChartData { lagna?: { sign?: string; lord?: string }; dasha?: { current?: { planet?: string } }; nakshatra?: { name?: string } }

const card: React.CSSProperties = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20 }
const lbl: React.CSSProperties = { fontSize:10, textTransform:'uppercase' as const, letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', marginBottom:12, display:'block' }

const ARCHETYPES = {
  Commander: { name:'Commander', icon:'⚔', color:'#E05050', description:'Mars and Sun energies mark your chart with directional force. You are drawn toward leadership through decisive action and structural authority.', strengths:['Strategic clarity','Physical vitality','Mobilising others','Tolerance for difficulty'] },
  Advisor:   { name:'Advisor', icon:'☿', color:'#7EC8A0', description:'Mercury and Jupiter shape your expression toward wisdom-transfer. You find your seat through counsel, synthesis, and the capacity to help others see clearly.', strengths:['Analytical precision','Ethical perspective','Long-view thinking','Communication of complexity'] },
  Nurturer:  { name:'Nurturer', icon:'☽', color:'#D0D8F0', description:'Moon and Venus orient your energy toward relational intelligence. Your influence moves through care, aesthetic refinement, and creating environments where others feel received.', strengths:['Emotional attunement','Creative sensitivity','Sustained care','Aesthetic discernment'] },
}

function deriveArchetype(lord?: string, planet?: string) {
  const set = [lord, planet].filter(Boolean) as string[]
  let c = 0, a = 0, n = 0
  for (const p of set) {
    if (['Sun','Mars'].includes(p)) c++
    else if (['Mercury','Jupiter'].includes(p)) a++
    else if (['Moon','Venus'].includes(p)) n++
  }
  if (c >= a && c >= n) return ARCHETYPES.Commander
  if (a >= n) return ARCHETYPES.Advisor
  return ARCHETYPES.Nurturer
}

const AK_THEMES: Record<string, { title: string; reflection: string }> = {
  Sun:     { title:'Soul seeking authentic self-expression', reflection:'The soul orients toward truth, authority, and genuine individuality. Its journey involves moving from approval-seeking toward a rooted sense of self.' },
  Moon:    { title:'Soul seeking belonging and inner peace', reflection:'The soul is drawn toward emotional safety and nurturing relationships. Its deepest inquiry touches the nature of receptivity.' },
  Mars:    { title:'Soul seeking purposeful action', reflection:'The soul carries an imperative toward decisive, ethical action. The inner work involves tempering will with discernment.' },
  Mercury: { title:'Soul seeking discernment and mastery', reflection:'The soul is animated by the love of understanding. Its refinement comes through distinguishing essential from trivial.' },
  Jupiter: { title:'Soul seeking wisdom and dharmic alignment', reflection:'The soul is oriented toward meaning and ethical integrity. It grows through embodying — not merely knowing — the principles it holds dear.' },
  Venus:   { title:'Soul seeking beauty, love, and harmony', reflection:'The soul moves through aesthetic and relational dimensions. Its deepest inquiry is learning to love without possessing.' },
  Saturn:  { title:'Soul seeking integrity through discipline', reflection:'The soul is tutored by consequence. Its path involves patient, sustained effort and faithfulness to what is real.' },
  Rahu:    { title:'Soul encountering the unfamiliar', reflection:'The soul is drawn into territory where prior conditioning offers no map. Its evolution comes through embracing uncertainty.' },
  Ketu:    { title:'Soul moving toward liberation', reflection:'The soul carries capacities already deeply developed. Its deepest inquiry is learning to release what it has already perfected.' },
}

const WEALTH_PATTERNS: Record<string, { title: string; description: string }> = {
  Aries:'Pioneer Builder,Artha energy flows through initiative and first-mover advantage.'.split(',').reduce((o,v,i) => i===0?{...o,title:v}:{...o,description:v},{}) as any,
  Taurus: { title:'Patient Accumulator', description:'Stability and tangible value drive accumulation through patience and mastery of material domains.' },
  Gemini: { title:'Knowledge Trader', description:'Information, networks, and adaptive skill form the core of artha flow. Multiple streams mark the wealth pattern.' },
  Cancer: { title:'Nourishing Steward', description:'Resources are gathered through care, emotional intelligence, and cultivation of trust.' },
  Leo: { title:'Sovereign Creator', description:'Creative output and visible contribution attract resources. Wealth is tied to authentic self-expression.' },
  Virgo: { title:'Artisan of Precision', description:'Skill refinement and service excellence build artha steadily through consistent quality.' },
  Libra: { title:'Harmony Architect', description:'Partnership, negotiation, and aesthetic domain drive resource flows.' },
  Scorpio: { title:'Depth Investigator', description:'Hidden resources, strategic depth, and transformative capacity shape the wealth pattern.' },
  Sagittarius: { title:'Expansionary Seeker', description:'Wisdom transmission, foreign connections, and philosophical vision drive artha.' },
  Capricorn: { title:'Structural Builder', description:'Sustained institutional effort and long-term architecture define the wealth pattern.' },
  Aquarius: { title:'Collective Innovator', description:'Network effects and unconventional thinking shape artha flow through collective service.' },
  Pisces: { title:'Liminal Creator', description:'Intuition, imagination, and transcendent domains orient artha through artistic or healing work.' },
}

export default function InsightsTab({ chart }: { chart: ChartData | null }) {
  const lord = chart?.lagna?.lord
  const sign = chart?.lagna?.sign
  const planet = chart?.dasha?.current?.planet
  const arch = deriveArchetype(lord, planet)
  const ak = AK_THEMES[lord ?? 'Sun'] ?? AK_THEMES['Sun']
  const wealth = WEALTH_PATTERNS[sign ?? ''] ?? { title:'Artha Pattern', description:'The 2nd and 11th houses reveal the texture of material flow. With fuller chart data, a more specific pattern can be surfaced.' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>
      <div style={card}>
        <span style={lbl}>Leadership Archetype</span>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', border:`2px solid ${arch.color}`, background:`rgba(0,0,0,0.2)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{arch.icon}</div>
          <div>
            <p style={{ fontSize:22, color:arch.color, fontFamily:'"Cormorant Garamond",serif', fontWeight:600, margin:'0 0 3px', fontStyle:'italic' }}>{arch.name}</p>
            <p style={{ fontSize:11, color:'#8090B5', margin:0, fontFamily:'Outfit,sans-serif' }}>Lagna lord: {lord ?? '—'} · Daśā: {planet ?? '—'}</p>
          </div>
        </div>
        <p style={{ fontSize:13, color:'#B0A0C8', lineHeight:1.7, margin:'0 0 14px', fontFamily:'Outfit,sans-serif' }}>{arch.description}</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {arch.strengths.map(s => <span key={s} style={{ padding:'4px 12px', borderRadius:999, background:`rgba(0,0,0,0.2)`, border:`1px solid ${arch.color}40`, color:arch.color, fontSize:12, fontFamily:'Outfit,sans-serif' }}>{s}</span>)}
        </div>
      </div>

      <div style={card}>
        <span style={lbl}>Ātmakāraka Reflection</span>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
          <span style={{ padding:'4px 14px', borderRadius:999, background:'rgba(212,184,112,0.12)', border:'1px solid rgba(212,184,112,0.3)', color:'#D4B870', fontSize:13, fontFamily:'Outfit,sans-serif', flexShrink:0 }}>{lord ?? 'Sun'}</span>
          <p style={{ fontSize:14, color:'#F0EBF4', margin:0, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', lineHeight:1.5 }}>{ak.title}</p>
        </div>
        <p style={{ fontSize:13, color:'#B0A0C8', lineHeight:1.7, margin:0, fontFamily:'Outfit,sans-serif' }}>{ak.reflection}</p>
      </div>

      <div style={card}>
        <span style={lbl}>Artha Focus — Wealth Pattern</span>
        <p style={{ fontSize:18, color:'#D4B870', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', margin:'0 0 10px' }}>{wealth.title}</p>
        <p style={{ fontSize:13, color:'#B0A0C8', lineHeight:1.7, margin:'0 0 12px', fontFamily:'Outfit,sans-serif' }}>{wealth.description}</p>
        <div style={{ padding:'10px 12px', background:'rgba(212,184,112,0.06)', borderRadius:10, borderLeft:'2px solid rgba(212,184,112,0.4)' }}>
          <p style={{ fontSize:12, color:'#B0A0C8', margin:0, fontFamily:'Outfit,sans-serif' }}>Primary artha houses — 2nd (Dhana), 10th (Karma), 11th (Labha) — are the core lens for wealth pattern analysis.</p>
        </div>
      </div>

      <p style={{ fontSize:11, color:'#8090B5', textAlign:'center', fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>These reflections surface symbolic patterns — not deterministic outcomes. The chart is a map; you are the territory.</p>
    </div>
  )
}

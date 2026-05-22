import React from 'react'

interface Karaka { planet_name?: string; sign?: string }
interface Karakas {
  atmakaraka?: Karaka; amatyakaraka?: Karaka; bhratrukaraka?: Karaka
  matrukaraka?: Karaka; putrakaraka?: Karaka; gnatikaraka?: Karaka; darakaraka?: Karaka
}
interface BNNTransit { transit: string; transitSign: string; natalContact: string; theme: string }
interface PlanetRow {
  planet: string; skt: string; glyph: string; sign: string; house: number
  dignity: string; color: string; notes: string
}
interface ChartData {
  lagna?: { sign?: string; lord?: string }
  dasha?: { current?: { planet?: string }; antardasha?: { planet?: string } }
  nakshatra?: { name?: string }
  karakas?: Karakas
  ak?: string
  bnnTransits?: BNNTransit[]
  planetTable?: PlanetRow[]
}

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

const PLANET_COLORS: Record<string, string> = {
  Sun:'#F5C842', Moon:'#D0D8F0', Mars:'#E05050', Mercury:'#7EC8A0',
  Jupiter:'#F0A830', Venus:'#E48DB0', Saturn:'#A08050', Rahu:'#8855CC', Ketu:'#CC8855',
}

const TAROT_MAP: Record<string, { name: string; num: string; meaning: string; prompt: string }> = {
  Sun:     { name:'The Sun',            num:'XIX', meaning:'Vitality and authentic self-expression. What was hidden becomes visible.',                                   prompt:'Where in your life are you most fully yourself?' },
  Moon:    { name:'The High Priestess', num:'II',  meaning:'Intuition and cyclical knowing. What cannot be spoken still guides the hand.',                              prompt:'What does your intuition already know that your mind resists?' },
  Mars:    { name:'The Chariot',        num:'VII', meaning:'Directed will and disciplined forward motion. Victory through sustained effort.',                           prompt:'What are you driving toward, and what threatens to pull you sideways?' },
  Mercury: { name:'The Magician',       num:'I',   meaning:'Skill and the capacity to translate inner vision into outer form.',                                         prompt:'What gift do you have that you have not yet fully used?' },
  Jupiter: { name:'The Wheel',          num:'X',   meaning:'Expansion and the turning of great cycles. Abundance arrives through openness.',                           prompt:'What cycle in your life is completing, and what is beginning?' },
  Venus:   { name:'The Empress',        num:'III', meaning:'Creativity and sensory intelligence. Growth through beauty and receptivity.',                               prompt:'What are you nurturing, and what needs more of your care?' },
  Saturn:  { name:'The World',          num:'XXI', meaning:'Completion and earned mastery. The harvest of long patient work.',                                          prompt:'What have you built that now stands on its own?' },
  Rahu:    { name:'The Fool',           num:'0',   meaning:'Departure into the unknown. The soul at the threshold of unfamiliar territory.',                           prompt:'What leap have you been postponing that the moment is now calling for?' },
  Ketu:    { name:'The Hermit',         num:'IX',  meaning:'Withdrawal and liberation from what has already been perfected.',                                           prompt:'What are you ready to release in order to move more freely?' },
}

const KARAKA_DEFS: { key: keyof Karakas; emoji: string; label: string; sub: string; gold?: boolean }[] = [
  { key:'atmakaraka',   emoji:'⭐', label:'Ātmakāraka',   sub:'Soul indicator',        gold:true },
  { key:'amatyakaraka', emoji:'💼', label:'Amātyakāraka', sub:'Vocational minister' },
  { key:'bhratrukaraka',emoji:'🤝', label:'Bhrātṛkāraka', sub:'Sibling & courage' },
  { key:'matrukaraka',  emoji:'🏠', label:'Mātṛkāraka',   sub:'Mother & property' },
  { key:'putrakaraka',  emoji:'✨', label:'Putrakāraka',   sub:'Children & creativity' },
  { key:'gnatikaraka',  emoji:'🔮', label:'Gnātikāraka',  sub:'Spiritual growth' },
  { key:'darakaraka',   emoji:'💞', label:'Dārakāraka',   sub:'Spouse & partnership' },
]

// ── Dignity badge helper ──────────────────────────────────────────────────────
function DignityBadge({ dignity }: { dignity: string }) {
  const d = dignity.toLowerCase()
  let bg = 'rgba(255,255,255,0.06)', color = '#8090B5', border = 'rgba(255,255,255,0.12)'
  if (d.includes('exalt'))  { bg = 'rgba(110,201,122,0.12)'; color = '#6EC97A'; border = 'rgba(110,201,122,0.3)' }
  else if (d.includes('own')) { bg = 'rgba(80,140,224,0.12)'; color = '#7AABF0'; border = 'rgba(80,140,224,0.3)' }
  else if (d.includes('debil')) { bg = 'rgba(224,80,80,0.12)'; color = '#E05050'; border = 'rgba(224,80,80,0.3)' }
  return (
    <span style={{ padding: '2px 9px', borderRadius: 999, background: bg, border: `1px solid ${border}`, color, fontSize: 11, fontFamily: 'Outfit,sans-serif', whiteSpace: 'nowrap' as const }}>
      {dignity || '—'}
    </span>
  )
}

// ── Swiss Ephemeris Table ─────────────────────────────────────────────────────
function EphemerisTable({ chart }: { chart: ChartData | null }) {
  const rows = chart?.planetTable ?? []
  if (!rows.length) return null

  const strong = rows.filter(r => {
    const d = r.dignity.toLowerCase()
    return d.includes('exalt') || d.includes('own')
  })
  const weak = rows.filter(r => r.dignity.toLowerCase().includes('debil'))

  const thStyle: React.CSSProperties = {
    fontSize: 9, fontFamily: 'Outfit,sans-serif', fontWeight: 700,
    letterSpacing: '0.10em', textTransform: 'uppercase' as const,
    color: '#D4B870', padding: '6px 10px', textAlign: 'left' as const,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  }
  const tdStyle: React.CSSProperties = {
    padding: '9px 10px', fontSize: 12, fontFamily: 'Outfit,sans-serif',
    color: '#B0A0C8', verticalAlign: 'middle' as const,
  }

  return (
    <div style={card}>
      {/* Strong / Weak chip summary */}
      {(strong.length > 0 || weak.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
          {strong.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.10em', color: '#6EC97A', fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}>Strong Planets</span>
              {strong.map(r => (
                <span key={r.planet} style={{ padding: '3px 12px', borderRadius: 999, background: 'rgba(110,201,122,0.10)', border: '1px solid rgba(110,201,122,0.3)', color: '#6EC97A', fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>
                  {r.glyph} {r.planet}
                </span>
              ))}
            </div>
          )}
          {weak.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.10em', color: '#E05050', fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}>Needs Support</span>
              {weak.map(r => (
                <span key={r.planet} style={{ padding: '3px 12px', borderRadius: 999, background: 'rgba(224,80,80,0.10)', border: '1px solid rgba(224,80,80,0.3)', color: '#E05050', fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>
                  {r.glyph} {r.planet}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <span style={lbl}>Swiss Ephemeris — Exact Positions</span>

      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              <th style={thStyle}>Planet</th>
              <th style={thStyle}>Sign</th>
              <th style={{ ...thStyle, textAlign: 'center' as const }}>House</th>
              <th style={thStyle}>Dignity</th>
              <th style={{ ...thStyle, display: 'var(--notes-display, table-cell)' as any }} className="col-notes">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const color = r.color || PLANET_COLORS[r.planet] || '#B0A0C8'
              const isRetrograde = r.notes?.includes('℞') || r.notes?.toLowerCase().includes('r)')
              return (
                <tr key={r.planet}
                  style={{
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')}
                >
                  {/* Planet */}
                  <td style={{ ...tdStyle, color, fontWeight: 600, whiteSpace: 'nowrap' as const }}>
                    <span style={{ fontSize: 15, marginRight: 6 }}>{r.glyph}</span>{r.planet}
                    {r.skt && r.skt !== r.planet && (
                      <span style={{ fontSize: 10, color: '#7A6A9A', marginLeft: 4, fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic' }}>{r.skt}</span>
                    )}
                  </td>
                  {/* Sign */}
                  <td style={tdStyle}>{r.sign}</td>
                  {/* House */}
                  <td style={{ ...tdStyle, textAlign: 'center' as const, color: '#8090B5' }}>H{r.house}</td>
                  {/* Dignity */}
                  <td style={{ ...tdStyle }}><DignityBadge dignity={r.dignity} /></td>
                  {/* Notes */}
                  <td style={{ ...tdStyle, fontFamily: '"Courier New",Courier,monospace', fontSize: 11, color: '#7A6A9A' }} className="col-notes">
                    {r.notes}
                    {isRetrograde && !r.notes?.includes('℞') && <span style={{ color: '#E05050', marginLeft: 4 }}>℞</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Responsive: hide Notes on narrow screens */}
      <style>{`
        @media (max-width: 480px) {
          .col-notes { display: none !important; }
        }
      `}</style>
    </div>
  )
}

// ── Tarot Card ────────────────────────────────────────────────────────────────
function TarotCard({ planet, roleLabel }: { planet?: string; roleLabel: string }) {
  const t = planet ? (TAROT_MAP[planet] ?? null) : null
  if (!t) return (
    <div style={{ flex:'1 1 180px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:8 }}>
      <span style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif' }}>{roleLabel}</span>
      <p style={{ fontSize:13, color:'#8090B5', fontFamily:'Outfit,sans-serif', fontStyle:'italic', margin:0 }}>Data unavailable</p>
    </div>
  )
  return (
    <div style={{ flex:'1 1 180px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:10 }}>
      <span style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif' }}>{roleLabel}</span>
      <div style={{ fontSize:28, color:'#4A3A6A', fontFamily:'"Cormorant Garamond",serif', fontWeight:300, lineHeight:1 }}>{t.num}</div>
      <div style={{ fontSize:20, color:'#F0EBF4', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', lineHeight:1.3 }}>{t.name}</div>
      <p style={{ fontSize:13, color:'#B0A0C8', lineHeight:1.65, margin:0, fontFamily:'Outfit,sans-serif' }}>{t.meaning}</p>
      <div style={{ padding:'8px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10 }}>
        <p style={{ fontSize:12, color:'#B0A0C8', fontStyle:'italic', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.55 }}>{t.prompt}</p>
      </div>
    </div>
  )
}

export default function InsightsTab({ chart }: { chart: ChartData | null }) {
  const lord    = chart?.lagna?.lord
  const sign    = chart?.lagna?.sign
  const planet  = chart?.dasha?.current?.planet
  const antPlanet = chart?.dasha?.antardasha?.planet
  const akPlanet  = chart?.ak ?? chart?.karakas?.atmakaraka?.planet_name
  const arch   = deriveArchetype(lord, planet)
  const ak     = AK_THEMES[lord ?? 'Sun'] ?? AK_THEMES['Sun']
  const wealth = WEALTH_PATTERNS[sign ?? ''] ?? { title:'Artha Pattern', description:'The 2nd and 11th houses reveal the texture of material flow. With fuller chart data, a more specific pattern can be surfaced.' }
  const karakas = chart?.karakas
  const bnnTransits = chart?.bnnTransits ?? []

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>

      {/* ── Card 0: Swiss Ephemeris Table ── */}
      <EphemerisTable chart={chart} />

      {/* ── Card 1: Leadership Archetype ── */}
      <div style={card}>
        <span style={lbl}>Leadership Archetype</span>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', border:`2px solid ${arch.color}`, background:'rgba(0,0,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{arch.icon}</div>
          <div>
            <p style={{ fontSize:22, color:arch.color, fontFamily:'"Cormorant Garamond",serif', fontWeight:600, margin:'0 0 3px', fontStyle:'italic' }}>{arch.name}</p>
            <p style={{ fontSize:11, color:'#8090B5', margin:0, fontFamily:'Outfit,sans-serif' }}>Lagna lord: {lord ?? '—'} · Daśā: {planet ?? '—'}</p>
          </div>
        </div>
        <p style={{ fontSize:13, color:'#B0A0C8', lineHeight:1.7, margin:'0 0 14px', fontFamily:'Outfit,sans-serif' }}>{arch.description}</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {arch.strengths.map(s => <span key={s} style={{ padding:'4px 12px', borderRadius:999, background:'rgba(0,0,0,0.2)', border:`1px solid ${arch.color}40`, color:arch.color, fontSize:12, fontFamily:'Outfit,sans-serif' }}>{s}</span>)}
        </div>
      </div>

      {/* ── Card 2: AK Reflection ── */}
      <div style={card}>
        <span style={lbl}>Ātmakāraka Reflection</span>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
          <span style={{ padding:'4px 14px', borderRadius:999, background:'rgba(212,184,112,0.12)', border:'1px solid rgba(212,184,112,0.3)', color:'#D4B870', fontSize:13, fontFamily:'Outfit,sans-serif', flexShrink:0 }}>{lord ?? 'Sun'}</span>
          <p style={{ fontSize:14, color:'#F0EBF4', margin:0, fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', lineHeight:1.5 }}>{ak.title}</p>
        </div>
        <p style={{ fontSize:13, color:'#B0A0C8', lineHeight:1.7, margin:0, fontFamily:'Outfit,sans-serif' }}>{ak.reflection}</p>
      </div>

      {/* ── Card 3: Wealth Pattern ── */}
      <div style={card}>
        <span style={lbl}>Artha Focus — Wealth Pattern</span>
        <p style={{ fontSize:18, color:'#D4B870', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', margin:'0 0 10px' }}>{wealth.title}</p>
        <p style={{ fontSize:13, color:'#B0A0C8', lineHeight:1.7, margin:'0 0 12px', fontFamily:'Outfit,sans-serif' }}>{wealth.description}</p>
        <div style={{ padding:'10px 12px', background:'rgba(212,184,112,0.06)', borderRadius:10, borderLeft:'2px solid rgba(212,184,112,0.4)' }}>
          <p style={{ fontSize:12, color:'#B0A0C8', margin:0, fontFamily:'Outfit,sans-serif' }}>Primary artha houses — 2nd (Dhana), 10th (Karma), 11th (Labha) — are the core lens for wealth pattern analysis.</p>
        </div>
      </div>

      {/* ── Card 4: Jaimini Karakas Grid ── */}
      <div style={card}>
        <span style={lbl}>Jaimini Karakas</span>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
          {KARAKA_DEFS.map(({ key, emoji, label, sub, gold }) => {
            const k = karakas?.[key]
            const borderColor = gold ? '#D4B870' : '#8B7CC8'
            const borderOpacity = gold ? '0.5' : '0.3'
            return (
              <div key={key} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid rgba(${gold ? '212,184,112' : '139,124,200'},${borderOpacity})`, borderRadius:12, padding:'12px 10px', display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:20, lineHeight:1 }}>{emoji}</span>
                <p style={{ fontSize:13, color: gold ? borderColor : '#F0EBF4', fontFamily:'Outfit,sans-serif', fontWeight:600, margin:0, marginTop:2 }}>{k?.planet_name ?? '—'}</p>
                {k?.sign && <p style={{ fontSize:11, color:'#8090B5', fontFamily:'Outfit,sans-serif', margin:0 }}>{k.sign}</p>}
                <p style={{ fontSize:11, color: gold ? '#D4B870' : '#8B7CC8', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', margin:0, lineHeight:1.3 }}>{label}</p>
                <p style={{ fontSize:10, color:'#7A6A9A', fontFamily:'Outfit,sans-serif', margin:0 }}>{sub}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Card 5: BNN Transits ── */}
      <div style={card}>
        <span style={lbl}>BNN Transits</span>
        {bnnTransits.length === 0 ? (
          <p style={{ fontSize:13, color:'#7A6A9A', fontStyle:'italic', margin:0, fontFamily:'Outfit,sans-serif' }}>Transit data unavailable</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {bnnTransits.map((t, i) => {
              const pc = PLANET_COLORS[t.transit] ?? '#B0A0C8'
              return (
                <div key={i} style={{ padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:12, borderLeft:`3px solid ${pc}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:13, color:pc, fontFamily:'Outfit,sans-serif', fontWeight:600 }}>{t.transit}</span>
                    <span style={{ fontSize:12, color:'#8090B5', fontFamily:'Outfit,sans-serif' }}>transiting {t.transitSign} → {t.natalContact}</span>
                  </div>
                  <p style={{ fontSize:13, color:'#B0A0C8', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>{t.theme}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Card 6: Tarot Archetypes ── */}
      <div style={card}>
        <span style={lbl}>Tarot Archetypes</span>
        <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
          <TarotCard planet={planet}     roleLabel="Current Period" />
          <TarotCard planet={antPlanet}  roleLabel="Active Force" />
          <TarotCard planet={akPlanet}   roleLabel="Soul Signature" />
        </div>
      </div>

      <p style={{ fontSize:11, color:'#8090B5', textAlign:'center', fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>These reflections surface symbolic patterns — not deterministic outcomes. The chart is a map; you are the territory.</p>
    </div>
  )
}

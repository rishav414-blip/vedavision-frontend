import React, { useState } from 'react'
import type { ChartData } from '@/lib/chartTypes'
import { t } from '@/lib/i18n'

interface RemedyData { day: string; color: string; charity: string; mantra: string; romanised: string; themes: string; planetColor: string }

const REMEDIES: Record<string, RemedyData> = {
  Sun:     { day:'Sunday',    color:'Red / Orange',  charity:'Wheat or jaggery',           mantra:'ॐ सूर्याय नमः',      romanised:'Om Suryaya Namah',      themes:'Vitality, authority, soul purpose. Strengthens clarity of self and leadership.',                          planetColor:'#F5C842' },
  Moon:    { day:'Monday',    color:'White / Silver', charity:'Rice or milk',               mantra:'ॐ सोमाय नमः',        romanised:'Om Somaya Namah',        themes:'Mind, emotions, nourishment. Supports mental equilibrium and receptive awareness.',                          planetColor:'#D0D8F0' },
  Mars:    { day:'Tuesday',   color:'Red',            charity:'Red lentils (masoor dal)',   mantra:'ॐ अङ्गारकाय नमः',    romanised:'Om Angarakaya Namah',    themes:'Courage, drive, siblings. Channels assertive energy into constructive action.',                              planetColor:'#E05050' },
  Mercury: { day:'Wednesday', color:'Green',          charity:'Green cloth or mung beans',  mantra:'ॐ बुधाय नमः',        romanised:'Om Budhaya Namah',       themes:'Intellect, communication, trade. Sharpens discernment and adaptive intelligence.',                           planetColor:'#7EC8A0' },
  Jupiter: { day:'Thursday',  color:'Yellow',         charity:'Yellow sweets or turmeric',  mantra:'ॐ बृहस्पतये नमः',    romanised:'Om Brihaspataye Namah',  themes:'Wisdom, dharma, expansion. Cultivates ethical perspective and faith in life\'s deeper order.',               planetColor:'#F0A830' },
  Venus:   { day:'Friday',    color:'White / Pink',   charity:'White sweets or white cloth',mantra:'ॐ शुक्राय नमः',      romanised:'Om Shukraya Namah',      themes:'Beauty, relationship, creativity. Invites appreciation of harmony and aesthetic sensitivity.',               planetColor:'#E48DB0' },
  Saturn:  { day:'Saturday',  color:'Black / Navy',   charity:'Sesame seeds or iron',       mantra:'ॐ शनये नमः',         romanised:'Om Shanaye Namah',       themes:'Discipline, karma, service. Builds patience and integrity through consistent effort.',                         planetColor:'#A08050' },
  Rahu:    { day:'Saturday',  color:'Dark Blue',      charity:'Black items, sesame',         mantra:'ॐ राहवे नमः',        romanised:'Om Rahave Namah',        themes:'Ambition, illusion, foreign. Brings worldly experience to its karmic resolution.',                           planetColor:'#8855CC' },
  Ketu:    { day:'Tuesday',   color:'Grey',           charity:'Blankets or grey cloth',      mantra:'ॐ केतवे नमः',        romanised:'Om Ketave Namah',        themes:'Liberation, detachment, moksha. Deepens inward turning and spiritual discernment.',                          planetColor:'#CC8855' },
}

interface GemstoneRow { planet: string; primary: string; substitute: string; metal: string; finger: string }
const GEMSTONE_TABLE: GemstoneRow[] = [
  { planet:'Sun',     primary:'Ruby',             substitute:'Red Garnet / Red Spinel',        metal:'Gold',                finger:'Ring finger'   },
  { planet:'Moon',    primary:'Natural Pearl',    substitute:'Moonstone / White Coral',        metal:'Silver',              finger:'Little finger' },
  { planet:'Mars',    primary:'Red Coral',        substitute:'Carnelian / Red Jasper',         metal:'Gold/Copper',         finger:'Ring finger'   },
  { planet:'Mercury', primary:'Emerald',          substitute:'Green Tourmaline / Peridot',     metal:'Gold',                finger:'Little finger' },
  { planet:'Jupiter', primary:'Yellow Sapphire',  substitute:'Yellow Topaz / Citrine',         metal:'Gold',                finger:'Index finger'  },
  { planet:'Venus',   primary:'Diamond',          substitute:'White Sapphire / Clear Zircon',  metal:'Silver/Platinum',     finger:'Middle finger' },
  { planet:'Saturn',  primary:'Blue Sapphire',    substitute:'Amethyst / Blue Spinel',         metal:'Iron/Silver',         finger:'Middle finger' },
  { planet:'Rahu',    primary:'Hessonite (Gomed)',substitute:'Zircon / Orange Garnet',          metal:'Silver/Panchdhatu',   finger:'Middle finger' },
  { planet:'Ketu',    primary:"Cat's Eye",        substitute:"Chrysoberyl / Tiger's Eye",      metal:'Silver/Panchdhatu',   finger:'Little finger' },
]

const PLANET_GLYPHS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
}

const card: React.CSSProperties = { background:'rgba(8,4,22,0.72)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', border:'1px solid rgba(114,166,183,0.2)', borderRadius:16, padding:20, boxShadow:'0 4px 30px rgba(0,0,0,0.55)' }
const lbl: React.CSSProperties = { fontSize:12, textTransform:'uppercase' as const, letterSpacing:'0.12em', color:'#D4B870', fontFamily:'Outfit,sans-serif', marginBottom:12, display:'block' }

function hexRgb(hex: string) { const c = hex.replace('#',''); return `${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)}` }



function RemedyCard({ remedy, lang = 'en' }: { remedy: RemedyData; lang?: string }) {
  const labels = [
    ['Day',    t('Day',    'दिन',    lang), remedy.day],
    ['Colour', t('Colour', 'रंग',    lang), remedy.color],
    ['Dāna',   t('Fasting','उपवास',  lang), remedy.charity],
    ['Mantra', t('Mantra', 'मंत्र',  lang), `${remedy.mantra} — ${remedy.romanised}`],
  ] as [string, string, string][]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {labels.map(([key, label, value]) => (
          <div key={key} style={{ background:'rgba(10,5,26,0.88)', borderRadius:10, padding:'10px 12px', gridColumn: key==='Mantra'?'1/-1':undefined }}>
            <p style={{ fontSize:12, color:'#A0A8C8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px', fontFamily:'Outfit,sans-serif' }}>{label}</p>
            <p style={{ fontSize: key==='Mantra'?15:13, color:'#F0EBF4', margin:0, fontFamily: key==='Mantra'?'"Cormorant Garamond",serif':'Outfit,sans-serif' }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={{ padding:'10px 12px', background:'rgba(114,166,183,0.06)', borderRadius:10, borderLeft:`2px solid ${remedy.planetColor}` }}>
        <p style={{ fontSize:14, color:'#D0C8E0', margin:0, lineHeight:1.6, fontFamily:'Outfit,sans-serif' }}>{remedy.themes}</p>
      </div>
      <div style={{ padding:'10px 14px', background:'rgba(139,124,200,0.08)', borderRadius:10, border:'1px solid rgba(139,124,200,0.2)' }}>
        <p style={{ fontSize:13, color:'#A99BD9', margin:0, fontFamily:'Outfit,sans-serif' }}><strong style={{ display:'block', marginBottom:2 }}>Gemstones</strong>Constitutional gemstone assessment requires direct evaluation by a qualified Jyotishi. Please consult an in-person practitioner.</p>
      </div>
    </div>
  )
}

export default function RemediesTab({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  const activePlanet = chart?.dasha?.current?.planet ?? 'Sun'
  const [expanded, setExpanded] = useState<string|null>(null)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>
      <div style={{ padding:'12px 16px', background:'rgba(139,124,200,0.08)', border:'1px solid rgba(139,124,200,0.2)', borderRadius:12 }}>
        <p style={{ fontSize:14, color:'#A99BD9', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>Classical Vedic remedies are offered as reflective practices. Consult a qualified Jyotishi before adopting gemstone or major ritual remedies.</p>
      </div>
      <div style={card}>
        <span style={lbl}>{t('Active Period', 'सक्रिय अवधि', lang)} — {activePlanet} Mahādaśā</span>
        <RemedyCard remedy={REMEDIES[activePlanet] ?? REMEDIES['Sun']} lang={lang} />
      </div>
      <div style={card}>
        <span style={lbl}>{t('Remedies & Practices', 'उपाय और अभ्यास', lang)}</span>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
          {Object.keys(REMEDIES).map(p => {
            const r = REMEDIES[p], active = expanded === p
            return <button key={p} onClick={() => setExpanded(prev => prev===p?null:p)} style={{ padding:'6px 14px', borderRadius:999, border:`1px solid ${active?r.planetColor:'rgba(114,166,183,0.22)'}`, background:active?`rgba(${hexRgb(r.planetColor)},0.12)`:'rgba(8,4,22,0.88)', color:active?r.planetColor:'#D0C8E0', fontSize:13, fontFamily:'Outfit,sans-serif', cursor:'pointer', transition:'all 0.2s' }}>{p}</button>
          })}
        </div>
        {expanded && <div style={{ borderTop:'1px solid rgba(114,166,183,0.12)', paddingTop:16 }}><span style={{ ...lbl, color:REMEDIES[expanded].planetColor }}>{expanded}</span><RemedyCard remedy={REMEDIES[expanded]} lang={lang} /></div>}
      </div>

      {/* ── Gemstone Reference Table ── */}
      <div style={card}>
        <span style={lbl}>{t('Gemstone Reference', 'रत्न संदर्भ', lang)}</span>

        {/* Prominent disclaimer */}
        <div style={{
          padding:'14px 16px',
          background:'rgba(212,168,48,0.10)',
          border:'1px solid rgba(212,168,48,0.35)',
          borderRadius:12,
          marginBottom:20,
        }}>
          <p style={{ fontSize:13, color:'#D4A830', fontFamily:'Outfit,sans-serif', fontWeight:700, margin:'0 0 6px' }}>⚠ Gemstone Disclaimer</p>
          <p style={{ fontSize:14, color:'#C09820', fontFamily:'Outfit,sans-serif', margin:0, lineHeight:1.65 }}>
            Gemstones directly influence your energetic constitution and should <strong>NEVER</strong> be selected from a general reference. This table is for educational awareness only. Always consult a qualified Jyotishi for an in-person constitutional assessment before wearing any stone.
          </p>
        </div>

        {/* Responsive table wrapper */}
        <div style={{ overflowX:'auto' }}>
          {/* Desktop table */}
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'Outfit,sans-serif', minWidth:480 }} className="gemstone-table">
            <thead>
              <tr>
                {['Planet','Primary Stone','Substitute','Metal','Finger'].map(h => (
                  <th key={h} style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.1em', color:'#D4B870', fontFamily:'Outfit,sans-serif', fontWeight:600, padding:'8px 10px', textAlign:'left', borderBottom:'1px solid rgba(114,166,183,0.2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GEMSTONE_TABLE.map((row, i) => {
                const pc = REMEDIES[row.planet]?.planetColor ?? '#D0C8E0'
                const isActive = row.planet === activePlanet
                return (
                  <tr
                    key={row.planet}
                    style={{
                      background: isActive ? `${pc}18` : i % 2 === 1 ? 'rgba(114,166,183,0.06)' : 'transparent',
                      borderLeft: isActive ? `3px solid ${pc}` : '3px solid transparent',
                    }}
                  >
                    <td style={{ padding:'9px 10px', fontSize:13, color:pc, fontWeight:600, whiteSpace:'nowrap' }}>
                      <span style={{ marginRight:5, opacity:0.8 }}>{PLANET_GLYPHS[row.planet]}</span>{row.planet}
                    </td>
                    <td style={{ padding:'9px 10px', fontSize:13, color:'#F0EBF4' }}>{row.primary}</td>
                    <td style={{ padding:'9px 10px', fontSize:14, color:'#D0C8E0' }}>{row.substitute}</td>
                    <td style={{ padding:'9px 10px', fontSize:14, color:'#D0C8E0', whiteSpace:'nowrap' }}>{row.metal}</td>
                    <td style={{ padding:'9px 10px', fontSize:14, color:'#D0C8E0', whiteSpace:'nowrap' }}>{row.finger}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards — shown via CSS media query via inline style trick: render always, hide on wide screens via a wrapper */}
        <style>{`
          @media (max-width: 540px) {
            .gemstone-table { display: none !important; }
            .gemstone-cards { display: flex !important; }
          }
          @media (min-width: 541px) {
            .gemstone-cards { display: none !important; }
          }
          .gemstone-row:hover { background: rgba(10,5,26,0.88) !important; }
        `}</style>

        <div className="gemstone-cards" style={{ display:'none', flexDirection:'column', gap:8 }}>
          {GEMSTONE_TABLE.map(row => {
            const pc = REMEDIES[row.planet]?.planetColor ?? '#D0C8E0'
            const isActive = row.planet === activePlanet
            return (
              <div key={row.planet} style={{
                padding:'12px 14px',
                background:'rgba(10,5,26,0.88)',
                borderRadius:10,
                borderLeft:`3px solid ${isActive ? pc : 'rgba(114,166,183,0.2)'}`,
              }}>
                <p style={{ fontSize:14, color:pc, fontWeight:600, fontFamily:'Outfit,sans-serif', margin:'0 0 8px' }}>
                  {PLANET_GLYPHS[row.planet]} {row.planet}
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {[['Primary', row.primary],['Substitute', row.substitute],['Metal', row.metal],['Finger', row.finger]].map(([k,v]) => (
                    <div key={k}>
                      <p style={{ fontSize:11, color:'#A0A8C8', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 2px', fontFamily:'Outfit,sans-serif' }}>{k}</p>
                      <p style={{ fontSize:14, color:'#F0EBF4', margin:0, fontFamily:'Outfit,sans-serif' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <p style={{ fontSize:13, color:'#B0A8CC', fontFamily:'Outfit,sans-serif', marginTop:12, marginBottom:0, lineHeight:1.5 }}>
          Active Mahādaśā planet ({activePlanet}) is highlighted with a coloured left border.
        </p>
      </div>
    </div>
  )
}

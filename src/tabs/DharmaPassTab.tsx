import React from 'react'

interface DharmaPassTabProps { unlocked: boolean; onOpenPasscode: () => void }

const card: React.CSSProperties = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20 }

const FEATURES = [
  { icon:'☽', label:'Extended Daśā Commentary', desc:'Deeper thematic interpretation of your current and upcoming planetary periods.' },
  { icon:'⚭', label:'Full Compatibility Report', desc:'Detailed Ashtakoot analysis with navamsha layer and synastry notes.' },
  { icon:'✦', label:'Advanced Yogas', desc:'Additional classical combinations with reflective framing.' },
  { icon:'🜃', label:'Practice Protocols', desc:'Tailored Japa, Pranayama, and Dāna recommendations calibrated to your chart.' },
]

const UNLOCKED_CARDS = [
  { icon:'☽', title:'Extended Daśā Commentary', tag:'Mahādaśā Depth', content:'Your current planetary period carries a distinctive thematic signature operating across livelihood, relationship, and inner orientation. This is a period for establishing rather than dismantling, for consolidating gains quietly won in previous cycles.' },
  { icon:'✦', title:'Advanced Yogas', tag:'Classical Combinations', content:'Several classical combinations are active in your chart. Their significance is contextual — a yoga does not operate in isolation but through the houses it connects and the dasha periods that activate it.' },
  { icon:'🜃', title:'Practice Protocols', tag:'Tailored Recommendations', content:'Based on your active dasha and lagna, mantra repetition on the appropriate day, regular fasting, and directed charitable giving will support alignment with the current period\'s themes.' },
  { icon:'⊕', title:'Priority Jyoti', tag:'Enhanced Access', content:null, isPriority:true },
]

export default function DharmaPassTab({ unlocked, onOpenPasscode }: DharmaPassTabProps) {
  if (!unlocked) return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:480, margin:'0 auto', alignItems:'center' }}>
      <div style={{ ...card, textAlign:'center', width:'100%', padding:'40px 28px', boxSizing:'border-box' as const }}>
        <div style={{ width:80, height:80, borderRadius:'50%', border:'2px solid rgba(212,184,112,0.5)', boxShadow:'0 0 40px rgba(212,184,112,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 20px', background:'radial-gradient(circle, rgba(212,184,112,0.08) 0%, transparent 70%)' }}>🔐</div>
        <p style={{ fontSize:26, color:'#D4B870', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', margin:'0 0 6px' }}>Dharma Pass</p>
        <p style={{ fontSize:13, color:'#B0A0C8', margin:'0 0 28px', fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>Extended readings and practice protocols for deeper inquiry.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10, textAlign:'left', marginBottom:28 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'12px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12 }}>
              <span style={{ fontSize:20, flexShrink:0, color:'#D4B870' }}>{f.icon}</span>
              <div><p style={{ fontSize:13, color:'#F0EBF4', margin:'0 0 2px', fontFamily:'Outfit,sans-serif', fontWeight:500 }}>{f.label}</p><p style={{ fontSize:12, color:'#8090B5', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.5 }}>{f.desc}</p></div>
            </div>
          ))}
        </div>
        <button onClick={onOpenPasscode} style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#C0A860,#D4B870)', color:'#0A0618', fontSize:15, fontFamily:'Outfit,sans-serif', fontWeight:600, cursor:'pointer', marginBottom:12 }}>Enter Access Code →</button>
        <button onClick={onOpenPasscode} style={{ background:'none', border:'none', color:'#8090B5', fontSize:12, fontFamily:'Outfit,sans-serif', cursor:'pointer', textDecoration:'underline', textUnderlineOffset:3 }}>Already have a code?</button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'rgba(110,201,122,0.1)', border:'1px solid rgba(110,201,122,0.3)', borderRadius:12 }}>
        <span style={{ color:'#6EC97A', fontSize:16 }}>✓</span>
        <span style={{ fontSize:13, color:'#6EC97A', fontFamily:'Outfit,sans-serif', fontWeight:500 }}>Dharma Pass Active</span>
      </div>
      {UNLOCKED_CARDS.map(c => (
        <div key={c.title} style={card}>
          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:20, color:'#D4B870' }}>{c.icon}</span>
            <p style={{ flex:1, fontSize:15, color:'#F0EBF4', margin:0, fontFamily:'Outfit,sans-serif', fontWeight:500 }}>{c.title}</p>
            <span style={{ padding:'3px 10px', borderRadius:999, background:'rgba(212,184,112,0.1)', border:'1px solid rgba(212,184,112,0.25)', color:'#D4B870', fontSize:10, fontFamily:'Outfit,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase' as const, whiteSpace:'nowrap' as const }}>{c.tag}</span>
          </div>
          {(c as any).isPriority
            ? <div style={{ padding:'12px 14px', background:'rgba(139,124,200,0.1)', border:'1px solid rgba(139,124,200,0.2)', borderRadius:10 }}><p style={{ fontSize:13, color:'#8B7CC8', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>Your questions to Jyoti are prioritised. Jyoti will provide extended responses with more contextual depth for Dharma Pass holders.</p></div>
            : <p style={{ fontSize:13, color:'#B0A0C8', lineHeight:1.7, margin:0, fontFamily:'Outfit,sans-serif' }}>{c.content}</p>
          }
        </div>
      ))}
    </div>
  )
}

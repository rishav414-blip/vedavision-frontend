import React, { useState, useEffect } from 'react'

interface DharmaPassTabProps { unlocked: boolean; onOpenPasscode: () => void }

// ─── Access utilities ─────────────────────────────────────────────────────────
const ACCESS_KEY   = 'vv_dharma_access'
const TIMED_KEY    = 'vv_dharma_timed'
const TIMED_CODES  = ['CHARLIE']
const VALID_CODES  = ['CELESTIAL2026','DHARMA','VEDAVISION','COSMICPASS','CHARLIE']
const TIMED_TTL_MS = 60 * 60 * 1000 // 1 hour

/** Returns true if a permanent code is active. */
function hasPermanentAccess(): boolean {
  return !!localStorage.getItem('vv_dharma_pass')
}

/** Returns ms remaining for a timed session, or 0 if expired/absent. */
function timedAccessRemaining(): number {
  try {
    const r = localStorage.getItem(TIMED_KEY)
    if (!r) return 0
    const { expiry } = JSON.parse(r)
    return Math.max(0, expiry - Date.now())
  } catch { return 0 }
}

/** Returns true if any valid access exists (permanent or unexpired timed). */
function hasAccess(): boolean {
  if (hasPermanentAccess()) return true
  return timedAccessRemaining() > 0
}

function grantAccess(code: string): void {
  if (TIMED_CODES.includes(code)) {
    // 1-hour timed session — stored separately, no permanent flag
    localStorage.setItem(TIMED_KEY, JSON.stringify({ code, expiry: Date.now() + TIMED_TTL_MS }))
    ;(window as any).showToast?.('✦ Dharma Pass activated — access valid for 1 hour', 'success')
  } else {
    // Permanent codes
    localStorage.setItem(ACCESS_KEY, JSON.stringify({ code, activatedAt: Date.now() }))
    localStorage.setItem('vv_dharma_pass', '1')
    ;(window as any).showToast?.('✦ Dharma Pass activated — full access granted', 'success')
  }
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const card: React.CSSProperties = { background:'rgba(8,4,22,0.72)', border:'1px solid rgba(114,166,183,0.2)', borderRadius:16, padding:20 }

const FEATURES = [
  { icon:'☽', label:'Extended Daśā Commentary', desc:'Deeper thematic interpretation of your current and upcoming planetary periods.' },
  { icon:'⚭', label:'Full Compatibility Report', desc:'Detailed Ashtakoot analysis with navamsha layer and synastry notes.' },
  { icon:'✦', label:'Advanced Yogas', desc:'Additional classical combinations with reflective framing.' },
  { icon:'🜃', label:'Practice Protocols', desc:'Tailored Japa, Pranayama, and Dāna recommendations calibrated to your chart.' },
  { icon:'📊', label:'5-Year Thematic Outlook', desc:'Full career and wealth action plans for each year — all items unlocked.' },
]

const UNLOCKED_CARDS = [
  { icon:'☽', title:'Extended Daśā Commentary', tag:'Mahādaśā Depth', content:'Your current planetary period carries a distinctive thematic signature operating across livelihood, relationship, and inner orientation. This is a period for establishing rather than dismantling, for consolidating gains quietly won in previous cycles.' },
  { icon:'✦', title:'Advanced Yogas', tag:'Classical Combinations', content:'Several classical combinations are active in your chart. Their significance is contextual — a yoga does not operate in isolation but through the houses it connects and the dasha periods that activate it.' },
  { icon:'🜃', title:'Practice Protocols', tag:'Tailored Recommendations', content:"Based on your active dasha and lagna, mantra repetition on the appropriate day, regular fasting, and directed charitable giving will support alignment with the current period's themes." },
  { icon:'⊕', title:'Priority Jyoti', tag:'Enhanced Access', content:null, isPriority:true },
]

// ─── Countdown helper ─────────────────────────────────────────────────────────
function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h,m,sec].map(v => String(v).padStart(2,'0')).join(':')
}

// ─── Razorpay key (env var with test fallback) ────────────────────────────────
// TODO: Replace with live key from dashboard.razorpay.com
const RAZORPAY_KEY: string = (import.meta as any).env?.VITE_RAZORPAY_KEY || 'rzp_test_YOUR_KEY_HERE'

// ─── Waitlist helpers ─────────────────────────────────────────────────────────
async function saveWaitlist(email: string, name: string): Promise<void> {
  // Always persist to localStorage first so it works offline
  try {
    const existing = JSON.parse(localStorage.getItem('vv_dharma_waitlist') || '[]')
    existing.push({ email, name, joinedAt: Date.now() })
    localStorage.setItem('vv_dharma_waitlist', JSON.stringify(existing))
  } catch {}
  // Attempt server-side save (fire-and-forget)
  try {
    await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  } catch { /* offline — localStorage fallback already saved */ }
}

// ─── Unlocked state ───────────────────────────────────────────────────────────
function UnlockedView() {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    function calcTime() {
      setTimeLeft(timedAccessRemaining())
    }
    calcTime()
    const id = setInterval(calcTime, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640, margin:'0 auto' }}>
      {/* Expiry countdown */}
      {timeLeft > 0 && (
        <div style={{ textAlign:'center' }}>
          <span style={{ display:'inline-block', padding:'4px 16px', borderRadius:999, background:'rgba(212,184,112,0.12)', border:'1px solid rgba(212,184,112,0.3)', fontSize:12, color:'#D4B870', fontFamily:'Syne,sans-serif', letterSpacing:'0.08em' }}>
            Timed session — expires in {formatCountdown(timeLeft)}
          </span>
        </div>
      )}

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

// ─── Locked state ─────────────────────────────────────────────────────────────
function LockedView({ onOpenPasscode }: { onOpenPasscode: () => void }) {
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistName, setWaitlistName]   = useState('')
  const [waitlistDone, setWaitlistDone]   = useState(false)

  function openRazorpay(amount: number, description: string) {
    const Rp = (window as any).Razorpay
    if (!Rp) {
      ;(window as any).showToast?.('Payment gateway loading — use the waitlist for now', 'info')
      return
    }
    const rzp = new Rp({
      key: RAZORPAY_KEY,
      amount: amount * 100,
      currency: 'INR',
      name: 'Celestial Noir',
      description,
      handler: (response: any) => {
        grantAccess('RAZORPAY_' + response.razorpay_payment_id)
      },
    })
    rzp.open()
  }

  async function submitWaitlist() {
    if (!waitlistEmail.includes('@')) {
      ;(window as any).showToast?.('Please enter a valid email address', 'error')
      return
    }
    await saveWaitlist(waitlistEmail, waitlistName)
    ;(window as any).showToast?.("You're on the waitlist", 'success')
    setWaitlistDone(true)
    setWaitlistEmail(''); setWaitlistName('')
  }

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'12px 14px', borderRadius:10,
    border:'1px solid rgba(114,166,183,0.2)', background:'rgba(8,4,22,0.72)',
    color:'#F0EBF4', fontSize:13, fontFamily:'Outfit,sans-serif', boxSizing:'border-box',
    outline:'none',
  }
  const dividerStyle: React.CSSProperties = {
    display:'flex', alignItems:'center', gap:10, margin:'4px 0',
  }
  const dividerLine: React.CSSProperties = { flex:1, height:1, background:'rgba(114,166,183,0.15)' }
  const dividerText: React.CSSProperties = { fontSize:11, color:'#4A3A6A', whiteSpace:'nowrap', fontFamily:'Outfit,sans-serif' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:480, margin:'0 auto', alignItems:'center' }}>
      <div style={{ ...card, textAlign:'center', width:'100%', padding:'40px 28px', boxSizing:'border-box' as const }}>

        {/* Lock icon + title */}
        <div style={{ width:80, height:80, borderRadius:'50%', border:'2px solid rgba(212,184,112,0.5)', boxShadow:'0 0 40px rgba(212,184,112,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 20px', background:'radial-gradient(circle, rgba(212,184,112,0.08) 0%, transparent 70%)' }}>🔐</div>
        <p style={{ fontSize:26, color:'#D4B870', fontFamily:'"Cormorant Garamond",serif', fontStyle:'italic', margin:'0 0 6px' }}>Dharma Pass</p>
        <p style={{ fontSize:13, color:'#B0A0C8', margin:'0 0 28px', fontFamily:'Outfit,sans-serif', lineHeight:1.6 }}>Extended readings and practice protocols for deeper inquiry.</p>

        {/* Feature list */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, textAlign:'left', marginBottom:28 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'12px 14px', background:'rgba(8,4,22,0.88)', border:'1px solid rgba(114,166,183,0.12)', borderRadius:12 }}>
              <span style={{ fontSize:20, flexShrink:0, color:'#D4B870' }}>{f.icon}</span>
              <div><p style={{ fontSize:13, color:'#F0EBF4', margin:'0 0 2px', fontFamily:'Outfit,sans-serif', fontWeight:500 }}>{f.label}</p><p style={{ fontSize:12, color:'#8090B5', margin:0, fontFamily:'Outfit,sans-serif', lineHeight:1.5 }}>{f.desc}</p></div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          {/* Monthly */}
          <div style={{ flex:'1 1 180px', padding:'16px 12px', background:'rgba(8,4,22,0.88)', border:'1px solid rgba(212,184,112,0.2)', borderRadius:12, textAlign:'center' }}>
            <p style={{ fontSize:11, color:'#8090B5', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px', fontFamily:'Outfit,sans-serif' }}>Monthly</p>
            <p style={{ fontSize:24, color:'#D4B870', fontFamily:'Syne,sans-serif', fontWeight:700, margin:'0 0 12px' }}>₹499</p>
            <button
              onClick={() => openRazorpay(499, 'Dharma Pass — Monthly')}
              style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#C0A860,#D4B870)', color:'#0A0618', fontSize:12, fontFamily:'Outfit,sans-serif', fontWeight:600, cursor:'pointer' }}
            >
              Get Monthly Access ₹499
            </button>
          </div>

          {/* Annual */}
          <div style={{ flex:'1 1 180px', padding:'16px 12px', background:'rgba(123,106,184,0.08)', border:'1px solid rgba(139,124,200,0.3)', borderRadius:12, textAlign:'center' }}>
            <p style={{ fontSize:11, color:'#8090B5', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 4px', fontFamily:'Outfit,sans-serif' }}>Annual <span style={{ color:'#6EC97A' }}>Save 33%</span></p>
            <p style={{ fontSize:24, color:'#9B8DD4', fontFamily:'Syne,sans-serif', fontWeight:700, margin:'0 0 12px' }}>₹3,999</p>
            <button
              onClick={() => openRazorpay(3999, 'Dharma Pass — Annual')}
              style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'none', background:'linear-gradient(135deg,#7B6AB8,#9B8DD4)', color:'#fff', fontSize:12, fontFamily:'Outfit,sans-serif', fontWeight:600, cursor:'pointer' }}
            >
              Get Annual Access ₹3,999
            </button>
          </div>
        </div>

        {/* Divider — or enter code — */}
        <div style={dividerStyle}>
          <div style={dividerLine}/><span style={dividerText}>— or enter an access code —</span><div style={dividerLine}/>
        </div>

        <button
          onClick={onOpenPasscode}
          style={{ width:'100%', padding:'12px 0', borderRadius:12, border:'1px solid rgba(212,184,112,0.35)', background:'rgba(212,184,112,0.06)', color:'#D4B870', fontSize:14, fontFamily:'Outfit,sans-serif', fontWeight:500, cursor:'pointer', margin:'12px 0' }}
        >
          Enter Access Code →
        </button>

        {/* Divider — or join waitlist — */}
        <div style={dividerStyle}>
          <div style={dividerLine}/><span style={dividerText}>— or join the waitlist —</span><div style={dividerLine}/>
        </div>

        {/* Waitlist form */}
        {waitlistDone ? (
          <p style={{ fontSize:13, color:'#6EC97A', fontFamily:'Outfit,sans-serif', marginTop:16 }}>✓ You're on the waitlist. We'll be in touch.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:14, textAlign:'left' }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={waitlistEmail}
              onChange={e => setWaitlistEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Name (optional)"
              value={waitlistName}
              onChange={e => setWaitlistName(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={submitWaitlist}
              style={{ width:'100%', padding:'12px 0', borderRadius:12, border:'1px solid rgba(114,166,183,0.22)', background:'rgba(10,5,26,0.88)', color:'#B0A0C8', fontSize:13, fontFamily:'Outfit,sans-serif', cursor:'pointer' }}
            >
              Join Waitlist →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── DharmaPassTab ────────────────────────────────────────────────────────────
export default function DharmaPassTab({ unlocked, onOpenPasscode }: DharmaPassTabProps) {
  const [localUnlocked, setLocalUnlocked] = useState(() => unlocked || hasAccess())

  // Poll every 5 s: grant new access if key was written, or expire timed sessions
  useEffect(() => {
    const id = setInterval(() => {
      const access = hasAccess()
      if (!access && localUnlocked) {
        localStorage.removeItem(TIMED_KEY)
        ;(window as any).showToast?.('Timed access expired — please re-enter your code', 'info')
      }
      setLocalUnlocked(access)
    }, 5000)
    return () => clearInterval(id)
  }, [localUnlocked])

  // Instant response when the passcode modal writes to localStorage in the same tab
  useEffect(() => {
    const onStorage = () => setLocalUnlocked(hasAccess())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (!localUnlocked) return <LockedView onOpenPasscode={onOpenPasscode} />
  return <UnlockedView />
}

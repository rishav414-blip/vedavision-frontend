import React, { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface TourOnboardingProps { onDone: () => void }

const STEPS = [
  { title:"Welcome to Celestial Noir", desc:"Your Vedic birth chart decoded. This 2-minute tour shows you what's here.", icon:"✦" },
  { title:"Cast Your Chart", desc:"Enter your birth name, date, time, and place. The chart calculates instantly using Swiss Ephemeris.", icon:"⬡" },
  { title:"Ask Jyoti", desc:"Jyoti is your AI guide — ask anything about your chart in English, Hindi, or Hinglish. She reflects, never predicts.", icon:"✦" },
  { title:"Explore Features", desc:"Birth chart, Daśā timeline, compatibility, digital altar, and more. Click any feature card to begin.", icon:"◈" },
  { title:"Reflection · Not Prediction", desc:"Everything here is a mirror for self-inquiry. The chart doesn't tell you what will happen — it shows patterns worth understanding.", icon:"◷" },
]

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 48 : -48, opacity:0 }),
  center: { x:0, opacity:1 },
  exit: (d: number) => ({ x: d > 0 ? -48 : 48, opacity:0 }),
}

export default function TourOnboarding({ onDone }: TourOnboardingProps) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [vis, setVis] = useState(true)
  const s = STEPS[step]

  function finish() { localStorage.setItem("vv_tour_done", "1"); setVis(false); setTimeout(onDone, 260) }
  function next() { if (step === STEPS.length - 1) { finish(); return } setDir(1); setStep(s => s + 1) }
  function back() { if (step === 0) return; setDir(-1); setStep(s => s - 1) }

  const navBtn = (label: string, onClick: () => void, primary = false) => (
    <button onClick={onClick} style={{ flex: primary ? 1 : undefined, padding:"9px 20px", borderRadius:8, background: primary ? "linear-gradient(135deg,rgba(212,184,112,0.18),rgba(169,155,217,0.18))" : "rgba(255,255,255,0.05)", border: primary ? "1px solid rgba(212,184,112,0.35)" : "1px solid rgba(255,255,255,0.10)", color: primary ? "#D4B870" : "#B0A0C8", fontSize:"0.82rem", fontFamily:"Inter,sans-serif", fontWeight: primary ? 600 : 500, cursor:"pointer", letterSpacing:"0.03em" }}>
      {label}
    </button>
  )

  return (
    <AnimatePresence>
      {vis && (
        <motion.div key="tour" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}
          style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(5,11,26,0.88)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ width:"100%", maxWidth:440, background:"rgba(13,10,30,0.95)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:16, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.7)" }}>
            {/* Progress bar */}
            <div style={{ height:3, background:"rgba(255,255,255,0.07)", position:"relative" }}>
              <motion.div animate={{ width:`${((step+1)/STEPS.length)*100}%` }} transition={{ duration:0.3, ease:"easeInOut" }}
                style={{ position:"absolute", left:0, top:0, height:"100%", background:"linear-gradient(90deg,#A99BD9,#D4B870)" }} />
            </div>
            <div style={{ padding:"32px 32px 24px", minHeight:280, display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize:10, fontFamily:"Inter,sans-serif", fontWeight:500, letterSpacing:"0.12em", textTransform:"uppercase", color:"#8090B5", marginBottom:20 }}>Step {step+1} of {STEPS.length}</div>
              <div style={{ flex:1, overflow:"hidden", position:"relative", minHeight:160 }}>
                <AnimatePresence custom={dir} mode="wait">
                  <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration:0.22, ease:"easeInOut" }}>
                    <div style={{ fontSize:"2rem", color:"#D4B870", lineHeight:1, marginBottom:12 }}>{s.icon}</div>
                    <h2 style={{ margin:"0 0 10px", fontFamily:"Syne,Inter,sans-serif", fontWeight:600, fontSize:"1.2rem", lineHeight:1.25, color:"#F0EBF4" }}>{s.title}</h2>
                    <p style={{ margin:0, fontFamily:"Inter,sans-serif", fontSize:"0.85rem", lineHeight:1.6, color:"#B0A0C8", maxWidth:340 }}>{s.desc}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:28 }}>
                {step > 0 && navBtn("Back", back)}
                {navBtn(step === STEPS.length - 1 ? "Get Started" : "Next →", next, true)}
              </div>
              <div style={{ textAlign:"center", marginTop:14 }}>
                <button onClick={finish} style={{ background:"none", border:"none", color:"#8090B5", fontSize:"0.78rem", fontFamily:"Inter,sans-serif", cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 }}>Skip tour</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

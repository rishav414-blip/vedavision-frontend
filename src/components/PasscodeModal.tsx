import React, { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface PasscodeModalProps { open: boolean; onClose: () => void; onUnlock: () => void }

const PERMANENT_CODES = ["CELESTIAL2026", "DHARMA", "VEDAVISION", "COSMICPASS"]
const TIMED_CODES     = ["CHARLIE"]   // 1-hour sessions
const TIMED_TTL_MS    = 60 * 60 * 1000
const ALL_VALID       = [...PERMANENT_CODES, ...TIMED_CODES]

export default function PasscodeModal({ open, onClose, onUnlock }: PasscodeModalProps) {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle"|"error"|"success">("idle")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) { setCode(""); setStatus("idle"); setTimeout(() => inputRef.current?.focus(), 80) } }, [open])

  function submit() {
    const upper = code.trim().toUpperCase()
    if (ALL_VALID.includes(upper)) {
      setStatus("success")
      if (TIMED_CODES.includes(upper)) {
        // 1-hour timed session
        localStorage.setItem("vv_dharma_timed", JSON.stringify({ code: upper, expiry: Date.now() + TIMED_TTL_MS }))
      } else {
        // Permanent
        localStorage.setItem("vv_dharma_pass", "1")
        localStorage.setItem("vv_dharma_access", JSON.stringify({ code: upper, activatedAt: Date.now() }))
      }
      setTimeout(() => { onUnlock(); onClose() }, 1500)
    } else {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  const borderCol = status === "error" ? "rgba(220,80,80,0.5)" : status === "success" ? "rgba(80,200,130,0.5)" : "rgba(255,255,255,0.15)"

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}
          style={{ position:"fixed", inset:0, zIndex:1800, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", backgroundColor:"rgba(13,10,30,0.80)", padding:24 }}
          onClick={e => { if (e.target === e.currentTarget && status !== "success") onClose() }}>
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.92 }} transition={{ duration:0.22, ease:[0.34,1.1,0.64,1] }}
            style={{ background:"rgba(13,10,30,0.97)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:20, maxWidth:400, width:"100%", padding:"40px 32px 36px", display:"flex", flexDirection:"column", alignItems:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.65)", position:"relative" }}>
            <button onClick={onClose} disabled={status === "success"} style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:8, color:"#B0A0C8", cursor:"pointer", fontSize:14, width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            <div style={{ fontSize:42, marginBottom:16 }}>🔑</div>
            <h2 style={{ fontFamily:"Outfit,sans-serif", fontSize:22, fontWeight:600, color:"#F0EBF4", margin:"0 0 10px", textAlign:"center" }}>Full Access Pass</h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:13, color:"#B0A0C8", textAlign:"center", lineHeight:1.6, margin:"0 0 24px" }}>Enter your Dharma Pass access code to unlock all features</p>
            <input ref={inputRef} value={code} onChange={e => { setCode(e.target.value); if (status==="error") setStatus("idle") }}
              onKeyDown={e => { if (e.key==="Enter" && code.trim() && status!=="success") submit() }}
              placeholder="ACCESS CODE" autoCapitalize="characters" autoComplete="off" disabled={status==="success"}
              style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${borderCol}`, borderRadius:10, color:"#F0EBF4", fontFamily:"Outfit,monospace", fontSize:20, fontWeight:500, letterSpacing:"0.18em", padding:"14px 20px", textAlign:"center", width:"100%", outline:"none", boxSizing:"border-box", transition:"border-color 0.18s" }} />
            <div style={{ fontFamily:"Inter,sans-serif", fontSize:13, marginTop:10, textAlign:"center", minHeight:20, color: status==="error" ? "#E07070" : status==="success" ? "#60CC90" : "transparent" }}>
              {status==="error" ? "Invalid code — try again" : status==="success" ? "✓ Access granted — unlocking…" : "."}
            </div>
            <button onClick={submit} disabled={!code.trim() || status==="success"}
              style={{ marginTop:18, width:"100%", padding:"13px 20px", background:"linear-gradient(135deg,#D4B870,#A08848)", border:"none", borderRadius:10, color:"#0D0A1E", cursor: !code.trim() || status==="success" ? "not-allowed" : "pointer", fontFamily:"Outfit,sans-serif", fontSize:15, fontWeight:600, opacity: !code.trim() || status==="success" ? 0.5 : 1 }}>
              Unlock Access
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

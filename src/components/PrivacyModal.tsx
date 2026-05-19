import React from "react"
import { AnimatePresence, motion } from "framer-motion"

interface PrivacyModalProps { open: boolean; onClose: () => void }

const S = {
  overlay: { position:"fixed" as const, inset:0, zIndex:1900, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", backgroundColor:"rgba(13,10,30,0.75)", padding:"24px 16px", overflowY:"auto" as const },
  card: { background:"rgba(13,10,30,0.95)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:16, maxWidth:600, width:"100%", maxHeight:"85vh", overflowY:"auto" as const, padding:32, position:"relative" as const, boxShadow:"0 24px 64px rgba(0,0,0,0.6)" },
  title: { fontFamily:"Outfit,sans-serif", fontSize:22, fontWeight:600, color:"#F0EBF4", margin:0 },
  closeBtn: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:8, color:"#B0A0C8", cursor:"pointer", fontSize:16, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center" },
  sectionLabel: { fontFamily:"Outfit,sans-serif", fontSize:11, fontWeight:700, color:"#D4B870", textTransform:"uppercase" as const, letterSpacing:"0.1em", marginBottom:6, display:"block" },
  sectionText: { fontFamily:"Inter,sans-serif", fontSize:13.5, lineHeight:1.7, color:"#B0A0C8", margin:0 },
  divider: { height:1, background:"rgba(255,255,255,0.07)", margin:"16px 0" },
  deleteBtn: { background:"rgba(220,80,80,0.12)", border:"1px solid rgba(220,80,80,0.35)", borderRadius:8, color:"#E07070", cursor:"pointer", fontFamily:"Inter,sans-serif", fontSize:13, fontWeight:500, padding:"9px 18px", marginTop:10, display:"inline-flex", alignItems:"center", gap:6 },
  footer: { fontFamily:"Inter,sans-serif", fontSize:11, color:"#8090B5", textAlign:"center" as const, marginTop:24, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.07)" },
}

const SECTIONS = [
  { label:"What We Collect", text:"We collect your name, date of birth, time of birth, and place of birth — solely for generating your Vedic birth chart. No other personal information is requested or retained." },
  { label:"How It's Stored", text:"All data you enter is saved in your browser's localStorage on your own device. Nothing is transmitted to or stored on any server except transiently during chart calculation." },
  { label:"Chart Calculations", text:"When you request a birth-chart calculation, your birth details are sent to a Render-hosted ephemeris backend. This data is processed in memory and is not retained after the response is returned." },
  { label:"Cookies", text:"We do not use cookies. All persistence is handled via browser localStorage under keys prefixed with vv_. You can clear this data at any time using the button below." },
  { label:"Third Parties", text:"The only third-party service used is Swiss Ephemeris (via our backend) for astronomical calculations. We do not share your data with advertisers or any other external services." },
]

function clearData() {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("vv_")) keys.push(k) }
  keys.forEach(k => localStorage.removeItem(k))
  window.location.reload()
}

export default function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div style={S.overlay} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.22 }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
          <motion.div style={S.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }} transition={{ duration:0.25, ease:"easeOut" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h2 style={S.title}>Privacy Policy</h2>
              <button style={S.closeBtn} onClick={onClose}>✕</button>
            </div>
            {SECTIONS.map((s, i) => (
              <div key={s.label}>
                <span style={S.sectionLabel}>{s.label}</span>
                <p style={S.sectionText}>{s.text}</p>
                {i < SECTIONS.length - 1 && <div style={S.divider} />}
              </div>
            ))}
            <div style={S.divider} />
            <span style={S.sectionLabel}>Delete Your Data</span>
            <p style={S.sectionText}>Permanently remove all locally stored data from this device. This cannot be undone.</p>
            <button style={S.deleteBtn} onClick={clearData}>⚠ Clear All Local Data & Reload</button>
            <div style={S.footer}>VedaVision · Celestial Noir · 2026</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

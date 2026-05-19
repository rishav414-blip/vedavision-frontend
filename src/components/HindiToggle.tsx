import React, { useEffect } from "react"

interface HindiToggleProps { lang: "en"|"hi"; onToggle: () => void }

export default function HindiToggle({ lang, onToggle }: HindiToggleProps) {
  const [hov, setHov] = React.useState(false)
  useEffect(() => { localStorage.setItem("vv_lang", lang) }, [lang])
  return (
    <button onClick={onToggle} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      aria-label={lang === "en" ? "Switch to Hindi" : "Switch to English"}
      style={{ position:"fixed", bottom:20, left:20, zIndex:400, display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"6px 13px", borderRadius:999, background:"rgba(13,10,30,0.92)", border: hov ? "1px solid #D4B870" : "1px solid rgba(255,255,255,0.10)", color: hov ? "#D4B870" : "#B0A0C8", fontSize: lang==="en" ? 13 : 14, fontFamily:"Inter,sans-serif", fontWeight:500, cursor:"pointer", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", boxShadow:"0 2px 10px rgba(0,0,0,0.35)", transition:"border-color 0.18s, color 0.18s", userSelect:"none", minWidth:40, height:30 }}>
      {lang === "en" ? "हिं" : "EN"}
    </button>
  )
}

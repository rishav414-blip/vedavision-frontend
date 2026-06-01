import React, { useState, useRef, useEffect } from "react"

interface ShareWidgetProps {
  chartData?: {
    native?:    { name?: string }
    lagna?:     { sign?: string }
    nakshatra?: { name?: string; pada?: number }
    dasha?:     { current?: { planet?: string; start?: string; end?: string } }
    yoga?:      string[]
  }
}

function buildSummaryText(chartData: ShareWidgetProps['chartData']): string {
  const name    = chartData?.native?.name
  const sign    = chartData?.lagna?.sign ?? ''
  const nak     = chartData?.nakshatra?.name ?? ''
  const pada    = chartData?.nakshatra?.pada
  const planet  = chartData?.dasha?.current?.planet
  const start   = chartData?.dasha?.current?.start
  const end     = chartData?.dasha?.current?.end
  const yogas   = (chartData?.yoga ?? []).slice(0, 3).join(', ')
  const dashaRange = start && end
    ? `${new Date(start).getFullYear()}–${new Date(end).getFullYear()}`
    : ''

  return [
    `🌟 My Vedic Birth Chart — Celestial Noir`,
    `Lagna: ${sign || '—'} | Nakshatra: ${nak}${pada ? ` Pada ${pada}` : ''}`,
    planet ? `Current Dasha: ${planet} MD${dashaRange ? ` (${dashaRange})` : ''}` : '',
    yogas  ? `Active Yogas: ${yogas}` : '',
    `Explore your chart: https://celestialnoir.app`,
  ].filter(Boolean).join('\n')
}

export default function ShareWidget({ chartData }: ShareWidgetProps) {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(false)
  const [hov, setHov] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const text = chartData?.native?.name
    ? `✦ My Vedic birth chart on Celestial Noir — ${chartData.native.name}, ${chartData.lagna?.sign ?? ""} rising, ${chartData.nakshatra?.name ?? ""} nakshatra. Reflect, not predict. vedavision-app.pages.dev`
    : "✦ Explore your Vedic birth chart on Celestial Noir — reflect, not predict. vedavision-app.pages.dev"

  const summaryText = buildSummaryText(chartData)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  async function handleClick() {
    if (navigator.share) { try { await navigator.share({ title:"Celestial Noir", text, url:location.href }); return } catch {} }
    setOpen(p => !p)
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(location.href) } catch {
      const t = document.createElement("textarea"); t.value = location.href; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t)
    }
    setOpen(false); setToast(true); setTimeout(() => setToast(false), 2000)
  }

  function shareWA() { window.open(`https://wa.me/?text=${encodeURIComponent(summaryText)}`, "_blank", "noopener"); setOpen(false) }

  async function copySummary() {
    try { await navigator.clipboard.writeText(summaryText) } catch {
      const t = document.createElement("textarea"); t.value = summaryText; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t)
    }
    setOpen(false); setToast(true); setTimeout(() => setToast(false), 2000)
  }

  async function saveAsImage() {
    try {
      const { default: html2canvas } = await import('html2canvas')
      const el = document.querySelector('[data-chart-export]') || document.querySelector('main') || document.body
      const canvas = await html2canvas(el as HTMLElement, {
        backgroundColor: '#0A0618',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = 'celestial-noir-chart.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      copySummary()
    }
    setOpen(false)
  }

  const pill: React.CSSProperties = { display:"inline-flex", alignItems:"center", gap:5, padding:"5px 13px", background: hov ? "rgba(212,184,112,0.10)" : "transparent", border:"1px solid #D4B870", borderRadius:999, color: hov ? "#F0C840" : "#D4B870", fontSize:12, fontFamily:"Inter,sans-serif", fontWeight:500, cursor:"pointer", transition:"background 0.18s, color 0.18s" }
  const item: React.CSSProperties = { display:"flex", alignItems:"center", gap:8, width:"100%", padding:"10px 15px", background:"transparent", border:"none", color:"#F0EBF4", fontSize:13, fontFamily:"Inter,sans-serif", cursor:"pointer", textAlign:"left" }

  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      {toast && <div style={{ position:"absolute", bottom:"calc(100% + 48px)", right:0, background:"rgba(13,10,30,0.97)", border:"1px solid rgba(212,184,112,0.35)", borderRadius:7, padding:"6px 13px", color:"#D4B870", fontSize:12, fontFamily:"Inter,sans-serif", whiteSpace:"nowrap" }}>Copied!</div>}
      <button style={pill} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={handleClick}>↗ Share</button>
      {open && (
        <div style={{ position:"absolute", bottom:"calc(100% + 8px)", right:0, minWidth:200, background:"rgba(13,10,30,0.95)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,0.5)", backdropFilter:"blur(12px)", overflow:"hidden", zIndex:100 }}>
          <button style={item} onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.07)")} onMouseLeave={e => (e.currentTarget.style.background="transparent")} onClick={copyLink}>📋 Copy link</button>
          <div style={{ height:1, background:"rgba(255,255,255,0.08)" }} />
          <button style={item} onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.07)")} onMouseLeave={e => (e.currentTarget.style.background="transparent")} onClick={copySummary}>✦ Copy chart summary</button>
          <div style={{ height:1, background:"rgba(255,255,255,0.08)" }} />
          <button style={item} onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.07)")} onMouseLeave={e => (e.currentTarget.style.background="transparent")} onClick={shareWA}>📱 Share on WhatsApp</button>
          <div style={{ height:1, background:"rgba(255,255,255,0.08)" }} />
          <button style={item} onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.07)")} onMouseLeave={e => (e.currentTarget.style.background="transparent")} onClick={saveAsImage}>🖼 Save as Image</button>
        </div>
      )}
    </div>
  )
}

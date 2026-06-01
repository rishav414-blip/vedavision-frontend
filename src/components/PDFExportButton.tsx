import React, { useState, useRef } from "react"
import { exportChartPDF, ChartData } from "@/lib/pdfExport"

interface PDFExportButtonProps { chartData?: ChartData }

const RAZORPAY_KEY = (import.meta as any).env?.VITE_RAZORPAY_KEY || 'rzp_test_YOUR_KEY_HERE'

function openRazorpayForPDF(onSuccess: () => void) {
  const options = {
    key: RAZORPAY_KEY,
    amount: 9900, // ₹99 in paise
    currency: 'INR',
    name: 'Celestial Noir',
    description: 'Full Birth Chart PDF Report',
    theme: { color: '#C0A860' },
    handler: () => {
      localStorage.setItem('vv_pdf_purchased', 'true')
      onSuccess()
    },
    modal: { ondismiss: () => {} },
  }
  const rzp = new (window as any).Razorpay(options)
  rzp.open()
}

export default function PDFExportButton({ chartData }: PDFExportButtonProps) {
  const [status, setStatus] = useState<"idle"|"loading"|"error">("idle")
  const [hov, setHov] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null)

  async function handleClick() {
    if (!chartData || status === "loading") return
    if (timer.current) { clearTimeout(timer.current); timer.current = null }

    if (localStorage.getItem('vv_pdf_purchased') === 'true') {
      // already purchased — export directly
      setStatus("loading")
      try { await exportChartPDF(chartData); setStatus("idle") }
      catch { setStatus("error"); timer.current = setTimeout(() => setStatus("idle"), 3000) }
    } else if (typeof (window as any).Razorpay !== 'undefined') {
      openRazorpayForPDF(async () => {
        setStatus("loading")
        try { await exportChartPDF(chartData); setStatus("idle") }
        catch { setStatus("error"); timer.current = setTimeout(() => setStatus("idle"), 3000) }
      })
    } else {
      // Razorpay not loaded — fallback confirm
      if (window.confirm('Unlock your full birth chart PDF for ₹99. Proceed?')) {
        localStorage.setItem('vv_pdf_purchased', 'true')
        setStatus("loading")
        try { await exportChartPDF(chartData); setStatus("idle") }
        catch { setStatus("error"); timer.current = setTimeout(() => setStatus("idle"), 3000) }
      }
    }
  }

  const disabled = !chartData || status === "loading"
  const label = status === "loading" ? "Generating…" : status === "error" ? "Failed — retry" : "↓ PDF"
  const borderCol = status === "error" ? "#CC5555" : "#D4B870"
  const color = status === "error" ? "#FF8080" : disabled ? "#4A3A6A" : hov ? "#F0EBF4" : "#D4B870"

  return (
    <button onClick={handleClick} disabled={disabled} title={!chartData ? "Cast your chart first" : undefined}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 13px", border:`1px solid ${borderCol}`, borderRadius:999, background: hov && !disabled ? "rgba(212,184,112,0.08)" : "transparent", color, fontSize:11, fontFamily:"Inter,sans-serif", fontWeight:500, letterSpacing:"0.04em", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled && status==="idle" ? 0.4 : 1, transition:"all 0.18s" }}>
      {status === "loading" && <span style={{ width:9, height:9, borderRadius:"50%", border:"1.5px solid #8B7CC8", borderTopColor:"transparent", animation:"vv-spin 0.7s linear infinite" }} />}
      {label}
      <style>{`@keyframes vv-spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  )
}

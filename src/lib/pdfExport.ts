export type { ChartData } from '@/lib/chartTypes'
import type { ChartData } from '@/lib/chartTypes'
import { YOGA_DESCRIPTIONS } from '@/lib/yogaData'

// Planet-specific dasha remedies (reflection practices, not prescriptions)
const DASHA_PRACTICES: Record<string, string> = {
  Sun:     "Morning sun salutation, Sunday charity to governance/authority causes, cultivate leadership with integrity.",
  Moon:    "Evening water offering, Monday fasting or light diet, journaling emotional patterns, time in nature.",
  Mars:    "Tuesday physical discipline (yoga, exercise), courage practices, service to the vulnerable.",
  Mercury: "Wednesday reading or writing practice, study of a classical text, charitable donation to education.",
  Jupiter: "Thursday gratitude reflection, study of dharmic texts, mentorship or teaching.",
  Venus:   "Friday creative practice (art, music, poetry), gratitude for beauty, charity to women's causes.",
  Saturn:  "Saturday discipline, fasting or simplicity, charity to elderly or labourers, consistency over intensity.",
  Rahu:    "Meditation on illusion and desire, charity to outcast communities, grounding practices.",
  Ketu:    "Silence and solitude, spiritual study, charity to spiritual seekers, releasing attachments.",
}

declare global { interface Window { jspdf?: { jsPDF: new (o?: object) => jsPDFInst } } }
interface jsPDFInst {
  setFont(f: string, s?: string): void; setFontSize(n: number): void
  setTextColor(r: number, g: number, b: number): void
  setFillColor(r: number, g: number, b: number): void
  setDrawColor(r: number, g: number, b: number): void
  rect(x: number, y: number, w: number, h: number, s?: string): void
  text(t: string, x: number, y: number, o?: object): void
  save(f: string): void
  internal: { pageSize: { getWidth(): number; getHeight(): number } }
}

function loadJsPDF() {
  return new Promise<void>((res, rej) => {
    if (window.jspdf?.jsPDF) { res(); return }
    const s = document.createElement("script")
    s.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"
    s.onload = () => res(); s.onerror = () => rej(new Error("jsPDF CDN failed"))
    document.head.appendChild(s)
  })
}

function h(hex: string): [number, number, number] {
  const c = hex.replace("#", "")
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)]
}
const v = (x: string|number|undefined) => (x == null || String(x).trim() === "") ? "—" : String(x)

export async function exportChartPDF(chart: ChartData): Promise<void> {
  await loadJsPDF()
  const { jsPDF } = window.jspdf!
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" })
  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()
  const ML = 18, CW = PW - 36
  let y = 0

  // Background
  doc.setFillColor(...h("#0A0618")); doc.rect(0, 0, PW, PH, "F")
  doc.setFillColor(...h("#100A22")); doc.rect(0, 0, PW, 36, "F")
  doc.setFillColor(...h("#D4B870")); doc.rect(0, 0, PW, 0.8, "F")
  doc.setFont("helvetica","bold"); doc.setFontSize(18); doc.setTextColor(...h("#D4B870"))
  doc.text("VedaVision — Celestial Noir", PW/2, 15, { align:"center" })
  doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...h("#B0A0C8"))
  doc.text("Reflection · Not Prediction", PW/2, 22, { align:"center" })
  doc.setFillColor(...h("#D4B870")); doc.rect(ML, 30, CW, 0.4, "F")
  y = 44

  function sec(title: string) {
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...h("#D4B870"))
    doc.setFillColor(...h("#D4B870")); doc.rect(ML, y-3.5, 2, 4.5, "F")
    doc.text(title.toUpperCase(), ML+4.5, y)
    y += 1.5; doc.setFillColor(...h("#2A1A3A")); doc.rect(ML, y, CW, 0.3, "F"); y += 4
  }
  function row(label: string, value: string) {
    doc.setFont("helvetica","normal"); doc.setFontSize(9)
    doc.setTextColor(...h("#8090B5")); doc.text(label, ML+4, y)
    doc.setTextColor(...h("#F0EBF4")); doc.text(value, ML+52, y); y += 6
  }

  sec("Native Details")
  row("Name", v(chart.native?.name)); row("Date of Birth", v(chart.native?.dob))
  row("Time of Birth", v(chart.native?.tob)); row("Place of Birth", v(chart.native?.pob))
  y += 5

  sec("Lagna (Ascendant)")
  row("Rising Sign", v(chart.lagna?.sign)); row("Lagna Lord", v(chart.lagna?.lord))
  y += 5

  sec("Moon Nakshatra")
  row("Nakshatra", v(chart.nakshatra?.name)); row("Pada", v(chart.nakshatra?.pada)); row("Lord", v(chart.nakshatra?.lord))
  y += 5

  sec("Active Daśā")
  const md = chart.dasha?.current; const ad = chart.dasha?.antardasha
  row(md?.planet ? `${md.planet} Mahādaśā` : "Mahādaśā", md?.start && md?.end ? `${md.start} – ${md.end}` : "—")
  row(ad?.planet ? `${ad.planet} Antardaśā` : "Antardaśā", ad?.end ? `Ends ${ad.end}` : "—")
  y += 5

  sec("Active Yogas")
  if (!chart.yoga?.length) { row("Yogas", "—") }
  else {
    chart.yoga.slice(0,10).forEach((yg, i) => {
      const desc = YOGA_DESCRIPTIONS[yg] ?? "A significant planetary combination present in the chart."
      doc.setFont("helvetica","normal"); doc.setFontSize(9)
      doc.setTextColor(...h("#8090B5")); doc.text(`${i+1}.`, ML+4, y)
      doc.setTextColor(...h("#F0EBF4")); doc.text(yg, ML+10, y)
      doc.setTextColor(...h("#8090B5")); doc.setFontSize(8)
      const descLines = doc.internal && (doc as any).splitTextToSize
        ? (doc as any).splitTextToSize(desc, CW - 20) as string[]
        : [desc]
      descLines.forEach((line: string) => { doc.text(line, ML+10, y + 5); y += 4.5 })
      y += 3
    })
  }
  y += 4

  // Remedies / practices section
  sec("Reflective Practices (Current Daśā)")
  const dashaPlanet = chart.dasha?.current?.planet ?? ''
  const practiceText = DASHA_PRACTICES[dashaPlanet]
  if (practiceText) {
    doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...h("#8090B5"))
    doc.text(`${dashaPlanet} Mahādaśā:`, ML+4, y); y += 5.5
    doc.setTextColor(...h("#F0EBF4")); doc.setFontSize(8.5)
    const practiceLines: string[] = (doc as any).splitTextToSize
      ? (doc as any).splitTextToSize(practiceText, CW - 8)
      : [practiceText]
    practiceLines.forEach((line: string) => { doc.text(line, ML+4, y); y += 5 })
  } else {
    row("Practices", "Cast your chart with a known birth time for personalised practices.")
  }
  y += 6

  // 5-Year Forecast summary
  sec("5-Year Dasha Themes (2026–2030)")
  const YEAR_THEMES: Record<string, string> = {
    Sun:     "Identity, authority, and vitality come into focus. Examine your sense of purpose.",
    Moon:    "Emotional currents deepen. Inner life and nurturing relationships take precedence.",
    Mars:    "Energy, initiative, and will. A period for disciplined action and testing courage.",
    Mercury: "Intellect, communication, and commerce. Learning and discernment are highlighted.",
    Jupiter: "Expansion, wisdom, and dharma. Growth through study, teaching, and generosity.",
    Venus:   "Refinement, beauty, and relationship. Pleasure and aesthetic sensibility flourish.",
    Saturn:  "Discipline, responsibility, and long-term structures. Patience yields lasting gains.",
    Rahu:    "Ambition, illusion, and worldly desire. Question what you are pursuing and why.",
    Ketu:    "Detachment, spirituality, and past patterns. A time to release and turn inward.",
  }
  const years = [2026, 2027, 2028, 2029, 2030]
  const sequence = chart.dasha?.sequence ?? []
  years.forEach(yr => {
    const yrStr = yr.toString()
    // Find which dasha period covers this year
    let planet = dashaPlanet
    if (sequence.length) {
      const match = sequence.find(s => {
        const start = s.start ? parseInt(s.start.slice(0,4)) : 0
        const end = s.end ? parseInt(s.end.slice(0,4)) : 9999
        return yr >= start && yr <= end
      })
      if (match?.planet) planet = match.planet
    }
    const theme = YEAR_THEMES[planet] ?? "Reflection on the themes of this planetary period."
    doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...h("#D4B870"))
    doc.text(`${yrStr}`, ML+4, y)
    doc.setFont("helvetica","normal"); doc.setTextColor(...h("#8090B5"))
    doc.text(`${planet} MD —`, ML+16, y)
    doc.setTextColor(...h("#F0EBF4"))
    const themeLines: string[] = (doc as any).splitTextToSize
      ? (doc as any).splitTextToSize(theme, CW - 35)
      : [theme]
    doc.text(themeLines[0], ML+38, y)
    y += 5.5
  })
  y += 4

  // Footer
  doc.setFillColor(...h("#2A1A3A")); doc.rect(ML, PH-18, CW, 0.3, "F")
  doc.setFont("helvetica","italic"); doc.setFontSize(7.5); doc.setTextColor(...h("#4A3A6A"))
  doc.text("This report is for reflection only. Not a prediction. Consult a qualified Jyotishi for in-person guidance.", PW/2, PH-12, { align:"center" })

  const name = chart.native?.name?.trim().replace(/\s+/g,"-").toLowerCase() || "chart"
  doc.save(`vedavision-chart-${name}.pdf`)
}

export interface ChartData {
  native?: { name?: string; dob?: string; tob?: string; pob?: string }
  lagna?: { sign?: string; lord?: string }
  nakshatra?: { name?: string; lord?: string; pada?: number }
  dasha?: { current?: { planet?: string; start?: string; end?: string }; antardasha?: { planet?: string; end?: string } }
  yoga?: string[]
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
  else { chart.yoga.slice(0,5).forEach((yg,i) => { doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...h("#8090B5")); doc.text(`${i+1}.`, ML+4, y); doc.setTextColor(...h("#F0EBF4")); doc.text(yg, ML+10, y); y += 6 }) }

  // Footer
  doc.setFillColor(...h("#2A1A3A")); doc.rect(ML, PH-18, CW, 0.3, "F")
  doc.setFont("helvetica","italic"); doc.setFontSize(7.5); doc.setTextColor(...h("#4A3A6A"))
  doc.text("This report is for reflection and self-inquiry. Not professional advice.", PW/2, PH-12, { align:"center" })

  const name = chart.native?.name?.trim().replace(/\s+/g,"-").toLowerCase() || "chart"
  doc.save(`vedavision-chart-${name}.pdf`)
}

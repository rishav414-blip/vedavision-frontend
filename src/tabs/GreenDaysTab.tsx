import React, { useState, useMemo } from "react"

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  gold:   "#D4B870",
  violet: "#8B7CC8",
  txt:    "#F0EBF4",
  txt2:   "#B0A0C8",
  txt3:   "#8090B5",
  bgCard: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  radius: 16,
}

const glassCard: React.CSSProperties = {
  background:   T.bgCard,
  border:       `1px solid ${T.border}`,
  borderRadius: T.radius,
  padding:      "20px",
}

// ─── Planet index map for deterministic hash ──────────────────────────────────
const PLANET_ORDER = ["Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury","Ketu","Venus"]

// ─── ChartData interface ──────────────────────────────────────────────────────
interface ChartData {
  native?:  { name?: string; dob?: string }
  lagna?:   { sign?: string }
  dasha?:   {
    current?:    { planet?: string; start?: string; end?: string }
    antardasha?: { planet?: string; end?: string }
    sequence?:   { planet: string; years: number; start: string; end: string }[]
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDashaIndex(chart: ChartData | null): number {
  const planet = chart?.dasha?.current?.planet ?? ""
  const idx    = PLANET_ORDER.indexOf(planet)
  return idx === -1 ? 3 : idx  // default Rahu index
}

/** Deterministic score 0-100 for a given day */
function dayScore(day: number, month: number, dashaIdx: number): number {
  return ((day * 7 + month * 13 + dashaIdx * 17) % 100 + 100) % 100
}

function energyLabel(score: number): string {
  if (score >= 70) return "Favorable"
  if (score >= 30) return "Neutral"
  return "Caution"
}

function energyColor(score: number): string {
  if (score >= 70) return "#4CAF6A"
  if (score >= 30) return T.txt3
  return "#D95F5F"
}

function energyBg(score: number): string {
  if (score >= 70) return "rgba(76,175,106,0.15)"
  if (score >= 30) return "transparent"
  return "rgba(217,95,95,0.12)"
}

function energyNote(score: number): string {
  if (score >= 85) return "The day carries strong thematic resonance with your current daśā. Intentions set now tend to meet less internal resistance — a suitable time for reflection and meaningful action."
  if (score >= 70) return "A generally supportive quality of time. Conversations, creative efforts, and outward gestures align with the period's undertones."
  if (score >= 50) return "Mixed currents — neither strongly auspicious nor inauspicious. Proceed with ordinary care and attentiveness."
  if (score >= 30) return "A quieter, more inward quality. Routine maintenance and rest align better than bold initiations."
  return "The day's thematic signature sits in tension with your current daśā pattern. Patience and reflection are preferable to major decisions or launches."
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DOW    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Returns 0=Mon … 6=Sun for the 1st of the month */
function firstDayOfWeek(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay() // 0=Sun
  return (jsDay + 6) % 7                          // shift so Mon=0
}

// ─── GreenDaysTab ─────────────────────────────────────────────────────────────
interface GreenDaysTabProps { chart: ChartData | null }

export default function GreenDaysTab({ chart }: GreenDaysTabProps) {
  const today      = new Date()
  const [year, setYear]     = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())
  const [selected, setSelected] = useState<number | null>(today.getDate())

  const dashaIdx  = useMemo(() => getDashaIndex(chart), [chart])
  const totalDays = useMemo(() => daysInMonth(year, month), [year, month])
  const startDow  = useMemo(() => firstDayOfWeek(year, month), [year, month])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  // Build calendar cells: nulls for leading blanks
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedScore = selected != null ? dayScore(selected, month + 1, dashaIdx) : null

  return (
    <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, color: T.txt }}>
            Green / Red Days
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.txt3 }}>
            Auspicious day patterns from daśā thematic rhythm
          </p>
        </div>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={prevMonth} style={navBtnStyle}>‹</button>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 14, fontWeight: 600, color: T.txt, minWidth: 120, textAlign: "center" }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={navBtnStyle}>›</button>
        </div>
      </div>

      {/* Calendar */}
      <div style={glassCard}>
        {/* Day-of-week headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 6 }}>
          {DOW.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, color: T.txt3, letterSpacing: "0.08em", paddingBottom: 4 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
          {cells.map((day, idx) => {
            if (day === null) return <div key={`blank-${idx}`} />

            const score    = dayScore(day, month + 1, dashaIdx)
            const isSelect = day === selected
            const isTod    = isToday(day)
            const dotColor = score >= 70 ? "#4CAF6A" : score < 30 ? "#D95F5F" : "transparent"

            return (
              <button
                key={day}
                onClick={() => setSelected(day === selected ? null : day)}
                style={{
                  background:   isSelect ? `${T.gold}22` : energyBg(score),
                  border:       isTod
                    ? `1.5px solid ${T.gold}`
                    : isSelect
                    ? `1px solid ${T.gold}66`
                    : "1px solid transparent",
                  borderRadius: 8,
                  padding:      "6px 2px 4px",
                  cursor:       "pointer",
                  display:      "flex",
                  flexDirection:"column",
                  alignItems:   "center",
                  gap:          2,
                  transition:   "background 0.15s",
                  minHeight:    40,
                }}
              >
                <span style={{ fontSize: 12, color: isTod ? T.gold : isSelect ? T.gold : T.txt, fontWeight: isTod ? 700 : 400 }}>
                  {day}
                </span>
                {(score >= 70 || score < 30) && (
                  <span style={{ fontSize: 7, color: dotColor, lineHeight: 1 }}>●</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          {[
            { color: "#4CAF6A", label: "Favorable" },
            { color: T.txt3,   label: "Neutral"   },
            { color: "#D95F5F", label: "Caution"   },
          ].map(({ color, label }) => (
            <span key={label} style={{ fontSize: 11, color: T.txt3, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color, fontSize: 9 }}>●</span> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Selected day detail */}
      {selected != null && selectedScore != null && (
        <div style={{ ...glassCard, borderLeft: `3px solid ${energyColor(selectedScore)}66` }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, color: T.txt }}>
              {selected} {MONTHS[month]}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              color: energyColor(selectedScore),
              background: `${energyColor(selectedScore)}18`,
              border: `1px solid ${energyColor(selectedScore)}44`,
              borderRadius: 6, padding: "2px 8px",
            }}>
              {energyLabel(selectedScore).toUpperCase()}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: T.txt2 }}>Day score:</span>
            <span style={{ fontSize: 22, fontFamily: "Syne, sans-serif", fontWeight: 700, color: energyColor(selectedScore) }}>
              {selectedScore}
              <span style={{ fontSize: 13, color: T.txt3, fontWeight: 400 }}>/100</span>
            </span>
          </div>

          <p style={{ margin: "0 0 10px", fontSize: 13, color: T.txt2, lineHeight: 1.65 }}>
            {energyNote(selectedScore)}
          </p>

          <p style={{ margin: 0, fontSize: 10, color: T.txt3, fontStyle: "italic" }}>
            Based on thematic daśā patterns — not live Panchang data
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Shared style ─────────────────────────────────────────────────────────────
const navBtnStyle: React.CSSProperties = {
  background:   T.bgCard,
  border:       `1px solid ${T.border}`,
  borderRadius: 8,
  color:        T.txt2,
  cursor:       "pointer",
  fontSize:     18,
  lineHeight:   1,
  padding:      "4px 10px",
  transition:   "border-color 0.15s",
}

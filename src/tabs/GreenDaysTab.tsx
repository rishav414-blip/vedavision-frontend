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

// ─── DayData type ─────────────────────────────────────────────────────────────
interface DayData {
  day:   number
  date:  string   // ISO "YYYY-MM-DD"
  score: number
}

// ─── Activity definitions ─────────────────────────────────────────────────────
const ACTIVITIES = [
  { value: "travel",      label: "✈ Travel",              minScore: 65, goodDays: [3,4] },
  { value: "investment",  label: "💰 Investment",          minScore: 72, goodDays: [4,5] },
  { value: "new_venture", label: "🚀 New Venture",         minScore: 75, goodDays: [0,4] },
  { value: "meeting",     label: "🤝 Important Meeting",   minScore: 60, goodDays: [1,3,4] },
  { value: "health",      label: "❤ Health & Healing",    minScore: 68, goodDays: [0,1] },
  { value: "learning",    label: "📚 Study & Learning",   minScore: 62, goodDays: [3,5] },
] as const

type ActivityValue = typeof ACTIVITIES[number]["value"]

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

function auspiciousLabel(score: number): string {
  if (score >= 80) return "Highly auspicious"
  if (score >= 70) return "Favourable"
  return "Suitable"
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DOW    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
const DOW_FULL = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Returns 0=Mon … 6=Sun for the 1st of the month */
function firstDayOfWeek(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay() // 0=Sun
  return (jsDay + 6) % 7                          // shift so Mon=0
}

function weekScoreColor(avg: number): string {
  if (avg >= 70) return T.gold
  if (avg >= 50) return "#B0A0C8"
  return "#E05050"
}

function formatDate(date: string): string {
  const d = new Date(date)
  const dow = DOW_FULL[d.getDay()]
  const day = d.getDate()
  const mon = MONTHS_SHORT[d.getMonth()]
  const yr  = d.getFullYear()
  return `${dow}, ${day} ${mon} ${yr}`
}

function findAuspiciousDates(
  activity: typeof ACTIVITIES[number],
  days: DayData[]
): DayData[] {
  return days
    .filter(d => d.score >= activity.minScore && activity.goodDays.includes(new Date(d.date).getDay() as never))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

// ─── GreenDaysTab ─────────────────────────────────────────────────────────────
interface GreenDaysTabProps { chart: ChartData | null }

export default function GreenDaysTab({ chart }: GreenDaysTabProps) {
  const today      = new Date()
  const [year, setYear]     = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())
  const [selected, setSelected] = useState<number | null>(today.getDate())
  const [activity, setActivity] = useState<ActivityValue>("travel")
  const [results, setResults]   = useState<DayData[] | null>(null)
  const [searched, setSearched] = useState(false)

  const dashaIdx  = useMemo(() => getDashaIndex(chart), [chart])
  const totalDays = useMemo(() => daysInMonth(year, month), [year, month])
  const startDow  = useMemo(() => firstDayOfWeek(year, month), [year, month])

  // Build all day data for the current month
  const allDays: DayData[] = useMemo(() =>
    Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1
      const d   = new Date(year, month, day)
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      return { day, date: iso, score: dayScore(day, month + 1, dashaIdx) }
    }),
  [totalDays, year, month, dashaIdx])

  // Weekly summaries: week 1 = days 1-7, week 2 = 8-14, week 3 = 15-21, week 4 = 22-end
  const weekSummaries = useMemo(() => {
    const ranges = [
      { label: "Week 1", from: 1,  to: 7  },
      { label: "Week 2", from: 8,  to: 14 },
      { label: "Week 3", from: 15, to: 21 },
      { label: "Week 4", from: 22, to: totalDays },
    ]
    return ranges.map(({ label, from, to }) => {
      const days = allDays.filter(d => d.day >= from && d.day <= to)
      const avg  = days.length > 0 ? Math.round(days.reduce((s, d) => s + d.score, 0) / days.length) : 0
      const green = days.filter(d => d.score >= 70).length
      return { label, avg, green, count: days.length }
    })
  }, [allDays, totalDays])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelected(null)
    setResults(null)
    setSearched(false)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelected(null)
    setResults(null)
    setSearched(false)
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

  function handleFind() {
    const act = ACTIVITIES.find(a => a.value === activity)!
    setResults(findAuspiciousDates(act, allDays))
    setSearched(true)
  }

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

      {/* ── ENHANCEMENT 1: Weekly Summary Cards ───────────────────────────────── */}
      <div>
        <h3 style={{ margin: "0 0 12px", fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 600, color: T.txt2, letterSpacing: "0.06em" }}>
          WEEKLY SUMMARY
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {weekSummaries.map(({ label, avg, green, count }) => {
            if (count === 0) return null
            const color = weekScoreColor(avg)
            return (
              <div
                key={label}
                style={{
                  background:   "rgba(255,255,255,0.04)",
                  border:       "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding:      "14px 16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.txt2, letterSpacing: "0.05em" }}>
                    {label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 18, fontFamily: "Syne, sans-serif", fontWeight: 700, color }}>
                    {avg}
                    <span style={{ fontSize: 10, color: T.txt3, fontWeight: 400 }}>/100</span>
                  </span>
                </div>

                <div style={{ fontSize: 11, color: T.txt3, marginBottom: 10 }}>
                  {green} green day{green !== 1 ? "s" : ""}
                </div>

                {/* Progress bar */}
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width:  `${avg}%`,
                    borderRadius: 2,
                    background: color,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── ENHANCEMENT 2: Find Auspicious Dates Tool ─────────────────────────── */}
      <div style={{ ...glassCard, display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0, fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 600, color: T.txt, letterSpacing: "0.06em" }}>
          FIND AUSPICIOUS DATES
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 11, color: T.txt3, letterSpacing: "0.07em" }}>ACTIVITY</label>
          <select
            value={activity}
            onChange={e => {
              setActivity(e.target.value as ActivityValue)
              setResults(null)
              setSearched(false)
            }}
            style={{
              background:   "rgba(255,255,255,0.06)",
              border:       "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color:        T.txt,
              fontSize:     13,
              padding:      "10px 12px",
              cursor:       "pointer",
              outline:      "none",
              width:        "100%",
              appearance:   "none",
              WebkitAppearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238090B5'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: 32,
            }}
          >
            {ACTIVITIES.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFind}
          style={{
            background:   "linear-gradient(135deg,#C0A860,#D4B870)",
            border:       "none",
            borderRadius: 8,
            color:        "#0A0618",
            cursor:       "pointer",
            fontSize:     13,
            fontWeight:   700,
            letterSpacing:"0.05em",
            padding:      "11px 20px",
            textAlign:    "center",
            transition:   "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          Find Auspicious Dates
        </button>

        {/* Results */}
        {searched && results !== null && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: T.txt3, fontStyle: "italic", lineHeight: 1.6 }}>
                No ideal dates found this month for this activity. Try a neighbouring month.
              </p>
            ) : (
              results.map(d => (
                <div
                  key={d.date}
                  style={{
                    background:   "rgba(255,255,255,0.04)",
                    border:       "1px solid rgba(255,255,255,0.08)",
                    borderLeft:   "3px solid #4CAF6A",
                    borderRadius: 10,
                    padding:      "12px 14px",
                    display:      "flex",
                    justifyContent: "space-between",
                    alignItems:   "center",
                    gap:          12,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.txt }}>
                      {formatDate(d.date)}
                    </span>
                    <span style={{ fontSize: 11, color: T.txt3 }}>
                      {auspiciousLabel(d.score)}
                    </span>
                  </div>
                  <div style={{
                    background:   "rgba(192,168,96,0.12)",
                    border:       "1px solid rgba(192,168,96,0.25)",
                    borderRadius: 8,
                    padding:      "4px 10px",
                    textAlign:    "center",
                    flexShrink:   0,
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.gold, fontFamily: "Syne, sans-serif" }}>
                      {d.score}
                    </span>
                    <span style={{ fontSize: 10, color: T.txt3 }}>/100</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
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

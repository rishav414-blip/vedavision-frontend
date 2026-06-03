import React, { useState, useMemo, useRef, useEffect } from "react"
import type { ChartData } from '@/lib/chartTypes'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  gold:   "#D4B870",
  violet: "#8B7CC8",
  txt:    "#F0EBF4",
  txt2:   "#D0C8E0",
  txt3:   "#A0A8C8",
  bgCard: "rgba(8,4,22,0.75)",
  border: "rgba(114,166,183,0.2)",
  radius: 16,
}

const glassCard: React.CSSProperties = {
  background:           T.bgCard,
  border:               `1px solid ${T.border}`,
  borderRadius:         T.radius,
  padding:              "20px",
  backdropFilter:       "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
}

// ─── Planet data ───────────────────────────────────────────────────────────────
const PLANET_COLORS: Record<string, string> = {
  Sun:     "#F5C842",
  Moon:    "#D0D8F0",
  Mercury: "#7EC8A0",
  Venus:   "#E48DB0",
  Mars:    "#E05050",
  Jupiter: "#F0A830",
  Saturn:  "#A08050",
  Rahu:    "#8855CC",
  Ketu:    "#CC8855",
}

const PLANET_THEMES: Record<string, string> = {
  Sun:     "Authority, identity, and visibility define this window. The self is drawn into the light — a time to examine where you seek recognition and why.",
  Moon:    "Emotional cycles and intuitive currents run deep. Patterns around home, belonging, and mental habits surface for honest examination.",
  Mars:    "Energy, courage, and directed action characterise this span. The invitation is to channel drive constructively rather than reactively.",
  Mercury: "Intellect, communication, and adaptability are the keynotes. Networks and commerce receive attention; notice the quality of your thinking.",
  Jupiter: "Expansion, wisdom, and dharmic alignment arise naturally. Ask what you are growing toward and whether it echoes your deeper purpose.",
  Venus:   "Creativity, relationships, and aesthetic sensibility come forward. What you truly value becomes visible through what you are drawn toward.",
  Saturn:  "Discipline, restructuring, and mature responsibility define this period. Honest effort is rewarded; shortcuts and avoidance are exposed.",
  Rahu:    "Ambition, reinvention, and fascination with the unfamiliar drive this window. What calls insistently — and what might that longing conceal?",
  Ketu:    "Detachment and a pull toward the interior. Disillusionment with the material arrives not as failure but as invitation toward subtler understanding.",
}

const FALLBACK_COLOR = T.violet
const FALLBACK_THEME = "A period of planetary transition inviting reflection on cycles and the quality of attention you bring to daily life."

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseYear(s?: string): number | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d.getFullYear()
}

function parseDate(s?: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function formatShort(s?: string): string {
  const d = parseDate(s)
  if (!d) return "—"
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
}

interface DashaSegment {
  planet: string
  start: string
  end: string
  years: number
  startYear: number
  endYear: number
  totalYears: number
}

function buildSegments(sequence?: { planet: string; years: number; start: string; end: string }[]): DashaSegment[] {
  if (!sequence?.length) return []
  return sequence.map(p => ({
    ...p,
    startYear: parseYear(p.start) ?? 0,
    endYear:   parseYear(p.end)   ?? 0,
    totalYears: p.years,
  }))
}

function findActiveSegment(segments: DashaSegment[], year: number): DashaSegment | null {
  return segments.find(s => year >= s.startYear && year <= s.endYear) ?? null
}

// ─── Sub-components ───────────────────────────────────────────────────────────
interface PlanetGlyphProps { planet: string; size?: number }

function PlanetGlyph({ planet, size = 48 }: PlanetGlyphProps) {
  const color   = PLANET_COLORS[planet] ?? FALLBACK_COLOR
  const initial = planet.charAt(0)
  return (
    <div style={{
      width:          size,
      height:         size,
      borderRadius:   "50%",
      background:     `${color}18`,
      border:         `2px solid ${color}55`,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      flexShrink:     0,
      boxShadow:      `0 0 18px ${color}22`,
    }}>
      <span style={{ color, fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: size * 0.4 }}>
        {initial}
      </span>
    </div>
  )
}

// ─── TimeSliderTab ────────────────────────────────────────────────────────────
interface TimeSliderTabProps { chart: ChartData | null }

export default function TimeSliderTab({ chart }: TimeSliderTabProps) {
  const currentYear = new Date().getFullYear()
  const dobYear     = parseYear(chart?.native?.dob) ?? currentYear - 30

  const minYear = dobYear
  const maxYear = dobYear + 120

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const timelineRef = useRef<HTMLDivElement>(null)

  const segments = useMemo(() => buildSegments(chart?.dasha?.sequence), [chart])
  const active   = useMemo(() => findActiveSegment(segments, selectedYear), [segments, selectedYear])

  // Auto-scroll the timeline marker into view when year changes
  useEffect(() => {
    const el = timelineRef.current?.querySelector<HTMLElement>(".ts-marker")
    if (el) el.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" })
  }, [selectedYear])

  const totalSpan  = maxYear - minYear || 120
  const markerLeft = `${((selectedYear - minYear) / totalSpan) * 100}%`

  // Compute marker position within timeline bar
  function segmentWidth(seg: DashaSegment): string {
    return `${(seg.totalYears / 120) * 100}%`
  }

  const planetColor = active ? (PLANET_COLORS[active.planet] ?? FALLBACK_COLOR) : T.violet
  const planetTheme = active ? (PLANET_THEMES[active.planet] ?? FALLBACK_THEME) : FALLBACK_THEME

  return (
    <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, color: T.txt }}>
          Time-Slider
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.txt3, letterSpacing: "0.04em" }}>
          Explore your Daśā periods across time
        </p>
      </div>

      {/* No chart state */}
      {!chart || !segments.length ? (
        <div style={{ ...glassCard, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>⏱</div>
          <p style={{ margin: 0, color: T.txt2, fontSize: 14 }}>
            Cast your chart to explore your Daśā timeline
          </p>
        </div>
      ) : (
        <>
          {/* Year range selector */}
          <div style={glassCard}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 14, color: T.txt3, letterSpacing: "0.08em" }}>
                {minYear} — {maxYear}
              </span>
              <span style={{
                fontFamily: "Syne, sans-serif",
                fontSize:   36,
                fontWeight: 700,
                color:      T.gold,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}>
                {selectedYear}
              </span>
            </div>

            {/* Styled range input */}
            <style>{`
              .ts-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 4px; background: rgba(114,166,183,0.25); outline: none; cursor: pointer; accent-color: #D4B870; }
              .ts-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #D4B870; cursor: pointer; box-shadow: 0 0 8px rgba(212,184,112,0.6); }
              .ts-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #D4B870; cursor: pointer; border: none; box-shadow: 0 0 8px rgba(212,184,112,0.6); }
              .ts-slider::-webkit-slider-runnable-track { height: 6px; border-radius: 4px; background: rgba(114,166,183,0.25); }
            `}</style>
            <input
              type="range"
              min={minYear}
              max={maxYear}
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="ts-slider"
              style={{ width: "100%" }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 12, color: T.txt3 }}>Birth year</span>
              <span style={{ fontSize: 12, color: T.txt3 }}>+120 yrs</span>
            </div>
          </div>

          {/* Active period display */}
          <div style={{
            ...glassCard,
            borderLeft: `3px solid ${planetColor}66`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}>
            {active ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <PlanetGlyph planet={active.planet} size={52} />
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 700, color: planetColor }}>
                        {active.planet}
                      </span>
                      <span style={{ fontSize: 14, color: T.txt3, letterSpacing: "0.07em" }}>Mahādaśā</span>
                    </div>
                    <span style={{ fontSize: 14, color: T.txt2 }}>
                      {formatShort(active.start)} – {formatShort(active.end)}
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: T.txt2, lineHeight: 1.65 }}>
                  {planetTheme}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: T.txt3, fontStyle: "italic" }}>
                  Reflection only — not a prediction of events in {selectedYear}
                </p>
              </>
            ) : (
              <p style={{ margin: 0, color: T.txt3, fontSize: 13 }}>
                No daśā period found for {selectedYear}
              </p>
            )}
          </div>

          {/* Period timeline bar */}
          <div style={glassCard}>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: T.txt3, letterSpacing: "0.07em" }}>
              PERIOD TIMELINE
            </p>
            <div
              ref={timelineRef}
              style={{ overflowX: "auto", paddingBottom: 8, position: "relative" }}
            >
              {/* Outer track */}
              <div style={{ position: "relative", height: 56, minWidth: 600, display: "flex" }}>
                {/* Segments */}
                {segments.map((seg, idx) => {
                  const color   = PLANET_COLORS[seg.planet] ?? FALLBACK_COLOR
                  const isActive = seg.planet === active?.planet && seg.start === active?.start
                  return (
                    <div
                      key={seg.planet + seg.start}
                      title={`${seg.planet}: ${formatShort(seg.start)} – ${formatShort(seg.end)}`}
                      style={{
                        width:          segmentWidth(seg),
                        flexShrink:     0,
                        background:     isActive ? `${color}30` : `${color}12`,
                        borderTop:      `2px solid ${color}${isActive ? "CC" : "55"}`,
                        borderRight:    idx < segments.length - 1 ? `1px solid rgba(114,166,183,0.12)` : "none",
                        display:        "flex",
                        flexDirection:  "column",
                        alignItems:     "center",
                        justifyContent: "center",
                        gap:            2,
                        cursor:         "default",
                        transition:     "background 0.2s",
                        position:       "relative",
                      }}
                    >
                      <span style={{ fontSize: 13, color, fontWeight: isActive ? 700 : 400, whiteSpace: "nowrap" }}>
                        {seg.planet}
                      </span>
                      <span style={{ fontSize: 11, color: T.txt3, whiteSpace: "nowrap" }}>
                        {seg.totalYears}y
                      </span>
                    </div>
                  )
                })}

                {/* Marker line */}
                <div
                  className="ts-marker"
                  style={{
                    position:  "absolute",
                    top:       0,
                    bottom:    0,
                    left:      markerLeft,
                    width:     2,
                    background: T.gold,
                    boxShadow: `0 0 8px ${T.gold}88`,
                    zIndex:    2,
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{
                    position:  "absolute",
                    top:       -6,
                    left:      "50%",
                    transform: "translateX(-50%)",
                    width:     8,
                    height:    8,
                    borderRadius: "50%",
                    background: T.gold,
                  }} />
                </div>
              </div>

              {/* Year labels */}
              <div style={{ position: "relative", height: 16, minWidth: 600 }}>
                {segments.map(seg => {
                  const leftPct = ((seg.startYear - minYear) / totalSpan) * 100
                  return (
                    <span
                      key={seg.planet + "yr" + seg.start}
                      style={{
                        position:  "absolute",
                        left:      `${leftPct}%`,
                        fontSize:  11,
                        color:     T.txt3,
                        transform: "translateX(-50%)",
                        whiteSpace:"nowrap",
                      }}
                    >
                      {seg.startYear}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

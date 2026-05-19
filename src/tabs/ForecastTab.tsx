import React, { useMemo } from "react"

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  gold:    "#D4B870",
  violet:  "#8B7CC8",
  txt:     "#F0EBF4",
  txt2:    "#B0A0C8",
  txt3:    "#8090B5",
  bgCard:  "rgba(255,255,255,0.04)",
  border:  "rgba(255,255,255,0.08)",
  radius:  16,
}

const glassCard: React.CSSProperties = {
  background:   T.bgCard,
  border:       `1px solid ${T.border}`,
  borderRadius: T.radius,
  padding:      "20px",
}

// ─── Planet themes ────────────────────────────────────────────────────────────
const PLANET_THEMES: Record<string, { color: string; desc: string }> = {
  Sun:     { color: "#F5C842", desc: "A period emphasising authority, identity and visibility. Themes of leadership, recognition and the assertion of self come into sharp focus — a time to examine where you seek acknowledgement and why." },
  Moon:    { color: "#D0D8F0", desc: "Emotional cycles and intuitive currents are heightened. Patterns around home, belonging and mental habits surface for examination. Sensitivity deepens; what do recurring feelings reflect back about your inner landscape?" },
  Mars:    { color: "#E05050", desc: "Energy, courage and directed action characterise this window. Ambition sharpens; so does impatience. The invitation is to channel drive constructively rather than reactively." },
  Mercury: { color: "#7EC8A0", desc: "Intellect, communication and adaptability are the keynotes. Commerce, writing and networks receive attention. Notice the quality of your thinking and the tone of your exchanges during this period." },
  Jupiter: { color: "#F0A830", desc: "Expansion, wisdom and dharmic alignment arise naturally. Abundance — material or philosophical — becomes accessible. Ask what you are growing toward and whether it aligns with your deeper purpose." },
  Venus:   { color: "#E48DB0", desc: "Creativity, relationships and aesthetic sensibility come forward. Comfort and pleasure are themes, as is the question of what you truly value. Connections begun or deepened here carry Venusian imprints." },
  Saturn:  { color: "#A08050", desc: "Discipline, restructuring and mature responsibility define this span. Saturn's gaze rarely flatters illusions — this period rewards honest effort and steady service while exposing shortcuts and avoidance." },
  Rahu:    { color: "#8855CC", desc: "Ambition, reinvention and fascination with the unfamiliar drive this window. Foreign influence, obsessive focus and sudden pivots are possible. What calls insistently, and what might that longing conceal?" },
  Ketu:    { color: "#CC8855", desc: "Detachment, spirituality and a pull toward the interior characterise this period. Disillusionment with the material arises — not as failure, but as invitation toward subtler understanding and liberation from habit." },
}

const FALLBACK_THEME = { color: T.violet, desc: "A period of planetary transition inviting reflection on patterns, cycles and the quality of attention you bring to daily life." }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDate(s?: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

function formatRange(start?: string, end?: string): string {
  const fmt = (s?: string) => {
    const d = parseDate(s)
    if (!d) return "—"
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" })
  }
  return `${fmt(start)} – ${fmt(end)}`
}

function clampPercent(start: Date, end: Date, now: Date): number {
  const total = end.getTime() - start.getTime()
  if (total <= 0) return 100
  const elapsed = now.getTime() - start.getTime()
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

// ─── Sub-components ───────────────────────────────────────────────────────────
interface PlanetGlyphProps { planet: string; size?: number }

function PlanetGlyph({ planet, size = 38 }: PlanetGlyphProps) {
  const theme = PLANET_THEMES[planet] ?? FALLBACK_THEME
  const initial = planet.charAt(0).toUpperCase()
  return (
    <div style={{
      width:          size,
      height:         size,
      borderRadius:   "50%",
      background:     `${theme.color}18`,
      border:         `1.5px solid ${theme.color}55`,
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      flexShrink:     0,
    }}>
      <span style={{ color: theme.color, fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: size * 0.42 }}>
        {initial}
      </span>
    </div>
  )
}

interface PeriodCardProps {
  planet: string
  start?: string
  end?: string
  status: "current" | "upcoming" | "past"
}

function PeriodCard({ planet, start, end, status }: PeriodCardProps) {
  const theme      = PLANET_THEMES[planet] ?? FALLBACK_THEME
  const now        = new Date()
  const startDate  = parseDate(start)
  const endDate    = parseDate(end)
  const pct        = status === "current" && startDate && endDate
    ? clampPercent(startDate, endDate, now)
    : null

  const badgeStyle: React.CSSProperties = status === "current"
    ? { background: `${T.gold}20`, color: T.gold,   border: `1px solid ${T.gold}55`,   fontSize: 10, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.1em", fontWeight: 700 }
    : status === "upcoming"
    ? { background: `${T.violet}18`, color: T.violet, border: `1px solid ${T.violet}44`, fontSize: 10, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.1em", fontWeight: 600 }
    : { display: "none" }

  return (
    <div style={{
      ...glassCard,
      borderLeft: `3px solid ${theme.color}66`,
      display:    "flex",
      flexDirection: "column",
      gap:        12,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Glyph + dates */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <PlanetGlyph planet={planet} />
          <span style={{ fontSize: 10, color: T.txt3, whiteSpace: "nowrap" }}>
            {formatRange(start, end)}
          </span>
        </div>

        {/* Name + label */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, color: theme.color }}>
              {planet}
            </span>
            <span style={{ fontSize: 11, color: T.txt3, letterSpacing: "0.08em" }}>Mahādaśā</span>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: T.txt2, lineHeight: 1.6 }}>
            {theme.desc}
          </p>
        </div>

        {/* Badge */}
        <div style={{ flexShrink: 0, paddingTop: 2 }}>
          {status !== "past" && <span style={badgeStyle}>{status === "current" ? "CURRENT" : "UPCOMING"}</span>}
        </div>
      </div>

      {/* Progress bar */}
      {pct !== null && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: T.txt3 }}>Period elapsed</span>
            <span style={{ fontSize: 10, color: T.gold }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${T.gold}88, ${T.gold})`, borderRadius: 2, transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p style={{ margin: 0, fontSize: 10, color: T.txt3, fontStyle: "italic", letterSpacing: "0.03em" }}>
        Reflection only — not a prediction of events
      </p>
    </div>
  )
}

// ─── ChartData interface ──────────────────────────────────────────────────────
interface ChartData {
  native?: { name?: string; dob?: string }
  lagna?:  { sign?: string }
  dasha?:  {
    current?:     { planet?: string; start?: string; end?: string }
    antardasha?:  { planet?: string; end?: string }
    sequence?:    { planet: string; years: number; start: string; end: string }[]
  }
}

// ─── ForecastTab ──────────────────────────────────────────────────────────────
interface ForecastTabProps { chart: ChartData | null }

export default function ForecastTab({ chart }: ForecastTabProps) {
  const now = new Date()

  const periods = useMemo(() => {
    const seq = chart?.dasha?.sequence
    if (!seq?.length) return []
    const fiveYearsOut = new Date(now)
    fiveYearsOut.setFullYear(fiveYearsOut.getFullYear() + 5)

    return seq
      .filter(p => {
        const end = parseDate(p.end)
        return end && end >= now
      })
      .filter(p => {
        const start = parseDate(p.start)
        return start && start <= fiveYearsOut
      })
      .slice(0, 5)
      .map(p => {
        const start = parseDate(p.start)
        const end   = parseDate(p.end)
        let status: "current" | "upcoming" | "past" = "upcoming"
        if (start && end && now >= start && now <= end) status = "current"
        else if (end && now > end) status = "past"
        return { ...p, status }
      })
  }, [chart])

  return (
    <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, color: T.txt }}>
          5-Year Forecast
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.txt3, letterSpacing: "0.04em" }}>
          Thematic Daśā windows — reflection, not prediction
        </p>
      </div>

      {/* Content */}
      {!chart || !periods.length ? (
        <div style={{ ...glassCard, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>☿</div>
          <p style={{ margin: 0, color: T.txt2, fontSize: 14 }}>
            Cast your chart to see your Daśā timeline
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {periods.map(p => (
            <PeriodCard
              key={p.planet + p.start}
              planet={p.planet}
              start={p.start}
              end={p.end}
              status={p.status}
            />
          ))}
        </div>
      )}
    </div>
  )
}

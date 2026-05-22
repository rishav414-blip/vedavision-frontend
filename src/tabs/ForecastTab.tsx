import React, { useMemo, useState } from "react"

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

// ─── 5-Year Thematic Outlook data ────────────────────────────────────────────
interface YearOutlook {
  year: number
  dashaTheme: string
  signal: string
  score: number
  dashaColor: string
  career: { stars: number; narrative: string; hardTruth: string; actions: string[] }
  wealth:  { stars: number; narrative: string; hardTruth: string; actions: string[] }
  health: string
  do: string[]
  dont: string[]
  keyMonths: string[]
}

const YEARLY_OUTLOOK: YearOutlook[] = [
  {year:2026,dashaTheme:"Saturn · Mercury Window",signal:"medium",score:62,dashaColor:"#A08050",
   career:{stars:3,narrative:"Methodical consolidation. Saturn rewards sustained effort — groundwork laid now shapes the next three years. Mercury quickens analytical work.",hardTruth:"Ambition without systems fails in Saturn periods. Build infrastructure before seeking the stage.",actions:["Systematise one core workflow","Invest in a skill that compounds over 3+ years","Document decisions rigorously"]},
   wealth:{stars:3,narrative:"Steady accumulation is possible; rapid gains unlikely. Focus on reducing unnecessary expenditure.",hardTruth:"Build reserves, not deploy them. Patience is the wealth strategy.",actions:["Review recurring costs","Prioritise debt reduction","Begin one long-horizon savings vehicle"]},
   health:"Saturn rewards sleep discipline and structured movement.",
   do:["Maintain consistent routines","Complete what was started","Honour commitments without overcommitting"],
   dont:["Launch ventures without infrastructure","Neglect rest","Underestimate how long things take"],
   keyMonths:["Mar 2026","Jul 2026","Nov 2026"]},
  {year:2027,dashaTheme:"Saturn · Ketu Depth",signal:"low",score:48,dashaColor:"#CC8855",
   career:{stars:2,narrative:"Ketu brings withdrawal from the external. Creative and spiritual work flourishes; visibility-seeking does not.",hardTruth:"A refining year, not a building year. Forcing external progress will exhaust you.",actions:["Retreat from non-essential commitments","Deepen mastery of existing skills","Identify what no longer aligns"]},
   wealth:{stars:2,narrative:"Ketu is indifferent to material accumulation. Financial caution advised.",hardTruth:"Preservation outperforms growth this year.",actions:["Hold positions rather than entering new ones","Complete a financial audit","Reduce complexity in financial life"]},
   health:"Rest is productive. Honour the body's signals.",
   do:["Meditate or maintain contemplative practice","Release what no longer serves","Focus inward"],
   dont:["Seek public recognition","Over-extend financially","Ignore burnout signals"],
   keyMonths:["Feb 2027","Jun 2027","Oct 2027"]},
  {year:2028,dashaTheme:"Saturn · Venus Emergence",signal:"high",score:78,dashaColor:"#E48DB0",
   career:{stars:4,narrative:"Venus within Saturn brings creative energy into disciplined form. Partnerships and aesthetic work are highlighted.",hardTruth:"Results arrive for those who prepared. Harvest season — only for those who planted.",actions:["Formalise a key partnership","Bring a creative project to completion","Invest in presentation quality"]},
   wealth:{stars:4,narrative:"Financial flows improve as Saturn meets Venus. Real estate and creative ventures favoured.",hardTruth:"Gains require active stewardship. Do not become passive once momentum arrives.",actions:["Rebalance investment portfolio","Explore a creative monetisation avenue","Negotiate improved terms"]},
   health:"Energy returns. Enjoy it without over-scheduling.",
   do:["Collaborate actively","Launch what was prepared in 2026-27","Invest in relationships"],
   dont:["Rush past this window","Neglect foundations built earlier","Overcommit"],
   keyMonths:["Jan 2028","May 2028","Sep 2028"]},
  {year:2029,dashaTheme:"Saturn · Sun Authority",signal:"high",score:74,dashaColor:"#F5C842",
   career:{stars:4,narrative:"Sun brings leadership and visibility themes. Authority earned through sustained effort can now be expressed publicly.",hardTruth:"Authentic authority is earned, not performed. Gaps between reputation and reality become visible.",actions:["Step into leadership or mentorship","Articulate your professional position","Pursue recognition through contribution"]},
   wealth:{stars:3,narrative:"Sun supports career-led income but cautions against ego-driven decisions.",hardTruth:"Pride can override prudence. Run financial decisions through a trusted sounding board.",actions:["Separate identity from financial risk","Consolidate 2028 gains","Plan a medium-term financial milestone"]},
   health:"Sun periods support vitality. Guard against pride-driven overextension.",
   do:["Lead where invited","Make work visible","Establish long-term professional commitments"],
   dont:["Overstate credentials","Make ego-driven financial bets","Neglect collaborative relationships"],
   keyMonths:["Apr 2029","Aug 2029","Dec 2029"]},
  {year:2030,dashaTheme:"Saturn · Moon Recalibration",signal:"medium",score:58,dashaColor:"#D0D8F0",
   career:{stars:3,narrative:"Moon brings emotional currents into the work sphere. Decisions from groundedness will be sound; reactive ones will need correction.",hardTruth:"Unresolved personal patterns show up professionally this year. Address them at the root.",actions:["Establish clearer work/personal boundaries","Make decisions from calm not urgency","Invest in emotional health"]},
   wealth:{stars:3,narrative:"Wealth is steady but emotional spending can undercut goals.",hardTruth:"Emotional triggers drive financial decisions more than logic this year.",actions:["Track spending against emotional states","Automate savings","Revisit financial goals' deeper motivations"]},
   health:"Mental and emotional health are the priority. Sleep and relational quality matter.",
   do:["Honour emotional intelligence","Care for close relationships","Rest when the body asks"],
   dont:["Suppress emotional signals","Make major decisions during emotional lows","Neglect home and family"],
   keyMonths:["Mar 2030","Jul 2030","Nov 2030"]},
]

// ─── Planet glyphs (Unicode) ─────────────────────────────────────────────────
const PLANET_GLYPHS: Record<string, string> = {
  Sun:     "☉",
  Moon:    "☽",
  Mars:    "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus:   "♀",
  Saturn:  "♄",
  Rahu:    "☊",
  Ketu:    "☋",
}

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

function signalBadge(score: number): string {
  if (score >= 70) return "🚀 Bullish"
  if (score >= 60) return "💰 Favourable"
  if (score >= 50) return "🟢 Moderate"
  if (score >= 40) return "🟡 Cautious"
  return "🔴 Challenging"
}

function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <span style={{ color: T.gold, fontSize: 13, letterSpacing: 2 }}>
      {Array.from({ length: max }, (_, i) => i < count ? "★" : "☆").join("")}
    </span>
  )
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
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <PlanetGlyph planet={planet} />
          <span style={{ fontSize: 10, color: T.txt3, whiteSpace: "nowrap" }}>
            {formatRange(start, end)}
          </span>
        </div>
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
        <div style={{ flexShrink: 0, paddingTop: 2 }}>
          {status !== "past" && <span style={badgeStyle}>{status === "current" ? "CURRENT" : "UPCOMING"}</span>}
        </div>
      </div>

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

      <p style={{ margin: 0, fontSize: 10, color: T.txt3, fontStyle: "italic", letterSpacing: "0.03em" }}>
        Reflection only — not a prediction of events
      </p>
    </div>
  )
}

// ─── Dasha Sequence Section ───────────────────────────────────────────────────
interface SequenceEntry {
  planet: string
  years:  number
  start:  string
  end:    string
  status: "current" | "upcoming" | "past"
}

function DashaSequenceSection({ sequence }: { sequence: SequenceEntry[] }) {
  const now = new Date()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Section header */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 10, color: T.gold, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "Outfit, sans-serif" }}>
          Your Vimśottarī Sequence
        </span>
      </div>

      <div style={{ ...glassCard, padding: 0, overflow: "hidden" }}>
        {sequence.map((p, i) => {
          const theme      = PLANET_THEMES[p.planet] ?? FALLBACK_THEME
          const glyph      = PLANET_GLYPHS[p.planet] ?? p.planet.charAt(0)
          const isCurrent  = p.status === "current"
          const startYear  = parseDate(p.start)?.getFullYear() ?? "—"
          const endYear    = parseDate(p.end)?.getFullYear()   ?? "—"
          const pct        = isCurrent && parseDate(p.start) && parseDate(p.end)
            ? clampPercent(parseDate(p.start)!, parseDate(p.end)!, now)
            : null

          const badgeStyle: React.CSSProperties = isCurrent
            ? { background: `${T.gold}20`, color: T.gold, border: `1px solid ${T.gold}55`, fontSize: 10, padding: "1px 7px", borderRadius: 5, letterSpacing: "0.1em", fontWeight: 700, flexShrink: 0 }
            : { background: `${T.violet}16`, color: T.violet, border: `1px solid ${T.violet}40`, fontSize: 10, padding: "1px 7px", borderRadius: 5, letterSpacing: "0.1em", fontWeight: 600, flexShrink: 0 }

          return (
            <div
              key={p.planet + p.start}
              style={{
                display:       "flex",
                alignItems:    "center",
                gap:           12,
                padding:       "14px 16px",
                borderTop:     i > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                background:    isCurrent ? `${theme.color}08` : "transparent",
                borderLeft:    isCurrent ? `3px solid ${theme.color}66` : "3px solid transparent",
              }}
            >
              {/* Glyph */}
              <span style={{ fontSize: 18, color: theme.color, width: 22, textAlign: "center", flexShrink: 0, fontFamily: "serif" }}>
                {glyph}
              </span>

              {/* Name + range */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 500, color: theme.color, fontFamily: "Syne, sans-serif" }}>
                    {p.planet}
                  </span>
                  <span style={{ fontSize: 11, color: T.txt3 }}>
                    {startYear}–{endYear}
                  </span>
                  <span style={{ fontSize: 10, color: T.txt3 }}>
                    {p.years}y
                  </span>
                </div>

                {/* Progress bar for current only */}
                {pct !== null && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden", width: "100%", maxWidth: 220 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${theme.color}88,${theme.color})`, borderRadius: 2, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontSize: 10, color: T.gold, marginTop: 3, display: "inline-block" }}>{pct}% elapsed</span>
                  </div>
                )}
              </div>

              {/* Badge */}
              <span style={badgeStyle}>{isCurrent ? "CURRENT" : "UPCOMING"}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Year card ────────────────────────────────────────────────────────────────
function YearCard({ y }: { y: YearOutlook }) {
  const careerLocked = y.career.actions.slice(1)
  const wealthLocked = y.wealth.actions.slice(1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ ...glassCard, borderLeft: `3px solid ${y.dashaColor}` }}>
        {/* Score bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: T.txt3, textTransform: "uppercase", letterSpacing: "0.1em" }}>Score</span>
          <span style={{ fontSize: 11, color: y.dashaColor, fontWeight: 700 }}>{y.score}/100</span>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${y.score}%`, background: y.dashaColor, borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>

        {/* Signal + theme row */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: `1px solid ${y.dashaColor}55`, fontSize: 11, color: y.dashaColor, fontWeight: 600 }}>
            {signalBadge(y.score)}
          </span>
          <span style={{ fontSize: 13, color: T.txt2, fontStyle: "italic", fontFamily: "Cormorant Garamond, serif" }}>
            {y.dashaTheme}
          </span>
        </div>

        {/* Key months */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {y.keyMonths.map(m => (
            <span key={m} style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 10, color: T.txt3 }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Career + Wealth grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {/* Career */}
        <div style={{ ...glassCard, flex: "1 1 280px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Outfit,sans-serif" }}>Career</span>
            <Stars count={y.career.stars} />
          </div>
          <p style={{ fontSize: 13, color: T.txt2, lineHeight: 1.6, margin: "0 0 12px" }}>{y.career.narrative}</p>
          {/* Hard Truth */}
          <div style={{ padding: "10px 12px", background: "rgba(212,184,112,0.08)", borderLeft: "3px solid #D4B870", borderRadius: "0 8px 8px 0", marginBottom: 12 }}>
            <span style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 4 }}>Hard Truth</span>
            <p style={{ fontSize: 12, color: T.txt2, margin: 0, lineHeight: 1.5 }}>{y.career.hardTruth}</p>
          </div>
          {/* First action free */}
          <p style={{ fontSize: 12, color: T.txt2, margin: "0 0 6px" }}>→ {y.career.actions[0]}</p>
          {careerLocked.length > 0 && (
            <button
              onClick={() => (window as any).openPasscodeModal?.()}
              style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(212,184,112,0.3)", background: "rgba(212,184,112,0.05)", color: T.gold, fontSize: 11, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}
            >
              🔒 +{careerLocked.length} more actions — unlock with Dharma Pass
            </button>
          )}
        </div>

        {/* Wealth */}
        <div style={{ ...glassCard, flex: "1 1 280px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Outfit,sans-serif" }}>Wealth</span>
            <Stars count={y.wealth.stars} />
          </div>
          <p style={{ fontSize: 13, color: T.txt2, lineHeight: 1.6, margin: "0 0 12px" }}>{y.wealth.narrative}</p>
          <div style={{ padding: "10px 12px", background: "rgba(212,184,112,0.08)", borderLeft: "3px solid #D4B870", borderRadius: "0 8px 8px 0", marginBottom: 12 }}>
            <span style={{ fontSize: 9, color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 4 }}>Hard Truth</span>
            <p style={{ fontSize: 12, color: T.txt2, margin: 0, lineHeight: 1.5 }}>{y.wealth.hardTruth}</p>
          </div>
          <p style={{ fontSize: 12, color: T.txt2, margin: "0 0 6px" }}>→ {y.wealth.actions[0]}</p>
          {wealthLocked.length > 0 && (
            <button
              onClick={() => (window as any).openPasscodeModal?.()}
              style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(212,184,112,0.3)", background: "rgba(212,184,112,0.05)", color: T.gold, fontSize: 11, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}
            >
              🔒 +{wealthLocked.length} more actions — unlock with Dharma Pass
            </button>
          )}
        </div>
      </div>

      {/* Do / Don't */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div style={{ flex: "1 1 200px", padding: "12px 14px", background: "rgba(110,201,122,0.06)", border: "1px solid rgba(110,201,122,0.2)", borderRadius: 10 }}>
          <p style={{ fontSize: 10, color: "#6EC97A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>✅ Do</p>
          {y.do.map(d => <p key={d} style={{ fontSize: 12, color: T.txt2, margin: "0 0 4px", lineHeight: 1.5 }}>• {d}</p>)}
        </div>
        <div style={{ flex: "1 1 200px", padding: "12px 14px", background: "rgba(224,80,80,0.06)", border: "1px solid rgba(224,80,80,0.2)", borderRadius: 10 }}>
          <p style={{ fontSize: 10, color: "#E05050", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>❌ Avoid</p>
          {y.dont.map(d => <p key={d} style={{ fontSize: 12, color: T.txt2, margin: "0 0 4px", lineHeight: 1.5 }}>• {d}</p>)}
        </div>
      </div>

      {/* Health */}
      <p style={{ margin: 0, fontSize: 12, color: T.txt3, fontFamily: "Outfit,sans-serif" }}>
        ❤ Health: {y.health}
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
  const [activeYear, setActiveYear] = useState(2026)

  // Full sequence for the Vimśottarī section (current + up to 4 upcoming)
  const dashaSequence = useMemo(() => {
    const seq = chart?.dasha?.sequence
    if (!seq?.length) return []
    return seq
      .map(p => {
        const start = parseDate(p.start)
        const end   = parseDate(p.end)
        let status: "current" | "upcoming" | "past" = "upcoming"
        if (start && end && now >= start && now <= end) status = "current"
        else if (end && now > end) status = "past"
        return { ...p, status }
      })
      .filter(p => p.status !== "past")
      .slice(0, 5)
  }, [chart])

  // Filtered periods for the detailed Mahadasha cards (current + upcoming within 5 years)
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

  const activeOutlook = YEARLY_OUTLOOK.find(y => y.year === activeYear) ?? YEARLY_OUTLOOK[0]

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

      {/* ── YOUR VIMŚOTTARĪ SEQUENCE ── */}
      {chart && dashaSequence.length > 0 ? (
        <DashaSequenceSection sequence={dashaSequence} />
      ) : (
        <div style={{ ...glassCard, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>☿</div>
          <p style={{ margin: 0, color: T.txt2, fontSize: 14 }}>
            Cast your chart to see your Daśā timeline
          </p>
        </div>
      )}

      {/* ── Mahadasha period detail cards ── */}
      {chart && periods.length > 0 && (
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

      {/* ── Section divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ fontSize: 10, color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
          5-Year Thematic Outlook
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Amber calibration note */}
      <div style={{
        background:   "rgba(240,168,48,0.08)",
        border:       "1px solid rgba(240,168,48,0.25)",
        borderRadius: 10,
        padding:      "12px 16px",
        fontSize:     12,
        color:        "#F0A830",
        lineHeight:   1.6,
      }}>
        <span style={{ fontWeight: 700, letterSpacing: "0.04em" }}>Note —</span>{" "}
        These thematic windows are calibrated for Saturn Mahādaśā. Interpretations are most accurate for Saturn period holders — adapt the themes to your active planet.
      </div>

      {/* Year tab row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {YEARLY_OUTLOOK.map(y => {
          const active = y.year === activeYear
          return (
            <button
              key={y.year}
              onClick={() => setActiveYear(y.year)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: active ? "1px solid #D4B870" : "1px solid rgba(255,255,255,0.08)",
                background: active ? "rgba(212,184,112,0.12)" : "transparent",
                color: active ? "#D4B870" : "#8090B5",
                fontSize: 13,
                fontFamily: "Syne,sans-serif",
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {y.year}
            </button>
          )
        })}
      </div>

      {/* Active year card */}
      <YearCard y={activeOutlook} />

      {/* Disclaimer */}
      <p style={{ margin: 0, fontSize: 11, color: T.txt3, fontStyle: "italic", textAlign: "center", letterSpacing: "0.03em" }}>
        Thematic windows for reflection — not predictions of events
      </p>
    </div>
  )
}

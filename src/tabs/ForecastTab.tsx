import React, { useMemo, useState, useEffect } from "react"
import type { ChartData } from '@/lib/chartTypes'

// ─── Dharma Pass access helper ────────────────────────────────────────────────
function hasAccess(): boolean {
  if (typeof window === 'undefined') return false
  if (localStorage.getItem('vv_dharma_pass')) return true
  try {
    const t = localStorage.getItem('vv_dharma_timed')
    if (!t) return false
    const { expiry } = JSON.parse(t)
    return Date.now() < expiry
  } catch { return false }
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  gold:    "#D4B870",
  violet:  "#8B7CC8",
  txt:     "#F0EBF4",
  txt2:    "#D0C8E0",
  txt3:    "#9A90B8",
  bgCard:  "rgba(8,4,22,0.75)",
  border:  "rgba(114,166,183,0.2)",
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

// ─── Plain-English one-liner per planet period ────────────────────────────────
const DASHA_PLAIN_TERMS: Record<string, string> = {
  Sun:     "Think of this as a phase where your sense of self and what you stand for gets a spotlight. Great time to step up, be visible, and lead — but watch the ego.",
  Moon:    "This is an emotionally sensitive chapter. Your feelings and gut instincts are louder than usual — listen to them. Home, family, and inner peace matter most now.",
  Mars:    "A high-energy, action-forward phase. You have more drive and ambition than usual — use it to start things, compete, and push through obstacles. Stay patient under pressure.",
  Mercury: "A sharp, busy period focused on communication, learning, and building practical skills. Good for networking, studying, writing, and upgrading how you work and think.",
  Jupiter: "One of the more expansive phases in the cycle. Wisdom, growth, and good fortune flow more freely. Align with your deeper purpose and watch things open up.",
  Venus:   "A period of creativity, beauty, and relationships. Connections deepen, pleasures increase, and creative work can flourish. Good time to invest in what you value.",
  Saturn:  "A serious, grounding phase that rewards consistency and hard work. Shortcuts get exposed. Slow, steady effort builds real results — patience is the strategy.",
  Rahu:    "An intense, restless, and ambitious phase. You may be pulled toward something new, foreign, or unconventional. Exciting but needs direction — curiosity over obsession.",
  Ketu:    "A quieter, more inward phase. Attachment to outcomes loosens. Old skills resurface, spiritual depth grows, and wisdom comes through letting go rather than grasping.",
}

// ─── 5-Year Thematic Outlook data ────────────────────────────────────────────
interface YearOutlook {
  year: number
  dashaTheme: string
  signal: string
  score: number
  dashaColor: string
  career: { stars: number; narrative: string; watchOut: string; expect: string[]; actions: string[] }
  wealth:  { stars: number; narrative: string; watchOut: string; expect: string[]; actions: string[] }
  health: string
  do: string[]
  dont: string[]
  keyMonths: string[]
}

const OUTLOOK_PLANET_THEMES: Record<string, {
  career: string; wealth: string; theme: string
  careerHardTruth: string; wealthHardTruth: string
  careerExpect: string[]; wealthExpect: string[]
  health: string; do: string[]; dont: string[]
  score: number; careerStars: number; wealthStars: number
}> = {
  Sun: {
    career: "Authority and leadership come into focus. Sustained effort earns recognition — a time to step forward with clarity of purpose.",
    wealth: "Recognition opens new income streams. Career-led gains are possible; guard against ego-driven financial risk.",
    theme: "Identity & Purpose",
    careerHardTruth: "Authentic authority is earned, not performed. Gaps between reputation and reality become visible.",
    wealthHardTruth: "Pride can override prudence. Run financial decisions through a trusted sounding board.",
    careerExpect: [
      "Opportunities to step into a leadership or visible role — take them seriously",
      "Your reputation and personal brand carry more weight than usual",
      "Recognition for past work may finally arrive — stay consistent",
    ],
    wealthExpect: [
      "Income tied to your position, title, or public standing tends to improve",
      "Good time to negotiate salary, raise rates, or formalise your value",
      "Risky financial bets driven by confidence can backfire — slow down big decisions",
    ],
    health: "Sun periods support vitality. Guard against pride-driven overextension.",
    do: ["Lead where invited", "Make work visible", "Establish long-term professional commitments"],
    dont: ["Overstate credentials", "Make ego-driven financial bets", "Neglect collaborative relationships"],
    score: 74, careerStars: 4, wealthStars: 3,
  },
  Moon: {
    career: "Intuition guides key decisions. Emotional currents enter the work sphere — groundedness yields sound results; reactivity requires correction.",
    wealth: "Nurturing ventures yield steady returns. Emotional spending can undercut goals; automate what you can.",
    theme: "Reflection & Cycles",
    careerHardTruth: "Unresolved personal patterns show up professionally this year. Address them at the root.",
    wealthHardTruth: "Emotional triggers drive financial decisions more than logic this year.",
    careerExpect: [
      "Work in care, wellness, hospitality, or community tends to flow well",
      "Your instincts about people and situations are sharper than usual — trust them",
      "Mood fluctuations may affect productivity; build routines that stabilise you",
    ],
    wealthExpect: [
      "Income from nurturing or service-oriented work is supported",
      "Impulse spending during emotional highs or lows is the main risk to watch",
      "Automating savings or bills helps you avoid reactive financial decisions",
    ],
    health: "Mental and emotional health are the priority. Sleep and relational quality matter.",
    do: ["Honour emotional intelligence", "Care for close relationships", "Rest when the body asks"],
    dont: ["Suppress emotional signals", "Make major decisions during emotional lows", "Neglect home and family"],
    score: 58, careerStars: 3, wealthStars: 3,
  },
  Mercury: {
    career: "Communication and skill-building accelerate. Analytical and network-based work is highlighted; methodical effort compounds.",
    wealth: "Trade and learning create opportunities. Steady accumulation is favoured; rapid gains less likely.",
    theme: "Intellect & Exchange",
    careerHardTruth: "Ambition without systems fails. Build infrastructure before seeking the stage.",
    wealthHardTruth: "Build reserves, not deploy them. Patience is the wealth strategy.",
    careerExpect: [
      "Writing, speaking, teaching, analysis, or tech-adjacent work comes into its own",
      "Networking and building new professional contacts pays off significantly",
      "Learning a new skill now can compound into a career asset over the next 3+ years",
    ],
    wealthExpect: [
      "Multiple small income streams are more likely than one big windfall",
      "Income from knowledge, information, or communication skills tends to grow",
      "This is a building phase — focus on systems and reserves, not speculation",
    ],
    health: "Mercury rewards mental hygiene — structured rest prevents overthinking.",
    do: ["Systematise one core workflow", "Invest in a skill that compounds over 3+ years", "Document decisions rigorously"],
    dont: ["Launch ventures without infrastructure", "Neglect rest", "Underestimate how long things take"],
    score: 62, careerStars: 3, wealthStars: 3,
  },
  Venus: {
    career: "Creative and relational work flourishes. Partnerships and aesthetic ventures are highlighted; disciplined effort yields visible results.",
    wealth: "Comfort and aesthetics attract resources. Financial flows improve; gains require active stewardship.",
    theme: "Harmony & Value",
    careerHardTruth: "Results arrive for those who prepared. Harvest season — only for those who planted.",
    wealthHardTruth: "Gains require active stewardship. Do not become passive once momentum arrives.",
    careerExpect: [
      "Creative, relational, or beauty-adjacent roles flourish — collaborations open doors",
      "Business partnerships and client relationships become more rewarding and productive",
      "This is a natural 'harvest' window — finish and ship things rather than starting fresh",
    ],
    wealthExpect: [
      "Financial flows tend to improve — income from creative work or relationships is supported",
      "Good time to invest in quality (tools, education, appearance) that pays forward",
      "Passive income or revenue from existing work can increase with active attention",
    ],
    health: "Energy returns. Enjoy it without over-scheduling.",
    do: ["Collaborate actively", "Bring a creative project to completion", "Invest in relationships"],
    dont: ["Rush past this window", "Neglect foundations built earlier", "Overcommit"],
    score: 78, careerStars: 4, wealthStars: 4,
  },
  Mars: {
    career: "Bold action and initiative dominate. Directed drive produces results; impulsiveness can undo them.",
    wealth: "Effort-driven gains are possible. Watch impulsiveness — reactive decisions can erase progress.",
    theme: "Courage & Drive",
    careerHardTruth: "Action without strategy burns resources. Identify the one decisive move before acting broadly.",
    wealthHardTruth: "Mars gains can be lost to Mars decisions. Pause before deploying capital.",
    careerExpect: [
      "You have more energy and appetite for bold moves — initiating projects comes naturally",
      "Competitive or physically demanding environments suit you better than usual",
      "Impatience is the main pitfall — good decisions made fast still need to be the right ones",
    ],
    wealthExpect: [
      "Gains come from effort and initiative, not luck — hustle pays off",
      "Avoid large financial bets made in anger, urgency, or competitive frenzy",
      "Clear one debt or financial obligation that has been dragging — Mars energy supports resolution",
    ],
    health: "Physical energy is high. Channel it into structured movement; avoid recklessness.",
    do: ["Initiate what has been delayed", "Compete where you have genuine edge", "Establish clear boundaries"],
    dont: ["React without reflection", "Over-leverage", "Ignore signs of burnout"],
    score: 65, careerStars: 3, wealthStars: 3,
  },
  Jupiter: {
    career: "Expansion, teaching, and wisdom grow. Dharmic alignment opens doors; abundance is accessible to those who hold ethics.",
    wealth: "Abundance and growth if ethics are maintained. Long-term investments and mentorship-based income are favoured.",
    theme: "Growth & Dharma",
    careerHardTruth: "Growth without depth becomes inflation. Ensure expansion is rooted in genuine value.",
    wealthHardTruth: "Optimism can override diligence. Verify before committing to large ventures.",
    careerExpect: [
      "Teaching, mentoring, publishing, law, or advisory roles are especially well-supported",
      "Opportunities arrive — sometimes through unexpected generosity or a trusted introduction",
      "Saying yes to growth feels easier, but it's worth filtering for depth over volume",
    ],
    wealthExpect: [
      "This is one of the more favourable periods for wealth growth in the full cycle",
      "Long-term investments (education, property, equity) tend to outperform short-term plays",
      "Generosity and ethical behaviour in financial dealings attracts further abundance",
    ],
    health: "Jupiter supports overall vitality; guard against overindulgence.",
    do: ["Teach or mentor", "Expand into aligned territory", "Invest in wisdom-based relationships"],
    dont: ["Over-promise", "Neglect details in pursuit of vision", "Confuse luck with skill"],
    score: 80, careerStars: 4, wealthStars: 4,
  },
  Saturn: {
    career: "Discipline and long-term work are rewarded. Groundwork laid now shapes the next several years; shortcuts are exposed.",
    wealth: "Slow but structural wealth-building is the theme. Preservation and debt reduction outperform speculative moves.",
    theme: "Karma & Structure",
    careerHardTruth: "Ambition without systems fails in Saturn periods. Build infrastructure before seeking the stage.",
    wealthHardTruth: "Build reserves, not deploy them. Patience is the wealth strategy.",
    careerExpect: [
      "Work that requires patience, precision, or long-term commitment is where you shine",
      "Promotions and recognition may feel slow — they tend to arrive later and last longer",
      "Any corners cut in previous years now show up as problems that need addressing",
    ],
    wealthExpect: [
      "Wealth grows through consistency, not windfalls — small regular savings outperform",
      "Debt reduction and financial discipline pay off more than speculation right now",
      "Avoid over-extending or taking on new financial obligations without a clear plan",
    ],
    health: "Saturn rewards sleep discipline and structured movement.",
    do: ["Maintain consistent routines", "Complete what was started", "Honour commitments without overcommitting"],
    dont: ["Launch ventures without infrastructure", "Neglect rest", "Underestimate how long things take"],
    score: 60, careerStars: 3, wealthStars: 3,
  },
  Rahu: {
    career: "Unconventional paths and obsessive focus drive this window. Foreign influence, pivots, and innovation are themes.",
    wealth: "Sudden gains are possible; watch illusions and over-reach. Diversify rather than concentrate.",
    theme: "Ambition & Shadow",
    careerHardTruth: "Obsession can masquerade as strategy. Periodically step back to verify direction.",
    wealthHardTruth: "Rahu amplifies desire as much as result. Distinguish genuine opportunity from compulsion.",
    careerExpect: [
      "Unusual, cross-cultural, or tech-forward paths open up — embrace what feels unconventional",
      "Sudden pivots in role, industry, or direction are possible and sometimes necessary",
      "Intensity and obsession can drive results, but step back periodically to check direction",
    ],
    wealthExpect: [
      "Unexpected windfalls are possible — so are unexpected losses if not managed",
      "Diversify rather than betting everything on one opportunity, however attractive it looks",
      "Financial decisions made from FOMO or obsessive desire tend to backfire",
    ],
    health: "Rest is often neglected in Rahu periods. Schedule recovery as deliberately as action.",
    do: ["Explore unconventional approaches", "Diversify your skill set", "Welcome cross-cultural input"],
    dont: ["Chase every shiny opportunity", "Ignore legal or ethical edges", "Exhaust yourself pursuing illusions"],
    score: 55, careerStars: 3, wealthStars: 2,
  },
  Ketu: {
    career: "Detachment, spiritual depth, and past skills resurface. Creative and interior work flourishes; external visibility-seeking does not.",
    wealth: "Non-material richness defines this period; material accumulation fluctuates. Preservation outperforms growth.",
    theme: "Release & Wisdom",
    careerHardTruth: "A refining year, not a building year. Forcing external progress will exhaust you.",
    wealthHardTruth: "Preservation outperforms growth this year.",
    careerExpect: [
      "Skills and expertise built years ago re-emerge as surprisingly relevant and valuable",
      "Deep, focused, or behind-the-scenes work suits this period far better than public roles",
      "Letting go of a role or project that no longer fits may actually accelerate your path",
    ],
    wealthExpect: [
      "Material gains are not the focus — preservation of what you have is the wise strategy",
      "Unexpected expenses can arise — keep a buffer rather than spending surpluses",
      "Investments made purely for spiritual or creative reasons often carry hidden value",
    ],
    health: "Rest is productive. Honour the body's signals.",
    do: ["Meditate or maintain contemplative practice", "Release what no longer serves", "Deepen mastery of existing skills"],
    dont: ["Seek public recognition", "Over-extend financially", "Ignore burnout signals"],
    score: 48, careerStars: 2, wealthStars: 2,
  },
}

const OUTLOOK_FALLBACK_PLANET = {
  career: "Planetary transition invites consolidation and careful reflection on direction.",
  wealth: "A period for careful stewardship and review of existing positions.",
  theme: "Transition & Reflection",
  careerHardTruth: "Clarity precedes action. Use this window to understand before committing.",
  wealthHardTruth: "Review before deploying. Preserve optionality.",
  careerExpect: [
    "A quieter, less dramatic career phase — consolidation rather than leaps",
    "Reviewing and improving existing work tends to pay off more than new ventures",
    "Relationships and trust built now create future professional opportunities",
  ],
  wealthExpect: [
    "Maintain what you have — this is not a strong growth phase",
    "Review subscriptions, costs, and financial commitments for anything to trim",
    "Building savings habits now creates a buffer for the next active phase",
  ],
  health: "Balance activity and rest during transition periods.",
  do: ["Reflect on patterns", "Consolidate existing efforts", "Strengthen core relationships"],
  dont: ["Force major decisions", "Neglect self-care", "Overcommit resources"],
  score: 55, careerStars: 3, wealthStars: 3,
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function generateKeyMonths(year: number, planet: string): string[] {
  // Deterministic 3 evenly-spaced months offset by planet seed
  const seed = [...planet].reduce((a, c) => a + c.charCodeAt(0), 0)
  const offset = seed % 4
  return [
    `${MONTH_NAMES[offset]} ${year}`,
    `${MONTH_NAMES[(offset + 4) % 12]} ${year}`,
    `${MONTH_NAMES[(offset + 8) % 12]} ${year}`,
  ]
}

function generateYearlyOutlook(chart: { dasha?: { sequence?: { planet: string; start: string; end: string }[] } } | null, currentYear: number): YearOutlook[] {
  const sequence = chart?.dasha?.sequence
  if (!sequence?.length) return []

  const results: YearOutlook[] = []

  for (let i = 0; i < 5; i++) {
    const year = currentYear + i
    const midYear = new Date(year, 6, 1) // 1 July — representative midpoint

    // Find which mahadasha is active at midpoint of this year
    const active = sequence.find(p => {
      const s = new Date(p.start)
      const e = new Date(p.end)
      return midYear >= s && midYear < e
    }) ?? sequence[sequence.length - 1]

    const planet = active?.planet ?? "Saturn"
    const themes = OUTLOOK_PLANET_THEMES[planet] ?? OUTLOOK_FALLBACK_PLANET
    const color  = (PLANET_THEMES[planet] ?? FALLBACK_THEME).color

    results.push({
      year,
      dashaTheme: `${planet} · ${themes.theme}`,
      signal: themes.score >= 70 ? "high" : themes.score >= 55 ? "medium" : "low",
      score:  themes.score,
      dashaColor: color,
      career: {
        stars:     themes.careerStars,
        narrative: themes.career,
        watchOut:  themes.careerHardTruth,
        expect:    themes.careerExpect,
        actions:   themes.do,
      },
      wealth: {
        stars:     themes.wealthStars,
        narrative: themes.wealth,
        watchOut:  themes.wealthHardTruth,
        expect:    themes.wealthExpect,
        actions:   ["Review financial position", ...themes.dont.slice(0, 2)],
      },
      health:    themes.health,
      do:        themes.do,
      dont:      themes.dont,
      keyMonths: generateKeyMonths(year, planet),
    })
  }

  return results
}

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
    ? { background: `${T.gold}20`, color: T.gold,   border: `1px solid ${T.gold}55`,   fontSize: 12, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.1em", fontWeight: 700 }
    : status === "upcoming"
    ? { background: `${T.violet}18`, color: T.violet, border: `1px solid ${T.violet}44`, fontSize: 12, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.1em", fontWeight: 600 }
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
          <span style={{ fontSize: 12, color: T.txt3, whiteSpace: "nowrap" }}>
            {formatRange(start, end)}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, color: theme.color }}>
              {planet}
            </span>
            <span style={{ fontSize: 13, color: T.txt3, letterSpacing: "0.08em" }}>Mahādaśā</span>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: T.txt2, lineHeight: 1.6 }}>
            {theme.desc}
          </p>
          {/* Plain-English takeaway */}
          {DASHA_PLAIN_TERMS[planet] && (
            <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(212,184,112,0.07)", border: "1px solid rgba(212,184,112,0.2)", borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 13, color: T.txt, lineHeight: 1.6 }}>
                💡 {DASHA_PLAIN_TERMS[planet]}
              </p>
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, paddingTop: 2 }}>
          {status !== "past" && <span style={badgeStyle}>{status === "current" ? "CURRENT" : "UPCOMING"}</span>}
        </div>
      </div>

      {pct !== null && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: T.txt3 }}>Period elapsed</span>
            <span style={{ fontSize: 12, color: T.gold }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(114,166,183,0.15)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${T.gold}88, ${T.gold})`, borderRadius: 2, transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}

      <p style={{ margin: 0, fontSize: 12, color: T.txt3, fontStyle: "italic", letterSpacing: "0.03em" }}>
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
        <span style={{ fontSize: 12, color: T.gold, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "Outfit, sans-serif" }}>
          Your Vimśottarī Sequence
        </span>
      </div>

      <div style={{ ...glassCard, padding: 0, overflow: "visible" }}>
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
            ? { background: `${T.gold}20`, color: T.gold, border: `1px solid ${T.gold}55`, fontSize: 12, padding: "1px 7px", borderRadius: 5, letterSpacing: "0.1em", fontWeight: 700, flexShrink: 0 }
            : { background: `${T.violet}16`, color: T.violet, border: `1px solid ${T.violet}40`, fontSize: 12, padding: "1px 7px", borderRadius: 5, letterSpacing: "0.1em", fontWeight: 600, flexShrink: 0 }

          return (
            <div
              key={p.planet + p.start}
              style={{
                display:       "flex",
                alignItems:    "center",
                gap:           12,
                padding:       "14px 20px 14px 16px",
                borderTop:     i > 0 ? "1px solid rgba(114,166,183,0.12)" : undefined,
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
                  <span style={{ fontSize: 13, color: T.txt3 }}>
                    {startYear}–{endYear}
                  </span>
                  <span style={{ fontSize: 12, color: T.txt3 }}>
                    {p.years}y
                  </span>
                </div>

                {/* Progress bar for current only */}
                {pct !== null && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 3, background: "rgba(114,166,183,0.15)", borderRadius: 2, overflow: "hidden", width: "100%", maxWidth: 220 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${theme.color}88,${theme.color})`, borderRadius: 2, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontSize: 12, color: T.gold, marginTop: 3, display: "inline-block" }}>{pct}% elapsed</span>
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
function YearCard({ y, dharmaUnlocked }: { y: YearOutlook; dharmaUnlocked: boolean }) {
  const careerLocked = y.career.actions.slice(1)
  const wealthLocked = y.wealth.actions.slice(1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ ...glassCard, borderLeft: `3px solid ${y.dashaColor}` }}>
        {/* Score bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: T.txt3, textTransform: "uppercase", letterSpacing: "0.1em" }}>Score</span>
          <span style={{ fontSize: 13, color: y.dashaColor, fontWeight: 700 }}>{y.score}/100</span>
        </div>
        <div style={{ height: 5, background: "rgba(114,166,183,0.15)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${y.score}%`, background: y.dashaColor, borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>

        {/* Signal + theme row */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(114,166,183,0.12)", border: `1px solid ${y.dashaColor}55`, fontSize: 13, color: y.dashaColor, fontWeight: 600 }}>
            {signalBadge(y.score)}
          </span>
          <span style={{ fontSize: 13, color: T.txt2, fontStyle: "italic", fontFamily: "Cormorant Garamond, serif" }}>
            {y.dashaTheme}
          </span>
        </div>

        {/* Key months */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {y.keyMonths.map(m => (
            <span key={m} style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(10,5,26,0.90)", border: "1px solid rgba(114,166,183,0.2)", fontSize: 12, color: T.txt3 }}>{m}</span>
          ))}
        </div>
      </div>

      {/* Career + Wealth grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {/* Career */}
        <div style={{ ...glassCard, flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Outfit,sans-serif" }}>{t('Career Theme', 'करियर विषय')}</span>
            <span title={`${y.career.stars} out of 5 — higher = more active career opportunities this period`}>
              <Stars count={y.career.stars} />
            </span>
          </div>
          {/* Summary */}
          <p style={{ fontSize: 13, color: T.txt2, lineHeight: 1.6, margin: 0 }}>{y.career.narrative}</p>
          {/* What to expect */}
          <div>
            <p style={{ fontSize: 11, color: T.txt3, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 7px" }}>What to expect</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {y.career.expect.map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: T.gold, fontSize: 12, lineHeight: 1.6, flexShrink: 0 }}>▸</span>
                  <p style={{ fontSize: 13, color: T.txt2, margin: 0, lineHeight: 1.6 }}>{pt}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Watch out */}
          <div style={{ padding: "9px 12px", background: "rgba(224,80,80,0.07)", borderLeft: "3px solid rgba(224,80,80,0.5)", borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontSize: 11, color: "#E07070", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>⚠ Watch out for</p>
            <p style={{ fontSize: 13, color: T.txt2, margin: 0, lineHeight: 1.5 }}>{y.career.watchOut}</p>
          </div>
          {/* Actions */}
          <div>
            <p style={{ fontSize: 11, color: T.txt3, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>Suggested actions</p>
            {dharmaUnlocked ? (
              <>
                {y.career.actions.map(a => (
                  <p key={a} style={{ fontSize: 13, color: T.txt2, margin: "0 0 5px" }}>• {a}</p>
                ))}
                <div style={{ marginTop: 6, padding: "4px 10px", borderRadius: 6, background: "rgba(76,175,106,0.12)", border: "1px solid rgba(76,175,106,0.3)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#4CAF6A", fontWeight: 600 }}>✦ Dharma Pass Active</span>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: T.txt2, margin: "0 0 6px" }}>→ {y.career.actions[0]}</p>
                {careerLocked.length > 0 && (
                  <button
                    onClick={() => (window as any).openPasscodeModal?.()}
                    style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(212,184,112,0.3)", background: "rgba(212,184,112,0.05)", color: T.gold, fontSize: 13, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}
                  >
                    🔒 +{careerLocked.length} more actions — unlock with Dharma Pass
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Wealth */}
        <div style={{ ...glassCard, flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: T.gold, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Outfit,sans-serif" }}>{t('Wealth Pattern', 'धन पैटर्न')}</span>
            <span title={`${y.wealth.stars} out of 5 — higher = stronger financial growth potential this period`}>
              <Stars count={y.wealth.stars} />
            </span>
          </div>
          {/* Summary */}
          <p style={{ fontSize: 13, color: T.txt2, lineHeight: 1.6, margin: 0 }}>{y.wealth.narrative}</p>
          {/* What to expect */}
          <div>
            <p style={{ fontSize: 11, color: T.txt3, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 7px" }}>What to expect</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {y.wealth.expect.map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#6EC97A", fontSize: 12, lineHeight: 1.6, flexShrink: 0 }}>▸</span>
                  <p style={{ fontSize: 13, color: T.txt2, margin: 0, lineHeight: 1.6 }}>{pt}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Watch out */}
          <div style={{ padding: "9px 12px", background: "rgba(224,80,80,0.07)", borderLeft: "3px solid rgba(224,80,80,0.5)", borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontSize: 11, color: "#E07070", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>⚠ Watch out for</p>
            <p style={{ fontSize: 13, color: T.txt2, margin: 0, lineHeight: 1.5 }}>{y.wealth.watchOut}</p>
          </div>
          {/* Actions */}
          <div>
            <p style={{ fontSize: 11, color: T.txt3, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>Suggested actions</p>
            {dharmaUnlocked ? (
              <>
                {y.wealth.actions.map(a => (
                  <p key={a} style={{ fontSize: 13, color: T.txt2, margin: "0 0 5px" }}>• {a}</p>
                ))}
                <div style={{ marginTop: 6, padding: "4px 10px", borderRadius: 6, background: "rgba(76,175,106,0.12)", border: "1px solid rgba(76,175,106,0.3)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: "#4CAF6A", fontWeight: 600 }}>✦ Dharma Pass Active</span>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: T.txt2, margin: "0 0 6px" }}>→ {y.wealth.actions[0]}</p>
                {wealthLocked.length > 0 && (
                  <button
                    onClick={() => (window as any).openPasscodeModal?.()}
                    style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid rgba(212,184,112,0.3)", background: "rgba(212,184,112,0.05)", color: T.gold, fontSize: 13, cursor: "pointer", fontFamily: "Outfit,sans-serif" }}
                  >
                    🔒 +{wealthLocked.length} more actions — unlock with Dharma Pass
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Do / Don't */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div style={{ flex: "1 1 200px", padding: "12px 14px", background: "rgba(110,201,122,0.06)", border: "1px solid rgba(110,201,122,0.2)", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "#6EC97A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>✅ Do</p>
          {y.do.map(d => <p key={d} style={{ fontSize: 14, color: T.txt2, margin: "0 0 4px", lineHeight: 1.5 }}>• {d}</p>)}
        </div>
        <div style={{ flex: "1 1 200px", padding: "12px 14px", background: "rgba(224,80,80,0.06)", border: "1px solid rgba(224,80,80,0.2)", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "#E05050", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>❌ Avoid</p>
          {y.dont.map(d => <p key={d} style={{ fontSize: 14, color: T.txt2, margin: "0 0 4px", lineHeight: 1.5 }}>• {d}</p>)}
        </div>
      </div>

      {/* Health */}
      <p style={{ margin: 0, fontSize: 14, color: T.txt3, fontFamily: "Outfit,sans-serif" }}>
        ❤ Health: {y.health}
      </p>
    </div>
  )
}

// ─── Vimśottarī Daśā explainer card ──────────────────────────────────────────
function DashaExplainerCard() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ ...glassCard, padding: "14px 18px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18, color: T.gold }}>☿</span>
          <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 14, color: T.txt2, fontWeight: 600 }}>
            What is Vimśottarī Daśā? How does this work?
          </span>
        </div>
        <span style={{ fontSize: 14, color: T.txt3, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      {open && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 14, color: T.txt2, lineHeight: 1.7 }}>
            <strong style={{ color: T.txt }}>Vimśottarī Daśā</strong> is a 120-year planetary cycle system from Vedic astrology. Your life is divided into chapters, each ruled by a different planet. The chapter you are in right now is called your <strong style={{ color: T.gold }}>Mahadasha</strong> (main period), and within it there are shorter sub-periods called <strong style={{ color: T.gold }}>Antardasha</strong>.
          </p>
          <p style={{ margin: 0, fontSize: 14, color: T.txt2, lineHeight: 1.7 }}>
            Think of it like weather seasons for your life. Just as summer brings heat and winter brings cold — each planetary period brings its own themes, energy, and opportunities. You don't fight the season; you prepare for it and work with it.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
            {[
              { planet: "Sun", years: 6, emoji: "☉" },
              { planet: "Moon", years: 10, emoji: "☽" },
              { planet: "Mars", years: 7, emoji: "♂" },
              { planet: "Rahu", years: 18, emoji: "☊" },
              { planet: "Jupiter", years: 16, emoji: "♃" },
              { planet: "Saturn", years: 19, emoji: "♄" },
              { planet: "Mercury", years: 17, emoji: "☿" },
              { planet: "Ketu", years: 7, emoji: "☋" },
              { planet: "Venus", years: 20, emoji: "♀" },
            ].map(({ planet, years, emoji }) => {
              const color = (PLANET_THEMES[planet] ?? FALLBACK_THEME).color
              return (
                <span key={planet} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: `${color}12`, border: `1px solid ${color}33`, color, fontFamily: "Outfit, sans-serif" }}>
                  {emoji} {planet} · {years}y
                </span>
              )
            })}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: T.txt3, fontStyle: "italic", lineHeight: 1.6 }}>
            Important: These are themes for reflection, not predictions of what will happen. The planet ruling your period doesn't control your life — it colours the lens through which patterns become visible.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── i18n helper ─────────────────────────────────────────────────────────────
// Module-level lang ref so sub-components can access it without prop drilling
let _lang = 'en'
const t = (en: string, hi: string) => _lang === 'hi' ? hi : en

// ─── ForecastTab ──────────────────────────────────────────────────────────────
interface ForecastTabProps { chart: ChartData | null; lang?: string }

export default function ForecastTab({ chart, lang = 'en' }: ForecastTabProps) {
  _lang = lang  // sync module-level ref before render
  const now = new Date()
  const currentYear = now.getFullYear()
  const [activeYear, setActiveYear] = useState(currentYear)
  const [dharmaUnlocked, setDharmaUnlocked] = useState(hasAccess)
  useEffect(() => {
    const id = setInterval(() => setDharmaUnlocked(hasAccess()), 5000)
    const onStorage = () => setDharmaUnlocked(hasAccess())
    window.addEventListener('storage', onStorage)
    return () => { clearInterval(id); window.removeEventListener('storage', onStorage) }
  }, [])

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

  // Generate dynamic yearly outlook from chart dasha sequence
  const yearlyOutlook = useMemo(() => generateYearlyOutlook(chart, currentYear), [chart, currentYear])
  const activeOutlook = yearlyOutlook.find(y => y.year === activeYear) ?? yearlyOutlook[0]

  return (
    <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: 0, fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, color: T.txt }}>
          {t('5-Year Forecast', '5 वर्ष का दृष्टिकोण')}
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.txt3, letterSpacing: "0.04em" }}>
          {t('Thematic Daśā windows — reflection, not prediction', 'दाशा आधारित विषय — चिंतन, भविष्यवाणी नहीं')}
        </p>
      </div>

      {/* ── What is Vimśottarī Daśā? ── */}
      <DashaExplainerCard />

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
        <div style={{ flex: 1, height: 1, background: "rgba(114,166,183,0.15)" }} />
        <span style={{ fontSize: 12, color: T.gold, textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
          5-Year Thematic Outlook
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(114,166,183,0.15)" }} />
      </div>

      {/* Amber calibration note / no-data fallback */}
      {yearlyOutlook.length === 0 ? (
        <div style={{ ...glassCard, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>♄</div>
          <p style={{ margin: 0, color: T.txt2, fontSize: 14 }}>
            Birth data required for a personalised 5-year forecast
          </p>
          <p style={{ margin: "8px 0 0", color: T.txt3, fontSize: 14 }}>
            Cast your chart above to generate your Daśā-based outlook
          </p>
        </div>
      ) : (
      <div style={{
        background:   "rgba(240,168,48,0.08)",
        border:       "1px solid rgba(240,168,48,0.25)",
        borderRadius: 10,
        padding:      "12px 16px",
        fontSize: 14,
        color:        "#F0A830",
        lineHeight:   1.6,
      }}>
        <span style={{ fontWeight: 700, letterSpacing: "0.04em" }}>Note —</span>{" "}
        These thematic windows are derived from your Vimśottarī Mahādaśā sequence. Themes reflect the active planetary period at the midpoint of each year — reflection, not prediction.
      </div>
      )}

      {/* Year tab row + active year card — only shown when dynamic data is available */}
      {yearlyOutlook.length > 0 && activeOutlook && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {yearlyOutlook.map(y => {
              const active = y.year === activeYear
              return (
                <button
                  key={y.year}
                  onClick={() => setActiveYear(y.year)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 8,
                    border: active ? "1px solid #D4B870" : "1px solid rgba(114,166,183,0.2)",
                    background: active ? "rgba(212,184,112,0.12)" : "transparent",
                    color: active ? "#D4B870" : "#9A90B8",
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
          <YearCard y={activeOutlook} dharmaUnlocked={dharmaUnlocked} />
        </>
      )}

      {/* Disclaimer */}
      <p style={{ margin: 0, fontSize: 13, color: T.txt3, fontStyle: "italic", textAlign: "center", letterSpacing: "0.03em" }}>
        Thematic windows for reflection — not predictions of events
      </p>
    </div>
  )
}

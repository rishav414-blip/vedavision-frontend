import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { ChartData } from '@/lib/chartTypes'
import { getSignStr } from '@/lib/chartTypes'
import { YOGA_DESCRIPTIONS, YOGA_PLANET_MAP } from '@/lib/yogaData'
import { t } from '@/lib/i18n'
import { dayScore, dayLabel, dayColor, dayBorder } from '@/lib/panchang'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  gold:     '#C0A860',
  goldBrt:  '#D4B870',
  goldDim:  '#A08050',
  violet:   '#8B7CC8',
  violet2:  '#A99BD9',
  txt:      '#E8E0F0',
  txt2:     '#B8B0C8',
  txt3:     '#7A6A9A',
  ghost:    '#4A3A6A',
  surface:  'rgba(8,4,22,0.72)',
  surfEl:   'rgba(12,6,28,0.72)',
  bdrSub:   'rgba(114,166,183,0.15)',
  bdrAcc:   'rgba(114,166,183,0.2)',
}

const PLANET_COLORS: Record<string, string> = {
  Sun: '#F5C842', Moon: '#D0D8F0', Mars: '#E05050', Mercury: '#7EC8A0',
  Jupiter: '#F0A830', Venus: '#E48DB0', Saturn: '#A08050', Rahu: '#8855CC', Ketu: '#CC8855',
}
const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
}

// ── Shared style primitives ───────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'rgba(8,4,22,0.72)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(114,166,183,0.2)',
  borderRadius: 16,
  padding: '20px',
  boxShadow: '0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(10,5,26,0.88)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
}

// ── Scroll fade-in hook ───────────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/** Gold small-caps section header with hairline above */
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ marginTop: 8, marginBottom: 2 }}>
      <div style={{ height: 1, background: `linear-gradient(90deg, ${T.gold}55 0%, transparent 80%)`, marginBottom: 10 }} />
      <span style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 11,
        fontVariant: 'small-caps',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: T.gold,
        display: 'block',
      }}>{label}</span>
    </div>
  )
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(start?: string, end?: string) {
  if (!start || !end) return 0
  const s = new Date(start).getTime(), e = new Date(end).getTime(), n = Date.now()
  return Math.max(0, Math.min(100, ((n - s) / (e - s)) * 100))
}
function yr(iso?: string) { if (!iso) return '—'; return new Date(iso).getFullYear().toString() }

// ── Famous Natives database ───────────────────────────────────────────────────
interface FamousNative {
  name: string
  lagnaSign: string
  nakshatra: string
  dominantPlanet: string
  domain: string
  note: string
}

const FAMOUS_NATIVES: FamousNative[] = [
  { name: 'Albert Einstein',      lagnaSign: 'Pisces',      nakshatra: 'Purva Bhadrapada', dominantPlanet: 'Saturn',  domain: 'Science',      note: "Shares a Piscean lagna's boundless intuition and a Saturnine patience that transforms radical ideas into enduring theory." },
  { name: 'Nikola Tesla',         lagnaSign: 'Cancer',      nakshatra: 'Pushya',           dominantPlanet: 'Saturn',  domain: 'Invention',    note: "A Pushya Saturn signature: disciplined, selfless, and oriented toward structures that serve the collective." },
  { name: 'Rumi',                 lagnaSign: 'Gemini',      nakshatra: 'Ardra',            dominantPlanet: 'Jupiter', domain: 'Poetry',       note: "Ardra's storm-and-renewal motif, guided by Jupiterian expansion — a seeker who transforms grief into wisdom." },
  { name: 'Mozart',               lagnaSign: 'Aquarius',    nakshatra: 'Dhanishtha',       dominantPlanet: 'Saturn',  domain: 'Music',        note: "Dhanishtha's rhythmic precision and Saturnine mastery — creative abundance disciplined into timeless form." },
  { name: 'Marie Curie',          lagnaSign: 'Scorpio',     nakshatra: 'Jyeshtha',         dominantPlanet: 'Mars',    domain: 'Science',      note: "Jyeshtha's elder-wisdom courage and Martian persistence — breaking through unseen barriers with methodical will." },
  { name: 'Mahatma Gandhi',       lagnaSign: 'Libra',       nakshatra: 'Pushya',           dominantPlanet: 'Saturn',  domain: 'Leadership',   note: "A Saturn-Pushya thread: patient, principled perseverance that outlasts force through moral coherence." },
  { name: 'Rabindranath Tagore',  lagnaSign: 'Taurus',      nakshatra: 'Rohini',           dominantPlanet: 'Venus',   domain: 'Arts',         note: "Rohini's sensory richness and Venus's longing — where beauty becomes a bridge between earth and the infinite." },
  { name: 'Steve Jobs',           lagnaSign: 'Virgo',       nakshatra: 'Hasta',            dominantPlanet: 'Mercury', domain: 'Technology',   note: "Hasta's dexterous precision fused with Mercurial design thinking — detail as a form of devotion." },
  { name: 'Frida Kahlo',          lagnaSign: 'Scorpio',     nakshatra: 'Anuradha',         dominantPlanet: 'Mars',    domain: 'Art',          note: "Anuradha's devotional depth and Martian fire — transmuting personal wound into universal visual poetry." },
  { name: 'Carl Jung',            lagnaSign: 'Leo',         nakshatra: 'Magha',            dominantPlanet: 'Saturn',  domain: 'Psychology',   note: "Magha's ancestral memory and Saturnine depth — navigating the unconscious with scholarly discipline." },
  { name: 'Leonardo da Vinci',    lagnaSign: 'Aries',       nakshatra: 'Bharani',          dominantPlanet: 'Mars',    domain: 'Renaissance',  note: "Bharani's creative-destructive intensity and Martian drive — relentless curiosity that refuses a single domain." },
  { name: 'Lao Tzu',              lagnaSign: 'Pisces',      nakshatra: 'Revati',           dominantPlanet: 'Jupiter', domain: 'Philosophy',   note: "Revati's compassionate completion and Jupiterian wisdom — teaching through paradox and spacious silence." },
  { name: 'Ada Lovelace',         lagnaSign: 'Capricorn',   nakshatra: 'Uttara Ashadha',   dominantPlanet: 'Saturn',  domain: 'Technology',   note: "Uttara Ashadha's unyielding vision and Saturn's structured foresight — imagining what the world is not yet ready for." },
  { name: 'Mirabai',              lagnaSign: 'Cancer',      nakshatra: 'Punarvasu',        dominantPlanet: 'Moon',    domain: 'Devotion',     note: "Punarvasu's return and renewal, carried by the Moon's unconditional longing — love as liberation." },
  { name: 'Swami Vivekananda',    lagnaSign: 'Sagittarius', nakshatra: 'Purva Ashadha',    dominantPlanet: 'Jupiter', domain: 'Spirituality', note: "Purva Ashadha's invincible conviction and Jupiter's missionary fire — bridging ancient wisdom with modern urgency." },
  { name: 'Charles Darwin',       lagnaSign: 'Capricorn',   nakshatra: 'Shravana',         dominantPlanet: 'Saturn',  domain: 'Science',      note: "Shravana's careful listening and Saturn's long-view patience — patterns visible only to those who watch across decades." },
  { name: 'Emily Dickinson',      lagnaSign: 'Gemini',      nakshatra: 'Mrigashira',       dominantPlanet: 'Mercury', domain: 'Poetry',       note: "Mrigashira's eternal seeking and Mercury's precision — naming the ineffable in a slant of light." },
  { name: 'Aryabhata',            lagnaSign: 'Virgo',       nakshatra: 'Chitra',           dominantPlanet: 'Mars',    domain: 'Mathematics',  note: "Chitra's architectural imagination and Martian precision — giving the cosmos mathematical form centuries before its time." },
]

// ── Match engine ──────────────────────────────────────────────────────────────
function getDominantPlanet(chart: ChartData | null): string | null {
  if (!chart?.planetTable) return null
  const exalted = chart.planetTable.find(r => r.dignity === 'Exalted')
  if (exalted) return exalted.planet
  const own = chart.planetTable.find(r => r.dignity === 'Own Sign')
  if (own) return own.planet
  return null
}

function matchFamousNatives(chart: ChartData | null): FamousNative[] {
  if (!chart) return FAMOUS_NATIVES.slice(0, 3)
  const lagna = chart.lagna?.signEn ?? chart.lagna?.sign ?? ''
  const naksh = chart.nakshatra?.name ?? ''
  const dominant = getDominantPlanet(chart)
  const nakLord = chart.nakshatra?.lord ?? ''

  // Score each native
  const scored = FAMOUS_NATIVES.map(f => {
    let score = 0
    if (lagna && f.lagnaSign.toLowerCase() === lagna.toLowerCase()) score += 3
    if (naksh && f.nakshatra.toLowerCase() === naksh.toLowerCase()) score += 2
    if (dominant && f.dominantPlanet === dominant) score += 1
    if (nakLord && f.dominantPlanet === nakLord) score += 1
    return { native: f, score }
  })

  // Sort descending — always return top 3 regardless of score
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, 3).map(s => s.native)
}

// ── Identity Section ──────────────────────────────────────────────────────────
function IdentitySection({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  const name    = chart?.native?.name ?? 'Your Chart'
  const dob     = chart?.native?.dob
  const pob     = chart?.native?.pob
  const lagna   = chart?.lagna?.signEn ?? chart?.lagna?.sign ?? '—'
  const lagnaLord = chart?.lagna?.lord
  const moon    = getSignStr(chart?.moonSign) || '—'
  const nakName = chart?.nakshatra?.name ?? '—'
  const nakPada = chart?.nakshatra?.pada
  const nakLord = chart?.nakshatra?.lord
  const ak      = chart?.karakas?.atmakaraka?.planet_name ?? (chart as any)?.ak
  const amk     = chart?.karakas?.amatyakaraka?.planet_name ?? (chart as any)?.amk

  return (
    <motion.div variants={item} style={{ ...card, borderTop: `2px solid ${T.gold}55` }}>
      {/* Name row */}
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 400, fontStyle: 'italic', color: T.txt, margin: '0 0 4px', letterSpacing: '0.01em', lineHeight: 1.1 }}>
        {name}
      </h2>
      {(dob || pob) && (
        <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: T.txt3, margin: '0 0 16px', letterSpacing: '0.06em' }}>
          {[dob, pob].filter(Boolean).join(' · ')}
        </p>
      )}

      {/* Key identity grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '14px 20px' }}>
        <IdentityPill label={t('Lagna', 'लग्न', lang)} value={lagna} sub={lagnaLord ? `Lord: ${lagnaLord}` : undefined} color={T.gold} />
        <IdentityPill label={t('Birth Nakṣatra', 'जन्म नक्षत्र', lang)} value={nakName} sub={nakLord ? `Lord: ${nakLord}${nakPada ? ` · Pāda ${nakPada}` : ''}` : undefined} color={T.goldBrt} />
        <IdentityPill label={t('Moon Sign', 'चंद्र राशि', lang)} value={moon} color='#D0D8F0' />
        {ak  && <IdentityPill label={t('Ātmakāraka', 'आत्मकारक', lang)} value={ak} color={T.gold} />}
        {amk && <IdentityPill label={t('Amatyakāraka', 'अमात्यकारक', lang)} value={amk} color={T.violet2} />}
      </div>
    </motion.div>
  )
}

function IdentityPill({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.txt3, fontFamily: 'Outfit, sans-serif', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 20, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: T.txt3, fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── Dasha KPI pair ────────────────────────────────────────────────────────────
function DashaKPICard({ planet, label, start, end, pctVal, lang = 'en' }: {
  planet?: string; label: string; start?: string; end?: string; pctVal?: number; lang?: string
}) {
  const color = PLANET_COLORS[planet ?? ''] ?? T.gold
  const glyph = PLANET_GLYPHS[planet ?? ''] ?? '✦'
  const [disp, setDisp] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => setDisp(pctVal ?? 0)); return () => cancelAnimationFrame(id) }, [pctVal])

  return (
    <div style={{ flex: 1, minWidth: 0, background: `rgba(6,2,18,0.75)`, border: `1px solid ${color}45`, borderRadius: 16, padding: '18px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 80% 0%,${color}18,transparent 70%)`, pointerEvents: 'none' }} />
      <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color, fontFamily: 'Outfit, sans-serif', fontWeight: 600, opacity: 0.85 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 34, color, lineHeight: 1, fontFamily: 'serif' }}>{glyph}</span>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 600, color, letterSpacing: '0.01em' }}>{planet ?? '—'}</span>
      </div>
      {start && end && (
        <>
          <div style={{ height: 3, background: 'rgba(114,166,183,0.12)', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
            <div style={{ width: `${disp}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <span style={{ fontSize: 10, color: T.txt3, fontFamily: 'Outfit, sans-serif' }}>{yr(start)} – {yr(end)} · {(pctVal ?? 0).toFixed(0)}% {t('elapsed', 'बीत गया', lang)}</span>
        </>
      )}
    </div>
  )
}

// ── Daily Signal ──────────────────────────────────────────────────────────────
function DailySignalCard({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  const dashaPlanet = chart?.dasha?.current?.planet ?? 'Saturn'
  const today  = new Date()
  const score  = dayScore(today, dashaPlanet)
  const label  = dayLabel(score, lang)
  const color  = dayColor(score)
  const border = dayBorder(score)
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN'
  const dateStr = today.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <motion.div variants={item} style={{ ...card, borderLeft: `3px solid ${border.replace('0.3)', '0.8)')}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.txt3, fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>{t('Today', 'आज', lang)} · {dateStr}</div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontStyle: 'italic', color, margin: '0 0 4px', lineHeight: 1.2 }}>{label}</p>
          <p style={{ fontSize: 11, color: T.txt3, margin: 0, fontFamily: 'Outfit, sans-serif' }}>{t('Score based on active daśā period and lunar cycle', 'सक्रिय दशा और चंद्र चक्र पर आधारित स्कोर', lang)}</p>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${color}15`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 8, color, letterSpacing: '0.08em' }}>/ 100</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Planet Strength Grid ──────────────────────────────────────────────────────
function PlanetStrengthGrid({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
  const table = chart?.planetTable ?? []
  return (
    <motion.div variants={item} style={card}>
      <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.txt3, display: 'block', marginBottom: 14 }}>{t('Nine Grahas', 'नवग्रह', lang)}</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))', gap: 10 }}>
        {PLANETS.map(p => {
          const row = table.find(r => r.planet === p)
          const color = PLANET_COLORS[p] ?? T.gold
          const glyph = PLANET_GLYPHS[p] ?? '✦'
          const isExalted = row?.dignity === 'Exalted'
          const isOwn = row?.dignity === 'Own Sign'
          const isDeb = row?.dignity === 'Debilitated'
          return (
            <div key={p} title={`${p} · ${row?.sign ?? '?'} · H${row?.house ?? '?'} · ${row?.dignity ?? ''}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'default' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: `${color}18`,
                border: `1.5px solid ${isExalted || isOwn ? color : color + '55'}`,
                boxShadow: isExalted
                  ? `0 0 18px ${color}70, 0 0 6px ${color}40, inset 0 0 8px ${color}15`
                  : isDeb
                    ? `0 0 6px rgba(224,80,80,0.3)`
                    : `0 0 10px ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color,
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default',
              }}>
                {glyph}
                {isDeb     && <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 8, background: '#E05050', borderRadius: '50%', width: 13, height: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>↓</span>}
                {isExalted && <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 8, background: '#6EC97A', borderRadius: '50%', width: 13, height: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>↑</span>}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: T.txt3, fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>{p.slice(0, 3)}</div>
                <div style={{ fontSize: 8, color: isExalted ? '#6EC97A' : isDeb ? '#E05050' : T.ghost, fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>{row?.sign?.slice(0, 3) ?? '—'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Wealth & Strength ─────────────────────────────────────────────────────────
function WealthStrengthCard({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  const ws = chart?.wealthScore
  const strength = chart?.chartStrength
  if (ws == null && strength == null) return null

  const total     = ws?.total     ?? 0
  const parashari = ws?.parashari ?? 0
  const bnn       = ws?.bnn       ?? 0

  const strengthColor = strength == null ? T.txt3 : strength >= 70 ? '#6EC97A' : strength >= 40 ? '#F0A830' : '#E05050'
  const strengthLabel = strength == null ? '—' : strength >= 70 ? t('Strong', 'बलवान', lang) : strength >= 40 ? t('Moderate', 'सामान्य', lang) : t('Needs Support', 'दुर्बल', lang)

  function Bar({ value, max, color }: { value: number; max: number; color: string }) {
    const p = max > 0 ? Math.min(100, (value / max) * 100) : 0
    const isGold = color === T.gold || color === T.goldDim
    return (
      <div style={{ height: 6, background: 'rgba(114,166,183,0.15)', borderRadius: 99, overflow: 'hidden' }}>
        <div
          className={isGold ? 'shimmer-bar-gold' : 'shimmer-bar'}
          style={{ width: `${p}%`, height: '100%', borderRadius: 99, transition: 'width 0.6s ease' }}
        />
      </div>
    )
  }

  const R = 24, CIRC = 2 * Math.PI * R
  const dashOffset = strength != null ? CIRC * (1 - Math.min(100, strength) / 100) : CIRC

  return (
    <motion.div variants={item} style={card}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Wealth */}
        {ws != null && (
          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.txt3, fontFamily: 'Outfit, sans-serif' }}>{t('Wealth Score', 'धन स्कोर', lang)}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 40, fontWeight: 800, color: T.gold, lineHeight: 1 }}>{total}</span>
              <span style={{ fontSize: 13, color: T.txt3, fontFamily: 'Outfit, sans-serif' }}>/ 100</span>
            </div>
            <Bar value={total} max={100} color={T.gold} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: T.txt2, fontFamily: 'Outfit, sans-serif' }}>{t('Parashari', 'पाराशरी', lang)}</span>
                  <span style={{ fontSize: 11, color: T.gold, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{parashari}</span>
                </div>
                <Bar value={parashari} max={60} color={T.gold} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: T.txt2, fontFamily: 'Outfit, sans-serif' }}>{t('BNN Bonus', 'BNN बोनस', lang)}</span>
                  <span style={{ fontSize: 11, color: T.goldDim, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{bnn}</span>
                </div>
                <Bar value={bnn} max={40} color={T.goldDim} />
              </div>
            </div>
          </div>
        )}

        {ws != null && strength != null && (
          <div style={{ width: 1, background: 'rgba(114,166,183,0.15)', alignSelf: 'stretch', flexShrink: 0 }} />
        )}

        {/* Chart Strength */}
        {strength != null && (
          <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.txt3, fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>{t('Chart Strength', 'कुंडली बल', lang)}</div>
            <div style={{ position: 'relative', width: 66, height: 66 }}>
              <svg width={66} height={66} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={33} cy={33} r={R} fill="none" stroke="rgba(114,166,183,0.15)" strokeWidth={6} />
                <circle cx={33} cy={33} r={R} fill="none" stroke={strengthColor} strokeWidth={6}
                  strokeDasharray={CIRC} strokeDashoffset={dashOffset} strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 17, fontWeight: 800, color: strengthColor, lineHeight: 1 }}>{strength}</span>
                <span style={{ fontSize: 8, color: T.txt3, letterSpacing: '0.06em' }}>/ 100</span>
              </div>
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 700, color: strengthColor, textAlign: 'center' }}>{strengthLabel}</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Dasha Section ─────────────────────────────────────────────────────────────
function DashaSection({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  const current    = chart?.dasha?.current
  const antardasha = chart?.dasha?.antardasha
  const seq        = chart?.dasha?.sequence ?? []
  const mdPct      = pct(current?.start, current?.end)
  const now        = Date.now()

  return (
    <>
      {/* KPI pair */}
      <motion.div variants={item} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <DashaKPICard planet={current?.planet} label={t('Mahādaśā', 'महादशा', lang)} start={current?.start} end={current?.end} pctVal={mdPct} lang={lang} />
        <DashaKPICard planet={antardasha?.planet} label={t('Antardaśā', 'अंतर्दशा', lang)} end={antardasha?.end} lang={lang} />
      </motion.div>

      {/* Timeline rail */}
      {seq.length > 0 && (
        <motion.div variants={item} style={card}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.txt3, display: 'block', marginBottom: 12 }}>{t('Vimśottarī Timeline', 'विंशोत्तरी दशा', lang)}</span>
          <div style={{ overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' as const }}>
            <div style={{ display: 'flex', minWidth: 'max-content', borderRadius: 8, overflow: 'hidden', height: 38, border: `1px solid rgba(114,166,183,0.2)` }}>
              {seq.map((p, i) => {
                const color   = PLANET_COLORS[p.planet] ?? T.gold
                const isCur   = p.planet === current?.planet
                const start   = new Date(p.start).getTime()
                const end     = new Date(p.end).getTime()
                const isPast  = end < now
                return (
                  <div key={i} title={`${p.planet} ${yr(p.start)}–${yr(p.end)}`}
                    style={{
                      flex: p.years, minWidth: 30,
                      background: isCur ? `${color}22` : isPast ? 'rgba(114,166,183,0.06)' : 'transparent',
                      borderRight: i < seq.length - 1 ? `1px solid rgba(114,166,183,0.2)` : 'none',
                      borderTop: isCur ? `2px solid ${color}` : '2px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: isCur ? color : isPast ? 'rgba(255,255,255,0.2)' : T.txt3,
                      fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' as const,
                      fontWeight: isCur ? 700 : 400, cursor: 'default',
                    }}>
                    {PLANET_GLYPHS[p.planet] ?? ''} {p.planet.slice(0, 2)}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
              <span style={{ fontSize: 10, color: T.txt3, fontFamily: 'Outfit, sans-serif' }}>{yr(seq[0]?.start)}</span>
              <span style={{ fontSize: 10, color: T.gold, fontFamily: 'Outfit, sans-serif' }}>{t('Current', 'वर्तमान', lang)}: {current?.planet} MD</span>
              <span style={{ fontSize: 10, color: T.txt3, fontFamily: 'Outfit, sans-serif' }}>{yr(seq[seq.length - 1]?.end)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

// ── Yogas ─────────────────────────────────────────────────────────────────────
function YogasCard({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  const yogas = chart?.yoga ?? []
  const sequence = chart?.dasha?.sequence
  const [open, setOpen] = useState(false)
  if (!yogas.length) return null
  return (
    <motion.div variants={item} style={card}>
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 0 }}
      >
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.txt3 }}>
          {t('Active Yogas', 'सक्रिय योग', lang)} · {yogas.length} {t('detected', 'पाए गए', lang)}
        </span>
        <span style={{ color: T.txt3, fontSize: 14, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {/* Collapsed preview: just pill tags */}
      {!open && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {yogas.map(y => (
            <span key={y} style={{ background: 'rgba(139,124,200,0.12)', border: `1px solid rgba(139,124,200,0.35)`, borderRadius: 20, padding: '3px 12px', fontSize: 11, color: T.txt2, fontFamily: 'Outfit, sans-serif' }}>{y}</span>
          ))}
        </div>
      )}

      {/* Expanded: full descriptions */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {yogas.map(y => {
            const planets = YOGA_PLANET_MAP[y] || []
            const activePeriods = sequence?.filter(d => planets.includes(d.planet)) ?? []
            const first = activePeriods[0]
            const activationText = first ? `${t('Active during', 'सक्रिय:', lang)} ${first.planet} MD (${first.start?.slice(0, 4)}–${first.end?.slice(0, 4)})` : null
            const desc = YOGA_DESCRIPTIONS[y]
            return (
              <div key={y} style={{ paddingBottom: 10, borderBottom: `1px solid rgba(114,166,183,0.15)` }}>
                <span style={{ background: 'rgba(139,124,200,0.12)', border: `1px solid rgba(139,124,200,0.35)`, borderRadius: 20, padding: '4px 14px', fontSize: 12, color: T.txt2, fontFamily: 'Outfit, sans-serif', display: 'inline-block' }}>{y}</span>
                {desc && <div style={{ color: T.txt2, fontSize: 12, marginTop: 5, marginLeft: 2, lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>{desc}</div>}
                {activationText && <div style={{ color: T.txt3, fontSize: 11, marginTop: 3, marginLeft: 2, fontFamily: 'Outfit, sans-serif' }}>{activationText}</div>}
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// ── Celestial Echoes — Famous Personalities ───────────────────────────────────
function CelestialEchoesCard({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  const matches = matchFamousNatives(chart)

  const DOMAIN_COLORS: Record<string, string> = {
    Science: '#7EC8A0', Invention: '#7EC8A0', Technology: '#7EC8A0', Mathematics: '#7EC8A0',
    Poetry: '#E48DB0', Arts: '#E48DB0', Art: '#E48DB0', Music: '#E48DB0',
    Leadership: '#F0A830', Spirituality: '#F0A830', Devotion: '#F0A830', Philosophy: '#F0A830',
    Psychology: '#A99BD9', Renaissance: '#CC8855',
  }

  return (
    <motion.div variants={item} style={{ ...card, borderColor: `${T.gold}30` }}>
      <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: T.txt3, display: 'block', marginBottom: 4 }}>
        {t('Celestial Echoes', 'दिव्य प्रतिध्वनि', lang)}
      </span>
      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: T.txt3, margin: '0 0 16px', lineHeight: 1.5, fontStyle: 'italic' }}>
        {t('Chart patterns that share thematic resonance with known lives — for reflection, not comparison.', 'चिंतन के लिए — तुलना के लिए नहीं।', lang)}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {matches.map((f, i) => {
          const domColor = DOMAIN_COLORS[f.domain] ?? T.gold
          return (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: i < matches.length - 1 ? 14 : 0, borderBottom: i < matches.length - 1 ? `1px solid rgba(114,166,183,0.15)` : 'none' }}>
              {/* Avatar glyph */}
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${domColor}12`, border: `1.5px solid ${domColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, color: domColor }}>
                ✦
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontStyle: 'italic', color: T.txt, lineHeight: 1.1 }}>{f.name}</span>
                  <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'Outfit, sans-serif', color: domColor, background: `${domColor}15`, border: `1px solid ${domColor}40`, borderRadius: 20, padding: '2px 9px' }}>{f.domain}</span>
                </div>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: T.txt2, margin: 0, lineHeight: 1.6 }}>{f.note}</p>
                <div style={{ marginTop: 5, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, color: T.txt3, fontFamily: 'Outfit, sans-serif' }}>Lagna: <span style={{ color: T.gold }}>{f.lagnaSign}</span></span>
                  <span style={{ fontSize: 10, color: T.txt3, fontFamily: 'Outfit, sans-serif' }}>Nakṣatra: <span style={{ color: T.goldDim }}>{f.nakshatra}</span></span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 10, color: T.ghost, margin: '14px 0 0', lineHeight: 1.5, fontStyle: 'italic' }}>
        {t('These resonances are symbolic — astrological patterns, not destinies shared.', 'ये संकेत प्रतीकात्मक हैं — नियति नहीं।', lang)}
      </p>
    </motion.div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useFadeIn()
  return (
    <div ref={ref} className="scroll-reveal" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function OverviewTab({ chart, lang = 'en' }: { chart: ChartData | null; lang?: string }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── I. Identity ── */}
      <motion.div variants={item}><SectionHeader label={t('Identity', 'परिचय', lang)} /></motion.div>
      <IdentitySection chart={chart} lang={lang} />

      {/* ── II. Active Daśā ── */}
      <motion.div variants={item}><SectionHeader label={t('Active Daśā', 'सक्रिय दशा', lang)} /></motion.div>
      <DailySignalCard chart={chart} lang={lang} />
      <DashaSection chart={chart} lang={lang} />

      {/* ── III. Planetary Strength ── */}
      <motion.div variants={item}><SectionHeader label={t('Planetary Strength', 'ग्रह बल', lang)} /></motion.div>
      <PlanetStrengthGrid chart={chart} lang={lang} />

      {/* ── IV. Wealth & Chart Strength ── */}
      <ScrollReveal delay={0}><WealthStrengthCard chart={chart} lang={lang} /></ScrollReveal>

      {/* ── V. Yogas ── */}
      {(chart?.yoga?.length ?? 0) > 0 && (
        <ScrollReveal delay={80}><SectionHeader label={t('Active Yogas', 'सक्रिय योग', lang)} /></ScrollReveal>
      )}
      <ScrollReveal delay={120}><YogasCard chart={chart} lang={lang} /></ScrollReveal>

      {/* ── VI. Celestial Echoes ── */}
      <ScrollReveal delay={160}><SectionHeader label={t('Celestial Echoes', 'दिव्य प्रतिध्वनि', lang)} /></ScrollReveal>
      <ScrollReveal delay={200}><CelestialEchoesCard chart={chart} lang={lang} /></ScrollReveal>

      {/* ── Share ── */}
      <motion.button variants={item}
        onClick={async () => {
          const name  = chart?.native?.name ?? 'My Chart'
          const lagna = chart?.lagna?.signEn ?? chart?.lagna?.sign ?? '—'
          const nak   = chart?.nakshatra?.name ?? '—'
          const md    = chart?.dasha?.current?.planet ?? '—'
          const ak    = chart?.karakas?.atmakaraka?.planet_name ?? (chart as any)?.ak ?? '—'
          const text  = `✦ ${name}'s Vedic Chart\nLagna: ${lagna} · Nakshatra: ${nak}\nMahādaśā: ${md} · Ātmakāraka: ${ak}\n\nExplore yours → vedavision-app.pages.dev`
          if (navigator.share) { try { await navigator.share({ text }); return } catch {} }
          await navigator.clipboard.writeText(text).catch(() => {})
          window.showToast?.(t('Chart summary copied to clipboard', 'कुंडली सारांश कॉपी हुआ', lang), 'success')
        }}
        style={{ background: 'rgba(10,5,26,0.88)', border: `1px solid ${T.bdrAcc}`, borderRadius: 10, padding: '12px 0', width: '100%', color: T.txt3, fontSize: 12, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '0.06em' }}
      >
        📤 {t('Share Summary', 'सारांश साझा करें', lang)}
      </motion.button>

    </motion.div>
  )
}

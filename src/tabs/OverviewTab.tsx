import React from 'react'
import { motion } from 'framer-motion'

// ── Design tokens ────────────────────────────────────────────────────────────
const T = {
  gold:    '#D4B870',
  violet:  '#8B7CC8',
  violet2: '#A99BD9',
  txt:     '#F0EBF4',
  txt2:    '#B0A0C8',
  txt3:    '#8090B5',
  cardBg:  'rgba(255,255,255,0.04)',
  cardBdr: 'rgba(255,255,255,0.08)',
}

const glass: React.CSSProperties = {
  background:   T.cardBg,
  border:       `1px solid ${T.cardBdr}`,
  borderRadius: 16,
  padding:      20,
}

// ── ChartData interface ───────────────────────────────────────────────────────
interface ChartData {
  native?:  { name?: string; dob?: string; tob?: string; pob?: string }
  lagna?:   { sign?: string; signEn?: string; lord?: string; degree?: string }
  moonSign?: { sign?: string; signEn?: string }
  nakshatra?: { name?: string; pada?: number; lord?: string; theme?: string }
  dasha?: {
    current?:    { planet?: string; start?: string; end?: string }
    antardasha?: { planet?: string; end?: string }
    sequence?:   { planet: string; years: number; start: string; end: string }[]
  }
  yoga?:        string[]
  houses?:      { id: number; sign: string; planets: string[] }[]
  planetTable?: { planet: string; sign: string; house: number; dignity: string; notes?: string }[]
  karakas?: {
    atmakaraka?:   { planet_name?: string }
    amatyakaraka?: { planet_name?: string }
  }
}

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function dashaProgress(start?: string, end?: string): number {
  if (!start || !end) return 0
  const s   = new Date(start).getTime()
  const e   = new Date(end).getTime()
  const now = Date.now()
  if (e <= s) return 0
  return Math.max(0, Math.min(100, ((now - s) / (e - s)) * 100))
}

function fmtYear(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).getFullYear().toString()
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CosmicIdentityCard({ chart }: { chart: ChartData | null }) {
  const name       = chart?.native?.name
  const lagnaSign  = chart?.lagna?.signEn ?? chart?.lagna?.sign
  const nakName    = chart?.nakshatra?.name
  const nakPada    = chart?.nakshatra?.pada
  const nakLord    = chart?.nakshatra?.lord
  const ak         = chart?.karakas?.atmakaraka?.planet_name
  const amk        = chart?.karakas?.amatyakaraka?.planet_name

  if (!chart) {
    return (
      <motion.div variants={itemVariants} style={glass}>
        <p style={{ color: T.txt3, fontSize: 14, textAlign: 'center', margin: 0 }}>
          Cast your chart to begin
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants} style={glass}>
      {/* Name */}
      {name && (
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize:   24,
          fontWeight: 700,
          color:      T.txt,
          margin:     '0 0 10px',
        }}>
          {name}
        </h2>
      )}

      {/* Lagna · Nakshatra */}
      <p style={{ color: T.txt2, fontSize: 13, margin: '0 0 6px', lineHeight: 1.5 }}>
        {[
          lagnaSign && `Lagna: ${lagnaSign}`,
          nakName   && nakPada != null ? `${nakName} pada ${nakPada}` : nakName,
          nakLord   && `lord ${nakLord}`,
        ].filter(Boolean).join(' · ')}
      </p>

      {/* Karakas */}
      {(ak || amk) && (
        <p style={{ color: T.txt3, fontSize: 12, margin: 0 }}>
          {ak  && <span style={{ marginRight: 16 }}><span style={{ color: T.gold }}>AK</span> {ak}</span>}
          {amk && <span><span style={{ color: T.violet2 }}>AmK</span> {amk}</span>}
        </p>
      )}
    </motion.div>
  )
}

function ActiveDashaCard({ chart }: { chart: ChartData | null }) {
  const current    = chart?.dasha?.current
  const antardasha = chart?.dasha?.antardasha
  const sequence   = chart?.dasha?.sequence ?? []
  const pct        = dashaProgress(current?.start, current?.end)

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'Syne, sans-serif',
    fontSize:   11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color:      T.gold,
    marginBottom: 10,
  }

  const nextThree = sequence
    .filter(p => current?.planet && p.planet !== current.planet)
    .slice(0, 3)

  return (
    <motion.div variants={itemVariants} style={glass}>
      <p style={sectionLabel}>✦ Active Daśā</p>

      {current ? (
        <>
          <p style={{
            fontFamily: 'Syne, sans-serif',
            fontSize:   20,
            fontWeight: 700,
            color:      T.gold,
            margin:     '0 0 8px',
          }}>
            {current.planet} Mahādaśā
          </p>

          {/* Progress bar */}
          {current.start && current.end && (
            <div style={{ marginBottom: 10 }}>
              <div style={{
                background:   'rgba(255,255,255,0.07)',
                borderRadius: 99,
                height:       5,
                overflow:     'hidden',
              }}>
                <div style={{
                  width:        `${pct}%`,
                  height:       '100%',
                  background:   T.gold,
                  borderRadius: 99,
                  transition:   'width 0.6s ease',
                }} />
              </div>
              <p style={{ color: T.txt3, fontSize: 11, marginTop: 4 }}>
                {fmtYear(current.start)} – {fmtYear(current.end)} · {pct.toFixed(0)}% elapsed
              </p>
            </div>
          )}

          {/* Antardasha */}
          {antardasha?.planet && (
            <p style={{ color: T.txt2, fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: T.txt3 }}>Antardaśā: </span>
              {antardasha.planet}
              {antardasha.end && ` until ${fmtYear(antardasha.end)}`}
            </p>
          )}

          {/* Upcoming sequence chips */}
          {nextThree.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {nextThree.map(p => (
                <span key={p.planet} style={{
                  background:   'rgba(255,255,255,0.06)',
                  border:       `1px solid ${T.cardBdr}`,
                  borderRadius: 20,
                  padding:      '3px 10px',
                  fontSize:     11,
                  color:        T.txt3,
                }}>
                  {p.planet} {fmtYear(p.start)}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <p style={{ color: T.txt3, fontSize: 13, margin: 0 }}>
          Daśā data unavailable
        </p>
      )}
    </motion.div>
  )
}

function YogasCard({ chart }: { chart: ChartData | null }) {
  const yogas = chart?.yoga ?? []
  const shown = yogas.slice(0, 6)
  const extra = yogas.length - shown.length

  return (
    <motion.div variants={itemVariants} style={glass}>
      <p style={{
        fontFamily: 'Syne, sans-serif',
        fontSize:   18,
        fontWeight: 700,
        color:      T.txt,
        margin:     '0 0 12px',
      }}>
        Active Yogas
      </p>

      {shown.length === 0 ? (
        <p style={{ color: T.txt3, fontSize: 13, margin: 0 }}>
          No classical yogas detected in this chart
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {shown.map(y => (
            <span key={y} style={{
              background:   'rgba(139,124,200,0.12)',
              border:       `1px solid ${T.violet}`,
              borderRadius: 20,
              padding:      '4px 12px',
              fontSize:     12,
              color:        T.txt2,
            }}>
              {y}
            </span>
          ))}
          {extra > 0 && (
            <span style={{
              background:   'rgba(255,255,255,0.04)',
              border:       `1px solid ${T.cardBdr}`,
              borderRadius: 20,
              padding:      '4px 12px',
              fontSize:     12,
              color:        T.txt3,
            }}>
              +{extra} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}

function NakshatraCard({ chart }: { chart: ChartData | null }) {
  const nak   = chart?.nakshatra
  const pada  = nak?.pada ?? 1
  const dots  = [1, 2, 3, 4]

  return (
    <motion.div variants={itemVariants} style={glass}>
      <p style={{
        fontFamily: 'Syne, sans-serif',
        fontSize:   18,
        fontWeight: 700,
        color:      T.txt,
        margin:     '0 0 12px',
      }}>
        Nakṣatra
      </p>

      {nak?.name ? (
        <>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle:  'italic',
            fontSize:   28,
            color:      T.txt,
            margin:     '0 0 8px',
          }}>
            {nak.name}
          </p>

          {/* Pada dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {dots.map(d => (
              <span key={d} style={{
                width:        10,
                height:       10,
                borderRadius: '50%',
                background:   d === pada ? T.gold : 'rgba(255,255,255,0.12)',
                border:       `1px solid ${d === pada ? T.gold : 'rgba(255,255,255,0.15)'}`,
                display:      'inline-block',
              }} />
            ))}
            <span style={{ color: T.txt3, fontSize: 11, marginLeft: 4, lineHeight: '10px' }}>
              pada {pada}
            </span>
          </div>

          {nak.lord && (
            <p style={{ color: T.txt2, fontSize: 13, margin: '0 0 4px' }}>
              Lord: {nak.lord}
            </p>
          )}
          {nak.theme && (
            <p style={{ color: T.txt3, fontSize: 12, fontStyle: 'italic', margin: 0 }}>
              {nak.theme}
            </p>
          )}
        </>
      ) : (
        <p style={{ color: T.txt3, fontSize: 13, margin: 0 }}>
          Nakṣatra data unavailable
        </p>
      )}
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { chart: ChartData | null }

export default function OverviewTab({ chart }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <CosmicIdentityCard chart={chart} />
      <ActiveDashaCard    chart={chart} />
      <YogasCard          chart={chart} />
      <NakshatraCard      chart={chart} />
    </motion.div>
  )
}

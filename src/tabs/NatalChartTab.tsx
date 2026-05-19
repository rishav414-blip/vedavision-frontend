import React, { useState } from 'react'
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

// ── Planet colour palette ─────────────────────────────────────────────────────
const PLANET_COLORS: Record<string, string> = {
  Su:  '#F5C842', Sun:     '#F5C842',
  Mo:  '#D0D8F0', Moon:    '#D0D8F0',
  Ma:  '#E05050', Mars:    '#E05050',
  Me:  '#7EC8A0', Mercury: '#7EC8A0',
  Ju:  '#F0A830', Jupiter: '#F0A830',
  Ve:  '#E48DB0', Venus:   '#E48DB0',
  Sa:  '#A08050', Saturn:  '#A08050',
  Ra:  '#8855CC', Rahu:    '#8855CC',
  Ke:  '#CC8855', Ketu:    '#CC8855',
  Lg:  '#AACCFF', Lagna:   '#AACCFF',
}

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
}

function abbr(name: string): string {
  return PLANET_ABBR[name] ?? name.slice(0, 2)
}
function planetColor(name: string): string {
  return PLANET_COLORS[name] ?? PLANET_COLORS[abbr(name)] ?? T.txt3
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

// ── North Indian chart layout ─────────────────────────────────────────────────
// 4×4 grid; each house has [col-start, col-end, row-start, row-end] (1-based CSS grid lines)
const HOUSE_GRID: Record<number, [number, number, number, number]> = {
  12: [1, 2, 1, 2],
  1:  [2, 3, 1, 2],
  2:  [3, 4, 1, 2],
  3:  [4, 5, 1, 2],
  11: [1, 2, 2, 3],
  4:  [4, 5, 2, 3],
  10: [1, 2, 3, 4],
  5:  [4, 5, 3, 4],
  9:  [1, 2, 4, 5],
  8:  [2, 3, 4, 5],
  7:  [3, 4, 4, 5],
  6:  [4, 5, 4, 5],
}
// Center 2×2 spans cols 2-4, rows 2-4
const CENTER_GRID: React.CSSProperties = {
  gridColumn: '2 / 4',
  gridRow:    '2 / 4',
}

interface HouseCellProps {
  houseId:   number
  sign:      string
  planets:   string[]
  isLagna:   boolean
  hovered:   number | null
  onHover:   (id: number | null) => void
}

function HouseCell({ houseId, sign, planets, isLagna, hovered, onHover }: HouseCellProps) {
  const [cs, ce, rs, re] = HOUSE_GRID[houseId]
  const isHovered = hovered === houseId

  return (
    <div
      onMouseEnter={() => onHover(houseId)}
      onMouseLeave={() => onHover(null)}
      style={{
        gridColumn:    `${cs} / ${ce}`,
        gridRow:       `${rs} / ${re}`,
        border:        `1px solid ${isHovered ? 'rgba(212,184,112,0.4)' : T.cardBdr}`,
        borderRadius:  6,
        padding:       '4px 5px',
        position:      'relative',
        minHeight:     60,
        background:    isHovered ? 'rgba(212,184,112,0.04)' : 'transparent',
        transition:    'border-color 0.2s, background 0.2s',
        cursor:        'default',
        display:       'flex',
        flexDirection: 'column',
        gap:           2,
        overflow:      'hidden',
      }}
    >
      {/* House number */}
      <span style={{
        fontSize:    9,
        fontWeight:  700,
        color:       T.gold,
        lineHeight:  1,
        fontFamily:  'Inter, system-ui, sans-serif',
        letterSpacing: '0.05em',
      }}>
        {houseId}
      </span>

      {/* Sign name */}
      <span style={{
        fontSize:   9,
        color:      T.txt3,
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: 1,
      }}>
        {sign?.slice(0, 3)}
      </span>

      {/* Lagna marker */}
      {isLagna && (
        <span style={{
          fontSize:    9,
          color:       PLANET_COLORS.Lg,
          fontFamily:  'Inter, system-ui, sans-serif',
          fontWeight:  700,
          lineHeight:  1,
        }}>
          Lg
        </span>
      )}

      {/* Planets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 1 }}>
        {planets.map(p => (
          <span key={p} style={{
            fontSize:   9,
            color:      planetColor(p),
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            lineHeight: 1,
          }}>
            {abbr(p)}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Dignity badge ─────────────────────────────────────────────────────────────
const DIGNITY_COLORS: Record<string, { bg: string; color: string }> = {
  exalted:     { bg: 'rgba(126,200,160,0.15)', color: '#7EC8A0' },
  own:         { bg: 'rgba(212,184,112,0.15)', color: T.gold },
  moolatrikona:{ bg: 'rgba(212,184,112,0.10)', color: '#C8A850' },
  debilitated: { bg: 'rgba(224,80,80,0.15)',  color: '#E05050' },
  neutral:     { bg: 'rgba(255,255,255,0.05)', color: T.txt3 },
}

function DignityBadge({ dignity }: { dignity: string }) {
  const key   = dignity?.toLowerCase() as keyof typeof DIGNITY_COLORS
  const style = DIGNITY_COLORS[key] ?? DIGNITY_COLORS.neutral
  return (
    <span style={{
      background:   style.bg,
      color:        style.color,
      borderRadius: 10,
      padding:      '2px 7px',
      fontSize:     10,
      fontFamily:   'Inter, system-ui, sans-serif',
      textTransform: 'capitalize',
    }}>
      {dignity ?? 'neutral'}
    </span>
  )
}

// ── Planet table ──────────────────────────────────────────────────────────────
interface PlanetRow {
  planet: string; sign: string; house: number; dignity: string; notes?: string
}

function PlanetTable({ rows }: { rows: PlanetRow[] }) {
  const thStyle: React.CSSProperties = {
    fontFamily:    'Inter, system-ui, sans-serif',
    fontSize:      10,
    fontWeight:    600,
    color:         T.txt3,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    paddingBottom: 8,
    textAlign:     'left',
    borderBottom:  `1px solid ${T.cardBdr}`,
  }
  const tdStyle: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize:   13,
    color:      T.txt2,
    padding:    '6px 0',
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
    verticalAlign: 'middle',
  }

  return (
    <div style={{ ...glass, marginTop: '1.5rem' }}>
      <p style={{
        fontFamily: 'Syne, sans-serif',
        fontSize:   18,
        fontWeight: 700,
        color:      T.txt,
        margin:     '0 0 14px',
      }}>
        Planetary Positions
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Planet', 'Sign', 'House', 'Dignity', 'Notes'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.planet}>
                <td style={{ ...tdStyle, color: planetColor(row.planet), fontWeight: 600 }}>
                  {row.planet}
                </td>
                <td style={tdStyle}>{row.sign}</td>
                <td style={{ ...tdStyle, color: T.txt3 }}>{row.house}</td>
                <td style={tdStyle}><DignityBadge dignity={row.dignity} /></td>
                <td style={{ ...tdStyle, color: T.txt3, fontSize: 11, fontStyle: 'italic' }}>
                  {row.notes ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { chart: ChartData | null }

export default function NatalChartTab({ chart }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (!chart || !chart.houses) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ ...glass, textAlign: 'center', paddingTop: 48, paddingBottom: 48 }}
      >
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontStyle:  'italic',
          fontSize:   20,
          color:      T.txt3,
          margin:     '0 0 8px',
        }}>
          Rāśi Chart
        </p>
        <p style={{ color: T.txt3, fontSize: 13, margin: 0 }}>
          Cast your chart above to see the Rāśi chart
        </p>
      </motion.div>
    )
  }

  const lagnaHouseId = chart.lagna ? 1 : null
  const houseMap     = Object.fromEntries(chart.houses.map(h => [h.id, h]))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Chart grid */}
      <div style={{
        maxWidth: 380,
        margin:   '0 auto 0',
        width:    '100%',
      }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows:    'repeat(4, 1fr)',
          gap:                 3,
          aspectRatio:         '1 / 1',
        }}>
          {/* House cells */}
          {Object.entries(HOUSE_GRID).map(([idStr]) => {
            const id    = Number(idStr)
            const house = houseMap[id] ?? { id, sign: '', planets: [] }
            return (
              <HouseCell
                key={id}
                houseId  ={id}
                sign     ={house.sign}
                planets  ={house.planets}
                isLagna  ={id === lagnaHouseId}
                hovered  ={hovered}
                onHover  ={setHovered}
              />
            )
          })}

          {/* Center 2×2 label */}
          <div style={{
            ...CENTER_GRID,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            border:         `1px solid ${T.cardBdr}`,
            borderRadius:   6,
            background:     'rgba(139,124,200,0.04)',
            pointerEvents:  'none',
          }}>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle:  'italic',
              fontSize:   14,
              color:      T.gold,
              textAlign:  'center',
              lineHeight: 1.3,
            }}>
              Celestial<br />Noir
            </span>
          </div>
        </div>
      </div>

      {/* Planet table */}
      {chart.planetTable && chart.planetTable.length > 0 && (
        <PlanetTable rows={chart.planetTable} />
      )}
    </motion.div>
  )
}

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  As:  '#AACCFF',
}

// Abbreviation → color (for divisional charts that use short codes)
const ABBR_COLORS: Record<string, string> = {
  Su:'#F5C842', Mo:'#D0D8F0', Ma:'#E05050', Me:'#7EC8A0',
  Ju:'#F0A830', Ve:'#E48DB0', Sa:'#A08050', Ra:'#8855CC', Ke:'#CC8855', As:'#AACCFF',
}

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
}

// Full name lookup (for tooltip display)
const ABBR_FULL: Record<string, string> = {
  Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury',
  Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu', As: 'Lagna',
}

// Planet glyphs
const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋', Lagna: 'Lg',
  Su: '☉', Mo: '☽', Ma: '♂', Me: '☿', Ju: '♃',
  Ve: '♀', Sa: '♄', Ra: '☊', Ke: '☋', As: 'Lg',
}

function abbr(name: string): string {
  return PLANET_ABBR[name] ?? name.slice(0, 2)
}
function planetColor(name: string): string {
  return PLANET_COLORS[name] ?? PLANET_COLORS[abbr(name)] ?? ABBR_COLORS[name] ?? T.txt3
}
function fullName(nameOrAbbr: string): string {
  return ABBR_FULL[nameOrAbbr] ?? nameOrAbbr
}
function glyph(nameOrAbbr: string): string {
  return PLANET_GLYPHS[nameOrAbbr] ?? PLANET_GLYPHS[fullName(nameOrAbbr)] ?? ''
}

// ── House themes lookup ───────────────────────────────────────────────────────
const HOUSE_THEMES: Record<number, { title: string; themes: string[] }> = {
  1:  { title: 'Lagna — Self & Body',        themes: ['Identity','Appearance','Vitality','First impressions'] },
  2:  { title: 'Dhana — Wealth & Speech',    themes: ['Resources','Family','Voice','Values','Early childhood'] },
  3:  { title: 'Sahaja — Courage & Skill',   themes: ['Siblings','Communication','Short journeys','Hands'] },
  4:  { title: 'Sukha — Home & Heart',       themes: ['Mother','Property','Inner peace','Education foundation'] },
  5:  { title: 'Putra — Creativity & Merit', themes: ['Children','Intelligence','Speculation','Past merit'] },
  6:  { title: 'Ari — Service & Health',     themes: ['Enemies','Debt','Daily work','Digestion','Discipline'] },
  7:  { title: 'Kalatra — Partnerships',     themes: ['Spouse','Business partners','Public','Contracts'] },
  8:  { title: 'Randhra — Transformation',   themes: ['Longevity','Hidden matters','Research','Inheritance'] },
  9:  { title: 'Dharma — Higher Purpose',    themes: ['Father','Guru','Long journeys','Philosophy','Luck'] },
  10: { title: 'Karma — Vocation & Status',  themes: ['Career','Authority','Reputation','Public action'] },
  11: { title: 'Labha — Gains & Networks',   themes: ['Income','Elder siblings','Aspirations','Friends'] },
  12: { title: 'Vyaya — Liberation & Loss',  themes: ['Foreign lands','Expenses','Spirituality','Sleep'] },
}

// ── ChartData interface ───────────────────────────────────────────────────────
interface DivHouse {
  id: number
  sign: string
  short: string
  planets: string[]
}

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
  d9Houses?:  DivHouse[]
  d10Houses?: DivHouse[]
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

// ── House cell (shared for D1 / D9 / D10) ────────────────────────────────────
interface HouseCellProps {
  houseId:   number
  sign:      string
  planets:   string[]
  isLagna:   boolean
  selected:  number | null
  onSelect:  (id: number | null) => void
}

function HouseCell({ houseId, sign, planets, isLagna, selected, onSelect }: HouseCellProps) {
  const [cs, ce, rs, re] = HOUSE_GRID[houseId]
  const isSelected = selected === houseId

  return (
    <div
      onClick={() => onSelect(isSelected ? null : houseId)}
      style={{
        gridColumn:    `${cs} / ${ce}`,
        gridRow:       `${rs} / ${re}`,
        border:        `1px solid ${isSelected ? 'rgba(212,184,112,0.6)' : T.cardBdr}`,
        borderRadius:  6,
        padding:       '4px 5px',
        position:      'relative',
        minHeight:     60,
        background:    isSelected ? 'rgba(212,184,112,0.07)' : 'transparent',
        transition:    'border-color 0.2s, background 0.2s',
        cursor:        'pointer',
        display:       'flex',
        flexDirection: 'column',
        gap:           2,
        overflow:      'hidden',
        userSelect:    'none',
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

// ── House detail panel (shown below chart on click) ───────────────────────────
interface HousePanelProps {
  houseId:     number
  sign:        string
  planets:     string[]
  planetTable?: { planet: string; sign: string; house: number; dignity: string; notes?: string }[]
  onClose:     () => void
}

function HousePanel({ houseId, sign, planets, planetTable, onClose }: HousePanelProps) {
  const theme = HOUSE_THEMES[houseId]

  // For dignity lookup, try to match planets in this house from the planet table
  function dignityFor(p: string): string {
    if (!planetTable) return ''
    const row = planetTable.find(r =>
      r.planet === p || r.planet === fullName(p) || abbr(r.planet) === p
    )
    return row?.dignity ?? ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      style={{
        ...glass,
        marginTop: 12,
        position:  'relative',
        borderColor: 'rgba(212,184,112,0.25)',
      }}
    >
      {/* Dismiss */}
      <button
        onClick={onClose}
        style={{
          position:   'absolute',
          top:        12,
          right:      14,
          background: 'none',
          border:     'none',
          color:      T.txt3,
          fontSize:   18,
          cursor:     'pointer',
          lineHeight: 1,
          padding:    0,
        }}
        aria-label="Close"
      >
        ×
      </button>

      {/* Title */}
      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize:   18,
        fontWeight: 600,
        color:      T.gold,
        margin:     '0 0 6px',
        paddingRight: 24,
      }}>
        House {houseId} — {theme?.title ?? sign}
      </p>

      {/* Sign */}
      <p style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize:   12,
        color:      T.txt3,
        margin:     '0 0 10px',
        letterSpacing: '0.04em',
      }}>
        {sign}
      </p>

      {/* Theme pills */}
      {theme && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {theme.themes.map(t => (
            <span key={t} style={{
              background:   'rgba(139,124,200,0.15)',
              border:       '1px solid rgba(139,124,200,0.25)',
              borderRadius: 20,
              padding:      '2px 10px',
              fontSize:     11,
              color:        T.violet2,
              fontFamily:   'Inter, system-ui, sans-serif',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Planets */}
      {planets.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{
            fontFamily:    'Inter, system-ui, sans-serif',
            fontSize:      10,
            fontWeight:    600,
            color:         T.txt3,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin:        '0 0 4px',
          }}>
            Planets in this house
          </p>
          {planets.map(p => {
            const full    = fullName(p)
            const glyphCh = glyph(p)
            const col     = planetColor(p)
            const dig     = dignityFor(p)
            return (
              <div key={p} style={{
                display:     'flex',
                alignItems:  'center',
                gap:         10,
                padding:     '6px 10px',
                background:  'rgba(255,255,255,0.03)',
                borderRadius: 8,
                border:       `1px solid rgba(255,255,255,0.06)`,
              }}>
                <span style={{
                  fontSize:   18,
                  color:      col,
                  lineHeight: 1,
                  minWidth:   22,
                  textAlign:  'center',
                }}>
                  {glyphCh}
                </span>
                <span style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize:   13,
                  color:      col,
                  fontWeight: 600,
                  minWidth:   72,
                }}>
                  {full}
                </span>
                {dig && (
                  <DignityBadge dignity={dig} />
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize:   13,
          color:      T.txt3,
          fontStyle:  'italic',
          margin:     0,
        }}>
          No planets in this house
        </p>
      )}
    </motion.div>
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

// ── Divisional chart grid (D9 / D10 use short codes already) ─────────────────
interface DivChartProps {
  houses:      DivHouse[]
  centerLabel: string
  selected:    number | null
  onSelect:    (id: number | null) => void
}

function DivChart({ houses, centerLabel, selected, onSelect }: DivChartProps) {
  const houseMap = Object.fromEntries(houses.map(h => [h.id, h]))

  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows:    'repeat(4, 1fr)',
      gap:                 3,
      aspectRatio:         '1 / 1',
    }}>
      {Object.entries(HOUSE_GRID).map(([idStr]) => {
        const id    = Number(idStr)
        const house = houseMap[id] ?? { id, sign: '', short: '', planets: [] }
        return (
          <div
            key={id}
            onClick={() => onSelect(selected === id ? null : id)}
            style={{
              gridColumn:    `${HOUSE_GRID[id][0]} / ${HOUSE_GRID[id][1]}`,
              gridRow:       `${HOUSE_GRID[id][2]} / ${HOUSE_GRID[id][3]}`,
              border:        `1px solid ${selected === id ? 'rgba(212,184,112,0.6)' : T.cardBdr}`,
              borderRadius:  6,
              padding:       '4px 5px',
              minHeight:     60,
              background:    selected === id ? 'rgba(212,184,112,0.07)' : 'transparent',
              transition:    'border-color 0.2s, background 0.2s',
              cursor:        'pointer',
              display:       'flex',
              flexDirection: 'column',
              gap:           2,
              overflow:      'hidden',
              userSelect:    'none',
            }}
          >
            <span style={{
              fontSize:    9,
              fontWeight:  700,
              color:       T.gold,
              lineHeight:  1,
              fontFamily:  'Inter, system-ui, sans-serif',
              letterSpacing: '0.05em',
            }}>
              {id}
            </span>
            <span style={{
              fontSize:   9,
              color:      T.txt3,
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1,
            }}>
              {house.short || house.sign?.slice(0, 3)}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 1 }}>
              {house.planets.map(p => (
                <span key={p} style={{
                  fontSize:   9,
                  color:      ABBR_COLORS[p] ?? planetColor(p),
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  lineHeight: 1,
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )
      })}

      {/* Center label */}
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
          fontSize:   13,
          color:      T.gold,
          textAlign:  'center',
          lineHeight: 1.3,
        }}>
          {centerLabel}
        </span>
      </div>
    </div>
  )
}

// ── Divisional house tooltip panel ────────────────────────────────────────────
interface DivHousePanelProps {
  houseId: number
  sign:    string
  planets: string[]
  onClose: () => void
}

function DivHousePanel({ houseId, sign, planets, onClose }: DivHousePanelProps) {
  const theme = HOUSE_THEMES[houseId]
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      style={{
        ...glass,
        marginTop:   12,
        position:    'relative',
        borderColor: 'rgba(212,184,112,0.25)',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position:   'absolute',
          top:        12,
          right:      14,
          background: 'none',
          border:     'none',
          color:      T.txt3,
          fontSize:   18,
          cursor:     'pointer',
          lineHeight: 1,
          padding:    0,
        }}
        aria-label="Close"
      >
        ×
      </button>

      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize:   18,
        fontWeight: 600,
        color:      T.gold,
        margin:     '0 0 4px',
        paddingRight: 24,
      }}>
        House {houseId} — {theme?.title ?? sign}
      </p>
      <p style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize:   12,
        color:      T.txt3,
        margin:     '0 0 10px',
      }}>
        {sign}
      </p>

      {theme && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {theme.themes.map(t => (
            <span key={t} style={{
              background:   'rgba(139,124,200,0.15)',
              border:       '1px solid rgba(139,124,200,0.25)',
              borderRadius: 20,
              padding:      '2px 10px',
              fontSize:     11,
              color:        T.violet2,
              fontFamily:   'Inter, system-ui, sans-serif',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {planets.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {planets.map(p => {
            const col     = ABBR_COLORS[p] ?? planetColor(p)
            const glyphCh = glyph(p)
            const full    = fullName(p)
            return (
              <div key={p} style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '5px 10px',
                background:   'rgba(255,255,255,0.03)',
                borderRadius: 8,
                border:       `1px solid rgba(255,255,255,0.06)`,
              }}>
                <span style={{ fontSize: 16, color: col }}>{glyphCh}</span>
                <span style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize:   12,
                  color:      col,
                  fontWeight: 600,
                }}>
                  {full}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize:   13,
          color:      T.txt3,
          fontStyle:  'italic',
          margin:     0,
        }}>
          No planets in this house
        </p>
      )}
    </motion.div>
  )
}

// ── Chart type tab selector ───────────────────────────────────────────────────
type ChartTab = 'd1' | 'd9' | 'd10'

interface ChartTabBarProps {
  active:    ChartTab
  hasD9:     boolean
  hasD10:    boolean
  onChange:  (t: ChartTab) => void
}

function ChartTabBar({ active, hasD9, hasD10, onChange }: ChartTabBarProps) {
  const tabs: { id: ChartTab; label: string; disabled: boolean }[] = [
    { id: 'd1',  label: 'D1 — Rāśi',     disabled: false },
    { id: 'd9',  label: 'D9 — Navamsa',   disabled: !hasD9 },
    { id: 'd10', label: 'D10 — Dashamsha', disabled: !hasD10 },
  ]

  return (
    <div style={{
      display:      'flex',
      gap:          4,
      marginBottom: 14,
      background:   'rgba(255,255,255,0.03)',
      borderRadius: 10,
      padding:      4,
      border:       `1px solid ${T.cardBdr}`,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            style={{
              flex:         1,
              padding:      '7px 6px',
              borderRadius: 8,
              border:       `1px solid ${isActive ? 'rgba(212,184,112,0.5)' : 'transparent'}`,
              background:   isActive ? 'rgba(212,184,112,0.08)' : 'transparent',
              color:        tab.disabled ? T.txt3 : isActive ? T.gold : T.txt2,
              fontFamily:   'Inter, system-ui, sans-serif',
              fontSize:     11,
              fontWeight:   isActive ? 600 : 400,
              cursor:       tab.disabled ? 'not-allowed' : 'pointer',
              transition:   'all 0.18s',
              letterSpacing: '0.02em',
              opacity:      tab.disabled ? 0.45 : 1,
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { chart: ChartData | null }

export default function NatalChartTab({ chart }: Props) {
  const [activeTab,    setActiveTab]    = useState<ChartTab>('d1')
  const [selectedD1,   setSelectedD1]   = useState<number | null>(null)
  const [selectedD9,   setSelectedD9]   = useState<number | null>(null)
  const [selectedD10,  setSelectedD10]  = useState<number | null>(null)

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
  const hasD9        = !!(chart.d9Houses  && chart.d9Houses.length  > 0)
  const hasD10       = !!(chart.d10Houses && chart.d10Houses.length > 0)

  // Sub-label below tab bar
  const subLabel: Record<ChartTab, string> = {
    d1:  'Rāśi — Birth / Physical Chart',
    d9:  'Navamsa — Soul & Marriage Chart',
    d10: 'Dashamsha — Career & Vocation Chart',
  }

  // Helpers to get sign/planets for selected house in divisional charts
  function d9InfoFor(id: number) {
    const h = chart.d9Houses?.find(x => x.id === id)
    return { sign: h?.sign ?? '', planets: h?.planets ?? [] }
  }
  function d10InfoFor(id: number) {
    const h = chart.d10Houses?.find(x => x.id === id)
    return { sign: h?.sign ?? '', planets: h?.planets ?? [] }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Chart area */}
      <div style={{ maxWidth: 380, margin: '0 auto', width: '100%' }}>
        {/* Tab bar */}
        <ChartTabBar
          active   ={activeTab}
          hasD9    ={hasD9}
          hasD10   ={hasD10}
          onChange ={(t) => {
            setActiveTab(t)
            setSelectedD1(null)
            setSelectedD9(null)
            setSelectedD10(null)
          }}
        />

        {/* Sub-label */}
        <p style={{
          fontFamily:    'Inter, system-ui, sans-serif',
          fontSize:      11,
          color:         T.txt3,
          letterSpacing: '0.04em',
          textAlign:     'center',
          margin:        '0 0 10px',
          fontStyle:     'italic',
        }}>
          {subLabel[activeTab]}
        </p>

        {/* ── D1 chart ── */}
        {activeTab === 'd1' && (
          <>
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows:    'repeat(4, 1fr)',
              gap:                 3,
              aspectRatio:         '1 / 1',
            }}>
              {Object.entries(HOUSE_GRID).map(([idStr]) => {
                const id    = Number(idStr)
                const house = houseMap[id] ?? { id, sign: '', planets: [] }
                return (
                  <HouseCell
                    key     ={id}
                    houseId ={id}
                    sign    ={house.sign}
                    planets ={house.planets}
                    isLagna ={id === lagnaHouseId}
                    selected={selectedD1}
                    onSelect={setSelectedD1}
                  />
                )
              })}

              {/* Center label */}
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

            {/* D1 house detail panel */}
            <AnimatePresence>
              {selectedD1 !== null && (
                <HousePanel
                  key        ={selectedD1}
                  houseId    ={selectedD1}
                  sign       ={houseMap[selectedD1]?.sign ?? ''}
                  planets    ={houseMap[selectedD1]?.planets ?? []}
                  planetTable={chart.planetTable}
                  onClose    ={() => setSelectedD1(null)}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* ── D9 chart ── */}
        {activeTab === 'd9' && hasD9 && (
          <>
            <DivChart
              houses     ={chart.d9Houses!}
              centerLabel={'Navamsa'}
              selected   ={selectedD9}
              onSelect   ={setSelectedD9}
            />
            <AnimatePresence>
              {selectedD9 !== null && (() => {
                const { sign, planets } = d9InfoFor(selectedD9)
                return (
                  <DivHousePanel
                    key    ={selectedD9}
                    houseId={selectedD9}
                    sign   ={sign}
                    planets={planets}
                    onClose={() => setSelectedD9(null)}
                  />
                )
              })()}
            </AnimatePresence>
          </>
        )}

        {/* ── D10 chart ── */}
        {activeTab === 'd10' && hasD10 && (
          <>
            <DivChart
              houses     ={chart.d10Houses!}
              centerLabel={'Dashamsha'}
              selected   ={selectedD10}
              onSelect   ={setSelectedD10}
            />
            <AnimatePresence>
              {selectedD10 !== null && (() => {
                const { sign, planets } = d10InfoFor(selectedD10)
                return (
                  <DivHousePanel
                    key    ={selectedD10}
                    houseId={selectedD10}
                    sign   ={sign}
                    planets={planets}
                    onClose={() => setSelectedD10(null)}
                  />
                )
              })()}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Planet table — only on D1 tab */}
      {activeTab === 'd1' && chart.planetTable && chart.planetTable.length > 0 && (
        <PlanetTable rows={chart.planetTable} />
      )}
    </motion.div>
  )
}

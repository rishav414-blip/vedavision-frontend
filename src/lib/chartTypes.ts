// Shared chart type definitions — single source of truth for the full chart object.
// Backend returns moonSign/sunSign as plain strings; SAMPLE_CHART uses { sign, signEn }.
// Use getMoonSign() / getSunSign() helpers everywhere instead of accessing .sign directly.

export type SignValue = string | { sign?: string; signEn?: string }

export function getSignStr(v: SignValue | undefined): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  return v.signEn ?? v.sign ?? ''
}

// ── Sub-types ──────────────────────────────────────────────────────────────────

export interface House {
  id: number
  sign: string
  planets: string[]
}

export interface DivHouse {
  id: number
  sign: string
  short?: string
  planets: string[]
}

export interface PlanetRow {
  planet: string
  sign: string
  house: number
  dignity: string
  degree?: string | number
  degreeDecimal?: number
  color?: string
  glyph?: string
  skt?: string
  notes?: string
}

export interface Karaka {
  planet_name?: string
  sign?: string
}

export interface Karakas {
  atmakaraka?: Karaka
  amatyakaraka?: Karaka
  bhratrukaraka?: Karaka
  matrukaraka?: Karaka
  putrakaraka?: Karaka
  gnatikaraka?: Karaka
  darakaraka?: Karaka
}

export interface BNNTransit {
  transit: string
  transitSign?: string
  natalContact?: string
  theme: string
  start?: string
  end?: string
  planet?: string
}

export interface DashaEntry {
  planet: string
  years: number
  start: string
  end: string
}

// ── Root chart type ────────────────────────────────────────────────────────────

export interface ChartData {
  native?: {
    name?: string
    dob?: string
    tob?: string
    pob?: string
    gender?: string
  }
  lagna?: {
    sign?: string
    signEn?: string
    lord?: string
    degree?: string
  }
  /** Backend returns a plain string; SAMPLE_CHART uses { sign, signEn }. Use getSignStr(). */
  moonSign?: SignValue
  /** Backend returns a plain string; SAMPLE_CHART uses { sign, signEn }. Use getSignStr(). */
  sunSign?: SignValue
  nakshatra?: {
    name?: string
    pada?: number
    lord?: string
    theme?: string
    deity?: string
    symbol?: string
  }
  dasha?: {
    current?: { planet?: string; start?: string; end?: string }
    antardasha?: { planet?: string; start?: string; end?: string }
    sequence?: DashaEntry[]
  }
  yoga?: string[]
  yogas?: string[]
  houses?: House[]
  d9Houses?: DivHouse[]
  d10Houses?: DivHouse[]
  planetTable?: PlanetRow[]
  karakas?: Karakas
  /** Atmakaraka planet abbreviation from backend (e.g. "Su") */
  ak?: string
  /** Amatyakaraka planet abbreviation from backend (e.g. "Mo") */
  amk?: string
  wealthScore?: { total?: number; parashari?: number; bnn?: number }
  chartStrength?: number
  bnnTransits?: BNNTransit[]
  leadershipType?: string
}

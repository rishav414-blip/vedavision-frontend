// Assembles a partial ChartData from raw birth inputs using the local ephemeris.
// Covers: lagna, moonSign, sunSign, houses[], planetTable[], nakshatra.
// Dignity, yogas, dasha, karakas, and scoring are filled by later phases.

import { calcAllPlanets, calcLagna, wholeSignHouse } from '@/lib/ephemeris'
import { NAKSHATRA_DATA, NAKSHATRA_NAMES } from '@/lib/nakshatraData'
import { dateToJD, lahiriAyanamsa, moonTropicalLong } from '@/lib/panchang'
import { applyDignities } from '@/lib/dignity'
import type { ChartData, House, PlanetRow } from '@/lib/chartTypes'

// ── Timezone offset ───────────────────────────────────────────────────────────
// Returns UTC offset in hours from an IANA timezone ID for a given date.
// Uses Intl.DateTimeFormat offset trick — works in all modern browsers.
function tzOffsetHours(ianaZone: string, date: Date): number {
  try {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const locDate = new Date(date.toLocaleString('en-US', { timeZone: ianaZone }))
    return (locDate.getTime() - utcDate.getTime()) / 3600000
  } catch {
    return 5.5  // default IST
  }
}

// ── Birth date+time → UTC Date ─────────────────────────────────────────────
function birthDateUTC(dob: string, tob: string, tz: string): Date {
  const [y, m, d] = dob.split('-').map(Number)
  const [h, min]  = (tob || '00:00').split(':').map(Number)
  // Create a local time in the birth timezone, then convert to UTC
  const localMs = Date.UTC(y, m - 1, d, h, min)
  const offset  = tzOffsetHours(tz, new Date(localMs)) * 3600000
  return new Date(localMs - offset)
}

// ── Moon nakshatra + pada from sidereal longitude ─────────────────────────────
function calcNakshatra(moonSidLon: number) {
  const idx  = Math.floor(moonSidLon / (360 / 27)) % 27
  const pada = Math.floor((moonSidLon % (360 / 27)) / (360 / 108)) + 1
  const data = NAKSHATRA_DATA[idx]
  return {
    name:   data.name,
    pada,
    lord:   data.lord,
    theme:  data.qualities,
    deity:  data.deity,
    symbol: data.symbol,
  }
}

// ── Planet display helpers ────────────────────────────────────────────────────
const PLANET_GLYPHS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃',
  Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋',
}
const PLANET_SKT: Record<string, string> = {
  Sun:'Sūrya', Moon:'Chandra', Mars:'Maṅgala', Mercury:'Budha',
  Jupiter:'Guru', Venus:'Śukra', Saturn:'Śani', Rahu:'Rāhu', Ketu:'Ketu',
}
const PLANET_COLORS: Record<string, string> = {
  Sun:'#F5C842', Moon:'#D0D8F0', Mercury:'#7EC8A0', Venus:'#E48DB0',
  Mars:'#E05050', Jupiter:'#F0A830', Saturn:'#A08050', Rahu:'#8855CC', Ketu:'#CC8855',
}

// ── Main builder ──────────────────────────────────────────────────────────────

export interface BuildInput {
  name:   string
  dob:    string          // "YYYY-MM-DD"
  tob:    string          // "HH:MM" (local time in tz)
  pob:    string
  lat:    number
  lon:    number
  tz:     string          // IANA timezone id
  gender?: string
}

export function buildPartialChart(input: BuildInput): ChartData {
  const birthUTC = birthDateUTC(input.dob, input.tob, input.tz)
  const tzOff    = tzOffsetHours(input.tz, birthUTC)

  // ── 1. All planet positions ──────────────────────────────────────────────
  const planets = calcAllPlanets(birthUTC)
  const byName  = Object.fromEntries(planets.map(p => [p.planet, p]))

  // ── 2. Lagna ─────────────────────────────────────────────────────────────
  const lagna = calcLagna(birthUTC, input.lat, input.lon, tzOff)

  // ── 3. Houses (Whole Sign) ────────────────────────────────────────────────
  const SIGNS = [
    'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
    'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
  ]
  const houses: House[] = Array.from({ length: 12 }, (_, i) => {
    const houseNum  = i + 1
    const signIdx   = (lagna.signIndex + i) % 12
    return { id: houseNum, sign: SIGNS[signIdx], planets: [] }
  })
  // Assign planets to houses
  for (const p of planets) {
    const houseIdx = wholeSignHouse(p.signIndex, lagna.signIndex) - 1
    houses[houseIdx].planets.push(p.planet)
  }

  // ── 4. Planet table ───────────────────────────────────────────────────────
  const planetTable: PlanetRow[] = planets.map(p => ({
    planet:       p.planet,
    sign:         p.sign,
    house:        wholeSignHouse(p.signIndex, lagna.signIndex),
    dignity:      '',   // filled by Phase 5 (dignity.ts)
    notes:        '',
    degreeDecimal: p.degreeDecimal,
    degree:       `${Math.floor(p.degreeInSign)}°${Math.round((p.degreeInSign % 1) * 60)}'`,
    color:        PLANET_COLORS[p.planet] ?? '#D4B870',
    glyph:        PLANET_GLYPHS[p.planet] ?? '✦',
    skt:          PLANET_SKT[p.planet] ?? p.planet,
  }))

  // ── 4b. Apply dignities ───────────────────────────────────────────────────
  applyDignities(planetTable)

  // ── 5. Nakshatra (from Moon sidereal longitude) ───────────────────────────
  const moon = byName['Moon']
  const nakshatra = calcNakshatra(moon.siderealLon)

  // ── 6. moonSign / sunSign ─────────────────────────────────────────────────
  const moonSign = byName['Moon'].sign
  const sunSign  = byName['Sun'].sign

  return {
    native: {
      name:   input.name,
      dob:    input.dob,
      tob:    input.tob,
      pob:    input.pob,
      gender: input.gender,
    },
    lagna: {
      sign:   lagna.sign,
      signEn: lagna.sign,
      lord:   lagna.lord,
      degree: `${lagna.degree.toFixed(2)}°`,
    },
    moonSign,
    sunSign,
    nakshatra,
    houses,
    planetTable,
    // dasha, yoga, karakas, wealthScore filled by subsequent phases
  }
}

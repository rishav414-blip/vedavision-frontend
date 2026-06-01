// Vimśottarī Daśā calculator — 120-year cycle keyed to Moon's birth nakshatra.
// Produces exact ISO date start/end for all 9 mahādaśā periods + antardaśā.
// Reference: Brihat Parashara Hora Shastra, Ch.46.

import { NAKSHATRA_DATA } from '@/lib/nakshatraData'
import type { DashaEntry } from '@/lib/chartTypes'

// ── Vimśottarī sequence and period lengths (years) ───────────────────────────
const VIMSHOTTARI: Array<[string, number]> = [
  ['Ketu',    7],
  ['Venus',  20],
  ['Sun',     6],
  ['Moon',   10],
  ['Mars',    7],
  ['Rahu',   18],
  ['Jupiter',16],
  ['Saturn', 19],
  ['Mercury',17],
]
// Starting nakshatra index for each dasha lord (0-based within the 9-planet cycle)
const DASHA_START_NAK: Record<string, number> = {
  Ketu: 0, Venus: 3, Sun: 6, Moon: 9, Mars: 12,
  Rahu: 15, Jupiter: 18, Saturn: 21, Mercury: 24,
}

// ── Helper: add fractional years to a Date ───────────────────────────────────
function addYears(date: Date, years: number): Date {
  const ms = years * 365.25 * 24 * 3600 * 1000
  return new Date(date.getTime() + ms)
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// ── Elapsed fraction of the birth nakshatra's dasha at birth ────────────────
// moonSidLon: Moon's sidereal longitude in degrees at birth.
// Returns the remaining fraction (0–1) of the current dasha still to run.
function birthDashaRemainder(moonSidLon: number): { planet: string; fraction: number } {
  const nakIdx   = Math.floor(moonSidLon / (360 / 27)) % 27
  const nakLon   = moonSidLon % (360 / 27)  // degrees into the nakshatra (0–13.33°)
  const fraction = 1 - nakLon / (360 / 27)  // remaining fraction
  const planet   = NAKSHATRA_DATA[nakIdx].lord
  return { planet, fraction }
}

// ── Antardaśā periods within a mahādaśā ──────────────────────────────────────
// Returns all 9 antardaśā entries for a given mahādaśā planet, proportional
// to the Vimśottarī period lengths.
function calcAntardasha(
  mahaLord: string,
  mahaStart: Date,
  mahaEnd: Date
): Array<{ planet: string; start: string; end: string }> {
  const totalMs     = mahaEnd.getTime() - mahaStart.getTime()
  const totalYears  = VIMSHOTTARI.reduce((s, [,y]) => s + y, 0)  // 120

  // Antardaśā order starts from the mahā-lord's own sub-period
  const mahaIdx  = VIMSHOTTARI.findIndex(([p]) => p === mahaLord)
  const ordered  = [...VIMSHOTTARI.slice(mahaIdx), ...VIMSHOTTARI.slice(0, mahaIdx)]

  const result = []
  let cursor = mahaStart.getTime()
  for (const [antaLord, antaYears] of ordered) {
    const antaMs = (antaYears / totalYears) * totalMs
    const start  = new Date(cursor)
    const end    = new Date(cursor + antaMs)
    result.push({ planet: antaLord, start: isoDate(start), end: isoDate(end) })
    cursor += antaMs
  }
  return result
}

// ── Full dasha sequence ───────────────────────────────────────────────────────

export interface DashaResult {
  sequence:    DashaEntry[]
  current:     { planet: string; start: string; end: string }
  antardasha:  { planet: string; start: string; end: string }
}

export function calcDasha(moonSidLon: number, birthDate: Date): DashaResult {
  const { planet: firstPlanet, fraction } = birthDashaRemainder(moonSidLon)

  // Build ordered sequence starting from the birth nakshatra's lord
  const firstIdx = VIMSHOTTARI.findIndex(([p]) => p === firstPlanet)
  const ordered  = [...VIMSHOTTARI.slice(firstIdx), ...VIMSHOTTARI.slice(0, firstIdx)]

  const sequence: DashaEntry[] = []
  let cursor = birthDate

  // First period is truncated by the birth fraction
  const [p0, y0] = ordered[0]
  const firstYears = y0 * fraction
  const firstEnd   = addYears(cursor, firstYears)
  sequence.push({ planet: p0, years: y0, start: isoDate(cursor), end: isoDate(firstEnd) })
  cursor = firstEnd

  // Remaining 8 full periods
  for (const [p, y] of ordered.slice(1)) {
    const end = addYears(cursor, y)
    sequence.push({ planet: p, years: y, start: isoDate(cursor), end: isoDate(end) })
    cursor = end
  }

  // If the 9 periods don't span 120 years, append the cycle again (shouldn't happen
  // in practice, but ensures the timeline is always complete)
  // (Vimśottarī is exactly 120 yrs per cycle; the first period is partial so we may
  // need to append up to 2 more periods to cover ≥120 years from birth)
  let total = sequence.reduce((s, e) => {
    return s + (new Date(e.end).getTime() - new Date(e.start).getTime())
  }, 0)
  const target = 120 * 365.25 * 24 * 3600 * 1000
  let extIdx = 0
  while (total < target) {
    const [p, y] = VIMSHOTTARI[extIdx % 9]
    const end = addYears(cursor, y)
    sequence.push({ planet: p, years: y, start: isoDate(cursor), end: isoDate(end) })
    cursor = end
    total += y * 365.25 * 24 * 3600 * 1000
    extIdx++
  }

  // Find current period
  const now = new Date()
  const current = sequence.find(s => new Date(s.start) <= now && now < new Date(s.end))
             ?? sequence[0]

  // Find current antardaśā
  const antarAll = calcAntardasha(current.planet, new Date(current.start), new Date(current.end))
  const antardasha = antarAll.find(a => new Date(a.start) <= now && now < new Date(a.end))
                  ?? antarAll[0]

  return { sequence, current, antardasha }
}

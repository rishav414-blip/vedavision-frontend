// Rule-based Vimśottarī yoga detection from a built ChartData.
// Each detector returns the yoga name if the pattern fires, or null.
// Reference: Brihat Parashara Hora Shastra; Phaladeepika; skill.md §6.

import type { ChartData, PlanetRow } from '@/lib/chartTypes'

// ── Helpers ───────────────────────────────────────────────────────────────────

function byName(table: PlanetRow[], name: string): PlanetRow | undefined {
  return table.find(r => r.planet === name)
}

function house(table: PlanetRow[], name: string): number {
  return byName(table, name)?.house ?? 0
}

function sign(table: PlanetRow[], name: string): string {
  return byName(table, name)?.sign ?? ''
}

function dignity(table: PlanetRow[], name: string): string {
  return byName(table, name)?.dignity ?? ''
}

const KENDRA  = new Set([1, 4, 7, 10])
const TRIKONA = new Set([1, 5, 9])
const DUSTHANA = new Set([6, 8, 12])

function isKendra(h: number)  { return KENDRA.has(h) }
function isTrikona(h: number) { return TRIKONA.has(h) }
function isDusthana(h: number){ return DUSTHANA.has(h) }
function isStrong(d: string)  { return ['Exalted','Moolatrikona','Own Sign'].includes(d) }

// Are two planets in the same sign (conjunct)?
function conjunct(table: PlanetRow[], a: string, b: string): boolean {
  return sign(table, a) !== '' && sign(table, a) === sign(table, b)
}

// Is a planet aspecting a house? (Graha drishti: 7th aspect for all; Mars 4+8; Jupiter 5+9; Saturn 3+10)
function aspects(table: PlanetRow[], planet: string, targetHouse: number, lagnaSignIndex = 0): boolean {
  const h = house(table, planet)
  if (h === 0) return false
  const diff = ((targetHouse - h + 12) % 12) + 1  // 1–12
  if (diff === 7) return true
  if (planet === 'Mars'    && (diff === 4 || diff === 8))  return true
  if (planet === 'Jupiter' && (diff === 5 || diff === 9))  return true
  if (planet === 'Saturn'  && (diff === 3 || diff === 10)) return true
  return false
}

// ── Individual yoga detectors ─────────────────────────────────────────────────

type Detector = (t: PlanetRow[], lagnaLord: string) => string | null

const detectors: Detector[] = [

  // Gajakesari — Jupiter in kendra from Moon
  (t) => {
    const moonH = house(t, 'Moon')
    const jupH  = house(t, 'Jupiter')
    if (!moonH || !jupH) return null
    const rel = ((jupH - moonH + 12) % 12) + 1
    return [1, 4, 7, 10].includes(rel) ? 'Gajakesari' : null
  },

  // Hamsa — Jupiter in kendra + strong
  (t) => {
    const jupH = house(t, 'Jupiter')
    return isKendra(jupH) && isStrong(dignity(t, 'Jupiter')) ? 'Hamsa' : null
  },

  // Malavya — Venus in kendra + strong
  (t) => {
    const venH = house(t, 'Venus')
    return isKendra(venH) && isStrong(dignity(t, 'Venus')) ? 'Malavya' : null
  },

  // Ruchaka — Mars in kendra + strong
  (t) => {
    const marH = house(t, 'Mars')
    return isKendra(marH) && isStrong(dignity(t, 'Mars')) ? 'Ruchaka' : null
  },

  // Bhadra — Mercury in kendra + strong
  (t) => {
    const merH = house(t, 'Mercury')
    return isKendra(merH) && isStrong(dignity(t, 'Mercury')) ? 'Bhadra' : null
  },

  // Shasha — Saturn in kendra + strong
  (t) => {
    const satH = house(t, 'Saturn')
    return isKendra(satH) && isStrong(dignity(t, 'Saturn')) ? 'Shasha' : null
  },

  // Budhaditya — Sun + Mercury conjunct
  (t) => conjunct(t, 'Sun', 'Mercury') ? 'Budhaditya' : null,

  // Chandra Mangala — Moon + Mars conjunct
  (t) => conjunct(t, 'Moon', 'Mars') ? 'Chandra Mangala' : null,

  // Dharma Karma Adhipati — lords of 9th and 10th conjunct or mutual aspect
  // Approximated: Jupiter (natural dharma) + Saturn (karma) conjunct or mutual 7th
  (t) => {
    if (conjunct(t, 'Jupiter', 'Saturn')) return 'Dharma Karma Adhipati'
    const jupH = house(t, 'Jupiter')
    const satH = house(t, 'Saturn')
    if (jupH && satH && Math.abs(jupH - satH) % 6 === 0) return 'Dharma Karma Adhipati'
    return null
  },

  // Amala — 10th from Moon occupied by benefic (Mercury, Venus, Jupiter)
  (t) => {
    const moonH = house(t, 'Moon')
    if (!moonH) return null
    const tenth = ((moonH + 8) % 12) + 1
    for (const ben of ['Mercury', 'Venus', 'Jupiter']) {
      if (house(t, ben) === tenth) return 'Amala'
    }
    return null
  },

  // Sunapha — planet (not Sun) in 2nd from Moon
  (t) => {
    const moonH = house(t, 'Moon')
    if (!moonH) return null
    const second = (moonH % 12) + 1
    for (const p of ['Mars','Mercury','Jupiter','Venus','Saturn']) {
      if (house(t, p) === second) return 'Sunapha'
    }
    return null
  },

  // Anapha — planet (not Sun) in 12th from Moon
  (t) => {
    const moonH = house(t, 'Moon')
    if (!moonH) return null
    const twelfth = ((moonH + 10) % 12) + 1
    for (const p of ['Mars','Mercury','Jupiter','Venus','Saturn']) {
      if (house(t, p) === twelfth) return 'Anapha'
    }
    return null
  },

  // Durudhura — planets in both 2nd and 12th from Moon
  (t) => {
    const moonH = house(t, 'Moon')
    if (!moonH) return null
    const second   = (moonH % 12) + 1
    const twelfth  = ((moonH + 10) % 12) + 1
    const planets  = ['Mars','Mercury','Jupiter','Venus','Saturn']
    const has2nd   = planets.some(p => house(t, p) === second)
    const has12th  = planets.some(p => house(t, p) === twelfth)
    return has2nd && has12th ? 'Durudhura' : null
  },

  // Kemadruma — no planet in 2nd or 12th from Moon (and Moon not conjunct planet)
  (t) => {
    const moonH = house(t, 'Moon')
    if (!moonH) return null
    const second  = (moonH % 12) + 1
    const twelfth = ((moonH + 10) % 12) + 1
    const planets = ['Sun','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
    const anyNear = planets.some(p => {
      const h = house(t, p)
      return h === moonH || h === second || h === twelfth
    })
    return anyNear ? null : 'Kemadruma'
  },

  // Vesi — planet (not Moon) in 2nd from Sun
  (t) => {
    const sunH = house(t, 'Sun')
    if (!sunH) return null
    const second = (sunH % 12) + 1
    for (const p of ['Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']) {
      if (house(t, p) === second) return 'Vesi'
    }
    return null
  },

  // Vasi — planet (not Moon) in 12th from Sun
  (t) => {
    const sunH = house(t, 'Sun')
    if (!sunH) return null
    const twelfth = ((sunH + 10) % 12) + 1
    for (const p of ['Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']) {
      if (house(t, p) === twelfth) return 'Vasi'
    }
    return null
  },

  // Ubhayachari — planets in both 2nd and 12th from Sun
  (t) => {
    const sunH = house(t, 'Sun')
    if (!sunH) return null
    const second  = (sunH % 12) + 1
    const twelfth = ((sunH + 10) % 12) + 1
    const planets = ['Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']
    const has2nd  = planets.some(p => house(t, p) === second)
    const has12th = planets.some(p => house(t, p) === twelfth)
    return has2nd && has12th ? 'Ubhayachari' : null
  },

  // Raja Yoga — lagna lord in kendra or trikona
  (_t, lagnaLord) => {
    if (!lagnaLord) return null
    const h = house(_t, lagnaLord)
    return (isKendra(h) || isTrikona(h)) ? 'Raja Yoga' : null
  },

  // Dhana Yoga — 2nd or 11th lord in kendra/trikona
  (t) => {
    // Approximate: Venus (natural 2nd significator) strong and in kendra
    const venH = house(t, 'Venus')
    if (isKendra(venH) && isStrong(dignity(t, 'Venus'))) return 'Dhana Yoga'
    return null
  },

  // Parivartana — two planets in each other's sign
  (t) => {
    const OWNED: Record<string, string[]> = {
      Sun:     ['Leo'],
      Moon:    ['Cancer'],
      Mars:    ['Aries', 'Scorpio'],
      Mercury: ['Gemini', 'Virgo'],
      Jupiter: ['Sagittarius', 'Pisces'],
      Venus:   ['Taurus', 'Libra'],
      Saturn:  ['Capricorn', 'Aquarius'],
    }
    const planets = Object.keys(OWNED)
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const a = planets[i], b = planets[j]
        const signA = sign(t, a), signB = sign(t, b)
        if (OWNED[b].includes(signA) && OWNED[a].includes(signB)) return 'Parivartana'
      }
    }
    return null
  },

  // Viparita Raja Yoga — dusthana lords in dusthana houses
  (t) => {
    const dusthanaLords = ['Mars', 'Saturn', 'Jupiter', 'Mercury', 'Venus', 'Sun']
    let count = 0
    for (const p of dusthanaLords) {
      if (isDusthana(house(t, p))) count++
    }
    return count >= 2 ? 'Viparita Raja Yoga' : null
  },
]

// ── Public API ────────────────────────────────────────────────────────────────

export function detectYogas(chart: ChartData): string[] {
  const table = chart.planetTable
  if (!table || table.length === 0) return []
  const lagnaLord = chart.lagna?.lord ?? ''
  const results: string[] = []
  for (const detect of detectors) {
    const name = detect(table, lagnaLord)
    if (name && !results.includes(name)) results.push(name)
  }
  return results
}

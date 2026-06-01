// Jaimini Chara Karaka computation — highest degree within sign = Atmakaraka,
// descending order for the remaining 6 karakas.
// Reference: Jaimini Sutras, Adhyaya 1, Pada 1.

import type { ChartData, Karaka, Karakas } from '@/lib/chartTypes'

const KARAKA_PLANET_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
const KARAKA_KEY_ORDER: (keyof Karakas)[] = [
  'atmakaraka','amatyakaraka','bhratrukaraka','matrukaraka','putrakaraka','gnatikaraka','darakaraka',
]

export function computeKarakas(chart: ChartData | null): Record<keyof Karakas, Karaka> {
  const fallback = (): Record<keyof Karakas, Karaka> => {
    const akPlanet    = chart?.ak  ?? undefined
    const amkPlanet   = chart?.amk ?? undefined
    const dashaPlanet = chart?.dasha?.current?.planet ?? 'Saturn'
    const antaPlanet  = chart?.dasha?.antardasha?.planet ?? 'Jupiter'
    const filled = [akPlanet, amkPlanet, dashaPlanet, antaPlanet, 'Venus', 'Mercury', 'Mars']
      .filter(Boolean) as string[]
    const seen = new Set<string>()
    const deduped: string[] = []
    for (const p of filled) { if (!seen.has(p)) { seen.add(p); deduped.push(p) } }
    while (deduped.length < 7) deduped.push(KARAKA_PLANET_ORDER[deduped.length] ?? 'Ketu')
    return Object.fromEntries(
      KARAKA_KEY_ORDER.map((k, i) => [k, { planet_name: deduped[i] }])
    ) as Record<keyof Karakas, Karaka>
  }

  if (!chart?.planetTable?.length) return fallback()

  const planets = chart.planetTable
    .filter(r => KARAKA_PLANET_ORDER.includes(r.planet))
    .map(r => {
      let deg: number
      if (typeof r.degreeDecimal === 'number') {
        deg = r.degreeDecimal % 30  // degree within sign
      } else {
        const degMatch = typeof r.degree === 'string' ? r.degree.match(/(\d+)[°](\d+)?/) : null
        deg = degMatch
          ? parseInt(degMatch[1]) + (degMatch[2] ? parseInt(degMatch[2]) / 60 : 0)
          : 15
      }
      return { planet: r.planet, sign: r.sign, degree: deg }
    })
    .sort((a, b) => b.degree - a.degree)

  if (planets.length < 7) return fallback()

  return Object.fromEntries(
    KARAKA_KEY_ORDER.map((k, i) => [k, { planet_name: planets[i].planet, sign: planets[i].sign }])
  ) as Record<keyof Karakas, Karaka>
}

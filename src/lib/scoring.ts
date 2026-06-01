// Local wealthScore and chartStrength calculators.
// Reference: skill.md §9–10; BPHS Ch.24 (Dhana Yogas), Parashari strength rules.

import type { ChartData, PlanetRow } from '@/lib/chartTypes'

// ── Helpers ───────────────────────────────────────────────────────────────────

const KENDRA  = new Set([1, 4, 7, 10])
const TRIKONA = new Set([1, 5, 9])
const DUSTHANA = new Set([6, 8, 12])

function houseOf(table: PlanetRow[], planet: string): number {
  return table.find(r => r.planet === planet)?.house ?? 0
}

function dignityOf(table: PlanetRow[], planet: string): string {
  return table.find(r => r.planet === planet)?.dignity ?? ''
}

function isStrong(d: string): boolean {
  return ['Exalted', 'Moolatrikona', 'Own Sign'].includes(d)
}

// ── Parashari wealth score (0–100) ───────────────────────────────────────────
// Based on strength of 2nd (Dhana), 10th (Karma), 11th (Labha) houses
// and natural wealth planets (Jupiter, Venus, Mercury).

export function calcParashariWealth(chart: ChartData): number {
  const table = chart.planetTable ?? []
  if (table.length === 0) return 50

  let score = 40  // baseline

  // Wealth planets in kendra or trikona
  for (const p of ['Jupiter', 'Venus', 'Mercury']) {
    const h = houseOf(table, p)
    const d = dignityOf(table, p)
    if (KENDRA.has(h) || TRIKONA.has(h)) score += 8
    if (isStrong(d)) score += 7
  }

  // 2nd lord placement
  const lagnaLord = chart.lagna?.lord ?? ''
  if (lagnaLord) {
    const h = houseOf(table, lagnaLord)
    if (KENDRA.has(h) || TRIKONA.has(h)) score += 5
    if (isStrong(dignityOf(table, lagnaLord))) score += 5
  }

  // 11th house (income/gains) — Jupiter and Venus there are highly auspicious
  const jupH = houseOf(table, 'Jupiter')
  const venH = houseOf(table, 'Venus')
  if (jupH === 11) score += 6
  if (venH === 11 || venH === 2) score += 6

  // Penalty: malefics (Mars, Saturn, Rahu, Ketu) in 2nd or 11th
  for (const p of ['Mars', 'Saturn', 'Rahu', 'Ketu']) {
    const h = houseOf(table, p)
    if (h === 2 || h === 11) score -= 5
    if (DUSTHANA.has(h) && isStrong(dignityOf(table, p))) score -= 3
  }

  // Yogas bonus
  const yogas = chart.yoga ?? chart.yogas ?? []
  if (yogas.includes('Hamsa'))        score += 6
  if (yogas.includes('Malavya'))      score += 6
  if (yogas.includes('Gajakesari'))   score += 8
  if (yogas.includes('Dhana Yoga'))   score += 10
  if (yogas.includes('Raja Yoga'))    score += 5
  if (yogas.includes('Kemadruma'))    score -= 8

  return Math.min(100, Math.max(0, Math.round(score)))
}

// ── BNN wealth score (0–100) ──────────────────────────────────────────────────
// BNN = Birth Nakshatra Node — measures alignment of Moon nakshatra lord
// with the artha (wealth) axis: houses 2, 6, 10.

export function calcBNNWealth(chart: ChartData): number {
  const table = chart.planetTable ?? []
  if (table.length === 0) return 50

  const nakLord = chart.nakshatra?.lord ?? ''
  let score = 45

  if (nakLord) {
    const h = houseOf(table, nakLord)
    if (h === 2 || h === 11)  score += 20
    if (h === 10)             score += 15
    if (h === 1 || h === 5 || h === 9) score += 10
    if (DUSTHANA.has(h))     score -= 15
    if (isStrong(dignityOf(table, nakLord))) score += 10
  }

  // Moon strength
  const moonH = houseOf(table, 'Moon')
  const moonD = dignityOf(table, 'Moon')
  if (TRIKONA.has(moonH))   score += 8
  if (isStrong(moonD))      score += 8
  if (DUSTHANA.has(moonH))  score -= 10

  return Math.min(100, Math.max(0, Math.round(score)))
}

// ── Chart strength (0–100) ───────────────────────────────────────────────────
// Counts planets in good positions; penalises combust/dusthana clusters.

export function calcChartStrength(chart: ChartData): number {
  const table = chart.planetTable ?? []
  if (table.length === 0) return 50

  let score = 40

  for (const row of table) {
    if (['Rahu', 'Ketu'].includes(row.planet)) continue
    if (isStrong(row.dignity)) score += 5
    if (row.dignity === 'Debilitated') score -= 4
    if (KENDRA.has(row.house) || TRIKONA.has(row.house)) score += 3
    if (DUSTHANA.has(row.house)) score -= 2
  }

  // Yoga bonuses
  const yogas = chart.yoga ?? chart.yogas ?? []
  score += Math.min(yogas.length * 3, 20)

  return Math.min(100, Math.max(0, Math.round(score)))
}

// ── Combined scorer ───────────────────────────────────────────────────────────

export interface ScoringResult {
  wealthScore:    { total: number; parashari: number; bnn: number }
  chartStrength:  number
}

export function calcScores(chart: ChartData): ScoringResult {
  const parashari = calcParashariWealth(chart)
  const bnn       = calcBNNWealth(chart)
  const total     = Math.round((parashari * 0.6) + (bnn * 0.4))
  return {
    wealthScore:   { total, parashari, bnn },
    chartStrength: calcChartStrength(chart),
  }
}

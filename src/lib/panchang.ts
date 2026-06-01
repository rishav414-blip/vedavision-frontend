// Vedic Panchang engine — Jean Meeus ELP2000 simplified (accuracy ~1°).
// Shared by GreenDaysTab (calendar) and OverviewTab (daily signal).

import { NAKSHATRA_NAMES, FAVORABLE_NAKSHATRAS, INAUSPICIOUS_NAKSHATRAS } from '@/lib/nakshatraData'
export { FAVORABLE_NAKSHATRAS, INAUSPICIOUS_NAKSHATRAS } from '@/lib/nakshatraData'

// ── Trig helpers ──────────────────────────────────────────────────────────────
export function sind(deg: number): number { return Math.sin(deg * Math.PI / 180) }
export function cosd(deg: number): number { return Math.cos(deg * Math.PI / 180) }

// ── Julian Day ────────────────────────────────────────────────────────────────
export function dateToJD(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate() + 0.5   // noon UT
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5
}

// ── Lahiri ayanamsa (degrees) — linear from IAU 1956 reference ─────────────
export function lahiriAyanamsa(T: number): number {
  // T = Julian centuries from J2000; value ≈ 23.15° for 2025, grows ~50.3"/yr
  return 23.85117 + T * 1.39720 + T * T * 0.000139
}

// ── Moon tropical longitude (Meeus Ch.25, 10-term perturbation series) ──────
export function moonTropicalLong(T: number): number {
  const L0 = (218.3164477 + 481267.88123421 * T)
  const M_  = (134.9633964 + 477198.8675055  * T)
  const M   = (357.5291092 +  35999.0502909  * T)
  const D   = (297.8501921 + 445267.1114034  * T)
  const F   = ( 93.2720950 + 483202.0175233  * T)
  const dL  = 6.288774  * sind(M_)
            + 1.274027  * sind(2*D - M_)
            + 0.658314  * sind(2*D)
            + 0.213618  * sind(2*M_)
            - 0.185116  * sind(M)
            - 0.114332  * sind(2*F)
            + 0.058793  * sind(2*D - 2*M_)
            + 0.057066  * sind(2*D + M_ - M)
            + 0.053322  * sind(2*D + M_)
            + 0.045758  * sind(2*D - M)
  return ((L0 + dL) % 360 + 360) % 360
}

// ── Sun tropical longitude (3-term approximation) ────────────────────────────
export function sunTropicalLong(T: number): number {
  const L0 = (280.46646 + 36000.76983 * T)
  const M   = (357.52911 + 35999.05029 * T)
  const C   = (1.914602 - 0.004817 * T) * sind(M)
            + (0.019993 - 0.000101 * T) * sind(2 * M)
            +  0.000289  * sind(3 * M)
  return ((L0 + C) % 360 + 360) % 360
}

// ── Moon sidereal longitude (tropical − Lahiri ayanamsa) ─────────────────────
export function moonSiderealLong(date: Date): number {
  const T = (dateToJD(date) - 2451545.0) / 36525
  return ((moonTropicalLong(T) - lahiriAyanamsa(T)) % 360 + 360) % 360
}

// ── Nakshatra from Moon sidereal longitude ───────────────────────────────────
export function getNakshatra(date: Date): string {
  const lon = moonSiderealLong(date)
  const idx = Math.floor(lon / (360 / 27))
  return NAKSHATRA_NAMES[idx % 27]
}

// ── Tithi (lunar day 1–30) ────────────────────────────────────────────────────
export function getTithi(date: Date): number {
  const T      = (dateToJD(date) - 2451545.0) / 36525
  const aya    = lahiriAyanamsa(T)
  const moonSid = ((moonTropicalLong(T) - aya) % 360 + 360) % 360
  const sunSid  = ((sunTropicalLong(T)  - aya) % 360 + 360) % 360
  const diff    = ((moonSid - sunSid) % 360 + 360) % 360
  return Math.floor(diff / 12) + 1  // 1–30
}

// ── Tithi quality lists ───────────────────────────────────────────────────────
export const INAUSPICIOUS_TITHIS = [4, 8, 12, 14, 30]
export const AUSPICIOUS_TITHIS   = [2, 3, 5, 7, 10, 11, 13]

// Vimśottarī planet ordering (used for dasha bonus index)
export const PLANET_ORDER = ['Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus']

// ── Vedic Panchang-weighted day score (10–95) ─────────────────────────────────
export function dayScore(date: Date, dashaPlanet: string): number {
  const nakshatra = getNakshatra(date)
  const tithi     = getTithi(date)
  const dow       = date.getDay()

  let score = 50

  if (FAVORABLE_NAKSHATRAS.includes(nakshatra))    score += 20
  if (INAUSPICIOUS_NAKSHATRAS.includes(nakshatra)) score -= 20

  if (AUSPICIOUS_TITHIS.includes(tithi))   score += 15
  if (INAUSPICIOUS_TITHIS.includes(tithi)) score -= 15

  if ([3, 4, 5].includes(dow)) score += 10
  if ([0, 6].includes(dow))    score -= 5

  const dashaIdx = PLANET_ORDER.indexOf(dashaPlanet)
  const dashaBonus = [5, 10, -5, 15, 8, -10, 12, 3, -8, 6][(dashaIdx === -1 ? 3 : dashaIdx) % 10]
  score += dashaBonus

  return Math.max(10, Math.min(95, score))
}

// ── Label + colour helpers (shared UI) ───────────────────────────────────────
export function dayLabel(score: number, lang = 'en'): string {
  if (score >= 70) return lang === 'hi' ? 'शुभ दिन'      : 'Green Day'
  if (score >= 40) return lang === 'hi' ? 'सामान्य दिन'  : 'Neutral Day'
  return                  lang === 'hi' ? 'सावधानी'       : 'Caution Day'
}

export function dayColor(score: number): string {
  if (score >= 70) return '#6EC97A'
  if (score >= 40) return '#F0A830'
  return '#E05050'
}

export function dayBorder(score: number): string {
  if (score >= 70) return 'rgba(110,201,122,0.3)'
  if (score >= 40) return 'rgba(240,168,48,0.3)'
  return 'rgba(224,80,80,0.3)'
}

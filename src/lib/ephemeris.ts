// Pure-TypeScript planetary ephemeris — Meeus "Astronomical Algorithms" 2nd ed.
// Accuracy: ~0.5–2° for dates within ±100 years of J2000 (2000-01-01.5 TT).
// Sufficient for Vedic sign-level placement and nakshatra determination.
// No WASM, no network call, no licensing constraints.

import { dateToJD, lahiriAyanamsa, sunTropicalLong } from '@/lib/panchang'

// ── Constants ────────────────────────────────────────────────────────────────
const DEG = Math.PI / 180
function sind(d: number) { return Math.sin(d * DEG) }
function cosd(d: number) { return Math.cos(d * DEG) }
function atand2(y: number, x: number) { return Math.atan2(y, x) / DEG }
function norm360(d: number) { return ((d % 360) + 360) % 360 }

// Julian centuries from J2000.0
function T(jd: number) { return (jd - 2451545.0) / 36525 }

// ── Orbital elements (Meeus Table 31.a / Ch.31) ───────────────────────────────
// [L0°, L1°/century, M0°, M1°/century, e, a AU]
const ORB: Record<string, [number,number,number,number,number,number]> = {
  Mercury: [252.250906, 149472.6746358, 174.7947870, 149472.5157480, 0.20563175, 0.387098],
  Venus:   [181.979801,  58517.8156760,  50.4161393,  58517.8034240, 0.00677188, 0.723330],
  // Earth used internally for geocentric conversion
  Earth:   [100.464457,  36000.7698278, 357.5291092,  35999.0502909, 0.01670862, 1.000000],
  Mars:    [355.433275,  19140.2993313,  19.3730010,  19140.2993313, 0.09341233, 1.523688],
  Jupiter: [ 34.351519,   3034.9056606,  20.9120720,   3034.9056606, 0.04849485, 5.202561],
  Saturn:  [ 50.077444,   1222.1138488, 317.9273690,   1222.1138488, 0.05554814, 9.537070],
}

// Equation of center (first 3 terms) for a given mean anomaly and eccentricity
function equationOfCenter(M: number, e: number): number {
  return (2*e - e*e*e/4) * sind(M)
       + (5/4) * e*e * sind(2*M)
       + (13/12) * e*e*e * sind(3*M)
}

// Heliocentric ecliptic longitude + distance (AU) for a planet at time T
function heliocentricLD(planet: string, t: number): [number, number] {
  const [L0, L1, M0, M1, e, a] = ORB[planet]
  const L = norm360(L0 + L1 * t)
  const M = norm360(M0 + M1 * t)
  const C = equationOfCenter(M, e) * (180 / Math.PI)  // radians → degrees
  const v = norm360(M + C)      // true anomaly
  const lon = norm360(L + C)    // true heliocentric longitude
  const r = a * (1 - e * e) / (1 + e * cosd(v))  // true distance
  return [lon, r]
}

// Geocentric ecliptic longitude from heliocentric planet + Earth positions
function helioCentricToGeocentric(
  lonP: number, rP: number,
  lonE: number, rE: number
): number {
  // Project to 2D ecliptic plane (inclination ignored — adds <1° for inner planets)
  const Px = rP * cosd(lonP) - rE * cosd(lonE)
  const Py = rP * sind(lonP) - rE * sind(lonE)
  return norm360(atand2(Py, Px))
}

// ── Moon's ascending node (Rahu) — Meeus Ch.47 ───────────────────────────────
function moonNode(t: number): number {
  return norm360(125.04452 - 1934.136261*t + 0.0020708*t*t + t*t*t/450000)
}

// ── Jupiter/Saturn mutual perturbation corrections (Meeus Ch.36) ─────────────
// These are the dominant long-period terms (~0.6° max); improve accuracy significantly.
function jupiterCorrection(t: number, Mj: number, Ms: number): number {
  return  0.332  * sind(2*Mj - 5*Ms - 67.6)
        + 0.056  * sind(2*Mj - 2*Ms + 21.0)
        + 0.042  * sind(3*Mj - 5*Ms + 20.9)
        - 0.036  * sind(Mj - 2*Ms)
        + 0.022  * cosd(Mj - Ms)
        + 0.023  * sind(2*Mj - 3*Ms + 52.7)
        - 0.016  * sind(Mj - 5*Ms - 69.0)
}
function saturnCorrection(t: number, Mj: number, Ms: number): number {
  return  0.812  * sind(2*Mj - 5*Ms - 67.6)
        - 0.229  * cosd(2*Mj - 4*Ms - 2.0)
        + 0.119  * sind(Mj - 2*Ms - 3.0)
        + 0.046  * sind(2*Mj - 6*Ms - 69.0)
        + 0.014  * sind(Mj - Ms + 38.0)
}

// ── Main entry point ─────────────────────────────────────────────────────────

export interface PlanetPosition {
  planet:         string
  tropicalLon:    number   // geocentric tropical ecliptic longitude (degrees)
  siderealLon:    number   // geocentric sidereal longitude (Lahiri)
  sign:           string   // Vedic rāśi name
  signIndex:      number   // 0=Aries … 11=Pisces
  degreeInSign:   number   // 0–30° within the sign
  degreeDecimal:  number   // full sidereal longitude (same as siderealLon)
}

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
]

export function calcAllPlanets(date: Date): PlanetPosition[] {
  const jd = dateToJD(date)
  const t  = T(jd)
  const aya = lahiriAyanamsa(t)

  // Earth's heliocentric position (from Sun's geocentric + 180°)
  const sunTrop = sunTropicalLong(t)
  const earthLon = norm360(sunTrop + 180)
  const [_, rE] = heliocentricLD('Earth', t)

  // Jupiter & Saturn mean anomalies for mutual perturbation correction
  const Mj = norm360(ORB.Jupiter[2] + ORB.Jupiter[3] * t)
  const Ms = norm360(ORB.Saturn[2]  + ORB.Saturn[3]  * t)

  const raw: Array<[string, number]> = []  // [planet, tropicalLon]

  // Sun — from panchang (most accurate)
  raw.push(['Sun', sunTrop])

  // Moon — from panchang (already in panchang.ts via moonTropicalLong)
  // We compute it here by importing the function
  const moonT = moonTropicalLong_local(t)
  raw.push(['Moon', moonT])

  // Inner planets (Mercury, Venus) — full helio→geo conversion
  for (const p of ['Mercury', 'Venus']) {
    const [lonP, rP] = heliocentricLD(p, t)
    const geo = helioCentricToGeocentric(lonP, rP, earthLon, rE)
    raw.push([p, geo])
  }

  // Outer planets (Mars, Jupiter, Saturn) — helio→geo + perturbation
  {
    const [lonMars, rMars] = heliocentricLD('Mars', t)
    raw.push(['Mars', helioCentricToGeocentric(lonMars, rMars, earthLon, rE)])
  }
  {
    const [lonJup, rJup] = heliocentricLD('Jupiter', t)
    const geoJup = helioCentricToGeocentric(lonJup, rJup, earthLon, rE)
    raw.push(['Jupiter', norm360(geoJup + jupiterCorrection(t, Mj, Ms))])
  }
  {
    const [lonSat, rSat] = heliocentricLD('Saturn', t)
    const geoSat = helioCentricToGeocentric(lonSat, rSat, earthLon, rE)
    raw.push(['Saturn', norm360(geoSat + saturnCorrection(t, Mj, Ms))])
  }

  // Rahu (Moon's ascending node) — already geocentric ecliptic
  const rahuTrop = moonNode(t)
  raw.push(['Rahu', rahuTrop])
  raw.push(['Ketu', norm360(rahuTrop + 180)])

  // Convert to sidereal and build output
  return raw.map(([planet, tropLon]) => {
    const sidLon    = norm360(tropLon - aya)
    const signIndex = Math.floor(sidLon / 30)
    return {
      planet,
      tropicalLon:   tropLon,
      siderealLon:   sidLon,
      sign:          SIGNS[signIndex],
      signIndex,
      degreeInSign:  sidLon - signIndex * 30,
      degreeDecimal: sidLon,
    }
  })
}

// Local Moon tropical longitude (mirrors panchang.ts to avoid circular import).
// SYNC: if panchang.ts:moonTropicalLong changes, update this function too.
function moonTropicalLong_local(t: number): number {
  const L0 = (218.3164477 + 481267.88123421 * t)
  const M_  = (134.9633964 + 477198.8675055  * t)
  const M   = (357.5291092 +  35999.0502909  * t)
  const D   = (297.8501921 + 445267.1114034  * t)
  const F   = ( 93.2720950 + 483202.0175233  * t)
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
  return norm360(L0 + dL)
}

// ── Ascendant (Lagna) — Whole Sign (Vedic standard) ─────────────────────────
// Given sidereal longitude of lagna cusp, return sign index 0-11.
export function calcLagna(date: Date, lat: number, lon: number, tzOffsetHours: number): {
  sign: string; signIndex: number; degree: number; lord: string
} {
  const jd = dateToJD(date)
  const t  = T(jd)
  const aya = lahiriAyanamsa(t)

  // Sidereal Time at Greenwich (degrees) — Meeus Ch.12
  const theta0 = norm360(280.46061837 + 360.98564736629*(jd - 2451545.0)
                         + 0.000387933*t*t - t*t*t/38710000)
  // Local Sidereal Time (degrees)
  const LST = norm360(theta0 + lon)
  // RAMC = LST in degrees (Right Ascension of the Midheaven Culminating)
  const RAMC = LST

  // Obliquity of ecliptic (Meeus Ch.22)
  const eps = 23.439291111 - 0.013004167*t - 0.000000164*t*t + 0.000000504*t*t*t

  // Tropical ascendant degree from RAMC + latitude + obliquity (Placidus formula simplified)
  // For Vedic purposes we use Equal/Whole Sign from the tropical ascendant converted to sidereal
  let tropAsc = norm360(atand2(-cosd(RAMC), sind(RAMC)*cosd(eps) + Math.tan(lat*DEG)*sind(eps)))

  // Quadrant correction: ascendant is in the eastern hemisphere
  // (RAMC is in [0,360); ascendant rises in the east)
  if (sind(RAMC) < 0) tropAsc = norm360(tropAsc + 180)

  const sidAsc = norm360(tropAsc - aya)
  const signIndex = Math.floor(sidAsc / 30)

  const LORDS: Record<string, string> = {
    Aries:'Mars', Taurus:'Venus', Gemini:'Mercury', Cancer:'Moon', Leo:'Sun',
    Virgo:'Mercury', Libra:'Venus', Scorpio:'Mars', Sagittarius:'Jupiter',
    Capricorn:'Saturn', Aquarius:'Saturn', Pisces:'Jupiter',
  }
  const sign = SIGNS[signIndex]
  return { sign, signIndex, degree: sidAsc - signIndex * 30, lord: LORDS[sign] }
}

// ── House assignment (Whole Sign system — standard Vedic) ───────────────────
// Returns house number (1-12) for a planet given lagna sign index.
export function wholeSignHouse(planetSignIndex: number, lagnaSignIndex: number): number {
  return ((planetSignIndex - lagnaSignIndex + 12) % 12) + 1
}

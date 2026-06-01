// Geocoding helpers — no API key required.
// Nominatim (OSM) for lat/lon, WorldTimeAPI for IANA timezone from coordinates.

export interface GeoResult {
  lat: number
  lon: number
  tz:  string   // IANA timezone id, e.g. "Asia/Kolkata"
  displayName: string
}

// Rate-limit: Nominatim asks for ≤1 req/s. We add a User-Agent header as required.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const WORLDTIME = 'https://worldtimeapi.org/api/timezone'
const UA = 'VedaVision/1.0 (vedavision-app.pages.dev)'

export async function geocodePob(pob: string): Promise<GeoResult> {
  // ── Step 1: lat/lon from Nominatim ────────────────────────────────────────
  const params = new URLSearchParams({ q: pob, format: 'json', limit: '1' })
  const geoRes = await fetch(`${NOMINATIM}?${params}`, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en' },
  })
  if (!geoRes.ok) throw new Error(`Geocoding failed (${geoRes.status})`)
  const geoData = await geoRes.json()
  if (!geoData.length) throw new Error(`Place not found: "${pob}"`)

  const lat = parseFloat(geoData[0].lat)
  const lon = parseFloat(geoData[0].lon)
  const displayName: string = geoData[0].display_name

  // ── Step 2: IANA timezone from WorldTimeAPI (lat/lon rounding to 2dp) ────
  // WorldTimeAPI doesn't take coordinates directly; use fallback heuristic first,
  // then try the coordinate-based endpoint via the "ip" proxy or offset approach.
  // Best free approach: use the Nominatim countryCode + offset to pick a known TZ,
  // or call worldtimeapi.org with the closest city name.
  // Simplest reliable method: derive UTC offset from longitude and refine with
  // a free timezone-by-coordinate API (timezonedb style but free).
  // We use: https://worldtimeapi.org/api/ip — no, that's user-IP based.
  // Instead: https://timeapi.io/api/TimeZone/coordinate (free, no key).
  let tz = longitudeToTz(lon)  // fast fallback
  try {
    const tzRes = await fetch(
      `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`,
      { headers: { 'Accept': 'application/json' } }
    )
    if (tzRes.ok) {
      const tzData = await tzRes.json()
      if (tzData.timeZone) tz = tzData.timeZone
    }
  } catch {
    // keep longitudeToTz fallback
  }

  return { lat, lon, tz, displayName }
}

// Fast fallback: estimate IANA TZ from longitude + known regional offsets.
// Covers the most common birth places; accurate enough if timeapi.io is down.
function longitudeToTz(lon: number): string {
  // India: UTC+5:30 covers lon 68–97
  if (lon >= 68 && lon <= 97)  return 'Asia/Kolkata'
  if (lon >= 44 && lon <= 63)  return 'Asia/Karachi'
  if (lon >= 97 && lon <= 106) return 'Asia/Dhaka'
  if (lon >= 106 && lon <= 141) return 'Asia/Singapore'
  if (lon >= 120 && lon <= 145) return 'Asia/Tokyo'
  if (lon >= -10 && lon <= 2)   return 'Europe/London'
  if (lon >= 2  && lon <= 15)   return 'Europe/Paris'
  if (lon >= 15 && lon <= 30)   return 'Europe/Berlin'
  if (lon >= 30 && lon <= 44)   return 'Europe/Moscow'
  if (lon >= -80 && lon <= -60) return 'America/New_York'
  if (lon >= -110 && lon <= -80) return 'America/Chicago'
  if (lon >= -125 && lon <= -110) return 'America/Los_Angeles'
  // default: derive offset from 15°/hr rule
  const offsetHr = Math.round(lon / 15)
  const sign = offsetHr >= 0 ? '+' : '-'
  const abs  = Math.abs(offsetHr)
  return `Etc/GMT${sign}${abs}`
}

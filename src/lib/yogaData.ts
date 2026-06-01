// Canonical yoga registry — single source of truth for descriptions and dasha-activation planets.
// Framed as patterns for reflection, not promises of outcome (product policy §3 of CLAUDE.md).

export interface YogaInfo {
  name:        string
  planets:     string[]   // dasha planets most relevant to activation; used by getYogaActivationPeriod
  description: string     // one-line reflective framing shown in UI and PDF
}

export const YOGA_DATA: YogaInfo[] = [
  // ── Pancha Mahapurusha (five great-person yogas) ─────────────────────────────
  {
    name: 'Hamsa',
    planets: ['Jupiter'],
    description: 'Jupiter in own/exaltation in a kendra; a calling toward nobility, dharma, and teaching.',
  },
  {
    name: 'Malavya',
    planets: ['Venus'],
    description: 'Venus in own/exaltation in a kendra; aesthetic refinement, comfort, and relational grace.',
  },
  {
    name: 'Ruchaka',
    planets: ['Mars'],
    description: 'Mars in own/exaltation in a kendra; courage, physical vitality, and drive to lead.',
  },
  {
    name: 'Bhadra',
    planets: ['Mercury'],
    description: 'Mercury in own/exaltation in a kendra; analytical brilliance, discernment, and trade.',
  },
  {
    name: 'Shasha',
    planets: ['Saturn'],
    description: 'Saturn in own/exaltation in a kendra; discipline, endurance, and hard-won authority.',
  },
  // ── Luminaries and benefic combinations ──────────────────────────────────────
  {
    name: 'Gaja Kesari',
    planets: ['Jupiter', 'Moon'],
    description: 'Jupiter–Moon in angular relationship; wisdom, magnanimity, and a reputation that endures.',
  },
  {
    name: 'Budha Aditya',
    planets: ['Mercury', 'Sun'],
    description: 'Mercury–Sun conjunction; keen intellect, confident communication, and clarity of purpose.',
  },
  {
    name: 'Chandra Mangala',
    planets: ['Moon', 'Mars'],
    description: 'Moon–Mars conjunction or mutual aspect; emotional drive, resourcefulness, and wealth from effort.',
  },
  {
    name: 'Amala',
    planets: ['Jupiter', 'Venus'],
    description: 'A natural benefic in the 10th from Moon or Lagna; a career marked by integrity and lasting repute.',
  },
  // ── Lunar position yogas (Sunapha / Anapha / Durudhura / Kemadruma) ──────────
  {
    name: 'Sunapha',
    planets: ['Moon'],
    description: 'A planet (other than Sun) in the 2nd from Moon; self-made wealth, natural charisma, and self-reliance.',
  },
  {
    name: 'Anapha',
    planets: ['Moon'],
    description: 'A planet (other than Sun) in the 12th from Moon; renown, generosity of spirit, and ease in retreat.',
  },
  {
    name: 'Durudhura',
    planets: ['Moon'],
    description: 'Planets in both 2nd and 12th from Moon; surrounded by support — prosperity flows in and is well spent.',
  },
  {
    name: 'Kemadruma',
    planets: ['Moon'],
    description: 'No planets in 2nd or 12th from Moon; a solitary path that cultivates deep self-reliance and inner resilience.',
  },
  // ── Solar position yogas (Vesi / Vasi / Ubhayachari) ─────────────────────────
  {
    name: 'Vesi',
    planets: ['Sun'],
    description: 'A planet (other than Moon) in the 2nd from Sun; eloquence, sharp memory, and steady moral character.',
  },
  {
    name: 'Vasi',
    planets: ['Sun'],
    description: 'A planet (other than Moon) in the 12th from Sun; diplomatic skill, fortunate expenditure, and inner strength.',
  },
  {
    name: 'Ubhayachari',
    planets: ['Sun'],
    description: 'Planets in both 2nd and 12th from Sun; a well-balanced life with resources, influence, and clear direction.',
  },
  // ── Raja and Dhana yogas ─────────────────────────────────────────────────────
  {
    name: 'Raja',
    planets: ['Sun', 'Moon', 'Mars', 'Jupiter'],
    description: 'Lords of trikona and kendra in mutual relation; capacity for recognition, influence, and purposeful leadership.',
  },
  {
    name: 'Dhana',
    planets: ['Jupiter', 'Venus'],
    description: 'Lords of 2nd/11th in conjunction or mutual reception; a chart configured for wealth accumulation over time.',
  },
  // ── Viparita and exchange ─────────────────────────────────────────────────────
  {
    name: 'Viparita',
    planets: ['Saturn', 'Rahu', 'Ketu'],
    description: 'A dusthana lord placed in another dusthana; misfortune transmuted — what appears as loss becomes eventual gain.',
  },
  {
    name: 'Parivartana',
    planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'],
    description: 'Two planets in each other\'s signs (mutual exchange); a powerful house activation that links two life domains.',
  },
]

// ── Derived maps for backward-compatible use in pdfExport and OverviewTab ─────

export const YOGA_DESCRIPTIONS: Record<string, string> =
  Object.fromEntries(YOGA_DATA.map(y => [y.name, y.description]))

export const YOGA_PLANET_MAP: Record<string, string[]> =
  Object.fromEntries(YOGA_DATA.map(y => [y.name, y.planets]))

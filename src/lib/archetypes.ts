// Leadership archetype derivation from AK planet + lagna lord.
// Reference: skill.md §10 — Founder / Commander / Specialist / Visionary archetypes.

// AK-based primary archetype
const AK_ARCHETYPE: Record<string, string> = {
  Sun:     'Commander',
  Moon:    'Nurturer',
  Mars:    'Founder',
  Mercury: 'Specialist',
  Jupiter: 'Visionary',
  Venus:   'Diplomat',
  Saturn:  'Architect',
  Rahu:    'Innovator',
  Ketu:    'Sage',
}

// Lagna lord modifier — overrides when synergy is strong
const LAGNA_MODIFIER: Record<string, Record<string, string>> = {
  // If AK is Sun + lagna lord is Mars → Commander
  Mars:    { Sun: 'Commander', Jupiter: 'Visionary', Saturn: 'Architect' },
  Jupiter: { Sun: 'Visionary', Moon: 'Visionary',    Saturn: 'Visionary' },
  Saturn:  { Mars: 'Architect', Mercury: 'Specialist', Sun: 'Architect' },
  Mercury: { Jupiter: 'Specialist', Venus: 'Diplomat', Moon: 'Specialist' },
  Venus:   { Moon: 'Diplomat',  Jupiter: 'Visionary',  Mercury: 'Diplomat' },
}

export function deriveLeadershipType(akPlanet: string, lagnaLord: string): string {
  // Check modifier table first
  const modMap = LAGNA_MODIFIER[lagnaLord]
  if (modMap?.[akPlanet]) return modMap[akPlanet]
  // Fall back to AK archetype
  return AK_ARCHETYPE[akPlanet] ?? 'Visionary'
}

// Canonical 27-nakshatra lookup — single source of truth for all tabs.
// Spelling follows standard IAST transliteration; Mula/Dhanishtha/Uttara Ashadha etc.

export interface NakshatraInfo {
  name:     string
  lord:     string                         // Vimśottarī ruling planet
  symbol:   string
  deity:    string                         // presiding deity
  gana:     'Deva' | 'Manushya' | 'Rakshasa'
  yoni:     string                         // animal pair for Yoni kuta
  nadi:     'Aadi' | 'Madhya' | 'Antya'
  qualities: string                        // 1–2 sentence reflective description
}

export const NAKSHATRA_DATA: NakshatraInfo[] = [
  { name:'Ashwini',          lord:'Ketu',    symbol:'Horse head',                      deity:'Ashvins (divine physicians)', gana:'Deva',     yoni:'Horse',    nadi:'Aadi',   qualities:'Swift healing, vitality, and the impulse toward new beginnings. The celestial physicians — quick to act, quick to renew.' },
  { name:'Bharani',          lord:'Venus',   symbol:'Yoni (vessel of life)',           deity:'Yama (lord of dharma)',        gana:'Manushya', yoni:'Elephant', nadi:'Madhya', qualities:'Bearing the weight of creation and dissolution. Intensity, mortality, and the fierce creative life-force that transforms.' },
  { name:'Krittika',         lord:'Sun',     symbol:'Flame / razor',                  deity:'Agni (fire)',                  gana:'Rakshasa', yoni:'Goat',     nadi:'Antya',  qualities:'Purifying fire that both nurtures and severs. Courage, directness, and the capacity to cut through illusion.' },
  { name:'Rohini',           lord:'Moon',    symbol:'Ox cart / chariot',              deity:'Brahma (creator)',             gana:'Manushya', yoni:'Serpent',  nadi:'Aadi',   qualities:'Fertile abundance and sensory richness. The most beloved of the Moon — magnetic, creative, and deeply rooted in beauty.' },
  { name:'Mrigashira',       lord:'Mars',    symbol:'Deer head',                      deity:'Soma (Moon god)',              gana:'Deva',     yoni:'Serpent',  nadi:'Madhya', qualities:'Gentle seeking and curious wandering. The eternal quest — always drawn forward by the scent of something finer.' },
  { name:'Ardra',            lord:'Rahu',    symbol:'Teardrop / diamond',             deity:'Rudra (storm god)',            gana:'Manushya', yoni:'Dog',      nadi:'Antya',  qualities:'Raw storm and radical dissolution. The grief that clears the ground — turbulence as the precondition for genuine renewal.' },
  { name:'Punarvasu',        lord:'Jupiter', symbol:'Bow and quiver',                 deity:'Aditi (mother of gods)',       gana:'Deva',     yoni:'Cat',      nadi:'Aadi',   qualities:'Return to light after wandering. Restoration, generous renewal, and the comfort of arriving home after a long journey.' },
  { name:'Pushya',           lord:'Saturn',  symbol:'Udder / flower',                 deity:'Bṛhaspati (divine teacher)',   gana:'Deva',     yoni:'Goat',     nadi:'Madhya', qualities:'Cosmic nourishment and dharmic stability. Considered the most auspicious nakshatra — the capacity to sustain and provide.' },
  { name:'Ashlesha',         lord:'Mercury', symbol:'Coiled serpent',                 deity:'Nāgas (serpent deities)',      gana:'Rakshasa', yoni:'Cat',      nadi:'Antya',  qualities:'Penetrating intuition and serpentine wisdom. Hidden knowing, kundalini potential, and strategic depth beneath a composed surface.' },
  { name:'Magha',            lord:'Ketu',    symbol:'Royal throne / palanquin',       deity:'Pitṛs (ancestral spirits)',    gana:'Rakshasa', yoni:'Rat',      nadi:'Aadi',   qualities:'Ancestral authority and regal inheritance. The power of lineage — drawing strength from the roots of what came before.' },
  { name:'Purva Phalguni',   lord:'Venus',   symbol:'Front legs of bed / hammock',    deity:'Bhaga (god of delight)',       gana:'Manushya', yoni:'Rat',      nadi:'Madhya', qualities:'Rest, delight, and the full enjoyment of creative prosperity. The honeymoon of the zodiac — pleasure as a legitimate sacred act.' },
  { name:'Uttara Phalguni',  lord:'Sun',     symbol:'Back legs of bed',               deity:'Āryaman (god of contracts)',   gana:'Manushya', yoni:'Cow',      nadi:'Antya',  qualities:'Patronage, lasting bonds, and the steadiness of mutual support. Relationships founded on reliability rather than romance.' },
  { name:'Hasta',            lord:'Moon',    symbol:'Open hand',                      deity:'Savitar (the sun creator)',    gana:'Deva',     yoni:'Buffalo',  nadi:'Aadi',   qualities:'Skilled hands and practical mastery. Dexterity, craft, and the healing that comes through direct, tangible service.' },
  { name:'Chitra',           lord:'Mars',    symbol:'Bright jewel / pearl',           deity:'Viśvakarmā (divine architect)',gana:'Rakshasa', yoni:'Tiger',    nadi:'Madhya', qualities:'Architectural vision and the drive toward aesthetic perfection. The artist who must build something beautiful and lasting.' },
  { name:'Swati',            lord:'Rahu',    symbol:'Young sprout / sword',           deity:'Vāyu (wind god)',              gana:'Deva',     yoni:'Buffalo',  nadi:'Antya',  qualities:'Independence, flexibility, and the art of navigating change. A lone blade that bends in the wind yet does not break.' },
  { name:'Vishakha',         lord:'Jupiter', symbol:'Triumphal arch / potter\'s wheel',deity:'Indra-Agni (power & fire)',   gana:'Rakshasa', yoni:'Tiger',    nadi:'Aadi',   qualities:'Goal-oriented intensity and sustained ambition. The archer who keeps one eye fixed on the destination no matter the weather.' },
  { name:'Anuradha',         lord:'Saturn',  symbol:'Lotus / staff',                  deity:'Mitra (god of devotion)',      gana:'Deva',     yoni:'Deer',     nadi:'Madhya', qualities:'Devotion, friendship, and the capacity to bloom in difficult terrain. Loyalty as a spiritual discipline.' },
  { name:'Jyeshtha',         lord:'Mercury', symbol:'Circular amulet / umbrella',     deity:'Indra (king of gods)',         gana:'Rakshasa', yoni:'Deer',     nadi:'Antya',  qualities:'Seniority, protection, and mastery earned through long experience. The eldest — carrier of authority and hidden power.' },
  { name:'Mula',             lord:'Ketu',    symbol:'Tied bundle of roots',           deity:'Nirṛti (goddess of calamity)', gana:'Rakshasa', yoni:'Dog',      nadi:'Aadi',   qualities:'Radical investigation of foundations. Uprooting what is false to reach essential truth — dissolution in service of liberation.' },
  { name:'Purva Ashadha',    lord:'Venus',   symbol:'Fan / elephant tusk',            deity:'Āpas (water deities)',         gana:'Manushya', yoni:'Monkey',   nadi:'Madhya', qualities:'Invincibility and the purifying rush before final victory. Confidence that comes from knowing one\'s cause is just.' },
  { name:'Uttara Ashadha',   lord:'Sun',     symbol:'Elephant tusk / small bed',      deity:'Viśvedevas (all gods)',        gana:'Manushya', yoni:'Mongoose', nadi:'Antya',  qualities:'Final, lasting victory through righteousness. Achievement consolidated into legacy — the culmination that endures.' },
  { name:'Shravana',         lord:'Moon',    symbol:'Ear / three footprints',         deity:'Viṣṇu (preserver)',            gana:'Deva',     yoni:'Monkey',   nadi:'Aadi',   qualities:'Deep listening and the transmission of knowledge across distance. The student of cosmic sound — wisdom received before it is spoken.' },
  { name:'Dhanishtha',       lord:'Mars',    symbol:'Drum / flute',                   deity:'Aṣṭavasus (eight Vasus)',      gana:'Rakshasa', yoni:'Lion',     nadi:'Madhya', qualities:'Abundance and fame won through disciplined effort. The music of material success — rhythm, timing, and collective recognition.' },
  { name:'Shatabhisha',      lord:'Rahu',    symbol:'Empty circle / hundred healers', deity:'Varuṇa (lord of cosmic law)',  gana:'Rakshasa', yoni:'Horse',    nadi:'Antya',  qualities:'Solitary wisdom and esoteric healing. The seeker who ventures into the empty circle to find what others are afraid to look for.' },
  { name:'Purva Bhadrapada', lord:'Jupiter', symbol:'Front legs of funeral cot / sword',deity:'Aja Ekapāda (one-footed goat)',gana:'Manushya',yoni:'Lion',    nadi:'Aadi',   qualities:'Passionate transformation and the fire of the sage. Burning away the inessential to reveal the austere brilliance beneath.' },
  { name:'Uttara Bhadrapada',lord:'Saturn',  symbol:'Back legs of funeral cot / serpent',deity:'Ahirbudhnya (serpent of deep)',gana:'Manushya',yoni:'Cow',    nadi:'Madhya', qualities:'Depth, endurance, and compassion earned through long patience. The anchor in deep waters — wisdom that stabilises rather than dazzles.' },
  { name:'Revati',           lord:'Mercury', symbol:'Drum / pair of fish',            deity:'Pūṣan (nourisher of journeys)',gana:'Deva',     yoni:'Elephant', nadi:'Antya',  qualities:'Boundless compassion and the graceful completion of cycles. Nourishing the passage between worlds — the last step and the first.' },
]

// Derived flat arrays for backward-compatible use in GreenDaysTab / CompatibilityTab
export const NAKSHATRA_NAMES: string[] = NAKSHATRA_DATA.map(n => n.name)

export const YONI: Record<string, string> =
  Object.fromEntries(NAKSHATRA_DATA.map(n => [n.name, n.yoni]))

export const GANA: Record<string, string> =
  Object.fromEntries(NAKSHATRA_DATA.map(n => [n.name, n.gana]))

export const NADI_MAP: Record<string, 'Aadi' | 'Madhya' | 'Antya'> =
  Object.fromEntries(NAKSHATRA_DATA.map(n => [n.name, n.nadi]))

export const YONI_ENEMIES: [string, string][] = [
  ['Horse', 'Buffalo'], ['Dog', 'Deer'], ['Cat', 'Rat'], ['Tiger', 'Cow'], ['Serpent', 'Mongoose'],
]

// Green Days scoring lists (Mula/Dhanishtha canonical spellings)
export const FAVORABLE_NAKSHATRAS: string[] = [
  'Rohini', 'Mrigashira', 'Pushya', 'Hasta', 'Chitra', 'Swati',
  'Anuradha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Revati',
]
export const INAUSPICIOUS_NAKSHATRAS: string[] = [
  'Ardra', 'Ashlesha', 'Jyeshtha', 'Mula', 'Purva Phalguni',
  'Purva Ashadha', 'Purva Bhadrapada',
]

// Vedic planetary dignity rules — exaltation, debilitation, own sign, moolatrikona.
// Reference: Brihat Parashara Hora Shastra, Ch.3–4.

// Sign indices 0–11: Aries, Taurus, Gemini, Cancer, Leo, Virgo,
//                    Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces

interface DignityDef {
  exalt:        number        // sign index of exaltation
  debit:        number        // sign index of debilitation (opp. exaltation)
  ownSigns:     number[]      // svakṣetra
  moolatrikona: number        // sign index of moolatrikona (highest own-sign strength)
}

const DIGNITY_TABLE: Record<string, DignityDef> = {
  Sun:     { exalt: 0,  debit: 6,  ownSigns: [4],     moolatrikona: 4  },  // exalt Aries, own Leo
  Moon:    { exalt: 1,  debit: 7,  ownSigns: [3],     moolatrikona: 3  },  // exalt Taurus, own Cancer
  Mars:    { exalt: 9,  debit: 3,  ownSigns: [0, 7],  moolatrikona: 0  },  // exalt Cap, own Aries/Scorpio
  Mercury: { exalt: 5,  debit: 11, ownSigns: [2, 5],  moolatrikona: 5  },  // exalt Virgo, own Gem/Vir
  Jupiter: { exalt: 3,  debit: 9,  ownSigns: [8, 11], moolatrikona: 8  },  // exalt Cancer, own Sag/Pisces
  Venus:   { exalt: 11, debit: 5,  ownSigns: [1, 6],  moolatrikona: 6  },  // exalt Pisces, own Tau/Libra
  Saturn:  { exalt: 6,  debit: 0,  ownSigns: [9, 10], moolatrikona: 10 },  // exalt Libra, own Cap/Aqua
  Rahu:    { exalt: 1,  debit: 7,  ownSigns: [10],    moolatrikona: 10 },  // traditional Taurus exalt
  Ketu:    { exalt: 7,  debit: 1,  ownSigns: [4],     moolatrikona: 4  },  // traditional Scorpio exalt
}

const SIGN_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
]

export interface DignityResult {
  dignity: string
  notes:   string
}

export function getDignity(planet: string, signIndex: number): DignityResult {
  const def = DIGNITY_TABLE[planet]
  if (!def) return { dignity: '', notes: '' }

  if (signIndex === def.exalt) {
    return {
      dignity: 'Exalted',
      notes:   `${planet} is exalted in ${SIGN_NAMES[signIndex]} — peak expression of its natural significations.`,
    }
  }
  if (signIndex === def.debit) {
    return {
      dignity: 'Debilitated',
      notes:   `${planet} is debilitated in ${SIGN_NAMES[signIndex]} — natural significations require conscious cultivation.`,
    }
  }
  if (signIndex === def.moolatrikona) {
    return {
      dignity: 'Moolatrikona',
      notes:   `${planet} occupies its moolatrikona ${SIGN_NAMES[signIndex]} — a position of stable, purposeful strength.`,
    }
  }
  if (def.ownSigns.includes(signIndex)) {
    return {
      dignity: 'Own Sign',
      notes:   `${planet} is in its own sign ${SIGN_NAMES[signIndex]} — expresses naturally and with ease.`,
    }
  }
  return { dignity: '', notes: '' }
}

// Populate dignity + notes on a planetTable array in place.
export function applyDignities(
  planetTable: Array<{ planet: string; sign: string; dignity: string; notes?: string }>
): void {
  for (const row of planetTable) {
    const signIdx = SIGN_NAMES.indexOf(row.sign)
    if (signIdx === -1) continue
    const { dignity, notes } = getDignity(row.planet, signIdx)
    row.dignity = dignity
    row.notes   = notes
  }
}

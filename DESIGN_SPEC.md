# Celestial Noir — Design Specification
### Jyotiṣa Birth Chart Reflection App

---

## Design Direction

**Celestial Noir, restrained.**
Dark-academia meets Jyotiṣa. The visual language should feel like a scholarly manuscript read by candlelight — not a neon fortune-teller. The palette, typography, and motion all serve legibility and contemplation, not spectacle.

---

## Colour Palette

| Role | Token | Hex |
|---|---|---|
| Background deep | `--bg-deep` | `#0A0618` |
| Background mid | `--bg-mid` | `#100A22` |
| Surface | `--surface` | `rgba(18,12,40,0.7)` |
| Surface elevated | `--surface-el` | `rgba(30,18,55,0.7)` |
| Border subtle | `--border-sub` | `#2A1A3A` |
| Border accent | `--border-acc` | `#4A3A6A` |
| Border bright | `--border-bright` | `#5A3A8A` |
| Text primary | `--text-pri` | `#E8E0F0` |
| Text secondary | `--text-sec` | `#B8B0C8` |
| Text muted | `--text-mut` | `#7A6A9A` |
| Text ghost | `--text-ghost` | `#4A3A6A` |
| Gold accent | `--gold` | `#C0A860` |
| Gold bright | `--gold-bright` | `#D4B870` |
| Gold dim | `--gold-dim` | `#A08050` |

### Planetary colours
Each planet has a fixed signature colour used for glyphs, borders, and highlights — never backgrounds at full opacity.

| Planet | Hex |
|---|---|
| Sun | `#F5C842` |
| Moon | `#D0D8F0` |
| Mercury | `#7EC8A0` |
| Venus | `#E48DB0` |
| Mars | `#E05050` |
| Jupiter | `#F0A830` |
| Saturn | `#A08050` |
| Rahu | `#8855CC` |
| Ketu | `#CC8855` |
| Lagna | `#AACCFF` |

---

## Typography

**Display / headers:** Cormorant Garamond (Google Fonts)
- Weight 300 (light) for large headings
- Weight 400 for body in the serif voice
- Italic 300/400 for sign names, Sanskrit terms, mantras

**UI / labels:** Inter or system-ui
- 12–13px for body UI text
- 10–11px for labels, caps-tracked (`letter-spacing: 1–2px`, `text-transform: uppercase`)
- Never bold labels — use tracking and colour instead

**Sanskrit / Devanagari strings:** Render as Unicode in Cormorant. Do not use a separate Devanagari font unless explicitly adding full multilingual support.

---

## Motion

- **Star field:** Canvas-based, ~180 stars, amplitude `0.3–1.0` opacity, period 2–8 s per star. Respect `prefers-reduced-motion` — freeze alpha at seed value when true.
- **Tab transitions:** `opacity 0 → 1 + translateY 4px → 0`, duration 250 ms.
- **Panel slide:** Right-side house detail panel, no animation — instant show/hide to avoid distraction.
- **No loading spinners, no skeleton screens.** If data isn't ready, show nothing.

---

## Chart Geometry

**North Indian (Rāśi) style.** 4×4 grid of cells.
- Corner houses (1, 4, 7, 10): diamond clipping path inside the cell
- Non-corner houses: full square cell
- Inner cross lines: thin (`strokeWidth 0.6`), dark violet — structural, not decorative
- House numbers: 9px, muted
- Sign abbreviations: 10px italic gold
- Planet glyphs: Unicode (☉ ☽ ☿ ♀ ♂ ♃ ♄ ☊ ☋), 13–14px, planetary colour with `drop-shadow` glow

---

## Component Rules

### Header badge
- "REFLECTION · NOT PREDICTION" is always visible at top
- Tapping it opens the disclaimer modal
- Never remove or hide this element

### Tab bar
- Five tabs: Chart · Planets · Time Cycles · Themes · Practices
- Active tab: gold bottom border + slightly elevated background
- Scrollable horizontally on small screens — never wrap

### House detail panel
- Slides in from the right at fixed width 320px
- Contains: house number, sign name, thematic description, list of planets present
- Planetary entries show glyph + name + subtle border in planetary colour

### Dasha timeline bar
- Proportional strip divided by Vimśottarī period lengths
- Current mahādaśā period: highlighted with planetary colour tint + top border
- Shows abbreviated planet name if segment width > ~6% of total
- Below the bar: two cards — mahādaśā and antaradaśā with dates

### Practices tab — gemstone module
- **No gemstone recommendation.** Ever.
- The section explicitly states why and redirects to in-person practitioners.
- This is not an oversight — it is intentional product policy.

### Footer disclaimer
- `position: fixed`, bottom of viewport, always visible
- Background: near-opaque dark + `backdrop-filter: blur(8px)`
- Text: ghost colour, 10px — present but not distracting

---

## What is Deliberately Absent

These omissions are features, not gaps. They exist to:
1. Keep the app off the "prediction" axis (app-store compliance, consumer-protection exposure in India)
2. Build user trust through epistemic honesty
3. Avoid harm from confident-but-wrong outputs

| Absent feature | Reason |
|---|---|
| Specific date predictions ("marriage in 2027") | Cannot be validated; creates false certainty |
| Gemstone purchase recommendations | Require full constitutional assessment in person |
| Industry / career specific recommendations | Overly deterministic; liability risk |
| Mental health edge content | Out of scope; refer to qualified practitioners |
| Transits as predictions | Treated as weather, not fate |

---

## Data Contract (SAMPLE_CHART shape)

```js
{
  native: { name, dob, tob, pob },
  lagna: { sign, lord, degree },
  houses: [
    { id, sign, planets: string[] }  // 12 entries, id 1–12
  ],
  nakshatra: { name, pada, lord },
  yoga: string[],
  dasha: {
    current: { planet, start, end },
    antardasha: { planet, start, end },
    sequence: [
      { planet, years, start, end }   // full 120-year sequence
    ]
  }
}
```

Swap `SAMPLE_CHART` in `KundaliApp.jsx` with output from `swisseph-wasm` (Lahiri ayanamsa). No other code changes required.

---

## Next Steps (Engineering)

1. **Calculation engine** — integrate `swisseph-wasm` for real birth data. ~1 day.
2. **Birth data intake screen** — form with date / time / place, timezone resolution, "approximate time" toggle that hides Lagna-dependent modules.
3. **Vite project scaffold** — replace the standalone HTML runner with a proper dev environment when team grows.
4. **i18n** — Hindi/Devanagari UI strings as a second pass; the Sanskrit terms are already Unicode-correct.

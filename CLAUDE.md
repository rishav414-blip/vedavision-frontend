# CLAUDE.md — Celestial Noir (Kundali App)

Single source of truth for Claude working on this project. Read this file first, every session.

---

## 1. Project Overview

Celestial Noir is a Vedic astrology (Jyotiṣa) birth-chart **reflection** web app. It renders a North Indian Rāśi chart with planetary positions, Vimśottarī daśā timeline, thematic interpretations, and contemplative practices. The design philosophy is dark-academia — scholarly and restrained, not neon-mystical. The app explicitly positions itself on the **reflection axis, not the prediction axis**: it surfaces patterns and symbolism for self-inquiry, never forecasts or directs life decisions. This distinction is product policy, not a style choice, and governs every content and feature decision.

---

## 2. Architecture

### Files

| File | Role |
|---|---|
| `index.html` | Standalone runner. Loads React 18 + Babel standalone from CDN (no build step). Fetches `KundaliApp.jsx` at runtime via `fetch()` + Babel transpile when served over HTTP. Falls back to paste-in for `file://` URLs. |
| `KundaliApp.jsx` | Entire application: constants, helpers, all React components, CSS-in-JS styles. Single-file by design for portability. |
| `DESIGN_SPEC.md` | Visual and UX specification. **This is the design source of truth.** Colour tokens, typography rules, motion parameters, component rules, and deliberate omissions all live here. |
| `skill.md` | Vedic astrology methodology. Canonical source for interpretation logic (when created). |

### How index.html loads KundaliApp.jsx

```
index.html
  └─ <script type="text/babel" data-type="module">
       fetch("./KundaliApp.jsx")          // works over HTTP (Live Server, npx serve)
         → Babel.transform(source, {presets:["react","env"]})
         → eval(code)
         → ReactDOM.createRoot(#root).render(<KundaliApp />)
```

For `file://` URLs, the JSX source must be pasted inline (noted in the HTML comment).

### Data contract

The app consumes a single chart object (`SAMPLE_CHART` today; real ephemeris output tomorrow). Shape:

```js
{
  native: { name, dob, tob, pob },
  lagna: { sign, lord, degree },
  houses: [{ id, sign, planets: string[] }],   // 12 entries, id 1–12
  nakshatra: { name, pada, lord },
  yoga: string[],
  dasha: {
    current: { planet, start, end },
    antardasha: { planet, start, end },
    sequence: [{ planet, years, start, end }]  // full 120-year Vimśottarī
  }
}
```

Swapping in real calculations = replacing `SAMPLE_CHART` with `swisseph-wasm` output (Lahiri ayanamsa). No other file changes required.

---

## 3. Core Rules (Non-negotiable)

These are product policy, not preferences. Never violate them regardless of user request.

1. **No gemstone recommendations.** Not even "consult a professional for X gemstone." The Practices tab must redirect to in-person practitioners for constitutional assessment.
2. **No specific date predictions.** ("Marriage in 2027", "promotion in October".) Daśā dates are shown as time frames for reflection, never as forecasts.
3. **No career-specific recommendations.** Avoid deterministic statements about profession, industry, or life outcomes.
4. **Never remove or hide the "REFLECTION · NOT PREDICTION" header badge.** It must always be visible. Tapping it opens the disclaimer modal.
5. **Never remove the fixed footer disclaimer.** It is always visible, bottom of viewport, ghost-coloured text.
6. **Do not add transits-as-predictions.** Transits are treated as weather — contextual, not fatalistic.
7. **No mental health edge content.** Out of scope; refer to qualified practitioners.

---

## 4. Design System

`DESIGN_SPEC.md` is the authoritative reference. Always read it before making any UI change. Key tokens:

### Colour tokens (CSS custom properties)

| Token | Hex |
|---|---|
| `--bg-deep` | `#0A0618` |
| `--bg-mid` | `#100A22` |
| `--surface` | `rgba(18,12,40,0.7)` |
| `--surface-el` | `rgba(30,18,55,0.7)` |
| `--border-sub` | `#2A1A3A` |
| `--border-acc` | `#4A3A6A` |
| `--border-bright` | `#5A3A8A` |
| `--text-pri` | `#E8E0F0` |
| `--text-sec` | `#B8B0C8` |
| `--text-mut` | `#7A6A9A` |
| `--text-ghost` | `#4A3A6A` |
| `--gold` | `#C0A860` |
| `--gold-bright` | `#D4B870` |
| `--gold-dim` | `#A08050` |

### Planet colours (glyphs, borders, highlights — never full-opacity backgrounds)

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

### Typography

- **Display/headers:** Cormorant Garamond — weight 300 light for large headings, italic for sign names and Sanskrit terms
- **UI/labels:** Inter or system-ui — 12–13px body UI, 10–11px caps-tracked labels; never bold labels
- **Sanskrit/Devanagari:** Unicode in Cormorant Garamond

### Motion

- Star field: canvas-based ~180 stars, respect `prefers-reduced-motion`
- Tab transitions: opacity + translateY 4px, 250 ms
- House detail panel: instant show/hide, no animation
- No spinners, no skeletons

---

## 5. Efficiency Rules for Claude

Follow these to avoid wasted work:

1. **Before any UI change:** read `DESIGN_SPEC.md` in full. Do not guess at tokens or component rules.
2. **Before adding any component or utility:** read `KundaliApp.jsx` top-to-bottom to understand existing structure, helpers, and styles. Never duplicate what's already there.
3. **Before generating any astrological interpretation text:** consult `skill.md` for the canonical Vedic methodology. Do not invent interpretive frameworks.
4. **Batch related changes.** If a feature touches styles, a component, and data handling, do all three in a single edit session — not across multiple passes.
5. **Never regenerate file content you haven't read.** Always read the target file first, then make the minimum-diff edit.
6. **Use parallel tool calls** when gathering context (e.g., read `DESIGN_SPEC.md` and `KundaliApp.jsx` simultaneously).
7. **Summarize findings before acting.** After reading files, state what already exists before writing any new code. This surfaces overlap and prevents duplication.
8. **Do not add CSS custom properties that already exist** as inline style strings in `KundaliApp.jsx`. Audit the constants block first.

---

## 6. Skill References

`skill.md` (in this project directory) is the canonical Vedic astrology methodology document. It governs:

- House significations and how to describe them
- Planetary dignities (exaltation, debilitation, own sign, moolatrikona)
- Yogas — which to mention and how to frame them (as patterns, not promises)
- Nakshatra descriptions and pada qualities
- Daśā interpretation framing — always reflective, never predictive
- Rāśi (sign) thematic descriptions
- **§9** — VedaVision SaaS extensions: BNN system, Green/Red Day algorithm, Time-Slider data model, Digital Altar protocol, Hard Truths paywall logic, 5-year roadmap structure
- **§10** — Jaimini Chara Karakas (AK/AmK), D10 analysis, Leadership archetypes (Founder/Commander/Specialist), The Great Switch career-pivot timing, Wealth Heatmap ratings, Chandra Lagna fallback, Dashboard output template

Always use `skill.md` as the source for any interpretation logic. Do not substitute general Western astrology frameworks.

**Artha Focus:** Every career/wealth analysis must prioritize the 2nd (Dhana), 10th (Karma), and 11th (Labha) houses. Identify AK and AmK in the Foundation Scan for every full reading. If birth time is unknown, use Chandra Lagna and explicitly state the limitation (§10.6).

---

## 7. Next Engineering Steps

In priority order (from `DESIGN_SPEC.md` and codebase notes):

1. **swisseph-wasm integration** — Replace `SAMPLE_CHART` with live ephemeris calculation using `swisseph-wasm` with Lahiri ayanamsa. Input: birth date, time, place (lat/lon). Output must match the data contract shape exactly.
2. **Birth data intake form** — UI to collect `name`, `dob`, `tob`, `pob` (with geocoding for lat/lon). Validate before triggering calculation.
3. **Vite scaffold** — Migrate from Babel-standalone to a proper Vite + React project. `index.html` becomes the Vite entry point; `KundaliApp.jsx` becomes a normal ES module with `import` statements.
4. **i18n** — Add Hindi UI strings at minimum. Sanskrit terms already render as Unicode in Cormorant Garamond; no separate Devanagari font unless full multilingual support is added.

---

## 8. Token Efficiency Mandate

Before writing anything:

- **Analyze first.** Read all relevant files. Identify what already exists (components, helpers, styles, constants).
- **Summarize overlap.** State what can be reused vs. what is genuinely new.
- **Minimum viable diff.** Edit only what needs changing. Avoid rewriting stable sections.
- **No speculative additions.** Do not add features, props, or styles "in case they're useful later."
- **Parallel reads.** When context requires multiple files, fetch them simultaneously.
- **No boilerplate regeneration.** If a component, hook, or utility already exists in `KundaliApp.jsx`, use it. Do not create a second version.

The goal: every token Claude spends should either change something or confirm something. Reading to understand counts. Writing what already exists does not.

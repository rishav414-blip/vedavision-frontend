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
| `index.html` | The entire application — 4,200+ lines of vanilla HTML/CSS/JS. All tab panels, modals, render functions, auth, chatbot, PDF export, and compatibility engine live here. No build step. Deployed via Cloudflare Workers. |
| `vedavision.css` | Design system — all CSS custom properties, component styles, animations, responsive breakpoints, dark/light themes. Always read before any UI change. |
| `vedavision-data.js` | Data layer — `SAMPLE_CHART`, `CHART_VARIANTS`, `FIVE_YEAR_FORECAST`, `DASHA_THEMES`, `COMPAT_NAK`, all computation functions (`computeAshtakoot`, `generateDynamicForecast`, `generateCalendar`, etc.). Always read before adding data logic. |
| `manifest.json` | PWA manifest for home screen install. |
| `sw.js` | Service worker — caches core assets for offline use. |
| `skill.md` | Vedic astrology methodology. Canonical source for all interpretation logic. |
| `chatbot_skill.md` | Jyoti chatbot persona, response architecture, scope rules, hard limits, and mental health protocol. Read before editing any chatbot response. |

### How the app loads

`index.html` is a self-contained app — open it in a browser or serve it from any static host. No build step, no node_modules, no framework. External scripts (jsPDF, Razorpay checkout) load from CDN via `<script src>` tags.

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
2. **Before adding any component or utility:** grep `index.html` for existing functions and `vedavision-data.js` for existing data structures. Never duplicate what's already there.
3. **Before generating any astrological interpretation text:** consult `skill.md` for the canonical Vedic methodology. Do not invent interpretive frameworks.
4. **Batch related changes.** If a feature touches styles, a component, and data handling, do all three in a single edit session — not across multiple passes.
5. **Never regenerate file content you haven't read.** Always read the target file first, then make the minimum-diff edit.
6. **Use parallel tool calls** when gathering context (e.g., read `vedavision.css` and the relevant section of `index.html` simultaneously).
7. **Summarize findings before acting.** After reading files, state what already exists before writing any new code. This surfaces overlap and prevents duplication.
8. **Do not add CSS custom properties that already exist** in `vedavision.css`. Audit the `:root` block first.

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

## 7. Jyoti Chatbot — LLM Provider Options

### 7.1 Free Providers (current implementation — use these first)

The backend in `backend/main.py` tries providers in this priority order:

| Priority | Provider | Model | Free Limit | Get Key |
|---|---|---|---|---|
| 1 (primary) | **Google Gemini 2.5 Flash** | `gemini-2.5-flash` | 15 RPM, 1M tokens/day | [aistudio.google.com](https://aistudio.google.com) → Get API Key |
| 2 (fast fallback) | **Groq** | `llama-3.3-70b-versatile` | Rate-limited free tier | [console.groq.com](https://console.groq.com) → API Keys |
| 3 (safety net) | **Gemini 2.0 Flash** | `gemini-2.0-flash` | 1,500 req/day | Same key as above |

**Why Gemini 2.5 Flash first:** Significantly better instruction-following and persona adherence than llama-3.3-70b. Critical for maintaining Jyoti's scholarly tone and hard limits (no predictions, no gemstone recs). Both providers are free — this ordering optimises quality, not cost.

**Other free options to consider later:**
- **Cerebras** (`llama-3.3-70b`) — fastest available (~30 tok/s), free tier at [inference.cerebras.ai](https://inference.cerebras.ai)
- **OpenRouter** — aggregator; many models available free with `:free` suffix at [openrouter.ai](https://openrouter.ai)
- **Mistral AI** — free tier with `mistral-small-latest` at [console.mistral.ai](https://console.mistral.ai)

### 7.2 Paid Upgrade (when scale requires)

**Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) — best persona fidelity, ~$0.25/M tokens. Use only when free tier limits are hit in production. Requires Anthropic API key.

---

## 8. Next Engineering Steps

In priority order:

1. **swisseph-wasm integration** — Replace `SAMPLE_CHART` / Render backend with local wasm ephemeris. Eliminates cold-start problem. Output must match the existing chart data contract in `vedavision-data.js`.
2. **Streaming SSE for Jyoti** — Implement server-sent events on `/api/jyoti`. Groq and Gemini both support streaming. Halves perceived latency without changing wall-clock time.
3. **Vite migration** — Split `index.html` into ES modules. `index.html` → entry point; separate JS files per feature area. Reduces initial load from ~250KB.
4. **Hindi i18n** — `LANG_STRINGS.hi` object is wired in `index.html`; needs translation content for Overview tab, KPI labels, chatbot opener.
5. **Razorpay live key** — Replace `rzp_test_YOUR_KEY_HERE` at line ~3963 in `index.html` with real key from dashboard.razorpay.com.
6. **GA4 Measurement ID** — Replace `G-XXXXXXXXXX` at lines 21+26 in `index.html` with real ID from analytics.google.com.

---

## 8. Token Efficiency Mandate

Before writing anything:

- **Analyze first.** Read all relevant files. Identify what already exists (components, helpers, styles, constants).
- **Summarize overlap.** State what can be reused vs. what is genuinely new.
- **Minimum viable diff.** Edit only what needs changing. Avoid rewriting stable sections.
- **No speculative additions.** Do not add features, props, or styles "in case they're useful later."
- **Parallel reads.** When context requires multiple files, fetch them simultaneously.
- **No boilerplate regeneration.** If a render function, helper, or utility already exists in `index.html` or `vedavision-data.js`, use it. Do not create a second version.

The goal: every token Claude spends should either change something or confirm something. Reading to understand counts. Writing what already exists does not.

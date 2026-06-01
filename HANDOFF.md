# HANDOFF.md — VedaVision / Celestial Noir
_Last updated: 2026-05-31 IST_

---

## Architecture (Current — Vite + React)

The app has been **fully migrated** from a 5700-line vanilla `index.html` to a Vite 6 + React 18 + TypeScript SPA deployed on Cloudflare Pages.

### Frontend Stack
| Tech | Version | Notes |
|---|---|---|
| Vite | 6.x | Build tool, no ejection needed |
| React | 18.x | JSX + TSX mixed |
| TypeScript | 5.x | Tabs are `.tsx`, pages are `.jsx` |
| Framer Motion | — | Animations in tabs |
| html2canvas | 1.4.1 | Chart → PNG export (dynamically imported) |
| Inline styles | — | No Tailwind; design tokens via CSS vars |

### Backend Stack
| Tech | Notes |
|---|---|
| FastAPI (Python) | Hosted on Render.com |
| pyswisseph | Real Swiss Ephemeris calculations, Lahiri ayanamsa |
| Nominatim | Geocoding (place of birth → lat/lon) |
| Groq llama-3.3-70b | Primary LLM for Jyoti chatbot (free tier) |
| Gemini 2.5 Flash | Secondary LLM fallback (free tier) |

---

## File Map

### Pages
| File | Role |
|---|---|
| `src/pages/AuthPage.jsx` | Login / signup; SHA-256 password hashing via Web Crypto API; migration from plain-text passwords |
| `src/pages/HeroPage.jsx` | Birth form; POSTs to `/chart`; gender field; trust badges; `onChartReady` prop |
| `src/pages/DashboardPage.jsx` | Tab shell + AppShell wrapper; `SampleBanner` component; `isSample` prop; passes `lang` to all tabs |
| `src/pages/TimelinePage.jsx` | Standalone dasha timeline page |

### Tabs (all in `src/tabs/`)
| File | Lines | Features |
|---|---|---|
| `OverviewTab.tsx` | ~470 | PlanetKPI (animated displayPct), DailySignalCard, WealthScoreCard (animated bars), PlanetCoinsGrid, DashaTimeline, IdentityStrip, YogasCard (with activation periods), NakshatraCard |
| `InsightsTab.tsx` | ~420 | Planet table, `computeKarakas()` (degree-sort), `computeBNNTransits()`, Leadership Archetype, Tarot archetypes; Hindi i18n via `lang` prop |
| `ForecastTab.tsx` | ~610 | `generateYearlyOutlook(chart, currentYear)` — dasha-sequence-driven (no hardcoded data); PLANET_THEMES map; Hindi i18n via `lang` prop |
| `GreenDaysTab.tsx` | ~610 | `getNakshatra()` + `getTithi()` Panchang algorithm (epoch-based Moon motion); nakshatra shown per day; old hash formula removed |
| `NatalChartTab.tsx` | ~1010 | SVG D1 chart (`NISvgChart`) with 12 polygon regions, planet glyphs (☉☽♂…), clickable house panel (AnimatePresence); D9/D10 CSS grid charts |
| `CompatibilityTab.tsx` | ~320 | Full partner form, Ashtakoot scoring, Dasha alignment, share |
| `RemediesTab.tsx` | ~200 | Gemstone table, amber disclaimer, active planet highlight; Hindi i18n via `lang` prop |
| `AltarTab.tsx` | ~224 | Hora display, planet Hz audio, SVG bead counter, fasting guidance |
| `DharmaPassTab.tsx` | ~270 | Razorpay via `VITE_RAZORPAY_KEY` env var; async `saveWaitlist()` (localStorage + `fetch('/api/waitlist')` fallback); valid codes: CELESTIAL2026, DHARMA, VEDAVISION, COSMICPASS, **CHARLIE** |

### Components (`src/components/`)
| File | Role |
|---|---|
| `AppShell.tsx` | Sticky SummaryBar, collapsible sidebar, offline banner (online/offline listeners, `#E05050` fixed top bar), `data-chart-export` on main content area |
| `JyotiChat.tsx` | `buildSystemPrompt(chart)` — full chart context injection (12 houses, dasha, yogas, nakshatra, karakas); `SCOPE_BLOCKS` hard-stop rules (prediction/medical/financial/legal); crisis detection; Groq→Gemini cascade |
| `PDFExportButton.tsx` | Purchase gate: Razorpay checkout (₹99) → `vv_pdf_purchased`; falls back to `window.confirm` if Razorpay script not loaded |
| `ShareWidget.tsx` | Copy link / Copy chart summary / Share on WhatsApp / **Save as Image** (html2canvas PNG download) |
| `HindiToggle.jsx` | Lang switcher, `vv_lang` localStorage |
| `TourOnboarding.jsx` | First-run onboarding tour, `vv_tour_done` flag |
| `PrivacyModal.jsx` | GDPR/data export modal; auto-shown on first visit (`vv_disclaimer_shown` flag, 1s delay) |
| `PasscodeModal.jsx` | Dharma Pass unlock gate |
| `Toast.tsx` | Global `window.showToast(msg, type?)` toast system |

### Library & Data
| File | Role |
|---|---|
| `src/lib/pdfExport.ts` | Full report: native details + lagna + nakshatra + dasha + yogas-with-descriptions (`YOGA_DESCRIPTIONS`) + reflective practices (`DASHA_PRACTICES`) + 5-year dasha forecast; footer disclaimer |
| `src/lib/sampleChart.js` | Static `SAMPLE_CHART` (Arjun Sharma, Scorpio lagna, Saturn MD) |
| `src/App.jsx` | Root orchestrator; session restore; chart load/save; first-visit disclaimer auto-open |

---

## Key Data Flow

```
Auth (login/signup) — SHA-256 hashed passwords in vv_users
    │
    ▼  session saved to vv_session
    │
    ├─ saved chart in vv_chart_data? ──yes──► DashboardPage (real data)
    │
    └─ no ──► HeroPage (birth form)
                    │
                    ▼  POST /chart → pyswisseph backend
                    │
                    └─► save to vv_chart_data ──► DashboardPage
```

### localStorage Keys
| Key | Value |
|---|---|
| `vv_session` | `{ name, email, ts }` — logged-in user |
| `vv_users` | Array of `{ email, passwordHash (SHA-256) }` |
| `vv_chart_data` | Full chart object from `/chart` API |
| `vv_lang` | `'en'` or `'hi'` |
| `vv_tour_done` | `'1'` after tour completed |
| `vv_disclaimer_shown` | `'true'` after first-visit disclaimer dismissed |
| `vv_theme` | `'dark'` or `'light'` |
| `vv_dharma_access` | `{ ts }` — Dharma Pass expiry timestamp |
| `vv_dharma_waitlist` | `{ email, ts }` — waitlist entry |
| `vv_pdf_purchased` | `'true'` after PDF unlocked via Razorpay |

---

## Backend API Contract

### `POST /chart`
**Request:**
```json
{ "name": "...", "dob": "YYYY-MM-DD", "tob": "HH:MM", "pob": "...", "gender": "Male|Female|Other|Prefer not to say", "approxTime": false }
```

**Response:**
```json
{
  "native": { "name", "dob", "tob", "pob" },
  "lagna": { "sign", "lord", "degree" },
  "moonSign": "...", "sunSign": "...",
  "nakshatra": { "name", "pada", "lord" },
  "houses": [{ "id": 1-12, "sign": "...", "planets": ["Su","Mo",...] }],
  "d9Houses": [...],
  "d10Houses": [...],
  "karakas": { "AK": "Su", "AmK": "Mo", ... },
  "dasha": {
    "current": { "planet", "start", "end" },
    "antardasha": { "planet", "start", "end" },
    "sequence": [{ "planet", "years", "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }]
  },
  "yoga": [...], "yogas": [...],
  "planetTable": [{ "planet", "sign", "house", "dignity", "degree" }],
  "wealthScore": { "total", "parashari", "bnn" },
  "chartStrength": 0-100,
  "ak": "Su", "amk": "Mo",
  "leadershipType": "Commander|Advisor|Nurturer|Founder|Specialist",
  "bnnTransits": [...]
}
```

### `POST /api/jyoti`
```json
// request
{ "message": "...", "chart_context": {...}, "system_prompt": "...", "history": [...] }
// response (non-streaming, full reply at once)
{ "reply": "...", "model": "groq|gemini|local" }
```

### `POST /api/jyoti/stream`
```
// request — same shape as /api/jyoti
// response — text/event-stream (SSE)
data: {"chunk": "partial text..."}\n\n
data: {"chunk": "more text..."}\n\n
data: [DONE]\n\n
// on error:
data: {"error": "message"}\n\n
```

---

## Deployment

### Frontend — Cloudflare Pages
- **Production URL:** https://vedavision-app.pages.dev
- **Project name:** `vedavision-app`
- **Manual deploy command:**
  ```
  CLOUDFLARE_API_TOKEN="cfut_..." npx wrangler pages deploy dist/ --project-name vedavision-app --branch main --commit-dirty=true
  ```
- **GitHub Actions:** `.github/workflows/deploy.yml` — auto-deploys on push to `main`
  - Requires secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- **Env vars needed (Cloudflare Pages → Settings → Environment Variables):**
  - `VITE_RAZORPAY_KEY` — from dashboard.razorpay.com (set to live key before launch)

### Backend — Render.com
- **Service:** vedavision-backend
- **Env vars required:**
  - `GROQ_API_KEY` — from console.groq.com (free)
  - `GEMINI_API_KEY` — from aistudio.google.com (free, 1500 req/day)
- **Backend URL (hardcoded in HeroPage.jsx):** `https://vedavision-backend.onrender.com`

---

## Features Completed (All Phases)

### Phase 1 — Original Migration
- [x] Vite + React architecture (migrated from 5700-line index.html)
- [x] Real Swiss Ephemeris via `/chart` API (pyswisseph backend)
- [x] Login → birth form first (not sample dashboard)
- [x] Real chart saved to localStorage, restored on next login
- [x] Sample data banner with "Cast My Chart →"
- [x] Gender field on birth form
- [x] Trust badges on HeroPage
- [x] Session restore: returning user → direct to dashboard

### Phase 3 — Quality & Performance (2026-05-31)
- [x] **React.lazy bundle split** — All 10 tabs lazy-loaded via `React.lazy` + `Suspense`; switch-based `ActiveTab` function prevents pre-instantiation; main bundle: 560 KB → **407 KB** (-27%), gzip 172 KB → **132 KB**; 10 separate tab chunks (7–26 KB each)
- [x] **Jyoti SSE streaming** — Backend: new `/api/jyoti/stream` endpoint (`StreamingResponse`, asyncio.Queue + daemon thread for Gemini/Groq SDKs); Frontend: `ReadableStream` reader, SSE line parser, empty bot message filled incrementally in real-time; `useTypewriter` preserved for opener/crisis/scope responses only
- [x] **InsightsTab archetype fix** — `ARCHETYPES` expanded to 10 entries (all 9 spec types + Advisor); lookup reads `chart.leadershipType` first, falls back to local `deriveArchetype(lord, planet)`
- [x] **InsightsTab AK fix** — `akPlanet` now prefers `chart.karakas.atmakaraka.planet_name` over backend abbreviation `chart.ak`; AK pill label updated accordingly
- [x] **Dead code removal** — `tanASC` variable deleted from `ephemeris.ts`; `tsconfig.json` `ignoreDeprecations: "6.0"` silences TS5101 `baseUrl` warning
- [x] **JyotiChat stream bugs** — `[DONE]` sentinel now sets `streamDone` flag to exit outer `while` loop (not just inner `for`); `setStatusLabel('AI')` moved to `finally` block so status resets on both success and error paths
- [x] **TypeScript clean** — `npx tsc --noEmit` returns exit code 0; build succeeds cleanly

### Phase 2 — Gap Closure (2026-05-26)
- [x] **Service Worker** — registered in `index.html`; offline banner in AppShell (red fixed bar)
- [x] **SVG Natal Chart** — `NISvgChart` component: 12 polygon regions, planet glyphs (☉☽♂♀♃♄☊☋), sign labels, gold highlights, clickable → AnimatePresence detail panel
- [x] **Dynamic Forecast** — `generateYearlyOutlook(chart)` reads `dasha.sequence`; no hardcoded data; fallback message if no chart
- [x] **BNN Transits** — `computeBNNTransits(chart)`: Jupiter/Saturn/Rahu windows with natal contact and theme text; no more "data unavailable"
- [x] **Karakas** — `computeKarakas(chart)`: degree-sort from `planetTable`; all 7 always show a planet name
- [x] **Animated bars** — Wealth/BNN bars: `transition: width 0.6s ease`; Dasha KPI: `displayPct` with `requestAnimationFrame` mount animation
- [x] **Green Days Panchang** — `getNakshatra()` + `getTithi()` epoch-based; nakshatra shown per calendar cell; old hash removed
- [x] **Jyoti full context** — `buildSystemPrompt(chart)`: 12 houses + dasha + yogas + nakshatra + karakas injected as system prompt
- [x] **Jyoti scope blocks** — `SCOPE_BLOCKS`: prediction / medical / financial / legal hard-stop rules; checked before API call
- [x] **PDF full report** — `YOGA_DESCRIPTIONS` + `DASHA_PRACTICES` + 5-year forecast section + disclaimer footer
- [x] **PDF purchase gate** — Razorpay checkout (₹99); falls back to `window.confirm` if script not loaded
- [x] **Razorpay script** — `checkout.js` loaded in `index.html`; key via `VITE_RAZORPAY_KEY` env var
- [x] **Share as PNG** — `html2canvas` saves chart area as `celestial-noir-chart.png`; `data-chart-export` on main content
- [x] **Share rich text** — Copy chart summary (lagna/nakshatra/dasha/yogas/URL) + WhatsApp preset
- [x] **Hindi i18n** — `lang` prop threaded through DashboardPage → InsightsTab / ForecastTab / RemediesTab; key labels translated
- [x] **First-visit disclaimer** — auto-opens PrivacyModal after 1s on first load; `vv_disclaimer_shown` prevents repeat
- [x] **Waitlist backend** — `saveWaitlist()` saves localStorage first, then fire-and-forget `fetch('/api/waitlist')`
- [x] **Auth password hashing** — SHA-256 via Web Crypto API; migration from plain-text on next login
- [x] **Yoga activation periods** — `getYogaActivationPeriod()` maps yoga → planets → dasha sequence; shows "Active during X MD (YYYY–YYYY)"
- [x] **VIP access code CHARLIE** — added to `VALID_CODES` in DharmaPassTab

### Infrastructure
- [x] GitHub Actions CI/CD → Cloudflare Pages
- [x] Jyoti chatbot: Groq→Gemini cascade, typewriter, crisis detection
- [x] Collapsible sidebar (48px → 220px)
- [x] Theme toggle (dark/light)
- [x] Toast system (`window.showToast`)

---

## Pending / Known Issues

| Issue | Priority | Notes |
|---|---|---|
| `VITE_RAZORPAY_KEY` not set | **Pre-launch** | Add live key in Cloudflare Pages env vars |
| `GROQ_API_KEY` not set on Render | **Set first** | dashboard.render.com → vedavision-backend → Environment |
| `GEMINI_API_KEY` not set on Render | Set after Groq | aistudio.google.com |
| `/api/waitlist` endpoint missing | Post-launch | Backend route doesn't exist yet; localStorage fallback works |
| GA4 Measurement ID | Post-launch | Replace `G-XXXXXXXXXX` in `src/App.jsx` (Vite app, not index.html) |
| swisseph-wasm (local) | Roadmap | Render cold-start ~15s; wasm eliminates server dependency |
| D9/D10 sublords (Shodashvarga) | Roadmap | Only D1/D9/D10 rendered; full 16-varga not implemented |
| Ayanamsa browser-side fallback | Roadmap | 100% server-dependent; wasm needed for offline calc |
| `Message.rendered` dead field | Cleanup | Defined in JyotiChat `Message` interface, never populated or read |

---

## Known Workarounds

| Problem | Fix |
|---|---|
| Agents with `isolation:worktree` write to separate branch | Run agents WITHOUT isolation param; use absolute paths |
| Cloudflare CDN serving stale bundle | Verify via preview URL `https://[hash].vedavision-app.pages.dev` |
| GitHub Actions OAuth token expired | Use `CLOUDFLARE_API_TOKEN` secret in repo Settings → Secrets |
| Razorpay checkout won't open | Ensure `checkout.js` script loaded AND `VITE_RAZORPAY_KEY` is set |

---

## Chatbot Architecture

```
User message
    │
    ├─ SCOPE_BLOCKS check (prediction/medical/financial/legal) → canned response (no API) + useTypewriter
    ├─ CRISIS_PATTERNS check → crisis response (no API) + useTypewriter
    │
    ▼  POST /api/jyoti/stream  (SSE streaming — tokens appear in real-time)
Gemini 2.5 Flash    (primary; better persona fidelity)
    │ fails / key missing
    ▼
Groq llama-3.3-70b  (fallback; faster but weaker persona)
    │ fails
    ▼
ASK_RESPONSES       (pattern-matched, instant)     ← last resort

Frontend: ReadableStream reader → empty bot message filled chunk by chunk
Opener message: still uses useTypewriter (no API call)
```

Backend: `_build_jyoti_context()` shared helper; `/api/jyoti` (non-streaming) still available.
System prompt includes full chart: 12 houses, active dasha/AD, yogas, nakshatra, all 7 karakas.
Stream URL: `https://vedavision-backend.onrender.com/api/jyoti/stream` (hardcoded in JyotiChat.tsx).

---

## How to Resume Next Session

Open Claude Code and say:
> **"Read HANDOFF.md and continue from where we left off."**

_To update this file: say "update handoff" before closing any session._

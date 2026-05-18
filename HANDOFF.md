# HANDOFF.md — VedaVision / Celestial Noir
_Last updated: 2026-05-18 IST_

---

## Goal We're Working Toward

Ship VedaVision as a production-ready Vedic astrology reflection web app:
- Real ephemeris (Swiss Ephemeris backend on Render.com)
- AI-powered Jyoti chatbot (Groq primary + Gemini Flash fallback — both free)
- Premium dark-academia UI (Midnight Indigo + Vedic Gold design system)
- Monetisation via Razorpay (₹99 PDF export, Dharma Pass plans)
- PWA installable, mobile-first, WCAG AA compliant

---

## Current State of the Code

### Phase 1 — UI Makeover ✅ Complete
- [x] Midnight Indigo color system (`--bg-deep:#0D0A1E`)
- [x] Glassmorphism cards (`rgba(255,255,255,0.05)` + blur 14px saturate 110%)
- [x] Atmospheric gradients (violet 20%, gold 14%, centre glow 10%)
- [x] Film-grain noise texture (2.8% opacity)
- [x] Logo entrance only — no spin
- [x] Submit button shimmer animation
- [x] 8pt spacing tokens (`--sp-1` through `--sp-16`)
- [x] Gold focus ring (WCAG AA)
- [x] Mobile tab gold pip indicator
- [x] Hero centered layout (full-width, 520px max, single column)
- [x] Fallback banner redesign (semantic `.fallback-banner` component)
- [x] Editorial footer with wordmark + tagline + gold rule
- [x] Sign glyphs in summary bar (♏ ♉ ♌)
- [x] 3-step calculation ceremony panel
- [x] Cinematic chart reveal (hero-exit fade → results fade-in)
- [x] Dark theme makeover: richer card contrast, sidebar depth, section glows
- [x] **1.5 Collapsible icon sidebar** — 48px icon rail → 220px on hover, pure CSS

### Phase 2 — Features ✅ Complete
- [x] Nakshatra identity card (Overview tab, deity/theme/symbol, share button)
- [x] Planet coins grid (replaces flat planet table in Chart tab)
- [x] Daśā horizontal timeline rail (proportional widths, color-coded, gold active pip)
- [x] Progressive house disclosure (12 collapsible details/summary panels, key houses gold)
- [x] Instagram story card 1080×1920 PNG generator

### Phase 3 — Jyoti AI Chatbot ✅ Complete
- [x] `/api/jyoti` endpoint with **Groq primary + Gemini 2.0 Flash fallback** (both free)
- [x] Full `chatbot_skill.md` system prompt — §11.1 structure: hard limits first, 8 canonical FAQ few-shot examples, reflection prompt library, crisis protocol, anti-patterns
- [x] Rich chart context injected per request: all 12 houses, full planet table with dignities, AK/AmK karakas, nakshatra classical theme, yoga effects, wealth score, leadership archetype, D9/D10 houses
- [x] Multi-turn conversation history (last 10 turns, shared across providers)
- [x] 25s total timeout (10s Groq → 8s Gemini → pattern-matched fallback)
- [x] Status badge: `⟳ thinking…` / `Groq` / `Gemini` / `local`
- [x] Crisis detection: 14+ keyword patterns, always client-side
- [x] Canonical fallback `ASK_RESPONSES` matching `chatbot_skill.md` §4 FAQ responses
- [x] `badchart` + `timing` fallback handlers added
- [x] Typewriter effect (word-by-word, adaptive speed)
- [x] ↺ Clear conversation button
- [ ] **`GROQ_API_KEY` not yet set on Render** — set this first
- [ ] **`GEMINI_API_KEY` not yet set on Render** — set after Groq

### Standards ✅ Added
- [x] `.standards/` folder with CLAUDE.md, WORKFLOW.md, EVALUATION.md, ARCHITECTURE-PRINCIPLES.md, SKILLS.md
- [x] SKILLS.md has 5 patterns including Groq/Gemini API patterns and chatbot system prompt architecture

---

## Files Actively Being Edited

| File | Last change | Notes |
|---|---|---|
| `index.html` | Phase 3 | submitAsk, typewriter, crisis detection, richer context payload, model status |
| `vedavision.css` | Phase 2+3 | Dasha rail, house disclosure, planet coins, nakshatra card, jdot animation |
| `backend/main.py` | Phase 3 | `/api/jyoti` Groq→Gemini cascade, full chatbot_skill.md system prompt |
| `backend/requirements.txt` | Phase 3 | `groq>=0.9.0` + `google-generativeai>=0.7.0` |
| `backend/render.yaml` | Phase 3 | `GROQ_API_KEY` + `GEMINI_API_KEY` env var stubs (sync: false) |
| `.standards/SKILLS.md` | Phase 3 | 5 reusable patterns documented |
| `HANDOFF.md` | This session | This file |

---

## Everything Tried That Failed / Known Issues

| Issue | Status | Notes |
|---|---|---|
| `backend/` is embedded git repo | Known | Has own remote (vedavision-backend). Always commit/push separately |
| CI/CD auto-deploy rewrites history | Known | "Auto-deploy" commits overwrite manual ones — content lands correctly |
| `node --check index.html` fails | Known | Use `node -e "new Function(...)"` pattern for syntax checking |
| Template literals in static HTML | Fixed | Was causing `${n}` to render literally in compatibility dropdowns |
| `applyLanguage()` missing `}` | Fixed | Was trapping all chatbot/auth functions inside it |
| SAMPLE_CHART shown as user chart | Fixed | `_isRealChart` flag + amber `.fallback-banner` component |
| Anthropic API — paid, not free | Removed | Replaced with Groq (primary) + Gemini Flash (fallback), both free |
| Scheduled routine for HANDOFF | Cancelled | User prefers manual updates — say "update handoff" before closing |

---

## Pending User Actions (Required)

1. **Set `GROQ_API_KEY` on Render** → dashboard.render.com → vedavision-backend → Environment → value from console.groq.com (free)
2. **Set `GEMINI_API_KEY` on Render** → same page → value from aistudio.google.com → Get API Key (free, 1500 req/day)
3. **Razorpay live key** → replace `rzp_test_YOUR_KEY_HERE` at line ~3963 in `index.html`
4. **GA4 Measurement ID** → replace `G-XXXXXXXXXX` at lines 21+26 in `index.html`

---

## Next Steps (Priority Order)

### Start Here Next Session
1. Verify Jyoti live — confirm `Groq` status badge appears after setting env vars
2. Test Gemini fallback — temporarily remove GROQ_API_KEY on Render, confirm `Gemini` badge appears

### Phase 4 — This Week
3. **Hindi i18n** — `LANG_STRINGS.hi` wired in index.html, needs translation content for Overview tab + KPI labels + chatbot opener
4. **Tutorial timing fix** — fire on first DOMContentLoaded, not post-chart
5. **Offline state indicator** — detect network loss, show banner
6. **Compatibility birth time caveat** — note when birth time unknown

### Phase 5 — Month 2
7. **swisseph-wasm** — replace Render backend with local wasm (eliminates cold start)
8. **Vite migration** — split index.html into ES modules
9. **Referral mechanism** — `?ref=USER_ID` tracking
10. **Account deletion / data export** — GDPR hygiene
11. **Email digest** — weekly astrological weather (endpoint already built in backend)

---

## Chatbot Architecture (current)

```
User message
    │
    ▼
Groq llama-3.3-70b  (free, ~0.5s, 10s timeout)   ← primary
    │ fails / rate limited / key missing
    ▼
Gemini 2.0 Flash    (free, 1500/day, ~1-2s)       ← fallback
    │ fails
    ▼
ASK_RESPONSES       (pattern-matched, instant)     ← last resort
```

Response JSON: `{ "reply": "...", "model": "groq" | "gemini" }`
Frontend status badge reflects model used.

---

## Repos & Deploys

| Repo | Remote | Deploy |
|---|---|---|
| Frontend | github.com/rishav414-blip/vedavision-frontend | Auto-deploy on push to main |
| Backend | github.com/rishav414-blip/vedavision-backend | Render.com auto-deploy on push |

---

## Key Design Tokens (always use these, never guess)

```
--bg-deep:  #0D0A1E        (midnight indigo base)
--bg-navy:  #16112A        (section backgrounds)
--bg-card:  rgba(255,255,255,0.05)  (glassmorphism cards)
--gold:     #D4B870        (primary accent)
--violet:   #8B7CC8        (secondary accent / interactive)
--txt:      #F0EBF4        (primary text)
--txt2:     #B0A0C8        (secondary text)
--txt3:     #8090B5        (muted text)
--border:   rgba(192,160,96,0.22)
```

---

## How to Resume Next Session

Open a new Claude Code session in VS Code and say:
> **"Read HANDOFF.md and continue from where we left off."**

_To update this file: say "update handoff" before closing any session._

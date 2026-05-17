# HANDOFF.md — VedaVision / Celestial Noir
_Last updated: 2026-05-16 ~14:30 IST_

---

## Goal We're Working Toward

Ship VedaVision as a production-ready Vedic astrology reflection web app:
- Real ephemeris (Swiss Ephemeris backend on Render.com)
- AI-powered Jyoti chatbot (Groq / Llama 3.1 70B — free tier)
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
- [x] Groq `/api/jyoti` endpoint (Llama 3.1 70B, free 14,400 req/day)
- [x] Full `chatbot_skill.md` persona as system prompt
- [x] Chart context injected per request (lagna, nakshatra, dasha, yogas, houses)
- [x] Multi-turn conversation history (last 10 turns)
- [x] 15s timeout + graceful fallback to `ASK_RESPONSES`
- [x] Upgraded system prompt: 7 human-chat techniques (emotional mirroring, opener variety, short-first, follow-up questions, memory callbacks, self-disclosure, natural flow)
- [x] Typewriter effect (word-by-word, adaptive speed ~35ms/word)
- [x] Status badge: AI / ⟳ thinking… / offline
- [x] ↺ Clear conversation button (resets `_jyotiHistory`)
- [x] Crisis keywords always handled client-side (never API-dependent)
- [ ] **GROQ_API_KEY not set on Render yet** — Jyoti falls back to pattern-matched until done

---

## Files Actively Being Edited

| File | Last change | Notes |
|---|---|---|
| `index.html` | Phase 3 | async submitAsk, typewriter, _jyotiHistory, status badge, clear btn |
| `vedavision.css` | Phase 2+3 | Dasha rail, house disclosure, planet coins, nakshatra card, jdot animation |
| `backend/main.py` | Phase 3 | /api/jyoti Groq endpoint + upgraded 7-technique system prompt |
| `backend/requirements.txt` | Phase 3 | `groq>=0.9.0` added, `anthropic` removed |
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
| Anthropic API — too costly | Replaced | Switched to Groq (free tier, llama-3.1-70b-versatile) |
| Scheduled routine for HANDOFF | Cancelled | User prefers manual updates — say "update handoff" before closing |

---

## Pending User Actions (Required)

1. **Set `GROQ_API_KEY` on Render** → dashboard.render.com → vedavision-backend → Environment → `GROQ_API_KEY` = `gsk_...` from console.groq.com
2. **Connect GitHub App** → [claude.ai/code/onboarding?magic=github-app-setup](https://claude.ai/code/onboarding?magic=github-app-setup) for `rishav414-blip/vedavision-frontend`
3. **Razorpay live key** → replace `rzp_test_YOUR_KEY_HERE` at line ~3963 in `index.html`
4. **GA4 Measurement ID** → replace `G-XXXXXXXXXX` at lines 21+26 in `index.html`

---

## Next Steps (Priority Order)

### Start Here Next Session
1. Verify Jyoti live on Groq after GROQ_API_KEY is set

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
11. **D9 Navamsa chart** — second divisional chart
12. **Email digest** — weekly astrological weather

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
